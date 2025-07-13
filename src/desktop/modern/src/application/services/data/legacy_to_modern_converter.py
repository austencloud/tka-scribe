"""
Legacy to Modern Converter

Handles conversion from legacy JSON format to modern domain models.
Focused solely on legacy-to-modern data transformation.
"""

import logging

# Forward reference for PictographData
from typing import TYPE_CHECKING, Any, Dict, Optional

from domain.models.beat_data import BeatData
from domain.models.glyph_data import GlyphData
from domain.models.motion_data import MotionData

if TYPE_CHECKING:
    from domain.models.pictograph_data import PictographData

from .position_attribute_mapper import PositionAttributeMapper

logger = logging.getLogger(__name__)


class LegacyToModernConverter:
    """
    Converts legacy JSON format to modern domain models.

    Responsible for:
    - Converting legacy beat JSON to BeatData
    - Converting legacy start position JSON to BeatData
    - Handling legacy attribute format transformations
    - Maintaining data fidelity during conversion
    """

    def __init__(self):
        """Initialize the legacy to modern converter."""
        self.position_mapper = PositionAttributeMapper()

    def convert_legacy_to_beat_data(
        self, beat_dict: dict, beat_number: int
    ) -> BeatData:
        """
        Convert legacy JSON format to modern BeatData with full pictograph data.

        Args:
            beat_dict: Legacy beat dictionary
            beat_number: Beat number to assign

        Returns:
            BeatData object with converted motion information
        """
        try:
            # Extract basic beat info
            duration = beat_dict.get("duration", 1.0)

            # Extract position data
            start_pos = beat_dict.get("start_pos", "")
            end_pos = beat_dict.get("end_pos", "")

            # Extract motion attributes
            blue_attrs = beat_dict.get("blue_attributes", {})
            red_attrs = beat_dict.get("red_attributes", {})

            # Create motion data for blue and red
            blue_motion = self._create_motion_data_from_attributes(blue_attrs)
            red_motion = self._create_motion_data_from_attributes(red_attrs)

            # Create glyph data as proper GlyphData object
            glyph_data = GlyphData(
                start_position=start_pos,
                end_position=end_pos,
            )

            # Create PictographData with motion data
            pictograph_data = self._create_pictograph_data_from_legacy(
                beat_dict, blue_motion, red_motion, glyph_data
            )

            # Create complete beat data with pictograph reference
            beat_data = BeatData(
                beat_number=beat_number,
                duration=duration,
                pictograph_data=pictograph_data,  # NEW: Reference to pictograph with motion data
            )

            return beat_data

        except Exception as e:
            logger.error(f"Error converting legacy beat data: {e}")
            raise e

    def _create_motion_data_from_attributes(self, attrs: Dict[str, Any]) -> MotionData:
        """
        Create MotionData from legacy motion attributes.

        Args:
            attrs: Legacy motion attributes dictionary

        Returns:
            MotionData object
        """
        # Validate and convert attributes
        validated_attrs = self.position_mapper.validate_position_attributes(attrs)

        return MotionData(
            motion_type=validated_attrs["motion_type"],
            start_loc=validated_attrs["start_loc"],
            end_loc=validated_attrs["end_loc"],
            start_ori=validated_attrs["start_ori"],
            end_ori=validated_attrs["end_ori"],
            prop_rot_dir=validated_attrs["prop_rot_dir"],
            turns=validated_attrs["turns"],
        )

    def _create_pictograph_data_from_legacy(
        self,
        beat_dict: dict,
        blue_motion: MotionData,
        red_motion: MotionData,
        glyph_data: GlyphData,
    ) -> "PictographData":
        """Create PictographData from legacy beat data with motion data."""
        from domain.models.arrow_data import ArrowData
        from domain.models.enums import GridMode
        from domain.models.grid_data import GridData
        from domain.models.pictograph_data import PictographData

        # Create arrows (without motion data)
        arrows = {}
        if blue_motion:
            arrows["blue"] = ArrowData(color="blue", is_visible=True)
        if red_motion:
            arrows["red"] = ArrowData(color="red", is_visible=True)

        # Create grid data
        grid_data = GridData(grid_mode=GridMode.DIAMOND)

        # Create motions dictionary
        motions = {}
        if blue_motion:
            motions["blue"] = blue_motion
        if red_motion:
            motions["red"] = red_motion

        # Create pictograph with motion dictionary
        return PictographData(
            grid_data=grid_data,
            arrows=arrows,
            props={},
            motions=motions,  # NEW: Motion dictionary (consistent with arrows/props)
            letter=beat_dict.get("letter"),
            start_position=beat_dict.get("start_pos", ""),
            end_position=beat_dict.get("end_pos", ""),
            glyph_data=glyph_data,
            metadata={"source": "legacy_conversion"},
        )

    def convert_legacy_start_position_to_beat_data(
        self, legacy_start_position: str
    ) -> Optional[BeatData]:
        """Convert a legacy start position to a BeatData object."""
        # TODO: Implement this method
        pass
