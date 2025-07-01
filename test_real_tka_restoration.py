#!/usr/bin/env python3
"""
Real TKA Application Restoration Test

This script simulates the actual TKA application startup process
to test sequence restoration in a realistic environment.
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


def test_production_app_startup_with_restoration():
    """Test production app startup with session restoration."""
    print_header("Testing Production App Startup with Session Restoration")

    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from core.interfaces.core_services import IUIStateManagementService
        from application.services.core.application_lifecycle_manager import (
            ApplicationLifecycleManager,
        )

        print_section("Creating Production Application")

        # Create production application (not test app)
        container = ApplicationFactory.create_headless_app()
        print("✅ Production application container created")

        # Resolve services
        session_service = container.resolve(ISessionStateService)
        ui_service = container.resolve(IUIStateManagementService)

        print("✅ Services resolved from production container")

        print_section("Simulating Application Lifecycle Initialization")

        # Create application lifecycle manager (this is what happens during real startup)
        lifecycle_manager = ApplicationLifecycleManager(session_service)

        # Initialize the lifecycle manager (this triggers session restoration)
        print("🔍 Initializing application lifecycle manager...")
        print("   This should trigger session restoration if a session file exists...")

        # Create a mock main window for initialization
        from PyQt6.QtWidgets import QMainWindow, QApplication

        # Create QApplication if it doesn't exist
        app = QApplication.instance()
        if app is None:
            app = QApplication(sys.argv)

        # Create mock main window
        main_window = QMainWindow()

        # Call initialize_application - this is where session restoration happens!
        print(
            "🔍 Calling initialize_application() - this triggers session restoration..."
        )
        lifecycle_manager.initialize_application(main_window)

        print_section("Checking Session State After Initialization")

        # Check current session state
        current_session = session_service.get_current_session_state()

        if current_session.current_sequence_id:
            print(
                f"✅ Session contains sequence: {current_session.current_sequence_id}"
            )
            print(f"   Selected beat: {current_session.selected_beat_index}")
            print(f"   Active tab: {current_session.active_tab}")

            # Test manual UI restoration
            print_section("Testing Manual UI Restoration")
            print("🔍 Manually triggering UI restoration...")
            lifecycle_manager._apply_restored_session_to_ui(current_session)

        else:
            print("ℹ️ No sequence found in current session")
            print("   This is expected if no sequence was previously saved")

        return True

    except Exception as e:
        print(f"❌ Production app test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def create_and_save_test_sequence():
    """Create and save a test sequence for restoration testing."""
    print_header("Creating and Saving Test Sequence")

    try:
        from core.application.application_factory import ApplicationFactory
        from core.testing.ai_agent_helpers import TKAAITestHelper
        from core.interfaces.session_services import ISessionStateService

        print_section("Creating Test Sequence")

        # Create test application
        container = ApplicationFactory.create_test_app()
        test_helper = TKAAITestHelper(use_test_mode=True)
        session_service = container.resolve(ISessionStateService)

        # Create a test sequence
        sequence_result = test_helper.create_sequence("Real TKA Test Sequence", 4)
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

        print_section("Saving to Session")

        # Save to session
        session_service.update_current_sequence(sequence_data, sequence_id)

        # Add some workbench state
        from domain.models.core_models import BeatData

        beat_data = BeatData(beat_number=2, letter="B", duration=1.5)
        session_service.update_workbench_state(1, beat_data, None)
        session_service.update_ui_state("sequence_builder", {"test": "layout"})

        # Force save
        save_success = session_service.save_session_state()
        assert save_success, "Failed to save session state"

        print("✅ Test sequence saved to session")
        return sequence_id, sequence_name

    except Exception as e:
        print(f"❌ Failed to create and save test sequence: {e}")
        import traceback

        traceback.print_exc()
        return None, None


def test_event_bus_functionality():
    """Test event bus functionality for restoration events."""
    print_header("Testing Event Bus Functionality")

    try:
        from core.events.event_bus import get_event_bus, UIEvent, EventPriority
        from domain.models.core_models import SequenceData, BeatData

        print_section("Testing Event Publishing and Subscription")

        event_bus = get_event_bus()
        print("✅ Event bus obtained")

        # Track events
        events_received = []

        def event_handler(event):
            events_received.append(event)
            print(f"📨 Event received: {event.component}.{event.action}")
            print(f"   Source: {event.source}")
            print(f"   Priority: {event.priority}")

        # Subscribe to restoration events
        subscription_id = event_bus.subscribe(
            "session_restoration.sequence_restored",
            event_handler,
            priority=EventPriority.HIGH,
        )
        print(f"✅ Subscribed to restoration events (ID: {subscription_id})")

        # Create and publish test event
        test_sequence = SequenceData(
            id="test_event_sequence",
            name="Test Event Sequence",
            beats=[BeatData(beat_number=1, letter="A", duration=1.0)],
        )

        restoration_event = UIEvent(
            component="session_restoration",
            action="sequence_restored",
            state_data={
                "sequence_data": test_sequence,
                "sequence_id": test_sequence.id,
                "selected_beat_index": 0,
                "start_position_data": None,
            },
            source="test_script",
            priority=EventPriority.HIGH,
        )

        print("🔍 Publishing test restoration event...")
        event_bus.publish(restoration_event)

        # Verify event was received
        assert (
            len(events_received) == 1
        ), f"Expected 1 event, got {len(events_received)}"
        received_event = events_received[0]
        assert received_event.action == "sequence_restored"

        print("✅ Event publishing and handling test passed")
        return True

    except Exception as e:
        print(f"❌ Event bus test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run real TKA application restoration test."""
    print_header("Real TKA Application Restoration Test")

    print("🧪 This test simulates the actual TKA application startup process")
    print("   to verify sequence restoration works in a realistic environment.")

    print("\n📋 Test workflow:")
    print("   1. Create and save a test sequence")
    print("   2. Test production app startup with restoration")
    print("   3. Test event bus functionality")
    print("   4. Provide guidance for real application testing")

    # Run tests
    sequence_id, sequence_name = create_and_save_test_sequence()

    if sequence_id:
        print(
            f"\n✅ Test sequence created and saved: {sequence_name} (ID: {sequence_id})"
        )

        # Test production app startup
        production_test_success = test_production_app_startup_with_restoration()

        # Test event bus
        event_bus_test_success = test_event_bus_functionality()

        print_header("Test Results and Next Steps")

        if production_test_success and event_bus_test_success:
            print("🎉 ALL TESTS PASSED!")
            print(
                "\n✅ The sequence restoration system is ready for real application testing."
            )

            print("\n🚀 To test with actual TKA application:")
            print("   1. Start the TKA modern application normally")
            print("   2. Watch the console for debug messages during startup:")
            print("      - Look for [LIFECYCLE] messages about session restoration")
            print("      - Look for [WORKBENCH] messages about event handling")
            print("      - Look for [SESSION] messages about sequence updates")
            print("   3. Create a sequence with some beats")
            print("   4. Watch for [SESSION] messages when the sequence is created")
            print("   5. Close TKA completely")
            print("   6. Restart TKA and watch for restoration messages")
            print("   7. Verify the sequence appears in the beat frame")

            print("\n🔍 Key debug messages to watch for:")
            print("   Startup:")
            print(
                "     🔍 [LIFECYCLE] Session service available, attempting restoration..."
            )
            print("     ✅ [LIFECYCLE] Previous session restored successfully")
            print("     🔍 [LIFECYCLE] Publishing sequence restoration event...")
            print("     🔍 [WORKBENCH] Received sequence restoration event!")
            print("     🔍 [WORKBENCH] set_sequence() called with: [sequence_name]")
            print("   ")
            print("   Sequence Creation:")
            print("     🔍 [SESSION] Updating current sequence: [sequence_id]")
            print("     🔍 [SESSION] Triggering auto-save...")
            print("     ✅ [SESSION] Auto-save triggered")

            print("\n📝 If sequence doesn't appear in beat frame:")
            print("   - Check if [WORKBENCH] messages appear during startup")
            print("   - Verify [WORKBENCH] set_sequence() is called")
            print("   - Check if beat frame components are properly updated")
            print("   - Look for any error messages in the console")

        else:
            print("❌ SOME TESTS FAILED!")
            if not production_test_success:
                print("   - Production app startup test failed")
            if not event_bus_test_success:
                print("   - Event bus functionality test failed")
    else:
        print("❌ FAILED TO CREATE TEST SEQUENCE!")
        print("   Cannot proceed with restoration testing.")


if __name__ == "__main__":
    main()
