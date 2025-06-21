"""
Pytest configuration for TKA Desktop tests.
"""

import pytest
from unittest.mock import Mock
from tka.desktop.domain.models.core_models import BeatData


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
    try:
        from tka.desktop.application.services.data.pictograph_dataset_service import (
            PictographDatasetService,
        )

        dataset_service = PictographDatasetService()
        beat_data = dataset_service.get_start_position_pictograph(
            "alpha1_alpha1", "diamond"
        )

        # Fallback to empty beat if dataset unavailable
        if not beat_data:
            return BeatData.empty()

        return beat_data
    except ImportError:
        # If service not available, return empty beat
        return BeatData.empty()


@pytest.fixture
def dummy_conftest_fixture():
    """A simple fixture to test conftest loading."""
    return "hello_from_desktop_conftest"
