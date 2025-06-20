"""
Compatibility adapter for integrating A+ features with legacy components.
"""

from typing import Any, Dict, Optional, Callable
from PyQt6.QtCore import QObject, pyqtSignal

from core.types.result import Result
from core.logging.structured_logger import get_logger, LogContext

logger = get_logger(__name__)


class CompatibilityAdapter:
    """
    Adapter for integrating A+ features with existing TKA Desktop components.
    
    Provides backward-compatible wrappers and adapters that allow existing
    components to benefit from A+ enhancements without requiring changes.
    """
    
    @staticmethod
    def wrap_with_result_handling(func: Callable, operation_name: str = None) -> Callable:
        """
        Wrap a function to use Result-based error handling.
        
        Args:
            func: Function to wrap
            operation_name: Optional operation name for logging
            
        Returns:
            Wrapped function that returns Result types
        """
        def wrapper(*args, **kwargs) -> Result[Any, Exception]:
            try:
                result = func(*args, **kwargs)
                return Result.ok(result)
            except Exception as e:
                if operation_name:
                    logger.error(
                        f"Operation '{operation_name}' failed",
                        error=e,
                        context=LogContext(
                            operation="wrapped_operation_error",
                            component="compatibility_adapter"
                        )
                    )
                return Result.error(e)
        
        return wrapper
    
    @staticmethod
    def add_logging_to_method(obj: Any, method_name: str, component_name: str = None):
        """
        Add structured logging to an existing method.
        
        Args:
            obj: Object containing the method
            method_name: Name of the method to enhance
            component_name: Optional component name for logging context
        """
        if not hasattr(obj, method_name):
            logger.warning(
                f"Method '{method_name}' not found on object",
                context=LogContext(
                    operation="add_logging_warning",
                    component="compatibility_adapter"
                ),
                object_type=type(obj).__name__,
                method_name=method_name
            )
            return
        
        original_method = getattr(obj, method_name)
        component = component_name or type(obj).__name__
        
        def logged_method(*args, **kwargs):
            logger.debug(
                f"Method '{method_name}' called",
                context=LogContext(
                    operation="method_call",
                    component=component
                ),
                method_name=method_name
            )
            
            try:
                result = original_method(*args, **kwargs)
                logger.debug(
                    f"Method '{method_name}' completed successfully",
                    context=LogContext(
                        operation="method_success",
                        component=component
                    ),
                    method_name=method_name
                )
                return result
            except Exception as e:
                logger.error(
                    f"Method '{method_name}' failed",
                    error=e,
                    context=LogContext(
                        operation="method_error",
                        component=component
                    ),
                    method_name=method_name
                )
                raise
        
        setattr(obj, method_name, logged_method)
    
    @staticmethod
    def add_performance_monitoring(obj: Any, method_name: str, component_name: str = None):
        """
        Add performance monitoring to an existing method.
        
        Args:
            obj: Object containing the method
            method_name: Name of the method to enhance
            component_name: Optional component name for monitoring
        """
        if not hasattr(obj, method_name):
            return
        
        from core.monitoring.performance_monitor import enhanced_performance_monitor
        
        original_method = getattr(obj, method_name)
        component = component_name or type(obj).__name__
        operation_name = f"{component}_{method_name}"
        
        def monitored_method(*args, **kwargs):
            with enhanced_performance_monitor.measure(operation_name):
                return original_method(*args, **kwargs)
        
        setattr(obj, method_name, monitored_method)


