"""
TKA Unified Test Configuration

This file provides pytest configuration for the entire TKA workspace.
No manual path manipulation needed - uses standard Python imports.
"""

import pytest
from pathlib import Path
from unittest.mock import Mock

# Import TKA components using standard absolute imports
try:
    from tka.desktop.application.services.data.pictograph_dataset_service import (
        PictographDatasetService,
    )
    from tka.desktop.domain.models.core_models import BeatData

    TKA_IMPORTS_AVAILABLE = True
except ImportError:
    TKA_IMPORTS_AVAILABLE = False


def pytest_configure(config):
    """Configure pytest with TKA workspace setup."""
    if not TKA_IMPORTS_AVAILABLE:
        pytest.exit(
            "TKA imports not available. Make sure you've installed the package with 'pip install -e .'",
            returncode=1,
        )

    # Register custom markers
    config.addinivalue_line("markers", "desktop: Tests for the desktop application")
    config.addinivalue_line("markers", "shared: Tests for shared components")
    config.addinivalue_line("markers", "unit: Fast unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "ui: UI tests requiring Qt")


def pytest_sessionstart(session):
    """Called after the Session object has been created."""
    if session.config.option.verbose >= 1:
        print("\n🚀 TKA unified test environment initialized successfully!")


@pytest.fixture(scope="session")
def tka_workspace_root():
    """Provide the TKA workspace root path."""
    return Path(__file__).parent.parent


@pytest.fixture
def mock_container():
    """Mock dependency injection container."""
    container = Mock()
    container.resolve = Mock()
    return container


@pytest.fixture
def qtbot_with_container(qtbot, mock_container):
    """Extended qtbot with dependency container."""
    qtbot.container = mock_container
    return qtbot


@pytest.fixture
def mock_beat_data():
    """Real beat data for testing using PictographDatasetService."""
    if not TKA_IMPORTS_AVAILABLE:
        return None

    dataset_service = PictographDatasetService()
    beat_data = dataset_service.get_start_position_pictograph(
        "alpha1_alpha1", "diamond"
    )

    # Fallback to empty beat if dataset unavailable
    if not beat_data:
        return BeatData.empty()

    return beat_data


@pytest.fixture
def dummy_conftest_fixture():
    """A simple fixture to test conftest loading."""
    return "hello_from_unified_conftest"
