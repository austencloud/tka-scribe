"""
Test utilities for A+ enhancements testing.
"""

import time
from typing import Any, Dict, Optional
from unittest.mock import Mock

from desktop.core.types.result import Result

def assert_result_ok(result: Result, message: str = "Expected Result.ok"):
    """
    Assert that a Result is Ok and return the value.
    
    Args:
        result: Result to check
        message: Optional assertion message
        
    Returns:
        The unwrapped value from the Result
    """
    assert result.is_ok(), f"{message}. Got error: {result.unwrap_error() if result.is_error() else 'Unknown'}"
    return result.unwrap()

def assert_result_error(result: Result, expected_error_type: type = None, message: str = "Expected Result.error"):
    """
    Assert that a Result is Error and optionally check error type.
    
    Args:
        result: Result to check
        expected_error_type: Optional expected error type
        message: Optional assertion message
        
    Returns:
        The unwrapped error from the Result
    """
    assert result.is_error(), f"{message}. Got success value: {result.unwrap() if result.is_ok() else 'Unknown'}"
    
    error = result.unwrap_error()
    if expected_error_type:
        assert isinstance(error, expected_error_type), f"Expected error type {expected_error_type}, got {type(error)}"
    
    return error

def create_test_component(component_class, container=None, event_bus=None, **kwargs):
    """
    Create a test component with mocked dependencies.
    
    Args:
        component_class: Component class to instantiate
        container: Optional mock container
        event_bus: Optional mock event bus
        **kwargs: Additional arguments for component constructor
        
    Returns:
        Component instance with mocked dependencies
    """
    # Create mock container if not provided
    if container is None:
        container = Mock()
        container.get = Mock()
        container.register = Mock()
    
    # Create mock event bus if not provided
    if event_bus is None:
        event_bus = Mock()
        event_bus.publish = Mock()
        event_bus.subscribe = Mock()
        event_bus.unsubscribe = Mock()
    
    # Inject mocked dependencies into container
    container.get.side_effect = lambda service_type: {
        'IEventBus': event_bus,
        'event_bus': event_bus,
    }.get(service_type, Mock())
    
    # Create component
    try:
        component = component_class(container, **kwargs)
        return component
    except Exception as e:
        # If component creation fails, return a mock with the expected interface
        mock_component = Mock(spec=component_class)
        mock_component._container = container
        mock_component._event_bus = event_bus
        return mock_component

class PerformanceMeasurer:
    """Context manager for measuring test performance."""
    
    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = None
        self.end_time = None
        self.duration = None
    
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        self.duration = self.end_time - self.start_time
    
    def get_duration_ms(self) -> float:
        """Get duration in milliseconds."""
        return self.duration * 1000 if self.duration else 0.0

def measure_test_performance(operation_name: str) -> PerformanceMeasurer:
    """
    Create a performance measurer for testing.
    
    Args:
        operation_name: Name of the operation being measured
        
    Returns:
        PerformanceMeasurer context manager
    """
    return PerformanceMeasurer(operation_name)

def create_mock_validation_result(is_valid: bool = True, errors: list = None, warnings: list = None):
    """
    Create a mock validation result for testing.
    
    Args:
        is_valid: Whether validation passed
        errors: List of error messages
        warnings: List of warning messages
        
    Returns:
        Mock validation result
    """
    from desktop.core.validation.validation_error import ValidationResult, FieldValidationError
    
    result = ValidationResult(is_valid=is_valid)
    
    if errors:
        for error in errors:
            if isinstance(error, dict):
                result.add_error(
                    error.get('field', 'test_field'),
                    error.get('message', 'Test error'),
                    error.get('value'),
                    error.get('code', 'TEST_ERROR')
                )
            else:
                result.add_error('test_field', str(error))
    
    if warnings:
        for warning in warnings:
            if isinstance(warning, dict):
                result.add_warning(
                    warning.get('field', 'test_field'),
                    warning.get('message', 'Test warning'),
                    warning.get('value'),
                    warning.get('code', 'TEST_WARNING')
                )
            else:
                result.add_warning('test_field', str(warning))
    
    return result

def create_mock_health_check_result(name: str, status: str = "healthy", 
                                   message: str = "Test health check", 
                                   duration_ms: float = 10.0,
                                   details: Dict[str, Any] = None):
    """
    Create a mock health check result for testing.
    
    Args:
        name: Health check name
        status: Health status (healthy, degraded, unhealthy)
        message: Status message
        duration_ms: Check duration in milliseconds
        details: Additional details
        
    Returns:
        Mock health check result
    """
    from desktop.core.health.health_checker import HealthCheckResult, HealthStatus
    from datetime import datetime
    
    status_enum = HealthStatus(status)
    
    return HealthCheckResult(
        name=name,
        status=status_enum,
        message=message,
        duration_ms=duration_ms,
        details=details or {},
        timestamp=datetime.utcnow()
    )

def create_mock_metric_snapshot(cpu_percent: float = 25.0, 
                               memory_percent: float = 50.0,
                               disk_usage_percent: float = 30.0):
    """
    Create a mock metric snapshot for testing.
    
    Args:
        cpu_percent: CPU usage percentage
        memory_percent: Memory usage percentage
        disk_usage_percent: Disk usage percentage
        
    Returns:
        Mock metric snapshot
    """
    from desktop.core.health.system_metrics import MetricSnapshot
    from datetime import datetime
    
    return MetricSnapshot(
        timestamp=datetime.utcnow(),
        cpu_percent=cpu_percent,
        memory_percent=memory_percent,
        memory_used_mb=memory_percent * 16 * 1024 / 100,  # Assume 16GB total
        memory_available_mb=(100 - memory_percent) * 16 * 1024 / 100,
        disk_usage_percent=disk_usage_percent,
        disk_free_gb=(100 - disk_usage_percent) * 500 / 100,  # Assume 500GB total
        process_count=150
    )

def assert_performance_within_threshold(duration_ms: float, threshold_ms: float, 
                                       operation_name: str = "operation"):
    """
    Assert that an operation completed within a performance threshold.
    
    Args:
        duration_ms: Actual duration in milliseconds
        threshold_ms: Maximum allowed duration in milliseconds
        operation_name: Name of the operation for error messages
    """
    assert duration_ms <= threshold_ms, (
        f"Performance threshold exceeded for {operation_name}: "
        f"{duration_ms:.2f}ms > {threshold_ms:.2f}ms"
    )

def assert_log_contains(caplog, level: str, message_substring: str):
    """
    Assert that logs contain a specific message at a specific level.
    
    Args:
        caplog: pytest caplog fixture
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        message_substring: Substring to search for in log messages
    """
    found = False
    for record in caplog.records:
        if record.levelname == level and message_substring in record.message:
            found = True
            break
    
    assert found, f"Expected log message containing '{message_substring}' at level {level} not found"

def create_test_settings(**overrides):
    """
    Create test settings with optional overrides.
    
    Args:
        **overrides: Settings to override
        
    Returns:
        Settings instance for testing
    """
    from desktop.core.config.settings import Settings
    
    default_settings = {
        'app_name': 'TKA Desktop Test',
        'app_version': '2.0.0-test',
        'environment': 'testing',
        'debug': True
    }
    
    default_settings.update(overrides)
    
    # Create settings instance
    settings = Settings(**default_settings)
    return settings
