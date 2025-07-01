#!/usr/bin/env python3
"""
Test TKA Sequence Restoration in Real Application

This script tests sequence restoration using the actual TKA application
to verify that motion data appears correctly in the beat frame.
"""

import sys
import time
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))

def test_tka_sequence_restoration():
    """Test sequence restoration in the actual TKA application."""
    print("=" * 80)
    print("  TKA Sequence Restoration Test")
    print("=" * 80)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import SequenceData, BeatData, MotionData, MotionType
        from data.types import RotationDirection, Location
        
        print("\n--- Step 1: Create Rich Sequence with Motion Data ---")
        
        # Create blue motion (STATIC at NORTH)
        blue_motion = MotionData(
            motion_type=MotionType.STATIC,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTH,
            end_loc=Location.NORTH,
            turns=0.0,
            start_ori="in",
            end_ori="in"
        )
        
        # Create red motion (PRO from SOUTH to EAST)
        red_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.SOUTH,
            end_loc=Location.EAST,
            turns=1.0,
            start_ori="in",
            end_ori="out"
        )
        
        # Create beat with motion data
        test_beat = BeatData(
            beat_number=1,
            letter="T",
            duration=1.5,
            blue_motion=blue_motion,
            red_motion=red_motion,
            metadata={"test_marker": "tka_restoration_test"}
        )
        
        # Create sequence
        test_sequence = SequenceData(
            id="tka_restoration_test",
            name="TKA Restoration Test",
            beats=[test_beat]
        )
        
        print(f"✅ Created test sequence: {test_sequence.name}")
        print(f"   Beat: {test_beat.letter} (duration: {test_beat.duration})")
        print(f"   Blue motion: {blue_motion.motion_type} at {blue_motion.start_loc}")
        print(f"   Red motion: {red_motion.motion_type} from {red_motion.start_loc} to {red_motion.end_loc}")
        
        print("\n--- Step 2: Save Sequence to Session ---")
        
        # Create application and save sequence
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        
        session_service.update_current_sequence(test_sequence, test_sequence.id)
        save_success = session_service.save_session_state()
        
        if not save_success:
            print("❌ Failed to save sequence to session")
            return False
        
        print("✅ Sequence saved to session successfully")
        
        print("\n--- Step 3: Verify Session File Content ---")
        
        # Check session file content
        session_file = Path("src/desktop/modern/session_state.json")
        if session_file.exists():
            import json
            with open(session_file, 'r') as f:
                session_data = json.load(f)
            
            sequence_data = session_data.get("current_sequence", {}).get("sequence_data", {})
            beats = sequence_data.get("beats", [])
            
            if beats:
                beat = beats[0]
                blue_motion_data = beat.get("blue_motion", {})
                red_motion_data = beat.get("red_motion", {})
                
                print(f"✅ Session file contains motion data:")
                print(f"   Blue motion type: {blue_motion_data.get('motion_type')}")
                print(f"   Blue start location: {blue_motion_data.get('start_loc')}")
                print(f"   Red motion type: {red_motion_data.get('motion_type')}")
                print(f"   Red start location: {red_motion_data.get('start_loc')}")
                print(f"   Red end location: {red_motion_data.get('end_loc')}")
            else:
                print("❌ No beats found in session file")
                return False
        else:
            print("❌ Session file not found")
            return False
        
        print("\n--- Step 4: Test Application Startup with Restoration ---")
        
        print("🔍 Now restart TKA and check if:")
        print("   1. The sequence 'TKA Restoration Test' is loaded")
        print("   2. Beat 'T' appears in the beat frame")
        print("   3. Blue arrows appear pointing NORTH (static)")
        print("   4. Red arrows appear pointing from SOUTH to EAST (pro motion)")
        print("   5. Beat duration shows 1.5")
        
        print("\n✅ Test sequence is ready for manual verification!")
        print("   Start TKA and verify the beat frame displays motion data correctly.")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_multiple_beat_test():
    """Create a more complex sequence with multiple beats for testing."""
    print("\n" + "=" * 80)
    print("  Creating Multi-Beat Test Sequence")
    print("=" * 80)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import SequenceData, BeatData, MotionData, MotionType
        from data.types import RotationDirection, Location
        
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        
        # Create multiple beats with different motion data
        beats = []
        
        # Beat 1: Static motions
        beat1 = BeatData(
            beat_number=1,
            letter="A",
            duration=1.0,
            blue_motion=MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.NORTH,
                end_loc=Location.NORTH,
                turns=0.0
            ),
            red_motion=MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.SOUTH,
                end_loc=Location.SOUTH,
                turns=0.0
            )
        )
        beats.append(beat1)
        
        # Beat 2: Pro motions
        beat2 = BeatData(
            beat_number=2,
            letter="B",
            duration=1.5,
            blue_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.EAST,
                end_loc=Location.WEST,
                turns=1.0
            ),
            red_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.WEST,
                end_loc=Location.EAST,
                turns=1.0
            )
        )
        beats.append(beat2)
        
        # Beat 3: Anti motions
        beat3 = BeatData(
            beat_number=3,
            letter="C",
            duration=2.0,
            blue_motion=MotionData(
                motion_type=MotionType.ANTI,
                prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
                start_loc=Location.NORTHEAST,
                end_loc=Location.SOUTHWEST,
                turns=0.5
            ),
            red_motion=MotionData(
                motion_type=MotionType.ANTI,
                prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
                start_loc=Location.NORTHWEST,
                end_loc=Location.SOUTHEAST,
                turns=0.5
            )
        )
        beats.append(beat3)
        
        # Create multi-beat sequence
        multi_sequence = SequenceData(
            id="multi_beat_test",
            name="Multi-Beat Motion Test",
            beats=beats
        )
        
        print(f"✅ Created multi-beat sequence: {multi_sequence.name}")
        for i, beat in enumerate(beats):
            print(f"   Beat {i+1}: {beat.letter} - Blue: {beat.blue_motion.motion_type}, Red: {beat.red_motion.motion_type}")
        
        # Save to session
        session_service.update_current_sequence(multi_sequence, multi_sequence.id)
        save_success = session_service.save_session_state()
        
        if save_success:
            print("✅ Multi-beat sequence saved successfully")
            print("\n🔍 Restart TKA to verify:")
            print("   - All 3 beats appear in beat frame")
            print("   - Each beat shows different motion types")
            print("   - Arrows point in correct directions")
            print("   - Beat durations are preserved (1.0, 1.5, 2.0)")
            return True
        else:
            print("❌ Failed to save multi-beat sequence")
            return False
        
    except Exception as e:
        print(f"❌ Multi-beat test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test function."""
    print("🔍 TKA Sequence Restoration Test")
    print("   This script creates test sequences with motion data")
    print("   and saves them for manual verification in TKA.")
    
    # Test single beat sequence
    single_success = test_tka_sequence_restoration()
    
    if single_success:
        # Test multi-beat sequence
        multi_success = create_multiple_beat_test()
        
        if multi_success:
            print("\n" + "=" * 80)
            print("  🎉 TEST SEQUENCES CREATED SUCCESSFULLY")
            print("=" * 80)
            print("\n✅ Both test sequences are ready for verification!")
            print("✅ Motion data should persist correctly across TKA restarts")
            print("✅ Beat frame should display all visual elements")
            
            print("\n📋 Manual Verification Steps:")
            print("   1. Start TKA application")
            print("   2. Check that sequence is automatically loaded")
            print("   3. Verify beat frame shows correct number of beats")
            print("   4. Verify each beat displays arrows and motion data")
            print("   5. Check that beat letters and durations are correct")
            print("   6. Verify arrows point in expected directions")
            
        else:
            print("\n❌ Multi-beat test failed")
    else:
        print("\n❌ Single beat test failed")

if __name__ == "__main__":
    main()
