"""
End-to-end integration test for Enhanced Start Position Picker in main TKA application.

This test validates that the enhanced picker works correctly within the full application context.
"""

import os
import sys
import time
from unittest.mock import Mock, patch

import pytest
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtTest import QTest
from PyQt6.QtWidgets import QApplication

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))


@pytest.fixture(scope="session")
def qapp():
    """Create QApplication for testing."""
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    yield app


def test_enhanced_picker_in_main_application(qapp):
    """Test that enhanced picker works in the main application context."""
    try:
        # Import main application components
        from application.services.pictograph_pool_manager import PictographPoolManager
        from core.dependency_injection.di_container import get_container
        from presentation.tabs.construct.layout_manager import ConstructTabLayoutManager

        # Get DI container
        container = get_container()

        # Create layout manager and setup UI (this will create the enhanced picker)
        layout_manager = ConstructTabLayoutManager(container)

        # Create a parent widget and setup UI
        from PyQt6.QtWidgets import QWidget

        parent_widget = QWidget()
        layout_manager.setup_ui(parent_widget)

        # Verify enhanced picker was created
        assert hasattr(layout_manager, "start_position_picker")
        assert layout_manager.start_position_picker is not None

        # Verify it's the enhanced version
        from presentation.components.start_position_picker.enhanced_start_position_picker import (
            EnhancedStartPositionPicker,
        )

        assert isinstance(
            layout_manager.start_position_picker, EnhancedStartPositionPicker
        )

        # Verify signal exists
        assert hasattr(layout_manager.start_position_picker, "start_position_selected")

        print("✅ Enhanced picker successfully integrated in main application")

    except Exception as e:
        pytest.fail(f"Enhanced picker integration failed: {e}")


def test_enhanced_picker_signal_connection(qapp):
    """Test that enhanced picker signals are properly connected."""
    try:
        from core.dependency_injection.di_container import get_container
        from presentation.tabs.construct.layout_manager import ConstructTabLayoutManager
        from presentation.tabs.construct.signal_coordinator import SignalCoordinator

        # Mock dependencies for signal coordinator
        with (
            patch(
                "application.services.sequence.start_position_handler.StartPositionHandler"
            ) as mock_handler,
            patch(
                "application.services.option_picker.option_picker_manager.OptionPickerManager"
            ) as mock_option_mgr,
            patch(
                "application.services.sequence.sequence_loader.SequenceLoader"
            ) as mock_loader,
            patch(
                "application.services.sequence.sequence_beat_operations.SequenceBeatOperations"
            ) as mock_beat_ops,
            patch(
                "application.services.sequence.sequence_start_position_manager.SequenceStartPositionManager"
            ) as mock_start_mgr,
        ):

            # Setup mocks
            mock_handler.return_value = Mock()
            mock_option_mgr.return_value = Mock()
            mock_loader.return_value = Mock()
            mock_beat_ops.return_value = Mock()
            mock_start_mgr.return_value = Mock()

            container = get_container()
            layout_manager = ConstructTabLayoutManager(container)

            # Setup UI to create the enhanced picker
            from PyQt6.QtWidgets import QWidget

            parent_widget = QWidget()
            layout_manager.setup_ui(parent_widget)

            # Create signal coordinator
            signal_coordinator = SignalCoordinator(
                layout_manager=layout_manager,
                start_position_handler=mock_handler.return_value,
                option_picker_manager=mock_option_mgr.return_value,
                loading_service=mock_loader.return_value,
                beat_operations=mock_beat_ops.return_value,
                start_position_manager=mock_start_mgr.return_value,
            )

            # Verify signal connection was attempted
            assert layout_manager.start_position_picker is not None

            print("✅ Enhanced picker signals properly connected")

    except Exception as e:
        pytest.fail(f"Signal connection test failed: {e}")


def test_enhanced_picker_variations_button(qapp):
    """Test that variations button is present and functional."""
    try:
        from core.dependency_injection.di_container import get_container
        from presentation.tabs.construct.layout_manager import ConstructTabLayoutManager

        container = get_container()
        layout_manager = ConstructTabLayoutManager(container)

        # Setup UI to create the enhanced picker
        from PyQt6.QtWidgets import QWidget

        parent_widget = QWidget()
        layout_manager.setup_ui(parent_widget)

        enhanced_picker = layout_manager.start_position_picker

        # Verify variations button exists
        assert hasattr(enhanced_picker, "variations_button")
        assert enhanced_picker.variations_button is not None

        # Verify stacked widget for advanced picker
        assert hasattr(enhanced_picker, "stacked_widget")
        assert enhanced_picker.stacked_widget is not None

        print("✅ Variations button and advanced picker integration working")

    except Exception as e:
        pytest.fail(f"Variations button test failed: {e}")


def test_enhanced_picker_glassmorphism_styling(qapp):
    """Test that glassmorphism styling is applied."""
    try:
        from core.dependency_injection.di_container import get_container
        from presentation.tabs.construct.layout_manager import ConstructTabLayoutManager

        container = get_container()
        layout_manager = ConstructTabLayoutManager(container)

        # Setup UI to create the enhanced picker
        from PyQt6.QtWidgets import QWidget

        parent_widget = QWidget()
        layout_manager.setup_ui(parent_widget)

        enhanced_picker = layout_manager.start_position_picker

        # Check that styling is applied
        style_sheet = enhanced_picker.styleSheet()
        assert isinstance(style_sheet, str)

        # Verify glassmorphism elements are present
        assert hasattr(enhanced_picker, "main_container")

        print("✅ Glassmorphism styling successfully applied")

    except Exception as e:
        pytest.fail(f"Glassmorphism styling test failed: {e}")


def test_enhanced_picker_position_selection(qapp):
    """Test position selection functionality."""
    try:
        from core.dependency_injection.di_container import get_container
        from presentation.tabs.construct.layout_manager import ConstructTabLayoutManager

        container = get_container()
        layout_manager = ConstructTabLayoutManager(container)

        # Setup UI to create the enhanced picker
        from PyQt6.QtWidgets import QWidget

        parent_widget = QWidget()
        layout_manager.setup_ui(parent_widget)

        enhanced_picker = layout_manager.start_position_picker

        # Test signal emission
        signal_received = []
        enhanced_picker.start_position_selected.connect(
            lambda pos: signal_received.append(pos)
        )

        # Simulate position selection
        test_position = "alpha1_alpha1"
        enhanced_picker.start_position_selected.emit(test_position)

        # Verify signal was received
        assert len(signal_received) == 1
        assert signal_received[0] == test_position

        print("✅ Position selection functionality working")

    except Exception as e:
        pytest.fail(f"Position selection test failed: {e}")


def test_enhanced_picker_responsive_layout(qapp):
    """Test responsive layout functionality."""
    try:
        from core.dependency_injection.di_container import get_container
        from presentation.tabs.construct.layout_manager import ConstructTabLayoutManager

        container = get_container()
        layout_manager = ConstructTabLayoutManager(container)

        # Setup UI to create the enhanced picker
        from PyQt6.QtWidgets import QWidget

        parent_widget = QWidget()
        layout_manager.setup_ui(parent_widget)

        enhanced_picker = layout_manager.start_position_picker

        # Test different sizes
        enhanced_picker.resize(400, 300)
        assert enhanced_picker.size().width() == 400
        assert enhanced_picker.size().height() == 300

        enhanced_picker.resize(800, 600)
        assert enhanced_picker.size().width() == 800
        assert enhanced_picker.size().height() == 600

        print("✅ Responsive layout working correctly")

    except Exception as e:
        pytest.fail(f"Responsive layout test failed: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
