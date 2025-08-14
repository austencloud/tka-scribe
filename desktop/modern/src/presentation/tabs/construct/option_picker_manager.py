"""
OptionPickerManager

Manages option picker initialization, population, and option selection for the construct tab.
Responsible for coordinating between the option picker component and sequence management.
"""

from __future__ import annotations

import time

from PyQt6.QtCore import QObject, pyqtSignal

from domain.models.pictograph_data import PictographData
from domain.models.sequence_data import SequenceData
from presentation.components.option_picker.core.option_picker import OptionPicker


class OptionPickerManager(QObject):
    """
    Manages option picker operations and interactions.

    Responsibilities:
    - Handling option picker population from start positions
    - Managing option selection events
    - Refreshing options based on sequence state
    - Working exclusively with PictographData

    Signals:
    - pictograph_selected: Emitted when a pictograph option is selected
    """

    pictograph_selected = pyqtSignal(object)  # PictographData object

    def __init__(
        self,
        option_picker: OptionPicker | None,
    ):
        super().__init__()
        self.option_picker = option_picker

        self._last_refresh_sequence_id = None
        self._last_refresh_length = None

        if self.option_picker:
            self.option_picker.pictograph_selected.connect(
                self._handle_pictograph_selected
            )

    def populate_from_start_position(
        self, position_key: str, start_position_data: PictographData
    ):
        """Populate option picker with valid motion combinations based on start position"""
        if self.option_picker is None:
            return

        try:
            # FIXED: Create modern SequenceData instead of legacy format to ensure orientation validation
            from desktop.modern.domain.models.beat_data import BeatData
            from desktop.modern.domain.models.sequence_data import SequenceData

            # Create a single beat with the start position data
            start_beat = BeatData(
                beat_number=1, pictograph_data=start_position_data, is_blank=False
            )

            # Create modern SequenceData with the start position beat
            modern_sequence_data = SequenceData(beats=[start_beat], length=1)

            # DEBUG: Check what orientations are in the sequence data being passed
            if start_position_data.motions:
                blue_motion = start_position_data.motions.get("blue")
                red_motion = start_position_data.motions.get("red")
                blue_end = (
                    blue_motion.end_ori.value
                    if blue_motion and blue_motion.end_ori
                    else "None"
                )
                red_end = (
                    red_motion.end_ori.value
                    if red_motion and red_motion.end_ori
                    else "None"
                )
                print(
                    f"🔍 [OPTION_PICKER_MANAGER] Sequence data end orientations: blue={blue_end}, red={red_end}"
                )

            # Use the modern refresh method that properly handles orientation validation
            self.option_picker.refresh_from_sequence(modern_sequence_data)

        except Exception as e:
            print(
                f"❌ [OPTION_PICKER_MANAGER] Error populating from start position: {e}"
            )
            import traceback

            traceback.print_exc()

            if self.option_picker is not None:
                try:
                    self.option_picker.refresh_options()
                except Exception as fallback_error:
                    print(
                        f"❌ [OPTION_PICKER_MANAGER] Fallback refresh failed: {fallback_error}"
                    )

    def refresh_from_sequence(self, sequence: SequenceData):
        """Refresh option picker based on current sequence state - PURE Modern IMPLEMENTATION"""
        if not self.option_picker or not sequence or sequence.length == 0:
            return

        start_time = time.perf_counter()

        try:
            self.option_picker.refresh_options_from_modern_sequence(sequence)
            (time.perf_counter() - start_time) * 1000
        except Exception:
            import traceback

            traceback.print_exc()

    def _handle_pictograph_selected(self, pictograph_data: PictographData):
        """Handle pictograph data selection from option picker and forward the signal"""
        self.pictograph_selected.emit(pictograph_data)

    def is_available(self) -> bool:
        """Check if option picker is available and functional"""
        return self.option_picker is not None
