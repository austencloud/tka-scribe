"""
Motion Data Converter - Handles motion data conversion between formats

Eliminates code duplication by centralizing all blue/red motion handling
in one place with symmetric extract/create methods.
"""

import logging
from dataclasses import dataclass
from typing import Any, Dict, Optional

from domain.models.enums import Location, MotionType, Orientation, RotationDirection
from domain.models.motion_models import MotionData
from domain.models.pictograph_data import PictographData

logger = logging.getLogger(__name__)


@dataclass
class MotionConversionResult:
    """Result of motion data conversion with validation info."""

    success: bool
    motion_data: Optional[MotionData] = None
    error: Optional[str] = None
    warnings: list[str] = None

    def __post_init__(self):
        if self.warnings is None:
            self.warnings = []


class MotionDataConverter:
    """Handles motion data conversion between modern and legacy formats."""

    @staticmethod
    def extract_motion_from_pictograph(
        color: str, pictograph: PictographData
    ) -> Optional[MotionData]:
        """
        Extract motion data for specific color from pictograph.

        Args:
            color: "blue" or "red"
            pictograph: PictographData containing motions

        Returns:
            MotionData if found, None otherwise
        """
        if not pictograph or not pictograph.motions:
            return None

        return pictograph.motions.get(color.lower())

    @staticmethod
    def create_legacy_motion_attributes(motion: Optional[MotionData]) -> Dict[str, Any]:
        """
        Create legacy motion attributes dictionary from MotionData.

        Args:
            motion: MotionData to convert, or None for default static motion

        Returns:
            Dictionary with legacy motion attributes
        """
        # Default static motion attributes
        default_attrs = {
            "motion_type": "static",
            "start_ori": "in",
            "end_ori": "in",
            "prop_rot_dir": "no_rot",
            "start_loc": "s",
            "end_loc": "s",
            "turns": 0,
        }

        if not motion:
            return default_attrs

        # Convert MotionData to legacy format
        try:
            return {
                "motion_type": motion.motion_type.value,
                "start_ori": motion.start_ori.value if hasattr(motion.start_ori, 'value') else str(motion.start_ori),
                "end_ori": motion.end_ori.value if hasattr(motion.end_ori, 'value') else str(motion.end_ori),
                "prop_rot_dir": motion.prop_rot_dir.value,
                "start_loc": motion.start_loc.value,
                "end_loc": motion.end_loc.value,
                "turns": int(motion.turns),
            }
        except AttributeError as e:
            logger.warning(f"Failed to convert motion data to legacy format: {e}")
            return default_attrs

    @staticmethod
    def create_motion_from_legacy_attributes(
        attrs: Dict[str, Any],
    ) -> MotionConversionResult:
        """
        Create MotionData from legacy attributes dictionary.

        Args:
            attrs: Dictionary with legacy motion attributes

        Returns:
            MotionConversionResult with success/error information
        """
        if not attrs:
            return MotionConversionResult(success=False, error="No attributes provided")

        try:
            motion_data = MotionData(
                motion_type=MotionType(attrs.get("motion_type", "static")),
                prop_rot_dir=RotationDirection(attrs.get("prop_rot_dir", "no_rot")),
                start_loc=Location(attrs.get("start_loc", "s")),
                end_loc=Location(attrs.get("end_loc", "s")),
                start_ori=Orientation(attrs.get("start_ori", "in")),
                end_ori=Orientation(attrs.get("end_ori", "in")),
                turns=float(attrs.get("turns", 0)),
            )

            return MotionConversionResult(success=True, motion_data=motion_data)

        except (ValueError, KeyError, TypeError) as e:
            error_msg = f"Failed to create motion data from legacy attributes: {e}"
            logger.warning(error_msg)

            # Create fallback static motion
            fallback_motion = MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.SOUTH,
                end_loc=Location.SOUTH,
                start_ori=Orientation.IN,
                end_ori=Orientation.IN,
                turns=0.0,
            )

            return MotionConversionResult(
                success=False,
                motion_data=fallback_motion,
                error=error_msg,
                warnings=[f"Using fallback static motion due to conversion error: {e}"],
            )

    @staticmethod
    def determine_timing_and_direction(
        blue_motion: Optional[MotionData], red_motion: Optional[MotionData]
    ) -> tuple[str, str]:
        """
        Determine timing and direction from blue and red motion data.

        Args:
            blue_motion: Blue motion data
            red_motion: Red motion data

        Returns:
            Tuple of (timing, direction) strings
        """
        # Default values
        timing = "tog"
        direction = "same"

        if blue_motion and red_motion:
            # Check if motions are in same direction
            if (
                blue_motion.motion_type == red_motion.motion_type
                and blue_motion.prop_rot_dir == red_motion.prop_rot_dir
            ):
                direction = "same"
            else:
                direction = "opp"

            # For now, default to "tog" timing - could be enhanced later
            timing = "tog"

        return timing, direction
