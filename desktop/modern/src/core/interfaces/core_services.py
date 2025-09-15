"""
Core Services Interfaces

Defines the core service interfaces used throughout the TKA application.
These interfaces provide the contracts for essential services like UI state management,
pictograph operations, and layout services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Callable


class IObjectPoolManager(ABC):
    """Interface for object pool management services."""

    @abstractmethod
    def initialize_pool(
        self,
        pool_name: str,
        max_objects: int,
        object_factory: Callable[[], Any],
        progress_callback: Callable | None = None,
    ) -> None:
        """Initialize a new object pool."""
        pass

    @abstractmethod
    def get_pooled_object(self, pool_name: str, index: int) -> Any | None:
        """Get object from pool by index."""
        pass

    @abstractmethod
    def reset_pool(self, pool_name: str) -> None:
        """Reset pool state."""
        pass

    @abstractmethod
    def get_pool_info(self, pool_name: str) -> dict[str, Any]:
        """Get information about a pool."""
        pass

    @abstractmethod
    def list_pools(self) -> list[str]:
        """List all available pools."""
        pass

    @abstractmethod
    def cleanup_all_pools(self) -> None:
        """Clean up all pools and their resources."""
        pass

    @abstractmethod
    def get_pool_statistics(self) -> dict[str, Any]:
        """Get statistics about all pools."""
        pass


class IUIStateManager(ABC):
    """Interface for UI state management services."""

    @abstractmethod
    def save_state(self) -> None:
        """Save current UI state to storage."""
        pass

    @abstractmethod
    def load_state(self) -> None:
        """Load UI state from storage."""
        pass

    @abstractmethod
    def get_state(self, key: str) -> Any:
        """Get a specific state value."""
        pass

    @abstractmethod
    def set_state(self, key: str, value: Any) -> None:
        """Set a specific state value."""
        pass


class ILayoutService(ABC):
    """Interface for layout management services."""

    @abstractmethod
    def calculate_layout(self, container_size: tuple) -> dict[str, Any]:
        """Calculate layout based on container size."""
        pass

    @abstractmethod
    def update_layout(self, layout_data: dict[str, Any]) -> None:
        """Update the current layout."""
        pass


class IPictographBorderManager(ABC):
    """Interface for pictograph border management."""

    @abstractmethod
    def update_border_style(self, style: str) -> None:
        """Update the border style."""
        pass

    @abstractmethod
    def show_border(self, show: bool) -> None:
        """Show or hide the border."""
        pass


class IPictographContextDetector(ABC):
    """Interface for pictograph context detection."""

    @abstractmethod
    def detect_context(self, pictograph_data: dict[str, Any]) -> str:
        """Detect the context of a pictograph."""
        pass


class ISettingsCoordinator(ABC):
    """Interface for coordinating settings across the application."""

    @abstractmethod
    def get_setting(self, key: str) -> Any:
        """Get a setting value."""
        pass

    @abstractmethod
    def set_setting(self, key: str, value: Any) -> None:
        """Set a setting value."""
        pass

    @abstractmethod
    def save_settings(self) -> None:
        """Save all settings to storage."""
        pass
