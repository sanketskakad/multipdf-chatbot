"""Advanced RAG Utility Engine: Page-Aware Extraction, Hybrid Retrieval, Re-ranking & Citations."""

import logging
import os
from typing import Any, Optional

from dotenv import load_dotenv
import fitz
from flashrank import Ranker, RerankRequest
from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

# Ensure writable cache directories for serverless read-only filesystems (Vercel)
os.environ.setdefault("FASTEMBED_CACHE_DIR", "/tmp/fastembed_cache")
os.environ.setdefault("HF_HOME", "/tmp/hf_home")
os.environ.setdefault("TORCH_HOME", "/tmp/torch_home")

logger = logging.getLogger(__name__)

# ----------------------------
# Configuration
# ----------------------------
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "/tmp/chroma_db" if os.getenv("VERCEL") else "./chroma_db")
CHROMA_COLLECTION = "pdf_store"
DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"
DEFAULT_LLM_MODEL = "llama-3.1-8b-instant"

# Initialize global FlashRank Ranker lazily
_ranker_instance: Optional[Ranker] = None


def get_ranker() -> Optional[Ranker]:
    """Lazy initializer for FlashRank Ranker."""
    global _ranker_instance
    if _ranker_instance is None:
        try:
            _ranker_instance = Ranker()
        except Exception as e:
            logger.warning("FlashRank Ranker failed to initialize: %s. Falling back to score ranking.", e)
            _ranker_instance = None
    return _ranker_instance


# ----------------------------
# LLM & Embeddings Initialization
# ----------------------------
def get_llm(
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    model_name: Optional[str] = None,
) -> Any:
    """Create a Groq or OpenAI-compatible LLM instance."""
    active_model = model_name or os.getenv("LLM_MODEL", DEFAULT_LLM_MODEL)
    groq_key = api_key if (api_key and api_key.startswith("gsk_")) else os.getenv("GROQ_API_KEY")

    if groq_key or "llama" in active_model.lower() or "mixtral" in active_model.lower() or "gemma" in active_model.lower():
        try:
            return ChatGroq(
                model_name=active_model,
                groq_api_key=groq_key or api_key or os.getenv("GROQ_API_KEY"),
                temperature=0.3,
            )
        except Exception as e:
            logger.warning("Failed to initialize ChatGroq: %s. Falling back to ChatOpenAI.", e)

    openai_key = api_key or os.getenv("OPENAI_API_KEY")
    return ChatOpenAI(
        model=active_model,
        base_url=base_url or os.getenv("BASE_URL"),
        api_key=openai_key,
        temperature=0.3,
    )


def get_embeddings(
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
) -> Any:
    """Create embeddings instance (OpenAIEmbeddings if key present, else ONNX FastEmbed)."""
    openai_key = api_key if (api_key and not api_key.startswith("gsk_")) else os.getenv("OPENAI_API_KEY")
    if openai_key and not openai_key.startswith("sk-dummy"):
        try:
            return OpenAIEmbeddings(
                model=DEFAULT_EMBEDDING_MODEL,
                openai_api_base=base_url or os.getenv("BASE_URL"),
                openai_api_key=openai_key,
            )
        except Exception:
            pass

    # Use ONNX FastEmbed lightweight embeddings when no OpenAI key is set
    try:
        from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
        fastembed_cache = os.getenv("FASTEMBED_CACHE_DIR", "/tmp/fastembed_cache")
        return FastEmbedEmbeddings(
            model_name="BAAI/bge-small-en-v1.5",
            cache_dir=fastembed_cache,
        )
    except Exception as e:
        logger.warning("FastEmbedEmbeddings fallback failed: %s. Falling back to FakeEmbeddings.", e)
        from langchain_community.embeddings import FakeEmbeddings
        return FakeEmbeddings(size=384)


# Safe module-level lazy defaults
def get_default_llm() -> Optional[Any]:
    """Safe getter for default LLM instance."""
    try:
        return get_llm()
    except Exception:
        return None


def get_default_embeddings() -> Optional[Any]:
    """Safe getter for default embeddings instance."""
    try:
        return get_embeddings()
    except Exception:
        return None


