"""
Automated Centering Test for Option Picker Header Buttons

This module provides automated testing workflow to verify mathematical centering
of Option Picker section header buttons without manual intervention.
"""

import sys
import time
from typing import List, Optional
from PyQt6.QtWidgets import QApplication, QWidget
from PyQt6.QtCore import QTimer, QEventLoop
from .geometric_measurement_logger import GeometricMeasurementLogger, CenteringAnalysis


class AutomatedCenteringTest:
    """
    Automated test system for verifying Option Picker header button centering.

    This class provides a complete test-fix-verify cycle that:
    1. Launches the application programmatically
    2. Populates the Option Picker with test data
    3. Captures precise geometric measurements
    4. Analyzes centering accuracy mathematically
    5. Reports results and closes the application
    """

    def __init__(self):
        self.app: Optional[QApplication] = None
        self.main_window = None
        self.option_picker = None
        self.logger = GeometricMeasurementLogger()
        self.test_results: List[CenteringAnalysis] = []

    def run_automated_test(self) -> bool:
        """
        Run the complete automated centering test cycle.

        Returns:
            bool: True if all sections are perfectly centered, False otherwise
        """
        print("🚀 STARTING AUTOMATED CENTERING TEST")
        print("=" * 80)

        try:
            # Step 1: Launch application
            if not self._launch_application():
                print("❌ Failed to launch application")
                return False

            # Step 2: Wait for application to fully load
            self._wait_for_application_ready()

            # Step 3: Populate Option Picker with test data
            if not self._populate_option_picker():
                print("❌ Failed to populate Option Picker")
                return False

            # Step 4: Wait for layout to stabilize
            self._wait_for_layout_stabilization()

            # Step 5: Capture geometric measurements
            if not self._capture_all_measurements():
                print("❌ Failed to capture measurements")
                return False

            # Step 6: Analyze centering for all sections
            success = self._analyze_all_centering()

            # Step 7: Generate comprehensive report
            self._generate_final_report()

            return success

        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            return False
        finally:
            # Step 8: Clean shutdown
            self._cleanup_application()

    def _launch_application(self) -> bool:
        """Launch the TKA application programmatically."""
        try:
            print("🚀 Launching TKA application...")

            # Create QApplication if it doesn't exist
            if not QApplication.instance():
                self.app = QApplication(sys.argv if sys.argv else ["test"])
            else:
                self.app = QApplication.instance()

            # Import and create main window
            from main import KineticConstructorModern

            self.main_window = KineticConstructorModern(enable_api=False)

            # Show the main window
            self.main_window.show()

            print("✅ Application launched successfully")
            return True

        except Exception as e:
            print(f"❌ Failed to launch application: {e}")
            return False

    def _wait_for_application_ready(self, timeout_ms: int = 3000) -> None:
        """Wait for the application to be fully loaded and ready."""
        print("⏳ Waiting for application to be ready...")

        # Process events to ensure UI is fully rendered
        start_time = time.time()
        while time.time() - start_time < (timeout_ms / 1000):
            self.app.processEvents()
            time.sleep(0.1)

        print("✅ Application ready")

    def _populate_option_picker(self) -> bool:
        """Populate the Option Picker with test data by selecting a start position."""
        try:
            print("📊 Populating Option Picker with test data...")

            # Find the Option Picker component
            self.option_picker = self._find_option_picker()
            if not self.option_picker:
                print("❌ Could not find Option Picker component")
                return False

            # Find and trigger start position selection
            start_position_handler = self._find_start_position_handler()
            if start_position_handler:
                # Select a test start position (alpha1_alpha1)
                start_position_handler.select_start_position("alpha1_alpha1")
                print("✅ Selected start position: alpha1_alpha1")
            else:
                print(
                    "⚠️  Could not find start position handler, Option Picker may already be populated"
                )

            # Wait for Option Picker to be populated
            self._wait_for_option_picker_population()

            print("✅ Option Picker populated successfully")
            return True

        except Exception as e:
            print(f"❌ Failed to populate Option Picker: {e}")
            return False

    def _find_option_picker(self):
        """Find the Option Picker widget in the application."""
        try:
            # Navigate through the widget hierarchy to find Option Picker
            # Modern structure: main_window -> construct_tab -> workbench -> option_picker
            if hasattr(self.main_window, "construct_tab"):
                construct_tab = self.main_window.construct_tab
                if hasattr(construct_tab, "workbench"):
                    workbench = construct_tab.workbench
                    if hasattr(workbench, "option_picker"):
                        return workbench.option_picker
                    elif hasattr(workbench, "option_picker_widget"):
                        return workbench.option_picker_widget

            # Alternative search through all widgets
            for widget in self.app.allWidgets():
                if "OptionPicker" in type(widget).__name__:
                    return widget

            return None
        except Exception as e:
            print(f"⚠️  Error finding Option Picker: {e}")
            return None

    def _find_start_position_handler(self):
        """Find the start position handler to trigger Option Picker population."""
        try:
            # Modern structure: main_window -> construct_tab -> workbench -> start_position_handler
            if hasattr(self.main_window, "construct_tab"):
                construct_tab = self.main_window.construct_tab
                if hasattr(construct_tab, "workbench"):
                    workbench = construct_tab.workbench
                    if hasattr(workbench, "start_position_handler"):
                        return workbench.start_position_handler
            return None
        except Exception as e:
            print(f"⚠️  Error finding start position handler: {e}")
            return None

    def _wait_for_option_picker_population(self, timeout_ms: int = 5000) -> None:
        """Wait for the Option Picker to be populated with pictographs."""
        print("⏳ Waiting for Option Picker population...")

        start_time = time.time()
        while time.time() - start_time < (timeout_ms / 1000):
            self.app.processEvents()

            # Check if Option Picker has sections with pictographs
            if self._has_populated_sections():
                break

            time.sleep(0.1)

        print("✅ Option Picker population complete")

    def _has_populated_sections(self) -> bool:
        """Check if Option Picker has sections with pictographs."""
        try:
            if not self.option_picker:
                return False

            # Look for sections with pictographs
            for widget in self.option_picker.findChildren(QWidget):
                if "OptionPickerSection" in type(widget).__name__:
                    if hasattr(widget, "pictographs") and len(widget.pictographs) > 0:
                        return True

            return False
        except Exception:
            return False

    def _wait_for_layout_stabilization(self, timeout_ms: int = 2000) -> None:
        """Wait for layout to stabilize after population."""
        print("⏳ Waiting for layout stabilization...")

        start_time = time.time()
        while time.time() - start_time < (timeout_ms / 1000):
            self.app.processEvents()
            time.sleep(0.1)

        print("✅ Layout stabilized")

    def _capture_all_measurements(self) -> bool:
        """Capture geometric measurements for all Option Picker sections."""
        try:
            print("📏 Capturing geometric measurements for all sections...")

            self.logger.clear_measurements()
            sections_found = 0

            # Find all Option Picker sections
            for widget in self.option_picker.findChildren(QWidget):
                if "OptionPickerSection" in type(widget).__name__:
                    if hasattr(widget, "capture_geometric_measurements"):
                        widget.capture_geometric_measurements(self.logger)
                        sections_found += 1

            if sections_found == 0:
                print("❌ No Option Picker sections found for measurement")
                return False

            print(f"✅ Captured measurements for {sections_found} sections")
            return True

        except Exception as e:
            print(f"❌ Failed to capture measurements: {e}")
            return False

    def _analyze_all_centering(self) -> bool:
        """Analyze centering for all captured sections."""
        try:
            print("🎯 Analyzing centering for all sections...")

            self.test_results.clear()
            sections_analyzed = 0
            perfectly_centered = 0

            # Find all Option Picker sections and analyze their centering
            for widget in self.option_picker.findChildren(QWidget):
                if "OptionPickerSection" in type(widget).__name__:
                    if hasattr(widget, "analyze_button_centering"):
                        widget.analyze_button_centering(self.logger)
                        sections_analyzed += 1

            # Collect results from logger
            self.test_results = self.logger.centering_analyses.copy()
            perfectly_centered = sum(
                1 for result in self.test_results if result.is_perfectly_centered
            )

            print(f"✅ Analyzed {sections_analyzed} sections")
            print(f"📊 Perfectly centered: {perfectly_centered}/{sections_analyzed}")

            return perfectly_centered == sections_analyzed

        except Exception as e:
            print(f"❌ Failed to analyze centering: {e}")
            return False

    def _generate_final_report(self) -> None:
        """Generate comprehensive final report."""
        print("\n" + "=" * 80)
        print("📊 AUTOMATED CENTERING TEST FINAL REPORT")
        print("=" * 80)

        self.logger.log_summary_report()

        # Additional test-specific reporting
        if self.test_results:
            print(f"\n🎯 TEST OUTCOME:")
            all_perfect = all(
                result.is_perfectly_centered for result in self.test_results
            )
            if all_perfect:
                print("✅ SUCCESS: All section header buttons are perfectly centered!")
            else:
                print(
                    "❌ FAILURE: Some section header buttons are not perfectly centered"
                )

                print(f"\n🔧 SECTIONS REQUIRING FIXES:")
                for result in self.test_results:
                    if not result.is_perfectly_centered:
                        direction = "RIGHT" if result.centering_offset > 0 else "LEFT"
                        print(
                            f"   • {result.section_name}: {abs(result.centering_offset):.1f}px too far {direction}"
                        )

        print("=" * 80)

    def _cleanup_application(self) -> None:
        """Clean up and close the application."""
        try:
            print("🧹 Cleaning up application...")

            if self.main_window:
                self.main_window.close()

            if self.app:
                self.app.quit()

            print("✅ Application cleanup complete")

        except Exception as e:
            print(f"⚠️  Error during cleanup: {e}")


def run_centering_test() -> bool:
    """
    Convenience function to run the automated centering test.

    Returns:
        bool: True if all sections are perfectly centered, False otherwise
    """
    test = AutomatedCenteringTest()
    return test.run_automated_test()


if __name__ == "__main__":
    # Run the test when executed directly
    success = run_centering_test()
    sys.exit(0 if success else 1)
