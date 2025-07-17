"""
Core types module for framework-agnostic data structures.
"""

from .geometry import (
    Point,
    PointType,
    Rect,
    RectType,
    Size,
    SizeType,
    Widget,
    WidgetType,
)

__all__ = [
    "Size",
    "Point",
    "Rect",
    "Widget",
    "SizeType",
    "PointType",
    "RectType",
    "WidgetType",
]
