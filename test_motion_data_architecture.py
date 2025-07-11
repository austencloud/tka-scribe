#!/usr/bin/env python3
"""
Test Motion Data Architecture

This script tests the new architecture where motion data lives
directly in PictographData instead of nested in ArrowData or BeatData.
"""

import sys
from pathlib import Path

# Add modern/src to path for imports
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

def test_pictograph_data_structure():
    """Test that PictographData has direct motion data fields."""
    print("🧪 TESTING PICTOGRAPH DATA STRUCTURE")
    print("=" * 50)
    
    try:
        from domain.models.pictograph_data import PictographData
        from domain.models.motion_models import MotionData
        from domain.models.enums import MotionType, Orientation, Location
        
        # Create test motion data
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.TOP,
            end_loc=Location.BOTTOM,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT,
            turns=1
        )
        
        red_motion = MotionData(
            motion_type=MotionType.ANTI,
            start_loc=Location.LEFT,
            end_loc=Location.RIGHT,
            start_ori=Orientation.OUT,
            end_ori=Orientation.IN,
            turns=1
        )
        
        # Create PictographData with direct motion data
        pictograph = PictographData(
            blue_motion=blue_motion,
            red_motion=red_motion,
            letter="M"
        )
        
        print("✅ PictographData created successfully!")
        print(f"   Letter: {pictograph.letter}")
        print(f"   Blue motion: {pictograph.blue_motion}")
        print(f"   Red motion: {pictograph.red_motion}")
        print(f"   Blue end_ori: {pictograph.blue_motion.end_ori}")
        print(f"   Red end_ori: {pictograph.red_motion.end_ori}")
        
        return pictograph
        
    except Exception as e:
        print(f"❌ Error testing PictographData structure: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_beat_data_structure():
    """Test that BeatData has pictograph_data reference."""
    print("\n🧪 TESTING BEAT DATA STRUCTURE")
    print("=" * 50)
    
    try:
        from domain.models.beat_data import BeatData
        from domain.models.pictograph_data import PictographData
        from domain.models.motion_models import MotionData
        from domain.models.enums import MotionType, Orientation, Location
        
        # Create test pictograph with motion data
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        pictograph = PictographData(
            blue_motion=blue_motion,
            letter="N"
        )
        
        # Create BeatData with pictograph reference
        beat = BeatData(
            beat_number=1,
            letter="N",
            pictograph_data=pictograph
        )
        
        print("✅ BeatData created successfully!")
        print(f"   Beat number: {beat.beat_number}")
        print(f"   Letter: {beat.letter}")
        print(f"   Has pictograph_data: {beat.pictograph_data is not None}")
        print(f"   Pictograph letter: {beat.pictograph_data.letter}")
        print(f"   Pictograph blue motion: {beat.pictograph_data.blue_motion}")
        print(f"   Blue end_ori via pictograph: {beat.pictograph_data.blue_motion.end_ori}")
        
        return beat
        
    except Exception as e:
        print(f"❌ Error testing BeatData structure: {e}")
        import traceback
        traceback.print_exc()
        return None

def test_orientation_updater():
    """Test that OptionOrientationUpdater can extract orientations from new structure."""
    print("\n🧪 TESTING ORIENTATION UPDATER")
    print("=" * 50)
    
    try:
        from application.services.option_picker.option_orientation_updater import OptionOrientationUpdater
        from domain.models.beat_data import BeatData
        from domain.models.pictograph_data import PictographData
        from domain.models.motion_models import MotionData
        from domain.models.enums import MotionType, Orientation, Location
        
        # Create test beat with pictograph containing motion data
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        red_motion = MotionData(
            motion_type=MotionType.ANTI,
            start_ori=Orientation.OUT,
            end_ori=Orientation.IN
        )
        
        pictograph = PictographData(
            blue_motion=blue_motion,
            red_motion=red_motion,
            letter="θ"
        )
        
        beat = BeatData(
            beat_number=1,
            letter="θ",
            pictograph_data=pictograph
        )
        
        # Test orientation extraction
        updater = OptionOrientationUpdater()
        blue_end_ori, red_end_ori = updater._extract_end_orientations(beat)
        
        print("✅ Orientation extraction successful!")
        print(f"   Beat letter: {beat.letter}")
        print(f"   Extracted blue end_ori: {blue_end_ori}")
        print(f"   Extracted red end_ori: {red_end_ori}")
        print(f"   Expected blue end_ori: {blue_motion.end_ori}")
        print(f"   Expected red end_ori: {red_motion.end_ori}")
        
        # Verify extraction matches expected
        if str(blue_end_ori) == str(blue_motion.end_ori) and str(red_end_ori) == str(red_motion.end_ori):
            print("✅ PERFECT! Orientation extraction working correctly!")
            return True
        else:
            print("❌ Mismatch in orientation extraction!")
            return False
        
    except Exception as e:
        print(f"❌ Error testing orientation updater: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_legacy_conversion():
    """Test that legacy conversion creates proper PictographData with motion data."""
    print("\n🧪 TESTING LEGACY CONVERSION")
    print("=" * 50)
    
    try:
        from application.services.data.legacy_to_modern_converter import LegacyToModernConverter
        
        # Create test legacy beat data
        legacy_beat = {
            "letter": "M",
            "beat": 1,
            "blue_attributes": {
                "motion_type": "pro",
                "start_loc": "top",
                "end_loc": "bottom", 
                "start_ori": "in",
                "end_ori": "out",
                "turns": 1
            },
            "red_attributes": {
                "motion_type": "anti",
                "start_loc": "left",
                "end_loc": "right",
                "start_ori": "out", 
                "end_ori": "in",
                "turns": 1
            }
        }
        
        # Test conversion
        converter = LegacyToModernConverter()
        converted_beat = converter.convert_legacy_to_beat_data(legacy_beat, 1)
        
        print("✅ Legacy conversion successful!")
        print(f"   Converted beat letter: {converted_beat.letter}")
        print(f"   Has pictograph_data: {converted_beat.pictograph_data is not None}")
        
        if converted_beat.pictograph_data:
            pictograph = converted_beat.pictograph_data
            print(f"   Pictograph blue motion: {pictograph.blue_motion}")
            print(f"   Pictograph red motion: {pictograph.red_motion}")
            
            if pictograph.blue_motion:
                print(f"   Blue end_ori: {pictograph.blue_motion.end_ori}")
            if pictograph.red_motion:
                print(f"   Red end_ori: {pictograph.red_motion.end_ori}")
                
            # Test orientation extraction from converted beat
            from application.services.option_picker.option_orientation_updater import OptionOrientationUpdater
            updater = OptionOrientationUpdater()
            blue_end_ori, red_end_ori = updater._extract_end_orientations(converted_beat)
            
            print(f"   Extracted orientations:")
            print(f"      Blue: {blue_end_ori}")
            print(f"      Red: {red_end_ori}")
            
            if blue_end_ori and red_end_ori:
                print("✅ PERFECT! Legacy conversion + orientation extraction working!")
                return True
            else:
                print("❌ Failed to extract orientations from converted beat")
                return False
        else:
            print("❌ No pictograph_data in converted beat")
            return False
        
    except Exception as e:
        print(f"❌ Error testing legacy conversion: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_position_matching_service():
    """Test that position matching service creates PictographData with motion data."""
    print("\n🧪 TESTING POSITION MATCHING SERVICE")
    print("=" * 50)
    
    try:
        from application.services.positioning.arrows.utilities.position_matching_service import PositionMatchingService
        
        # Create test dataset item
        test_item = {
            "letter": "N",
            "start_pos": "alpha",
            "end_pos": "beta",
            "blue_attributes": {
                "motion_type": "pro",
                "start_loc": "top",
                "end_loc": "bottom",
                "start_ori": "in", 
                "end_ori": "out",
                "turns": 1
            },
            "red_attributes": {
                "motion_type": "anti",
                "start_loc": "left",
                "end_loc": "right",
                "start_ori": "out",
                "end_ori": "in", 
                "turns": 1
            }
        }
        
        # Test position matching
        service = PositionMatchingService()
        pictograph = service.create_pictograph_from_dataset_item(test_item)
        
        print("✅ Position matching service successful!")
        print(f"   Created pictograph letter: {pictograph.letter}")
        print(f"   Blue motion: {pictograph.blue_motion}")
        print(f"   Red motion: {pictograph.red_motion}")
        
        if pictograph.blue_motion:
            print(f"   Blue end_ori: {pictograph.blue_motion.end_ori}")
        if pictograph.red_motion:
            print(f"   Red end_ori: {pictograph.red_motion.end_ori}")
            
        if pictograph.blue_motion and pictograph.red_motion:
            print("✅ PERFECT! Position matching creates pictographs with motion data!")
            return True
        else:
            print("❌ Missing motion data in created pictograph")
            return False
        
    except Exception as e:
        print(f"❌ Error testing position matching service: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 MOTION DATA ARCHITECTURE TESTER")
    print("=" * 60)
    
    # Run all tests
    tests = [
        test_pictograph_data_structure,
        test_beat_data_structure,
        test_orientation_updater,
        test_legacy_conversion,
        test_position_matching_service
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
        print("🎉 ALL TESTS PASSED! Architecture refactoring successful!")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
