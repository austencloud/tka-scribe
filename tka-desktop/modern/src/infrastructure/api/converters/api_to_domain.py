"""
Conversion utilities for transforming API models to domain models.
"""

from ..api_models import MotionAPI
from domain.models.core_models import (
    MotionData,
    MotionType,
    Location,
    RotationDirection,
)


def api_to_domain_motion(motion: MotionAPI) -> MotionData:
    """Convert API MotionAPI to domain MotionData."""
    return MotionData(
        motion_type=MotionType(motion.motion_type.value),
        prop_rot_dir=RotationDirection(motion.prop_rot_dir.value),
        start_loc=Location(motion.start_loc.value),
        end_loc=Location(motion.end_loc.value),
        turns=motion.turns,
        start_ori=motion.start_ori.value if motion.start_ori else "in",
        end_ori=motion.end_ori.value if motion.end_ori else "in",
    )