# ----------------------------
# Page-Aware PDF Extraction & Chunking
# ----------------------------
def extract_documents_from_pdf(
    file_obj,
    filename: str = "uploaded_pdf",
    chunk_size: int = 800,
    chunk_overlap: int = 150,
) -> list[Document]:
    """Extract text from a PDF page-by-page and chunk into Document objects with page metadata.

    Args:
        file_obj: File-like object (e.g. Streamlit UploadedFile or FastAPI file stream).
        filename: Name of the PDF source document.
        chunk_size: Maximum characters per chunk.
        chunk_overlap: Overlapping character count.

    Returns:
        List of LangChain Document objects with source and page_number metadata.
    """
    try:
        content_bytes = file_obj.read()
        doc = fitz.open(stream=content_bytes, filetype="pdf")
    except Exception as e:
        raise RuntimeError(f"Failed to open PDF '{filename}': {e}") from e

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    documents: list[Document] = []
    chunk_counter = 0

    for page_num, page in enumerate(doc, start=1):
        page_text = page.get_text("text")
        if not page_text.strip():
            continue

        page_chunks = splitter.split_text(page_text)
        for chunk in page_chunks:
            chunk_counter += 1
            doc_obj = Document(
                page_content=chunk,
                metadata={
                    "source": filename,
                    "page": page_num,
                    "chunk_id": f"{filename}_p{page_num}_c{chunk_counter}",
                },
            )
            documents.append(doc_obj)

    if not documents:
        raise ValueError(f"PDF '{filename}' contains no extractable text.")

    return documents



def auto_seed_vector_db(db: Chroma, docs_dir: str = "documents") -> None:
    """Auto-seed ChromaDB vector store if empty by scanning documents/ directory."""
    try:
        if db._collection.count() > 0:
            return
        
        from pathlib import Path
        docs_path = Path(docs_dir)
        if not docs_path.exists():
            return
        
        pdf_files = list(docs_path.glob("*.pdf"))
        if not pdf_files:
            return
            
        logger.info("Vector DB is empty. Auto-seeding pre-cached vector embeddings from %d PDF(s)...", len(pdf_files))
        for pdf_file in pdf_files:
            try:
                with open(pdf_file, "rb") as f:
                    documents = extract_documents_from_pdf(f, filename=pdf_file.name)
                db.add_documents(documents)
                logger.info("Auto-seeded '%s': %d page-aware chunks.", pdf_file.name, len(documents))
            except Exception as e:
                logger.warning("Auto-seed failed for '%s': %s", pdf_file.name, e)
    except Exception as e:
        logger.warning("Auto-seed check failed: %s", e)


def get_db(
    custom_embeddings: Optional[OpenAIEmbeddings] = None,
    auto_seed: bool = True,
) -> Chroma:
    """Initialize or load the ChromaDB vector store with optional auto-seeding."""
    # On Vercel / serverless, copy pre-built ./chroma_db to /tmp/chroma_db if /tmp/chroma_db is empty
    if CHROMA_PERSIST_DIR.startswith("/tmp") and os.path.exists("./chroma_db") and not os.path.exists(CHROMA_PERSIST_DIR):
        import shutil
        try:
            shutil.copytree("./chroma_db", CHROMA_PERSIST_DIR)
            logger.info("Copied pre-cached ChromaDB from ./chroma_db to %s", CHROMA_PERSIST_DIR)
        except Exception as e:
            logger.warning("Failed to copy pre-cached ChromaDB: %s", e)

    emb = custom_embeddings or get_default_embeddings()
    db = Chroma(
        collection_name=CHROMA_COLLECTION,
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=emb,
    )
    if auto_seed:
        auto_seed_vector_db(db)
    return db


def store_documents(db: Chroma, documents: list[Document]) -> Chroma:
    """Add LangChain Document objects with rich page metadata to the vector store."""
    db.add_documents(documents)
    return db



# ----------------------------
# Advanced Hybrid Retrieval & Re-ranking Engine
# ----------------------------
def reciprocal_rank_fusion(
    results_lists: list[list[Document]], k: int = 60
) -> list[Document]:
    """Combine multiple ranked lists using Reciprocal Rank Fusion (RRF)."""
    doc_scores: dict[str, float] = {}
    doc_map: dict[str, Document] = {}

    for doc_list in results_lists:
        for rank, doc in enumerate(doc_list):
            doc_key = f"{doc.metadata.get('source', '')}_{doc.metadata.get('page', 0)}_{hash(doc.page_content)}"
            doc_map[doc_key] = doc
            if doc_key not in doc_scores:
                doc_scores[doc_key] = 0.0
            doc_scores[doc_key] += 1.0 / (k + rank + 1)

    sorted_keys = sorted(doc_scores.keys(), key=lambda x: doc_scores[x], reverse=True)
    return [doc_map[key] for key in sorted_keys]


def hybrid_retrieve(
    db: Chroma,
    query: str,
    dense_k: int = 15,
    sparse_k: int = 15,
) -> list[Document]:
    """Perform hybrid dense vector search + sparse BM25 search."""
    # 1. Dense Vector Search
    dense_docs = db.similarity_search(query, k=dense_k)

    # 2. Sparse BM25 Keyword Search
    try:
        all_vector_docs = db.get()
        if all_vector_docs and "documents" in all_vector_docs and all_vector_docs["documents"]:
            bm25_documents = [
                Document(
                    page_content=txt,
                    metadata=all_vector_docs["metadatas"][i] if all_vector_docs.get("metadatas") else {},
                )
                for i, txt in enumerate(all_vector_docs["documents"])
            ]
            bm25_retriever = BM25Retriever.from_documents(bm25_documents)
            bm25_retriever.k = min(sparse_k, len(bm25_documents))
            sparse_docs = bm25_retriever.invoke(query)
        else:
            sparse_docs = []
    except Exception as e:
        logger.warning("BM25 sparse retrieval fallback: %s", e)
        sparse_docs = []

    # 3. Fuse via RRF
    if sparse_docs:
        fused_docs = reciprocal_rank_fusion([dense_docs, sparse_docs])
    else:
        fused_docs = dense_docs

    return fused_docs


