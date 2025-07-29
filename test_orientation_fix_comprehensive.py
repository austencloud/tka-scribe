#!/usr/bin/env python3
"""
Comprehensive test to verify that the orientation fix works correctly.

This test verifies that:
1. Motion start orientations are updated correctly for sequence continuity
2. Motion end orientations are calculated correctly based on motion type and turns
3. Prop orientations are updated to match motion END orientations (legacy pattern)
4. The sequence orientation validator works correctly for multi-beat sequences
"""

import os
import sys

# Add the project root to the path
sys.path.insert(0, os.path.abspath("."))

from src.desktop.modern.domain.models.beat_data import BeatData
from src.desktop.modern.domain.models.enums import (
    Location,
    MotionType,
    Orientation,
    PropType,
    RotationDirection,
)
from src.desktop.modern.domain.models.motion_data import MotionData
from src.desktop.modern.domain.models.pictograph_data import PictographData
from src.desktop.modern.domain.models.prop_data import PropData
from src.desktop.modern.domain.models.sequence_data import SequenceData

# Import tka_paths first to set up the path
from src.infrastructure.paths import tka_paths
from src.shared.application.services.sequence.sequence_orientation_validator import (
    SequenceOrientationValidator,
)


def create_test_pictograph(
    letter,
    start_pos,
    end_pos,
    blue_motion_type=MotionType.ANTI,
    red_motion_type=MotionType.ANTI,
):
    """Create a test pictograph with specific motion types."""

    # Create motion data
    blue_motion = MotionData(
        motion_type=blue_motion_type,
        prop_rot_dir=RotationDirection.CLOCKWISE,
        start_loc=Location.SOUTH,
        end_loc=Location.EAST,
        turns=0.0,
        start_ori=Orientation.IN,  # Will be updated by validator
        end_ori=Orientation.IN,  # Will be calculated by validator
        is_visible=True,
    )

    red_motion = MotionData(
        motion_type=red_motion_type,
        prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
        start_loc=Location.NORTH,
        end_loc=Location.WEST,
        turns=0.0,
        start_ori=Orientation.OUT,  # Will be updated by validator
        end_ori=Orientation.OUT,  # Will be calculated by validator
        is_visible=True,
    )

    # Create prop data
    blue_prop = PropData(
        prop_type=PropType.STAFF,
        color="blue",
        orientation=Orientation.IN,  # Will be updated by validator
        rotation_direction=RotationDirection.NO_ROTATION,
        is_visible=True,
    )

    red_prop = PropData(
        prop_type=PropType.STAFF,
        color="red",
        orientation=Orientation.OUT,  # Will be updated by validator
        rotation_direction=RotationDirection.NO_ROTATION,
        is_visible=True,
    )

    # Create pictograph data
    pictograph_data = PictographData(
        motions={"blue": blue_motion, "red": red_motion},
        props={"blue": blue_prop, "red": red_prop},
        letter=letter,
        start_position=start_pos,
        end_position=end_pos,
    )

    return pictograph_data


def create_test_sequence():
    """Create a test sequence with multiple beats."""

    # Beat 1: K (alpha1 → beta3)
    beat1_pictograph = create_test_pictograph("K", "alpha1", "beta3")
    beat1 = BeatData(beat_number=1, pictograph_data=beat1_pictograph)

    # Beat 2: E (beta3 → alpha5)
    beat2_pictograph = create_test_pictograph("E", "beta3", "alpha5")
    beat2 = BeatData(beat_number=2, pictograph_data=beat2_pictograph)

    # Create sequence
    sequence = SequenceData(name="Test Sequence", beats=[beat1, beat2])

    return sequence


