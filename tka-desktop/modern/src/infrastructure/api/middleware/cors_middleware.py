"""
CORS middleware configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ..app.config import APIConfig


def setup_cors(app: FastAPI, config: APIConfig):
    """Setup CORS middleware for the FastAPI application."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=config.cors_credentials,
        allow_methods=config.cors_methods,
        allow_headers=config.cors_headers,
    )
