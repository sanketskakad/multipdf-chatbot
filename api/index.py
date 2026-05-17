"""Vercel Serverless Function entry point for FastAPI REST API."""

from api import app

# Expose app for Vercel Serverless Handler
__all__ = ["app"]
