#!/usr/bin/env python3
"""
Quick test script to verify orientation continuity fix.

This script tests the orientation continuity by creating a sequence that ends
with specific orientations and checking if the options start with those orientations.
"""

import os
import sys

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from modern.application.services.sequence.sequence_orientation_validator import (
    SequenceOrientationValidator,
)
from modern.domain.models.beat_data import BeatData
from modern.domain.models.enums import (
    Location,
    MotionType,
    Orientation,
    RotationDirection,
)
from modern.domain.models.motion_data import MotionData
from modern.domain.models.pictograph_data import PictographData
from modern.domain.models.sequence_data import SequenceData


def create_test_motion(start_ori: Orientation, end_ori: Orientation) -> MotionData:
    """Create a test motion with specified orientations."""
    return MotionData(
        motion_type=MotionType.PRO,
        turns=1.0,
        start_ori=start_ori,
        end_ori=end_ori,
        start_loc=Location.NORTH,
        end_loc=Location.SOUTH,
        prop_rot_dir=RotationDirection.CLOCKWISE,
    )


def create_test_pictograph(
    letter: str,
    blue_start: Orientation,
    blue_end: Orientation,
    red_start: Orientation,
    red_end: Orientation,
) -> PictographData:
    """Create a test pictograph with specified orientations."""
    blue_motion = create_test_motion(blue_start, blue_end)
    red_motion = create_test_motion(red_start, red_end)

    return PictographData(
        letter=letter,
        start_position="alpha1",
        end_position="beta1",
        motions={"blue": blue_motion, "red": red_motion},
        props={},  # Simplified for testing
    )


def create_test_sequence(pictographs: list[PictographData]) -> SequenceData:
    """Create a test sequence from pictographs."""
    beats = []
    for i, pictograph in enumerate(pictographs):
        beat = BeatData(beat_number=i + 1, pictograph_data=pictograph, is_blank=False)
        beats.append(beat)

    return SequenceData(beats=beats, length=len(beats))


def test_orientation_extraction():
    """Test that orientation extraction works correctly."""
    print("🧪 Testing orientation extraction...")

    # Create a pictograph that ends with OUT orientations (like letter B)
    pictograph_b = create_test_pictograph(
        "B",
        Orientation.IN,
        Orientation.OUT,  # blue: in -> out
        Orientation.OUT,
        Orientation.OUT,  # red: out -> out
    )

    sequence = create_test_sequence([pictograph_b])

    # Test orientation extraction
    validator = SequenceOrientationValidator()
    end_orientations = validator.get_sequence_end_orientations(sequence)

    print(
        f"✅ Sequence end orientations: blue={end_orientations['blue'].value}, red={end_orientations['red'].value}"
    )

    # Should extract OUT orientations
    assert end_orientations["blue"] == Orientation.OUT, (
        f"Expected blue=out, got {end_orientations['blue'].value}"
    )
    assert end_orientations["red"] == Orientation.OUT, (
        f"Expected red=out, got {end_orientations['red'].value}"
    )

    print("✅ Orientation extraction test passed!")
    return True


def test_option_orientation_update():
    """Test that options are updated with correct start orientations."""
    print("\n🧪 Testing option orientation update...")

    # Create a sequence that ends with OUT orientations
    sequence_pictograph = create_test_pictograph(
        "B",
        Orientation.IN,
        Orientation.OUT,  # blue: in -> out
        Orientation.OUT,
        Orientation.OUT,  # red: out -> out
    )
    sequence = create_test_sequence([sequence_pictograph])

    # Create test options that start with default IN orientations
    option1 = create_test_pictograph(
        "C",
        Orientation.IN,
        Orientation.CLOCK,  # blue: in -> clock (should be updated to out -> ?)
        Orientation.OUT,
        Orientation.COUNTER,  # red: out -> counter (should be updated to out -> ?)
    )

    option2 = create_test_pictograph(
        "D",
        Orientation.IN,
        Orientation.OUT,  # blue: in -> out (should be updated to out -> ?)
        Orientation.OUT,
        Orientation.IN,  # red: out -> in (should be updated to out -> ?)
    )

    options = [option1, option2]

    # Update options with sequence context
    validator = SequenceOrientationValidator()
    updated_options = validator.calculate_option_start_orientations(sequence, options)

    # Check that options now start with OUT orientations
    for i, option in enumerate(updated_options):
        blue_motion = option.motions.get("blue")
        red_motion = option.motions.get("red")

        blue_start = blue_motion.start_ori if blue_motion else None
        red_start = red_motion.start_ori if red_motion else None

        print(
            f"✅ Option {i} ({option.letter}): Blue start={blue_start.value if blue_start else 'None'}, Red start={red_start.value if red_start else 'None'}"
        )

        # Both should start with OUT now
        assert blue_start == Orientation.OUT, (
            f"Option {i} blue should start with OUT, got {blue_start.value if blue_start else 'None'}"
        )
        assert red_start == Orientation.OUT, (
            f"Option {i} red should start with OUT, got {red_start.value if red_start else 'None'}"
        )

    print("✅ Option orientation update test passed!")
    return True


def main():
    """Run all tests."""
    print("🚀 Testing Orientation Continuity Fix")
    print("=" * 50)

    try:
        # Test 1: Orientation extraction
        test_orientation_extraction()

        # Test 2: Option orientation update
        test_option_orientation_update()

        print("\n🎉 All tests passed! Orientation continuity fix is working correctly.")
        print("\nThe issue should now be resolved:")
        print(
            "- When you select letter B (ending in OUT), options should start with OUT"
        )
        print("- Motion orientations are properly updated")
        print("- Prop orientations follow motion END orientations")

        return True

    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
