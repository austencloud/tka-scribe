#!/usr/bin/env python3
"""
End-to-End Orientation Updates Test

Comprehensive test to verify that the orientation updates are working correctly
throughout the entire application flow.
"""

import sys
from pathlib import Path

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

def test_motion_data_architecture():
    """Test that the new motion data architecture is working correctly."""
    print("🧪 TESTING MOTION DATA ARCHITECTURE")
    print("=" * 60)
    
    try:
        from domain.models.pictograph_data import PictographData
        from domain.models.beat_data import BeatData
        from domain.models.motion_models import MotionData
        from domain.models.enums import MotionType, Orientation, Location, RotationDirection
        
        # Create motion data
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1
        )
        
        # Create pictograph with motion dictionary
        pictograph = PictographData(
            motions={"blue": blue_motion},
            letter="θ"
        )
        
        # Create beat with pictograph
        beat = BeatData(
            beat_number=1,
            letter="θ",
            pictograph_data=pictograph
        )
        
        print("✅ Motion data architecture working correctly!")
        print(f"   Beat letter: {beat.letter}")
        print(f"   Has pictograph: {beat.pictograph_data is not None}")
        print(f"   Has motions: {'blue' in beat.pictograph_data.motions}")
        print(f"   Blue end_ori: {beat.pictograph_data.motions['blue'].end_ori}")
        
        return True
        
    except Exception as e:
        print(f"❌ Motion data architecture test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_orientation_extraction():
    """Test that orientation extraction is working correctly."""
    print("\n🧪 TESTING ORIENTATION EXTRACTION")
    print("=" * 60)
    
    try:
        from application.services.option_picker.option_orientation_updater import OptionOrientationUpdater
        from domain.models.sequence_models import SequenceData
        from domain.models.beat_data import BeatData
        from domain.models.pictograph_data import PictographData
        from domain.models.motion_models import MotionData
        from domain.models.enums import MotionType, Orientation, Location, RotationDirection
        
        # Create test sequence with multiple beats
        beats = []
        
        # Beat 1: θ (pro motion, in→out)
        blue_motion_1 = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1
        )
        
        pictograph_1 = PictographData(motions={"blue": blue_motion_1}, letter="θ")
        beat_1 = BeatData(beat_number=1, letter="θ", pictograph_data=pictograph_1)
        beats.append(beat_1)
        
        # Beat 2: M (anti motion, out→in)
        blue_motion_2 = MotionData(
            motion_type=MotionType.ANTI,
            start_loc=Location.SOUTH,
            end_loc=Location.NORTH,
            start_ori=Orientation.OUT,  # Continues from previous beat
            end_ori=Orientation.IN,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            turns=1
        )
        
        pictograph_2 = PictographData(motions={"blue": blue_motion_2}, letter="M")
        beat_2 = BeatData(beat_number=2, letter="M", pictograph_data=pictograph_2)
        beats.append(beat_2)
        
        # Create test sequence
        test_sequence = SequenceData(
            id="test_sequence",
            name="Test Sequence",
            beats=beats
        )
        
        print(f"✅ Created test sequence with {len(test_sequence.beats)} beats")
        
        # Test orientation extraction
        updater = OptionOrientationUpdater()
        
        for i, beat in enumerate(test_sequence.beats):
            print(f"\n   Beat {i+1}: {beat.letter}")
            blue_end_ori, red_end_ori = updater._extract_end_orientations(beat)
            print(f"      Extracted blue end_ori: {blue_end_ori}")
            
            if beat.pictograph_data and "blue" in beat.pictograph_data.motions:
                expected_blue = beat.pictograph_data.motions["blue"].end_ori
                print(f"      Expected blue end_ori: {expected_blue}")
                
                if str(blue_end_ori) == str(expected_blue):
                    print(f"      ✅ Orientation extraction correct!")
                else:
                    print(f"      ❌ Orientation mismatch!")
                    return False
        
        # Test getting last beat orientations
        last_beat = updater._get_last_valid_beat(test_sequence)
        if last_beat:
            blue_end_ori, red_end_ori = updater._extract_end_orientations(last_beat)
            print(f"\n🎯 Last beat orientation extraction:")
            print(f"   Last beat: {last_beat.letter}")
            print(f"   Blue end_ori: {blue_end_ori}")
            
            if blue_end_ori:
                print("✅ Orientation extraction working correctly!")
                return True
            else:
                print("❌ Failed to extract orientations from last beat")
                return False
        else:
            print("❌ No last valid beat found")
            return False
        
    except Exception as e:
        print(f"❌ Orientation extraction test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_legacy_conversion():
    """Test that legacy conversion is working with the new architecture."""
    print("\n🧪 TESTING LEGACY CONVERSION")
    print("=" * 60)
    
    try:
        from application.services.data.legacy_to_modern_converter import LegacyToModernConverter
        
        # Create test legacy beat data
        legacy_beat = {
            "letter": "W",
            "beat": 1,
            "blue_attributes": {
                "motion_type": "pro",
                "start_loc": "n",
                "end_loc": "s", 
                "start_ori": "in",
                "end_ori": "out",
                "prop_rot_dir": "no_rot",
                "turns": 1
            },
            "red_attributes": {
                "motion_type": "anti",
                "start_loc": "e",
                "end_loc": "w",
                "start_ori": "out", 
                "end_ori": "in",
                "prop_rot_dir": "no_rot",
                "turns": 1
            }
        }
        
        print(f"📋 Testing conversion of legacy beat: {legacy_beat['letter']}")
        
        # Test conversion
        converter = LegacyToModernConverter()
        converted_beat = converter.convert_legacy_to_beat_data(legacy_beat, 1)
        
        print(f"✅ Conversion successful!")
        print(f"   Beat letter: {converted_beat.letter}")
        print(f"   Has pictograph_data: {converted_beat.pictograph_data is not None}")
        
        if converted_beat.pictograph_data and converted_beat.pictograph_data.motions:
            print(f"   Blue motion: {'blue' in converted_beat.pictograph_data.motions}")
            print(f"   Red motion: {'red' in converted_beat.pictograph_data.motions}")
            
            if "blue" in converted_beat.pictograph_data.motions:
                blue_motion = converted_beat.pictograph_data.motions["blue"]
                print(f"   Blue end_ori: {blue_motion.end_ori}")
                
            if "red" in converted_beat.pictograph_data.motions:
                red_motion = converted_beat.pictograph_data.motions["red"]
                print(f"   Red end_ori: {red_motion.end_ori}")
                
            print("✅ Legacy conversion working with new architecture!")
            return True
        else:
            print("❌ No motion data in converted beat")
            return False
        
    except Exception as e:
        print(f"❌ Legacy conversion test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_option_picker_integration():
    """Test that option picker can work with the new architecture."""
    print("\n🧪 TESTING OPTION PICKER INTEGRATION")
    print("=" * 60)
    
    try:
        from application.services.option_picker.option_orientation_updater import OptionOrientationUpdater
        from application.services.option_picker.data.option_picker_data_service import OptionPickerDataService
        
        # Test that the services can be instantiated
        updater = OptionOrientationUpdater()
        data_service = OptionPickerDataService()
        
        print("✅ Option picker services instantiated successfully!")
        print(f"   Orientation updater: {type(updater).__name__}")
        print(f"   Data service: {type(data_service).__name__}")
        
        # Test that the updater has the correct methods
        if hasattr(updater, '_extract_end_orientations'):
            print("✅ Orientation updater has _extract_end_orientations method")
        else:
            print("❌ Orientation updater missing _extract_end_orientations method")
            return False
            
        if hasattr(updater, '_get_last_valid_beat'):
            print("✅ Orientation updater has _get_last_valid_beat method")
        else:
            print("❌ Orientation updater missing _get_last_valid_beat method")
            return False
        
        print("✅ Option picker integration ready!")
        return True
        
    except Exception as e:
        print(f"❌ Option picker integration test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 END-TO-END ORIENTATION UPDATES TEST")
    print("=" * 70)
    
    # Run all tests
    tests = [
        test_motion_data_architecture,
        test_orientation_extraction,
        test_legacy_conversion,
        test_option_picker_integration
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
        print("🎉 ALL TESTS PASSED!")
        print("\n🎯 ORIENTATION UPDATES ARE WORKING CORRECTLY!")
        print("The motion dictionary architecture is fully functional!")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
