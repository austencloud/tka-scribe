#!/usr/bin/env python3
"""
Debug JSON Serialization Issues

Identify and fix the exact source of "Object of type MotionType is not JSON serializable" error.
"""

import json
import sys
import os
from pathlib import Path

# Add TKA to path
tka_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_path))
os.chdir(tka_path)

def test_motion_data_serialization():
    """Test MotionData serialization."""
    print("--- Testing MotionData Serialization ---")
    
    try:
        from domain.models.core_models import MotionData
        from data.types import MotionType, RotationDirection, Location
        
        # Create MotionData with enums
        motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            turns=1.0
        )
        
        print(f"✅ Created MotionData: {motion}")
        
        # Test to_dict() method
        motion_dict = motion.to_dict()
        print(f"✅ to_dict() result: {motion_dict}")
        
        # Test JSON serialization of dict
        json_str = json.dumps(motion_dict)
        print(f"✅ JSON serialization successful: {json_str}")
        
        # Test round-trip
        loaded_dict = json.loads(json_str)
        reconstructed = MotionData.from_dict(loaded_dict)
        print(f"✅ Round-trip successful: {reconstructed}")
        
        return True
        
    except Exception as e:
        print(f"❌ MotionData serialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_beat_data_serialization():
    """Test BeatData serialization."""
    print("\n--- Testing BeatData Serialization ---")
    
    try:
        from domain.models.core_models import BeatData, MotionData
        from data.types import MotionType, RotationDirection, Location
        
        # Create MotionData
        motion = MotionData(
            motion_type=MotionType.DASH,
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            start_loc=Location.WEST,
            end_loc=Location.SOUTH,
            turns=0.5
        )
        
        # Create BeatData with motions
        beat = BeatData(
            beat_number=1,
            letter="T",
            duration=1.5,
            blue_motion=motion,
            red_motion=motion
        )
        
        print(f"✅ Created BeatData: {beat.letter}")
        
        # Test to_dict() method
        beat_dict = beat.to_dict()
        print(f"✅ to_dict() result keys: {list(beat_dict.keys())}")
        
        # Check motion serialization
        blue_motion_dict = beat_dict.get('blue_motion')
        if blue_motion_dict:
            print(f"✅ Blue motion serialized: {blue_motion_dict}")
        
        # Test JSON serialization
        json_str = json.dumps(beat_dict)
        print(f"✅ JSON serialization successful (length: {len(json_str)})")
        
        # Test round-trip
        loaded_dict = json.loads(json_str)
        reconstructed = BeatData.from_dict(loaded_dict)
        print(f"✅ Round-trip successful: {reconstructed.letter}")
        
        return True
        
    except Exception as e:
        print(f"❌ BeatData serialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_sequence_data_serialization():
    """Test SequenceData serialization."""
    print("\n--- Testing SequenceData Serialization ---")
    
    try:
        from domain.models.core_models import SequenceData, BeatData, MotionData
        from data.types import MotionType, RotationDirection, Location
        
        # Create motions
        motion1 = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.EAST
        )
        
        motion2 = MotionData(
            motion_type=MotionType.ANTI,
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            start_loc=Location.SOUTH,
            end_loc=Location.WEST
        )
        
        # Create beats
        beat1 = BeatData(beat_number=1, letter="A", blue_motion=motion1, red_motion=motion2)
        beat2 = BeatData(beat_number=2, letter="B", blue_motion=motion2, red_motion=motion1)
        
        # Create sequence
        sequence = SequenceData(
            name="Serialization Test",
            beats=[beat1, beat2]
        )
        
        print(f"✅ Created SequenceData: {sequence.name} with {len(sequence.beats)} beats")
        
        # Test to_dict() method
        sequence_dict = sequence.to_dict()
        print(f"✅ to_dict() result keys: {list(sequence_dict.keys())}")
        print(f"✅ Beats in dict: {len(sequence_dict.get('beats', []))}")
        
        # Test JSON serialization
        json_str = json.dumps(sequence_dict)
        print(f"✅ JSON serialization successful (length: {len(json_str)})")
        
        # Test round-trip
        loaded_dict = json.loads(json_str)
        reconstructed = SequenceData.from_dict(loaded_dict)
        print(f"✅ Round-trip successful: {reconstructed.name} with {len(reconstructed.beats)} beats")
        
        return True
        
    except Exception as e:
        print(f"❌ SequenceData serialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_tka_ai_test_helper_sequence():
    """Test TKAAITestHelper sequence creation and serialization."""
    print("\n--- Testing TKAAITestHelper Sequence ---")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        
        # Create test environment
        container = ApplicationFactory.create_test_app()
        helper = TKAAITestHelper(use_test_mode=True)
        
        # Create sequence using helper
        result = helper.create_sequence("JSON Test Sequence", 2)
        
        if not result.success:
            print(f"❌ TKAAITestHelper failed: {result.errors}")
            return False
        
        sequence_data = result.data
        print(f"✅ TKAAITestHelper created: {type(sequence_data)}")
        
        # Check if it's a SequenceData object or dict
        if hasattr(sequence_data, 'to_dict'):
            print("✅ Has to_dict() method")
            sequence_dict = sequence_data.to_dict()
        elif isinstance(sequence_data, dict):
            print("✅ Already a dict")
            sequence_dict = sequence_data
        else:
            print(f"⚠️ Unexpected type: {type(sequence_data)}")
            sequence_dict = sequence_data
        
        # Test JSON serialization
        json_str = json.dumps(sequence_dict)
        print(f"✅ JSON serialization successful (length: {len(json_str)})")
        
        return True
        
    except Exception as e:
        print(f"❌ TKAAITestHelper test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_session_service_serialization():
    """Test SessionStateService serialization."""
    print("\n--- Testing SessionStateService Serialization ---")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import SequenceData, BeatData, MotionData
        from data.types import MotionType, RotationDirection, Location
        
        # Create test environment
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        
        # Create test sequence with motions
        motion = MotionData(
            motion_type=MotionType.FLOAT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTHEAST,
            end_loc=Location.SOUTHWEST
        )
        
        beat = BeatData(
            beat_number=1,
            letter="S",
            blue_motion=motion,
            red_motion=motion
        )
        
        sequence = SequenceData(
            name="Session Service Test",
            beats=[beat]
        )
        
        print(f"✅ Created test sequence: {sequence.name}")
        
        # Test session service update
        session_service.update_current_sequence(sequence, sequence.id)
        print("✅ Session service update successful")
        
        # Test session save
        save_success = session_service.save_session_state()
        print(f"✅ Session save result: {save_success}")
        
        return save_success
        
    except Exception as e:
        print(f"❌ SessionStateService test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all serialization tests."""
    print("🔍 JSON Serialization Debug Tests")
    print("=" * 50)
    
    results = {}
    
    results["motion_data"] = test_motion_data_serialization()
    results["beat_data"] = test_beat_data_serialization()
    results["sequence_data"] = test_sequence_data_serialization()
    results["tka_ai_helper"] = test_tka_ai_test_helper_sequence()
    results["session_service"] = test_session_service_serialization()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    
    all_passed = all(results.values())
    
    for test_name, passed in results.items():
        status = "✅" if passed else "❌"
        print(f"   {status} {test_name}")
    
    if all_passed:
        print("\n🎉 All serialization tests passed!")
    else:
        print("\n❌ Some serialization tests failed - check details above")
    
    return results

if __name__ == "__main__":
    main()
