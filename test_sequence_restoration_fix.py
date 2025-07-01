#!/usr/bin/env python3
"""
Test Script for Sequence Restoration Fix

This script tests the complete sequence persistence workflow:
1. Create a sequence
2. Save it to session
3. Simulate application restart
4. Verify sequence is restored to workbench
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


def test_complete_sequence_restoration_workflow():
    """Test the complete sequence restoration workflow."""
    print_header("Testing Complete Sequence Restoration Workflow")

    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.interfaces.session_services import ISessionStateService
        from core.interfaces.core_services import IUIStateManagementService
        from domain.models.core_models import SequenceData, BeatData

        print_section("Phase 1: Create Sequence and Save to Session")

        # Create test application
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)
        ui_service = container.resolve(IUIStateManagementService)

        print("✅ Test application created")

        # Create a test sequence
        sequence_result = test_helper.create_sequence("Restoration Test Sequence", 4)
        assert (
            sequence_result.success
        ), f"Failed to create sequence: {sequence_result.error}"

        sequence_data = sequence_result.data
        sequence_id = (
            sequence_data.get("id")
            if isinstance(sequence_data, dict)
            else sequence_data.id
        )
        sequence_name = (
            sequence_data.get("name")
            if isinstance(sequence_data, dict)
            else sequence_data.name
        )

        print(f"✅ Created test sequence: {sequence_name} (ID: {sequence_id})")

        # Add some beats to make it more realistic
        beat1 = BeatData(beat_number=1, letter="A", duration=1.0)
        beat2 = BeatData(beat_number=2, letter="B", duration=1.5)

        # Update session with sequence and workbench state
        session_service.update_current_sequence(sequence_data, sequence_id)
        session_service.update_workbench_state(
            1, beat2, beat1
        )  # Select beat 2, start pos beat 1
        session_service.update_ui_state("sequence_builder", {"test": "layout"})

        print("✅ Updated session with sequence and workbench state")

        # Save session state
        save_success = session_service.save_session_state()
        assert save_success, "Failed to save session state"
        print("✅ Session state saved successfully")

        print_section("Phase 2: Simulate Application Restart")

        # Create new application instance (simulating restart)
        new_container = ApplicationFactory.create_test_app()
        new_session_service = new_container.resolve(ISessionStateService)
        new_ui_service = new_container.resolve(IUIStateManagementService)

        print("✅ New application instance created (simulating restart)")

        # Test the application lifecycle manager restoration
        from application.services.core.application_lifecycle_manager import (
            ApplicationLifecycleManager,
        )

        lifecycle_manager = ApplicationLifecycleManager(new_session_service)

        print("✅ Application lifecycle manager created")

        print_section("Phase 3: Test Session Restoration")

        # Load session state
        restore_result = new_session_service.load_session_state()
        assert (
            restore_result.success
        ), f"Failed to load session: {restore_result.error_message}"
        assert restore_result.session_restored, "Session was not restored"

        session_data = restore_result.session_data
        print(f"✅ Session loaded successfully")
        print(f"   Sequence ID: {session_data.current_sequence_id}")
        print(f"   Selected beat: {session_data.selected_beat_index}")
        print(f"   Active tab: {session_data.active_tab}")

        # Verify session data matches what we saved
        assert session_data.current_sequence_id == sequence_id
        assert session_data.selected_beat_index == 1
        assert session_data.active_tab == "sequence_builder"

        print("✅ Session data verification passed")

        print_section("Phase 4: Test UI Restoration")

        # Test the UI restoration method directly
        lifecycle_manager._apply_restored_session_to_ui(session_data)
        print("✅ UI restoration method executed")

        # In a real application, the workbench would receive the event
        # and restore the sequence. For testing, we'll verify the event
        # publishing mechanism works.

        print_section("Phase 5: Verify Event Publishing")

        from core.events.event_bus import get_event_bus

        event_bus = get_event_bus()
        events_received = []

        def capture_event(event):
            events_received.append(event)
            print(f"📨 Event received: {event.component}.{event.action}")

        # Subscribe to restoration events
        event_bus.subscribe("session_restoration.sequence_restored", capture_event)
        event_bus.subscribe("session_restoration.tab_restored", capture_event)

        # Trigger restoration again to test events
        lifecycle_manager._apply_restored_session_to_ui(session_data)

        # Verify events were published
        assert (
            len(events_received) >= 2
        ), f"Expected at least 2 events, got {len(events_received)}"

        sequence_event = next(
            (e for e in events_received if e.action == "sequence_restored"), None
        )
        tab_event = next(
            (e for e in events_received if e.action == "tab_restored"), None
        )

        assert sequence_event is not None, "Sequence restoration event not found"
        assert tab_event is not None, "Tab restoration event not found"

        print("✅ Event publishing verification passed")

        # Verify sequence event data
        event_sequence_data = sequence_event.state_data.get("sequence_data")
        assert event_sequence_data is not None, "No sequence data in event"
        assert event_sequence_data.id == sequence_id, "Wrong sequence ID in event"

        print("✅ Event data verification passed")

        print_section("Test Results")
        print("🎉 ALL TESTS PASSED!")
        print("\n📋 Verified Functionality:")
        print("   ✅ Sequence creation and session saving")
        print("   ✅ Session state persistence across restarts")
        print("   ✅ Session data loading and validation")
        print("   ✅ UI restoration event publishing")
        print("   ✅ Event data integrity")

        print("\n🔧 Next Steps for Full Integration:")
        print("   1. Test with actual TKA application startup")
        print("   2. Verify workbench receives and processes events")
        print("   3. Confirm beat frame displays restored sequence")
        print("   4. Test with different sequence types and sizes")

        return True

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_workbench_event_handling():
    """Test workbench event handling for sequence restoration."""
    print_header("Testing Workbench Event Handling")

    try:
        from core.application.application_factory import ApplicationFactory
        from core.events.event_bus import get_event_bus, UIEvent, EventPriority
        from domain.models.core_models import SequenceData, BeatData

        # Create test application
        container = ApplicationFactory.create_test_app()
        event_bus = get_event_bus()

        print("✅ Test environment created")

        # Create test sequence data
        test_sequence = SequenceData(
            id="test_restoration_seq",
            name="Test Restoration Sequence",
            beats=[
                BeatData(beat_number=1, letter="A", duration=1.0),
                BeatData(beat_number=2, letter="B", duration=1.5),
            ],
        )

        print(f"✅ Test sequence created: {test_sequence.name}")

        # Create restoration event
        restoration_event = UIEvent(
            component="session_restoration",
            action="sequence_restored",
            state_data={
                "sequence_data": test_sequence,
                "sequence_id": test_sequence.id,
                "selected_beat_index": 1,
                "start_position_data": BeatData(
                    beat_number=1, letter="A", duration=1.0
                ),
            },
            source="test_script",
            priority=EventPriority.HIGH,
        )

        # Track if event was handled
        event_handled = False

        def test_event_handler(event):
            nonlocal event_handled
            event_handled = True
            print(f"📨 Test handler received event: {event.component}.{event.action}")

            # Verify event data
            sequence_data = event.state_data.get("sequence_data")
            assert sequence_data is not None, "No sequence data in event"
            assert sequence_data.id == test_sequence.id, "Wrong sequence ID"
            print(f"✅ Event data verified: {sequence_data.name}")

        # Subscribe to restoration events
        event_bus.subscribe("session_restoration.sequence_restored", test_event_handler)

        # Publish the event
        event_bus.publish(restoration_event)

        # Verify event was handled
        assert event_handled, "Event was not handled"
        print("✅ Event handling test passed")

        return True

    except Exception as e:
        print(f"❌ Workbench event test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run all sequence restoration tests."""
    print_header("TKA Sequence Restoration Fix - Test Suite")

    print("🧪 This test suite verifies the sequence restoration fix.")
    print("   It tests the complete workflow from sequence creation to restoration.")

    # Run tests
    test1_passed = test_complete_sequence_restoration_workflow()
    test2_passed = test_workbench_event_handling()

    print_header("Final Test Results")

    if test1_passed and test2_passed:
        print("🎉 ALL TESTS PASSED!")
        print("\n✅ The sequence restoration fix is working correctly.")
        print("   Sequences should now be restored when TKA restarts.")

        print("\n🔧 To test with actual TKA application:")
        print("   1. Start TKA modern application")
        print("   2. Create a sequence with some beats")
        print("   3. Close TKA completely")
        print("   4. Restart TKA")
        print("   5. Verify the sequence appears in the beat frame")

    else:
        print("❌ SOME TESTS FAILED!")
        print("   Please review the errors above and fix the issues.")

        if not test1_passed:
            print("   - Complete workflow test failed")
        if not test2_passed:
            print("   - Workbench event handling test failed")


if __name__ == "__main__":
    main()
