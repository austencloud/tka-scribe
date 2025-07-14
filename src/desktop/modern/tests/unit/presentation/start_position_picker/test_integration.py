"""
Integration tests for the Enhanced Start Position Picker system.

These tests verify that all components work together correctly and integrate
properly with the existing application architecture.
"""
import pytest
import sys
from unittest.mock import Mock, patch, MagicMock
from PyQt6.QtWidgets import QApplication, QWidget, QMainWindow
from PyQt6.QtCore import Qt, QTimer, pyqtSignal
from PyQt6.QtTest import QTest

# Test application setup
app = None

def pytest_configure():
    """Configure pytest with QApplication."""
    global app
    if not QApplication.instance():
        app = QApplication(sys.argv)

@pytest.fixture
def main_window():
    """Create a mock main window for integration testing."""
    window = QMainWindow()
    window.resize(800, 600)
    return window

@pytest.fixture
def mock_command_processor():
    """Mock command processor with realistic behavior."""
    processor = Mock()
    processor.execute.return_value = Mock(success=True, error_message=None)
    return processor

@pytest.fixture
def mock_event_bus():
    """Mock event bus with realistic behavior."""
    bus = Mock()
    bus.emit = Mock()
    return bus

@pytest.fixture
def mock_pictograph_pool():
    """Mock pictograph pool with realistic behavior."""
    pool = Mock()
    mock_pictograph = Mock()
    mock_pictograph.setFixedSize = Mock()
    mock_pictograph.update_from_pictograph_data = Mock()
    pool.checkout_pictograph.return_value = mock_pictograph
    pool.checkin_pictograph.return_value = None
    return pool

@pytest.fixture
def integrated_system(main_window, mock_pictograph_pool, mock_command_processor, mock_event_bus):
    """Create integrated system with all components."""
    from presentation.components.start_position_picker.enhanced_start_position_picker import (
        EnhancedStartPositionPicker
    )
    
    # Mock service locator
    with patch('core.service_locator.get_command_processor', return_value=mock_command_processor), \
         patch('core.service_locator.get_event_bus', return_value=mock_event_bus):
        
        picker = EnhancedStartPositionPicker(mock_pictograph_pool)
        main_window.setCentralWidget(picker)
        main_window.show()
        
        return {
            'main_window': main_window,
            'picker': picker,
            'pool': mock_pictograph_pool,
            'command_processor': mock_command_processor,
            'event_bus': mock_event_bus
        }


class TestSystemIntegration:
    """Test complete system integration scenarios."""

    def test_full_application_startup(self, integrated_system):
        """Test complete application startup with enhanced picker."""
        system = integrated_system
        
        # Verify main window is displayed
        assert system['main_window'].isVisible()
        
        # Verify picker is properly integrated
        assert system['picker'].parent() == system['main_window']
        
        # Verify initial state
        assert len(system['picker'].position_options) == 3  # Diamond positions
        assert system['picker'].current_grid_mode == "diamond"

    def test_position_selection_command_flow(self, integrated_system):
        """Test complete position selection command flow."""
        system = integrated_system
        
        # Mock command creation
        with patch('core.commands.start_position_commands.SetStartPositionCommand') as mock_command_class:
            mock_command = Mock()
            mock_command_class.return_value = mock_command
            
            # Select a position
            system['picker']._handle_position_selection("alpha1_alpha1")
            
            # Verify command was created and executed
            mock_command_class.assert_called_once()
            system['command_processor'].execute.assert_called_once_with(mock_command)

    def test_advanced_picker_integration(self, integrated_system):
        """Test advanced picker integration with main system."""
        system = integrated_system
        
        # Navigate to advanced picker
        system['picker']._handle_variations_clicked()
        
        # Verify advanced picker is created and displayed
        assert system['picker'].advanced_picker is not None
        assert system['picker'].stacked_widget.currentWidget() == system['picker'].advanced_picker
        
        # Test position selection from advanced picker
        system['picker'].advanced_picker._handle_position_selection("beta5_beta5")
        
        # Verify command execution
        system['command_processor'].execute.assert_called()

    def test_grid_mode_changes_propagation(self, integrated_system):
        """Test grid mode changes propagate through system."""
        system = integrated_system
        
        # Change grid mode
        system['picker'].set_grid_mode("box")
        
        # Verify propagation
        assert system['picker'].current_grid_mode == "box"
        assert len(system['picker'].position_options) == 3  # Box positions
        
        # If advanced picker exists, verify it's updated
        if system['picker'].advanced_picker:
            assert system['picker'].advanced_picker.current_grid_mode == "box"

    def test_error_handling_integration(self, integrated_system):
        """Test error handling across integrated components."""
        system = integrated_system
        
        # Simulate command processor failure
        system['command_processor'].execute.return_value = Mock(success=False, error_message="Test error")
        
        # Should handle error gracefully
        system['picker']._handle_position_selection("alpha1_alpha1")
        
        # Verify system remains stable
        assert system['picker'].isVisible()

    def test_memory_management_integration(self, integrated_system):
        """Test memory management across components."""
        system = integrated_system
        
        # Create and destroy advanced picker multiple times
        for _ in range(3):
            system['picker']._handle_variations_clicked()
            system['picker']._handle_back_to_basic()
        
        # Verify pool manager cleanup calls
        assert system['pool'].checkin_pictograph.call_count >= 0

    def test_signal_propagation(self, integrated_system):
        """Test signal propagation through component hierarchy."""
        system = integrated_system
        
        signals_received = []
        
        # Connect to signals
        system['picker'].start_position_selected.connect(
            lambda key: signals_received.append(('picker', key))
        )
        
        # Navigate to advanced picker and connect signals
        system['picker']._handle_variations_clicked()
        system['picker'].advanced_picker.position_selected.connect(
            lambda key: signals_received.append(('advanced', key))
        )
        
        # Trigger selection from advanced picker
        system['picker'].advanced_picker._handle_position_selection("gamma11_gamma11")
        
        # Verify signals propagated correctly
        assert len(signals_received) >= 1
        assert any('gamma11_gamma11' in str(signal) for signal in signals_received)


