"""Integration unit test for Advanced RAG pipeline."""

import os
import shutil
import fitz
from langchain_chroma import Chroma
from langchain_core.documents import Document

from utils import (
    extract_documents_from_pdf,
    get_advanced_context,
    get_embeddings,
    store_documents,
)


def create_sample_pdf(filepath: str) -> None:
    """Create a sample 2-page PDF file for testing."""
    doc = fitz.open()
    
    # Page 1: General Company Overview
    page1 = doc.new_page()
    page1.insert_text(
        (50, 50),
        "Acme Corp Annual Report 2025.\n"
        "Executive Summary: Acme Corp achieved record revenue of $450 Million in Q4 2025.\n"
        "The primary growth drivers were Cloud AI services and enterprise agentic software solutions."
    )

    # Page 2: Financial Metrics & Technical Stack
    page2 = doc.new_page()
    page2.insert_text(
        (50, 50),
        "Technical & Financial Operations:\n"
        "Operating Expenses: $120 Million.\n"
        "Infrastructure Stack: Deployed on AWS and GCP using FastAPI microservices and ChromaDB vector stores.\n"
        "Employee Headcount: 1,200 full-time engineers across Singapore and Sydney."
    )

    doc.save(filepath)
    doc.close()


def test_advanced_rag() -> None:
    test_pdf_path = "sample_test_doc.pdf"
    test_db_dir = "./test_chroma_db"

    # Clean up old test data if present
    if os.path.exists(test_db_dir):
        shutil.rmtree(test_db_dir)
    if os.path.exists(test_pdf_path):
        os.remove(test_pdf_path)

    try:
        print("1. Generating test sample PDF...")
        create_sample_pdf(test_pdf_path)

        print("2. Extracting page-aware documents...")
        with open(test_pdf_path, "rb") as f:
            docs = extract_documents_from_pdf(f, filename="sample_test_doc.pdf")

        assert len(docs) > 0, "No documents extracted"
        print(f"   Extracted {len(docs)} page-indexed chunks.")
        
        # Verify page numbers
        pages_found = {d.metadata.get("page") for d in docs}
        assert 1 in pages_found and 2 in pages_found, f"Expected pages 1 and 2, got {pages_found}"
        print("   Page-aware metadata verified (Pages 1 & 2 found).")

        print("3. Storing chunks in test ChromaDB vector store...")
        from langchain_community.embeddings import FakeEmbeddings
        fake_emb = FakeEmbeddings(size=1536)
        db = Chroma(
            collection_name="test_collection",
            persist_directory=test_db_dir,
            embedding_function=fake_emb,
        )
        store_documents(db, docs)
        print("   Chunks stored successfully.")

        print("4. Executing Hybrid Retrieval + FlashRank Reranking...")
        retrieved = get_advanced_context(db, "What was Acme Corp's revenue in Q4 2025?", top_k=2, use_rerank=True)
        
        assert len(retrieved) > 0, "No context retrieved"
        top_doc = retrieved[0]
        print(f"   Top Retrieved Passage (Page {top_doc.metadata.get('page')}):")
        print(f"   '{top_doc.page_content.strip()}'")

        assert "450 Million" in top_doc.page_content or "Revenue" in top_doc.page_content, "RAG failed to retrieve relevant passage"
        print("\n✅ Advanced RAG Pipeline Integration Test PASSED!")

    finally:
        # Cleanup test files
        if os.path.exists(test_pdf_path):
            os.remove(test_pdf_path)
        if os.path.exists(test_db_dir):
            shutil.rmtree(test_db_dir)


if __name__ == "__main__":
    test_advanced_rag()