def rerank_documents(
    query: str,
    documents: list[Document],
    top_n: int = 5,
) -> list[Document]:
    """Rerank candidate documents using FlashRank cross-encoder model."""
    if not documents:
        return []

    ranker = get_ranker()
    if ranker is None:
        return documents[:top_n]

    try:
        passages = [
            {"id": idx, "text": doc.page_content, "meta": doc.metadata}
            for idx, doc in enumerate(documents)
        ]
        rerank_req = RerankRequest(query=query, passages=passages)
        results = ranker.rerank(rerank_req)

        reranked_docs = []
        for item in results[:top_n]:
            idx = item["id"]
            orig_doc = documents[idx]
            # Attach rerank score to metadata
            orig_doc.metadata["rerank_score"] = round(float(item.get("score", 0.0)), 4)
            reranked_docs.append(orig_doc)
        return reranked_docs
    except Exception as e:
        logger.warning("Reranking failed: %s. Returning top documents.", e)
        return documents[:top_n]


def get_advanced_context(
    db: Chroma,
    query: str,
    top_k: int = 5,
    use_rerank: bool = True,
) -> list[Document]:
    """Full Advanced Retrieval Pipeline: Hybrid Search + Re-ranking."""
    candidates = hybrid_retrieve(db, query, dense_k=15, sparse_k=15)
    if use_rerank:
        return rerank_documents(query, candidates, top_n=top_k)
    return candidates[:top_k]


# ----------------------------
# Question Answering & Citation Generation
# ----------------------------
def ask_question_advanced(
    db: Chroma,
    question: str,
    k: int = 5,
    use_rerank: bool = True,
    llm_override: Optional[ChatOpenAI] = None,
    history: Optional[list[dict[str, str]]] = None,
) -> dict[str, Any]:
    """Retrieve relevant context via Hybrid RAG, generate answer with page citations.

    Returns:
        dict containing:
            - 'answer': Generated answer text
            - 'citations': List of source citation dicts
            - 'retrieved_docs': List of Document objects used for generation
    """
    active_llm = llm_override or get_default_llm()
    if active_llm is None:
        return {
            "answer": "⚠️ API Key is missing. Please enter your GROQ_API_KEY or OPENAI_API_KEY in the sidebar or set environment variables.",
            "citations": [],
            "retrieved_docs": [],
        }

    docs = get_advanced_context(db, question, top_k=k, use_rerank=use_rerank)

    if not docs:
        return {
            "answer": "No relevant context found. Please upload PDF documents first.",
            "citations": [],
            "retrieved_docs": [],
        }

    # Format context with explicit citation tags
    formatted_context_blocks = []
    citations = []

    for idx, d in enumerate(docs, start=1):
        source = d.metadata.get("source", "unknown_doc.pdf")
        page = d.metadata.get("page", 1)
        score = d.metadata.get("rerank_score")

        block = f"[Context Block {idx}] (Document: {source}, Page: {page})\n{d.page_content}"
        formatted_context_blocks.append(block)

        citations.append({
            "citation_id": idx,
            "source": source,
            "page": page,
            "content_snippet": d.page_content[:200] + ("..." if len(d.page_content) > 200 else ""),
            "rerank_score": score,
        })

    context_str = "\n\n".join(formatted_context_blocks)

    # Format optional conversation history
    history_str = ""
    if history:
        recent_history = history[-4:]  # Last 2 turns
        history_str = "\nConversation History:\n" + "\n".join(
            [f"{msg['role'].capitalize()}: {msg['content']}" for msg in recent_history]
        ) + "\n"

    prompt = f"""You are an expert AI document assistant specializing in accurate, cited Q&A over complex PDF documents.

RULES FOR ANSWERING:
1. Base your answer strictly on the provided Context Blocks below.
2. If the context does not contain enough information to fully answer, state what is available and clarify what is missing.
3. Cite your sources using exact inline references like [Document: <filename>, Page: <page_number>] whenever stating facts from the context.
4. Keep the answer structured, clear, and professional.
{history_str}
Context Blocks:
{context_str}

User Question:
{question}

Answer:"""

    logger.debug("Prompt sent to LLM: %s", prompt, history_str, context_str, question )
    response = active_llm.invoke(prompt)

    return {
        "answer": str(response.content),
        "citations": citations,
        "retrieved_docs": docs,
    }