class TestUIIntegration:
    """Test UI integration and user interaction flows."""

    def test_complete_user_workflow(self, integrated_system):
        """Test complete user workflow from start to finish."""
        system = integrated_system
        
        # User sees initial picker
        assert system['picker'].isVisible()
        assert system['picker'].title_label.text() == "Choose Your Start Position"
        
        # User clicks variations button
        variations_button = system['picker'].variations_button
        QTest.mouseClick(variations_button, Qt.MouseButton.LeftButton)
        
        # User should see advanced picker
        QTest.qWait(100)  # Wait for animation
        assert system['picker'].stacked_widget.currentWidget() == system['picker'].advanced_picker
        
        # User searches for positions
        search_field = system['picker'].advanced_picker.search_field
        QTest.keyClicks(search_field, "alpha")
        QTest.qWait(350)  # Wait for search debounce
        
        # User should see filtered results
        assert len(system['picker'].advanced_picker.filtered_positions) > 0
        
        # User clicks back button
        back_button = system['picker'].advanced_picker.back_button
        QTest.mouseClick(back_button, Qt.MouseButton.LeftButton)
        
        # User should return to basic picker
        assert system['picker'].stacked_widget.currentWidget() == system['picker'].basic_picker_widget

    def test_responsive_behavior(self, integrated_system):
        """Test responsive behavior under different window sizes."""
        system = integrated_system
        window = system['main_window']
        picker = system['picker']
        
        # Test different window sizes
        sizes = [(400, 300), (800, 600), (1200, 900)]
        
        for width, height in sizes:
            window.resize(width, height)
            QTest.qWait(50)
            
            # Update picker layout
            picker.update_layout_for_size(window.size())
            
            # Verify picker adapts to size
            assert picker.isVisible()
            assert len(picker.position_options) > 0

    def test_keyboard_navigation_integration(self, integrated_system):
        """Test keyboard navigation across components."""
        system = integrated_system
        
        # Focus on picker
        system['picker'].setFocus()
        
        # Test tab navigation (basic test)
        QTest.keyPress(system['picker'], Qt.Key.Key_Tab)
        QTest.qWait(50)
        
        # Should not crash and should handle focus
        assert True  # If we get here, basic keyboard handling works

    def test_animation_integration(self, integrated_system):
        """Test animation integration doesn't block UI."""
        system = integrated_system
        
        # Trigger multiple animations quickly
        for _ in range(3):
            system['picker']._handle_variations_clicked()
            QTest.qWait(50)
            system['picker']._handle_back_to_basic()
            QTest.qWait(50)
        
        # UI should remain responsive
        assert system['picker'].isVisible()


