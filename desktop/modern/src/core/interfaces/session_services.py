"""
Session Services Interfaces

Defines interfaces for session management and state tracking services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class ISessionStateTracker(ABC):
    """Interface for session state tracking services."""

    @abstractmethod
    def start_session(self) -> None:
        """Start a new session."""
        pass

    @abstractmethod
    def end_session(self) -> None:
        """End the current session."""
        pass

    @abstractmethod
    def save_session_state(self, state_data: dict[str, Any]) -> None:
        """Save session state data."""
        pass

    @abstractmethod
    def load_session_state(self) -> dict[str, Any]:
        """Load session state data."""
        pass

    @abstractmethod
    def get_session_id(self) -> str:
        """Get the current session ID."""
        pass
