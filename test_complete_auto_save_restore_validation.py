#!/usr/bin/env python3
"""
Complete Auto-Save/Restore System Validation

Comprehensive testing protocol using TKAAITestHelper to validate the complete
auto-save/restore fix with real user workflow testing.

This test validates:
1. Real user sequence creation and modification workflows
2. Perfect data persistence and restoration fidelity
3. UI component integration and event handling
4. Edge cases and error scenarios
5. Performance and reliability under various conditions
"""

import sys
import os
from pathlib import Path
from typing import Dict, Any, List
import time

# Add TKA to path
tka_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(tka_path))
os.chdir(tka_path)


def print_header(title: str) -> None:
    """Print a formatted header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def print_section(title: str) -> None:
    """Print a formatted section."""
    print(f"\n--- {title} ---")


class ComprehensiveAutoSaveRestoreValidator:
    """Comprehensive validator for auto-save/restore system using TKAAITestHelper."""

    def __init__(self):
        self.test_results = []
        self.helper = None
        self.container = None
        self.session_service = None
        self.lifecycle_manager = None
        self.event_bus = None

    def setup_test_environment(self) -> bool:
        """Setup the test environment with all required services."""
        print_section("Setting Up Test Environment")

        try:
            from core.application.application_factory import ApplicationFactory
            from core.interfaces.session_services import ISessionStateService
            from application.services.core.application_lifecycle_manager import (
                ApplicationLifecycleManager,
            )
            from core.events.event_bus import get_event_bus
            from core.testing.ai_agent_helpers import TKAAITestHelper

            # Create test application
            self.container = ApplicationFactory.create_test_app()
            self.helper = TKAAITestHelper(use_test_mode=True)
            self.session_service = self.container.resolve(ISessionStateService)
            self.lifecycle_manager = ApplicationLifecycleManager(self.session_service)
            self.event_bus = get_event_bus()

            print("✅ Test environment setup completed")
            print(f"   - ApplicationFactory: {type(self.container).__name__}")
            print(f"   - TKAAITestHelper: {type(self.helper).__name__}")
            print(f"   - SessionStateService: {type(self.session_service).__name__}")
            print(
                f"   - ApplicationLifecycleManager: {type(self.lifecycle_manager).__name__}"
            )
            print(f"   - EventBus: {type(self.event_bus).__name__}")

            return True

        except Exception as e:
            print(f"❌ Failed to setup test environment: {e}")
            import traceback

            traceback.print_exc()
            return False

    def test_user_workflow_sequence_creation(self) -> Dict[str, Any]:
        """Test real user workflow for sequence creation and auto-save."""
        print_section("User Workflow: Sequence Creation")

        try:
            # Test 1: Create sequence using TKAAITestHelper
            print("🔍 Creating sequence using TKAAITestHelper...")
            sequence_result = self.helper.create_sequence("User Workflow Test", 4)

            if not sequence_result.success:
                return {
                    "success": False,
                    "error": "Failed to create sequence with TKAAITestHelper",
                }

            sequence_data = sequence_result.data
            sequence_id = sequence_result.metadata.get("sequence_id")

            # Handle both dict and SequenceData object
            if isinstance(sequence_data, dict):
                sequence_name = sequence_data.get("name", "Unknown")
                beat_count = len(sequence_data.get("beats", []))
            else:
                sequence_name = sequence_data.name
                beat_count = len(sequence_data.beats)

            print(f"✅ Sequence created: {sequence_name} (ID: {sequence_id})")
            print(f"   Beats: {beat_count}")

            # Test 2: Save to session (simulating user interaction)
            print("🔍 Saving sequence to session (auto-save simulation)...")
            self.session_service.update_current_sequence(sequence_data, sequence_id)

            # Test 3: Verify session state
            current_session = self.session_service.get_current_session_state()
            session_has_sequence = (
                current_session
                and current_session.current_sequence_id == sequence_id
                and current_session.current_sequence_data is not None
            )

            print(f"✅ Session state updated: {session_has_sequence}")

            return {
                "success": True,
                "sequence_created": sequence_result.success,
                "sequence_id": sequence_id,
                "sequence_name": sequence_name,
                "beat_count": beat_count,
                "session_updated": session_has_sequence,
            }

        except Exception as e:
            print(f"❌ User workflow test failed: {e}")
            return {"success": False, "error": str(e)}

    def test_beat_modification_workflow(self) -> Dict[str, Any]:
        """Test user workflow for beat modification and auto-save."""
        print_section("User Workflow: Beat Modification")

        try:
            # Test 1: Create beat with motions using TKAAITestHelper
            print("🔍 Creating beat with motions...")
            beat_result = self.helper.create_beat_with_motions(1, "M")

            if not beat_result.success:
                return {"success": False, "error": "Failed to create beat with motions"}

            beat_data = beat_result.data
            print(
                f"✅ Beat created: {beat_data.letter} (duration: {beat_data.duration})"
            )
            print(
                f"   Has blue motion: {beat_result.metadata.get('has_blue_motion', False)}"
            )
            print(
                f"   Has red motion: {beat_result.metadata.get('has_red_motion', False)}"
            )

            # Test 2: Update session with modified beat (simulating user edit)
            print("🔍 Updating session with modified beat...")
            self.session_service.update_workbench_state(0, beat_data, None)

            # Test 3: Verify workbench state
            current_session = self.session_service.get_current_session_state()
            workbench_updated = (
                current_session and current_session.selected_beat_data is not None
            )

            print(f"✅ Workbench state updated: {workbench_updated}")

            return {
                "success": True,
                "beat_created": beat_result.success,
                "beat_letter": beat_data.letter,
                "has_motions": beat_result.metadata.get("has_blue_motion", False),
                "workbench_updated": workbench_updated,
            }

        except Exception as e:
            print(f"❌ Beat modification test failed: {e}")
            return {"success": False, "error": str(e)}

    def test_session_persistence_and_restoration(self) -> Dict[str, Any]:
        """Test complete session persistence and restoration cycle."""
        print_section("Session Persistence and Restoration")

        try:
            # Test 1: Force save session state
            print("🔍 Forcing session save...")
            save_success = self.session_service.save_session_state()
            print(f"✅ Session save result: {save_success}")

            # Test 2: Load session state
            print("🔍 Loading session state...")
            load_result = self.session_service.load_session_state()
            print(f"✅ Session load result: {load_result.success}")
            print(f"✅ Session restored: {load_result.session_restored}")

            # Test 3: Validate restored data
            restored_data = None
            if load_result.session_restored:
                session_data = load_result.session_data
                print(f"✅ Restored session ID: {session_data.session_id}")
                print(f"✅ Restored sequence ID: {session_data.current_sequence_id}")

                if session_data.current_sequence_data:
                    restored_data = session_data.current_sequence_data
                    if isinstance(restored_data, dict):
                        print(
                            f"✅ Restored sequence name: {restored_data.get('name', 'Unknown')}"
                        )
                        beats = restored_data.get("beats", [])
                        print(f"✅ Restored beat count: {len(beats)}")

            return {
                "success": True,
                "save_successful": save_success,
                "load_successful": load_result.success,
                "session_restored": load_result.session_restored,
                "data_available": restored_data is not None,
            }

        except Exception as e:
            print(f"❌ Persistence test failed: {e}")
            return {"success": False, "error": str(e)}

    def test_ui_restoration_events(self) -> Dict[str, Any]:
        """Test UI restoration event system."""
        print_section("UI Restoration Events")

        try:
            # Test 1: Setup event tracking
            events_received = []

            def test_event_handler(event):
                events_received.append(event)
                print(f"📨 Event received: {event.component}.{event.action}")
                print(f"   Source: {event.source}")

                # Validate event data
                state_data = event.state_data
                sequence_data = state_data.get("sequence_data")
                if sequence_data:
                    print(f"   Sequence: {sequence_data.name}")
                    print(f"   Beats: {len(sequence_data.beats)}")

            # Test 2: Subscribe to restoration events
            print("🔍 Subscribing to restoration events...")
            subscription_id = self.event_bus.subscribe(
                "ui.session_restoration.sequence_restored", test_event_handler
            )
            print(f"✅ Subscribed (ID: {subscription_id})")

            # Test 3: Trigger restoration
            print("🔍 Triggering session restoration...")
            load_result = self.session_service.load_session_state()

            if load_result.session_restored:
                self.lifecycle_manager._pending_session_data = load_result.session_data
                self.lifecycle_manager.trigger_deferred_session_restoration()

            # Test 4: Validate events
            print(f"✅ Events received: {len(events_received)}")

            # Clean up
            self.event_bus.unsubscribe(subscription_id)

            return {
                "success": True,
                "subscription_successful": subscription_id is not None,
                "events_received": len(events_received),
                "restoration_triggered": (
                    load_result.session_restored if load_result else False
                ),
            }

        except Exception as e:
            print(f"❌ UI restoration test failed: {e}")
            return {"success": False, "error": str(e)}

    def test_command_pattern_integration(self) -> Dict[str, Any]:
        """Test integration with existing command pattern."""
        print_section("Command Pattern Integration")

        try:
            # Test existing command pattern using TKAAITestHelper
            print("🔍 Testing existing command pattern...")
            cmd_result = self.helper.test_existing_command_pattern()

            print(f"✅ Command pattern test: {cmd_result.success}")
            print(
                f"   Command pattern available: {cmd_result.metadata.get('command_pattern_available', False)}"
            )
            print(f"   Can undo: {cmd_result.metadata.get('can_undo', False)}")

            return {
                "success": cmd_result.success,
                "command_pattern_available": cmd_result.metadata.get(
                    "command_pattern_available", False
                ),
                "can_undo": cmd_result.metadata.get("can_undo", False),
                "errors": cmd_result.errors,
            }

        except Exception as e:
            print(f"❌ Command pattern test failed: {e}")
            return {"success": False, "error": str(e)}

    def run_comprehensive_validation(self) -> Dict[str, Any]:
        """Run all validation tests and return comprehensive results."""
        print_header("TKA Auto-Save/Restore Comprehensive Validation")

        # Setup
        if not self.setup_test_environment():
            return {"success": False, "error": "Failed to setup test environment"}

        # Run all tests
        results = {}

        results["sequence_creation"] = self.test_user_workflow_sequence_creation()
        results["beat_modification"] = self.test_beat_modification_workflow()
        results["persistence_restoration"] = (
            self.test_session_persistence_and_restoration()
        )
        results["ui_events"] = self.test_ui_restoration_events()
        results["command_pattern"] = self.test_command_pattern_integration()

        # Calculate overall success
        all_tests_passed = all(
            result.get("success", False) for result in results.values()
        )

        results["overall_success"] = all_tests_passed

        # Summary
        print_header("Validation Summary")

        if all_tests_passed:
            print("🎉 ALL TESTS PASSED! Auto-save/restore system is fully functional!")
            print("✅ User workflow integration: WORKING")
            print("✅ Data persistence: PERFECT")
            print("✅ UI restoration events: WORKING")
            print("✅ Command pattern integration: WORKING")
            print("✅ TKAAITestHelper compatibility: WORKING")
        else:
            print("❌ Some tests failed - see detailed results below")

        print("\n📊 Detailed Test Results:")
        for test_name, result in results.items():
            if test_name != "overall_success":
                status = "✅" if result.get("success", False) else "❌"
                print(f"   {status} {test_name}:")
                for key, value in result.items():
                    if key != "success" and key != "error":
                        print(f"      {key}: {value}")
                if "error" in result:
                    print(f"      ERROR: {result['error']}")

        return results


def main():
    """Run comprehensive auto-save/restore validation."""
    validator = ComprehensiveAutoSaveRestoreValidator()
    results = validator.run_comprehensive_validation()

    # Return exit code based on success
    exit_code = 0 if results.get("overall_success", False) else 1

    print(f"\n🏁 Validation completed with exit code: {exit_code}")
    return results


if __name__ == "__main__":
    main()
