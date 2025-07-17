"""
Tests for ConstructTabLayoutManager before refactoring.
These tests will help ensure we don't break functionality during refactoring.
"""

import sys
from unittest.mock import MagicMock, Mock, patch

import pytest
from core.dependency_injection.di_container import DIContainer
from presentation.tabs.construct.layout_manager import ConstructTabLayoutManager
from PyQt6.QtWidgets import QApplication, QWidget


class TestConstructTabLayoutManager:
    """Test suite for ConstructTabLayoutManager functionality."""

    @pytest.fixture
    def app(self):
        """Create QApplication instance for testing."""
        if not QApplication.instance():
            app = QApplication(sys.argv)
        else:
            app = QApplication.instance()
        yield app

    @pytest.fixture
    def mock_container(self):
        """Create mock DI container."""
        container = Mock(spec=DIContainer)
        container.resolve = Mock(return_value=Mock())
        return container

    @pytest.fixture
    def mock_progress_callback(self):
        """Create mock progress callback."""
        return Mock()

    @pytest.fixture
    def layout_manager(self, mock_container, mock_progress_callback):
        """Create ConstructTabLayoutManager instance."""
        return ConstructTabLayoutManager(
            container=mock_container, progress_callback=mock_progress_callback
        )

    def test_initialization(
        self, layout_manager, mock_container, mock_progress_callback
    ):
        """Test that ConstructTabLayoutManager initializes correctly."""
        assert layout_manager.container == mock_container
        assert layout_manager.progress_callback == mock_progress_callback
        assert layout_manager.workbench is None
        assert layout_manager.picker_stack is None
        assert layout_manager.tab_widget is None
        assert layout_manager.start_position_picker is None
        assert layout_manager.option_picker is None
        assert layout_manager._is_transitioning is False

    def test_initialization_with_animation_orchestrator(self, mock_container):
        """Test initialization when animation orchestrator is available."""
        mock_orchestrator = Mock()
        mock_container.resolve.return_value = mock_orchestrator

        layout_manager = ConstructTabLayoutManager(container=mock_container)

        assert layout_manager.animation_orchestrator == mock_orchestrator

    def test_initialization_without_animation_orchestrator(self, mock_container):
        """Test initialization when animation orchestrator is not available."""
        mock_container.resolve.side_effect = Exception("Service not found")

        layout_manager = ConstructTabLayoutManager(container=mock_container)

        assert layout_manager.animation_orchestrator is None

    @patch("presentation.tabs.construct.layout_manager.create_modern_workbench")
    def test_create_workbench_panel(self, mock_create_workbench, layout_manager, app):
        """Test workbench panel creation."""
        mock_workbench = Mock()
        mock_workbench.get_widget.return_value = QWidget()
        mock_create_workbench.return_value = mock_workbench

        panel = layout_manager._create_workbench_panel()

        assert panel is not None
        assert layout_manager.workbench == mock_workbench
        mock_create_workbench.assert_called_once()

    def test_transition_methods_set_transitioning_flag(self, layout_manager):
        """Test that transition methods properly set the transitioning flag."""
        # Mock the picker_stack to prevent actual UI operations
        layout_manager.picker_stack = Mock()
        layout_manager.picker_stack.currentIndex.return_value = 0
        layout_manager.tab_widget = Mock()

        # Test transition to option picker
        layout_manager.transition_to_option_picker()
        assert layout_manager._is_transitioning is True

    def test_transition_skipped_when_already_transitioning(self, layout_manager):
        """Test that transitions are skipped when already transitioning."""
        layout_manager.picker_stack = Mock()
        layout_manager.picker_stack.currentIndex.return_value = 0
        layout_manager.tab_widget = Mock()
        layout_manager._is_transitioning = True

        # Should not start new transition
        layout_manager.transition_to_option_picker()

        # Verify no transition methods were called
        layout_manager.picker_stack.currentIndex.assert_not_called()

    def test_transition_skipped_when_already_on_target(self, layout_manager):
        """Test that transitions are skipped when already on target index."""
        layout_manager.picker_stack = Mock()
        layout_manager.picker_stack.currentIndex.return_value = (
            1  # Already on option picker
        )
        layout_manager.tab_widget = Mock()
        layout_manager._is_transitioning = False

        # Should not start transition
        layout_manager.transition_to_option_picker()

        # Should still be false
        assert layout_manager._is_transitioning is False

    def test_reset_transition_state(self, layout_manager):
        """Test that transition state is properly reset."""
        layout_manager._is_transitioning = True
        layout_manager._current_animation = Mock()

        layout_manager._reset_transition_state()

        assert layout_manager._is_transitioning is False
        assert layout_manager._current_animation is None

    def test_fallback_transition(self, layout_manager):
        """Test fallback transition when animations fail."""
        layout_manager.picker_stack = Mock()
        layout_manager.picker_stack.currentIndex.return_value = 0

        layout_manager._fallback_transition(2, "test_panel")

        layout_manager.picker_stack.setCurrentIndex.assert_called_once_with(2)

    def test_update_tab_active_state(self, layout_manager):
        """Test tab active state updates correctly."""
        layout_manager.tab_widget = Mock()

        # Test start position picker (panel 0) -> tab 0
        layout_manager._update_tab_active_state(0)
        layout_manager.tab_widget.set_active_tab.assert_called_with(0)

        # Test option picker (panel 1) -> tab 0
        layout_manager._update_tab_active_state(1)
        layout_manager.tab_widget.set_active_tab.assert_called_with(0)

        # Test graph editor (panel 2) -> tab 1
        layout_manager._update_tab_active_state(2)
        layout_manager.tab_widget.set_active_tab.assert_called_with(1)

        # Test generate controls (panel 3) -> tab 2
        layout_manager._update_tab_active_state(3)
        layout_manager.tab_widget.set_active_tab.assert_called_with(2)

    def test_clear_graphics_effects(self, layout_manager):
        """Test graphics effects are cleared properly."""
        mock_widget = Mock()
        mock_widget.setGraphicsEffect = Mock()
        mock_widget.findChildren.return_value = [Mock()]

        layout_manager._clear_graphics_effects([mock_widget])

        # Should call setGraphicsEffect with None
        mock_widget.setGraphicsEffect.assert_called()

    def test_progress_callback_called_during_setup(
        self, mock_container, mock_progress_callback, app
    ):
        """Test that progress callback is called during UI setup."""
        layout_manager = ConstructTabLayoutManager(
            container=mock_container, progress_callback=mock_progress_callback
        )

        parent_widget = QWidget()

        with patch.object(
            layout_manager, "_create_workbench_panel", return_value=QWidget()
        ):
            with patch.object(
                layout_manager,
                "_create_picker_panel_with_progress",
                return_value=QWidget(),
            ):
                with patch.object(
                    layout_manager, "_connect_beat_frame_to_graph_editor"
                ):
                    layout_manager.setup_ui(parent_widget)

        # Verify progress callback was called
        assert mock_progress_callback.call_count > 0

        # Verify specific progress messages
        calls = mock_progress_callback.call_args_list
        progress_messages = [call[0][1] for call in calls]
        assert any("Setting up layout" in msg for msg in progress_messages)
        assert any("Layout complete" in msg for msg in progress_messages)
