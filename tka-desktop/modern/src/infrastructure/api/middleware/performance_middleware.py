"""
Performance monitoring middleware for the TKA Desktop API.
"""

import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Middleware to monitor API performance."""

    async def dispatch(self, request: Request, call_next):
        """Process request and measure performance."""
        start_time = time.time()

        # Process request
        response: Response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Add performance header
        response.headers["X-Process-Time"] = str(process_time)

        # Log slow requests
        if process_time > 1.0:  # Log requests taking more than 1 second
            logger.warning(
                f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s"
            )

        return response


def setup_performance_middleware(app):
    """Setup performance monitoring middleware."""
    app.add_middleware(PerformanceMiddleware)
