"""
SequenceOrchestrator - Qt Presentation Layer

Thin Qt wrapper for sequence operations - business logic delegated to SequenceOrchestrator service.
"""

from typing import Callable, Optional

from application.services.sequence.sequence_coordinator import (
    ISequenceCoordinatorSignals,
)
from application.services.sequence.sequence_coordinator import (
    SequenceCoordinator as SequenceCoordinatorService,
)
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData
from PyQt6.QtCore import QObject, pyqtSignal


class SequenceCoordinatorSignalEmitter(ISequenceCoordinatorSignals):
    """Qt signal emitter for sequence coordinator service."""

    def __init__(self, qt_sequence_coordinator):
        self.qt_coordinator = qt_sequence_coordinator

    def emit_sequence_modified(self, sequence: SequenceData) -> None:
        self.qt_coordinator.sequence_modified.emit(sequence)

    def emit_sequence_cleared(self) -> None:
        self.qt_coordinator.sequence_cleared.emit()

    def emit_beat_added(self, beat_data: BeatData, position: int) -> None:
        self.qt_coordinator.beat_added.emit(beat_data, position)

    def emit_beat_removed(self, position: int) -> None:
        self.qt_coordinator.beat_removed.emit(position)

    def emit_beat_updated(self, beat_data: BeatData, position: int) -> None:
        self.qt_coordinator.beat_updated.emit(beat_data, position)

    def emit_start_position_set(self, start_position_data: BeatData) -> None:
        self.qt_coordinator.start_position_set.emit(start_position_data)

    def emit_sequence_loaded(self, sequence: SequenceData) -> None:
        self.qt_coordinator.sequence_loaded.emit(sequence)


class SequenceCoordinator(QObject):
    """
    Qt wrapper for sequence operations - business logic in SequenceCoordinator service.

    Responsibilities:
    - Emit Qt signals for sequence changes
    - Handle workbench interactions
    - Delegate business logic to service

    Signals:
    - sequence_modified: Emitted when sequence is modified
    - sequence_cleared: Emitted when sequence is cleared
    - beat_added: Emitted when beat is added
    - beat_removed: Emitted when beat is removed
    - beat_updated: Emitted when beat is updated
    - start_position_set: Emitted when start position is set
    - sequence_loaded: Emitted when sequence is loaded
    """

    sequence_modified = pyqtSignal(object)  # SequenceData object
    sequence_cleared = pyqtSignal()
    beat_added = pyqtSignal(object, int)  # BeatData, position
    beat_removed = pyqtSignal(int)  # position
    beat_updated = pyqtSignal(object, int)  # BeatData, position
    start_position_set = pyqtSignal(object)  # BeatData
    sequence_loaded = pyqtSignal(object)  # SequenceData

    def __init__(
        self,
        workbench_getter: Optional[Callable[[], object]] = None,
        workbench_setter: Optional[Callable[[SequenceData], None]] = None,
        start_position_handler: Optional[object] = None,
    ):
        super().__init__()

        # Initialize signal emitter for service
        signal_emitter = SequenceCoordinatorSignalEmitter(self)

        # Initialize the sequence coordinator service with dependencies
        self._sequence_service = SequenceCoordinatorService(
            workbench_getter=workbench_getter,
            workbench_setter=workbench_setter,
            data_converter=start_position_handler,  # Assuming this is the data converter
            signal_emitter=signal_emitter,
        )

    def add_beat_to_sequence(self, beat_data: BeatData):
        """Add a beat to the current sequence - delegate to service."""
        self._sequence_service.add_beat_to_sequence(beat_data)

    # Legacy conversion methods have been moved to the service

    # More legacy conversion logic moved to service

    # Even more conversion logic moved to service

    def clear_sequence(self):
        """Clear the current sequence - delegate to service."""
        self._sequence_service.clear_sequence()

    def handle_workbench_modified(self, sequence: SequenceData):
        """Handle workbench sequence modification - delegate to service."""
        self._sequence_service.handle_workbench_modified(sequence)

    # Current sequence retrieval moved to service

    # Signal emission handled by service via signal emitter

    def get_current_sequence_length(self) -> int:
        """Get the length of the current sequence - delegate to service."""
        return self._sequence_service.get_current_sequence_length()

    def update_beat_turns(self, beat_index: int, color: str, new_turns: int):
        """Update the number of turns for a specific beat - delegate to service."""
        self._sequence_service.update_beat_turns(beat_index, color, new_turns)

    def remove_beat(self, beat_index: int):
        """Remove a beat from the sequence - delegate to service."""
        self._sequence_service.remove_beat(beat_index)

    def set_start_position(self, start_position_data: BeatData):
        """Set the start position - delegate to service."""
        self._sequence_service.set_start_position(start_position_data)

    def load_sequence_on_startup(self):
        """Load sequence from current_sequence.json on startup - delegate to service."""
        self._sequence_service.load_sequence_on_startup()

    # All business logic methods have been moved to the SequenceManager service.
    # This presentation layer now only handles Qt signals and workbench interactions.
