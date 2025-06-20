"""
Error handling middleware and exception handlers.
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from ..exceptions.api_exceptions import TKAAPIException
from ..exceptions.handlers import tka_api_exception_handler

logger = logging.getLogger(__name__)


def setup_error_handlers(app: FastAPI):
    """Setup global error handlers for the FastAPI application."""

    # Custom TKA API exception handler
    app.add_exception_handler(TKAAPIException, tka_api_exception_handler)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request, exc):
        """Handle HTTP exceptions with proper logging."""
        logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail, "status_code": exc.status_code},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request, exc):
        """Handle general exceptions with proper logging."""
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "status_code": 500},
        )
