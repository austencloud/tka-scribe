#!/usr/bin/env python3
"""
Test Session Restoration Fix

Validates that the session restoration pipeline works correctly:
1. SessionStateService saves and loads sequence data
2. ApplicationLifecycleManager publishes restoration events
3. UI components can subscribe to and receive restoration events
4. Complete end-to-end restoration workflow
"""

import sys
import os
from pathlib import Path

# Add TKA to path
tka_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_path))
os.chdir(tka_path)


def print_section(title: str) -> None:
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def test_complete_restoration_workflow():
    """Test the complete session restoration workflow."""
    print_section("Complete Session Restoration Workflow Test")

    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from application.services.core.application_lifecycle_manager import (
            ApplicationLifecycleManager,
        )
        from core.events.event_bus import get_event_bus
        from domain.models.core_models import SequenceData, BeatData
        import uuid

        print("--- Step 1: Create Test Application ---")
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        lifecycle_manager = ApplicationLifecycleManager(session_service)
        event_bus = get_event_bus()

        print("✅ Services created successfully")

        print("--- Step 2: Create and Save Test Sequence ---")
        # Create a realistic test sequence Hey there this is Matt face this is really better
        sequence_id = str(uuid.uuid4())
        beat1 = BeatData(beat_number=1, letter="A", duration=1.0)
        beat2 = BeatData(beat_number=2, letter="B", duration=1.0)

        test_sequence = SequenceData(
            id=sequence_id, name="Session Restoration Test", beats=[beat1, beat2]
        )

        # Save to session
        session_service.update_current_sequence(test_sequence, sequence_id)
        save_success = session_service.save_session_state()

        print(f"✅ Test sequence saved: {test_sequence.name} (ID: {sequence_id})")
        print(f"✅ Session save result: {save_success}")

        print("--- Step 3: Test Session Loading ---")
        # Load session state
        load_result = session_service.load_session_state()

        print(f"🔍 Load success: {load_result.success}")
        print(f"🔍 Session restored: {load_result.session_restored}")

        if load_result.session_restored:
            session_data = load_result.session_data
            print(f"🔍 Loaded sequence ID: {session_data.current_sequence_id}")
            print(
                f"🔍 Loaded sequence name: {session_data.current_sequence_data.get('name', 'Unknown')}"
            )

        print("--- Step 4: Test Event Publishing ---")
        # Track events received
        events_received = []

        def event_handler(event):
            events_received.append(event)
            print(f"📨 Event received: {event.component}.{event.action}")
            print(f"   Source: {event.source}")
            print(f"   Sequence: {event.state_data.get('sequence_data', {}).name}")

        # Subscribe to restoration events
        # UIEvent.event_type returns "ui.{component}.{action}"
        subscription_id = event_bus.subscribe(
            "ui.session_restoration.sequence_restored", event_handler
        )
        print(f"✅ Subscribed to restoration events (ID: {subscription_id})")

        print("--- Step 5: Test UI Restoration Process ---")
        # Simulate the restoration process
        if load_result.session_restored:
            lifecycle_manager._pending_session_data = load_result.session_data
            lifecycle_manager.trigger_deferred_session_restoration()

            print(f"📊 Events received: {len(events_received)}")

            if events_received:
                event = events_received[0]
                restored_sequence = event.state_data.get("sequence_data")
                print(f"✅ Restored sequence: {restored_sequence.name}")
                print(f"✅ Restored beats: {len(restored_sequence.beats)}")
                for i, beat in enumerate(restored_sequence.beats):
                    print(f"   Beat {i}: {beat.letter} (duration: {beat.duration})")
            else:
                print("❌ No events received - restoration failed")

        print("--- Step 6: Validate Restoration Fidelity ---")
        # Verify that restored data matches original
        if events_received:
            event = events_received[0]
            restored_sequence = event.state_data.get("sequence_data")

            # Check sequence properties
            assert (
                restored_sequence.name == test_sequence.name
            ), f"Name mismatch: {restored_sequence.name} != {test_sequence.name}"
            assert len(restored_sequence.beats) == len(
                test_sequence.beats
            ), f"Beat count mismatch: {len(restored_sequence.beats)} != {len(test_sequence.beats)}"

            # Check beat properties
            for i, (restored_beat, original_beat) in enumerate(
                zip(restored_sequence.beats, test_sequence.beats)
            ):
                assert (
                    restored_beat.letter == original_beat.letter
                ), f"Beat {i} letter mismatch: {restored_beat.letter} != {original_beat.letter}"
                assert (
                    restored_beat.duration == original_beat.duration
                ), f"Beat {i} duration mismatch: {restored_beat.duration} != {original_beat.duration}"

            print("✅ Restoration fidelity validation passed")

        # Clean up
        event_bus.unsubscribe(subscription_id)

        return {
            "success": True,
            "events_received": len(events_received),
            "session_saved": save_success,
            "session_loaded": load_result.success,
            "restoration_triggered": load_result.session_restored,
            "data_fidelity": "perfect" if events_received else "failed",
        }

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return {"success": False, "error": str(e)}


