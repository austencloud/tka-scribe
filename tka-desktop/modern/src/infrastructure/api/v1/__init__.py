"""
TKA Desktop API v1 Module

A+ Enhancement: Enhanced API layer with proper versioning, request/response
validation schemas, and comprehensive error handling.

ARCHITECTURE: Provides versioned API endpoints with Pydantic validation,
structured error responses, and comprehensive middleware stack.

EXPORTS:
- Enhanced API schemas and models
- Versioned API router
- Error handling middleware
- Request/response validation
"""

# Enhanced API Components
from .schemas import (
    BaseResponse,
    ErrorResponse,
    SequenceResponse,
    HealthCheckResponse,
    ValidationErrorResponse,
)

from .middleware import (
    global_exception_handler,
    validation_exception_handler,
    request_logging_middleware,
)

from .router import api_v1_router

__all__ = [
    "BaseResponse",
    "ErrorResponse", 
    "SequenceResponse",
    "HealthCheckResponse",
    "ValidationErrorResponse",
    "global_exception_handler",
    "validation_exception_handler",
    "request_logging_middleware",
    "api_v1_router",
]
