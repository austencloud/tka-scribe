#!/usr/bin/env python3
"""
TKA Auto-Save/Restore System Diagnosis

Comprehensive diagnostic tool to identify and fix the auto-save/restore system issues.
This script will:
1. Clean fabricated test data from session_state.json
2. Test the complete restoration pipeline
3. Identify where UI restoration fails
4. Validate service integration and event flow
"""

import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional

# Add TKA to path
tka_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_path))
print(f"🔍 Added to Python path: {tka_path}")

# Change to TKA directory for proper module resolution
os.chdir(tka_path)
print(f"🔍 Changed working directory to: {os.getcwd()}")


def print_section(title: str) -> None:
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def print_subsection(title: str) -> None:
    """Print a formatted subsection header."""
    print(f"\n--- {title} ---")


def clean_fabricated_session_data() -> bool:
    """Remove fabricated test data from session_state.json."""
    print_section("Cleaning Fabricated Session Data")

    session_file = Path("src/desktop/modern/session_state.json")

    if not session_file.exists():
        print("✅ No session_state.json file found - starting clean")
        return True

    try:
        with open(session_file, "r") as f:
            session_data = json.load(f)

        # Check if this contains fabricated test data
        current_sequence = session_data.get("current_sequence", {})
        sequence_id = current_sequence.get("sequence_id")
        sequence_data = current_sequence.get("sequence_data", {})
        sequence_name = sequence_data.get("name", "")

        print(f"🔍 Current session contains:")
        print(f"   Sequence ID: {sequence_id}")
        print(f"   Sequence Name: {sequence_name}")

        # Check for fabricated test data patterns
        is_fabricated = (
            sequence_id == "multi_beat_test"
            or "test" in sequence_name.lower()
            or "Multi-Beat Motion Test" in sequence_name
        )

        if is_fabricated:
            print("🧹 Detected fabricated test data - removing...")

            # Create backup
            backup_file = session_file.with_suffix(".json.backup")
            with open(backup_file, "w") as f:
                json.dump(session_data, f, indent=2)
            print(f"📁 Backup created: {backup_file}")

            # Remove the session file to start fresh
            session_file.unlink()
            print("✅ Fabricated session data removed")
            return True
        else:
            print("✅ Session data appears to be legitimate user data")
            return True

    except Exception as e:
        print(f"⚠️ Failed to clean session data: {e}")
        return False


def test_session_service_integration() -> Dict[str, Any]:
    """Test SessionStateService integration and functionality."""
    print_section("Testing SessionStateService Integration")

    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from core.testing.ai_agent_helpers import TKAAITestHelper

        print_subsection("Creating Test Application")
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        helper = TKAAITestHelper(use_test_mode=True)

        print("✅ Services resolved successfully")

        print_subsection("Testing Session State Loading")
        load_result = session_service.load_session_state()
        print(f"🔍 Load result: success={load_result.success}")
        print(f"🔍 Session restored: {load_result.session_restored}")

        if load_result.session_restored:
            session_data = load_result.session_data
            print(f"🔍 Session ID: {session_data.session_id}")
            print(f"🔍 Current sequence ID: {session_data.current_sequence_id}")
            print(f"🔍 Selected beat index: {session_data.selected_beat_index}")
            print(f"🔍 Active tab: {session_data.active_tab}")

            if session_data.current_sequence_data:
                seq_data = session_data.current_sequence_data
                if isinstance(seq_data, dict):
                    print(f"🔍 Sequence name: {seq_data.get('name', 'Unknown')}")
                    beats = seq_data.get("beats", [])
                    print(f"🔍 Beat count: {len(beats)}")
                else:
                    print(f"🔍 Sequence name: {seq_data.name}")
                    print(f"🔍 Beat count: {len(seq_data.beats)}")

        print_subsection("Creating Real User Sequence")
        # Create a realistic user sequence using domain models directly
        from domain.models.core_models import SequenceData, BeatData
        import uuid

        # Create a simple but realistic sequence
        sequence_id = str(uuid.uuid4())
        beat1 = BeatData(beat_number=1, letter="A", duration=1.0)
        beat2 = BeatData(beat_number=2, letter="B", duration=1.5)

        sequence_data = SequenceData(
            id=sequence_id, name="My Real Sequence", beats=[beat1, beat2]
        )

        print(f"✅ Created sequence: {sequence_data.name} (ID: {sequence_id})")

        print_subsection("Testing Auto-Save Functionality")
        # Update session with real sequence
        session_service.update_current_sequence(sequence_data, sequence_id)

        # Test auto-save trigger
        session_service.mark_interaction()

        # Force save to test persistence
        save_success = session_service.save_session_state()
        print(f"🔍 Save result: {save_success}")

        return {
            "success": True,
            "session_service_available": True,
            "can_load_session": load_result.success,
            "can_save_session": save_success,
            "sequence_created": True,
            "sequence_id": sequence_id,
            "sequence_name": sequence_data.name,
        }

    except Exception as e:
        print(f"❌ Session service test failed: {e}")
        import traceback

        traceback.print_exc()
        return {"success": False, "error": str(e)}