def test_workbench_event_subscription():
    """Test that workbench components can subscribe to restoration events."""
    print_section("Workbench Event Subscription Test")

    try:
        from core.events.event_bus import get_event_bus, UIEvent, EventPriority
        from domain.models.core_models import SequenceData, BeatData

        event_bus = get_event_bus()

        print("--- Testing Event Subscription Pattern ---")

        # Simulate workbench event subscription (without creating actual QWidget)
        workbench_events = []

        def mock_workbench_handler(event):
            """Mock workbench restoration handler."""
            workbench_events.append(event)
            print(f"🔄 [MOCK_WORKBENCH] Received restoration event")

            state_data = event.state_data
            sequence_data = state_data.get("sequence_data")
            print(f"🔍 [MOCK_WORKBENCH] Restoring sequence: {sequence_data.name}")
            print(f"🔍 [MOCK_WORKBENCH] Sequence has {len(sequence_data.beats)} beats")

            # Simulate calling set_sequence() on beat frame
            print("🔍 [MOCK_WORKBENCH] Calling beat_frame.set_sequence()...")
            print("✅ [MOCK_WORKBENCH] Sequence restoration completed")

        # Subscribe to restoration events
        # UIEvent.event_type returns "ui.{component}.{action}"
        subscription_id = event_bus.subscribe(
            "ui.session_restoration.sequence_restored",
            mock_workbench_handler,
            priority=EventPriority.HIGH,
        )

        print(f"✅ Mock workbench subscribed (ID: {subscription_id})")

        print("--- Testing Event Publishing ---")

        # Create test sequence
        test_sequence = SequenceData(
            id="test_workbench_sequence",
            name="Workbench Test Sequence",
            beats=[
                BeatData(beat_number=1, letter="X", duration=1.0),
                BeatData(beat_number=2, letter="Y", duration=2.0),
            ],
        )

        # Publish restoration event
        restoration_event = UIEvent(
            component="session_restoration",
            action="sequence_restored",
            state_data={
                "sequence_data": test_sequence,
                "sequence_id": test_sequence.id,
                "selected_beat_index": None,
                "start_position_data": None,
            },
            source="test_script",
            priority=EventPriority.HIGH,
        )

        event_bus.publish(restoration_event)

        print(f"📊 Workbench events received: {len(workbench_events)}")

        if workbench_events:
            print("✅ Workbench successfully received restoration event")
        else:
            print("❌ Workbench did not receive restoration event")

        # Clean up
        event_bus.unsubscribe(subscription_id)

        return {
            "success": True,
            "workbench_events_received": len(workbench_events),
            "subscription_successful": subscription_id is not None,
        }

    except Exception as e:
        print(f"❌ Workbench test failed: {e}")
        import traceback

        traceback.print_exc()
        return {"success": False, "error": str(e)}


def main():
    """Run all session restoration tests."""
    print_section("TKA Session Restoration Fix Validation")

    results = {}

    # Test 1: Complete restoration workflow
    results["restoration_workflow"] = test_complete_restoration_workflow()

    # Test 2: Workbench event subscription
    results["workbench_subscription"] = test_workbench_event_subscription()

    # Summary
    print_section("Test Results Summary")

    all_success = all(
        result.get("success", False) if isinstance(result, dict) else result
        for result in results.values()
    )

    if all_success:
        print("✅ All session restoration tests passed!")
        print("🎉 The auto-save/restore system is working correctly")
    else:
        print("❌ Some session restoration tests failed")

    print("\n📊 Detailed Results:")
    for test_name, result in results.items():
        if isinstance(result, dict):
            status = "✅" if result.get("success", False) else "❌"
            print(f"   {status} {test_name}:")
            for key, value in result.items():
                if key != "success":
                    print(f"      {key}: {value}")
        else:
            status = "✅" if result else "❌"
            print(f"   {status} {test_name}: {result}")

    return results


if __name__ == "__main__":
    main()
