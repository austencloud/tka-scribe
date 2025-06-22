"""
Main FastAPI application factory for TKA Desktop Production API.
Creates and configures the FastAPI application with all components.
"""

import logging
from fastapi import FastAPI

from .middleware import configure_all_middleware
from .exceptions import register_exception_handlers
from .lifecycle import lifespan
from .routers import (
    health_router,
    sequences_router,
    commands_router,
    monitoring_router,
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    This factory function creates a fully configured FastAPI application
    with all middleware, exception handlers, routers, and lifecycle events.
    
    Returns:
        FastAPI: Configured FastAPI application instance
    """
    # Create FastAPI app with comprehensive configuration
    app = FastAPI(
        title="TKA Desktop Production API",
        version="2.0.0",
        description="Production-ready REST API for TKA Desktop with full service integration",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )
    
    # Configure middleware (order matters - added in reverse execution order)
    configure_all_middleware(app)
    
    # Register exception handlers
    register_exception_handlers(app)
    
    # Register routers with appropriate prefixes
    app.include_router(health_router)
    app.include_router(sequences_router)
    app.include_router(commands_router)
    app.include_router(monitoring_router)
    
    logger.info("FastAPI application created and configured successfully")
    return app


# Create the application instance
app = create_app()
