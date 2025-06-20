"""
FastAPI application factory for creating and configuring the TKA Desktop API.
"""

from fastapi import FastAPI
from contextlib import asynccontextmanager

from .config import APIConfig
from .lifespan import initialize_services, cleanup_services
from ..routers import (
    health_router,
    sequence_router,
    beat_router,
    command_router,
    arrow_router,
    event_router,
)
from ..middleware.cors_middleware import setup_cors
from ..middleware.error_middleware import setup_error_handlers
from ..middleware.performance_middleware import setup_performance_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan with proper startup and shutdown."""
    # Startup
    await initialize_services()
    yield
    # Shutdown
    await cleanup_services()


def create_app(config: APIConfig | None = None) -> FastAPI:
    """
    Create and configure the FastAPI application.

    Args:
        config: API configuration settings

    Returns:
        Configured FastAPI application
    """
    if config is None:
        config = APIConfig()

    # Create FastAPI app with configuration
    app = FastAPI(
        title=config.title,
        version=config.version,
        description=config.description,
        docs_url=config.docs_url,
        redoc_url=config.redoc_url,
        openapi_url=config.openapi_url,
        lifespan=lifespan,
    )
    # Setup middleware
    setup_cors(app, config)
    setup_error_handlers(app)
    setup_performance_middleware(app)

    # Include routers
    app.include_router(health_router.router)
    app.include_router(sequence_router.router)
    app.include_router(beat_router.router)
    app.include_router(command_router.router)
    app.include_router(arrow_router.router)
    app.include_router(event_router.router)

    return app
