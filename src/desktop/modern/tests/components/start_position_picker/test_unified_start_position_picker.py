"""
Basic test for UnifiedStartPositionPicker to verify service integration.

This test ensures the unified component can be properly instantiated with
all required services and basic functionality works.
"""

import pytest
from unittest.mock import Mock, MagicMock
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QSize

from presentation.components.start_position_picker.unified_start_position_picker import (
    UnifiedStartPositionPicker, PickerMode
)


class TestUnifiedStartPositionPicker:
    """Test the unified start position picker component."""
    
    @pytest.fixture
    def mock_services(self):
        """Create mock services for testing."""
        pool_manager = Mock()
        pool_manager.checkout_pictograph.return_value = Mock()
        
        data_service = Mock()
        data_service.get_position_data.return_value = Mock()
        
        selection_service = Mock()
        selection_service.validate_selection.return_value = True
        
        ui_service = Mock()
        ui_service.get_positions_for_mode.return_value = ["alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"]
        ui_service.calculate_option_size.return_value = 120
        
        orchestrator = Mock()
        orchestrator.handle_position_selection.return_value = True
        
        return {
            'pool_manager': pool_manager,
            'data_service': data_service,
            'selection_service': selection_service,
            'ui_service': ui_service,
            'orchestrator': orchestrator
        }
    
    def test_component_initialization(self, mock_services, qtbot):
        """Test that the component initializes properly with services."""
        picker = UnifiedStartPositionPicker(
            pool_manager=mock_services['pool_manager'],
            data_service=mock_services['data_service'],
            selection_service=mock_services['selection_service'],
            ui_service=mock_services['ui_service'],
            orchestrator=mock_services['orchestrator'],
            initial_mode=PickerMode.BASIC
        )
        
        qtbot.addWidget(picker)
        
        assert picker is not None
        assert picker.current_mode == PickerMode.BASIC
        assert picker.grid_mode == "diamond"
    
    def test_mode_switching(self, mock_services, qtbot):
        """Test mode switching functionality."""
        picker = UnifiedStartPositionPicker(
            pool_manager=mock_services['pool_manager'],
            data_service=mock_services['data_service'],
            selection_service=mock_services['selection_service'],
            ui_service=mock_services['ui_service'],
            orchestrator=mock_services['orchestrator'],
            initial_mode=PickerMode.BASIC
        )
        
        qtbot.addWidget(picker)
        
        # Test switching to advanced mode
        picker.set_mode(PickerMode.ADVANCED)
        assert picker.current_mode == PickerMode.ADVANCED
        
        # Test switching back to basic mode
        picker.set_mode(PickerMode.BASIC)
        assert picker.current_mode == PickerMode.BASIC
    
    def test_grid_mode_toggle(self, mock_services, qtbot):
        """Test grid mode toggle functionality."""
        picker = UnifiedStartPositionPicker(
            pool_manager=mock_services['pool_manager'],
            data_service=mock_services['data_service'],
            selection_service=mock_services['selection_service'],
            ui_service=mock_services['ui_service'],
            orchestrator=mock_services['orchestrator'],
            initial_mode=PickerMode.BASIC
        )
        
        qtbot.addWidget(picker)
        
        # Initial grid mode should be diamond
        assert picker.grid_mode == "diamond"
        
        # Toggle to box
        picker._toggle_grid_mode()
        assert picker.grid_mode == "box"
        
        # Toggle back to diamond
        picker._toggle_grid_mode()
        assert picker.grid_mode == "diamond"
    
    def test_service_calls(self, mock_services, qtbot):
        """Test that services are called correctly."""
        picker = UnifiedStartPositionPicker(
            pool_manager=mock_services['pool_manager'],
            data_service=mock_services['data_service'],
            selection_service=mock_services['selection_service'],
            ui_service=mock_services['ui_service'],
            orchestrator=mock_services['orchestrator'],
            initial_mode=PickerMode.BASIC
        )
        
        qtbot.addWidget(picker)
        
        # Verify UI service was called for positions
        mock_services['ui_service'].get_positions_for_mode.assert_called()
        
        # Test position selection
        picker._handle_position_selection("alpha1_alpha1")
        mock_services['orchestrator'].handle_position_selection.assert_called_with("alpha1_alpha1")
    
    def test_layout_size_update(self, mock_services, qtbot):
        """Test layout updates for different container sizes."""
        picker = UnifiedStartPositionPicker(
            pool_manager=mock_services['pool_manager'],
            data_service=mock_services['data_service'],
            selection_service=mock_services['selection_service'],
            ui_service=mock_services['ui_service'],
            orchestrator=mock_services['orchestrator'],
            initial_mode=PickerMode.AUTO
        )
        
        qtbot.addWidget(picker)
        
        # Test large container size (should switch to advanced)
        large_size = QSize(1200, 800)
        picker.update_layout_for_size(large_size)
        assert picker.current_mode == PickerMode.ADVANCED
        
        # Test small container size (should switch to basic)
        small_size = QSize(600, 400)
        picker.update_layout_for_size(small_size)
        assert picker.current_mode == PickerMode.BASIC
    
    def test_signals(self, mock_services, qtbot):
        """Test that signals are emitted correctly."""
        picker = UnifiedStartPositionPicker(
            pool_manager=mock_services['pool_manager'],
            data_service=mock_services['data_service'],
            selection_service=mock_services['selection_service'],
            ui_service=mock_services['ui_service'],
            orchestrator=mock_services['orchestrator'],
            initial_mode=PickerMode.BASIC
        )
        
        qtbot.addWidget(picker)
        
        # Test position selection signal
        with qtbot.waitSignal(picker.position_selected, timeout=1000):
            picker._handle_position_selection("alpha1_alpha1")
        
        # Test mode change signal
        with qtbot.waitSignal(picker.mode_changed, timeout=1000):
            picker.set_mode(PickerMode.ADVANCED)


if __name__ == "__main__":
    pytest.main([__file__])
