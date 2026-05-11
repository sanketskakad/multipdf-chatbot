"""FastAPI REST endpoint for the Advanced Multi-PDF RAG Chatbot."""

import logging
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from utils import (
    ask_question_advanced,
    extract_documents_from_pdf,
    get_db,
    get_embeddings,
    get_llm,
    store_documents,
)

from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Advanced Multi-PDF Chatbot API",
    description=(
        "SOTA RAG-based Q&A API for querying uploaded PDF documents with Hybrid Search, "
        "Re-ranking, and Page-Aware Source Citations."
    ),
    version="0.2.0",
)

# Enable CORS for React Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ───────────────────────────────────────

class CitationItem(BaseModel):
    """Citation metadata item for retrieved passages."""

    citation_id: int
    source: str
    page: int
    content_snippet: str
    rerank_score: Optional[float] = None


class QuestionRequest(BaseModel):
    """Request body for the /ask endpoint."""

    question: str = Field(..., min_length=1, description="The question to ask.")
    top_k: Optional[int] = Field(5, ge=1, le=10, description="Top context passages to retrieve.")
    use_rerank: Optional[bool] = Field(True, description="Whether to apply cross-encoder re-ranking.")
    api_key: Optional[str] = Field(
        None,
        description="Your own OpenAI-compatible API key. If omitted, server environment default is used.",
    )
    base_url: Optional[str] = Field(
        None,
        description="Custom API endpoint URL. If omitted, server environment default is used.",
    )


class AnswerResponse(BaseModel):
    """Response body for the /ask endpoint."""

    answer: str
    citations: list[CitationItem] = []


class UploadResponse(BaseModel):
    """Response body for the /upload endpoint."""

    message: str
    files_processed: list[str]
    total_chunks: int


# ─── Endpoints ───────────────────────────────────────────────────────

@app.get("/")
def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "service": "multipdf-chatbot-advanced-rag"}


@app.post("/upload", response_model=UploadResponse)
async def upload_documents(
    files: list[UploadFile] = File(..., description="One or more PDF files to upload."),
    api_key: Optional[str] = Form(None, description="Your own OpenAI-compatible API key."),
    base_url: Optional[str] = Form(None, description="Custom API endpoint URL."),
) -> UploadResponse:
    """Upload one or more PDF documents for RAG retrieval."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    # Use custom or default embeddings
    custom_embeddings = None
    if api_key:
        try:
            custom_embeddings = get_embeddings(api_key=api_key, base_url=base_url)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to initialize embeddings with the provided API key: {e}",
            )

    db = get_db(custom_embeddings=custom_embeddings)

    processed: list[str] = []
    total_chunks = 0

    for uploaded_file in files:
        filename = uploaded_file.filename or "unknown.pdf"
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail=f"'{filename}' is not a PDF file.",
            )

        try:
            documents = extract_documents_from_pdf(uploaded_file.file, filename=filename)
            store_documents(db, documents)
            processed.append(filename)
            total_chunks += len(documents)
            logger.info("Processed '%s': %d page-aware chunks stored.", filename, len(documents))
        except Exception as e:
            raise HTTPException(
                status_code=422,
                detail=f"Failed to process '{filename}': {e}",
            )

    return UploadResponse(
        message=f"Successfully processed {len(processed)} PDF(s) into {total_chunks} page-aware chunks.",
        files_processed=processed,
        total_chunks=total_chunks,
    )


import json
import time
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Cookie, Response

@app.post("/ask", response_model=AnswerResponse)
def ask_question_endpoint(
    request: QuestionRequest,
    response: Response,
    rag_quota_v1: Optional[str] = Cookie(None),
) -> AnswerResponse:
    """Answer a question using Hybrid RAG with HTTP Cookie Rate Limiting (Max 3 queries / 24 hrs)."""
    now_ms = int(time.time() * 1000)
    current_count = 0
    reset_ts = now_ms + (24 * 60 * 60 * 1000)

    if rag_quota_v1:
        try:
            parsed = json.loads(rag_quota_v1)
            saved_count = parsed.get("count", 0)
            saved_reset = parsed.get("resetTimestamp", now_ms)

            if now_ms < saved_reset:
                current_count = saved_count
                reset_ts = saved_reset
            else:
                # Quota window expired, reset
                current_count = 0
                reset_ts = now_ms + (24 * 60 * 60 * 1000)
        except Exception:
            pass

    if current_count >= 3:
        diff_ms = max(0, reset_ts - now_ms)
        hours = diff_ms // (1000 * 60 * 60)
        mins = (diff_ms % (1000 * 60 * 60)) // (1000 * 60)
        raise HTTPException(
            status_code=429,
            detail=f"Daily quota limit reached (3/3 queries used). Resets in {hours}h {mins}m.",
        )

    # Process query
    custom_llm = None
    custom_embeddings = None

    if request.api_key:
        try:
            custom_llm = get_llm(
                api_key=request.api_key,
                base_url=request.base_url,
            )
            custom_embeddings = get_embeddings(
                api_key=request.api_key,
                base_url=request.base_url,
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to initialize with the provided API key: {e}",
            )

    db = get_db(custom_embeddings=custom_embeddings)

    try:
        result = ask_question_advanced(
            db,
            request.question,
            k=request.top_k or 5,
            use_rerank=request.use_rerank if request.use_rerank is not None else True,
            llm_override=custom_llm,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process question: {e}")

    # Increment count and update cookie
    new_count = current_count + 1
    new_quota = {"count": new_count, "resetTimestamp": reset_ts}
    max_age_sec = max(1, int((reset_ts - now_ms) / 1000))
    response.set_cookie(
        key="rag_quota_v1",
        value=json.dumps(new_quota),
        max_age=max_age_sec,
        httponly=False,
        samesite="lax",
    )

    citations_list = [
        CitationItem(
            citation_id=c["citation_id"],
            source=c["source"],
            page=c["page"],
            content_snippet=c["content_snippet"],
            rerank_score=c.get("rerank_score"),
        )
        for c in result.get("citations", [])
    ]

    return AnswerResponse(
        answer=result["answer"],
        citations=citations_list,
    )
