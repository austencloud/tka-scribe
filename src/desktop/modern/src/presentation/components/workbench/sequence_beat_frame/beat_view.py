"""
Modern Beat View Component

Individual beat widget for the Modern sequence workbench, replacing Legacy's BeatView
with modern architecture patterns and Modern pictograph integration.
"""

from typing import Optional

from PyQt6.QtCore import pyqtSignal
from PyQt6.QtGui import QColor, QPainter, QPen

from domain.models.core_models import BeatData
from .pictograph_view_base import PictographViewBase
from .start_text_overlay import StartTextOverlay
from .beat_number_overlay import BeatNumberOverlay, add_beat_number_to_view


class BeatView(PictographViewBase):
    """
    Modern beat view widget with Modern pictograph integration.

    Replaces Legacy's BeatView with:
    - Clean separation of concerns
    - Modern pictograph rendering integration
    - Modern PyQt6 patterns
    - Responsive design
    """

    # Additional signals specific to beat view
    beat_clicked = pyqtSignal()
    beat_modified = pyqtSignal(object)  # BeatData object
    beat_context_menu = pyqtSignal()

    def __init__(self, beat_number: int, parent=None):
        # Beat-specific properties
        self._beat_number = beat_number

        # START text overlay for preserved start position beat
        self._start_text_overlay: Optional[StartTextOverlay] = None
        self._show_start_text = False

        # Beat number overlay for sequence beats
        self._beat_number_overlay: Optional[BeatNumberOverlay] = None
        self._show_beat_number = False

        super().__init__(parent)

    def _configure_pictograph_component(self):
        """Configure the pictograph component for beat view context"""
        # CRITICAL FIX: Set proper scaling context for beat frame
        from application.services.ui.context_aware_scaling_service import (
            ScalingContext,
        )

        self._pictograph_component.set_scaling_context(ScalingContext.BEAT_VIEW)

        # CRITICAL FIX: Disable borders in beat frame context (like Legacy)
        # Beat frames should be borderless, unlike option pickers which show colored borders
        self._pictograph_component.disable_borders()

    # Public API
    def get_beat_data(self) -> Optional[BeatData]:
        """Get the current beat data"""
        return self._beat_data

    def get_beat_number(self) -> int:
        """Get the beat number"""
        return self._beat_number

    def _update_text_overlays(self):
        """Update text overlays - shows start text or beat number overlay"""
        # Update START text overlay (mutual exclusivity with beat content)
        self._update_start_text_overlay()

        # Update beat number overlay
        self._update_beat_number_overlay()

    def set_start_text_visible(self, visible: bool):
        """Set whether START text overlay should be visible (for preserved start position beat)"""
        if self._show_start_text != visible:
            self._show_start_text = visible
            self._update_start_text_overlay()

    def is_start_text_visible(self) -> bool:
        """Check if START text overlay is visible"""
        return self._show_start_text

    def set_beat_number_visible(self, visible: bool):
        """Set whether beat number overlay should be visible"""
        if self._show_beat_number != visible:
            self._show_beat_number = visible
            self._update_beat_number_overlay()

    def is_beat_number_visible(self) -> bool:
        """Check if beat number overlay is visible"""
        return self._show_beat_number

    # Display updates
    def _update_display(self):
        """Update the visual display based on beat data"""
        if not self._beat_data:
            self._show_empty_state()
            return

        # No beat label in legacy - beat numbers are rendered on the pictograph scene
        # Update pictograph with beat data
        self._update_pictograph()

    def _update_pictograph(self):
        """Update pictograph display using Modern pictograph component"""
        if not self._beat_data or not self._pictograph_component:
            return

        # Update the pictograph component with beat data
        self._pictograph_component.update_from_beat(self._beat_data)

        # Update START text overlay (mutual exclusivity with beat content)
        self._update_start_text_overlay()

        # Update beat number overlay
        self._update_beat_number_overlay()

    def _show_empty_state(self):
        """Show empty state when no beat data"""
        # No beat label in legacy - just clear the pictograph

        # Clear pictograph component
        if self._pictograph_component:
            self._pictograph_component.clear_pictograph()

        # Update START text overlay if needed
        self._update_start_text_overlay()

    def _update_start_text_overlay(self):
        """Update START text overlay based on current state"""
        if not self._pictograph_component or not self._pictograph_component.scene:
            return

        # Clean up existing overlay
        self._cleanup_start_text_overlay()

        # Show START text if enabled (for preserved start position beat)
        if self._show_start_text:
            try:
                # Create overlay with scene as parent for Qt lifecycle management
                self._start_text_overlay = StartTextOverlay(
                    self._pictograph_component.scene
                )

                # Set the BeatView as the widget parent for proper cleanup
                self._start_text_overlay.setParent(self)

                self._start_text_overlay.show_start_text()
            except Exception as e:
                print(f"Failed to create START text overlay on beat: {e}")
                self._start_text_overlay = None

    def _cleanup_start_text_overlay(self):
        """Safely cleanup existing START text overlay"""
        if not self._start_text_overlay:
            return

        # Mark as invalid immediately to prevent further access
        if hasattr(self._start_text_overlay, "_is_valid"):
            self._start_text_overlay._is_valid = False

        # Clear our reference and let Qt's garbage collection handle the rest
        self._start_text_overlay = None

    def _update_beat_number_overlay(self):
        """Update beat number overlay based on current state"""
        # Clean up existing overlay
        self._cleanup_beat_number_overlay()

        # Show beat number if enabled and we have beat data (mutual exclusivity with START text)
        if self._show_beat_number and self._beat_data and not self._show_start_text:
            try:
                self._beat_number_overlay = add_beat_number_to_view(
                    self, self._beat_number
                )
            except Exception as e:
                print(
                    f"Failed to create beat number overlay on beat {self._beat_number}: {e}"
                )
                self._beat_number_overlay = None

    def _cleanup_beat_number_overlay(self):
        """Safely cleanup existing beat number overlay"""
        if not self._beat_number_overlay:
            return

        try:
            # Hide and delete the overlay
            self._beat_number_overlay.hide_beat_number()
            self._beat_number_overlay.deleteLater()
        except Exception as e:
            print(f"Error cleaning up beat number overlay: {e}")
        finally:
            self._beat_number_overlay = None

    # Override mouse press to emit specific signals
    def mousePressEvent(self, event):
        """Handle mouse press events"""
        from PyQt6.QtCore import Qt

        if event.button() == Qt.MouseButton.LeftButton:
            self.beat_clicked.emit()
        elif event.button() == Qt.MouseButton.RightButton:
            self.beat_context_menu.emit()

        # Also emit the base class signal
        super().mousePressEvent(event)

    def paintEvent(self, event):
        """Custom paint event for additional visual effects"""
        super().paintEvent(event)

        # Add selection indicator if selected
        if self._is_selected:
            painter = QPainter(self)
            painter.setRenderHint(QPainter.RenderHint.Antialiasing)

            # Draw selection indicator in top-right corner
            pen = QPen(QColor(74, 144, 226), 3)
            painter.setPen(pen)

            # Draw a small circle indicator
            indicator_size = 8
            x = self.width() - indicator_size - 4
            y = 4
            painter.drawEllipse(x, y, indicator_size, indicator_size)

    def _update_overlay_scaling(self):
        """Update scaling for all text overlays"""
        # Update beat number overlay scaling
        if self._beat_number_overlay and hasattr(
            self._beat_number_overlay, "update_scaling"
        ):
            self._beat_number_overlay.update_scaling()

        # Update START text overlay scaling
        if self._start_text_overlay and hasattr(
            self._start_text_overlay, "update_scaling"
        ):
            self._start_text_overlay.update_scaling()

    # Accessibility support
    def setAccessibleName(self, name: str):
        """Set accessible name for screen readers"""
        super().setAccessibleName(name)
        if self._beat_data:
            accessible_desc = f"Beat {self._beat_number}, Letter {self._beat_data.letter}, Duration {self._beat_data.duration}"
        else:
            accessible_desc = f"Empty beat slot {self._beat_number}"
        self.setAccessibleDescription(accessible_desc)

    # Cleanup and lifecycle management
    def cleanup(self):
        """Cleanup resources when the view is being destroyed"""
        self._cleanup_start_text_overlay()
        self._cleanup_beat_number_overlay()
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
