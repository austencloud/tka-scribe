#!/usr/bin/env python3
"""
Test script to reproduce the sequence data synchronization issue.

This script tests the data flow from start position selection -> option picker selection
-> sequence update -> option picker refresh to identify where sequence data is getting lost.
"""

import os
import sys

# Add the project root to the path
sys.path.insert(0, os.path.abspath("."))
sys.path.insert(0, os.path.join(os.path.abspath("."), "src"))

from src.desktop.modern.domain.models.beat_data import BeatData
from src.desktop.modern.domain.models.enums import (
    Location,
    MotionType,
    Orientation,
    RotationDirection,
)
from src.desktop.modern.domain.models.motion_data import MotionData
from src.desktop.modern.domain.models.pictograph_data import PictographData
from src.desktop.modern.domain.models.prop_data import PropData, PropType
from src.desktop.modern.domain.models.sequence_data import SequenceData
from src.shared.application.services.option_picker.sequence_option_service import (
    SequenceOptionService,
)
from src.shared.application.services.pictograph.pictograph_position_matcher import (
    PictographPositionMatcher,
)
from src.shared.application.services.sequence.sequence_orientation_validator import (
    SequenceOrientationValidator,
)


def create_test_pictograph_data(
    letter: str, start_pos: str, end_pos: str
) -> PictographData:
    """Create a test pictograph data object."""

    # Create motion data
    blue_motion = MotionData(
        motion_type=MotionType.PRO,
        prop_rot_dir=RotationDirection.CLOCKWISE,
        start_loc=Location.NORTH,
        end_loc=Location.SOUTH,
        turns=1.0,
        start_ori=Orientation.IN,
        end_ori=Orientation.OUT,
    )

    red_motion = MotionData(
        motion_type=MotionType.ANTI,
        prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
        start_loc=Location.SOUTH,
        end_loc=Location.NORTH,
        turns=1.0,
        start_ori=Orientation.OUT,
        end_ori=Orientation.IN,
    )

    # Create prop data
    blue_prop = PropData(
        prop_type=PropType.STAFF,
        orientation=Orientation.IN,
        location=Location.NORTH,
    )

    red_prop = PropData(
        prop_type=PropType.STAFF,
        orientation=Orientation.OUT,
        location=Location.SOUTH,
    )

    return PictographData(
        letter=letter,
        start_position=start_pos,
        end_position=end_pos,
        motions={"blue": blue_motion, "red": red_motion},
        props={"blue": blue_prop, "red": red_prop},
    )


def test_sequence_data_flow():
    """Test the complete sequence data flow."""

    print("🧪 Testing sequence data flow...")

    # Step 1: Create a start position
    print("\n📍 Step 1: Creating start position")
    start_pictograph = create_test_pictograph_data("A", "alpha1", "alpha1")
    start_beat = BeatData(
        beat_number=1, pictograph_data=start_pictograph, is_blank=False
    )

    # Step 2: Create initial sequence with start position
    print("\n🔄 Step 2: Creating initial sequence")
    sequence = SequenceData(
        name="Test Sequence", beats=[start_beat], start_position="alpha1"
    )

    print(f"Initial sequence: {sequence.length} beats")
    for i, beat in enumerate(sequence.beats):
        print(
            f"  Beat {i}: {beat.pictograph_data.letter} ({beat.pictograph_data.start_position} -> {beat.pictograph_data.end_position})"
        )

    # Step 3: Test sequence orientation validator
    print("\n🔍 Step 3: Testing sequence orientation validator")
    validator = SequenceOrientationValidator()
    end_orientations = validator.get_sequence_end_orientations(sequence)
    print(f"End orientations: {end_orientations}")

    # Step 4: Test sequence option service
    print("\n⚙️ Step 4: Testing sequence option service")
    try:
        position_matcher = PictographPositionMatcher()
        option_service = SequenceOptionService(position_matcher)

        options = option_service.get_options_for_sequence(sequence)
        print(f"Options returned: {len(options)} letter types")
        for letter_type, option_list in options.items():
            print(f"  {letter_type}: {len(option_list)} options")

    except Exception as e:
        print(f"❌ Error in option service: {e}")
        import traceback

        traceback.print_exc()

    # Step 5: Add a second beat and test again
    print("\n➕ Step 5: Adding second beat")
    # Use beta3 instead of beta2 since beta3 is a valid start position
    second_pictograph = create_test_pictograph_data("B", "alpha1", "beta3")
    second_beat = BeatData(
        beat_number=2, pictograph_data=second_pictograph, is_blank=False
    )

    print(f"Second beat end position: {second_pictograph.end_position}")

    # Check what pictographs are available that start from beta3
    print(f"\n🔍 Checking available pictographs that start from 'beta3':")
    try:
        position_matcher = PictographPositionMatcher()

        # First, check what start positions are available in the dataset
        available_positions = position_matcher.get_available_start_positions()
        print(f"Available start positions in dataset: {len(available_positions)}")
        print(f"First 10 positions: {available_positions[:10]}")

        # Check if beta3 is in the available positions
        if "beta3" in available_positions:
            print("✅ beta3 is available as a start position")
        else:
            print("❌ beta3 is NOT available as a start position")
            # Find similar positions
            beta_positions = [
                pos for pos in available_positions if pos.startswith("beta")
            ]
            print(f"Available beta positions: {beta_positions}")

        # Try to get options for beta3
        beta3_pictographs = position_matcher.get_next_options("beta3")
        print(f"Found {len(beta3_pictographs)} pictographs starting from beta3")
        if beta3_pictographs:
            for i, pic in enumerate(beta3_pictographs[:3]):  # Show first 3
                print(
                    f"  {i+1}. {pic.letter} ({pic.start_position} -> {pic.end_position})"
                )
    except Exception as e:
        print(f"❌ Error checking beta3 pictographs: {e}")
        import traceback

        traceback.print_exc()

    # Create updated sequence
    updated_sequence = sequence.add_beat(second_beat)
    print(f"Updated sequence: {updated_sequence.length} beats")
    for i, beat in enumerate(updated_sequence.beats):
        print(
            f"  Beat {i}: {beat.pictograph_data.letter} ({beat.pictograph_data.start_position} -> {beat.pictograph_data.end_position})"
        )

    # Step 6: Test orientation validator with updated sequence
    print("\n🔍 Step 6: Testing orientation validator with updated sequence")
    end_orientations_updated = validator.get_sequence_end_orientations(updated_sequence)
    print(f"Updated end orientations: {end_orientations_updated}")

    # Step 7: Test option service with updated sequence
    print("\n⚙️ Step 7: Testing option service with updated sequence")
    try:
        options_updated = option_service.get_options_for_sequence(updated_sequence)
        print(f"Updated options returned: {len(options_updated)} letter types")
        for letter_type, option_list in options_updated.items():
            print(f"  {letter_type}: {len(option_list)} options")

    except Exception as e:
        print(f"❌ Error in updated option service: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    test_sequence_data_flow()
