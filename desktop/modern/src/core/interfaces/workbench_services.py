"""
Workbench Services Interfaces

Defines interfaces for workbench-related services including graph editor,
full screen viewer, and dictionary services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class IGraphEditorService(ABC):
    """Interface for graph editor services."""

    @abstractmethod
    def open_graph_editor(self) -> None:
        """Open the graph editor."""
        pass

    @abstractmethod
    def close_graph_editor(self) -> None:
        """Close the graph editor."""
        pass

    @abstractmethod
    def get_current_graph(self) -> dict[str, Any]:
        """Get the current graph data."""
        pass


class IFullScreenViewer(ABC):
    """Interface for full screen viewer services."""

    @abstractmethod
    def enter_full_screen(self) -> None:
        """Enter full screen mode."""
        pass

    @abstractmethod
    def exit_full_screen(self) -> None:
        """Exit full screen mode."""
        pass

    @abstractmethod
    def is_full_screen(self) -> bool:
        """Check if currently in full screen mode."""
        pass


class IDictionaryService(ABC):
    """Interface for dictionary services."""

    @abstractmethod
    def add_sequence_to_dictionary(self, sequence_data: dict[str, Any]) -> None:
        """Add a sequence to the dictionary."""
        pass

    @abstractmethod
    def remove_sequence_from_dictionary(self, sequence_id: str) -> None:
        """Remove a sequence from the dictionary."""
        pass

    @abstractmethod
    def search_dictionary(self, query: str) -> list[dict[str, Any]]:
        """Search the dictionary for sequences."""
        pass
