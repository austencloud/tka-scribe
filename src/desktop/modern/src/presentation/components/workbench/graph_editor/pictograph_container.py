from typing import Optional
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QGraphicsView
from PyQt6.QtCore import pyqtSignal, Qt
from PyQt6.QtGui import QMouseEvent, QPainter

from domain.models.core_models import BeatData
from domain.models.pictograph_models import PictographData
from application.services.core.pictograph_management_service import (
    PictographManagementService,
)
from presentation.components.pictograph.pictograph_scene import (
    PictographScene,
)


class GraphEditorPictographContainer(QWidget):
    arrow_selected = pyqtSignal(str)
    beat_modified = pyqtSignal(BeatData)

    def __init__(self, parent):
        super().__init__(parent)
        self._graph_editor = parent
        self._current_beat: Optional[BeatData] = None
        self._selected_arrow_id: Optional[str] = None
        self._selected_arrow_items = {}  # Track selected arrow visual items
        self._selection_highlight_color = "#FFD700"  # Gold border color

        # Get layout service from parent's container
        container = getattr(parent, "container", None)
        if container:
            self._pictograph_service = PictographManagementService()
        else:
            self._pictograph_service = None

        self._current_pictograph: Optional[PictographData] = None

        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(4, 4, 4, 4)

        self._pictograph_view = ModernPictographView(self)
        self._pictograph_view.arrow_clicked.connect(self._on_arrow_clicked)

        layout.addWidget(self._pictograph_view)

        self.setFixedSize(300, 300)
        self.setStyleSheet(
            """
            ModernPictographContainer {
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                background-color: rgba(0, 0, 0, 0.1);
            }
        """
        )

    def set_beat(self, beat_data: Optional[BeatData]):
        self._current_beat = beat_data
        self._pictograph_view.set_beat(beat_data)

    def refresh_display(self, beat_data: BeatData):
        """Refresh pictograph display with new beat data"""
        self.set_beat(beat_data)

        # Maintain selection if we had one
        if self._selected_arrow_id:
            self._apply_arrow_selection_visual(self._selected_arrow_id)

    def set_selected_arrow(self, arrow_id: str):
        """Set selected arrow and update visual feedback"""
        # Clear previous selection
        self._clear_arrow_selection()

        # Set new selection
        self._selected_arrow_id = arrow_id
        self._apply_arrow_selection_visual(arrow_id)

        self.arrow_selected.emit(arrow_id)

    def _clear_arrow_selection(self):
        """Clear all arrow selection visual feedback"""
        if hasattr(self._pictograph_view, "_scene") and self._pictograph_view._scene:
            for item in self._pictograph_view._scene.items():
                if hasattr(item, "setSelected"):
                    item.setSelected(False)
                if hasattr(item, "clear_selection_highlight"):
                    item.clear_selection_highlight()

    def _apply_arrow_selection_visual(self, arrow_id: str):
        """Apply visual feedback for selected arrow"""
        if (
            not hasattr(self._pictograph_view, "_pictograph_scene")
            or not self._pictograph_view._pictograph_scene
        ):
            return

        for item in self._pictograph_view._pictograph_scene.items():
            if hasattr(item, "arrow_color") and item.arrow_color == arrow_id:
                # Add gold border highlighting
                if hasattr(item, "add_selection_highlight"):
                    item.add_selection_highlight(self._selection_highlight_color)
                elif hasattr(item, "setSelected"):
                    item.setSelected(True)
                break

    def _on_arrow_clicked(self, arrow_id: str):
        self._selected_arrow_id = arrow_id
        self.arrow_selected.emit(arrow_id)


