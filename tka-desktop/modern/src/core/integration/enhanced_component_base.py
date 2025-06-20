"""
Enhanced component base class with A+ features integrated.
"""

from typing import Optional, Any, Dict
from PyQt6.QtWidgets import QWidget
from PyQt6.QtCore import pyqtSignal

from presentation.components.component_base import (
    ViewableComponentBase,
    AsyncViewableComponentBase,
)
from core.types.result import Result
from core.logging.structured_logger import get_logger, LogContext
from core.monitoring.performance_monitor import enhanced_performance_monitor
from core.validation.validators import ValidationBuilder
from core.state.ui_state_manager import get_ui_state_manager
from core.health.health_checker import get_health_checker
from core.health.builtin_checks import ComponentHealthCheck

logger = get_logger(__name__)


class EnhancedComponentBase(ViewableComponentBase):
    """
    Enhanced component base class with A+ features.

    Extends the existing ViewableComponentBase with:
    - Result-based error handling
    - Structured logging
    - Performance monitoring
    - Input validation
    - UI state management integration
    - Health check support

    Maintains full backward compatibility with existing components.
    """

    # Additional signals for A+ features
    validation_failed = pyqtSignal(str, dict)  # message, validation_errors
    performance_warning = pyqtSignal(str, float)  # operation, duration

    def __init__(self, container, parent=None):
        super().__init__(container, parent)

        # A+ Enhancement: Initialize enhanced features
        self._ui_state_manager = None
        self._health_check = None
        self._validation_builder = ValidationBuilder()
        self._performance_thresholds = {
            "initialization": 5.0,  # seconds
            "operation": 2.0,  # seconds
            "render": 0.1,  # seconds
        }

        # Initialize A+ systems
        self._initialize_a_plus_features()

    def _initialize_a_plus_features(self):
        """Initialize A+ enhancement features."""
        try:
            # Initialize UI state manager integration
            self._ui_state_manager = get_ui_state_manager(self._event_bus)

            # Register component health check
            health_checker = get_health_checker()
            self._health_check = ComponentHealthCheck(
                component_name=self.__class__.__name__, component_instance=self
            )
            health_checker.register_check(self._health_check)

            logger.debug(
                "A+ features initialized for component",
                context=LogContext(
                    operation="a_plus_init", component=self.__class__.__name__
                ),
            )

        except Exception as e:
            logger.warning(
                "Failed to initialize some A+ features",
                error=e,
                context=LogContext(
                    operation="a_plus_init_warning", component=self.__class__.__name__
                ),
            )

    def initialize_with_monitoring(self) -> Result[None, Exception]:
        """
        Enhanced initialization with performance monitoring and error handling.

        Returns:
            Result indicating success/failure of initialization
        """
        try:
            with enhanced_performance_monitor.measure(
                f"{self.__class__.__name__}_initialization"
            ):
                # Call the original initialize method
                self.initialize()

                # Validate initialization
                if not self._initialized:
                    return Result.error(
                        Exception(
                            f"Component {self.__class__.__name__} failed to initialize properly"
                        )
                    )

                logger.info(
                    "Component initialized successfully",
                    context=LogContext(
                        operation="component_init", component=self.__class__.__name__
                    ),
                )

                return Result.ok(None)

        except Exception as e:
            logger.error(
                "Component initialization failed",
                error=e,
                context=LogContext(
                    operation="component_init_error", component=self.__class__.__name__
                ),
            )
            return Result.error(e)

    def validate_input(
        self, data: Dict[str, Any], validation_rules: Optional[Dict] = None
    ) -> Result[Dict[str, Any], Exception]:
        """
        Validate input data using the validation framework.

        Args:
            data: Input data to validate
            validation_rules: Optional custom validation rules

        Returns:
            Result containing validated data or validation errors
        """
        try:
            from core.validation.common_validators import validate_user_input

            # Perform security validation
            validation_result = validate_user_input(data)

            if not validation_result.is_valid:
                error_dict = {}
                for error in validation_result.errors:
                    if error.field not in error_dict:
                        error_dict[error.field] = []
                    error_dict[error.field].append(error.message)

                # Emit validation failed signal
                self.validation_failed.emit("Input validation failed", error_dict)

                return Result.error(
                    Exception(
                        f"Validation failed: {validation_result.get_error_messages()}"
                    )
                )

            logger.debug(
                "Input validation successful",
                context=LogContext(
                    operation="input_validation", component=self.__class__.__name__
                ),
                data_keys=list(data.keys()),
            )

            return Result.ok(data)

        except Exception as e:
            logger.error(
                "Input validation error",
                error=e,
                context=LogContext(
                    operation="input_validation_error",
                    component=self.__class__.__name__,
                ),
            )
            return Result.error(e)

    def perform_operation(
        self, operation_name: str, operation_func: callable, *args, **kwargs
    ) -> Result[Any, Exception]:
        """
        Perform an operation with monitoring and error handling.

        Args:
            operation_name: Name of the operation for monitoring
            operation_func: Function to execute
            *args: Operation arguments
            **kwargs: Operation keyword arguments

        Returns:
            Result containing operation result or error
        """
        try:
            with enhanced_performance_monitor.measure(
                f"{self.__class__.__name__}_{operation_name}"
            ) as monitor:
                result = operation_func(*args, **kwargs)

                # Check for performance warnings
                duration = getattr(monitor, "duration", 0)
                threshold = self._performance_thresholds.get(
                    operation_name, self._performance_thresholds["operation"]
                )

                if duration > threshold:
                    warning_msg = (
                        f"Slow operation: {operation_name} took {duration:.3f}s"
                    )
                    logger.warning(
                        warning_msg,
                        context=LogContext(
                            operation="performance_warning",
                            component=self.__class__.__name__,
                        ),
                        operation_name=operation_name,
                        duration=duration,
                        threshold=threshold,
                    )
                    self.performance_warning.emit(operation_name, duration)

                return Result.ok(result)

        except Exception as e:
            logger.error(
                f"Operation '{operation_name}' failed",
                error=e,
                context=LogContext(
                    operation="operation_error", component=self.__class__.__name__
                ),
                operation_name=operation_name,
            )
            return Result.error(e)

    def update_ui_state(self, key: str, value: Any) -> Result[None, Exception]:
        """
        Update UI state through the state manager.

        Args:
            key: State key to update
            value: New value

        Returns:
            Result indicating success/failure
        """
        if not self._ui_state_manager:
            return Result.error(Exception("UI state manager not available"))

        try:
            result = self._ui_state_manager.set(key, value)
            if result.is_error():
                logger.warning(
                    "Failed to update UI state",
                    context=LogContext(
                        operation="ui_state_update_warning",
                        component=self.__class__.__name__,
                    ),
                    key=key,
                    error=str(result.unwrap_error()),
                )

            return result

        except Exception as e:
            logger.error(
                "UI state update error",
                error=e,
                context=LogContext(
                    operation="ui_state_update_error", component=self.__class__.__name__
                ),
                key=key,
            )
            return Result.error(e)

    def get_ui_state(self, key: str, default: Any = None) -> Any:
        """
        Get UI state value.

        Args:
            key: State key to retrieve
            default: Default value if key not found

        Returns:
            State value or default
        """
        if not self._ui_state_manager:
            return default

        return self._ui_state_manager.get(key, default)

    def health_check(self) -> bool:
        """
        Component health check method.

        Override this method to provide custom health check logic.

        Returns:
            True if component is healthy, False otherwise
        """
        try:
            # Basic health check - component is initialized and has widget
            return self._initialized and self.get_widget() is not None
        except Exception:
            return False

    def cleanup_enhanced(self) -> Result[None, Exception]:
        """
        Enhanced cleanup with proper error handling.

        Returns:
            Result indicating cleanup success/failure
        """
        try:
            # Unregister health check
            if self._health_check:
                health_checker = get_health_checker()
                health_checker.unregister_check(self._health_check.name)

            # Call original cleanup
            self.cleanup()

            logger.debug(
                "Component cleanup completed",
                context=LogContext(
                    operation="component_cleanup", component=self.__class__.__name__
                ),
            )

            return Result.ok(None)

        except Exception as e:
            logger.error(
                "Component cleanup failed",
                error=e,
                context=LogContext(
                    operation="component_cleanup_error",
                    component=self.__class__.__name__,
                ),
            )
            return Result.error(e)


