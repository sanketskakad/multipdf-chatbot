"""Entry point for the Advanced Multi-PDF RAG FastAPI Backend Server."""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=True)
