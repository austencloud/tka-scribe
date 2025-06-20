"""
Configuration settings for the TKA Desktop API.
"""

from typing import List


class APIConfig:
    """API configuration settings."""

    # Application metadata
    title: str = "TKA Desktop Production API"
    version: str = "2.0.0"
    description: str = (
        "Production-ready REST API for TKA Desktop with full service integration"
    )

    # API documentation URLs
    docs_url: str = "/api/docs"
    redoc_url: str = "/api/redoc"
    openapi_url: str = "/api/openapi.json"
    # CORS settings
    cors_origins: List[str] = ["*"]
    cors_credentials: bool = True
    cors_methods: List[str] = ["GET", "POST", "PUT", "DELETE", "PATCH"]
    cors_headers: List[str] = ["*"]