def test_orientation_validator_comprehensive():
    """Test the orientation validator comprehensively."""
    print("🧪 Testing Orientation Validator Comprehensive Fix...")

    # Create test sequence
    sequence = create_test_sequence()

    print(f"\n📊 Initial sequence state:")
    print(
        f"  Beat 1 (K): {sequence.beats[0].pictograph_data.start_position} → {sequence.beats[0].pictograph_data.end_position}"
    )
    print(
        f"    Blue motion: start={sequence.beats[0].pictograph_data.motions['blue'].start_ori}, end={sequence.beats[0].pictograph_data.motions['blue'].end_ori}"
    )
    print(
        f"    Red motion: start={sequence.beats[0].pictograph_data.motions['red'].start_ori}, end={sequence.beats[0].pictograph_data.motions['red'].end_ori}"
    )
    print(
        f"    Blue prop: orientation={sequence.beats[0].pictograph_data.props['blue'].orientation}"
    )
    print(
        f"    Red prop: orientation={sequence.beats[0].pictograph_data.props['red'].orientation}"
    )

    print(
        f"  Beat 2 (E): {sequence.beats[1].pictograph_data.start_position} → {sequence.beats[1].pictograph_data.end_position}"
    )
    print(
        f"    Blue motion: start={sequence.beats[1].pictograph_data.motions['blue'].start_ori}, end={sequence.beats[1].pictograph_data.motions['blue'].end_ori}"
    )
    print(
        f"    Red motion: start={sequence.beats[1].pictograph_data.motions['red'].start_ori}, end={sequence.beats[1].pictograph_data.motions['red'].end_ori}"
    )
    print(
        f"    Blue prop: orientation={sequence.beats[1].pictograph_data.props['blue'].orientation}"
    )
    print(
        f"    Red prop: orientation={sequence.beats[1].pictograph_data.props['red'].orientation}"
    )

    # Create test options for beat 3
    option1 = create_test_pictograph("B", "alpha5", "alpha3")
    option2 = create_test_pictograph("A", "alpha5", "beta1")
    options = [option1, option2]

    print(f"\n🔧 Testing orientation validator...")

    # Create validator and test
    validator = SequenceOrientationValidator()

    # Test the validator
    updated_options = validator.calculate_option_start_orientations(sequence, options)

    print(f"\n📋 Results:")
    print(f"  Validator returned {len(updated_options)} options")

    # Check first option
    if updated_options:
        option = updated_options[0]
        print(f"\n  Option 1 ({option.letter}):")
        print(
            f"    Blue motion: start={option.motions['blue'].start_ori}, end={option.motions['blue'].end_ori}"
        )
        print(
            f"    Red motion: start={option.motions['red'].start_ori}, end={option.motions['red'].end_ori}"
        )
        print(f"    Blue prop: orientation={option.props['blue'].orientation}")
        print(f"    Red prop: orientation={option.props['red'].orientation}")

        # Verify the fix
        # Beat 2 ends with: blue=in, red=in (ANTI + 0 turns: out→in, out→in)
        # So Beat 3 should start with: blue=in, red=in
        # And props should match motion END orientations

        expected_blue_start = Orientation.IN  # From beat 2 blue end
        expected_red_start = Orientation.IN  # From beat 2 red end

        # First, let's check what the sequence actually ends with
        last_beat = sequence.beats[-1]  # Beat 2 (E)
        actual_blue_end = last_beat.pictograph_data.motions["blue"].end_ori
        actual_red_end = last_beat.pictograph_data.motions["red"].end_ori

        print(
            f"    Sequence actually ends with: blue={actual_blue_end}, red={actual_red_end}"
        )

        # The next beat should start with these actual end orientations
        expected_blue_start = actual_blue_end
        expected_red_start = actual_red_end

        # For ANTI + 0 turns: start_ori → switch_orientation(start_ori)
        if expected_blue_start == Orientation.IN:
            expected_blue_end = Orientation.OUT  # ANTI: in → out
        else:
            expected_blue_end = Orientation.IN  # ANTI: out → in

        if expected_red_start == Orientation.IN:
            expected_red_end = Orientation.OUT  # ANTI: in → out
        else:
            expected_red_end = Orientation.IN  # ANTI: out → in

        # Props should match motion END orientations
        expected_blue_prop = expected_blue_end
        expected_red_prop = expected_red_end

        print(f"\n✅ Verification:")
        blue_motion_start_ok = option.motions["blue"].start_ori == expected_blue_start
        red_motion_start_ok = option.motions["red"].start_ori == expected_red_start
        blue_motion_end_ok = option.motions["blue"].end_ori == expected_blue_end
        red_motion_end_ok = option.motions["red"].end_ori == expected_red_end
        blue_prop_ok = option.props["blue"].orientation == expected_blue_prop
        red_prop_ok = option.props["red"].orientation == expected_red_prop

        print(
            f"  Blue motion start: {option.motions['blue'].start_ori} == {expected_blue_start} → {'✅' if blue_motion_start_ok else '❌'}"
        )
        print(
            f"  Red motion start: {option.motions['red'].start_ori} == {expected_red_start} → {'✅' if red_motion_start_ok else '❌'}"
        )
        print(
            f"  Blue motion end: {option.motions['blue'].end_ori} == {expected_blue_end} → {'✅' if blue_motion_end_ok else '❌'}"
        )
        print(
            f"  Red motion end: {option.motions['red'].end_ori} == {expected_red_end} → {'✅' if red_motion_end_ok else '❌'}"
        )
        print(
            f"  Blue prop orientation: {option.props['blue'].orientation} == {expected_blue_prop} → {'✅' if blue_prop_ok else '❌'}"
        )
        print(
            f"  Red prop orientation: {option.props['red'].orientation} == {expected_red_prop} → {'✅' if red_prop_ok else '❌'}"
        )

        all_correct = all(
            [
                blue_motion_start_ok,
                red_motion_start_ok,
                blue_motion_end_ok,
                red_motion_end_ok,
                blue_prop_ok,
                red_prop_ok,
            ]
        )

        if all_correct:
            print(f"\n🎉 SUCCESS: All orientations are correct!")
            print(f"   ✅ Motion start orientations updated for sequence continuity")
            print(f"   ✅ Motion end orientations calculated correctly")
            print(f"   ✅ Prop orientations updated to match motion end orientations")
            return True
        else:
            print(f"\n❌ FAILURE: Some orientations are incorrect")
            return False
    else:
        print(f"\n❌ FAILURE: No options returned")
        return False


if __name__ == "__main__":
    success = test_orientation_validator_comprehensive()
    sys.exit(0 if success else 1)
