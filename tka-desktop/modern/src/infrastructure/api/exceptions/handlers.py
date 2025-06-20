"""
Exception handlers for the TKA Desktop API.
"""

import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from .api_exceptions import TKAAPIException

logger = logging.getLogger(__name__)


async def tka_api_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle custom TKA API exceptions."""
    if isinstance(exc, TKAAPIException):
        logger.warning(f"TKA API Exception: {exc.detail} (Status: {exc.status_code})")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.detail,
                "status_code": exc.status_code,
                "type": exc.__class__.__name__,
            },
        )
    else:
        # Fallback for other exceptions
        logger.error(f"Unexpected exception in TKA handler: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error", "status_code": 500},
        )
