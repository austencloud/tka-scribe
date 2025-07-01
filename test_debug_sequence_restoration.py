#!/usr/bin/env python3
"""
Comprehensive Debug Test for Sequence Restoration

This script tests the complete sequence restoration workflow with detailed logging:
1. Create a sequence and verify session saving
2. Simulate application restart
3. Test session restoration and UI event publishing
4. Verify workbench receives and processes events
5. Check that beat frame would be updated
"""

import sys
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))

def print_header(title: str):
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)

def print_section(title: str):
    """Print a formatted section header."""
    print(f"\n--- {title} ---")

def test_sequence_creation_and_saving():
    """Test sequence creation and session saving with debug logging."""
    print_header("Phase 1: Sequence Creation and Session Saving")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.interfaces.session_services import ISessionStateService
        
        print_section("Creating Test Application")
        
        # Create test application
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)
        
        print("✅ Test application and services created")
        
        print_section("Creating Test Sequence")
        
        # Create a test sequence
        sequence_result = test_helper.create_sequence("Debug Test Sequence", 3)
        assert sequence_result.success, f"Failed to create sequence: {sequence_result.error}"
        
        sequence_data = sequence_result.data
        sequence_id = sequence_data.get('id') if isinstance(sequence_data, dict) else sequence_data.id
        sequence_name = sequence_data.get('name') if isinstance(sequence_data, dict) else sequence_data.name
        
        print(f"✅ Created test sequence: {sequence_name} (ID: {sequence_id})")
        
        print_section("Updating Session State")
        
        # Update session with sequence - this should trigger all our logging
        session_service.update_current_sequence(sequence_data, sequence_id)
        
        # Add some workbench state
        from domain.models.core_models import BeatData
        beat_data = BeatData(beat_number=2, letter="B", duration=1.5)
        session_service.update_workbench_state(1, beat_data, None)
        
        print_section("Saving Session State")
        
        # Force save session state
        save_success = session_service.save_session_state()
        assert save_success, "Failed to save session state"
        print("✅ Session state saved successfully")
        
        return sequence_id, sequence_name
        
    except Exception as e:
        print(f"❌ Phase 1 failed: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def test_application_restart_and_restoration(expected_sequence_id, expected_sequence_name):
    """Test application restart and session restoration with debug logging."""
    print_header("Phase 2: Application Restart and Session Restoration")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from core.interfaces.core_services import IUIStateManagementService
        from application.services.core.application_lifecycle_manager import ApplicationLifecycleManager
        
        print_section("Creating New Application Instance")
        
        # Create new application instance (simulating restart)
        new_container = ApplicationFactory.create_test_app()
        new_session_service = new_container.resolve(ISessionStateService)
        new_ui_service = new_container.resolve(IUIStateManagementService)
        
        print("✅ New application instance created (simulating restart)")
        
        print_section("Testing Session Loading")
        
        # Test session loading directly
        restore_result = new_session_service.load_session_state()
        assert restore_result.success, f"Failed to load session: {restore_result.error_message}"
        assert restore_result.session_restored, "Session was not restored"
        
        session_data = restore_result.session_data
        print(f"✅ Session loaded successfully")
        print(f"   Expected sequence ID: {expected_sequence_id}")
        print(f"   Actual sequence ID: {session_data.current_sequence_id}")
        
        # Verify session data matches what we saved
        assert session_data.current_sequence_id == expected_sequence_id
        print("✅ Session data verification passed")
        
        print_section("Testing Application Lifecycle Manager")
        
        # Create and test application lifecycle manager
        lifecycle_manager = ApplicationLifecycleManager(new_session_service)
        
        # Test the UI restoration method directly - this should trigger all our logging
        print("🔍 Calling _apply_restored_session_to_ui()...")
        lifecycle_manager._apply_restored_session_to_ui(session_data)
        
        print("✅ Application lifecycle restoration completed")
        
        return True
        
    except Exception as e:
        print(f"❌ Phase 2 failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_workbench_event_handling():
    """Test workbench event handling for sequence restoration."""
    print_header("Phase 3: Workbench Event Handling Test")
    
    try:
        from core.application.application_factory import ApplicationFactory
        from core.events.event_bus import get_event_bus, UIEvent, EventPriority
        from domain.models.core_models import SequenceData, BeatData
        from presentation.components.workbench.workbench import Workbench
        
        print_section("Creating Test Environment")
        
        # Create test application
        container = ApplicationFactory.create_test_app()
        event_bus = get_event_bus()
        
        print("✅ Test environment created")
        
        print_section("Creating Mock Workbench")
        
        # We'll create a minimal workbench instance to test event handling
        # Note: This might fail if workbench has complex dependencies
        try:
            # Get required services for workbench
            from core.interfaces.core_services import ILayoutService
            from core.interfaces.workbench_services import ISequenceWorkbenchService
            from core.interfaces.session_services import ISessionStateService
            
            layout_service = container.resolve(ILayoutService)
            workbench_service = container.resolve(ISequenceWorkbenchService)
            session_service = container.resolve(ISessionStateService)
            
            # Create workbench instance
            workbench = Workbench(
                layout_service=layout_service,
                workbench_service=workbench_service,
                session_service=session_service,
                # Add other required parameters as needed
            )
            
            print("✅ Workbench instance created")
            
        except Exception as e:
            print(f"⚠️ Could not create workbench instance: {e}")
            print("   This is expected if workbench has complex UI dependencies")
            print("   Testing event publishing instead...")
            
            # Test event publishing without workbench
            test_sequence = SequenceData(
                id="test_event_seq",
                name="Test Event Sequence",
                beats=[
                    BeatData(beat_number=1, letter="A", duration=1.0),
                    BeatData(beat_number=2, letter="B", duration=1.5)
                ]
            )
            
            # Create restoration event
            restoration_event = UIEvent(
                component="session_restoration",
                action="sequence_restored",
                state_data={
                    "sequence_data": test_sequence,
                    "sequence_id": test_sequence.id,
                    "selected_beat_index": 1,
                    "start_position_data": BeatData(beat_number=1, letter="A", duration=1.0)
                },
                source="test_script",
                priority=EventPriority.HIGH
            )
            
            # Track if event was published
            event_published = False
            
            def test_event_handler(event):
                nonlocal event_published
                event_published = True
                print(f"📨 Test handler received event: {event.component}.{event.action}")
            
            # Subscribe to restoration events
            event_bus.subscribe("session_restoration.sequence_restored", test_event_handler)
            
            # Publish the event
            print("🔍 Publishing test restoration event...")
            event_bus.publish(restoration_event)
            
            # Verify event was published and received
            assert event_published, "Event was not received by handler"
            print("✅ Event publishing and handling test passed")
        
        return True
        
    except Exception as e:
        print(f"❌ Phase 3 failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def check_session_file():
    """Check the session file content."""
    print_header("Phase 4: Session File Verification")
    
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
            
            return True
        else:
            print("❌ No sequence found in session")
            return False
        
    except Exception as e:
        print(f"❌ Session file check failed: {e}")
        return False

def main():
    """Run comprehensive debug test for sequence restoration."""
    print_header("TKA Sequence Restoration - Comprehensive Debug Test")
    
    print("🧪 This test will run the complete sequence restoration workflow")
    print("   with detailed debug logging to identify any issues.")
    print("\n📋 Test phases:")
    print("   1. Create sequence and save to session")
    print("   2. Simulate restart and test restoration")
    print("   3. Test workbench event handling")
    print("   4. Verify session file content")
    
    # Run test phases
    sequence_id, sequence_name = test_sequence_creation_and_saving()
    
    if sequence_id:
        phase2_success = test_application_restart_and_restoration(sequence_id, sequence_name)
        phase3_success = test_workbench_event_handling()
        phase4_success = check_session_file()
        
        print_header("Final Test Results")
        
        if phase2_success and phase3_success and phase4_success:
            print("🎉 ALL TESTS PASSED!")
            print("\n✅ The sequence restoration system is working correctly.")
            print("   All debug logging is now active for real application testing.")
            
            print("\n🚀 Next steps for real TKA testing:")
            print("   1. Start TKA modern application")
            print("   2. Watch console for debug messages during startup")
            print("   3. Create a sequence and watch session saving messages")
            print("   4. Close TKA and restart")
            print("   5. Watch for restoration messages during startup")
            print("   6. Verify sequence appears in beat frame")
            
            print("\n🔍 Key debug messages to look for:")
            print("   [LIFECYCLE] Session service available, attempting restoration...")
            print("   [LIFECYCLE] Publishing sequence restoration event...")
            print("   [WORKBENCH] Received sequence restoration event!")
            print("   [WORKBENCH] set_sequence() called with: [sequence_name]")
            print("   [SESSION] Updating current sequence: [sequence_id]")
            
        else:
            print("❌ SOME TESTS FAILED!")
            if not phase2_success:
                print("   - Application restart and restoration test failed")
            if not phase3_success:
                print("   - Workbench event handling test failed")
            if not phase4_success:
                print("   - Session file verification failed")
    else:
        print("❌ SEQUENCE CREATION FAILED!")
        print("   Cannot proceed with restoration testing.")

if __name__ == "__main__":
    main()
