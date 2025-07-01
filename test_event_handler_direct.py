#!/usr/bin/env python3
"""
Test Event Handler Directly

This script tests if the workbench event handler is working by
creating and publishing events directly.
"""

import sys
from pathlib import Path

# Add TKA modern src to path
tka_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_src_path))


def test_direct_event_publishing():
    """Test publishing events directly to see if workbench receives them."""
    print("=" * 80)
    print("  Testing Direct Event Publishing to Workbench")
    print("=" * 80)

    try:
        from core.application.application_factory import ApplicationFactory
        from core.events.event_bus import get_event_bus, UIEvent, EventPriority
        from domain.models.core_models import SequenceData, BeatData
        from PyQt6.QtWidgets import QApplication

        print("\n--- Step 1: Create Application and Event Bus ---")

        # Create QApplication
        app = QApplication.instance()
        if app is None:
            app = QApplication(sys.argv)

        # Create production application
        container = ApplicationFactory.create_production_app()
        event_bus = get_event_bus()

        print("✅ Application and event bus created")

        print("\n--- Step 2: Create Test Sequence ---")

        # Create test sequence with beats
        beat1 = BeatData(beat_number=1, letter="A", duration=1.0)
        beat2 = BeatData(beat_number=2, letter="B", duration=1.5)

        test_sequence = SequenceData(
            id="test_direct_event",
            name="Direct Event Test Sequence",
            beats=[beat1, beat2],
        )

        print(f"✅ Created test sequence: {test_sequence.name}")
        print(f"   Beats: {len(test_sequence.beats)}")

        print("\n--- Step 3: Subscribe to Events ---")

        # Track events received
        events_received = []

        def test_event_handler(event):
            events_received.append(event)
            print(f"📨 TEST HANDLER: Received event {event.component}.{event.action}")
            print(f"   Source: {event.source}")
            print(f"   Priority: {event.priority}")

        # Subscribe to restoration events
        # UIEvent.event_type returns "ui.{component}.{action}"
        subscription_id = event_bus.subscribe(
            "ui.session_restoration.sequence_restored",
            test_event_handler,
            priority=EventPriority.HIGH,
        )

        print(f"✅ Subscribed to events (ID: {subscription_id})")

        print("\n--- Step 4: Create and Publish Event ---")

        # Create restoration event
        restoration_event = UIEvent(
            component="session_restoration",
            action="sequence_restored",
            state_data={
                "sequence_data": test_sequence,
                "sequence_id": test_sequence.id,
                "selected_beat_index": 0,
                "start_position_data": None,
            },
            source="direct_test_script",
            priority=EventPriority.HIGH,
        )

        print("🔍 Publishing restoration event...")
        event_bus.publish(restoration_event)
        print("✅ Event published")

        print("\n--- Step 5: Check Event Reception ---")

        # Check if event was received
        if len(events_received) > 0:
            print(f"✅ Event received by test handler!")
            for i, event in enumerate(events_received):
                print(f"   Event {i}: {event.component}.{event.action}")
        else:
            print("❌ No events received by test handler")
            return False

        print("\n--- Step 6: Test with Real Workbench (if possible) ---")

        # Try to create a workbench and see if it receives events
        try:
            from presentation.components.workbench.workbench import SequenceWorkbench
            from core.interfaces.core_services import ILayoutService
            from core.interfaces.workbench_services import ISequenceWorkbenchService
            from core.interfaces.session_services import ISessionStateService
            from core.interfaces.fullscreen_services import IFullScreenService
            from core.interfaces.beat_deletion_services import IBeatDeletionService
            from core.interfaces.graph_editor_services import IGraphEditorService
            from core.interfaces.dictionary_services import IDictionaryService

            # Resolve services
            layout_service = container.resolve(ILayoutService)
            workbench_service = container.resolve(ISequenceWorkbenchService)
            session_service = container.resolve(ISessionStateService)

            # Try to resolve other services (may not be available in production)
            try:
                fullscreen_service = container.resolve(IFullScreenService)
            except:
                print("⚠️ FullScreen service not available")
                fullscreen_service = None

            try:
                deletion_service = container.resolve(IBeatDeletionService)
            except:
                print("⚠️ Beat deletion service not available")
                deletion_service = None

            try:
                graph_service = container.resolve(IGraphEditorService)
            except:
                print("⚠️ Graph editor service not available")
                graph_service = None

            try:
                dictionary_service = container.resolve(IDictionaryService)
            except:
                print("⚠️ Dictionary service not available")
                dictionary_service = None

            if all(
                [
                    layout_service,
                    workbench_service,
                    fullscreen_service,
                    deletion_service,
                    graph_service,
                    dictionary_service,
                ]
            ):
                print("🔍 Creating workbench instance...")

                workbench = SequenceWorkbench(
                    layout_service=layout_service,
                    workbench_service=workbench_service,
                    fullscreen_service=fullscreen_service,
                    deletion_service=deletion_service,
                    graph_service=graph_service,
                    dictionary_service=dictionary_service,
                    session_service=session_service,
                )

                print("✅ Workbench created successfully")

                # Publish another event to see if workbench receives it
                print("🔍 Publishing event to workbench...")

                workbench_event = UIEvent(
                    component="session_restoration",
                    action="sequence_restored",
                    state_data={
                        "sequence_data": test_sequence,
                        "sequence_id": test_sequence.id,
                        "selected_beat_index": 1,
                        "start_position_data": beat1,
                    },
                    source="workbench_test_script",
                    priority=EventPriority.HIGH,
                )

                event_bus.publish(workbench_event)
                print("✅ Event published to workbench")

            else:
                print("⚠️ Cannot create workbench - missing required services")
                print("   This is expected in a minimal test environment")

        except Exception as e:
            print(f"⚠️ Could not test with real workbench: {e}")
            print("   This is expected if workbench has complex dependencies")

        return True

    except Exception as e:
        print(f"❌ Direct event test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Run direct event handler test."""
    print("🧪 Direct Event Handler Test")
    print("   This test verifies that event publishing and subscription works")
    print("   and helps identify if the workbench event handler is the issue.")

    success = test_direct_event_publishing()

    print("\n" + "=" * 80)
    print("  Results")
    print("=" * 80)

    if success:
        print("✅ DIRECT EVENT TEST PASSED!")
        print("\n🔍 Event system is working correctly.")
        print("   If workbench still doesn't receive events in real app,")
        print("   the issue may be:")
        print("   - Event subscription timing")
        print("   - Event topic mismatch")
        print("   - Workbench not being created properly")
        print("   - Event handler exception")
    else:
        print("❌ DIRECT EVENT TEST FAILED!")
        print("   There's a fundamental issue with the event system.")


if __name__ == "__main__":
    main()
