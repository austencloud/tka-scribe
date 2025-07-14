"""
Modern variations button with glassmorphism styling and hover effects.

This button provides access to the advanced start position picker with
contemporary design patterns and smooth animations.
"""

from typing import TYPE_CHECKING

from PyQt6.QtCore import QEasingCurve, QPropertyAnimation, QSize, Qt, pyqtSignal
from PyQt6.QtGui import (
    QColor,
    QEnterEvent,
    QFont,
    QIcon,
    QLinearGradient,
    QPainter,
    QPainterPath,
)
from PyQt6.QtWidgets import QGraphicsDropShadowEffect, QPushButton

if TYPE_CHECKING:
    from presentation.components.start_position_picker.enhanced_start_position_picker import (
        EnhancedStartPositionPicker,
    )


class VariationsButton(QPushButton):
    """
    Modern variations button with glassmorphism design and smooth animations.

    Features:
    - Glassmorphism styling with transparency and blur effects
    - Smooth hover animations and transitions
    - Responsive sizing and modern typography
    - Subtle visual feedback and accessibility support
    """

    def __init__(self, start_pos_picker: "EnhancedStartPositionPicker") -> None:
        super().__init__(start_pos_picker)
        self.start_pos_picker = start_pos_picker

        # Animation properties
        self.hover_animation: QPropertyAnimation = None
        self.click_animation: QPropertyAnimation = None

        self._setup_ui()
        self._setup_animations()

    def _setup_ui(self) -> None:
        """Set up the button UI with modern styling."""
        self.setText("✨ Explore Variations")
        self.setFont(QFont("Segoe UI", 12, QFont.Weight.Medium))

        # Apply glassmorphism styling
        self.setStyleSheet(self._get_button_styles())

        # Add subtle drop shadow
        self._add_drop_shadow()

        # Set cursor
        self.setCursor(Qt.CursorShape.PointingHandCursor)

    def _get_button_styles(self) -> str:
        """Return comprehensive button stylesheet with glassmorphism effects."""
        return """
            QPushButton {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(99, 102, 241, 0.15),
                    stop:0.5 rgba(139, 92, 246, 0.12),
                    stop:1 rgba(168, 85, 247, 0.1)
                );
                border: 2px solid rgba(255, 255, 255, 0.25);
                border-radius: 16px;
                color: #4c1d95;
                font-weight: 600;
                padding: 12px 24px;
                min-width: 160px;
                min-height: 44px;
            }
            
            QPushButton:hover {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(99, 102, 241, 0.25),
                    stop:0.5 rgba(139, 92, 246, 0.22),
                    stop:1 rgba(168, 85, 247, 0.2)
                );
                border: 2px solid rgba(255, 255, 255, 0.4);
                color: #3730a3;
            }
            
            QPushButton:pressed {
                background: qlineargradient(
                    x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(99, 102, 241, 0.35),
                    stop:0.5 rgba(139, 92, 246, 0.32),
                    stop:1 rgba(168, 85, 247, 0.3)
                );
                border: 2px solid rgba(255, 255, 255, 0.5);
                color: #312e81;
            }
            
            QPushButton:disabled {
                background: rgba(156, 163, 175, 0.1);
                border: 2px solid rgba(156, 163, 175, 0.2);
                color: #9ca3af;
            }
        """

    def _add_drop_shadow(self) -> None:
        """Add subtle drop shadow effect for depth."""
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(20)
        shadow.setColor(QColor(99, 102, 241, 40))  # Purple shadow with low opacity
        shadow.setOffset(0, 4)
        self.setGraphicsEffect(shadow)

    def _setup_animations(self) -> None:
        """Set up smooth hover and click animations."""
        # Hover scale animation
        self.hover_animation = QPropertyAnimation(self, b"geometry")
        self.hover_animation.setDuration(200)
        self.hover_animation.setEasingCurve(QEasingCurve.Type.OutCubic)

        # Click feedback animation
        self.click_animation = QPropertyAnimation(self, b"geometry")
        self.click_animation.setDuration(100)
        self.click_animation.setEasingCurve(QEasingCurve.Type.OutQuad)

    def resizeEvent(self, event) -> None:
        """Handle resize events with responsive sizing."""
        # Calculate responsive size based on parent
        if self.start_pos_picker:
            parent_width = self.start_pos_picker.width()
            parent_height = self.start_pos_picker.height()

            # Responsive button sizing
            button_width = min(max(parent_width // 6, 160), 220)
            button_height = min(max(parent_height // 15, 44), 56)

            self.setFixedSize(button_width, button_height)

            # Responsive font sizing
            font_size = max(min(button_width // 12, 14), 10)
            font = self.font()
            font.setPointSize(font_size)
            self.setFont(font)

        super().resizeEvent(event)

    def enterEvent(self, event: QEnterEvent) -> None:
        """Handle mouse enter with smooth hover animation."""
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        # Animate slight scale increase
        if (
            self.hover_animation
            and not self.hover_animation.state() == QPropertyAnimation.State.Running
        ):
            current_rect = self.geometry()
            hover_rect = current_rect.adjusted(-2, -2, 2, 2)  # Slight growth

            self.hover_animation.setStartValue(current_rect)
            self.hover_animation.setEndValue(hover_rect)
            self.hover_animation.start()

        super().enterEvent(event)

    def leaveEvent(self, event) -> None:
        """Handle mouse leave with smooth return animation."""
        self.setCursor(Qt.CursorShape.ArrowCursor)

        # Animate back to original size
        if (
            self.hover_animation
            and not self.hover_animation.state() == QPropertyAnimation.State.Running
        ):
            current_rect = self.geometry()
            normal_rect = current_rect.adjusted(2, 2, -2, -2)  # Return to normal

            self.hover_animation.setStartValue(current_rect)
            self.hover_animation.setEndValue(normal_rect)
            self.hover_animation.start()

        super().leaveEvent(event)

    def mousePressEvent(self, event) -> None:
        """Handle mouse press with click feedback animation."""
        # Quick scale down for click feedback
        if (
            self.click_animation
            and not self.click_animation.state() == QPropertyAnimation.State.Running
        ):
            current_rect = self.geometry()
            click_rect = current_rect.adjusted(1, 1, -1, -1)  # Slight shrink

            self.click_animation.setStartValue(current_rect)
            self.click_animation.setEndValue(click_rect)
            self.click_animation.finished.connect(self._restore_size)
            self.click_animation.start()

        super().mousePressEvent(event)

    def mouseReleaseEvent(self, event) -> None:
        """Handle mouse release and restore size."""
        super().mouseReleaseEvent(event)

    def _restore_size(self) -> None:
        """Restore button to normal size after click animation."""
        if self.click_animation:
            self.click_animation.finished.disconnect()
            current_rect = self.geometry()
            normal_rect = current_rect.adjusted(-1, -1, 1, 1)  # Return to normal

            self.click_animation.setStartValue(current_rect)
            self.click_animation.setEndValue(normal_rect)
            self.click_animation.start()

    def paintEvent(self, event) -> None:
        """Custom paint event for additional visual effects."""
        super().paintEvent(event)

        # Add subtle highlight gradient on top
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        # Create highlight gradient
        highlight_gradient = QLinearGradient(0, 0, 0, self.height() * 0.5)
        highlight_gradient.setColorAt(0, QColor(255, 255, 255, 30))
        highlight_gradient.setColorAt(1, QColor(255, 255, 255, 0))

        # Create rounded rectangle path
        path = QPainterPath()
        from PyQt6.QtCore import QRectF

        path.addRoundedRect(QRectF(self.rect()), 16, 16)

        # Draw highlight
        painter.fillPath(path, highlight_gradient)
        painter.end()

    def setEnabled(self, enabled: bool) -> None:
        """Override setEnabled to handle disabled state properly."""
        super().setEnabled(enabled)

        # Update cursor based on enabled state
        if enabled:
            self.setCursor(Qt.CursorShape.PointingHandCursor)
        else:
            self.setCursor(Qt.CursorShape.ForbiddenCursor)
