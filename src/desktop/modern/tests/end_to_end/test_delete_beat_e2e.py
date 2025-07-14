#!/usr/bin/env python3
"""
End-to-end test for delete beat functionality.

Tests the complete delete beat workflow including:
- Beat selection
- Delete beat button interaction
- Sequence state changes
- UI updates
"""

import os
import sys
from typing import Optional

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from application.services.sequence.sequence_persister import SequencePersister
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData
from PyQt6.QtCore import Qt
from PyQt6.QtTest import QTest
from PyQt6.QtWidgets import QApplication, QPushButton


class DeleteBeatUIAutomation:
    """UI automation helper for delete beat testing."""

    def __init__(self, app: QApplication):
        self.app = app
        self.main_window = None
        self.construct_tab = None
        self.workbench = None
        self.beat_frame = None

    def find_main_window(self):
        """Find the main application window."""
        for widget in self.app.topLevelWidgets():
            if hasattr(widget, "construct_tab"):
                self.main_window = widget
                self.construct_tab = widget.construct_tab
                if hasattr(self.construct_tab, "workbench"):
                    self.workbench = self.construct_tab.workbench
                    if hasattr(self.workbench, "_beat_frame_section"):
                        self.beat_frame = self.workbench._beat_frame_section
                print(f"✅ [UI_AUTOMATION] Found main window and components")
                return True

        print("❌ [UI_AUTOMATION] Could not find main window")
        return False

    def find_delete_beat_button(self) -> Optional[QPushButton]:
        """Find the delete beat button in the UI."""
        if not self.main_window:
            return None

        # Look for delete beat button in various locations
        for widget in self.main_window.findChildren(QPushButton):
            if any(text in widget.text().lower() for text in ["delete", "remove"]):
                if any(text in widget.text().lower() for text in ["beat"]):
                    print(
                        f"✅ [UI_AUTOMATION] Found delete beat button: {widget.text()}"
                    )
                    return widget

        print("❌ [UI_AUTOMATION] Could not find delete beat button")
        return None

    def get_current_sequence_length(self) -> int:
        """Get the current sequence length."""
        if self.workbench and hasattr(self.workbench, "_state_manager"):
            sequence = self.workbench._state_manager.get_current_sequence()
            if sequence:
                return len(sequence.beats)
        return 0

    def get_selected_beat_index(self) -> Optional[int]:
        """Get the currently selected beat index."""
        if self.beat_frame:
            return self.beat_frame.get_selected_beat_index()
        return None

    def select_beat_at_index(self, index: int) -> bool:
        """Select a beat at the given index."""
        if self.beat_frame and hasattr(self.beat_frame, "select_beat"):
            try:
                self.beat_frame.select_beat(index)
                QTest.qWait(500)  # Wait for selection to register
                return True
            except Exception as e:
                print(f"❌ [UI_AUTOMATION] Failed to select beat at index {index}: {e}")
        return False

    def click_delete_beat_button(self) -> bool:
        """Click the delete beat button."""
        button = self.find_delete_beat_button()
        if not button:
            return False

        print(f"🖱️ [UI_AUTOMATION] Clicking delete beat button...")
        QTest.mouseClick(button, Qt.MouseButton.LeftButton)
        QTest.qWait(1000)  # Wait for operation to complete
        return True

    def trigger_delete_beat_operation(self) -> bool:
        """Trigger delete beat operation directly via workbench."""
        if self.workbench and hasattr(self.workbench, "_handle_delete_beat"):
            try:
                print("🔧 [UI_AUTOMATION] Triggering delete beat operation directly...")
                self.workbench._handle_delete_beat()
                QTest.qWait(1000)
                return True
            except Exception as e:
                print(
                    f"❌ [UI_AUTOMATION] Failed to trigger delete beat operation: {e}"
                )
        return False


