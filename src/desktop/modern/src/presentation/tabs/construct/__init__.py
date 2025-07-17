"""
Construct Tab Components

This package contains the UI components of the ConstructTabWidget,
following proper separation of concerns between presentation and business logic.

Presentation Components (in this package):
- ConstructTabLayoutManager: Handles UI layout and panel creation
- StartPositionHandler: Manages start position UI interactions
- OptionPickerManager: Handles option picker UI management
- SignalCoordinator: Coordinates signals between UI components

Business Logic Services (moved to application layer):
- SequenceLoadingService: Handles sequence loading from persistence
- SequenceBeatOperations: Manages beat-level operations
- SequenceStartPositionManager: Manages start position operations
- SequenceDataConverter: Handles data conversion between formats (enhanced with caching)
"""

from application.services.sequence.sequence_beat_operations import (
    SequenceBeatOperations,
)
from application.services.sequence.sequence_start_position_manager import (
    SequenceStartPositionManager,
)

# Services moved to application layer
from presentation.adapters.qt.sequence_loader_adapter import QtSequenceLoaderAdapter

from ...components.option_picker.option_picker_manager import OptionPickerManager
from ...components.start_position_picker.start_position_selection_handler import (
    StartPositionSelectionHandler,
)
from .layout_manager import ConstructTabLayoutManager
from .signal_coordinator import SignalCoordinator

__all__ = [
    # Presentation components (local)
    "ConstructTabLayoutManager",
    "StartPositionSelectionHandler",
    "OptionPickerManager",
    "SignalCoordinator",
    # Business services (re-exported from application layer)
    "QtSequenceLoaderAdapter",
    "SequenceBeatOperations",
    "SequenceStartPositionManager",
]
