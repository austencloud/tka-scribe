"""
Dependency injection functions for FastAPI endpoints.
"""

from fastapi import HTTPException, status
from core.dependency_injection.di_container import DIContainer
from core.events import IEventBus
from core.commands import CommandProcessor
from application.services.core.sequence_management_service import (
    SequenceManagementService,
)
from application.services.positioning.arrow_management_service import (
    ArrowManagementService,
)
from ..app.lifespan import (
    get_container as _get_container,
    get_event_bus as _get_event_bus,
    get_command_processor as _get_command_processor,
    get_sequence_service as _get_sequence_service,
    get_arrow_service as _get_arrow_service,
)


def get_sequence_service() -> SequenceManagementService:
    """Get sequence management service."""
    service = _get_sequence_service()
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sequence service not available",
        )
    return service


def get_arrow_service() -> ArrowManagementService:
    """Get arrow management service."""
    service = _get_arrow_service()
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Arrow service not available",
        )
    return service


def get_command_processor() -> CommandProcessor:
    """Get command processor."""
    processor = _get_command_processor()
    if processor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Command processor not available",
        )
    return processor


def get_event_bus_dependency() -> IEventBus:
    """Get event bus."""
    event_bus = _get_event_bus()
    if event_bus is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Event bus not available",
        )
    return event_bus


def get_container_dependency() -> DIContainer:
    """Get DI container."""
    container = _get_container()
    if container is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="DI container not available",
        )
    return container
