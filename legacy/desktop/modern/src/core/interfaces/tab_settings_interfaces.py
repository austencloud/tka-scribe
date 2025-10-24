"""
Tab Settings Interfaces

Defines interfaces for various tab-specific settings managers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any


class PropType(Enum):
    """Enumeration of prop types."""

    HAND = "hand"
    STAFF = "staff"
    FAN = "fan"
    BUUGENG = "buugeng"
    HOOP = "hoop"
    CLUB = "club"


class IVisibilitySettingsManager(ABC):
    """Interface for visibility settings management."""

    @abstractmethod
    def get_visibility_setting(self, element: str) -> bool:
        """Get visibility setting for an element."""
        pass

    @abstractmethod
    def set_visibility_setting(self, element: str, visible: bool) -> None:
        """Set visibility setting for an element."""
        pass

    @abstractmethod
    def toggle_visibility(self, element: str) -> bool:
        """Toggle visibility of an element."""
        pass


class IPropTypeSettingsManager(ABC):
    """Interface for prop type settings management."""

    @abstractmethod
    def get_current_prop_type(self) -> PropType:
        """Get the current prop type."""
        pass

    @abstractmethod
    def set_prop_type(self, prop_type: PropType) -> None:
        """Set the current prop type."""
        pass


class IImageExporter(ABC):
    """Interface for image export services."""

    @abstractmethod
    def export_image(self, data: dict[str, Any], file_path: str) -> bool:
        """Export image data to file."""
        pass

    @abstractmethod
    def get_export_formats(self) -> list[str]:
        """Get available export formats."""
        pass


class IUserProfileService(ABC):
    """Interface for user profile services."""

    @abstractmethod
    def get_current_user(self) -> dict[str, Any]:
        """Get current user profile."""
        pass

    @abstractmethod
    def set_user_info(self, user_data: dict[str, Any]) -> None:
        """Set user information."""
        pass

    @abstractmethod
    def save_user_profile(self) -> None:
        """Save user profile to storage."""
        pass


class IBeatLayoutSettingsManager(ABC):
    """Interface for beat layout settings management."""

    @abstractmethod
    def get_layout_setting(self, key: str) -> Any:
        """Get a layout setting."""
        pass

    @abstractmethod
    def set_layout_setting(self, key: str, value: Any) -> None:
        """Set a layout setting."""
        pass
