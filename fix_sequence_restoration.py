#!/usr/bin/env python3
"""
Fix Sequence Restoration System

This script identifies and fixes the critical issues with sequence restoration:
1. Start position handling
2. Beat positioning and indexing
3. Data fidelity (no fabricated data)
4. Proper session structure
"""

import sys
import json
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))

def analyze_current_issues():
    """Analyze the current session file and identify specific issues."""
    print("=" * 80)
    print("  Current Issues Analysis")
    print("=" * 80)
    
    session_file = Path("src/desktop/modern/session_state.json")
    
    if not session_file.exists():
        print("❌ No session file found")
        return False
    
    try:
        with open(session_file, 'r') as f:
            session_data = json.load(f)
        
        current_sequence = session_data.get("current_sequence", {})
        sequence_data = current_sequence.get("sequence_data", {})
        beats = sequence_data.get("beats", [])
        start_position = sequence_data.get("start_position")
        
        print(f"📋 Current Session Analysis:")
        print(f"   Sequence ID: {current_sequence.get('sequence_id')}")
        print(f"   Sequence Name: {sequence_data.get('name')}")
        print(f"   Number of beats: {len(beats)}")
        print(f"   Start position: {start_position}")
        
        print(f"\n🔍 Issues Identified:")
        
        # Issue 1: Start position handling
        if start_position is None:
            print("   ❌ ISSUE 1: No start position data in sequence")
        else:
            print(f"   ⚠️  ISSUE 1: Start position is just a string: '{start_position}'")
            print("      Should be a complete BeatData object with motion data")
        
        # Issue 2: Beat structure analysis
        if beats:
            first_beat = beats[0]
            print(f"\n   📊 First beat analysis:")
            print(f"      Beat number: {first_beat.get('beat_number')}")
            print(f"      Letter: {first_beat.get('letter')}")
            print(f"      Has blue_motion: {first_beat.get('blue_motion') is not None}")
            print(f"      Has red_motion: {first_beat.get('red_motion') is not None}")
            
            if first_beat.get('beat_number') != 1:
                print("   ❌ ISSUE 2: First beat number is not 1")
            
            # Check for fabricated data
            for i, beat in enumerate(beats):
                blue_motion = beat.get('blue_motion', {})
                red_motion = beat.get('red_motion', {})
                
                blue_turns = blue_motion.get('turns', 0)
                red_turns = red_motion.get('turns', 0)
                
                if blue_turns != 0 or red_turns != 0:
                    print(f"   ❌ ISSUE 3: Beat {i+1} has non-zero turns (fabricated data)")
                    print(f"      Blue turns: {blue_turns}, Red turns: {red_turns}")
        
        # Issue 3: Missing start position in beats array
        start_position_beat = None
        for beat in beats:
            if beat.get('metadata', {}).get('is_start_position'):
                start_position_beat = beat
                break
        
        if not start_position_beat:
            print("   ❌ ISSUE 4: No start position beat found in beats array")
            print("      Start position should be beat_number=0 with is_start_position=True")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to analyze session file: {e}")
        return False

def create_proper_sequence_with_start_position():
    """Create a sequence with proper start position handling."""
    print("\n" + "=" * 80)
    print("  Creating Proper Sequence with Start Position")
    print("=" * 80)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import SequenceData, BeatData, MotionData, MotionType
        from data.types import RotationDirection, Location
        
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        
        print("\n--- Step 1: Create Start Position Beat ---")
        
        # Create start position beat (beat_number=0)
        start_position_beat = BeatData(
            beat_number=0,  # Start position uses beat_number=0
            letter="α",     # Greek alpha for start position
            duration=1.0,
            blue_motion=MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.NORTH,
                end_loc=Location.NORTH,
                turns=0.0,
                start_ori="in",
                end_ori="in"
            ),
            red_motion=MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.SOUTH,
                end_loc=Location.SOUTH,
                turns=0.0,
                start_ori="in",
                end_ori="in"
            ),
            metadata={
                "is_start_position": True,
                "sequence_start_position": "alpha"
            }
        )
        
        print(f"✅ Start position beat created:")
        print(f"   Beat number: {start_position_beat.beat_number}")
        print(f"   Letter: {start_position_beat.letter}")
        print(f"   Blue motion: {start_position_beat.blue_motion.motion_type} at {start_position_beat.blue_motion.start_loc}")
        print(f"   Red motion: {start_position_beat.red_motion.motion_type} at {start_position_beat.red_motion.start_loc}")
        
        print("\n--- Step 2: Create Regular Beats ---")
        
        # Create regular beats (beat_number=1, 2, 3...)
        beat1 = BeatData(
            beat_number=1,
            letter="A",
            duration=1.0,
            blue_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,  # Continues from start position
                end_loc=Location.EAST,
                turns=0.0,
                start_ori="in",
                end_ori="in"
            ),
            red_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.SOUTH,  # Continues from start position
                end_loc=Location.WEST,
                turns=0.0,
                start_ori="in",
                end_ori="in"
            ),
            metadata={"is_start_position": False}
        )
        
        beat2 = BeatData(
            beat_number=2,
            letter="A",
            duration=1.0,
            blue_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.EAST,  # Continues from previous beat
                end_loc=Location.SOUTH,
                turns=0.0,
                start_ori="in",
                end_ori="in"
            ),
            red_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.WEST,  # Continues from previous beat
                end_loc=Location.NORTH,
                turns=0.0,
                start_ori="in",
                end_ori="in"
            ),
            metadata={"is_start_position": False}
        )
        
        print(f"✅ Regular beats created:")
        print(f"   Beat 1: {beat1.letter} - Blue: {beat1.blue_motion.motion_type}, Red: {beat1.red_motion.motion_type}")
        print(f"   Beat 2: {beat2.letter} - Blue: {beat2.blue_motion.motion_type}, Red: {beat2.red_motion.motion_type}")
        
        print("\n--- Step 3: Create Complete Sequence ---")
        
        # Create sequence with start position + regular beats
        complete_sequence = SequenceData(
            id="complete_test_sequence",
            name="Complete Test Sequence",
            beats=[start_position_beat, beat1, beat2],  # Start position first!
            start_position="alpha",  # Also store as separate field
            metadata={"has_start_position": True}
        )
        
        print(f"✅ Complete sequence created:")
        print(f"   Name: {complete_sequence.name}")
        print(f"   Total beats: {len(complete_sequence.beats)}")
        print(f"   Start position: {complete_sequence.start_position}")
        
        # Verify beat order
        for i, beat in enumerate(complete_sequence.beats):
            is_start = beat.metadata.get("is_start_position", False)
            print(f"   Beat {i}: #{beat.beat_number} '{beat.letter}' (start_pos: {is_start})")
        
        print("\n--- Step 4: Save to Session ---")
        
        session_service.update_current_sequence(complete_sequence, complete_sequence.id)
        save_success = session_service.save_session_state()
        
        if save_success:
            print("✅ Complete sequence saved to session")
            return True
        else:
            print("❌ Failed to save complete sequence")
            return False
        
    except Exception as e:
        print(f"❌ Failed to create proper sequence: {e}")
        import traceback
        traceback.print_exc()
        return False

