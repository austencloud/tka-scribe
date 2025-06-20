"""
Conversion utilities for transforming domain models to API models.
"""

from typing import Optional
from ..api_models import (
    BeatAPI,
    SequenceAPI,
    MotionAPI,
    MotionTypeAPI,
    RotationDirectionAPI,
    LocationAPI,
)
from domain.models.core_models import (
    SequenceData,
    BeatData,
    MotionData,
    MotionType,
    Location,
    RotationDirection,
    Orientation,
)


def domain_to_api_motion(motion: MotionData) -> MotionAPI:
    """Convert domain MotionData to API MotionAPI."""
    return MotionAPI(
        motion_type=MotionTypeAPI(motion.motion_type.value),
        prop_rot_dir=RotationDirectionAPI(motion.prop_rot_dir.value),
        start_loc=LocationAPI(motion.start_loc.value),
        end_loc=LocationAPI(motion.end_loc.value),
        turns=motion.turns,
        start_ori=motion.start_ori.value if motion.start_ori else "in",
        end_ori=motion.end_ori.value if motion.end_ori else "in",
    )


def domain_to_api_beat(beat: BeatData) -> BeatAPI:
    """Convert domain BeatData to API BeatAPI."""
    blue_motion = domain_to_api_motion(beat.blue_motion) if beat.blue_motion else None
    red_motion = domain_to_api_motion(beat.red_motion) if beat.red_motion else None

    return BeatAPI(
        id=beat.id,
        beat_number=beat.beat_number,
        letter=beat.letter,
        duration=beat.duration,
        blue_motion=blue_motion,
        red_motion=red_motion,
        blue_reversal=beat.blue_reversal,
        red_reversal=beat.red_reversal,
        is_blank=beat.is_blank,
        metadata=beat.metadata,
    )


def domain_to_api_sequence(sequence: SequenceData) -> SequenceAPI:
    """Convert domain SequenceData to API SequenceAPI."""
    api_beats = [domain_to_api_beat(beat) for beat in sequence.beats]

    return SequenceAPI(
        id=sequence.id,
        name=sequence.name,
        word=sequence.word,
        beats=api_beats,
        start_position=sequence.start_position,
        metadata=sequence.metadata,
    )
