"""
Workbench Service Interfaces

Interface definitions for workbench-related services following TKA's clean architecture.
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, List, NamedTuple, Optional, Tuple

from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData


class WorkbenchState(Enum):
    """Workbench operational states."""

    EMPTY = "empty"
    SEQUENCE_LOADED = "sequence_loaded"
    START_POSITION_SET = "start_position_set"
    BOTH_SET = "both_set"
    RESTORING = "restoring"


class StateChangeResult(NamedTuple):
    """Result of a state change operation."""

    changed: bool
    previous_state: WorkbenchState
    new_state: WorkbenchState
    sequence_changed: bool
    start_position_changed: bool

    @classmethod
    def create_no_change(cls, current_state: WorkbenchState):
        """Create a no-change result."""
        return cls(False, current_state, current_state, False, False)

    @classmethod
    def create_sequence_changed(
        cls, prev_state: WorkbenchState, new_state: WorkbenchState
    ):
        """Create a sequence change result."""
        return cls(True, prev_state, new_state, True, False)

    @classmethod
    def create_start_position_changed(
        cls, prev_state: WorkbenchState, new_state: WorkbenchState
    ):
        """Create a start position change result."""
        return cls(True, prev_state, new_state, False, True)

    @classmethod
    def create_both_changed(cls, prev_state: WorkbenchState, new_state: WorkbenchState):
        """Create a both changed result."""
        return cls(True, prev_state, new_state, True, True)


class IWorkbenchStateManager(ABC):
    """Interface for workbench state management operations."""

    @abstractmethod
    def set_sequence(
        self, sequence: Optional[SequenceData], from_restoration: bool = False
    ) -> StateChangeResult:
        """
        Set current sequence and update workbench state.

        Args:
            sequence: New sequence data (None to clear)
            from_restoration: Whether this is from session restoration

        Returns:
            StateChangeResult with change details
        """
        pass

    @abstractmethod
    def set_start_position(
        self, start_position: Optional[BeatData], from_restoration: bool = False
    ) -> StateChangeResult:
        """
        Set start position and update workbench state.

        Args:
            start_position: New start position data (None to clear)
            from_restoration: Whether this is from session restoration

        Returns:
            StateChangeResult with change details
        """
        pass

    @abstractmethod
    def clear_all_state(self) -> StateChangeResult:
        """Clear all workbench state."""
        pass

    @abstractmethod
    def get_current_sequence(self) -> Optional[SequenceData]:
        """Get current sequence."""
        pass

    @abstractmethod
    def get_start_position(self) -> Optional[BeatData]:
        """Get current start position."""
        pass

    @abstractmethod
    def get_workbench_state(self) -> WorkbenchState:
        """Get current workbench state."""
        pass

    @abstractmethod
    def has_sequence(self) -> bool:
        """Check if workbench has a sequence."""
        pass

    @abstractmethod
    def has_start_position(self) -> bool:
        """Check if workbench has a start position."""
        pass

    @abstractmethod
    def is_empty(self) -> bool:
        """Check if workbench is completely empty."""
        pass

    @abstractmethod
    def is_restoring(self) -> bool:
        """Check if workbench is in restoration mode."""
        pass

    @abstractmethod
    def is_restoration_complete(self) -> bool:
        """Check if restoration has completed."""
        pass

    @abstractmethod
    def should_enable_sequence_operations(self) -> bool:
        """Check if sequence operations should be enabled."""
        pass

    @abstractmethod
    def should_enable_export_operations(self) -> bool:
        """Check if export operations should be enabled."""
        pass

    @abstractmethod
    def should_enable_transform_operations(self) -> bool:
        """Check if transform operations should be enabled."""
        pass

    @abstractmethod
    def should_enable_clear_operation(self) -> bool:
        """Check if clear operation should be enabled."""
        pass

    @abstractmethod
    def should_prevent_auto_save(self) -> bool:
        """Check if auto-save should be prevented (during restoration)."""
        pass

    @abstractmethod
    def get_complete_sequence_with_start_position(self) -> Optional[SequenceData]:
        """Get sequence with start position included if both exist."""
        pass

    @abstractmethod
    def begin_restoration(self) -> None:
        """Begin restoration mode."""
        pass

    @abstractmethod
    def complete_restoration(self) -> None:
        """Complete restoration mode."""
        pass

    @abstractmethod
    def reset_restoration_state(self) -> None:
        """Reset restoration state."""
        pass

    @abstractmethod
    def validate_state_consistency(self) -> Tuple[bool, List[str]]:
        """
        Validate current state consistency.

        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        pass

    @abstractmethod
    def get_state_summary(self) -> Dict[str, Any]:
        """Get comprehensive state summary for debugging."""
        pass


class IWorkbenchClipboardService(ABC):
    """Interface for workbench clipboard operations."""

    @abstractmethod
    def copy_beat(self, beat_data: BeatData) -> bool:
        """Copy beat to clipboard."""
        pass

    @abstractmethod
    def copy_sequence_section(
        self, sequence: SequenceData, start_idx: int, end_idx: int
    ) -> bool:
        """Copy sequence section to clipboard."""
        pass

    @abstractmethod
    def paste_beat(self, target_index: int) -> Optional[BeatData]:
        """Paste beat from clipboard."""
        pass

    @abstractmethod
    def paste_sequence_section(self, target_index: int) -> Optional[List[BeatData]]:
        """Paste sequence section from clipboard."""
        pass

    @abstractmethod
    def has_beat_in_clipboard(self) -> bool:
        """Check if clipboard contains beat data."""
        pass

    @abstractmethod
    def has_sequence_section_in_clipboard(self) -> bool:
        """Check if clipboard contains sequence section."""
        pass

    @abstractmethod
    def clear_clipboard(self) -> None:
        """Clear clipboard contents."""
        pass


