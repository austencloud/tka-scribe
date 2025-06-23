"""
Graph Editor Service Implementation

Provides graph editor functionality for the modern TKA desktop application.
Manages graph editor state, beat selection, and UI interactions.
"""

from typing import Optional, List
from core.interfaces.workbench_services import IGraphEditorService
from core.interfaces.core_services import IUIStateManagementService
from domain.models.core_models import (
    SequenceData,
    BeatData,
    MotionType,
)


class GraphEditorService(IGraphEditorService):
    """Modern graph editor service implementation"""

    def __init__(self, ui_state_service: Optional[IUIStateManagementService] = None):
        self.ui_state_service = ui_state_service
        self._current_sequence: Optional[SequenceData] = None
        self._selected_beat: Optional[BeatData] = None
        self._selected_beat_index: Optional[int] = None
        self._selected_arrow_id: Optional[str] = None
        self._is_visible: bool = False

        # Graph editor settings with proven ratios
        self._graph_height_ratio = 3.5  # parent_height // 3.5
        self._max_width_ratio = 4  # parent_width // 4

    def update_graph_display(self, sequence: Optional[SequenceData]) -> None:
        """Update the graph editor display with sequence data"""
        self._current_sequence = sequence

        # Clear selections when sequence changes
        if sequence != self._current_sequence:
            self._selected_beat = None
            self._selected_beat_index = None
            self._selected_arrow_id = None

        # Notify UI state service if available (save only basic info, not the full sequence object)
        if self.ui_state_service:
            sequence_info = {
                "beat_count": len(sequence.beats) if sequence and sequence.beats else 0,
                "sequence_id": sequence.id if sequence else None,
            }
            self.ui_state_service.set_setting(
                "graph_editor_sequence_info", sequence_info
            )

    def toggle_graph_visibility(self) -> bool:
        """Toggle graph editor visibility, return new visibility state"""
        self._is_visible = not self._is_visible

        # Notify UI state service if available
        if self.ui_state_service:
            self.ui_state_service.set_setting("graph_editor_visible", self._is_visible)

        return self._is_visible

    def set_selected_beat(
        self, beat_data: Optional[BeatData], beat_index: Optional[int] = None
    ) -> None:
        """Set the currently selected beat for editing"""
        self._selected_beat = beat_data
        self._selected_beat_index = beat_index

        # Clear arrow selection when beat changes
        self._selected_arrow_id = None

        # Notify UI state service if available
        if self.ui_state_service:
            self.ui_state_service.set_setting(
                "graph_editor_selected_beat_index", beat_index
            )

    def get_selected_beat(self) -> Optional[BeatData]:
        """Get the currently selected beat"""
        return self._selected_beat

    def get_selected_beat_index(self) -> Optional[int]:
        """Get the currently selected beat index"""
        return self._selected_beat_index

    def is_visible(self) -> bool:
        """Check if graph editor is currently visible"""
        return self._is_visible

    def get_current_sequence(self) -> Optional[SequenceData]:
        """Get the current sequence being displayed"""
        return self._current_sequence

    def update_beat_adjustments(self, beat_data: BeatData) -> BeatData:
        """Apply adjustment panel modifications to beat data"""
        # In a full implementation, this would apply any pending adjustments
        # from the adjustment panel to the beat data
        return beat_data

    def set_arrow_selection(self, arrow_id: Optional[str]) -> None:
        """Set selected arrow for detailed editing"""
        self._selected_arrow_id = arrow_id

        # Notify UI state service if available
        if self.ui_state_service:
            self.ui_state_service.set_setting("graph_editor_selected_arrow", arrow_id)

    def get_available_turns(self, arrow_color: str) -> List[float]:
        """Get available turn values for specified arrow color"""
        # Standard turn values - these are common turn increments
        return [0.0, 0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0]

    def get_available_orientations(self, arrow_color: str) -> List[str]:
        """Get available orientation values for specified arrow color"""
        # Standard orientations based on motion types
        return ["pro", "anti", "float", "dash", "static"]

    def apply_turn_adjustment(self, arrow_color: str, turn_value: float) -> bool:
        """Apply turn adjustment to selected arrow"""
        if not self._selected_beat or not self._selected_arrow_id:
            return False

        try:
            # In a full implementation, this would:
            # 1. Find the specific arrow in the beat
            # 2. Update its turn value
            # 3. Recalculate positions if needed
            # 4. Trigger UI updates

            # For now, just store the adjustment intent
            if self.ui_state_service:
                adjustment_key = (
                    f"turn_adjustment_{arrow_color}_{self._selected_arrow_id}"
                )
                self.ui_state_service.set_setting(adjustment_key, turn_value)

            return True

        except Exception as e:
            print(f"⚠️ Turn adjustment failed: {e}")
            return False

    def apply_orientation_adjustment(self, arrow_color: str, orientation: str) -> bool:
        """Apply orientation adjustment to selected arrow"""
        if not self._selected_beat or not self._selected_arrow_id:
            return False

        try:
            # In a full implementation, this would:
            # 1. Find the specific arrow in the beat
            # 2. Update its motion type/orientation
            # 3. Recalculate arrow rendering
            # 4. Trigger UI updates

            # For now, just store the adjustment intent
            if self.ui_state_service:
                adjustment_key = (
                    f"orientation_adjustment_{arrow_color}_{self._selected_arrow_id}"
                )
                self.ui_state_service.set_setting(adjustment_key, orientation)

            return True

        except Exception as e:
            print(f"⚠️ Orientation adjustment failed: {e}")
            return False

    def get_graph_editor_size_ratio(self) -> tuple[float, float]:
        """Get the size ratios for graph editor dimensions"""
        return (self._graph_height_ratio, self._max_width_ratio)

    def cleanup(self) -> None:
        """Clean up resources and state"""
        self._current_sequence = None
        self._selected_beat = None
        self._selected_beat_index = None
        self._selected_arrow_id = None
        self._is_visible = False
