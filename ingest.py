"""Pre-build and pre-cache vector embeddings for all benchmark PDFs in documents/ directory."""

import logging
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from langchain_chroma import Chroma

from utils import (
    CHROMA_COLLECTION,
    CHROMA_PERSIST_DIR,
    extract_documents_from_pdf,
    get_default_embeddings,
    store_documents,
)

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def ingest_documents(docs_dir: str = "documents", target_db_dir: str = CHROMA_PERSIST_DIR) -> int:
    """Pre-build vector DB by processing all PDF files in docs_dir."""
    docs_path = Path(docs_dir)
    if not docs_path.exists():
        logger.error("Documents directory '%s' does not exist.", docs_dir)
        return 0

    pdf_files = list(docs_path.glob("*.pdf"))
    if not pdf_files:
        logger.warning("No PDF files found in '%s'.", docs_dir)
        return 0

    logger.info("Starting pre-building vector store from %d PDF document(s)...", len(pdf_files))
    
    embeddings = get_default_embeddings()
    db = Chroma(
        collection_name=CHROMA_COLLECTION,
        persist_directory=target_db_dir,
        embedding_function=embeddings,
    )

    total_chunks = 0
    processed_count = 0

    for pdf_file in pdf_files:
        try:
            logger.info("Processing '%s'...", pdf_file.name)
            with open(pdf_file, "rb") as f:
                documents = extract_documents_from_pdf(f, filename=pdf_file.name)
            
            store_documents(db, documents)
            processed_count += 1
            total_chunks += len(documents)
            logger.info("Successfully indexed '%s': %d page-aware chunks.", pdf_file.name, len(documents))
        except Exception as e:
            logger.error("Failed to process '%s': %s", pdf_file.name, e)

    logger.info(
        "✅ Pre-caching Complete! Processed %d PDF(s) into %d vector chunks in '%s'.",
        processed_count,
        total_chunks,
        target_db_dir,
    )
    return total_chunks


if __name__ == "__main__":
    count = ingest_documents()
    if count > 0:
        sys.exit(0)
    else:
        sys.exit(1)
