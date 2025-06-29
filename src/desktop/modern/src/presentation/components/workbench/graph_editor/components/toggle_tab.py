import logging
from PyQt6.QtWidgets import QWidget, QPushButton, QHBoxLayout
from PyQt6.QtCore import (
    pyqtSignal,
    QTimer,
    QPropertyAnimation,
    QEasingCurve,
    QEvent,
    Qt,
)
from PyQt6.QtGui import QFont

from ..config import UIConfig, LayoutConfig, ColorConfig, StateConfig, AnimationConfig

logger = logging.getLogger(__name__)


class ToggleTab(QWidget):
    toggle_requested = pyqtSignal()

    def __init__(self, parent, positioning_style="left"):
        super().__init__(parent)
        self._graph_editor = parent
        self._animating = False
        self._real_time_sync_active = (
            False  # Flag to disable all positioning during real-time sync
        )
        self._positioning_style = (
            positioning_style  # "left" for legacy-exact bottom-left positioning
        )

        self._setup_ui()
        self._setup_animation()
        # Defer initial positioning until parent is fully initialized
        QTimer.singleShot(0, self._position_tab)

    def _setup_ui(self):
        """Setup the toggle button UI with proper styling and sizing"""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        # Create toggle button with proper text and styling
        self._toggle_btn = QPushButton("Graph Editor ▲")
        self._toggle_btn.clicked.connect(self.toggle_requested.emit)
        self._toggle_btn.setFont(QFont("Arial", 10, QFont.Weight.Bold))
        self._toggle_btn.setCursor(Qt.CursorShape.PointingHandCursor)

        # Set initial visual state (disconnected)
        self._update_visual_state()

        layout.addWidget(self._toggle_btn)

        # Set proper size to accommodate button content with padding
        self.setMinimumSize(
            UIConfig.TOGGLE_TAB_MIN_WIDTH, UIConfig.TOGGLE_TAB_MIN_HEIGHT
        )
        self.setMaximumSize(
            UIConfig.TOGGLE_TAB_MAX_WIDTH, UIConfig.TOGGLE_TAB_MAX_HEIGHT
        )

        # Enable focus for proper event handling
        self.setFocusPolicy(Qt.FocusPolicy.StrongFocus)

        # Set window flags for proper layering
        self.setWindowFlags(
            Qt.WindowType.Tool
            | Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )

    def _setup_animation(self):
        """Setup smooth position animation system"""
        from PyQt6.QtCore import QPoint

        # Position animation for smooth movement
        self._position_animation = QPropertyAnimation(self, b"pos")
        self._position_animation.setDuration(
            AnimationConfig.TOGGLE_POSITION_DURATION_MS
        )  # Smooth animation - different from main animation
        self._position_animation.setEasingCurve(QEasingCurve.Type.OutCubic)

        # Connect animation events
        self._position_animation.finished.connect(self._on_animation_finished)

    def _on_animation_finished(self):
        """Handle animation completion"""
        self._animating = False

    def _update_visual_state(self):
        """Update visual styling with permanent purple-blue gradient (legacy-exact)"""
        # Always use the attractive purple-blue gradient regardless of state
        # This matches the legacy behavior where the toggle tab always looks appealing
        self._toggle_btn.setStyleSheet(
            f"""
            QPushButton {{
                background: qlineargradient(
                    x1: 0, y1: 0, x2: 1, y2: 1,
                    stop: 0 {ColorConfig.TOGGLE_GRADIENT_START},
                    stop: 1 {ColorConfig.TOGGLE_GRADIENT_END}
                );
                border: 2px solid #555;
                border-radius: 12px 12px 0px 0px;
                color: white;
                padding: {LayoutConfig.PANEL_PADDING}px 16px;
                font-weight: bold;
                font-size: {UIConfig.TOGGLE_TAB_FONT_SIZE}px;
                min-width: 120px;
                min-height: 16px;
            }}
            QPushButton:hover {{
                background: qlineargradient(
                    x1: 0, y1: 0, x2: 1, y2: 1,
                    stop: 0 {ColorConfig.TOGGLE_GRADIENT_HOVER_START},
                    stop: 1 {ColorConfig.TOGGLE_GRADIENT_HOVER_END}
                );
            }}
            QPushButton:pressed {{
                background: qlineargradient(
                    x1: 0, y1: 0, x2: 1, y2: 1,
                    stop: 0 {ColorConfig.TOGGLE_GRADIENT_PRESSED_START},
                    stop: 1 {ColorConfig.TOGGLE_GRADIENT_PRESSED_END}
                );
            }}
        """
        )

    def _position_tab(self):
        """Position the toggle tab initially at the bottom center of workbench"""
        # Get the workbench parent (should be the main workbench widget)
        workbench_parent = self._get_workbench_parent()

        if not workbench_parent:
            # Defer positioning until parent is available
            QTimer.singleShot(StateConfig.POSITIONING_DEFER_MS, self._position_tab)
            return

        self.setParent(workbench_parent)

        # Ensure parent has valid dimensions before positioning
        if workbench_parent.width() <= 0 or workbench_parent.height() <= 0:
            # Defer positioning until parent has valid size
            QTimer.singleShot(StateConfig.POSITIONING_DEFER_MS, self._position_tab)
            return

        # CRITICAL FIX: Ensure workbench has reasonable size before positioning
        # The workbench starts very small and grows later
        if workbench_parent.height() < LayoutConfig.MIN_WORKBENCH_HEIGHT:
            logger.debug(
                "Workbench too small (%dpx), deferring positioning...",
                workbench_parent.height(),
            )
            QTimer.singleShot(StateConfig.POSITIONING_DEFER_MS, self._position_tab)
            return

        # Calculate position based on positioning style
        x = (workbench_parent.width() - self.width()) // 2  # Center horizontally
        y = workbench_parent.height() - self.height()  # Bottom of workbench

        # Debug info for initial positioning
        logger.debug(
            "Workbench size: %dx%d", workbench_parent.width(), workbench_parent.height()
        )
        logger.debug("Toggle tab size: %dx%d", self.width(), self.height())
        logger.debug("Calculated position: (%d, %d)", x, y)

        self.move(x, y)
        self.raise_()

        # Ensure button is visible
        self.show()
        logger.debug(
            "Toggle tab positioned at (%d, %d) in parent %s",
            x,
            y,
            type(workbench_parent).__name__,
        )

    def update_position_for_graph_editor_state(self):
        """Update toggle tab position based on graph editor visibility state"""
        # CRITICAL FIX: Block all positioning during animation to prevent conflicts
        if (
            hasattr(self._graph_editor, "_animation_controller")
            and self._graph_editor._animation_controller.is_animating()
        ):
            logger.debug("Blocking toggle tab position update - real-time sync active")
            return

        # Get the workbench parent for positioning calculations
        parent = self._get_workbench_parent()
        if not parent:
            return

        # Block all positioning if real-time sync is active
        if self._real_time_sync_active:
            logger.debug(
                "Blocking position update - real-time sync controls positioning"
            )
            return

        # Calculate new position based on graph editor state
        x = (parent.width() - self.width()) // 2  # Always center horizontally

        # For vertical positioning, align with graph editor top when visible
        if (
            self._graph_editor
            and hasattr(self._graph_editor, "isVisible")
            and self._graph_editor.isVisible()
            and hasattr(self._graph_editor, "geometry")
        ):
            # Get graph editor geometry relative to workbench
            graph_editor_rect = self._graph_editor.geometry()

            # Safety check: ensure graph editor has valid geometry
            if graph_editor_rect.height() <= 0:
                logger.warning(
                    "Graph editor has invalid geometry: %s", graph_editor_rect
                )
                # Fallback to bottom positioning
                y = parent.height() - self.height()
            else:
                # Map the graph editor's top-left corner to workbench coordinates
                workbench_pos = self._graph_editor.mapTo(
                    parent, graph_editor_rect.topLeft()
                )

                logger.debug(
                    "Graph editor rect: %s, workbench_pos: %s",
                    graph_editor_rect,
                    workbench_pos,
                )

                # Position toggle tab so its bottom aligns with graph editor top
                # This creates the visual effect of the tab being "attached" to the graph editor
                y = workbench_pos.y() - self.height()

                # Ensure toggle tab doesn't go above the workbench
                if y < 0:
                    y = 0
        else:
            # Graph editor is hidden, position at bottom of workbench
            y = parent.height() - self.height()

        # Apply the new position
        self.move(x, y)

    def _get_workbench_parent(self):
        """Get the workbench parent widget for positioning"""
        # Walk up the parent hierarchy to find the workbench
        current = self._graph_editor
        while current:
            parent = current.parent()
            if parent and "workbench" in type(parent).__name__.lower():
                return parent
            current = parent

        # Fallback: use graph editor's parent if workbench not found
        return self._graph_editor.parent() if self._graph_editor else None

    def set_real_time_sync_active(self, active: bool):
        """Enable/disable real-time sync mode to prevent positioning conflicts"""
        self._real_time_sync_active = active
        if active:
            logger.debug(
                "Real-time sync mode ENABLED - toggle tab positioning disabled"
            )
        else:
            logger.debug(
                "Real-time sync mode DISABLED - toggle tab positioning enabled"
            )

    def eventFilter(self, obj, event):
        """Handle events for proper positioning updates"""
        if event.type() == QEvent.Type.Resize and obj == self._get_workbench_parent():
            # Update position when workbench is resized
            self.update_position_for_graph_editor_state()
        return super().eventFilter(obj, event)

    def showEvent(self, event):
        """Handle show events"""
        super().showEvent(event)
        # Install event filter on workbench parent for resize events
        workbench_parent = self._get_workbench_parent()
        if workbench_parent:
            workbench_parent.installEventFilter(self)

    def hideEvent(self, event):
        """Handle hide events"""
        super().hideEvent(event)
        # Remove event filter when hiding
        workbench_parent = self._get_workbench_parent()
        if workbench_parent:
            workbench_parent.removeEventFilter(self)
