"""
Generation Service Registration

Registers all generation-related services in the dependency injection container.
Part of the modern TKA application's service registration system.
"""

import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from desktop.modern.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


def register_generation_services(container: "DIContainer") -> None:
    """
    Register all generation services in the dependency injection container.

    Args:
        container: DI container to register services in
    """
    try:
        # Import service interfaces
        from desktop.modern.core.interfaces.generation_services import (
            IGenerationService,
        )

        # Import service implementations
        from .generation_service import GenerationService

        # Register core generation services with container injection
        # Create a wrapper class that the DI container can instantiate
        class ContainerAwareGenerationService(GenerationService):
            def __init__(self):
                # Get the container from the service locator
                try:
                    from desktop.modern.core.dependency_injection.di_container import (
                        get_container,
                    )

                    container = get_container()
                    super().__init__(container)
                except Exception:
                    # Fallback to no container
                    super().__init__(None)

        container.register_singleton(
            IGenerationService, ContainerAwareGenerationService
        )

        logger.info("✅ Generation services registered successfully")

    except Exception as e:
        logger.error(f"❌ Failed to register generation services: {str(e)}")
        raise


def register_generation_test_doubles(container: "DIContainer") -> None:
    """
    Register test doubles for generation services.

    Args:
        container: DI container to register test doubles in
    """
    try:
        # Import test double implementations
        # Import service interfaces
        from desktop.modern.core.interfaces.generation_services import (
            IGenerationService,
        )

        from .test_doubles.mock_generation_service import MockGenerationService

        # Register test doubles
        container.register_singleton(IGenerationService, MockGenerationService)

        logger.info("✅ Generation test doubles registered successfully")

    except ImportError:
        # Test doubles not available, register actual services
        logger.warning(
            "Test doubles not available, registering actual generation services"
        )
        register_generation_services(container)
    except Exception as e:
        logger.error(f"❌ Failed to register generation test doubles: {str(e)}")
        raise


class GenerationServiceRegistrationHelper:
    """
    Helper class for generation service registration.

    Provides utilities for registering generation services and managing
    their dependencies in different application modes.
    """

    @staticmethod
    def register_for_production(container: "DIContainer") -> None:
        """Register production generation services."""
        register_generation_services(container)

    @staticmethod
    def register_for_testing(container: "DIContainer") -> None:
        """Register test double generation services."""
        register_generation_test_doubles(container)

    @staticmethod
    def validate_registration(container: "DIContainer") -> bool:
        """
        Validate that generation services are properly registered.

        Args:
            container: DI container to validate

        Returns:
            True if all services are registered correctly
        """
        try:
            from desktop.modern.core.interfaces.generation_services import (
                IGenerationService,
            )

            # Check that all required services can be resolved
            container.resolve(IGenerationService)

            logger.info("✅ Generation service registration validation passed")
            return True

        except Exception as e:
            logger.error(
                f"❌ Generation service registration validation failed: {str(e)}"
            )
            return False
