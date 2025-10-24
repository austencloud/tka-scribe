"""
Beat Data Builder - Builder pattern for creating BeatData objects

Provides a clean, testable way to construct complex BeatData objects
with optional fields and proper validation.
"""
from __future__ import annotations

import logging
from typing import Any

from desktop.modern.src.domain.models.beat_data import BeatData
from desktop.modern.src.domain.models.enums import GridMode
from desktop.modern.src.domain.models.glyph_models import GlyphData
from desktop.modern.src.domain.models.grid_data import GridData
from desktop.modern.src.domain.models.motion_models import MotionData
from desktop.modern.src.domain.models.pictograph_data import PictographData


logger = logging.getLogger(__name__)


class BeatDataBuilder:
    """Builder pattern for creating BeatData objects with complex construction."""

    def __init__(self):
        """Initialize builder with default values."""
        self._beat_number: int = 1
        self._letter: str = ""
        self._duration: float = 1.0
        self._is_blank: bool = True
        self._metadata: dict[str, Any] = {}
        self._glyph_data: GlyphData | None = None
        self._pictograph_data: PictographData | None = None
        self._blue_motion: MotionData | None = None
        self._red_motion: MotionData | None = None
        self._start_position: str = ""
        self._end_position: str = ""

    def with_beat_number(self, beat_number: int) -> BeatDataBuilder:
        """Set the beat number."""
        self._beat_number = beat_number
        return self

    def with_letter(self, letter: str) -> BeatDataBuilder:
        """Set the beat letter."""
        self._letter = letter
        return self

    def with_duration(self, duration: float) -> BeatDataBuilder:
        """Set the beat duration."""
        self._duration = duration
        return self

    def with_motion_data(
        self, blue: MotionData | None, red: MotionData | None
    ) -> BeatDataBuilder:
        """Set blue and red motion data."""
        self._blue_motion = blue
        self._red_motion = red
        self._is_blank = not (blue or red)
        return self

    def with_positions(self, start_pos: str, end_pos: str) -> BeatDataBuilder:
        """Set start and end positions."""
        self._start_position = start_pos
        self._end_position = end_pos
        return self

    def with_glyph_data(self, start_pos: str, end_pos: str) -> BeatDataBuilder:
        """Set glyph data with positions."""
        self._glyph_data = GlyphData(start_position=start_pos, end_position=end_pos)
        self._start_position = start_pos
        self._end_position = end_pos
        return self

    def with_metadata(self, metadata: dict[str, Any]) -> BeatDataBuilder:
        """Set metadata dictionary."""
        self._metadata = metadata.copy()
        return self

    def add_metadata(self, key: str, value: Any) -> BeatDataBuilder:
        """Add a single metadata entry."""
        self._metadata[key] = value
        return self

    def as_start_position(
        self, sequence_start_position: str = "alpha1"
    ) -> BeatDataBuilder:
        """Configure as start position beat."""
        self._beat_number = 0
        self._duration = 0.0
        self.add_metadata("is_start_position", True)
        self.add_metadata("sequence_start_position", sequence_start_position)
        return self

    def build(self) -> BeatData:
        """
        Build the BeatData object with all configured properties.

        Returns:
            Constructed BeatData object

        Raises:
            ValueError: If required data is missing or invalid
        """
        # Create motions dictionary
        motions = {}
        if self._blue_motion:
            motions["blue"] = self._blue_motion
        if self._red_motion:
            motions["red"] = self._red_motion

        # Create pictograph data if we have motions or positions
        pictograph_data = None
        if motions or self._start_position or self._end_position:
            pictograph_data = PictographData(
                motions=motions,
                letter=self._letter,
                start_position=self._start_position,
                end_position=self._end_position,
                grid_data=GridData(grid_mode=GridMode.DIAMOND),  # Default grid mode
                arrows={},  # Will be populated based on motions if needed
                is_blank=self._is_blank,
                metadata=self._metadata.copy(),
            )

        # Create glyph data if not already set
        if not self._glyph_data and (self._start_position or self._end_position):
            self._glyph_data = GlyphData(
                start_position=self._start_position, end_position=self._end_position
            )

        # Build the BeatData
        try:
            beat_data = BeatData(
                beat_number=self._beat_number,
                duration=self._duration,
                pictograph_data=pictograph_data,
                is_blank=self._is_blank,
                metadata=self._metadata.copy(),
            )

            logger.debug(
                f"Built BeatData: beat_number={self._beat_number}, letter={self._letter}"
            )
            return beat_data

        except Exception as e:
            error_msg = f"Failed to build BeatData: {e}"
            logger.exception(error_msg)
            raise ValueError(error_msg) from e

    def reset(self) -> BeatDataBuilder:
        """Reset builder to default state for reuse."""
        self.__init__()
        return self
