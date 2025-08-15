"""
Background Interfaces

Defines interfaces for background animation and management services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class IBackgroundService(ABC):
    """Interface for background animation services."""

    @abstractmethod
    def start_animation(self) -> None:
        """Start background animation."""
        pass

    @abstractmethod
    def stop_animation(self) -> None:
        """Stop background animation."""
        pass

    @abstractmethod
    def set_background_type(self, background_type: str) -> None:
        """Set the background animation type."""
        pass

    @abstractmethod
    def get_current_background(self) -> str:
        """Get the current background type."""
        pass

    @abstractmethod
    def update_animation_settings(self, settings: dict[str, Any]) -> None:
        """Update animation settings."""
        pass
