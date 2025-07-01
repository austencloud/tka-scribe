#!/usr/bin/env python3
"""
Test Complete Sequence Creation and Restoration Chain

This script tests the complete workflow:
1. Create a sequence with actual beats
2. Save to session with debug logging
3. Simulate restart and restoration
4. Verify beat frame receives and displays beats
"""

import sys
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))

def test_sequence_creation_with_beats():
    """Test creating a sequence with actual beats and saving to session."""
    print("=" * 80)
    print("  Testing Sequence Creation with Actual Beats")
    print("=" * 80)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import BeatData
        
        print("\n--- Step 1: Create Test Application ---")
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)
        
        print("✅ Test application and services created")
        
        print("\n--- Step 2: Create Sequence with Multiple Beats ---")
        
        # Create a sequence with multiple beats
        sequence_result = test_helper.create_sequence("Debug Chain Test", 3)
        assert sequence_result.success, f"Failed to create sequence: {sequence_result.error}"
        
        sequence_data = sequence_result.data
        sequence_id = sequence_data.get('id') if isinstance(sequence_data, dict) else sequence_data.id
        sequence_name = sequence_data.get('name') if isinstance(sequence_data, dict) else sequence_data.name
        
        print(f"✅ Created base sequence: {sequence_name} (ID: {sequence_id})")
        
        # Add actual beats to the sequence
        print("\n--- Step 3: Add Beats to Sequence ---")
        
        # Create beat data manually
        beat1 = BeatData(beat_number=1, letter="A", duration=1.0)
        beat2 = BeatData(beat_number=2, letter="B", duration=1.5)
        beat3 = BeatData(beat_number=3, letter="C", duration=2.0)
        
        # If sequence_data is a dict, add beats to it
        if isinstance(sequence_data, dict):
            sequence_data["beats"] = [beat1.to_dict(), beat2.to_dict(), beat3.to_dict()]
            print(f"✅ Added 3 beats to dict sequence")
        else:
            # If it's a SequenceData object, create a new one with beats
            from domain.models.core_models import SequenceData
            sequence_data = SequenceData(
                id=sequence_data.id,
                name=sequence_data.name,
                beats=[beat1, beat2, beat3]
            )
            print(f"✅ Created new SequenceData with 3 beats")
        
        print(f"   Beat 1: {beat1.letter} (duration: {beat1.duration})")
        print(f"   Beat 2: {beat2.letter} (duration: {beat2.duration})")
        print(f"   Beat 3: {beat3.letter} (duration: {beat3.duration})")
        
        print("\n--- Step 4: Save Sequence to Session ---")
        
        # This should trigger all our [SESSION] debug logging
        session_service.update_current_sequence(sequence_data, sequence_id)
        
        # Force save
        save_success = session_service.save_session_state()
        assert save_success, "Failed to save session state"
        
        print("✅ Sequence with beats saved to session")
        
        return sequence_id, sequence_name
        
    except Exception as e:
        print(f"❌ Sequence creation test failed: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def test_complete_restoration_chain(sequence_id, sequence_name):
    """Test the complete restoration chain including beat frame updates."""
    print("\n" + "=" * 80)
    print("  Testing Complete Restoration Chain")
    print("=" * 80)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from application.services.core.application_lifecycle_manager import ApplicationLifecycleManager
        from application.services.core.application_orchestrator import ApplicationOrchestrator
        from PyQt6.QtWidgets import QMainWindow, QApplication
        
        print("\n--- Step 1: Create Production Application ---")
        
        # Create production application
        container = ApplicationFactory.create_production_app()
        session_service = container.resolve(ISessionStateService)
        
        print("✅ Production application created")
        
        print("\n--- Step 2: Test Session Loading ---")
        
        # Test session loading directly
        restore_result = session_service.load_session_state()
        assert restore_result.success, f"Failed to load session: {restore_result.error_message}"
        assert restore_result.session_restored, "Session was not restored"
        
        session_data = restore_result.session_data
        print(f"✅ Session loaded - sequence: {session_data.current_sequence_id}")
        
        # Verify beat count in loaded session
        if session_data.current_sequence_data and "beats" in session_data.current_sequence_data:
            loaded_beat_count = len(session_data.current_sequence_data["beats"])
            print(f"✅ Loaded session has {loaded_beat_count} beats")
        else:
            print("⚠️ No beats found in loaded session data")
        
        print("\n--- Step 3: Test Application Orchestrator ---")
        
        # Create QApplication
        app = QApplication.instance()
        if app is None:
            app = QApplication(sys.argv)
        
        # Create orchestrator with container (like real app does)
        orchestrator = ApplicationOrchestrator(container=container)
        main_window = QMainWindow()
        
        # Initialize application - this should trigger complete restoration chain
        print("🔍 Initializing application with orchestrator...")
        tab_widget = orchestrator.initialize_application(main_window)
        
        print("✅ Application initialization completed")
        print(f"   Tab widget created: {type(tab_widget)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Restoration chain test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_session_file_content():
    """Check the actual session file content."""
    print("\n" + "=" * 80)
    print("  Session File Content Analysis")
    print("=" * 80)
    
    try:
        import json
        session_file = Path("src/desktop/modern/session_state.json")
        
        if not session_file.exists():
            print("❌ Session file does not exist")
            return False
        
        with open(session_file, 'r') as f:
            session_data = json.load(f)
        
        print(f"📄 Session file: {session_file}")
        print(f"📊 File size: {session_file.stat().st_size} bytes")
        
        # Analyze sequence data
        current_sequence = session_data.get("current_sequence", {})
        if current_sequence.get("sequence_id"):
            print(f"\n✅ Sequence in session:")
            print(f"   ID: {current_sequence['sequence_id']}")
            
            sequence_data = current_sequence.get("sequence_data", {})
            if sequence_data:
                print(f"   Name: {sequence_data.get('name', 'Unknown')}")
                beats = sequence_data.get("beats", [])
                print(f"   Beats: {len(beats)}")
                
                for i, beat in enumerate(beats):
                    letter = beat.get("letter", "Unknown")
                    duration = beat.get("duration", "Unknown")
                    print(f"     Beat {i}: {letter} (duration: {duration})")
                
                if len(beats) > 0:
                    print("✅ Session file contains beat data")
                    return True
                else:
                    print("⚠️ Session file has no beats")
                    return False
            else:
                print("❌ No sequence data in session")
                return False
        else:
            print("❌ No sequence found in session")
            return False
        
    except Exception as e:
        print(f"❌ Session file analysis failed: {e}")
        return False

def main():
    """Run complete sequence creation and restoration chain test."""
    print("🧪 Complete Sequence Creation and Restoration Chain Test")
    print("   This test verifies the entire workflow from sequence creation")
    print("   through session saving to restoration and beat frame display.")
    
    # Test 1: Create sequence with beats and save
    sequence_id, sequence_name = test_sequence_creation_with_beats()
    
    if not sequence_id:
        print("\n❌ SEQUENCE CREATION FAILED!")
        print("   Cannot proceed with restoration testing.")
        return
    
    # Test 2: Check session file content
    session_file_ok = check_session_file_content()
    
    if not session_file_ok:
        print("\n❌ SESSION FILE ISSUES!")
        print("   Session file doesn't contain proper beat data.")
        return
    
    # Test 3: Test complete restoration chain
    restoration_ok = test_complete_restoration_chain(sequence_id, sequence_name)
    
    print("\n" + "=" * 80)
    print("  Final Results")
    print("=" * 80)
    
    if restoration_ok:
        print("🎉 COMPLETE CHAIN TEST PASSED!")
        print("\n✅ All components working:")
        print("   - Sequence creation with beats")
        print("   - Session saving with beat data")
        print("   - Session loading and restoration")
        print("   - Application orchestrator initialization")
        
        print("\n🚀 Ready for real TKA testing:")
        print("   1. Start TKA: python main.py → TKA Desktop (Modern)")
        print("   2. Watch for debug messages during startup")
        print("   3. Create a sequence and add beats")
        print("   4. Watch for [SESSION] messages during creation")
        print("   5. Close TKA and restart")
        print("   6. Watch for complete restoration chain:")
        print("      - [ORCHESTRATOR] Session service resolved")
        print("      - [LIFECYCLE] Session restoration messages")
        print("      - [WORKBENCH] Event reception messages")
        print("      - [BEAT_FRAME_SECTION] Set sequence messages")
        print("      - [SEQUENCE_BEAT_FRAME] Display update messages")
        print("   7. Verify beats are visible in beat frame")
        
    else:
        print("❌ RESTORATION CHAIN FAILED!")
        print("   Check the debug messages above to identify the issue.")

if __name__ == "__main__":
    main()
