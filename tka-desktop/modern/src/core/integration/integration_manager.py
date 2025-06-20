"""
Integration manager for coordinating A+ systems with existing architecture.
"""

from typing import Dict, Any, Optional, List
from pathlib import Path

from core.types.result import Result
from core.logging.structured_logger import get_logger, LogContext
from core.monitoring.performance_monitor import enhanced_performance_monitor
from core.state.ui_state_manager import get_ui_state_manager
from core.health.health_checker import get_health_checker

try:
    from core.config.settings import get_settings
except ImportError:
    # Fallback to simple settings for testing
    from core.config.simple_settings import get_simple_settings as get_settings
from core.events import IEventBus


logger = get_logger(__name__)


class IntegrationManager:
    """
    Central coordinator for A+ system integration.

    Manages the integration of all A+ enhancements with the existing
    TKA Desktop architecture, ensuring compatibility and proper initialization.
    """

    def __init__(self, event_bus: Optional[IEventBus] = None):
        self.event_bus = event_bus
        self.initialized_systems: Dict[str, bool] = {}
        self.integration_status = "not_initialized"
        self.startup_errors: List[str] = []

        logger.info(
            "Integration manager created",
            context=LogContext(
                operation="integration_manager_init", component="integration_manager"
            ),
        )

    def initialize_all_systems(self) -> Result[Dict[str, bool], Exception]:
        """
        Initialize all A+ systems in the correct order.

        Returns:
            Result containing initialization status for each system
        """
        try:
            self.integration_status = "initializing"

            logger.info(
                "Starting A+ systems initialization",
                context=LogContext(
                    operation="systems_init_start", component="integration_manager"
                ),
            )

            # Initialize systems in dependency order
            initialization_order = [
                ("logging", self._initialize_logging),
                ("monitoring", self._initialize_monitoring),
                ("configuration", self._initialize_configuration),
                ("validation", self._initialize_validation),
                ("ui_state", self._initialize_ui_state),
                ("health_checks", self._initialize_health_checks),
                ("api_layer", self._initialize_api_layer),
            ]

            for system_name, init_func in initialization_order:
                try:
                    with enhanced_performance_monitor.measure(f"init_{system_name}"):
                        result = init_func()

                        if result.is_ok():
                            self.initialized_systems[system_name] = True
                            logger.info(
                                f"System '{system_name}' initialized successfully",
                                context=LogContext(
                                    operation="system_init_success",
                                    component="integration_manager",
                                ),
                                system=system_name,
                            )
                        else:
                            self.initialized_systems[system_name] = False
                            error_msg = f"Failed to initialize {system_name}: {result.unwrap_error()}"
                            self.startup_errors.append(error_msg)
                            logger.error(
                                error_msg,
                                context=LogContext(
                                    operation="system_init_error",
                                    component="integration_manager",
                                ),
                                system=system_name,
                            )

                except Exception as e:
                    self.initialized_systems[system_name] = False
                    error_msg = f"Exception initializing {system_name}: {str(e)}"
                    self.startup_errors.append(error_msg)
                    logger.error(
                        error_msg,
                        error=e,
                        context=LogContext(
                            operation="system_init_exception",
                            component="integration_manager",
                        ),
                        system=system_name,
                    )

            # Determine overall status
            successful_systems = sum(self.initialized_systems.values())
            total_systems = len(self.initialized_systems)

            if successful_systems == total_systems:
                self.integration_status = "fully_initialized"
            elif successful_systems > 0:
                self.integration_status = "partially_initialized"
            else:
                self.integration_status = "failed"

            logger.info(
                "A+ systems initialization completed",
                context=LogContext(
                    operation="systems_init_complete", component="integration_manager"
                ),
                successful_systems=successful_systems,
                total_systems=total_systems,
                status=self.integration_status,
            )

            return Result.ok(self.initialized_systems)

        except Exception as e:
            self.integration_status = "failed"
            logger.error(
                "A+ systems initialization failed",
                error=e,
                context=LogContext(
                    operation="systems_init_failed", component="integration_manager"
                ),
            )
            return Result.error(e)

    def _initialize_logging(self) -> Result[None, Exception]:
        """Initialize structured logging system."""
        try:
            # Logging is already initialized by importing the module
            # Just verify it's working
            test_logger = get_logger("integration_test")
            test_logger.debug("Logging system test")
            return Result.ok(None)
        except Exception as e:
            return Result.error(e)

    def _initialize_monitoring(self) -> Result[None, Exception]:
        """Initialize performance monitoring system."""
        try:
            # Test monitoring system
            with enhanced_performance_monitor.measure("integration_test"):
                pass
            return Result.ok(None)
        except Exception as e:
            return Result.error(e)

    def _initialize_configuration(self) -> Result[None, Exception]:
        """Initialize configuration management system."""
        try:
            settings = get_settings()
            # Validate settings
            app_name = getattr(settings, "app_name", "TKA Desktop")
            if not app_name:
                return Result.error(
                    Exception("Invalid configuration: missing app_name")
                )
            return Result.ok(None)
        except Exception as e:
            # Configuration is optional for testing
            logger.warning(
                "Configuration system not available",
                context=LogContext(
                    operation="config_init_warning", component="integration_manager"
                ),
                error=str(e),
            )
            return Result.ok(None)

    def _initialize_validation(self) -> Result[None, Exception]:
        """Initialize validation system."""
        try:
            from core.validation.validators import ValidationBuilder

            # Test validation system
            validator = ValidationBuilder().required().build()
            test_result = validator.validate("test", "test_field")
            if not test_result.is_valid:
                return Result.error(Exception("Validation system test failed"))
            return Result.ok(None)
        except Exception as e:
            return Result.error(e)

    def _initialize_ui_state(self) -> Result[None, Exception]:
        """Initialize UI state management system."""
        try:
            ui_state = get_ui_state_manager(self.event_bus)
            # Test UI state system
            test_result = ui_state.set("integration_test", True)
            if test_result.is_error():
                return Result.error(test_result.unwrap_error())
            return Result.ok(None)
        except Exception as e:
            return Result.error(e)

    def _initialize_health_checks(self) -> Result[None, Exception]:
        """Initialize health check system."""
        try:
            health_checker = get_health_checker()

            # Register basic health checks
            from core.health.builtin_checks import (
                MemoryHealthCheck,
                DiskSpaceHealthCheck,
            )

            health_checker.register_check(MemoryHealthCheck())
            health_checker.register_check(DiskSpaceHealthCheck())

            return Result.ok(None)
        except Exception as e:
            return Result.error(e)

    def _initialize_api_layer(self) -> Result[None, Exception]:
        """Initialize enhanced API layer."""
        try:
            # API layer initialization is optional for desktop app
            # Just verify imports work
            from infrastructure.api.v1.router import api_v1_router

            return Result.ok(None)
        except Exception as e:
            # API layer is optional, so don't fail if it's not available
            logger.warning(
                "API layer not available",
                context=LogContext(
                    operation="api_init_warning", component="integration_manager"
                ),
                error=str(e),
            )
            return Result.ok(None)

    def get_integration_status(self) -> Dict[str, Any]:
        """
        Get comprehensive integration status.

        Returns:
            Dictionary with integration status information
        """
        successful_systems = sum(self.initialized_systems.values())
        total_systems = len(self.initialized_systems)

        return {
            "status": self.integration_status,
            "successful_systems": successful_systems,
            "total_systems": total_systems,
            "success_rate": (
                successful_systems / total_systems if total_systems > 0 else 0
            ),
            "initialized_systems": self.initialized_systems.copy(),
            "startup_errors": self.startup_errors.copy(),
            "is_fully_operational": self.integration_status == "fully_initialized",
        }

    def shutdown_all_systems(self) -> Result[None, Exception]:
        """
        Gracefully shutdown all A+ systems.

        Returns:
            Result indicating shutdown success/failure
        """
        try:
            logger.info(
                "Starting A+ systems shutdown",
                context=LogContext(
                    operation="systems_shutdown_start", component="integration_manager"
                ),
            )

            # Shutdown in reverse order
            shutdown_errors = []

            # UI state manager
            try:
                ui_state = get_ui_state_manager()
                # Save current state
                state_file = Path("tka_ui_state.json")
                save_result = ui_state.save_to_file(state_file)
                if save_result.is_error():
                    shutdown_errors.append(
                        f"Failed to save UI state: {save_result.unwrap_error()}"
                    )
            except Exception as e:
                shutdown_errors.append(f"UI state shutdown error: {str(e)}")

            # Performance monitoring
            try:
                # Export final metrics
                metrics_file = Path("tka_performance_metrics.json")
                export_result = enhanced_performance_monitor.export_metrics(
                    metrics_file
                )
                if export_result.is_error():
                    shutdown_errors.append(
                        f"Failed to export metrics: {export_result.unwrap_error()}"
                    )
            except Exception as e:
                shutdown_errors.append(f"Monitoring shutdown error: {str(e)}")

            if shutdown_errors:
                logger.warning(
                    "Some systems had shutdown errors",
                    context=LogContext(
                        operation="systems_shutdown_warnings",
                        component="integration_manager",
                    ),
                    errors=shutdown_errors,
                )

            logger.info(
                "A+ systems shutdown completed",
                context=LogContext(
                    operation="systems_shutdown_complete",
                    component="integration_manager",
                ),
                error_count=len(shutdown_errors),
            )

            return Result.ok(None)

        except Exception as e:
            logger.error(
                "A+ systems shutdown failed",
                error=e,
                context=LogContext(
                    operation="systems_shutdown_failed", component="integration_manager"
                ),
            )
            return Result.error(e)


# Global integration manager instance
integration_manager: Optional[IntegrationManager] = None


def get_integration_manager(
    event_bus: Optional[IEventBus] = None,
) -> IntegrationManager:
    """Get or create global integration manager instance."""
    global integration_manager
    if integration_manager is None:
        integration_manager = IntegrationManager(event_bus)
    return integration_manager
