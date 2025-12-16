#!/usr/bin/env python3
"""
Application Factory
===================

Factory for creating TKA application instances with proper dependency injection.
Provides different application modes for production, testing, and headless operation.
"""
from __future__ import annotations

from enum import Enum
import logging
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from desktop.modern.src.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class ApplicationMode(Enum):
    """Application operation modes."""
    PRODUCTION = "production"
    TEST = "test"
    HEADLESS = "headless"


class ApplicationFactory:
    """
    Factory for creating TKA application instances.

    Provides centralized application creation with proper dependency injection
    and configuration for different operational modes.
    """

    @classmethod
    def create_app(cls, mode: str | ApplicationMode = ApplicationMode.PRODUCTION) -> DIContainer:
        """
        Create application instance with dependency injection container.

        Args:
            mode: Application mode (production, test, headless)

        Returns:
            DIContainer: Configured dependency injection container
        """
        if isinstance(mode, str):
            mode = ApplicationMode(mode.lower())

        logger.info(f"Creating TKA application in {mode.value} mode")

        try:
            # Import here to avoid circular imports
            from desktop.modern.src.core.dependency_injection.di_container import (
                DIContainer,
            )

            # Create container
            container = DIContainer()

            # Register services based on mode
            cls._register_services(container, mode)

            logger.info(f"TKA application created successfully in {mode.value} mode")
            return container

        except Exception as e:
            logger.exception(f"Failed to create TKA application: {e}")
            raise

    @classmethod
    def _register_services(cls, container: DIContainer, mode: ApplicationMode) -> None:
        """Register services in the dependency injection container."""
        try:
            # Import service registration
            from desktop.modern.src.application.services.core.service_registration_manager import (
                ServiceRegistrationManager,
            )

            # Register all services
            service_manager = ServiceRegistrationManager()
            service_manager.register_all_services(container)

            logger.info(f"Services registered for {mode.value} mode")

        except ImportError as e:
            logger.warning(f"Service registration not available: {e}")
            # Continue with basic container for now
        except Exception as e:
            logger.exception(f"Failed to register services: {e}")
            raise


def get_production_app() -> DIContainer:
    """Get production application instance."""
    return ApplicationFactory.create_app(ApplicationMode.PRODUCTION)


def get_test_app() -> DIContainer:
    """Get test application instance."""
    return ApplicationFactory.create_app(ApplicationMode.TEST)


def get_headless_app() -> DIContainer:
    """Get headless application instance."""
    return ApplicationFactory.create_app(ApplicationMode.HEADLESS)
