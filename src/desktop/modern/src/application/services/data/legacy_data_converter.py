"""
Legacy Data Converter Service

Handles conversion between modern BeatData/PictographData and legacy JSON formats.
This service consolidates all legacy format conversion logic that was previously
scattered across multiple managers.

ARCHITECTURE:
- Converts modern data structures to legacy JSON format for persistence
- Converts legacy JSON format back to modern data structures for loading
- Maintains compatibility with existing sequence files
"""

import logging
from typing import Any, Dict

from domain.models.beat_data import BeatData
from domain.models.enums import Location, MotionType, Orientation, RotationDirection
from domain.models.motion_models import MotionData

logger = logging.getLogger(__name__)


class LegacyDataConverter:
    """
    Service for converting between modern data structures and legacy JSON formats.

    This service handles all the complex conversion logic needed to maintain
    compatibility with existing sequence files while using modern data structures
    internally.
    """

    def convert_beat_to_legacy_format(
        self, beat: BeatData, beat_number: int
    ) -> Dict[str, Any]:
        """Convert modern BeatData to legacy JSON format exactly like legacy pictograph_data"""
        # Extract position data from glyph_data if available
        start_pos = ""
        end_pos = ""
        if beat.glyph_data:
            start_pos = beat.glyph_data.start_position or ""
            end_pos = beat.glyph_data.end_position or ""

        # Extract motion data from blue_motion and red_motion
        blue_attrs = {
            "motion_type": "static",
            "start_ori": "in",
            "end_ori": "in",
            "prop_rot_dir": "no_rot",
            "start_loc": "s",
            "end_loc": "s",
            "turns": 0,
        }

        red_attrs = {
            "motion_type": "static",
            "start_ori": "in",
            "end_ori": "in",
            "prop_rot_dir": "no_rot",
            "start_loc": "s",
            "end_loc": "s",
            "turns": 0,
        }

        # Extract blue motion data from embedded pictograph if available
        if (
            beat.has_pictograph
            and beat.pictograph_data.motions
            and "blue" in beat.pictograph_data.motions
        ):
            blue_motion = beat.pictograph_data.motions["blue"]
            blue_attrs.update(
                {
                    "motion_type": blue_motion.motion_type.value,
                    "start_ori": blue_motion.start_ori,
                    "end_ori": blue_motion.end_ori,
                    "prop_rot_dir": blue_motion.prop_rot_dir.value,
                    "start_loc": blue_motion.start_loc.value,
                    "end_loc": blue_motion.end_loc.value,
                    "turns": int(blue_motion.turns),
                }
            )

        # Extract red motion data from embedded pictograph if available
        if (
            beat.has_pictograph
            and beat.pictograph_data.motions
            and "red" in beat.pictograph_data.motions
        ):
            red_motion = beat.pictograph_data.motions["red"]
            red_attrs.update(
                {
                    "motion_type": red_motion.motion_type.value,
                    "start_ori": red_motion.start_ori,
                    "end_ori": red_motion.end_ori,
                    "prop_rot_dir": red_motion.prop_rot_dir.value,
                    "start_loc": red_motion.start_loc.value,
                    "end_loc": red_motion.end_loc.value,
                    "turns": int(red_motion.turns),
                }
            )

        # Determine timing and direction from motion data
        timing = "tog"  # Default
        direction = "same"  # Default

        # If we have motion data, try to determine timing/direction
        if (
            beat.has_pictograph
            and beat.pictograph_data.motions
            and "blue" in beat.pictograph_data.motions
            and "red" in beat.pictograph_data.motions
        ):
            blue_motion = beat.pictograph_data.motions["blue"]
            red_motion = beat.pictograph_data.motions["red"]
            # Check if blue and red are moving in same direction
            if (
                blue_motion.motion_type == red_motion.motion_type
                and blue_motion.prop_rot_dir == red_motion.prop_rot_dir
            ):
                direction = "same"
            else:
                direction = "opp"

            # For now, default to "tog" timing - this could be enhanced later
            timing = "tog"

        return {
            "beat": beat_number,
            "letter": beat.letter,
            "start_pos": start_pos,
            "end_pos": end_pos,
            "timing": timing,
            "direction": direction,
            "blue_attributes": blue_attrs,
            "red_attributes": red_attrs,
        }

    def convert_start_position_to_legacy_format(
        self, start_position_data: BeatData
    ) -> Dict[str, Any]:
        """Convert start position BeatData to legacy format exactly like JsonStartPositionHandler"""
        # Extract start position type (alpha, beta, gamma) from glyph_data if available
        end_pos = "alpha1"  # Default
        sequence_start_position = "alpha1"  # Default

        if start_position_data.glyph_data:
            end_pos = start_position_data.glyph_data.end_position or "alpha1"
            sequence_start_position = (
                start_position_data.glyph_data.start_position or "alpha1"
            )

        # Default attributes for start positions (usually static)
        blue_attrs = {
            "end_ori": "in",
            "start_ori": "in",
            "prop_rot_dir": "no_rot",
            "start_loc": "s",
            "end_loc": "s",
            "turns": 0,
            "motion_type": "static",
        }

        red_attrs = {
            "end_ori": "in",
            "start_ori": "in",
            "prop_rot_dir": "no_rot",
            "start_loc": "s",
            "end_loc": "s",
            "turns": 0,
            "motion_type": "static",
        }

        # Extract blue motion data from embedded pictograph if available (though start positions are usually static)
        if (
            start_position_data.has_pictograph
            and start_position_data.pictograph_data.motions
            and "blue" in start_position_data.pictograph_data.motions
        ):
            blue_motion = start_position_data.pictograph_data.motions["blue"]
            blue_attrs.update(
                {
                    "start_loc": blue_motion.start_loc.value,
                    "end_loc": blue_motion.end_loc.value,
                    "start_ori": blue_motion.start_ori,
                    "end_ori": blue_motion.end_ori,
                    "prop_rot_dir": blue_motion.prop_rot_dir.value,
                    "turns": int(blue_motion.turns),
                    "motion_type": blue_motion.motion_type.value,
                }
            )

        # Extract red motion data from embedded pictograph if available
        if (
            start_position_data.has_pictograph
            and start_position_data.pictograph_data.motions
            and "red" in start_position_data.pictograph_data.motions
        ):
            red_motion = start_position_data.pictograph_data.motions["red"]
            red_attrs.update(
                {
                    "start_loc": red_motion.start_loc.value,
                    "end_loc": red_motion.end_loc.value,
                    "start_ori": red_motion.start_ori,
                    "end_ori": red_motion.end_ori,
                    "prop_rot_dir": red_motion.prop_rot_dir.value,
                    "turns": int(red_motion.turns),
                    "motion_type": red_motion.motion_type.value,
                }
            )

        return {
            "beat": 0,
            "sequence_start_position": sequence_start_position,
            "end_pos": end_pos,
            "blue_attributes": blue_attrs,
            "red_attributes": red_attrs,
        }

    def convert_legacy_to_beat_data(
        self, beat_dict: dict, beat_number: int
    ) -> BeatData:
        """Convert legacy JSON format back to modern BeatData with full pictograph data"""
        from domain.models import (
            ArrowData,
            BeatData,
            GlyphData,
            GridData,
            PictographData,
        )

        # Extract basic beat information
        letter = beat_dict.get("letter", "")
        start_pos = beat_dict.get("start_pos", "")
        end_pos = beat_dict.get("end_pos", "")

        # Create glyph data
        glyph_data = GlyphData(
            start_position=start_pos,
            end_position=end_pos,
        )

        # Convert blue attributes to MotionData
        blue_motion = None
        blue_attrs = beat_dict.get("blue_attributes", {})
        if blue_attrs:
            try:
                blue_motion = MotionData(
                    motion_type=MotionType(blue_attrs.get("motion_type", "static")),
                    prop_rot_dir=RotationDirection(
                        blue_attrs.get("prop_rot_dir", "no_rot")
                    ),
                    start_loc=Location(blue_attrs.get("start_loc", "s")),
                    end_loc=Location(blue_attrs.get("end_loc", "s")),
                    start_ori=Orientation(blue_attrs.get("start_ori", "in")),
                    end_ori=Orientation(blue_attrs.get("end_ori", "in")),
                )
            except Exception as e:
                logger.warning(f"Failed to create blue motion data: {e}")
                # Fallback to static motion
                blue_motion = MotionData(
                    motion_type=MotionType.STATIC,
                    prop_rot_dir=RotationDirection.NO_ROTATION,
                    start_loc=Location.SOUTH,
                    end_loc=Location.SOUTH,
                    start_ori=Orientation.IN,
                    end_ori=Orientation.IN,
                )

        # Convert red attributes to MotionData
        red_motion = None
        red_attrs = beat_dict.get("red_attributes", {})
        if red_attrs:
            try:
                red_motion = MotionData(
                    motion_type=MotionType(red_attrs.get("motion_type", "static")),
                    prop_rot_dir=RotationDirection(
                        red_attrs.get("prop_rot_dir", "no_rot")
                    ),
                    start_loc=Location(red_attrs.get("start_loc", "s")),
                    end_loc=Location(red_attrs.get("end_loc", "s")),
                    start_ori=Orientation(red_attrs.get("start_ori", "in")),
                    end_ori=Orientation(red_attrs.get("end_ori", "in")),
                )
            except Exception as e:
                logger.warning(f"Failed to create red motion data: {e}")
                # Fallback to static motion
                red_motion = MotionData(
                    motion_type=MotionType.STATIC,
                    prop_rot_dir=RotationDirection.NO_ROTATION,
                    start_loc=Location.SOUTH,
                    end_loc=Location.SOUTH,
                    start_ori=Orientation.IN,
                    end_ori=Orientation.IN,
                )

        # Create motions dictionary
        motions = {}
        if blue_motion:
            motions["blue"] = blue_motion
        if red_motion:
            motions["red"] = red_motion

        # Create PictographData with motion data
        pictograph_data = PictographData(
            motions=motions,
            letter=letter,
            start_position=start_pos,
            end_position=end_pos,
            grid_data=GridData(),
            arrows={},  # Will be populated based on motions if needed
            is_blank=len(motions) == 0,
        )

        # Create BeatData with embedded pictograph
        beat_data = BeatData(
            beat_number=beat_number,
            letter=letter,
            duration=1.0,
            pictograph_data=pictograph_data,
            glyph_data=glyph_data,
            is_blank=len(motions) == 0,
            metadata={
                "timing": beat_dict.get("timing", "tog"),
                "direction": beat_dict.get("direction", "same"),
            },
        )

        return beat_data

    def convert_legacy_start_position_to_beat_data(
        self, start_pos_dict: dict
    ) -> BeatData:
        """Convert legacy start position JSON back to modern BeatData with full data"""
        from domain.models import BeatData, GlyphData, GridData, PictographData

        # Extract basic start position information
        letter = start_pos_dict.get("letter", "")
        sequence_start_position = start_pos_dict.get(
            "sequence_start_position", "alpha1"
        )
        end_pos = start_pos_dict.get("end_pos", "alpha1")

        # Create glyph data for start position
        glyph_data = GlyphData(
            start_position=sequence_start_position,
            end_position=end_pos,
        )

        # Convert blue attributes to MotionData (start positions usually static)
        blue_motion = None
        blue_attrs = start_pos_dict.get("blue_attributes", {})
        if blue_attrs:
            try:
                blue_motion = MotionData(
                    motion_type=MotionType(blue_attrs.get("motion_type", "static")),
                    prop_rot_dir=RotationDirection(
                        blue_attrs.get("prop_rot_dir", "no_rot")
                    ),
                    start_loc=Location(blue_attrs.get("start_loc", "s")),
                    end_loc=Location(blue_attrs.get("end_loc", "s")),
                    start_ori=Orientation(blue_attrs.get("start_ori", "in")),
                    end_ori=Orientation(blue_attrs.get("end_ori", "in")),
                )
            except Exception as e:
                logger.warning(
                    f"Failed to create blue motion data for start position: {e}"
                )
                blue_motion = MotionData(
                    motion_type=MotionType.STATIC,
                    prop_rot_dir=RotationDirection.NO_ROTATION,
                    start_loc=Location.SOUTH,
                    end_loc=Location.SOUTH,
                )

        # Convert red attributes to MotionData
        red_motion = None
        red_attrs = start_pos_dict.get("red_attributes", {})
        if red_attrs:
            try:
                red_motion = MotionData(
                    motion_type=MotionType(red_attrs.get("motion_type", "static")),
                    prop_rot_dir=RotationDirection(
                        red_attrs.get("prop_rot_dir", "no_rot")
                    ),
                    start_loc=Location(red_attrs.get("start_loc", "s")),
                    end_loc=Location(red_attrs.get("end_loc", "s")),
                    start_ori=Orientation(red_attrs.get("start_ori", "in")),
                    end_ori=Orientation(red_attrs.get("end_ori", "in")),
                )
            except Exception as e:
                logger.warning(
                    f"Failed to create red motion data for start position: {e}"
                )
                red_motion = MotionData(
                    motion_type=MotionType.STATIC,
                    prop_rot_dir=RotationDirection.NO_ROTATION,
                    start_loc=Location.SOUTH,
                    end_loc=Location.SOUTH,
                )

        # Create motions dictionary
        motions = {}
        if blue_motion:
            motions["blue"] = blue_motion
        if red_motion:
            motions["red"] = red_motion

        # Create PictographData with motion data
        pictograph_data = PictographData(
            motions=motions,
            letter=letter,
            start_position=sequence_start_position,
            end_position=end_pos,
            grid_data=GridData(),
            arrows={},  # Will be populated based on motions if needed
            is_blank=len(motions) == 0,
        )

        # Create start position BeatData with embedded pictograph
        start_position_beat = BeatData(
            beat_number=0,  # Start position is always beat 0
            letter=letter,
            duration=0.0,  # Start positions have no duration
            pictograph_data=pictograph_data,
            glyph_data=glyph_data,
            is_blank=len(motions) == 0,
            metadata={
                "is_start_position": True,
                "sequence_start_position": sequence_start_position,
            },
        )

        return start_position_beat
