#!/usr/bin/env python3
"""
Test basic domain model functionality after refactoring
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path.cwd() / 'src'))

def test_imports():
    """Test that all imports work correctly"""
    try:
        from domain.models import BeatData, MotionData, SequenceData, MotionType, Location, RotationDirection, Orientation
        print("✅ All imports successful!")
        return True
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False

def test_object_creation():
    """Test creating domain objects"""
    try:
        from domain.models import BeatData, MotionData, SequenceData, MotionType, Location, RotationDirection, Orientation
        
        # Test creating objects
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        print("✅ MotionData created successfully!")

        beat = BeatData(beat_number=1, letter='A', blue_motion=motion)
        print("✅ BeatData created successfully!")

        sequence = SequenceData(name='Test Sequence', beats=[beat])
        print("✅ SequenceData created successfully!")
        
        return True
    except Exception as e:
        print(f"❌ Object creation failed: {e}")
        return False

def test_serialization():
    """Test serialization functionality"""
    try:
        from domain.models import BeatData, MotionData, SequenceData, MotionType, Location, RotationDirection, Orientation
        
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        beat = BeatData(beat_number=1, letter='A', blue_motion=motion)
        sequence = SequenceData(name='Test Sequence', beats=[beat])

        # Test serialization
        motion_json = motion.to_json()
        print("✅ MotionData serialization works!")

        beat_json = beat.to_json()
        print("✅ BeatData serialization works!")

        sequence_json = sequence.to_json()
        print("✅ SequenceData serialization works!")
        
        return True
    except Exception as e:
        print(f"❌ Serialization failed: {e}")
        return False

def test_deserialization():
    """Test deserialization functionality"""
    try:
        from domain.models import BeatData, MotionData, SequenceData, MotionType, Location, RotationDirection, Orientation
        
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        beat = BeatData(beat_number=1, letter='A', blue_motion=motion)
        sequence = SequenceData(name='Test Sequence', beats=[beat])

        # Test deserialization
        motion_dict = motion.to_dict()
        motion_restored = MotionData.from_dict(motion_dict)
        print("✅ MotionData deserialization works!")

        beat_dict = beat.to_dict()
        beat_restored = BeatData.from_dict(beat_dict)
        print("✅ BeatData deserialization works!")

        sequence_dict = sequence.to_dict()
        sequence_restored = SequenceData.from_dict(sequence_dict)
        print("✅ SequenceData deserialization works!")
        
        return True
    except Exception as e:
        print(f"❌ Deserialization failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Domain Models After Refactoring...")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_object_creation,
        test_serialization,
        test_deserialization
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()
    
    print("=" * 50)
    print(f"Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 ALL DOMAIN MODEL TESTS PASSED!")
        return True
    else:
        print("❌ Some tests failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
