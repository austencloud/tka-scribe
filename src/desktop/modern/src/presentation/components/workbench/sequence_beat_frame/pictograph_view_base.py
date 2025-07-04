"""
Pictograph View Base Component

Base class for views that display pictographs with text overlays in the sequence workbench.
Provides common functionality for BeatView and StartPositionView.
"""

from typing import Optional

from domain.models.core_models import BeatData
from PyQt6.QtCore import QSize, Qt, pyqtSignal
from PyQt6.QtGui import QMouseEvent
from PyQt6.QtWidgets import QFrame, QVBoxLayout, QWidget

from ...pictograph.pictograph_component import PictographComponent
from .text_overlay_base import TextOverlayBase
from .selection_overlay import SelectionOverlay


class PictographViewBase(QFrame):
    """
    Base class for pictograph views in the sequence workbench.

    Provides common functionality for:
    - Pictograph component management
    - Text overlay handling with hover scaling
    - Selection and highlighting state
    - Mouse event handling
    - Styling and cursor management
    """

    # Common signals - subclasses can add their own
    clicked = pyqtSignal()
    context_menu = pyqtSignal()
    selection_changed = pyqtSignal(bool)  # Emitted when selection state changes

    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)

        # Common state
        self._beat_data: Optional[BeatData] = None
        self._is_selected = False
        self._is_highlighted = False
        self._is_pressed = False

        # Common UI components
        self._pictograph_component: Optional[PictographComponent] = None
        self._text_overlays: list[TextOverlayBase] = []
        self._selection_overlay: Optional["SelectionOverlay"] = None

        # Initialize UI
        self._setup_ui()
        self._setup_styling()

        # Create selection overlay
        self._create_selection_overlay()

    def _setup_ui(self):
        """Setup the common UI structure"""
        self.setFixedSize(120, 120)
        self.setFrameStyle(QFrame.Shape.Box)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Create pictograph component
        self._pictograph_component = PictographComponent(parent=self)
        self._configure_pictograph_component()
        layout.addWidget(self._pictograph_component)

        # Enable mouse tracking for hover effects
        self.setMouseTracking(True)

    def _configure_pictograph_component(self):
        """Configure the pictograph component - implemented by subclasses"""
        # Default implementation - subclasses should override
        pass

    def _setup_styling(self):
        """Setup clean base styling without any borders or effects"""
        self.setStyleSheet(
            """
            QFrame {
                background: transparent;
                border: none;
            }
            QFrame:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            QLabel {
                color: rgba(255, 255, 255, 0.9);
                background: transparent;
                border: none;
            }
        """
        )

        # Disable Qt's default focus behavior
        self.setFocusPolicy(Qt.FocusPolicy.NoFocus)

    def _create_selection_overlay(self):
        """Create the selection overlay widget"""
        self._selection_overlay = SelectionOverlay(self)
        self._selection_overlay.hide()

    # State management
    def set_beat_data(self, beat_data: Optional[BeatData]):
        """Set beat data and update display"""
        if self._beat_data != beat_data:
            self._beat_data = beat_data
            self._update_display()

    def get_beat_data(self) -> Optional[BeatData]:
        """Get current beat data"""
        return self._beat_data

    def set_selected(self, selected: bool):
        """Set selection state - simple legacy style"""
        if self._is_selected != selected:
            self._is_selected = selected
            self._update_cursor()

            # Show/hide selection overlay - simple gold border only
            if selected:
                self._selection_overlay.show_selection()
            else:
                self._selection_overlay.hide_selection()

            # Emit signal for external listeners
            self.selection_changed.emit(selected)

    def is_selected(self) -> bool:
        """Check if view is selected"""
        return self._is_selected

    def set_highlighted(self, highlighted: bool):
        """Set highlight state - simple legacy style (no visual changes)"""
        if self._is_highlighted != highlighted:
            self._is_highlighted = highlighted
            # No visual changes for hover - just cursor changes in enter/leave events

            # Update background styling for subtle hover effect
            self._update_highlight_style()

    def is_highlighted(self) -> bool:
        """Check if view is highlighted"""
        return self._is_highlighted

    # Display updates
    def _update_display(self):
        """Update the visual display based on beat data"""
        if not self._beat_data:
            self._show_empty_state()
            return

        self._update_pictograph()

    def _update_pictograph(self):
        """Update pictograph display"""
        if not self._pictograph_component:
            return

        if self._beat_data:
            self._pictograph_component.update_from_beat(self._beat_data)
        else:
            self._pictograph_component.clear_pictograph()

        # Update text overlays
        self._update_text_overlays()

    def _show_empty_state(self):
        """Show empty state when no beat data"""
        if self._pictograph_component:
            self._pictograph_component.clear_pictograph()

        self._update_text_overlays()

    def _update_text_overlays(self):
        """Update text overlays - implemented by subclasses"""
        # Default implementation - subclasses should override
        pass

    def _update_highlight_style(self):
        """Update styling based on highlight state - simple approach"""
        if self._is_highlighted and not self._is_selected:
            self.setStyleSheet(
                """
                QFrame {
                    background: rgba(255, 255, 255, 0.15);
                    border: none;
                }
                QLabel {
                    color: white;
                    background: transparent;
                    border: none;
                }
            """
            )
        elif not self._is_selected:
            self._setup_styling()

    def _update_cursor(self):
        """Update cursor based on state - legacy style"""
        if self._is_selected:
            self.setCursor(Qt.CursorShape.ArrowCursor)
        elif self._beat_data:
            self.setCursor(Qt.CursorShape.PointingHandCursor)
        else:
            self.setCursor(Qt.CursorShape.ArrowCursor)

    # Legacy compatibility - no text overlay scaling needed

    # Event handlers
    def mousePressEvent(self, event: QMouseEvent):
        """Handle mouse press events - clean approach without pressed effects"""
        if event.button() == Qt.MouseButton.LeftButton:
            self.clicked.emit()
        elif event.button() == Qt.MouseButton.RightButton:
            self.context_menu.emit()
        super().mousePressEvent(event)

    def enterEvent(self, event):
        """Handle mouse enter events - simple legacy style"""
        # Update cursor based on state - no visual effects
        if not self._is_selected and self._beat_data:
            self.setCursor(Qt.CursorShape.PointingHandCursor)
        else:
            self.setCursor(Qt.CursorShape.ArrowCursor)

        super().enterEvent(event)

    def leaveEvent(self, event):
        """Handle mouse leave events - simple legacy style"""
        # Reset cursor - no visual effects
        self.setCursor(Qt.CursorShape.ArrowCursor)

        super().leaveEvent(event)

    # Size management
    def sizeHint(self) -> QSize:
        """Provide size hint for layout management"""
        return QSize(120, 120)

    def minimumSizeHint(self) -> QSize:
        """Provide minimum size hint"""
        return QSize(100, 100)

    # Cleanup
    def cleanup(self):
        """Cleanup resources when the view is being destroyed"""
        # Clear text overlays
        self._text_overlays.clear()

        # Clean up selection overlay
        if self._selection_overlay:
            try:
                self._selection_overlay.deleteLater()
            except (RuntimeError, AttributeError):
                pass
            self._selection_overlay = None

        # Cleanup pictograph component
        if self._pictograph_component:
            self._pictograph_component.cleanup()
            self._pictograph_component = None
