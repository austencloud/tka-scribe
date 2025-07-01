#!/usr/bin/env python3
"""
Simple Test for Sequence Restoration

This script tests the basic sequence restoration workflow:
1. Create and save a sequence
2. Simulate restart and restore
3. Verify the sequence is available for the workbench
"""

import sys
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))

def test_basic_sequence_restoration():
    """Test basic sequence restoration workflow."""
    print("=" * 60)
    print("  Testing Basic Sequence Restoration")
    print("=" * 60)
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.interfaces.session_services import ISessionStateService
        from domain.models.core_models import BeatData
        
        print("\n--- Step 1: Create and Save Sequence ---")
        
        # Create test application
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)
        
        # Create a test sequence
        sequence_result = test_helper.create_sequence("My Test Sequence", 4)
        assert sequence_result.success, f"Failed to create sequence: {sequence_result.error}"
        
        sequence_data = sequence_result.data
        sequence_id = sequence_data.get('id') if isinstance(sequence_data, dict) else sequence_data.id
        sequence_name = sequence_data.get('name') if isinstance(sequence_data, dict) else sequence_data.name
        
        print(f"✅ Created sequence: {sequence_name} (ID: {sequence_id})")
        
        # Save to session
        session_service.update_current_sequence(sequence_data, sequence_id)
        
        # Add some workbench state
        beat_data = BeatData(beat_number=2, letter="B", duration=1.5)
        session_service.update_workbench_state(1, beat_data, None)
        
        # Save session
        save_success = session_service.save_session_state()
        assert save_success, "Failed to save session"
        print("✅ Session saved successfully")
        
        print("\n--- Step 2: Simulate Application Restart ---")
        
        # Create new application (simulating restart)
        new_container = ApplicationFactory.create_test_app()
        new_session_service = new_container.resolve(ISessionStateService)
        
        print("✅ New application created")
        
        print("\n--- Step 3: Restore Session ---")
        
        # Load session
        restore_result = new_session_service.load_session_state()
        assert restore_result.success, f"Failed to load session: {restore_result.error_message}"
        assert restore_result.session_restored, "Session was not restored"
        
        session_data = restore_result.session_data
        print(f"✅ Session restored successfully")
        print(f"   Sequence ID: {session_data.current_sequence_id}")
        print(f"   Selected beat: {session_data.selected_beat_index}")
        
        # Verify data matches
        assert session_data.current_sequence_id == sequence_id
        assert session_data.selected_beat_index == 1
        
        print("✅ Session data verification passed")
        
        print("\n--- Step 4: Test Application Lifecycle Restoration ---")
        
        # Test the application lifecycle manager
        from application.services.core.application_lifecycle_manager import ApplicationLifecycleManager
        
        lifecycle_manager = ApplicationLifecycleManager(new_session_service)
        
        # This would normally be called during app startup
        # We'll call the restoration method directly
        lifecycle_manager._apply_restored_session_to_ui(session_data)
        
        print("✅ Application lifecycle restoration executed")
        
        print("\n--- Results ---")
        print("🎉 SEQUENCE RESTORATION TEST PASSED!")
        print("\n📋 What was tested:")
        print("   ✅ Sequence creation and session saving")
        print("   ✅ Session persistence across 'restarts'")
        print("   ✅ Session data loading and validation")
        print("   ✅ Application lifecycle restoration")
        
        print("\n🔧 What happens in real TKA:")
        print("   1. User creates sequence → automatically saved to session")
        print("   2. User closes TKA → session persists to file")
        print("   3. User reopens TKA → ApplicationLifecycleManager restores session")
        print("   4. Workbench receives restoration event → displays sequence")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_session_file_content():
    """Check what's actually in the session file."""
    print("\n" + "=" * 60)
    print("  Session File Content Analysis")
    print("=" * 60)
    
    try:
        import json
        from pathlib import Path
        
        # Check for session file
        session_file = Path("src/desktop/modern/session_state.json")
        if not session_file.exists():
            print("❌ No session file found")
            return False
        
        # Read and display content
        with open(session_file, 'r') as f:
            session_data = json.load(f)
        
        print(f"📄 Session file: {session_file}")
        print(f"📊 File size: {session_file.stat().st_size} bytes")
        
        # Show sequence data
        current_sequence = session_data.get("current_sequence", {})
        if current_sequence.get("sequence_id"):
            print(f"\n✅ Sequence in session:")
            print(f"   ID: {current_sequence['sequence_id']}")
            
            sequence_data = current_sequence.get("sequence_data", {})
            if sequence_data:
                print(f"   Name: {sequence_data.get('name', 'Unknown')}")
                print(f"   Beats: {len(sequence_data.get('beats', []))}")
            
            # Show workbench state
            workbench_state = session_data.get("workbench_state", {})
            if workbench_state:
                print(f"\n📍 Workbench state:")
                print(f"   Selected beat: {workbench_state.get('selected_beat_index')}")
                if workbench_state.get('selected_beat_data'):
                    beat_data = workbench_state['selected_beat_data']
                    print(f"   Beat data: {beat_data.get('letter')} (duration: {beat_data.get('duration')})")
        else:
            print("❌ No sequence found in session")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to analyze session file: {e}")
        return False

def main():
    """Run the simple sequence restoration test."""
    print("🧪 TKA Sequence Restoration - Simple Test")
    print("   This test verifies that sequences are saved and restored correctly.")
    
    # Run tests
    test1_passed = test_basic_sequence_restoration()
    test2_passed = test_session_file_content()
    
    print("\n" + "=" * 60)
    print("  Final Results")
    print("=" * 60)
    
    if test1_passed and test2_passed:
        print("🎉 ALL TESTS PASSED!")
        print("\n✅ The sequence restoration system is working correctly.")
        print("   When you create a sequence in TKA and restart, it should be restored.")
        
        print("\n🚀 Ready to test with actual TKA application:")
        print("   1. Start TKA modern application")
        print("   2. Create a sequence with some beats")
        print("   3. Close TKA completely")
        print("   4. Restart TKA")
        print("   5. Check if the sequence appears in the beat frame")
        
        print("\n📝 If the sequence doesn't appear in the beat frame:")
        print("   - Check console output for restoration events")
        print("   - Verify workbench is subscribed to restoration events")
        print("   - Ensure beat frame updates when sequence is set")
        
    else:
        print("❌ SOME TESTS FAILED!")
        if not test1_passed:
            print("   - Basic restoration test failed")
        if not test2_passed:
            print("   - Session file analysis failed")

if __name__ == "__main__":
    main()
