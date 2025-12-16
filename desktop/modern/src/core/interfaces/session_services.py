"""
Session Services Interfaces

Defines interfaces for session management and state tracking services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from typing import Any
import uuid


@dataclass
class SessionState:
    """Immutable session state data."""

    # Session metadata
    session_id: str = None
    created_at: datetime = None
    last_interaction: datetime = None
    tka_version: str = "modern"

    # Sequence data
    current_sequence_id: str | None = None
    current_sequence_data: dict[str, Any] | None = None

    # Workbench state
    selected_beat_index: int | None = None
    selected_beat_data: dict[str, Any] | None = None
    start_position_data: dict[str, Any] | None = None

    # Graph editor state
    graph_editor_visible: bool = False
    graph_editor_selected_beat_index: int | None = None
    graph_editor_selected_arrow: str | None = None
    graph_editor_height: int = 300

    # UI state
    active_tab: str = "sequence_builder"
    beat_layout: dict[str, Any] = None
    component_visibility: dict[str, bool] = None

    def __post_init__(self):
        """Initialize default values for mutable fields."""
        if self.session_id is None:
            object.__setattr__(self, "session_id", str(uuid.uuid4()))
        if self.created_at is None:
            object.__setattr__(self, "created_at", datetime.now())
        if self.last_interaction is None:
            object.__setattr__(self, "last_interaction", datetime.now())
        if self.beat_layout is None:
            object.__setattr__(self, "beat_layout", {})
        if self.component_visibility is None:
            object.__setattr__(self, "component_visibility", {})


@dataclass
class SessionRestoreResult:
    """Result of session restoration operation."""

    success: bool
    session_restored: bool
    session_data: SessionState | None = None
    error_message: str | None = None
    warnings: list[str] | None = None

    def __post_init__(self):
        """Initialize default values for mutable fields."""
        if self.warnings is None:
            object.__setattr__(self, "warnings", [])


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