class LegacyComponentAdapter(QObject):
    """
    Adapter for legacy Qt components to use A+ features.
    
    Provides signals and methods that legacy components can use
    to integrate with A+ systems without major refactoring.
    """
    
    # Signals for A+ integration
    validation_requested = pyqtSignal(dict, str)  # data, operation_name
    validation_completed = pyqtSignal(bool, dict)  # success, result_or_errors
    state_update_requested = pyqtSignal(str, object)  # key, value
    performance_warning = pyqtSignal(str, float)  # operation, duration
    
    def __init__(self, legacy_component: Any, parent=None):
        super().__init__(parent)
        self.legacy_component = legacy_component
        self.component_name = type(legacy_component).__name__
        
        # Connect to A+ systems
        self._setup_a_plus_integration()
        
        logger.debug(
            "Legacy component adapter created",
            context=LogContext(
                operation="legacy_adapter_init",
                component="compatibility_adapter"
            ),
            legacy_component=self.component_name
        )
    
    def _setup_a_plus_integration(self):
        """Setup integration with A+ systems."""
        try:
            # Add logging to common methods
            common_methods = ['initialize', 'cleanup', 'update', 'refresh']
            for method in common_methods:
                CompatibilityAdapter.add_logging_to_method(
                    self.legacy_component, method, self.component_name
                )
                CompatibilityAdapter.add_performance_monitoring(
                    self.legacy_component, method, self.component_name
                )
        except Exception as e:
            logger.warning(
                "Failed to setup some A+ integrations",
                error=e,
                context=LogContext(
                    operation="a_plus_integration_warning",
                    component="compatibility_adapter"
                ),
                legacy_component=self.component_name
            )
    
    def validate_input(self, data: Dict[str, Any], operation_name: str = "input_validation") -> bool:
        """
        Validate input using A+ validation system.
        
        Args:
            data: Data to validate
            operation_name: Operation name for context
            
        Returns:
            True if validation passed, False otherwise
        """
        try:
            self.validation_requested.emit(data, operation_name)
            
            from core.validation.common_validators import validate_user_input
            
            result = validate_user_input(data)
            
            if result.is_valid:
                self.validation_completed.emit(True, {})
                return True
            else:
                error_dict = {}
                for error in result.errors:
                    if error.field not in error_dict:
                        error_dict[error.field] = []
                    error_dict[error.field].append(error.message)
                
                self.validation_completed.emit(False, error_dict)
                return False
                
        except Exception as e:
            logger.error(
                "Validation failed",
                error=e,
                context=LogContext(
                    operation="validation_error",
                    component="compatibility_adapter"
                ),
                legacy_component=self.component_name
            )
            self.validation_completed.emit(False, {"system": ["Validation system error"]})
            return False
    
    def update_ui_state(self, key: str, value: Any) -> bool:
        """
        Update UI state through A+ state management.
        
        Args:
            key: State key
            value: State value
            
        Returns:
            True if update succeeded, False otherwise
        """
        try:
            self.state_update_requested.emit(key, value)
            
            from core.state.ui_state_manager import get_ui_state_manager
            
            ui_state = get_ui_state_manager()
            result = ui_state.set(key, value)
            
            return result.is_ok()
            
        except Exception as e:
            logger.error(
                "UI state update failed",
                error=e,
                context=LogContext(
                    operation="ui_state_error",
                    component="compatibility_adapter"
                ),
                legacy_component=self.component_name,
                key=key
            )
            return False
    
    def get_ui_state(self, key: str, default: Any = None) -> Any:
        """
        Get UI state value.
        
        Args:
            key: State key
            default: Default value
            
        Returns:
            State value or default
        """
        try:
            from core.state.ui_state_manager import get_ui_state_manager
            
            ui_state = get_ui_state_manager()
            return ui_state.get(key, default)
            
        except Exception as e:
            logger.error(
                "UI state retrieval failed",
                error=e,
                context=LogContext(
                    operation="ui_state_get_error",
                    component="compatibility_adapter"
                ),
                legacy_component=self.component_name,
                key=key
            )
            return default
    
    def log_performance_warning(self, operation: str, duration: float):
        """
        Log a performance warning.
        
        Args:
            operation: Operation name
            duration: Duration in seconds
        """
        self.performance_warning.emit(operation, duration)
        
        logger.warning(
            f"Performance warning: {operation} took {duration:.3f}s",
            context=LogContext(
                operation="performance_warning",
                component="compatibility_adapter"
            ),
            legacy_component=self.component_name,
            operation_name=operation,
            duration=duration
        )