class DeleteBeatE2ETest:
    """End-to-end test for delete beat functionality."""

    def __init__(self):
        self.app = None
        self.ui_automation = None
        self.persistence_service = None
        self.test_results = {}

    def setup(self) -> bool:
        """Set up the test environment."""
        print("🚀 [DELETE_BEAT_E2E] Setting up test environment...")

        try:
            # Get existing QApplication instance
            self.app = QApplication.instance()
            if not self.app:
                print("❌ [DELETE_BEAT_E2E] No QApplication instance found")
                return False

            # Initialize UI automation
            self.ui_automation = DeleteBeatUIAutomation(self.app)
            if not self.ui_automation.find_main_window():
                return False

            # Initialize persistence service
            self.persistence_service = SequencePersister()

            print("✅ [DELETE_BEAT_E2E] Test environment setup complete")
            return True

        except Exception as e:
            print(f"❌ [DELETE_BEAT_E2E] Setup failed: {e}")
            return False

    def create_test_sequence(self) -> bool:
        """Create a test sequence with multiple beats."""
        print("📝 [DELETE_BEAT_E2E] Creating test sequence...")

        try:
            # Create test beats
            beats = [
                BeatData(beat_number=1, metadata={"letter": "J"}),
                BeatData(beat_number=2, metadata={"letter": "θ"}),
                BeatData(beat_number=3, metadata={"letter": "X"}),
                BeatData(beat_number=4, metadata={"letter": "Σ"}),
                BeatData(beat_number=5, metadata={"letter": "W"}),
            ]

            test_sequence = SequenceData(
                id="delete_beat_test", beats=beats, start_position="beta3"
            )

            # Set sequence in workbench
            if self.ui_automation.workbench:
                self.ui_automation.workbench.set_sequence(test_sequence)
                QTest.qWait(1000)  # Wait for UI to update

                # Verify sequence was set
                current_length = self.ui_automation.get_current_sequence_length()
                if current_length == 5:
                    print(
                        f"✅ [DELETE_BEAT_E2E] Test sequence created with {current_length} beats"
                    )
                    return True
                else:
                    print(
                        f"❌ [DELETE_BEAT_E2E] Expected 5 beats, got {current_length}"
                    )

            return False

        except Exception as e:
            print(f"❌ [DELETE_BEAT_E2E] Failed to create test sequence: {e}")
            return False

    def test_delete_middle_beat(self) -> bool:
        """Test deleting a middle beat (should delete beat and all following)."""
        print("🧪 [DELETE_BEAT_E2E] Testing delete middle beat...")

        try:
            # Create test sequence
            if not self.create_test_sequence():
                return False

            # Record initial state
            initial_length = self.ui_automation.get_current_sequence_length()
            print(f"📊 [DELETE_BEAT_E2E] Initial sequence length: {initial_length}")

            # Select beat at index 2 (X - should delete X, Σ, W)
            if not self.ui_automation.select_beat_at_index(2):
                print("❌ [DELETE_BEAT_E2E] Failed to select beat at index 2")
                return False

            # Verify selection
            selected_index = self.ui_automation.get_selected_beat_index()
            print(f"📊 [DELETE_BEAT_E2E] Selected beat index: {selected_index}")

            # Try button click first
            button_success = self.ui_automation.click_delete_beat_button()
            if not button_success:
                print(
                    "⚠️ [DELETE_BEAT_E2E] Button click failed, trying direct operation..."
                )
                if not self.ui_automation.trigger_delete_beat_operation():
                    print(
                        "❌ [DELETE_BEAT_E2E] Both button click and direct operation failed"
                    )
                    return False

            # Check final state
            final_length = self.ui_automation.get_current_sequence_length()
            print(f"📊 [DELETE_BEAT_E2E] Final sequence length: {final_length}")

            # Should have 2 beats remaining (J, θ)
            if final_length == 2:
                print("✅ [DELETE_BEAT_E2E] Delete middle beat test PASSED")
                return True
            else:
                print(f"❌ [DELETE_BEAT_E2E] Expected 2 beats, got {final_length}")
                return False

        except Exception as e:
            print(f"❌ [DELETE_BEAT_E2E] Delete middle beat test failed: {e}")
            return False

    def run_all_tests(self) -> bool:
        """Run all delete beat tests."""
        print("🚀 [DELETE_BEAT_E2E] Starting delete beat end-to-end tests...")

        if not self.setup():
            return False

        tests = [
            ("Delete Middle Beat", self.test_delete_middle_beat),
        ]

        all_passed = True
        for test_name, test_func in tests:
            print(f"\n🧪 [DELETE_BEAT_E2E] Running: {test_name}")
            try:
                result = test_func()
                self.test_results[test_name] = result
                if result:
                    print(f"✅ [DELETE_BEAT_E2E] {test_name} PASSED")
                else:
                    print(f"❌ [DELETE_BEAT_E2E] {test_name} FAILED")
                    all_passed = False
            except Exception as e:
                print(f"❌ [DELETE_BEAT_E2E] {test_name} ERROR: {e}")
                self.test_results[test_name] = False
                all_passed = False

        # Print summary
        print(f"\n📊 [DELETE_BEAT_E2E] Test Summary:")
        for test_name, result in self.test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"  {test_name}: {status}")

        return all_passed


def run_delete_beat_test():
    """Run delete beat test from within the application."""
    print("🚀 Starting Delete Beat End-to-End Tests...")

    # Check if QApplication is already running
    app = QApplication.instance()
    if not app:
        print(
            "❌ No QApplication instance found. Please run this test with the application running."
        )
        return False

    # Run tests
    test_runner = DeleteBeatE2ETest()
    success = test_runner.run_all_tests()

    if success:
        print("\n🎉 All delete beat tests PASSED!")
        return True
    else:
        print("\n❌ Some delete beat tests FAILED!")
        return False


def main():
    """Main test runner."""
    return run_delete_beat_test()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
