"""
Core functionality tests for Enhanced Start Position Picker.

These tests focus on the essential functionality without complex mocking.
"""
import sys
import os
from unittest.mock import Mock, patch

import pytest
from PyQt6.QtWidgets import QApplication, QWidget
from PyQt6.QtCore import Qt
from PyQt6.QtTest import QTest

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'src'))


@pytest.fixture(scope="session")
def qapp():
    """Create QApplication for testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app


@pytest.fixture
def mock_pool_manager():
    """Create a proper mock pool manager."""
    manager = Mock()
    
    def mock_checkout_pictograph(parent=None):
        widget = QWidget(parent)
        widget.update_from_pictograph_data = Mock()
        widget.setFixedSize = Mock()
        widget.setStyleSheet = Mock()
        return widget
    
    manager.checkout_pictograph = mock_checkout_pictograph
    manager.checkin_pictograph = Mock()
    manager.get_start_position_pictographs.return_value = []
    return manager


@pytest.fixture
def mock_dataset_service():
    """Create a mock dataset service."""
    service = Mock()
    service.get_start_position_pictograph_data.return_value = None
    return service


def test_enhanced_picker_creation(qapp, mock_pool_manager):
    """Test that enhanced picker can be created."""
    with patch('application.services.data.dataset_query.DatasetQuery') as mock_dataset, \
         patch('core.service_locator.get_command_processor') as mock_cmd_proc, \
         patch('core.service_locator.get_event_bus') as mock_event_bus:
        
        # Setup mocks
        mock_dataset.return_value = Mock()
        mock_cmd_proc.return_value = Mock()
        mock_event_bus.return_value = Mock()
        
        from presentation.components.start_position_picker.enhanced_start_position_picker import EnhancedStartPositionPicker
        
        picker = EnhancedStartPositionPicker(mock_pool_manager)
        assert picker is not None
        assert hasattr(picker, 'start_position_selected')


def test_variations_button_creation(qapp):
    """Test that variations button can be created."""
    from presentation.components.start_position_picker.variations_button import VariationsButton
    
    # Create a mock parent
    parent = QWidget()
    button = VariationsButton(parent)
    assert button is not None


def test_advanced_picker_creation(qapp, mock_pool_manager):
    """Test that advanced picker can be created."""
    with patch('application.services.data.dataset_query.DatasetQuery') as mock_dataset:
        mock_dataset.return_value = Mock()
        
        from presentation.components.start_position_picker.advanced_start_position_picker import AdvancedStartPositionPicker
        
        picker = AdvancedStartPositionPicker(mock_pool_manager, "diamond")
        assert picker is not None


def test_enhanced_option_creation(qapp, mock_pool_manager):
    """Test that enhanced option can be created."""
    with patch('application.services.data.dataset_query.DatasetQuery') as mock_dataset:
        mock_dataset.return_value = Mock()
        
        from presentation.components.start_position_picker.enhanced_start_position_option import EnhancedStartPositionOption
        
        option = EnhancedStartPositionOption("alpha1_alpha1", mock_pool_manager, "diamond")
        assert option is not None


def test_imports_work():
    """Test that all enhanced components can be imported."""
    try:
        from presentation.components.start_position_picker.enhanced_start_position_picker import EnhancedStartPositionPicker
        from presentation.components.start_position_picker.variations_button import VariationsButton
        from presentation.components.start_position_picker.advanced_start_position_picker import AdvancedStartPositionPicker
        from presentation.components.start_position_picker.enhanced_start_position_option import EnhancedStartPositionOption
        
        # Check that classes exist
        assert EnhancedStartPositionPicker is not None
        assert VariationsButton is not None
        assert AdvancedStartPositionPicker is not None
        assert EnhancedStartPositionOption is not None
        
    except ImportError as e:
        pytest.fail(f"Import failed: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
