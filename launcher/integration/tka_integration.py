#!/usr/bin/env python3
"""
TKA Integration Service - Clean Bridge to TKA Services
====================================================

Simple integration layer between the fluent launcher and TKA's
dependency injection system.

Responsibilities:
- Interface with TKA's DI container
- Application discovery and management
- Launch coordination
- Settings and state management

Architecture:
- Direct integration with TKA services (no fallbacks)
- Clean error handling and logging
- Follows TKA's dependency injection patterns
"""

import logging
from typing import List, Optional

# No path manipulation needed - using direct service imports

logger = logging.getLogger(__name__)


class TKAIntegrationService:
    """
    Service for integrating with TKA's existing infrastructure.

    Provides a clean interface to TKA services using standard
    dependency injection patterns.
    """

    def __init__(self):
        """Initialize TKA integration."""
        self.container = None
        self.app_service = None
        self.launch_service = None
        self.settings_service = None

        # Initialize TKA services
        self._initialize_tka_services()

        logger.info("✅ TKA integration service ready")

    def _initialize_tka_services(self):
        """Initialize launcher services directly (no DI container needed)."""
        try:
            # Import launcher services directly - no DI container complexity needed
            from services.application_service import ApplicationService
            from services.application_launch_service import ApplicationLaunchService
            from services.settings_service import SettingsService
            from services.launcher_state_service import LauncherStateService

            # Create services directly - much simpler than DI container
            state_service = LauncherStateService()
            self.settings_service = SettingsService()
            self.app_service = ApplicationService(state_service)
            self.launch_service = ApplicationLaunchService(state_service)

            # No container needed - we have the services directly
            self.container = None

            logger.info("✅ TKA services initialized successfully")

        except Exception as e:
            logger.error(f"❌ Failed to initialize TKA services: {e}")
            raise RuntimeError(
                "TKA services are required for launcher operation"
            ) from e

    def get_applications(self) -> List:
        """Get the list of available applications."""
        try:
            if self.app_service:
                applications = self.app_service.get_all_applications()
                return applications
            else:
                logger.warning("⚠️ No application service available")
                return []

        except Exception as e:
            logger.error(f"❌ Failed to get applications: {e}")
            return []

    def launch_application(self, app_id: str) -> bool:
        """Launch an application by ID."""
        try:
            if self.launch_service:
                # Create launch request
                from domain.models import LaunchRequest
                from datetime import datetime

                request = LaunchRequest(
                    application_id=app_id,
                    timestamp=datetime.now().isoformat(),
                    session_id="launcher",
                    user_initiated=True,
                    launch_options={},
                )

                # Launch the application
                result = self.launch_service.launch_application(request)

                if result.success:
                    logger.info(f"🚀 Successfully launched application: {app_id}")
                    return True
                else:
                    logger.error(
                        f"❌ Failed to launch application: {result.error_message}"
                    )
                    return False
            else:
                logger.warning(f"⚠️ No launch service available for {app_id}")
                return False

        except Exception as e:
            logger.error(f"❌ Error launching application {app_id}: {e}")
            return False

    def get_settings(self) -> dict:
        """Get launcher settings."""
        try:
            if self.settings_service:
                return self.settings_service.get_all_settings()
            else:
                return {}
        except Exception as e:
            logger.error(f"❌ Failed to get settings: {e}")
            return {}

    def save_settings(self, settings: dict):
        """Save launcher settings."""
        try:
            if self.settings_service:
                self.settings_service.update_settings(settings)
                logger.info("💾 Settings saved successfully")
            else:
                logger.warning("⚠️ No settings service available")
        except Exception as e:
            logger.error(f"❌ Failed to save settings: {e}")

    def cleanup(self):
        """Cleanup TKA integration resources."""
        logger.info("🧹 Cleaning up TKA integration...")

        try:
            # Cleanup any resources if needed
            if self.container:
                self.container.cleanup()
        except Exception as e:
            logger.warning(f"⚠️ TKA integration cleanup warning: {e}")
