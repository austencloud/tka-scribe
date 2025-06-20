#!/usr/bin/env python3
"""
Automated test to measure actual rendered pictograph sizes in the modern option picker.
This test will programmatically launch the app, trigger the option picker, and measure
the real pictograph dimensions using Qt's geometry methods.
"""

import sys
import os
import time
from typing import List, Dict, Tuple
from PyQt6.QtWidgets import QApplication, QWidget
from PyQt6.QtCore import QTimer, QSize
from PyQt6.QtTest import QTest

# Add the src directory to the path so we can import the main application
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))


class PictographSizingTester:
    """Automated tester for pictograph sizing in the modern option picker"""

    def __init__(self):
        self.app = None
        self.main_window = None
        self.measurements = []
        self.test_complete = False

    def run_test(self):
        """Run the complete sizing test"""
        print("🧪 PICTOGRAPH SIZING TEST - Starting automated measurement")
        print("=" * 60)

        try:
            # Step 1: Launch the application
            self.launch_application()

            # Step 2: Wait for application to fully load
            self.wait_for_application_ready()

            # Step 3: Trigger option picker programmatically
            self.trigger_option_picker()

            # Step 4: Wait for option picker to populate
            self.wait_for_option_picker_ready()

            # Step 5: Measure actual pictograph sizes
            self.measure_pictograph_sizes()

            # Step 6: Report results
            self.report_measurements()

        except Exception as e:
            print(f"❌ TEST FAILED: {e}")
            import traceback

            traceback.print_exc()
        finally:
            self.cleanup()

    def launch_application(self):
        """Launch the main application programmatically"""
        print("🚀 Launching application...")

        # Create QApplication if it doesn't exist
        if not QApplication.instance():
            self.app = QApplication(sys.argv)
        else:
            self.app = QApplication.instance()

        # Import and create the main window
        from main import KineticConstructorModern

        self.main_window = KineticConstructorModern(
            splash_screen=None,  # No splash for testing
            enable_api=False,  # Disable API for testing
        )

        # Show the main window
        self.main_window.show()

        print(
            f"✅ Application launched - Main window size: {self.main_window.width()}x{self.main_window.height()}"
        )

    def wait_for_application_ready(self):
        """Wait for the application to be fully loaded and ready"""
        print("⏳ Waiting for application to be ready...")

        # Process events to ensure UI is fully rendered
        for i in range(50):  # Wait up to 5 seconds
            QApplication.processEvents()
            time.sleep(0.1)

            # Check if main window is properly sized
            if self.main_window.width() > 100 and self.main_window.height() > 100:
                break

        print(
            f"✅ Application ready - Final window size: {self.main_window.width()}x{self.main_window.height()}"
        )

    def trigger_option_picker(self):
        """Programmatically trigger the option picker to appear"""
        print("🎯 Triggering option picker...")

        try:
            # Find the sequence workbench and trigger start position selection
            workbench = self.find_widget_by_type("ModernSequenceWorkbench")
            if workbench:
                print(f"   - Found workbench: {type(workbench).__name__}")

                # Try to find and trigger start position selection
                start_pos_manager = getattr(workbench, "start_pos_manager", None)
                if start_pos_manager:
                    print("   - Found start position manager, triggering selection...")
                    # Simulate selecting a start position to trigger option picker
                    if hasattr(start_pos_manager, "select_start_position"):
                        # Try to select the first available start position
                        start_pos_manager.select_start_position(
                            0
                        )  # Select first position
                    elif (
                        hasattr(start_pos_manager, "positions")
                        and start_pos_manager.positions
                    ):
                        # Try clicking the first position button
                        first_position = start_pos_manager.positions[0]
                        if hasattr(first_position, "click"):
                            first_position.click()

                # Alternative: try to find option picker directly and populate it
                option_picker = self.find_widget_by_type("ModernOptionPickerWidget")
                if option_picker:
                    print(
                        "   - Found option picker directly, attempting to populate..."
                    )
                    if hasattr(option_picker, "refresh_options"):
                        option_picker.refresh_options()
                    elif hasattr(option_picker, "populate_options"):
                        option_picker.populate_options()

        except Exception as e:
            print(f"   - Error triggering option picker: {e}")
            # Continue anyway, maybe it's already triggered

    def wait_for_option_picker_ready(self):
        """Wait for the option picker to be populated with pictographs"""
        print("⏳ Waiting for option picker to be populated...")

        # Wait for option picker to appear and be populated
        for i in range(100):  # Wait up to 10 seconds
            QApplication.processEvents()
            time.sleep(0.1)

            # Look for pictograph frames
            pictograph_frames = self.find_all_pictograph_frames()
            if len(pictograph_frames) > 0:
                print(
                    f"✅ Option picker ready - Found {len(pictograph_frames)} pictograph frames"
                )

                # Wait for the real option picker population to complete
                self.wait_for_real_option_picker_population()
                return

        print("⚠️  Option picker may not be fully populated, proceeding anyway...")

    def wait_for_real_option_picker_population(self):
        """Wait for the real option picker population to complete after start position selection"""
        print("⏳ Waiting for real option picker population to complete...")

        # Wait for start position selection and option picker population
        for i in range(300):  # Wait up to 30 seconds
            QApplication.processEvents()
            time.sleep(0.1)

            # Look for more pictograph frames (should be 36 total)
            pictograph_frames = self.find_all_pictograph_frames()
            if len(pictograph_frames) >= 35:  # Wait for almost all frames
                print(
                    f"✅ Real option picker populated - Found {len(pictograph_frames)} pictograph frames"
                )

                # Wait a bit more for all frames to be added
                for j in range(100):  # Wait longer for container registration
                    QApplication.processEvents()
                    time.sleep(0.1)

                # Now force the sizing coordinator to execute
                self.force_sizing_coordinator_execution()
                return

        print(
            "⚠️  Real option picker population may not be complete, proceeding anyway..."
        )
        self.force_sizing_coordinator_execution()

    def force_sizing_coordinator_execution(self):
        """Force the sizing coordinator to execute immediately for testing"""
        print("🔧 Forcing sizing coordinator execution...")

        try:
            # Try to import and use the global sizing coordinator first
            try:
                from src.presentation.components.option_picker.sizing_coordinator import (
                    get_sizing_coordinator,
                )

                coordinator = get_sizing_coordinator()
                if coordinator:
                    print(
                        "   - Found global sizing coordinator, forcing immediate resize"
                    )
                    coordinator.force_immediate_resize()

                    # Process events to ensure resize completes
                    for _ in range(20):
                        QApplication.processEvents()
                        time.sleep(0.1)
                    return
            except Exception as e:
                print(f"   - Could not access global coordinator: {e}")

            # Find the sizing coordinator through widget hierarchy
            display_manager = self.find_widget_by_type("DisplayManager")
            if display_manager and hasattr(display_manager, "sizing_coordinator"):
                coordinator = display_manager.sizing_coordinator
                if coordinator:
                    print("   - Found sizing coordinator, forcing immediate resize")
                    coordinator.force_immediate_resize()

                    # Process events to ensure resize completes
                    for _ in range(10):
                        QApplication.processEvents()
                        time.sleep(0.1)
                else:
                    print("   - No sizing coordinator found on display manager")
            else:
                print("   - Display manager not found, trying alternative approach")

                # Alternative: try to find any section with a sizing coordinator
                option_picker = self.find_widget_by_type("OptionPicker")
                if option_picker:
                    # Look for sections that have sizing coordinators
                    all_widgets = self.main_window.findChildren(type(self.main_window))
                    for widget in all_widgets:
                        if (
                            hasattr(widget, "sizing_coordinator")
                            and widget.sizing_coordinator
                        ):
                            print(
                                f"   - Found sizing coordinator on {type(widget).__name__}, forcing resize"
                            )
                            widget.sizing_coordinator.force_immediate_resize()

                            # Process events to ensure resize completes
                            for _ in range(10):
                                QApplication.processEvents()
                                time.sleep(0.1)
                            break

        except Exception as e:
            print(f"   - Error forcing sizing coordinator: {e}")

    def measure_pictograph_sizes(self):
        """Measure the actual rendered sizes of all pictograph frames"""
        print("📏 Measuring actual pictograph sizes...")

        # First, let's debug the widget hierarchy to find the REAL option picker width
        self.debug_widget_hierarchy()

        # Find all pictograph frames
        pictograph_frames = self.find_all_pictograph_frames()

        if not pictograph_frames:
            print("❌ No pictograph frames found to measure!")
            return

        print(f"   - Found {len(pictograph_frames)} pictograph frames to measure")

        # Group frames by section
        sections = {}

        for frame in pictograph_frames:
            # Try to determine which section this frame belongs to
            section_name = self.get_frame_section(frame)
            if section_name not in sections:
                sections[section_name] = []
            sections[section_name].append(frame)

        # Measure each frame
        for section_name, frames in sections.items():
            print(f"\n📊 Measuring {section_name} section ({len(frames)} frames):")

            for i, frame in enumerate(frames[:5]):  # Measure first 5 frames per section
                try:
                    # Get actual rendered size
                    width = frame.width()
                    height = frame.height()

                    # Get container information
                    container_info = self.get_container_info(frame)

                    measurement = {
                        "section": section_name,
                        "frame_index": i,
                        "width": width,
                        "height": height,
                        "container_info": container_info,
                        "frame_type": type(frame).__name__,
                    }

                    self.measurements.append(measurement)

                    print(
                        f"   Frame {i+1}: {width}x{height}px (container: {container_info})"
                    )

                except Exception as e:
                    print(f"   Frame {i+1}: Error measuring - {e}")

    def debug_widget_hierarchy(self):
        """Debug the widget hierarchy to find the real option picker dimensions"""
        print("\n🔍 DEBUGGING WIDGET HIERARCHY:")
        print("=" * 50)

        if not self.main_window:
            print("❌ No main window found")
            return

        # Find the option picker widget
        option_picker = self.find_widget_by_type("OptionPicker")
        if option_picker:
            print(f"✅ Found option picker: {type(option_picker).__name__}")
            print(f"   - Size: {option_picker.width()}x{option_picker.height()}px")

            # Walk up the hierarchy to find parent containers
            parent = option_picker.parent()
            level = 1
            while parent and level <= 5:
                print(
                    f"   - Parent {level}: {type(parent).__name__} ({parent.width()}x{parent.height()}px)"
                )
                parent = parent.parent()
                level += 1
        else:
            print("❌ Option picker widget not found")

        # Also check the main window and construct tab sizes
        print(
            f"\n📐 Main window: {self.main_window.width()}x{self.main_window.height()}px"
        )

        construct_tab = self.find_widget_by_type("ConstructTab")
        if construct_tab:
            print(
                f"📐 Construct tab: {construct_tab.width()}x{construct_tab.height()}px"
            )

        workbench = self.find_widget_by_type("Workbench")
        if workbench:
            print(f"📐 Workbench: {workbench.width()}x{workbench.height()}px")

        print("=" * 50)

    def find_widget_by_type(self, type_name: str) -> QWidget:
        """Find a widget by its type name"""

        def search_widget(widget, target_type):
            if target_type in type(widget).__name__:
                return widget
            for child in widget.findChildren(QWidget):
                if target_type in type(child).__name__:
                    return child
            return None

        if self.main_window:
            return search_widget(self.main_window, type_name)
        return None

    def find_all_pictograph_frames(self) -> List[QWidget]:
        """Find all pictograph frames in the application"""
        frames = []

        if self.main_window:
            # Look for ClickablePictographFrame widgets
            all_widgets = self.main_window.findChildren(QWidget)
            for widget in all_widgets:
                if "PictographFrame" in type(widget).__name__:
                    frames.append(widget)

        return frames

    def get_frame_section(self, frame: QWidget) -> str:
        """Determine which section a frame belongs to"""
        try:
            parent = frame.parent()
            while parent:
                if hasattr(parent, "letter_type"):
                    return f"Type{parent.letter_type}"
                if hasattr(parent, "section_type"):
                    return f"{parent.section_type}"
                parent = parent.parent()
            return "Unknown"
        except:
            return "Unknown"

    def get_container_info(self, frame: QWidget) -> str:
        """Get container information for a frame"""
        try:
            if hasattr(frame, "container_widget") and frame.container_widget:
                container = frame.container_widget
                return f"{container.width()}x{container.height()}"
            else:
                parent = frame.parent()
                if parent:
                    return f"{parent.width()}x{parent.height()}"
                return "no container"
        except:
            return "error"

    def report_measurements(self):
        """Report the measurement results"""
        print("\n" + "=" * 60)
        print("📊 PICTOGRAPH SIZE MEASUREMENT RESULTS")
        print("=" * 60)

        if not self.measurements:
            print("❌ No measurements collected!")
            return

        # Group measurements by section
        by_section = {}
        for measurement in self.measurements:
            section = measurement["section"]
            if section not in by_section:
                by_section[section] = []
            by_section[section].append(measurement)

        # Report by section
        for section, measurements in by_section.items():
            print(f"\n🔍 {section} Section:")

            sizes = [(m["width"], m["height"]) for m in measurements]
            unique_sizes = list(set(sizes))

            print(f"   - Frame count: {len(measurements)}")
            print(f"   - Unique sizes: {unique_sizes}")

            if len(unique_sizes) == 1:
                w, h = unique_sizes[0]
                print(f"   ✅ All frames same size: {w}x{h}px")
            else:
                print(f"   ❌ Inconsistent sizes detected!")
                for size in unique_sizes:
                    count = sizes.count(size)
                    print(f"      - {size[0]}x{size[1]}px: {count} frames")

            # Show container info
            containers = [m["container_info"] for m in measurements]
            unique_containers = list(set(containers))
            print(f"   - Container sizes: {unique_containers}")

        # Overall analysis
        all_sizes = [(m["width"], m["height"]) for m in self.measurements]
        unique_all_sizes = list(set(all_sizes))

        print(f"\n🎯 OVERALL ANALYSIS:")
        print(f"   - Total frames measured: {len(self.measurements)}")
        print(f"   - Unique sizes across all sections: {unique_all_sizes}")

        if len(unique_all_sizes) == 1:
            w, h = unique_all_sizes[0]
            print(f"   ✅ UNIFIED SIZING SUCCESS: All pictographs are {w}x{h}px")

            # Check if size is reasonable
            if w < 80:
                print(f"   ⚠️  WARNING: Pictographs are very small ({w}px)")
            elif w > 200:
                print(f"   ⚠️  WARNING: Pictographs are very large ({w}px)")
            else:
                print(f"   ✅ Size appears reasonable")
        else:
            print(f"   ❌ UNIFIED SIZING FAILED: Inconsistent sizes detected")

    def cleanup(self):
        """Clean up resources"""
        print("\n🧹 Cleaning up...")
        if self.app:
            self.app.quit()


def main():
    """Run the pictograph sizing test"""
    tester = PictographSizingTester()
    tester.run_test()


if __name__ == "__main__":
    main()
