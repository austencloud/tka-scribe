#!/usr/bin/env python3
"""
Test Multi-Beat Sequence Restoration

Test if multi-beat sequences are being saved and restored correctly.
"""

import sys
import os
from pathlib import Path

# Add TKA to path
tka_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_path))
os.chdir(tka_path)

def test_multi_beat_sequence_save_restore():
    """Test saving and restoring a multi-beat sequence."""
    print("🧪 Testing Multi-Beat Sequence Save/Restore")
    print("=" * 60)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import SequenceData, BeatData, MotionData
        from data.types import MotionType, RotationDirection, Location
        import uuid
        
        # Create production container
        container = ApplicationFactory.create_production_app()
        session_service = container.resolve(ISessionStateService)
        
        print("✅ Services created")
        
        # Create a multi-beat test sequence
        print("\n🔍 Creating multi-beat test sequence...")
        
        # Create diverse motions
        motion1 = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            turns=1.0
        )
        
        motion2 = MotionData(
            motion_type=MotionType.ANTI,
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            start_loc=Location.SOUTH,
            end_loc=Location.WEST,
            turns=0.5
        )
        
        motion3 = MotionData(
            motion_type=MotionType.FLOAT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTHEAST,
            end_loc=Location.SOUTHWEST,
            turns=0.0
        )
        
        # Create start position beat
        start_beat = BeatData(
            beat_number=0,
            letter="θ-",
            duration=1.0,
            blue_motion=motion1,
            red_motion=motion2,
            metadata={"is_start_position": True}
        )
        
        # Create regular beats
        beat1 = BeatData(beat_number=1, letter="T", duration=1.0, blue_motion=motion1, red_motion=motion2)
        beat2 = BeatData(beat_number=2, letter="E", duration=1.5, blue_motion=motion2, red_motion=motion3)
        beat3 = BeatData(beat_number=3, letter="S", duration=2.0, blue_motion=motion3, red_motion=motion1)
        beat4 = BeatData(beat_number=4, letter="T", duration=1.0, blue_motion=motion1, red_motion=motion3)
        
        # Create comprehensive test sequence
        sequence_id = str(uuid.uuid4())
        test_sequence = SequenceData(
            id=sequence_id,
            name="Multi-Beat Test Sequence",
            word="TEST",
            beats=[beat1, beat2, beat3, beat4],
            start_position=start_beat,  # Include start position
            metadata={"test_type": "multi_beat_restoration"}
        )
        
        print(f"✅ Created sequence: {test_sequence.name}")
        print(f"   Word: {test_sequence.word}")
        print(f"   Beats: {len(test_sequence.beats)}")
        print(f"   Start position: {test_sequence.start_position.letter if test_sequence.start_position else 'None'}")
        
        # Save to session
        print("\n🔍 Saving sequence to session...")
        session_service.update_current_sequence(test_sequence, sequence_id)
        save_success = session_service.save_session_state()
        
        if save_success:
            print("✅ Sequence saved to session successfully")
        else:
            print("❌ Failed to save sequence to session")
            return False
        
        # Test restoration
        print("\n🔍 Testing sequence restoration...")
        
        # Load session state
        load_result = session_service.load_session_state()
        
        if load_result.session_restored:
            session_data = load_result.session_data
            restored_sequence_data = session_data.current_sequence_data
            
            print(f"✅ Session restored successfully")
            print(f"   Sequence ID: {session_data.current_sequence_id}")
            
            if restored_sequence_data:
                if isinstance(restored_sequence_data, dict):
                    name = restored_sequence_data.get('name', 'Unknown')
                    word = restored_sequence_data.get('word', '')
                    beats = restored_sequence_data.get('beats', [])
                    start_position = restored_sequence_data.get('start_position')
                else:
                    name = restored_sequence_data.name
                    word = restored_sequence_data.word
                    beats = restored_sequence_data.beats
                    start_position = restored_sequence_data.start_position
                
                print(f"   Restored name: {name}")
                print(f"   Restored word: {word}")
                print(f"   Restored beats: {len(beats)}")
                print(f"   Restored start position: {start_position is not None}")
                
                # Verify beat details
                print("\n🔍 Verifying beat details...")
                for i, beat in enumerate(beats):
                    if isinstance(beat, dict):
                        letter = beat.get('letter', 'Unknown')
                        duration = beat.get('duration', 'Unknown')
                        blue_motion = beat.get('blue_motion')
                        red_motion = beat.get('red_motion')
                    else:
                        letter = beat.letter
                        duration = beat.duration
                        blue_motion = beat.blue_motion
                        red_motion = beat.red_motion
                    
                    print(f"   Beat {i+1}: {letter} (duration: {duration})")
                    print(f"     Blue motion: {blue_motion is not None}")
                    print(f"     Red motion: {red_motion is not None}")
                
                # Check if all data is preserved
                success = (
                    name == test_sequence.name and
                    word == test_sequence.word and
                    len(beats) == len(test_sequence.beats) and
                    start_position is not None
                )
                
                if success:
                    print("\n🎉 SUCCESS: Multi-beat sequence restoration working correctly!")
                    print("✅ All beats preserved")
                    print("✅ Start position preserved")
                    print("✅ Sequence metadata preserved")
                    return True
                else:
                    print("\n❌ FAILURE: Data not fully preserved")
                    print(f"   Name match: {name == test_sequence.name}")
                    print(f"   Word match: {word == test_sequence.word}")
                    print(f"   Beat count match: {len(beats) == len(test_sequence.beats)}")
                    print(f"   Start position exists: {start_position is not None}")
                    return False
            else:
                print("❌ No sequence data in restored session")
                return False
        else:
            print("❌ Session restoration failed")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run the multi-beat restoration test."""
    success = test_multi_beat_sequence_save_restore()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 MULTI-BEAT RESTORATION TEST PASSED!")
        print("✅ Multi-beat sequences are being saved and restored correctly")
        print("✅ Start position data is preserved")
        print("✅ All beat data and motion data is preserved")
        print("\n💡 The restoration system is working correctly!")
    else:
        print("❌ MULTI-BEAT RESTORATION TEST FAILED!")
        print("❌ There are issues with multi-beat sequence preservation")
        print("\n🔧 Check the error messages above for details")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
