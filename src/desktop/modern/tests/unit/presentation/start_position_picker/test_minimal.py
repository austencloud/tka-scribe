"""
Minimal test to isolate PyQt6 issues
"""

import os
import sys
from unittest.mock import MagicMock, Mock

import pytest

# Add the source directory to Python path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "src")
)

from PyQt6.QtCore import Qt
from PyQt6.QtTest import QTest
from PyQt6.QtWidgets import QApplication, QWidget


@pytest.fixture(scope="session")
def qapp():
    """Create QApplication for testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app
    # Don't quit the app here as it might be used by other tests


def test_pyqt6_basic(qapp):
    """Test basic PyQt6 functionality."""
    widget = QWidget()
    widget.show()
    assert widget.isVisible()


def test_import_enhanced_components():
    """Test importing enhanced components."""
    try:
        from presentation.components.start_position_picker.advanced_start_position_picker import (
            AdvancedStartPositionPicker,
        )
        from presentation.components.start_position_picker.enhanced_start_position_option import (
            EnhancedStartPositionOption,
        )
        from presentation.components.start_position_picker.enhanced_start_position_picker import (
            EnhancedStartPositionPicker,
        )
        from presentation.components.start_position_picker.variations_button import (
            VariationsButton,
        )

        assert True
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")


def test_mock_pool_manager_creation(qapp):
    """Test creating enhanced picker with mock pool manager."""
    try:
        from presentation.components.start_position_picker.enhanced_start_position_picker import (
            EnhancedStartPositionPicker,
        )

        # Create mock pool manager that returns real QWidget objects
        mock_pool_manager = Mock()
        mock_pool_manager.get_start_position_pictographs.return_value = []

        # Mock the checkout_pictograph method to return a real QWidget
        def mock_checkout_pictograph(parent=None):
            widget = QWidget(parent)
            widget.update_from_pictograph_data = Mock()  # Mock the update method
            return widget

        mock_pool_manager.checkout_pictograph = mock_checkout_pictograph

        # Try to create the enhanced picker
        picker = EnhancedStartPositionPicker(mock_pool_manager)
        assert picker is not None

    except Exception as e:
        pytest.fail(f"Enhanced picker creation failed: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
