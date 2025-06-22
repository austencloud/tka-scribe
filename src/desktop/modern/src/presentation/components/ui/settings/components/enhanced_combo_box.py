"""
Enhanced Combo Box Component

A modern combo box with glassmorphism styling and smooth animations.
"""

from typing import Optional

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import QComboBox, QWidget


class EnhancedComboBox(QComboBox):
    """Modern combo box with glassmorphism styling."""
    
    def __init__(self, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self._setup_styling()
        self._setup_font()
    
    def _setup_font(self):
        """Setup the font for the combo box."""
        font = QFont("Inter", 10)
        font.setWeight(QFont.Weight.Medium)
        self.setFont(font)
    
    def _setup_styling(self):
        """Apply glassmorphism styling to the combo box."""
        self.setStyleSheet("""
            QComboBox {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.12),
                    stop:1 rgba(255, 255, 255, 0.08));
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                padding: 6px 12px;
                color: rgba(255, 255, 255, 0.95);
                min-width: 120px;
                min-height: 20px;
            }
            
            QComboBox:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.18),
                    stop:1 rgba(255, 255, 255, 0.12));
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            QComboBox:focus {
                border-color: rgba(76, 175, 80, 0.8);
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(255, 255, 255, 0.15),
                    stop:1 rgba(255, 255, 255, 0.10));
            }
            
            QComboBox::drop-down {
                subcontrol-origin: padding;
                subcontrol-position: top right;
                width: 20px;
                border-left: 1px solid rgba(255, 255, 255, 0.2);
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
            }
            
            QComboBox::drop-down:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            QComboBox::down-arrow {
                image: none;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 6px solid rgba(255, 255, 255, 0.7);
                width: 0px;
                height: 0px;
            }
            
            QComboBox QAbstractItemView {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(40, 40, 40, 0.95),
                    stop:1 rgba(30, 30, 30, 0.95));
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                color: rgba(255, 255, 255, 0.95);
                selection-background-color: rgba(76, 175, 80, 0.3);
                selection-color: rgba(255, 255, 255, 1.0);
                padding: 4px;
                outline: none;
            }
            
            QComboBox QAbstractItemView::item {
                padding: 8px 12px;
                border-radius: 4px;
                margin: 1px;
            }
            
            QComboBox QAbstractItemView::item:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            QComboBox QAbstractItemView::item:selected {
                background: rgba(76, 175, 80, 0.4);
                color: rgba(255, 255, 255, 1.0);
            }
        """)
        
        # Set cursor
        self.setCursor(Qt.CursorShape.PointingHandCursor)
    
    def wheelEvent(self, event):
        """Disable wheel events to prevent accidental changes."""
        # Ignore wheel events when the combo box is not focused
        if not self.hasFocus():
            event.ignore()
            return
        super().wheelEvent(event)
