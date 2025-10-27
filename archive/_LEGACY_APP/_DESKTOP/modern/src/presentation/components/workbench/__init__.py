"""
Sequence Workbench Components

Modern sequence workbench with modern architecture.
"""
from __future__ import annotations

from desktop.modern.src.presentation.components.workbench.sequence_beat_frame import (
    BeatSelector,
    BeatView,
    SequenceBeatFrame,
    StartPositionView,
)

from .beat_frame_section import WorkbenchBeatFrameSection

# Legacy compatibility
from .button_interface import (
    ButtonOperationResult,
    IWorkbenchButtonInterface,
    WorkbenchButtonInterfaceAdapter,
    WorkbenchButtonInterfaceAdapter as ButtonInterface,
    WorkbenchButtonSignals,
)
from .event_controller import WorkbenchEventController
from .indicator_section import WorkbenchIndicatorSection
from .workbench import SequenceWorkbench


__all__ = [
    "BeatSelector",
    "BeatView",
    "ButtonInterface",  # Legacy alias
    "ButtonOperationResult",
    "IWorkbenchButtonInterface",
    "SequenceBeatFrame",
    "SequenceWorkbench",
    "StartPositionView",
    "WorkbenchBeatFrameSection",
    # Interface adapters
    "WorkbenchButtonInterfaceAdapter",
    "WorkbenchButtonSignals",
    "WorkbenchEventController",
    # Core components
    "WorkbenchIndicatorSection",
]
