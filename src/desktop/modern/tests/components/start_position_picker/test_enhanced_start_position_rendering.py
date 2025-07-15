"""
Test Enhanced Start Position Option Rendering

This test verifies that the enhanced start position option can properly:
1. Load pictograph data from the start position data service
2. Create pictograph components from the pool
3. Render pictographs correctly in the UI
4. Handle the complete rendering pipeline
"""

import logging
from unittest.mock import MagicMock, Mock, patch

import pytest
from application.services.pictograph_pool_manager import PictographPoolManager
from core.interfaces.start_position_services import IStartPositionDataService
from domain.models.arrow_data import ArrowData
from domain.models.enums import Location, MotionType, Orientation, RotationDirection
from domain.models.glyph_data import GlyphData
from domain.models.motion_data import MotionData
from domain.models.pictograph_data import PictographData
from presentation.components.start_position_picker.enhanced_start_position_option import (
    EnhancedStartPositionOption,
)
from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import QApplication, QWidget

logger = logging.getLogger(__name__)


@pytest.fixture
def app():
    """Create QApplication for testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app


@pytest.fixture
def mock_pool_manager(app):
    """Create a mock pool manager."""
    pool_manager = Mock(spec=PictographPoolManager)

    # Create a real QWidget as mock component to avoid layout issues
    mock_component = QWidget()
    mock_component.update_from_pictograph_data = Mock()
    mock_component.scene = Mock()
    mock_component.scene.render_pictograph = Mock()

    pool_manager.checkout_pictograph.return_value = mock_component
    return pool_manager


@pytest.fixture
def mock_data_service():
    """Create a mock start position data service."""
    data_service = Mock(spec=IStartPositionDataService)

    # Create sample pictograph data
    sample_data = PictographData(
        arrows={
            "blue": ArrowData(color="blue"),
            "red": ArrowData(color="red"),
        },
        motions={
            "blue": MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH,
                turns=1.0,
            ),
            "red": MotionData(
                motion_type=MotionType.ANTI,
                prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
                start_loc=Location.SOUTH,
                end_loc=Location.NORTH,
                turns=1.0,
            ),
        },
        letter="α",
        glyph_data=GlyphData(
            letter_type="Type1",
            start_position="alpha1",
            end_position="alpha1",
        ),
    )

    data_service.get_position_data.return_value = sample_data
    return data_service


class TestEnhancedStartPositionRendering:
    """Test the enhanced start position option rendering functionality."""

    def test_component_creation_with_services(
        self, app, mock_pool_manager, mock_data_service
    ):
        """Test that the component can be created with proper service injection."""
        option = EnhancedStartPositionOption(
            position_key="alpha1_alpha1",
            pool_manager=mock_pool_manager,
            data_service=mock_data_service,
            grid_mode="diamond",
            enhanced_styling=True,
        )

        assert option.position_key == "alpha1_alpha1"
        assert option.grid_mode == "diamond"
        assert option.data_service == mock_data_service
        assert option._pool_manager == mock_pool_manager

    def test_pictograph_data_loading(self, app, mock_pool_manager, mock_data_service):
        """Test that pictograph data is loaded correctly from the data service."""
        option = EnhancedStartPositionOption(
            position_key="alpha1_alpha1",
            pool_manager=mock_pool_manager,
            data_service=mock_data_service,
            grid_mode="diamond",
        )

        # Verify data service was called with correct parameters
        mock_data_service.get_position_data.assert_called_once_with(
            "alpha1_alpha1", "diamond"
        )

    def test_pictograph_component_checkout(
        self, app, mock_pool_manager, mock_data_service
    ):
        """Test that pictograph component is checked out from pool correctly."""
        option = EnhancedStartPositionOption(
            position_key="alpha1_alpha1",
            pool_manager=mock_pool_manager,
            data_service=mock_data_service,
        )

        # Verify pool manager was called to checkout component
        mock_pool_manager.checkout_pictograph.assert_called_once()

        # Verify component was configured
        mock_component = mock_pool_manager.checkout_pictograph.return_value
        mock_component.setFixedSize.assert_called_once()

    def test_pictograph_component_update(
        self, app, mock_pool_manager, mock_data_service
    ):
        """Test that pictograph component is updated with data correctly."""
        option = EnhancedStartPositionOption(
            position_key="alpha1_alpha1",
            pool_manager=mock_pool_manager,
            data_service=mock_data_service,
        )

        # Verify component was updated with pictograph data
        mock_component = mock_pool_manager.checkout_pictograph.return_value
        mock_component.update_from_pictograph_data.assert_called_once()

        # Get the data that was passed to update
        call_args = mock_component.update_from_pictograph_data.call_args
        pictograph_data = call_args[0][0]

        assert pictograph_data is not None
        assert pictograph_data.letter == "α"
        assert "blue" in pictograph_data.arrows
        assert "red" in pictograph_data.arrows

    def test_rendering_with_no_data(self, app, mock_pool_manager):
        """Test handling when no pictograph data is available."""
        # Create data service that returns None
        empty_data_service = Mock(spec=IStartPositionDataService)
        empty_data_service.get_position_data.return_value = None

        option = EnhancedStartPositionOption(
            position_key="invalid_key",
            pool_manager=mock_pool_manager,
            data_service=empty_data_service,
        )

        # Component should still be created but not updated
        mock_component = mock_pool_manager.checkout_pictograph.return_value
        mock_component.update_from_pictograph_data.assert_not_called()

    def test_rendering_with_pool_failure(self, app, mock_data_service):
        """Test handling when pool manager fails to provide component."""
        # Create pool manager that returns None
        failing_pool_manager = Mock(spec=PictographPoolManager)
        failing_pool_manager.checkout_pictograph.return_value = None

        option = EnhancedStartPositionOption(
            position_key="alpha1_alpha1",
            pool_manager=failing_pool_manager,
            data_service=mock_data_service,
        )

        # Should handle gracefully without crashing
        assert option._pictograph_component is None

    @patch(
        "presentation.components.start_position_picker.enhanced_start_position_option.logger"
    )
    def test_logging_on_pool_failure(self, mock_logger, app, mock_data_service):
        """Test that appropriate warnings are logged on pool failures."""
        failing_pool_manager = Mock(spec=PictographPoolManager)
        failing_pool_manager.checkout_pictograph.return_value = None

        option = EnhancedStartPositionOption(
            position_key="alpha1_alpha1",
            pool_manager=failing_pool_manager,
            data_service=mock_data_service,
        )

        # Verify warning was logged
        mock_logger.warning.assert_called_once()
        warning_message = mock_logger.warning.call_args[0][0]
        assert "Failed to get pictograph component from pool" in warning_message
        assert "alpha1_alpha1" in warning_message


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
