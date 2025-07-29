#!/usr/bin/env python3
"""
Test script to reproduce the orientation issue.
"""

import os
import sys

# Add the TKA paths
import tka_paths
from desktop.modern.core.config.data_config import create_data_config
from desktop.modern.domain.models.beat_data import BeatData
from desktop.modern.domain.models.motion_data import MotionData
from desktop.modern.domain.models.pictograph_data import PictographData
from desktop.modern.domain.models.sequence_data import SequenceData
from shared.application.services.data.data_service import DataManager
from shared.application.services.data.pictograph_data_manager import (
    PictographDataManager,
)

# Import required modules (avoiding circular imports)
from shared.application.services.pictograph.pictograph_position_matcher import (
    PictographPositionMatcher,
)
from shared.application.services.sequence.sequence_orientation_validator import (
    SequenceOrientationValidator,
)


def create_test_sequence():
    """Create a test sequence with alpha1 start position and J pictograph."""

    from desktop.modern.domain.models.enums import (
        Location,
        MotionType,
        Orientation,
        RotationDirection,
    )

    # Create motion data for J pictograph (alpha1 -> beta7)
    blue_motion = MotionData(
        motion_type=MotionType.PRO,
        prop_rot_dir=RotationDirection.CLOCKWISE,
        start_loc=Location.NORTH,  # Simplified for test
        end_loc=Location.SOUTH,  # Simplified for test
        start_ori=Orientation.IN,
        end_ori=Orientation.OUT,
    )
    red_motion = MotionData(
        motion_type=MotionType.PRO,
        prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
        start_loc=Location.NORTH,  # Simplified for test
        end_loc=Location.SOUTH,  # Simplified for test
        start_ori=Orientation.IN,
        end_ori=Orientation.OUT,
    )

    # Create pictograph data for J
    j_pictograph = PictographData(
        letter="J",
        start_position="alpha1",
        end_position="beta7",
        motions={"blue": blue_motion, "red": red_motion},
    )

    # Create beat data
    beat_1 = BeatData(beat_number=1, pictograph_data=j_pictograph, is_blank=False)

    # Create sequence data
    sequence = SequenceData(beats=[beat_1], start_position="alpha1")

    return sequence


def test_orientation_issue():
    """Test the orientation issue by calling the sequence option service."""

    print("🔍 Testing orientation issue...")

    # Initialize services
    position_matcher = PictographPositionMatcher()
    orientation_validator = SequenceOrientationValidator()

    # Create test sequence
    test_sequence = create_test_sequence()
    print(f"🔍 Created test sequence with {len(test_sequence.beats)} beats")
    print(f"🔍 Start position: {test_sequence.start_position}")
    print(f"🔍 First beat letter: {test_sequence.beats[0].pictograph_data.letter}")
    print(
        f"🔍 First beat end position: {test_sequence.beats[0].pictograph_data.end_position}"
    )

    # Test the orientation validator directly
    print("\n🔍 Testing orientation validator directly...")

    # Get all options for beta7 position
    all_options = position_matcher.get_next_options("beta7")
    print(f"🔍 Position matcher found {len(all_options)} options for beta7")

    # Test the orientation validator
    print("\n🔍 Calling orientation validator...")
    updated_options = orientation_validator.calculate_option_start_orientations(
        test_sequence, all_options
    )

    print(f"\n🔍 Got {len(updated_options)} updated options")

    # Show first few options with their orientations
    for i, option in enumerate(updated_options[:5]):
        blue_motion = option.motions.get("blue")
        red_motion = option.motions.get("red")
        blue_start = blue_motion.start_ori if blue_motion else "None"
        red_start = red_motion.start_ori if red_motion else "None"
        print(f"   Option {i+1} ({option.letter}): Blue={blue_start}, Red={red_start}")


if __name__ == "__main__":
    test_orientation_issue()