def test_ui_restoration_pipeline() -> Dict[str, Any]:
    """Test the UI restoration pipeline and event flow."""
    print_section("Testing UI Restoration Pipeline")

    try:
        from core.application.application_factory import ApplicationFactory
        from core.interfaces.session_services import ISessionStateService
        from core.interfaces.core_services import IUIStateManagementService
        from application.services.core.application_lifecycle_manager import (
            ApplicationLifecycleManager,
        )
        from core.events.event_bus import get_event_bus

        print_subsection("Setting Up Services")
        container = ApplicationFactory.create_test_app()
        session_service = container.resolve(ISessionStateService)
        ui_service = container.resolve(IUIStateManagementService)

        # Create lifecycle manager with session service
        lifecycle_manager = ApplicationLifecycleManager(session_service)

        print("✅ Services and lifecycle manager created")

        print_subsection("Testing Event Bus Integration")
        event_bus = get_event_bus()
        events_received = []

        def event_handler(event):
            events_received.append(
                {
                    "component": event.component,
                    "action": event.action,
                    "source": event.source,
                }
            )
            print(
                f"📨 Event received: {event.component}.{event.action} from {event.source}"
            )

        # Subscribe to restoration events
        event_bus.subscribe("session_restoration", event_handler)

        print_subsection("Testing Session Restoration")
        # Load session state
        load_result = session_service.load_session_state()

        if load_result.session_restored:
            print("🔍 Session data available - testing UI restoration...")

            # Simulate the restoration process
            lifecycle_manager._pending_session_data = load_result.session_data
            lifecycle_manager.trigger_deferred_session_restoration()

            print(f"📊 Events received during restoration: {len(events_received)}")
            for event in events_received:
                print(
                    f"   - {event['component']}.{event['action']} from {event['source']}"
                )
        else:
            print("ℹ️ No session data to restore")

        print_subsection("Testing Workbench Integration")
        # Test that a workbench component would receive the events
        from presentation.components.workbench.workbench import SequenceWorkbench
        from core.interfaces.core_services import ILayoutService
        from core.interfaces.workbench_services import (
            ISequenceWorkbenchService,
            IFullScreenService,
            IBeatDeletionService,
            IDictionaryService,
            IGraphEditorService,
        )

        # Create mock services for workbench
        from unittest.mock import Mock

        layout_service = Mock(spec=ILayoutService)
        workbench_service = Mock(spec=ISequenceWorkbenchService)
        fullscreen_service = Mock(spec=IFullScreenService)
        deletion_service = Mock(spec=IBeatDeletionService)
        graph_service = Mock(spec=IGraphEditorService)
        dictionary_service = Mock(spec=IDictionaryService)

        # Create workbench instance
        workbench = SequenceWorkbench(
            layout_service=layout_service,
            workbench_service=workbench_service,
            fullscreen_service=fullscreen_service,
            deletion_service=deletion_service,
            graph_service=graph_service,
            dictionary_service=dictionary_service,
        )

        print("✅ Workbench created with session restoration capability")

        # Test that workbench can receive restoration events
        workbench_events_received = []

        def workbench_event_handler(event):
            workbench_events_received.append(event)
            print(f"📨 Workbench received: {event.component}.{event.action}")

        # The workbench should already be subscribed, but let's test manually too
        if workbench.event_bus:
            workbench.event_bus.subscribe(
                "session_restoration.sequence_restored", workbench_event_handler
            )

        # Trigger restoration again to test workbench integration
        if load_result.session_restored:
            lifecycle_manager.trigger_deferred_session_restoration()
            print(f"📊 Workbench events received: {len(workbench_events_received)}")

        # Clean up workbench
        workbench.cleanup()

        return {
            "success": True,
            "event_bus_available": True,
            "events_received": len(events_received),
            "session_data_available": load_result.session_restored,
            "restoration_events": events_received,
        }

    except Exception as e:
        print(f"❌ UI restoration test failed: {e}")
        import traceback

        traceback.print_exc()
        return {"success": False, "error": str(e)}


def main():
    """Run comprehensive auto-save/restore diagnosis."""
    print_section("TKA Auto-Save/Restore System Diagnosis")

    results = {}

    # Step 1: Clean fabricated data
    results["clean_data"] = clean_fabricated_session_data()

    # Step 2: Test session service
    results["session_service"] = test_session_service_integration()

    # Step 3: Test UI restoration
    results["ui_restoration"] = test_ui_restoration_pipeline()

    # Summary
    print_section("Diagnosis Summary")

    all_success = all(
        result.get("success", False) if isinstance(result, dict) else result
        for result in results.values()
    )

    if all_success:
        print("✅ All diagnostic tests passed")
    else:
        print("❌ Some diagnostic tests failed")

    print("\n📊 Detailed Results:")
    for test_name, result in results.items():
        if isinstance(result, dict):
            status = "✅" if result.get("success", False) else "❌"
            print(f"   {status} {test_name}: {result}")
        else:
            status = "✅" if result else "❌"
            print(f"   {status} {test_name}: {result}")

    return results


if __name__ == "__main__":
    main()