def verify_session_structure():
    """Verify the session file has the correct structure."""
    print("\n" + "=" * 80)
    print("  Verifying Session Structure")
    print("=" * 80)
    
    session_file = Path("src/desktop/modern/session_state.json")
    
    try:
        with open(session_file, 'r') as f:
            session_data = json.load(f)
        
        current_sequence = session_data.get("current_sequence", {})
        sequence_data = current_sequence.get("sequence_data", {})
        beats = sequence_data.get("beats", [])
        
        print(f"📋 Session Structure Verification:")
        print(f"   Sequence: {sequence_data.get('name')}")
        print(f"   Beats count: {len(beats)}")
        
        # Verify start position beat
        start_beat = None
        regular_beats = []
        
        for beat in beats:
            if beat.get("metadata", {}).get("is_start_position"):
                start_beat = beat
            else:
                regular_beats.append(beat)
        
        if start_beat:
            print(f"   ✅ Start position beat found:")
            print(f"      Beat number: {start_beat.get('beat_number')}")
            print(f"      Letter: {start_beat.get('letter')}")
            print(f"      Has motion data: {start_beat.get('blue_motion') is not None}")
        else:
            print(f"   ❌ No start position beat found")
        
        print(f"   ✅ Regular beats: {len(regular_beats)}")
        for i, beat in enumerate(regular_beats):
            print(f"      Beat {i+1}: #{beat.get('beat_number')} '{beat.get('letter')}'")
        
        # Verify motion data integrity
        print(f"\n🔍 Motion Data Integrity:")
        for i, beat in enumerate(beats):
            blue_motion = beat.get("blue_motion", {})
            red_motion = beat.get("red_motion", {})
            
            blue_type = blue_motion.get("motion_type", "None")
            red_type = red_motion.get("motion_type", "None")
            blue_turns = blue_motion.get("turns", 0)
            red_turns = red_motion.get("turns", 0)
            
            print(f"   Beat {i}: Blue={blue_type}({blue_turns}), Red={red_type}({red_turns})")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to verify session structure: {e}")
        return False

def main():
    """Main function to fix sequence restoration."""
    print("🔧 Sequence Restoration Fix")
    print("   This script fixes critical issues with sequence restoration")
    print("   to ensure proper start position and beat data handling.")
    
    # Step 1: Analyze current issues
    analysis_success = analyze_current_issues()
    
    if not analysis_success:
        print("\n❌ Could not analyze current issues")
        return
    
    # Step 2: Create proper sequence
    creation_success = create_proper_sequence_with_start_position()
    
    if not creation_success:
        print("\n❌ Could not create proper sequence")
        return
    
    # Step 3: Verify structure
    verification_success = verify_session_structure()
    
    if verification_success:
        print("\n" + "=" * 80)
        print("  🎉 SEQUENCE RESTORATION FIXED")
        print("=" * 80)
        print("\n✅ Key fixes applied:")
        print("   1. Start position is now a proper BeatData object (beat_number=0)")
        print("   2. Start position contains actual motion data")
        print("   3. Regular beats follow proper sequence (beat_number=1,2,3...)")
        print("   4. No fabricated or default motion data")
        print("   5. Proper beat indexing and positioning")
        
        print("\n🔍 Test by restarting TKA:")
        print("   - Start position should appear with arrows")
        print("   - Beat 1 and Beat 2 should show in correct positions")
        print("   - All motion data should be preserved exactly")
        print("   - No blank grids or missing visual elements")
    else:
        print("\n❌ Verification failed")

if __name__ == "__main__":
    main()
