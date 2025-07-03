"""
Start Position View Component

Displays the start position in the sequence workbench beat frame,
integrating with Modern's start position picker and pictograph system.
"""

from typing import Optional

from domain.models.core_models import BeatData
from PyQt6.QtCore import pyqtSignal

from .pictograph_view_base import PictographViewBase
from .start_text_overlay import StartTextOverlay, add_start_text_to_view


class StartPositionView(PictographViewBase):
    """
    Start position display widget for the sequence workbench.

    Shows the initial position of a sequence with pictograph rendering
    and integrates with the Modern start position picker workflow.
    """

    # Additional signals specific to start position
    start_pos_beat_clicked = pyqtSignal()
    start_pos_beat_context_menu = pyqtSignal()

    def __init__(self, parent=None):
        # Additional state specific to start position
        self._position_key: Optional[str] = None
        self._start_text_overlay: Optional[StartTextOverlay] = None

        super().__init__(parent)

    def _configure_pictograph_component(self):
        """Configure the pictograph component for start position context"""
        if hasattr(self._pictograph_component, "set_scaling_context"):
            from application.services.ui.context_aware_scaling_service import (
                ScalingContext,
            )

            self._pictograph_component.set_scaling_context(
                ScalingContext.START_POS_PICKER
            )

        # Disable borders for start position view
        self._pictograph_component.disable_borders()

    def _setup_styling(self):
        """Apply start position specific styling - inherits base overlay system"""
        # Use the base class styling for consistency with beat views
        # This ensures identical selection/hover behavior
        super()._setup_styling()

    def _initialize_start_text_widget(self):
        """Initialize START text widget overlay after component is ready"""
        self._add_start_text_overlay()

    def set_position_data(self, beat_data: BeatData):
        """Set the start position data and update display"""
        self.set_beat_data(beat_data)

    def set_position_key(self, position_key: str):
        """Set the position key (e.g., 'alpha1', 'beta3')"""
        self._position_key = position_key

    def _update_text_overlays(self):
        """Update text overlays - shows start text overlay"""
        self._add_start_text_overlay()

    def _add_start_text_overlay(self):
        """Add START text overlay using the unified widget approach"""
        self._cleanup_existing_overlay()

        try:
            self._start_text_overlay = add_start_text_to_view(self)
            if self._start_text_overlay:
                self._text_overlays = [self._start_text_overlay]
        except Exception as e:
            print(f"Failed to create start text overlay: {e}")
            self._start_text_overlay = None

    def _cleanup_existing_overlay(self):
        """Safely cleanup existing overlay"""
        if not self._start_text_overlay:
            return

        try:
            self._start_text_overlay.hide_overlay()
            self._start_text_overlay.deleteLater()
        except Exception as e:
            print(f"Error cleaning up start text overlay: {e}")
        finally:
            self._start_text_overlay = None
            self._text_overlays.clear()

    # Override mouse press to emit specific signals
    def mousePressEvent(self, event):
        """Handle mouse press events"""
        from PyQt6.QtCore import Qt

        if event.button() == Qt.MouseButton.LeftButton:
            self.start_pos_beat_clicked.emit()
        elif event.button() == Qt.MouseButton.RightButton:
            self.start_pos_beat_context_menu.emit()

        # Also emit the base class signal
        super().mousePressEvent(event)
        self._update_display()

    def get_position_data(self) -> Optional[BeatData]:
        """Get the current position data"""
        return self._beat_data

    def get_position_key(self) -> Optional[str]:
        """Get the current position key"""
        return self._position_key

    def clear_position_data(self):
        """Clear position data and show only START text (V1-style clear behavior)"""
        self._beat_data = None
        self._position_key = None
        self._show_cleared_state()

        self.show()
        self.setVisible(True)

        parent = self.parent()
        parent_visible = parent.isVisible() if parent else "No parent"

        print(
            f"🔍 [START_POSITION_VIEW] Position cleared: visible={self.isVisible()}, size={self.size()}, parent_visible={parent_visible}"
        )

    def _update_display(self):
        """Update the visual display based on position data"""
        if not self._beat_data and not self._position_key:
            self._show_empty_state()
            return

        self._update_pictograph()

    def _update_pictograph(self):
        """Update pictograph display using Modern pictograph component with START text overlay"""
        if not self._pictograph_component:
            return

        self._mark_overlay_invalid()

        if self._beat_data:

            self._pictograph_component.update_from_beat(self._beat_data)
        else:

            self._pictograph_component.clear_pictograph()

        self._add_start_text_overlay()

    def _show_empty_state(self):
        """Show empty state when no position data"""

        self._mark_overlay_invalid()

        if self._pictograph_component:
            self._pictograph_component.clear_pictograph()

        self._add_start_text_overlay()

    def _show_cleared_state(self):
        """Show cleared state - ONLY START text, no pictograph content (V1 behavior)"""

        self._mark_overlay_invalid()

        if self._pictograph_component:
            self._pictograph_component.clear_pictograph()

            if (
                hasattr(self._pictograph_component, "scene")
                and self._pictograph_component.scene
            ):

                self._pictograph_component.scene.clear()

        self._add_start_text_overlay()

    def _initialize_start_text_widget(self):
        """Initialize START text widget overlay after component is ready"""

        self._add_start_text_overlay()

    def _add_start_text_overlay(self):
        """Add START text overlay using the unified widget approach"""

        self._cleanup_existing_overlay()

        try:
            self._start_text_overlay = add_start_text_to_view(self)
        except Exception as e:
            print(f"Failed to create start text overlay: {e}")
            self._start_text_overlay = None

    def _mark_overlay_invalid(self):
        """Mark the existing overlay as invalid before scene operations"""
        # No longer needed with unified widget approach - just cleanup
        self._cleanup_existing_overlay()

    def _cleanup_existing_overlay(self):
        """Safely cleanup existing overlay"""
        if not self._start_text_overlay:
            return

        try:
            self._start_text_overlay.hide_overlay()
            self._start_text_overlay.deleteLater()
        except Exception as e:
            print(f"Error cleaning up start text overlay: {e}")
        finally:
            self._start_text_overlay = None

    def resizeEvent(self, event):
        """Handle resize events and update overlay scaling"""
        super().resizeEvent(event)

        self._update_overlay_scaling()

    def _update_overlay_scaling(self):
        """Update scaling for START text overlay"""
        if self._start_text_overlay and hasattr(
            self._start_text_overlay, "update_scaling"
        ):
            self._start_text_overlay.update_scaling()

    def setAccessibleName(self, name: str):
        """Set accessible name for screen readers"""
        super().setAccessibleName(name)
        if self._position_key:
            accessible_desc = f"Start position {self._position_key}"
        elif self._beat_data:
            accessible_desc = f"Start position with letter {self._beat_data.letter}"
        else:
            accessible_desc = "Start position not set, click to select"
        self.setAccessibleDescription(accessible_desc)

    def keyPressEvent(self, event):
        """Handle keyboard events"""
        from PyQt6.QtCore import Qt

        if event.key() == Qt.Key.Key_Return or event.key() == Qt.Key.Key_Enter:
            self.start_pos_beat_clicked.emit()
        super().keyPressEvent(event)

    def cleanup(self):
        """Cleanup resources when the view is being destroyed"""
        self._cleanup_existing_overlay()
        super().cleanup()

    def closeEvent(self, event):
        """Handle close event to cleanup resources"""
        self.cleanup()
        super().closeEvent(event)

    def __del__(self):
        """Destructor to ensure cleanup"""
        try:
            self.cleanup()
        except Exception:

            pass

    def pulse_animation(self):
        """Pulse animation to draw attention to start position"""

    def set_loading_state(self, loading: bool):
        """Set loading state while position is being processed"""
        if loading:

            pass
        else:
            self._update_display()