class AsyncEnhancedComponentBase(AsyncViewableComponentBase, EnhancedComponentBase):
    """
    Async-capable enhanced component base class.

    Combines async capabilities with A+ enhancements.
    """

    async def async_initialize_with_monitoring(self) -> Result[None, Exception]:
        """
        Enhanced async initialization with monitoring.

        Returns:
            Result indicating success/failure of initialization
        """
        try:
            with enhanced_performance_monitor.measure(
                f"{self.__class__.__name__}_async_initialization"
            ):
                # Call async initialization
                await self.async_initialize()

                # Call sync initialization
                result = self.initialize_with_monitoring()
                if result.is_error():
                    return result

                logger.info(
                    "Async component initialized successfully",
                    context=LogContext(
                        operation="async_component_init",
                        component=self.__class__.__name__,
                    ),
                )

                return Result.ok(None)

        except Exception as e:
            logger.error(
                "Async component initialization failed",
                error=e,
                context=LogContext(
                    operation="async_component_init_error",
                    component=self.__class__.__name__,
                ),
            )
            return Result.error(e)

    async def async_cleanup_enhanced(self) -> Result[None, Exception]:
        """
        Enhanced async cleanup with proper error handling.

        Returns:
            Result indicating cleanup success/failure
        """
        try:
            # Call async cleanup
            await self.async_cleanup()

            # Call enhanced cleanup
            result = self.cleanup_enhanced()
            if result.is_error():
                return result

            logger.debug(
                "Async component cleanup completed",
                context=LogContext(
                    operation="async_component_cleanup",
                    component=self.__class__.__name__,
                ),
            )

            return Result.ok(None)

        except Exception as e:
            logger.error(
                "Async component cleanup failed",
                error=e,
                context=LogContext(
                    operation="async_component_cleanup_error",
                    component=self.__class__.__name__,
                ),
            )
            return Result.error(e)
