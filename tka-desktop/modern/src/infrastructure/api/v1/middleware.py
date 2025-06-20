"""
Enhanced API middleware stack for error handling and request processing.
"""

import time
import uuid
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime
from typing import Callable

from core.logging.structured_logger import get_logger, LogContext
from core.types.result import Result
from .schemas import ErrorResponse, ValidationErrorResponse

logger = get_logger(__name__)


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for unhandled exceptions.
    
    Provides structured error responses with proper logging and context.
    """
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    logger.error(
        "Unhandled API exception",
        error=exc,
        context=LogContext(
            request_id=request_id,
            operation="api_exception_handling",
            component="api_middleware"
        ),
        path=str(request.url.path),
        method=request.method
    )
    
    if isinstance(exc, HTTPException):
        error_response = ErrorResponse(
            error_code=f"HTTP_{exc.status_code}",
            error_message=exc.detail,
            request_id=request_id,
            details={
                "status_code": exc.status_code,
                "path": str(request.url.path),
                "method": request.method
            }
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response.dict()
        )
    
    # Generic server error
    error_response = ErrorResponse(
        error_code="INTERNAL_SERVER_ERROR",
        error_message="An unexpected error occurred",
        request_id=request_id,
        details={
            "path": str(request.url.path),
            "method": request.method,
            "error_type": type(exc).__name__
        }
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.dict()
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors with detailed field information.
    """
    request_id = getattr(request.state, 'request_id', str(uuid.uuid4()))
    
    logger.warning(
        "API validation error",
        context=LogContext(
            request_id=request_id,
            operation="api_validation",
            component="api_middleware"
        ),
        path=str(request.url.path),
        method=request.method,
        validation_errors=str(exc.errors())
    )
    
    validation_response = ValidationErrorResponse(
        error_message="Request validation failed",
        request_id=request_id,
        details={
            "path": str(request.url.path),
            "method": request.method
        }
    )
    
    # Add detailed field errors
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        validation_response.add_field_error(
            field=field_path,
            message=error["msg"],
            value=error.get("input")
        )
    
    return JSONResponse(
        status_code=422,
        content=validation_response.dict()
    )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging API requests and responses with performance metrics.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> JSONResponse:
        """Process request with logging and performance tracking."""
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = time.perf_counter()
        
        # Log incoming request
        logger.info(
            "API request received",
            context=LogContext(
                request_id=request_id,
                operation="api_request",
                component="api_middleware"
            ),
            path=str(request.url.path),
            method=request.method,
            query_params=str(request.query_params),
            user_agent=request.headers.get("user-agent", "unknown")
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log response
            logger.info(
                "API request completed",
                context=LogContext(
                    request_id=request_id,
                    operation="api_response",
                    component="api_middleware",
                    duration_ms=duration_ms
                ),
                path=str(request.url.path),
                method=request.method,
                status_code=response.status_code,
                response_time_ms=round(duration_ms, 2)
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
            
        except Exception as exc:
            # Calculate duration for failed requests
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log error
            logger.error(
                "API request failed",
                error=exc,
                context=LogContext(
                    request_id=request_id,
                    operation="api_request_error",
                    component="api_middleware",
                    duration_ms=duration_ms
                ),
                path=str(request.url.path),
                method=request.method
            )
            
            # Re-raise for global exception handler
            raise


# Convenience function to add all middleware to FastAPI app
def setup_middleware(app):
    """
    Setup all enhanced middleware for the FastAPI application.
    """
    # Add request logging middleware
    app.add_middleware(RequestLoggingMiddleware)
    
    # Add exception handlers
    app.add_exception_handler(Exception, global_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    
    logger.info("Enhanced API middleware configured successfully")
