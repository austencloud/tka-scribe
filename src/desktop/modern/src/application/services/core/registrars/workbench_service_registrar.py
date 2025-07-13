"""
Workbench Service Registrar

Handles registration of workbench-related services following microservices architecture.
This registrar manages workbench business logic and presentation services for
sequence editing and management functionality.

Services Registered:
- BeatSelectionService: Beat selection business logic
- Workbench presentation services: UI components and factories
"""

import logging
from typing import TYPE_CHECKING, List

from ..service_registration_manager import BaseServiceRegistrar

if TYPE_CHECKING:
    from core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class WorkbenchServiceRegistrar(BaseServiceRegistrar):
    """
    Registrar for workbench-related services.

    Medium complexity registrar handling workbench business logic and
    presentation services for sequence editing and management functionality.
    Separates business logic from presentation concerns.
    """

    def get_domain_name(self) -> str:
        """Get the name of the service domain this registrar handles."""
        return "Workbench Services"

    def is_critical(self) -> bool:
        """Workbench services are critical for sequence editing functionality."""
        return True

    def register_services(self, container: "DIContainer") -> None:
        """Register workbench services."""
        self._update_progress("Registering workbench services...")

        # Register business services
        self._register_business_services(container)

        # Register presentation services
        self._register_presentation_services(container)

        self._update_progress("Workbench services registered successfully")

    def _register_business_services(self, container: "DIContainer") -> None:
        """Register pure business services for workbench functionality."""
        try:
            from application.services.workbench.beat_selection_service import (
                BeatSelectionService,
            )

            # Register pure business services
            container.register_singleton(BeatSelectionService, BeatSelectionService)
            self._mark_service_available("BeatSelectionService")

        except ImportError as e:
            error_msg = f"Failed to register workbench business services: {e}"
            logger.error(error_msg)

            # Business services are critical, so re-raise the error
            if self.is_critical():
                raise ImportError(
                    f"Critical workbench business services unavailable: {e}"
                ) from e

    def _register_presentation_services(self, container: "DIContainer") -> None:
        """Register workbench presentation services and factories."""
        try:
            from presentation.factories.workbench_factory import (
                configure_workbench_services,
            )

            # Register presentation services using the existing factory
            configure_workbench_services(container)
            self._mark_service_available("WorkbenchPresentationServices")

        except ImportError as e:
            error_msg = f"Failed to register workbench presentation services: {e}"
            logger.error(error_msg)

            # Presentation services are critical for workbench functionality
            if self.is_critical():
                raise ImportError(
                    f"Critical workbench presentation services unavailable: {e}"
                ) from e
