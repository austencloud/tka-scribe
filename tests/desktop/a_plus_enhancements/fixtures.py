"""
Test fixtures for A+ enhancements testing.
"""

import pytest
from pathlib import Path

from unittest.mock import Mock
from typing import Dict, Any

# Create mock interfaces for testing
class MockEventBus:
    def __init__(self):
        self.publish = Mock()
        self.subscribe = Mock()
        self.unsubscribe = Mock()
        self.subscriber_count = 0

class MockSettings:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

@pytest.fixture
def mock_event_bus():
    """Mock event bus for testing."""
    return MockEventBus()

@pytest.fixture
def mock_container():
    """Mock DI container for testing."""
    container = Mock()
    container.get = Mock()
    container.register = Mock()
    return container

@pytest.fixture
def sample_sequence_data():
    """Sample sequence data for testing."""
    return {
        "id": "test_sequence_123",
        "name": "Test Sequence",
        "word": "TEST",
        "start_position": "alpha",
        "beats": [
            {
                "id": "beat_1",
                "beat_number": 1,
                "letter": "T",
                "duration": 1.0,
                "is_blank": False,
                "blue_reversal": False,
                "red_reversal": False,
                "metadata": {},
            },
            {
                "id": "beat_2",
                "beat_number": 2,
                "letter": "E",
                "duration": 1.0,
                "is_blank": False,
                "blue_reversal": False,
                "red_reversal": False,
                "metadata": {},
            },
        ],
        "metadata": {"created_at": "2024-01-01T00:00:00Z", "test_data": True},
    }

@pytest.fixture
def sample_beat_data():
    """Sample beat data for testing."""
    return {
        "id": "test_beat_456",
        "beat_number": 1,
        "letter": "A",
        "duration": 1.5,
        "is_blank": False,
        "blue_reversal": False,
        "red_reversal": False,
        "blue_motion": {
            "motion_type": "pro",
            "prop_rot_dir": "cw",
            "start_loc": "alpha",
            "end_loc": "beta",
            "turns": 1,
            "start_ori": "in",
            "end_ori": "out",
        },
        "red_motion": {
            "motion_type": "anti",
            "prop_rot_dir": "ccw",
            "start_loc": "gamma",
            "end_loc": "alpha",
            "turns": 2,
            "start_ori": "out",
            "end_ori": "in",
        },
        "metadata": {"test_data": True},
    }

@pytest.fixture
def test_config():
    """Test configuration settings."""
    return {
        "app_name": "TKA Desktop Test",
        "app_version": "2.0.0-test",
        "environment": "testing",
        "debug": True,
        "database": {"url": "sqlite:///:memory:", "echo": False},
        "api": {"host": "localhost", "port": 8001, "debug": True},
        "ui": {"theme": "dark", "window_width": 1200, "window_height": 800},
        "logging": {"level": "DEBUG", "format": "structured"},
        "performance": {"monitoring_enabled": True, "slow_operation_threshold": 0.5},
    }

@pytest.fixture
def temp_test_dir(tmp_path):
    """Temporary directory for test files."""
    test_dir = tmp_path / "tka_test"
    test_dir.mkdir()
    return test_dir

@pytest.fixture
def sample_validation_data():
    """Sample data for validation testing."""
    return {
        "valid_data": {
            "sequence_name": "Valid Sequence",
            "filename": "valid_file.json",
            "email": "test@example.com",
            "url": "https://example.com",
        },
        "invalid_data": {
            "sequence_name": "",  # Empty name
            "filename": "invalid<>file.json",  # Invalid characters
            "email": "not-an-email",  # Invalid email
            "url": "not-a-url",  # Invalid URL
        },
        "malicious_data": {
            "xss_attempt": "<script>alert('xss')</script>",
            "sql_injection": "'; DROP TABLE users; --",
            "path_traversal": "../../../etc/passwd",
        },
    }

@pytest.fixture
def mock_performance_data():
    """Mock performance data for testing."""
    return {
        "operation_1": {
            "total_calls": 100,
            "total_duration": 15.5,
            "average_duration": 0.155,
            "min_duration": 0.001,
            "max_duration": 2.5,
            "p95_duration": 0.8,
            "error_count": 2,
            "error_rate": 0.02,
        },
        "operation_2": {
            "total_calls": 50,
            "total_duration": 25.0,
            "average_duration": 0.5,
            "min_duration": 0.1,
            "max_duration": 3.0,
            "p95_duration": 1.2,
            "error_count": 0,
            "error_rate": 0.0,
        },
    }

@pytest.fixture
def mock_health_check_results():
    """Mock health check results for testing."""
    return {
        "database": {
            "name": "database",
            "status": "healthy",
            "message": "Database is accessible and responsive",
            "duration_ms": 15.5,
            "details": {"table_count": 5, "db_size_bytes": 1024000},
        },
        "memory": {
            "name": "memory",
            "status": "healthy",
            "message": "Memory usage normal: 45.2%",
            "duration_ms": 2.1,
            "details": {"usage_percent": 45.2, "total_gb": 16.0, "available_gb": 8.8},
        },
        "disk_space": {
            "name": "disk_space",
            "status": "degraded",
            "message": "High disk usage: 85.1%",
            "duration_ms": 5.3,
            "details": {"usage_percent": 85.1, "total_gb": 500.0, "free_gb": 74.5},
        },
    }

@pytest.fixture
def mock_ui_state():
    """Mock UI state for testing."""
    return {
        "current_tab": "construct",
        "current_sequence_id": "seq_123",
        "current_beat": 5,
        "theme": "dark",
        "window_size": {"width": 1400, "height": 900},
        "sidebar_visible": True,
        "editing_mode": False,
        "selected_beat_numbers": [3, 4, 5],
        "zoom_level": 1.2,
        "modal_open": None,
        "loading": {"active": False, "message": ""},
        "notifications": [],
    }

@pytest.fixture
def mock_system_metrics():
    """Mock system metrics for testing."""
    return {
        "timestamp": "2024-01-01T12:00:00Z",
        "cpu_percent": 25.5,
        "memory_percent": 67.8,
        "memory_used_mb": 2048.5,
        "memory_available_mb": 1024.2,
        "disk_usage_percent": 45.3,
        "disk_free_gb": 125.7,
        "process_count": 156,
    }
