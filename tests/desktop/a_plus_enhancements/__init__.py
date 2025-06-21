"""
A+ Enhancements Test Suite

Comprehensive test suite for all A+ architectural enhancements to TKA Desktop.
Tests ensure that new systems work correctly and integrate properly with
existing architecture without breaking functionality.

TEST STRUCTURE:
- test_monitoring/: Performance monitoring and metrics tests
- test_logging/: Structured logging system tests  
- test_validation/: Input validation and security tests
- test_state/: UI state management tests
- test_health/: Health check and metrics dashboard tests
- test_integration/: Integration and compatibility tests
- test_config/: Configuration management tests
- test_api/: Enhanced API layer tests

COVERAGE GOALS:
- Unit tests for all new components
- Integration tests for system interactions
- Performance tests for monitoring accuracy
- Security tests for validation effectiveness
- Compatibility tests for legacy integration
"""

# Test utilities and fixtures
from .fixtures import (
    mock_event_bus,
    mock_container,
    sample_sequence_data,
    sample_beat_data,
    test_config,
)

from .utils import (
    assert_result_ok,
    assert_result_error,
    create_test_component,
    measure_test_performance,
)

__all__ = [
    "mock_event_bus",
    "mock_container", 
    "sample_sequence_data",
    "sample_beat_data",
    "test_config",
    "assert_result_ok",
    "assert_result_error",
    "create_test_component",
    "measure_test_performance",
]
