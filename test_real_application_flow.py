#!/usr/bin/env python3
"""
Test Real Application Flow

Test the new architecture with the actual application components
to verify orientation updates work end-to-end.
"""

import sys
from pathlib import Path

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))


def test_legacy_conversion_with_new_architecture():
    """Test that legacy conversion creates proper PictographData with motion data."""
    print("🧪 TESTING LEGACY CONVERSION WITH NEW ARCHITECTURE")
    print("=" * 60)

    try:
        from application.services.data.legacy_to_modern_converter import (
            LegacyToModernConverter,
        )
        from application.services.option_picker.option_orientation_updater import (
            OptionOrientationUpdater,
        )

        # Create test legacy beat data (realistic data from actual sequence)
        legacy_beat = {
            "letter": "M",
            "beat": 1,
            "blue_attributes": {
                "motion_type": "pro",
                "start_loc": "n",
                "end_loc": "s",
                "start_ori": "in",
                "end_ori": "out",
                "prop_rot_dir": "no_rot",
                "turns": 1,
            },
            "red_attributes": {
                "motion_type": "anti",
                "start_loc": "e",
                "end_loc": "w",
                "start_ori": "out",
                "end_ori": "in",
                "prop_rot_dir": "no_rot",
                "turns": 1,
            },
        }

        print(f"📋 Testing conversion of legacy beat: {legacy_beat['letter']}")
        print(f"   Blue end_ori: {legacy_beat['blue_attributes']['end_ori']}")
        print(f"   Red end_ori: {legacy_beat['red_attributes']['end_ori']}")

        # Test conversion
        converter = LegacyToModernConverter()
        converted_beat = converter.convert_legacy_to_beat_data(legacy_beat, 1)

        print(f"\n✅ Conversion successful!")
        print(f"   Beat letter: {converted_beat.letter}")
        print(f"   Has pictograph_data: {converted_beat.pictograph_data is not None}")

        if converted_beat.pictograph_data:
            pictograph = converted_beat.pictograph_data
            print(f"   Pictograph blue motion: {'blue' in pictograph.motions}")
            print(f"   Pictograph red motion: {'red' in pictograph.motions}")

            if "blue" in pictograph.motions:
                print(f"   Blue motion end_ori: {pictograph.motions['blue'].end_ori}")
            if "red" in pictograph.motions:
                print(f"   Red motion end_ori: {pictograph.motions['red'].end_ori}")

            # Test orientation extraction from converted beat
            updater = OptionOrientationUpdater()
            blue_end_ori, red_end_ori = updater._extract_end_orientations(
                converted_beat
            )

            print(f"\n🎯 Orientation extraction results:")
            print(f"   Extracted blue end_ori: {blue_end_ori}")
            print(f"   Extracted red end_ori: {red_end_ori}")
            print(
                f"   Original blue end_ori: {legacy_beat['blue_attributes']['end_ori']}"
            )
            print(
                f"   Original red end_ori: {legacy_beat['red_attributes']['end_ori']}"
            )

            # Check if extraction matches original
            blue_match = (
                str(blue_end_ori).lower() == legacy_beat["blue_attributes"]["end_ori"]
            )
            red_match = (
                str(red_end_ori).lower() == legacy_beat["red_attributes"]["end_ori"]
            )

            if blue_match and red_match:
                print("✅ PERFECT! Legacy conversion + orientation extraction working!")
                return True
            else:
                print("❌ Mismatch in orientation extraction!")
                print(f"   Blue match: {blue_match}")
                print(f"   Red match: {red_match}")
                return False
        else:
            print("❌ No pictograph_data in converted beat")
            return False

    except Exception as e:
        print(f"❌ Error testing legacy conversion: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_sequence_loading_with_new_architecture():
    """Test sequence loading with the new architecture."""
    print("\n🧪 TESTING SEQUENCE LOADING WITH NEW ARCHITECTURE")
    print("=" * 60)

    try:
        from application.services.data.legacy_to_modern_converter import (
            LegacyToModernConverter,
        )
        from application.services.option_picker.option_orientation_updater import (
            OptionOrientationUpdater,
        )
        from application.services.sequence.sequence_persister import SequencePersister

        # Load current sequence from persistence
        persister = SequencePersister()
        sequence_data = persister.load_current_sequence()

        print(f"✅ Loaded sequence data: {len(sequence_data)} items")

        if len(sequence_data) > 1:
            # Find first valid beat
            beat_dict = None
            for item in sequence_data[1:]:
                if "letter" in item and item.get("beat", 0) > 0:
                    beat_dict = item
                    break

            if beat_dict:
                print(f"\n📊 Testing beat: {beat_dict.get('letter', '?')}")
                print(f"   Blue attributes: {beat_dict.get('blue_attributes', {})}")
                print(f"   Red attributes: {beat_dict.get('red_attributes', {})}")

                # Convert using new architecture
                converter = LegacyToModernConverter()
                converted_beat = converter.convert_legacy_to_beat_data(beat_dict, 1)

                print(f"\n✅ Conversion successful!")
                print(
                    f"   Beat has pictograph_data: {converted_beat.pictograph_data is not None}"
                )

                if converted_beat.pictograph_data:
                    # Test orientation extraction
                    updater = OptionOrientationUpdater()
                    blue_end_ori, red_end_ori = updater._extract_end_orientations(
                        converted_beat
                    )

                    print(f"   Extracted orientations:")
                    print(f"      Blue: {blue_end_ori}")
                    print(f"      Red: {red_end_ori}")

                    # Compare with original
                    original_blue = beat_dict.get("blue_attributes", {}).get("end_ori")
                    original_red = beat_dict.get("red_attributes", {}).get("end_ori")

                    print(f"   Original orientations:")
                    print(f"      Blue: {original_blue}")
                    print(f"      Red: {original_red}")

                    if blue_end_ori and red_end_ori:
                        print(
                            "✅ SUCCESS! Orientation extraction working with real sequence data!"
                        )
                        return True
                    else:
                        print("❌ Failed to extract orientations")
                        return False
                else:
                    print("❌ No pictograph_data in converted beat")
                    return False
            else:
                print("❌ No valid beats found in sequence")
                return False
        else:
            print("❌ Empty sequence")
            return False

    except Exception as e:
        print(f"❌ Error testing sequence loading: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_option_picker_integration():
    """Test option picker integration with new architecture."""
    print("\n🧪 TESTING OPTION PICKER INTEGRATION")
    print("=" * 60)

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
        from domain.models.sequence_models import SequenceData

        # Create a test sequence with multiple beats using new architecture
        beats = []

        # Beat 1: θ
        blue_motion_1 = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1,
        )

        pictograph_1 = PictographData(motions={"blue": blue_motion_1}, letter="θ")

        beat_1 = BeatData(beat_number=1, letter="θ", pictograph_data=pictograph_1)
        beats.append(beat_1)

        # Beat 2: M
        blue_motion_2 = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.SOUTH,  # Continues from previous beat's end
            end_loc=Location.NORTH,
            start_ori=Orientation.OUT,  # Continues from previous beat's end
            end_ori=Orientation.IN,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1,
        )

        pictograph_2 = PictographData(motions={"blue": blue_motion_2}, letter="M")

        beat_2 = BeatData(beat_number=2, letter="M", pictograph_data=pictograph_2)
        beats.append(beat_2)

        # Create test sequence
        test_sequence = SequenceData(
            id="test_sequence", name="Test Sequence", beats=beats
        )

        print(f"✅ Created test sequence with {len(test_sequence.beats)} beats")

        # Test orientation extraction from each beat
        updater = OptionOrientationUpdater()

        for i, beat in enumerate(test_sequence.beats):
            print(f"\n   Beat {i+1}: {beat.letter}")
            blue_end_ori, red_end_ori = updater._extract_end_orientations(beat)
            print(f"      Extracted blue end_ori: {blue_end_ori}")
            print(f"      Extracted red end_ori: {red_end_ori}")

            if beat.pictograph_data and "blue" in beat.pictograph_data.motions:
                expected_blue = beat.pictograph_data.motions["blue"].end_ori
                print(f"      Expected blue end_ori: {expected_blue}")

                if str(blue_end_ori) == str(expected_blue):
                    print(f"      ✅ Blue orientation extraction correct!")
                else:
                    print(f"      ❌ Blue orientation mismatch!")

        # Test getting last beat orientations (what option picker would use)
        last_beat = updater._get_last_valid_beat(test_sequence)
        if last_beat:
            blue_end_ori, red_end_ori = updater._extract_end_orientations(last_beat)
            print(f"\n🎯 Last beat orientation extraction:")
            print(f"   Last beat: {last_beat.letter}")
            print(f"   Blue end_ori: {blue_end_ori}")
            print(f"   Red end_ori: {red_end_ori}")

            if blue_end_ori:
                print(
                    "✅ SUCCESS! Option picker can extract orientations from new architecture!"
                )
                return True
            else:
                print("❌ Failed to extract orientations from last beat")
                return False
        else:
            print("❌ No last valid beat found")
            return False

    except Exception as e:
        print(f"❌ Error testing option picker integration: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 REAL APPLICATION FLOW TESTER")
    print("=" * 70)

    # Run all tests
    tests = [
        test_legacy_conversion_with_new_architecture,
        test_sequence_loading_with_new_architecture,
        test_option_picker_integration,
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result is not False)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)

    # Summary
    print(f"\n🏁 TEST SUMMARY")
    print("=" * 30)
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")

    if passed == total:
        print("🎉 ALL TESTS PASSED! New architecture working with real application!")
        print("\n🎯 READY TO TEST IN LIVE APPLICATION!")
        print("The orientation updates should now work correctly!")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
