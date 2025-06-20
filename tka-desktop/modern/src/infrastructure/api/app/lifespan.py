"""
Application lifespan management for service initialization and cleanup.
"""

import logging
from typing import Optional

from core.dependency_injection.di_container import DIContainer, get_container
from core.events import get_event_bus, IEventBus
from core.commands import CommandProcessor
from application.services.core.sequence_management_service import (
    SequenceManagementService,
)
from application.services.positioning.arrow_management_service import (
    ArrowManagementService,
)

logger = logging.getLogger(__name__)

# Global service instances
_container: Optional[DIContainer] = None
_event_bus: Optional[IEventBus] = None
_command_processor: Optional[CommandProcessor] = None
_sequence_service: Optional[SequenceManagementService] = None
_arrow_service: Optional[ArrowManagementService] = None


async def initialize_services():
    """Initialize all services and dependencies."""
    global _container, _event_bus, _command_processor, _sequence_service, _arrow_service

    try:
        logger.info("Starting TKA Desktop Production API...")

        # Initialize DI container and event bus
        _container = get_container()
        _event_bus = get_event_bus()

        # Initialize command processor
        _command_processor = CommandProcessor(_event_bus)

        # Initialize core services
        _sequence_service = SequenceManagementService(event_bus=_event_bus)
        _arrow_service = ArrowManagementService(event_bus=_event_bus)

        logger.info("All services initialized successfully")
        logger.info("TKA Desktop Production API started successfully")

    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise


async def cleanup_services():
    """Cleanup services on shutdown."""
    logger.info("Shutting down TKA Desktop Production API...")

    # Cleanup services
    if _arrow_service:
        _arrow_service.cleanup()

    logger.info("TKA Desktop Production API shutdown complete")


def get_container() -> DIContainer:
    """Get DI container."""
    return _container


def get_event_bus() -> IEventBus:
    """Get event bus."""
    return _event_bus


def get_command_processor() -> CommandProcessor:
    """Get command processor."""
    return _command_processor


def get_sequence_service() -> SequenceManagementService:
    """Get sequence management service."""
    return _sequence_service


def get_arrow_service() -> ArrowManagementService:
    """Get arrow management service."""
    return _arrow_service
