#!/usr/bin/env python3
"""
Simple Architecture Test

Test the basic structure changes.
"""

import sys
from pathlib import Path

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))


def test_basic_structure():
    """Test basic structure creation."""
    print("🧪 TESTING BASIC STRUCTURE")
    print("=" * 40)

    try:
        from domain.models.enums import (
            Location,
            MotionType,
            Orientation,
            RotationDirection,
        )
        from domain.models.motion_models import MotionData
        from domain.models.pictograph_data import PictographData

        # Create simple motion data with all required fields
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1,
        )

        # Create PictographData with motion dictionary
        pictograph = PictographData(motions={"blue": blue_motion}, letter="M")

        print("✅ PictographData created successfully!")
        print(f"   Letter: {pictograph.letter}")
        print(f"   Blue motion: {pictograph.motions.get('blue')}")
        print(f"   Blue end_ori: {pictograph.motions['blue'].end_ori}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_beat_with_pictograph():
    """Test BeatData with PictographData."""
    print("\n🧪 TESTING BEAT WITH PICTOGRAPH")
    print("=" * 40)

    try:
        from domain.models.beat_data import BeatData
        from domain.models.enums import (
            Location,
            MotionType,
            Orientation,
            RotationDirection,
        )
        from domain.models.motion_models import MotionData
        from domain.models.pictograph_data import PictographData

        # Create motion data
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1,
        )

        # Create pictograph
        pictograph = PictographData(motions={"blue": blue_motion}, letter="N")

        # Create beat with pictograph
        beat = BeatData(beat_number=1, letter="N", pictograph_data=pictograph)

        print("✅ BeatData with PictographData created successfully!")
        print(f"   Beat letter: {beat.letter}")
        print(f"   Has pictograph: {beat.pictograph_data is not None}")
        print(f"   Pictograph letter: {beat.pictograph_data.letter}")
        print(
            f"   Blue motion via pictograph: {beat.pictograph_data.motions.get('blue')}"
        )

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_orientation_extraction():
    """Test orientation extraction from new structure."""
    print("\n🧪 TESTING ORIENTATION EXTRACTION")
    print("=" * 40)

    try:
        from application.services.option_picker.option_orientation_updater import (
            OptionOrientationUpdater,
        )
        from domain.models.beat_data import BeatData
        from domain.models.enums import (
            Location,
            MotionType,
            Orientation,
            RotationDirection,
        )
        from domain.models.motion_models import MotionData
        from domain.models.pictograph_data import PictographData

        # Create motion data
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1,
        )

        red_motion = MotionData(
            motion_type=MotionType.ANTI,
            start_loc=Location.EAST,
            end_loc=Location.WEST,
            start_ori=Orientation.OUT,
            end_ori=Orientation.IN,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1,
        )

        # Create pictograph with both motions
        pictograph = PictographData(
            motions={"blue": blue_motion, "red": red_motion}, letter="θ"
        )

        # Create beat
        beat = BeatData(beat_number=1, letter="θ", pictograph_data=pictograph)

        # Test orientation extraction
        updater = OptionOrientationUpdater()
        blue_end_ori, red_end_ori = updater._extract_end_orientations(beat)

        print("✅ Orientation extraction successful!")
        print(f"   Beat letter: {beat.letter}")
        print(f"   Extracted blue end_ori: {blue_end_ori}")
        print(f"   Extracted red end_ori: {red_end_ori}")
        print(f"   Expected blue: {blue_motion.end_ori}")
        print(f"   Expected red: {red_motion.end_ori}")

        # Check if extraction matches
        if str(blue_end_ori) == str(blue_motion.end_ori) and str(red_end_ori) == str(
            red_motion.end_ori
        ):
            print("✅ PERFECT! Orientation extraction working correctly!")
            return True
        else:
            print("❌ Mismatch in orientation extraction")
            return False

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 SIMPLE ARCHITECTURE TESTER")
    print("=" * 50)

    tests = [
        test_basic_structure,
        test_beat_with_pictograph,
        test_orientation_extraction,
    ]

    results = []
    for test in tests:
        result = test()
        results.append(result)

    print(f"\n🏁 RESULTS: {sum(results)}/{len(results)} passed")

    if all(results):
        print("🎉 ALL TESTS PASSED! Basic architecture working!")
    else:
        print("⚠️ Some tests failed.")
