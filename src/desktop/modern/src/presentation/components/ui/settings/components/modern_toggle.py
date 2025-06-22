"""
Modern toggle switch component with smooth animations.
"""

from typing import Optional
from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLabel
from PyQt6.QtCore import Qt, pyqtSignal, QPropertyAnimation, QEasingCurve, QRect, QTimer
from PyQt6.QtGui import QPainter, QBrush, QColor, QPen, QLinearGradient


class ModernToggle(QWidget):
    """Modern toggle switch with smooth animations and glassmorphism styling."""
    
    toggled = pyqtSignal(bool)
    
    def __init__(self, checked: bool = False, parent=None):
        super().__init__(parent)
        self._checked = checked
        self._handle_position = 0
        self._animation_duration = 200
        
        self.setFixedSize(50, 24)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        
        # Animation for handle movement
        self._animation = QPropertyAnimation(self, b"handle_position")
        self._animation.setDuration(self._animation_duration)
        self._animation.setEasingCurve(QEasingCurve.Type.OutCubic)
        
        # Initialize position based on checked state
        if self._checked:
            self._handle_position = 26
    
    @property
    def handle_position(self) -> int:
        return self._handle_position
    
    @handle_position.setter
    def handle_position(self, pos: int):
        self._handle_position = pos
        self.update()
    
    def is_checked(self) -> bool:
        return self._checked
    
    def set_checked(self, checked: bool, animate: bool = True):
        if self._checked == checked:
            return
            
        self._checked = checked
        
        if animate:
            target_pos = 26 if checked else 0
            self._animation.setStartValue(self._handle_position)
            self._animation.setEndValue(target_pos)
            self._animation.start()
        else:
            self._handle_position = 26 if checked else 0
            self.update()
        
        self.toggled.emit(checked)
    
    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.set_checked(not self._checked)
        super().mousePressEvent(event)
    
    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        
        # Draw track
        track_rect = QRect(0, 6, 50, 12)
        track_color = QColor(42, 130, 218) if self._checked else QColor(100, 100, 100, 80)
        
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QBrush(track_color))
        painter.drawRoundedRect(track_rect, 6, 6)
        
        # Draw handle with glassmorphism effect
        handle_rect = QRect(self._handle_position, 0, 24, 24)
        
        # Handle gradient
        gradient = QLinearGradient(0, 0, 24, 24)
        gradient.setColorAt(0, QColor(255, 255, 255, 200))
        gradient.setColorAt(1, QColor(240, 240, 240, 180))
        
        painter.setBrush(QBrush(gradient))
        painter.setPen(QPen(QColor(255, 255, 255, 100), 1))
        painter.drawEllipse(handle_rect)
        
        # Inner highlight
        inner_rect = QRect(self._handle_position + 2, 2, 20, 20)
        inner_gradient = QLinearGradient(0, 0, 20, 20)
        inner_gradient.setColorAt(0, QColor(255, 255, 255, 150))
        inner_gradient.setColorAt(1, QColor(255, 255, 255, 50))
        
        painter.setBrush(QBrush(inner_gradient))
        painter.setPen(Qt.PenStyle.NoPen)
        painter.drawEllipse(inner_rect)


class ModernLabeledToggle(QWidget):
    """Toggle with integrated label."""
    
    toggled = pyqtSignal(bool)
    
    def __init__(self, text: str, checked: bool = False, parent=None):
        super().__init__(parent)
        self.text = text
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)
        
        self.label = QLabel(text)
        self.label.setStyleSheet("""
            QLabel {
                color: rgba(255, 255, 255, 0.9);
                font-size: 13px;
                font-weight: 500;
            }
        """)
        
        self.toggle = ModernToggle(checked)
        self.toggle.toggled.connect(self.toggled.emit)
        
        layout.addWidget(self.label)
        layout.addStretch()
        layout.addWidget(self.toggle)
    
    def is_checked(self) -> bool:
        return self.toggle.is_checked()
    
    def set_checked(self, checked: bool):
        self.toggle.set_checked(checked)
