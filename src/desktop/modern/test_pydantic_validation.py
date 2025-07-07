#!/usr/bin/env python3
"""
Quick test script to validate Pydantic model JSON output
"""
import sys
import os
import json

# Add the source directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

try:
    from domain.models.pydantic_models import (
        MotionData,
        BeatData, 
        SequenceData,
        create_default_motion_data,
        create_default_beat_data,
        create_default_sequence_data,
    )
    
    print("✅ Successfully imported Pydantic models!")
    
    # Test MotionData
    print("\n🔧 Testing MotionData...")
    motion = create_default_motion_data(
        motion_type='pro',
        prop_rot_dir='cw',
        start_loc='n', 
        end_loc='e',
        start_ori='in',
        end_ori='out'
    )
    
    motion_json = motion.model_dump()
    print("MotionData JSON structure:")
    print(json.dumps(motion_json, indent=2))
    
    # Verify camelCase
    expected_keys = {'motionType', 'propRotDir', 'startLoc', 'endLoc', 'turns', 'startOri', 'endOri'}
    actual_keys = set(motion_json.keys())
    
    if actual_keys == expected_keys:
        print("✅ MotionData has correct camelCase structure!")
    else:
        print(f"❌ MotionData structure mismatch!")
        print(f"Expected: {expected_keys}")
        print(f"Actual: {actual_keys}")
        print(f"Missing: {expected_keys - actual_keys}")
        print(f"Extra: {actual_keys - expected_keys}")
    
    # Test BeatData
    print("\n🔧 Testing BeatData...")
    beat = create_default_beat_data(1, 'A')
    beat_json = beat.model_dump()
    
    print("BeatData JSON structure (first few keys):")
    print(json.dumps({k: v for i, (k, v) in enumerate(beat_json.items()) if i < 5}, indent=2))
    
    # Verify nested motion data
    if 'blueMotion' in beat_json and 'motionType' in beat_json['blueMotion']:
        print("✅ BeatData has correct nested camelCase structure!")
    else:
        print("❌ BeatData nested structure issue!")
        print(f"Keys: {list(beat_json.keys())}")
    
    # Test SequenceData
    print("\n🔧 Testing SequenceData...")
    sequence = create_default_sequence_data("Test Sequence")
    sequence = sequence.add_beat(beat)
    sequence_json = sequence.model_dump()
    
    print("SequenceData JSON structure:")
    print(json.dumps({k: v for k, v in sequence_json.items() if k != 'beats'}, indent=2))
    print(f"Beats count: {len(sequence_json.get('beats', []))}")
    
    if sequence_json.get('name') == "Test Sequence" and len(sequence_json.get('beats', [])) == 1:
        print("✅ SequenceData structure looks correct!")
    else:
        print("❌ SequenceData structure issue!")
    
    # Test schema compatibility 
    print("\n📋 Schema Compatibility Check...")
    
    # Check if JSON matches our v2 schema expectations
    motion_schema_keys = {'motionType', 'propRotDir', 'startLoc', 'endLoc', 'turns', 'startOri', 'endOri'}
    if set(motion_json.keys()) == motion_schema_keys:
        print("✅ MotionData matches motion-data-v2.json schema structure!")
    else:
        print("❌ MotionData schema mismatch!")
    
    # Round-trip test
    print("\n🔄 Testing round-trip JSON serialization...")
    json_str = motion.model_dump_json()
    parsed_json = json.loads(json_str)
    restored_motion = MotionData(**parsed_json)
    
    if restored_motion == motion:
        print("✅ Round-trip serialization works!")
    else:
        print("❌ Round-trip serialization failed!")
    
    print("\n🎉 Pydantic model validation complete!")
    print("Ready to proceed with web integration!")

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running from the correct directory")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error during testing: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
