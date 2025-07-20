"""
Modern Browse Tab Package

Simplified browse tab implementation based on Legacy audit findings.
Focuses on real complexity: responsive UI, thumbnail management, and state persistence.
"""

from presentation.tabs.browse.models import (
    BrowseTabSection,
    FilterType,
    NavigationMode,
    SortMethod,
)
from presentation.tabs.browse.browse_tab import BrowseTab

__all__ = [
    "BrowseTab",
    "FilterType",
    "NavigationMode",
    "SortMethod",
    "BrowseTabSection",
]
