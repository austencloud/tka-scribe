import logging

from application.services.data.dataset_query import DatasetQuery
from application.services.pictograph_pool_manager import PictographPoolManager
from presentation.components.sequence_workbench.sequence_beat_frame.selection_overlay import (
    SelectionOverlay,
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QMouseEvent
from PyQt6.QtWidgets import QVBoxLayout, QWidget

logger = logging.getLogger(__name__)


class StartPositionOption(QWidget):
    position_selected = pyqtSignal(str)

    def __init__(
        self,
        position_key: str,
        pool_manager: PictographPoolManager,
        grid_mode: str = "diamond",
    ):
        super().__init__()
        self.position_key = position_key
        self.grid_mode = grid_mode
        self.dataset_service = DatasetQuery()
        self._pool_manager = pool_manager

        # Initialize selection overlay components
        self._pictograph_component = None
        self._selection_overlay = None

        self._setup_ui()

    def _setup_ui(self):
        logger.info(
            f"Setting up StartPositionOption for {self.position_key} in {self.grid_mode} mode"
        )

        layout = QVBoxLayout(self)
        layout.setContentsMargins(5, 5, 5, 5)
        layout.setSpacing(5)

        # Use injected pool manager
        logger.info(
            f"Checking out pictograph component from pool for {self.position_key}"
        )
        self._pictograph_component = self._pool_manager.checkout_pictograph(parent=self)
        self.pictograph_component = self._pictograph_component  # Keep legacy reference

        if self._pictograph_component:
            logger.info(
                f"Successfully got pictograph component for {self.position_key}"
            )
            # Don't set a fixed size here - let it be sized by the parent container
            # self._pictograph_component.setFixedSize(200, 200)
        else:
            logger.error(
                f"Failed to get pictograph component from pool for {self.position_key}"
            )

        if self._pictograph_component:
            # CRITICAL FIX: Add to layout FIRST, then update data
            # This prevents the component from appearing as a separate window during rendering
            layout.addWidget(self._pictograph_component)
            logger.info(f"Pictograph component added to layout for {self.position_key}")

            self._pictograph_component.setStyleSheet(
                """
                QWidget {
                    border: 2px solid rgba(255,255,255,0.25);
                    border-radius: 18px;
                    background: rgba(255,255,255,0.18);
                }
                """
            )

            logger.info(
                f"Getting pictograph data for {self.position_key} in {self.grid_mode} mode"
            )
            pictograph_data = self.dataset_service.get_start_position_pictograph_data(
                self.position_key, self.grid_mode
            )
            if pictograph_data:
                logger.info(
                    f"Got pictograph data for {self.position_key}, updating component"
                )
                # Update data AFTER adding to layout
                self._pictograph_component.update_from_pictograph_data(pictograph_data)

                # Ensure component is visible after data update
                self._pictograph_component.setVisible(True)
                logger.info(f"Component updated with pictograph data")
            else:
                logger.warning(
                    f"No pictograph data found for {self.position_key} in {self.grid_mode} mode"
                )
        else:
            logger.error(
                f"⚠️ Failed to get pictograph component from pool for start position: {self.position_key}"
            )

        self._selection_overlay = SelectionOverlay(self)

        self.setCursor(Qt.CursorShape.PointingHandCursor)

        logger.info(
            f"StartPositionOption setup complete for {self.position_key} - size: {self.size()}, visible: {self.isVisible()}"
        )

    def mousePressEvent(self, event: "QMouseEvent"):
        if event.button() == Qt.MouseButton.LeftButton:
            self.position_selected.emit(self.position_key)
        super().mousePressEvent(event)

    def set_highlighted(self, highlighted: bool) -> None:
        """Set hover state with scaling compensation"""
        if self._selection_overlay:
            if highlighted:
                self._selection_overlay.show_hover()
            else:
                self._selection_overlay.hide_hover_only()

    def set_selected(self, selected: bool) -> None:
        """Set selection state with scaling compensation"""
        if self._selection_overlay:
            if selected:
                self._selection_overlay.show_selection()
            else:
                self._selection_overlay.hide_all()

    def enterEvent(self, event):
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.set_highlighted(True)
        super().enterEvent(event)

    def leaveEvent(self, event):
        self.setCursor(Qt.CursorShape.ArrowCursor)
        self.set_highlighted(False)
        super().leaveEvent(event)

    def closeEvent(self, event):
        """Clean up pool resources when widget is closed."""
        self._cleanup_pool_resources()
        super().closeEvent(event)

    def _cleanup_pool_resources(self):
        """Return pictograph component to pool for reuse."""
        if self._pictograph_component and self._pool_manager:
            try:
                self._pool_manager.checkin_pictograph(self._pictograph_component)
                self._pictograph_component = None
            except Exception as e:
                print(f"⚠️ Failed to return start position component to pool: {e}")

    def _update_pictograph_size(self):
        """Update pictograph component size to fit the container."""
        if self._pictograph_component:
            # Calculate size based on container, leaving margin for borders and layout
            container_size = self.size()

            # Use the smaller dimension to ensure square pictograph fits
            container_min = min(container_size.width(), container_size.height())

            # Leave more margin for borders, selection overlay, and layout spacing
            margin = 20  # Increased margin for better visual appearance
            pictograph_size = max(container_min - margin, 50)  # Minimum 50px

            # Ensure pictograph doesn't exceed reasonable maximum
            pictograph_size = min(pictograph_size, 280)

            self._pictograph_component.setFixedSize(pictograph_size, pictograph_size)
            logger.info(
                f"Updated pictograph size to {pictograph_size}x{pictograph_size} for {self.position_key} (container: {container_size})"
            )

    def resizeEvent(self, event):
        """Handle resize events to update pictograph size."""
        super().resizeEvent(event)
        self._update_pictograph_size()

    def __del__(self):
        """Ensure cleanup on deletion."""
        self._cleanup_pool_resources()