class ModernPictographView(QGraphicsView):
    arrow_clicked = pyqtSignal(str)

    def __init__(self, parent):
        super().__init__(parent)
        self._container = parent
        self._current_beat: Optional[BeatData] = None

        self._setup_view()

    def _setup_view(self):
        # Use Modern's PictographScene instead of basic QGraphicsScene
        self._pictograph_scene = PictographScene()
        self.setScene(self._pictograph_scene)
        self.setRenderHint(QPainter.RenderHint.Antialiasing)
        self.setDragMode(QGraphicsView.DragMode.NoDrag)
        self.setFrameStyle(0)
        self.setStyleSheet("background: transparent;")

        # Enable proper scaling and viewport updates
        self.setViewportUpdateMode(QGraphicsView.ViewportUpdateMode.FullViewportUpdate)
        self.setOptimizationFlags(
            QGraphicsView.OptimizationFlag.DontAdjustForAntialiasing
        )

    def set_beat(self, beat_data: Optional[BeatData]):
        self._current_beat = beat_data
        self._render_beat()

        # Ensure proper scaling after rendering
        self._fit_pictograph_to_view()

    def _render_beat(self):
        if not self._current_beat:
            self.scene().clear()
            return

        # Use Modern's native pictograph scene to render the beat
        self._pictograph_scene.update_beat(self._current_beat)

        # Enable arrow selection for graph editor mode
        self._enable_arrow_selection()

    def _fit_pictograph_to_view(self):
        """Fit the pictograph properly within the view container"""
        if not self._pictograph_scene:
            return

        # Get scene bounds
        scene_rect = self._pictograph_scene.itemsBoundingRect()
        if scene_rect.isEmpty():
            return

        # Add some padding around the pictograph
        padding = 20
        padded_rect = scene_rect.adjusted(-padding, -padding, padding, padding)

        # Fit the scene to the view with proper scaling
        self.fitInView(padded_rect, Qt.AspectRatioMode.KeepAspectRatio)

        print(f"🔍 Graph Editor Pictograph Scaling:")
        print(f"   Scene rect: {scene_rect.width():.1f}x{scene_rect.height():.1f}")
        print(f"   View size: {self.width()}x{self.height()}")
        print(f"   Scale factor: {self.transform().m11():.3f}")

    def resizeEvent(self, event):
        """Handle resize events to maintain proper scaling"""
        super().resizeEvent(event)
        # Re-fit the pictograph when the view is resized
        self._fit_pictograph_to_view()

    def _enable_arrow_selection(self):
        """Enable arrow selection for graph editor mode."""
        # Connect to arrow renderers in the pictograph scene
        if hasattr(self._pictograph_scene, "arrow_renderer"):
            arrow_renderer = self._pictograph_scene.arrow_renderer
            if hasattr(arrow_renderer, "arrow_clicked"):
                arrow_renderer.arrow_clicked.connect(self._on_arrow_clicked)

        # Make arrows clickable by enabling mouse events on arrow items
        for item in self._pictograph_scene.items():
            if hasattr(item, "arrow_color"):  # Arrow items should have this attribute
                item.setFlag(item.GraphicsItemFlag.ItemIsSelectable, True)
                item.setAcceptHoverEvents(True)
                # Set cursor for arrow items
                item.setCursor(Qt.CursorShape.PointingHandCursor)

    def _on_arrow_clicked(self, arrow_color: str):
        """Handle arrow click from Modern pictograph scene."""
        self.arrow_clicked.emit(arrow_color)

    def get_selected_arrow_data(self) -> Optional[dict]:
        """Get data for the currently selected arrow."""
        if not self._selected_arrow_id or not self._current_beat:
            return None

        # Get arrow data from beat
        if self._selected_arrow_id == "blue" and self._current_beat.blue_motion:
            return {
                "color": "blue",
                "motion": self._current_beat.blue_motion,
                "orientation": getattr(
                    self._current_beat.blue_motion, "orientation", None
                ),
                "turns": getattr(self._current_beat.blue_motion, "turns", 0.0),
            }
        elif self._selected_arrow_id == "red" and self._current_beat.red_motion:
            return {
                "color": "red",
                "motion": self._current_beat.red_motion,
                "orientation": getattr(
                    self._current_beat.red_motion, "orientation", None
                ),
                "turns": getattr(self._current_beat.red_motion, "turns", 0.0),
            }
        return None

    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == Qt.MouseButton.LeftButton:
            # Check if we clicked on an arrow in the scene
            scene_pos = self.mapToScene(event.pos())
            item = self.scene().itemAt(scene_pos, self.transform())

            if item and hasattr(item, "arrow_color"):
                # Clicked on an arrow
                arrow_color = item.arrow_color
                self._on_arrow_clicked(arrow_color)
            else:
                # Clicked elsewhere - could deselect current arrow
                pass

        super().mousePressEvent(event)