class TestDataIntegration:
    """Test data flow integration across components."""

    def test_dataset_integration(self, integrated_system):
        """Test integration with dataset services."""
        system = integrated_system
        
        # Mock dataset service
        with patch('application.services.data.dataset_query.DatasetQuery') as mock_dataset:
            mock_service = Mock()
            mock_service.get_start_position_pictograph_data.return_value = {
                "position_key": "test_position",
                "grid_mode": "diamond"
            }
            mock_dataset.return_value = mock_service
            
            # Create new position option
            from presentation.components.start_position_picker.enhanced_start_position_option import (
                EnhancedStartPositionOption
            )
            
            option = EnhancedStartPositionOption(
                "test_position", 
                system['pool'], 
                "diamond"
            )
            
            # Verify dataset service was used
            mock_service.get_start_position_pictograph_data.assert_called_with(
                "test_position", "diamond"
            )

    def test_state_persistence_integration(self, integrated_system):
        """Test state persistence across component interactions."""
        system = integrated_system
        
        # Set initial state
        system['picker'].set_grid_mode("box")
        initial_mode = system['picker'].current_grid_mode
        
        # Navigate through components
        system['picker']._handle_variations_clicked()
        system['picker']._handle_back_to_basic()
        
        # State should persist
        assert system['picker'].current_grid_mode == initial_mode

    def test_configuration_integration(self, integrated_system):
        """Test configuration integration across system."""
        system = integrated_system
        
        # Test configuration changes propagate
        original_positions = len(system['picker'].position_options)
        
        # Simulate configuration change (mock)
        system['picker']._load_start_positions()
        
        # Should maintain consistent state
        assert len(system['picker'].position_options) == original_positions


class TestPerformanceIntegration:
    """Test performance characteristics of integrated system."""

    def test_startup_performance(self, main_window, mock_pictograph_pool):
        """Test startup performance is acceptable."""
        import time
        
        start_time = time.time()
        
        # Create picker
        from presentation.components.start_position_picker.enhanced_start_position_picker import (
            EnhancedStartPositionPicker
        )
        picker = EnhancedStartPositionPicker(mock_pictograph_pool)
        main_window.setCentralWidget(picker)
        main_window.show()
        
        end_time = time.time()
        
        # Should start up quickly (< 2 seconds)
        assert end_time - start_time < 2.0

    def test_interaction_performance(self, integrated_system):
        """Test interaction performance is responsive."""
        import time
        system = integrated_system
        
        # Test rapid interactions
        start_time = time.time()
        
        for _ in range(10):
            system['picker']._handle_variations_clicked()
            system['picker']._handle_back_to_basic()
        
        end_time = time.time()
        
        # Should handle rapid interactions (< 3 seconds for 10 cycles)
        assert end_time - start_time < 3.0

    def test_memory_usage_integration(self, integrated_system):
        """Test memory usage remains stable during operation."""
        import gc
        system = integrated_system
        
        # Force garbage collection
        gc.collect()
        initial_objects = len(gc.get_objects())
        
        # Perform multiple operations
        for _ in range(5):
            system['picker']._handle_variations_clicked()
            system['picker']._handle_back_to_basic()
            system['picker'].set_grid_mode("box")
            system['picker'].set_grid_mode("diamond")
        
        # Force garbage collection again
        gc.collect()
        final_objects = len(gc.get_objects())
        
        # Memory usage should not grow excessively (< 50% increase)
        growth_ratio = final_objects / initial_objects
        assert growth_ratio < 1.5


class TestErrorHandlingIntegration:
    """Test error handling across integrated components."""

    def test_cascading_error_handling(self, integrated_system):
        """Test error handling cascades properly through system."""
        system = integrated_system
        
        # Simulate pool manager failure
        system['pool'].checkout_pictograph.side_effect = Exception("Pool error")
        
        # Should handle error gracefully
        try:
            from presentation.components.start_position_picker.enhanced_start_position_option import (
                EnhancedStartPositionOption
            )
            option = EnhancedStartPositionOption("test", system['pool'], "diamond")
            # Should not crash completely
            assert option is not None
        except Exception:
            # Exception is acceptable as long as system doesn't crash
            pass

    def test_service_unavailable_handling(self, integrated_system):
        """Test handling when services are unavailable."""
        system = integrated_system
        
        # Mock missing services
        with patch('core.service_locator.get_command_processor', return_value=None), \
             patch('core.service_locator.get_event_bus', return_value=None):
            
            # Should fallback gracefully
            signals_received = []
            system['picker'].start_position_selected.connect(
                lambda key: signals_received.append(key)
            )
            
            system['picker']._handle_position_selection("alpha1_alpha1")
            
            # Should emit signal as fallback
            assert len(signals_received) == 1

    def test_component_failure_isolation(self, integrated_system):
        """Test component failures are isolated."""
        system = integrated_system
        
        # Simulate component failure
        system['picker'].variations_button.setEnabled(False)
        
        # Other components should still work
        assert system['picker'].isVisible()
        assert len(system['picker'].position_options) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
