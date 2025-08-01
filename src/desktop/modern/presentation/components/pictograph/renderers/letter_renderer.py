"""
Letter renderer for pictograph components.

Handles rendering of letter text elements with Legacy-style positioning and styling.
"""

from PyQt6.QtGui import QColor, QFont
from PyQt6.QtWidgets import QGraphicsTextItem


class LetterRenderer:
    """Handles letter rendering for pictographs with Legacy-style positioning."""

    def __init__(self, scene):
        self.scene = scene
        self.CENTER_X = 475
        self.CENTER_Y = 475
        self.RADIUS = 300