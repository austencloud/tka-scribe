"""
Choose Your Next Option Label - Modern Version

Provides the instructional text label that appears above the option picker,
matching the legacy implementation's appearance and behavior.
"""

from typing import Callable

from PyQt6.QtCore import QSize, Qt
from PyQt6.QtWidgets import QLabel


class ChooseYourNextOptionLabel(QLabel):
    """
    Instructional label for the option picker.
    
    Based on the legacy ChooseYourNextPictographLabel but with updated text
    and modern styling approach.
    """

    def __init__(self, size_provider: Callable[[], QSize], parent=None):
        super().__init__(parent)
        self.size_provider = size_provider
        
        # Set the text - matching legacy functionality
        self.setText("Choose your next option:")
        self.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # Apply initial styling
        self._update_style()

    def _update_style(self):
        """Update the label's styling based on current size."""
        # Get current height for border radius calculation
        h = self.height()
        if h <= 0:
            # Default height for initial styling
            h = 40
            
        style = (
            f"background-color: rgba(255,255,255,200); "
            f"border-radius: {h//2}px; "
            f"padding: 5px;"
        )
        self.setStyleSheet(style)

    def resizeEvent(self, event):
        """Handle resize events to update styling."""
        super().resizeEvent(event)
        
        # Update size based on the main window size
        if self.size_provider:
            main_window_size = self.size_provider()
            
            # Calculate font size based on main window height
            font_size = max(main_window_size.height() // 80, 10)
            
            # Calculate label dimensions
            label_height = max(int(font_size * 2.5), 25)
            label_width = max(int(label_height * 8), 200)
            
            # Update font
            font = self.font()
            font.setPointSize(font_size)
            self.setFont(font)
            
            # Set fixed size
            self.setFixedSize(QSize(label_width, label_height))
        
        # Update styling with new dimensions
        self._update_style()
