"""
Enhanced Toggle Switch Component

A modern, animated toggle switch with glassmorphism styling.
"""

from typing import Optional

from PyQt6.QtCore import QPropertyAnimation, QRect, Qt, pyqtSignal
from PyQt6.QtGui import QPainter, QPaintEvent, QColor
from PyQt6.QtWidgets import QWidget


class EnhancedToggle(QWidget):
    """Modern animated toggle switch with glassmorphism styling."""
    
    toggled = pyqtSignal(bool)
    
    def __init__(self, checked: bool = False, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self._checked = checked
        self._animation = None
        self._handle_position = 0.0
        
        # Dimensions
        self.setFixedSize(50, 24)
        
        # Colors
        self._bg_color_on = QColor(76, 175, 80, 180)  # Green with transparency
        self._bg_color_off = QColor(158, 158, 158, 120)  # Gray with transparency
        self._handle_color = QColor(255, 255, 255, 240)  # White with slight transparency
        self._border_color = QColor(255, 255, 255, 60)  # Subtle border
        
        # Initialize position
        self._handle_position = 1.0 if checked else 0.0
        
        self.setCursor(Qt.CursorShape.PointingHandCursor)
    
    def setChecked(self, checked: bool):
        """Set the toggle state."""
        if self._checked != checked:
            self._checked = checked
            self._animate_to_position(1.0 if checked else 0.0)
            self.toggled.emit(checked)
    
    def isChecked(self) -> bool:
        """Get the current toggle state."""
        return self._checked
    
    def _animate_to_position(self, target_position: float):
        """Animate the handle to the target position."""
        if self._animation:
            self._animation.stop()
        
        self._animation = QPropertyAnimation(self, b"handle_position")
        self._animation.setDuration(200)  # 200ms animation
        self._animation.setStartValue(self._handle_position)
        self._animation.setEndValue(target_position)
        self._animation.start()
    
    def get_handle_position(self) -> float:
        """Get the current handle position (for animation)."""
        return self._handle_position
    
    def set_handle_position(self, position: float):
        """Set the handle position (for animation)."""
        self._handle_position = position
        self.update()
    
    # Property for animation
    handle_position = property(get_handle_position, set_handle_position)
    
    def mousePressEvent(self, event):
        """Handle mouse press to toggle state."""
        if event.button() == Qt.MouseButton.LeftButton:
            self.setChecked(not self._checked)
        super().mousePressEvent(event)
    
    def paintEvent(self, event: QPaintEvent):
        """Paint the toggle switch."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Calculate colors based on position
        progress = self._handle_position
        bg_color = self._interpolate_color(self._bg_color_off, self._bg_color_on, progress)
        
        # Draw background track
        track_rect = QRect(2, 2, self.width() - 4, self.height() - 4)
        painter.setBrush(bg_color)
        painter.setPen(self._border_color)
        painter.drawRoundedRect(track_rect, 10, 10)
        
        # Draw handle
        handle_radius = 8
        handle_x = int(4 + progress * (self.width() - 16))
        handle_y = self.height() // 2
        
        painter.setBrush(self._handle_color)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawEllipse(
            handle_x - handle_radius,
            handle_y - handle_radius,
            handle_radius * 2,
            handle_radius * 2
        )
    
    def _interpolate_color(self, color1: QColor, color2: QColor, progress: float) -> QColor:
        """Interpolate between two colors based on progress (0.0 to 1.0)."""
        r = int(color1.red() + (color2.red() - color1.red()) * progress)
        g = int(color1.green() + (color2.green() - color1.green()) * progress)
        b = int(color1.blue() + (color2.blue() - color1.blue()) * progress)
        a = int(color1.alpha() + (color2.alpha() - color1.alpha()) * progress)
        return QColor(r, g, b, a)