class IWorkbenchExportService(ABC):
    """Interface for workbench export operations."""

    @abstractmethod
    def export_sequence_as_json(self, sequence: SequenceData, output_path: str) -> bool:
        """Export sequence as JSON file."""
        pass

    @abstractmethod
    def export_sequence_as_image(
        self, sequence: SequenceData, output_path: str
    ) -> bool:
        """Export sequence as image file."""
        pass

    @abstractmethod
    def export_beat_as_image(self, beat_data: BeatData, output_path: str) -> bool:
        """Export individual beat as image file."""
        pass

    @abstractmethod
    def get_supported_export_formats(self) -> List[str]:
        """Get list of supported export formats."""
        pass


class IWorkbenchSessionManager(ABC):
    """Interface for workbench session management."""

    @abstractmethod
    def save_session(self, session_name: str) -> bool:
        """Save current workbench session."""
        pass

    @abstractmethod
    def load_session(self, session_name: str) -> bool:
        """Load workbench session."""
        pass

    @abstractmethod
    def get_available_sessions(self) -> List[str]:
        """Get list of available sessions."""
        pass

    @abstractmethod
    def delete_session(self, session_name: str) -> bool:
        """Delete a session."""
        pass

    @abstractmethod
    def get_session_info(self, session_name: str) -> Optional[Dict[str, Any]]:
        """Get session information."""
        pass


class IBeatSelectionService(ABC):
    """Interface for beat selection operations."""

    @abstractmethod
    def select_beat(self, beat_index: int) -> bool:
        """Select a beat by index."""
        pass

    @abstractmethod
    def select_multiple_beats(self, beat_indices: List[int]) -> bool:
        """Select multiple beats."""
        pass

    @abstractmethod
    def deselect_all(self) -> None:
        """Deselect all beats."""
        pass

    @abstractmethod
    def get_selected_beats(self) -> List[int]:
        """Get list of selected beat indices."""
        pass

    @abstractmethod
    def get_primary_selection(self) -> Optional[int]:
        """Get primary selected beat index."""
        pass

    @abstractmethod
    def is_beat_selected(self, beat_index: int) -> bool:
        """Check if beat is selected."""
        pass

    @abstractmethod
    def get_selection_count(self) -> int:
        """Get number of selected beats."""
        pass


class IGraphEditorService(ABC):
    """Interface for graph editor operations."""

    @abstractmethod
    def create_graph(self, sequence_data: Any) -> Any:
        """Create a graph from sequence data."""
        pass

    @abstractmethod
    def update_graph(self, graph_id: str, updates: Any) -> bool:
        """Update an existing graph."""
        pass

    @abstractmethod
    def delete_graph(self, graph_id: str) -> bool:
        """Delete a graph."""
        pass

    @abstractmethod
    def get_graph(self, graph_id: str) -> Optional[Any]:
        """Get graph by ID."""
        pass

    @abstractmethod
    def list_graphs(self) -> List[Any]:
        """List all available graphs."""
        pass


class IFullScreenViewer(ABC):
    """Interface for full screen viewing operations."""

    @abstractmethod
    def show_fullscreen(self, content: Any) -> None:
        """Show content in fullscreen mode."""
        pass

    @abstractmethod
    def hide_fullscreen(self) -> None:
        """Hide fullscreen mode."""
        pass

    @abstractmethod
    def is_fullscreen(self) -> bool:
        """Check if currently in fullscreen mode."""
        pass

    @abstractmethod
    def toggle_fullscreen(self, content: Any = None) -> bool:
        """Toggle fullscreen mode."""
        pass


class IBeatDeletionService(ABC):
    """Interface for beat deletion operations."""

    @abstractmethod
    def delete_beat(self, beat_index: int) -> bool:
        """Delete a beat at the specified index."""
        pass

    @abstractmethod
    def delete_beats(self, beat_indices: List[int]) -> bool:
        """Delete multiple beats."""
        pass

    @abstractmethod
    def delete_beat_range(self, start_index: int, end_index: int) -> bool:
        """Delete a range of beats."""
        pass

    @abstractmethod
    def can_delete_beat(self, beat_index: int) -> bool:
        """Check if a beat can be deleted."""
        pass


class IDictionaryService(ABC):
    """Interface for dictionary operations."""

    @abstractmethod
    def get_pictograph(self, letter: str) -> Optional[Any]:
        """Get pictograph by letter."""
        pass

    @abstractmethod
    def get_all_pictographs(self) -> List[Any]:
        """Get all available pictographs."""
        pass

    @abstractmethod
    def search_pictographs(self, query: str) -> List[Any]:
        """Search pictographs by query."""
        pass

    @abstractmethod
    def get_pictograph_variations(self, base_letter: str) -> List[Any]:
        """Get variations of a pictograph."""
        pass


class ISequenceWorkbenchService(ABC):
    """Interface for sequence workbench operations."""

    @abstractmethod
    def create_sequence(self, name: str) -> Any:
        """Create a new sequence."""
        pass

    @abstractmethod
    def load_sequence(self, sequence_id: str) -> Optional[Any]:
        """Load an existing sequence."""
        pass

    @abstractmethod
    def save_sequence(self, sequence: Any) -> bool:
        """Save a sequence."""
        pass

    @abstractmethod
    def get_current_sequence(self) -> Optional[Any]:
        """Get the currently active sequence."""
        pass

    @abstractmethod
    def set_current_sequence(self, sequence: Any) -> None:
        """Set the current active sequence."""
        pass
