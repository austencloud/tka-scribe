#!/usr/bin/env python3
"""
End-to-End Test for Save Image Button Functionality

This test actually runs the GUI application, creates a sequence in the beat frame,
and tests clicking the Save Image button to verify it works correctly.
"""

import logging
import os
import sys
import time
from pathlib import Path

from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtTest import QTest
from PyQt6.QtWidgets import QApplication, QMainWindow

# Add src to Python path
project_root = Path(__file__).parent
src_path = project_root / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))

# Set up logging
logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)


class SaveImageE2ETest:
    """End-to-end test for Save Image functionality."""

    def __init__(self):
        self.app = None
        self.main_window = None
        self.container = None
        self.tab_widget = None
        self.sequence_workbench = None
        self.test_results = []

    def setup_application(self):
        """Set up a simplified TKA application for testing."""
        print("🚀 Setting up TKA application...")

        try:
            # Create QApplication
            self.app = QApplication.instance()
            if not self.app:
                self.app = QApplication(sys.argv)
                self.app.setStyle("Fusion")

            # Create a simplified sequence workbench directly
            print("🔧 Creating sequence workbench directly...")
            from application.services.core.registrars.workbench_service_registrar import (
                WorkbenchServiceRegistrar,
            )
            from core.dependency_injection.di_container import DIContainer
            from presentation.components.sequence_workbench.sequence_workbench import (
                SequenceWorkbench,
            )

            # Create container and register workbench services
            self.container = DIContainer()
            registrar = WorkbenchServiceRegistrar()

            # Register only the essential services we need
            try:
                # Register basic services
                from application.services.workbench.beat_selection_service import (
                    BeatSelectionService,
                )
                from application.services.workbench.workbench_export_service import (
                    WorkbenchExportService,
                )
                from application.services.workbench.workbench_operation_coordinator import (
                    WorkbenchOperationCoordinator,
                )
                from application.services.workbench.workbench_session_manager import (
                    WorkbenchSessionManager,
                )
                from application.services.workbench.workbench_state_manager import (
                    WorkbenchStateManager,
                )

                # Create mock layout service
                class MockLayoutService:
                    def get_layout(self, *args, **kwargs):
                        return {"rows": 1, "cols": 3}

                # Create and register services manually
                state_manager = WorkbenchStateManager()
                export_service = WorkbenchExportService()
                coordinator = WorkbenchOperationCoordinator(
                    workbench_state_manager=state_manager, export_service=export_service
                )
                session_manager = WorkbenchSessionManager(state_manager)
                beat_selection_service = BeatSelectionService()
                layout_service = MockLayoutService()

                self.container.register_instance(WorkbenchStateManager, state_manager)
                self.container.register_instance(WorkbenchExportService, export_service)
                self.container.register_instance(
                    WorkbenchOperationCoordinator, coordinator
                )
                self.container.register_instance(
                    WorkbenchSessionManager, session_manager
                )
                self.container.register_instance(
                    BeatSelectionService, beat_selection_service
                )

                print("✅ Essential services registered")

                # Create sequence workbench with required dependencies
                self.sequence_workbench = SequenceWorkbench(
                    container=self.container,
                    layout_service=layout_service,
                    beat_selection_service=beat_selection_service,
                )

                # Initialize the workbench
                self.sequence_workbench.initialize()

                # Wait for deferred initialization to complete
                print("⏳ Waiting for workbench initialization to complete...")
                for attempt in range(10):  # Wait up to 5 seconds
                    self.app.processEvents()
                    time.sleep(0.5)

                    # Check if beat frame section is available
                    if (
                        hasattr(self.sequence_workbench, "_beat_frame_section")
                        and self.sequence_workbench._beat_frame_section is not None
                    ):
                        print(
                            f"✅ Beat frame section available after {attempt * 0.5:.1f}s"
                        )
                        break
                else:
                    print("⚠️ Beat frame section still not available after waiting")

                print("✅ Sequence workbench created and initialized")

            except Exception as e:
                print(f"⚠️ Service registration warning: {e}")
                import traceback

                traceback.print_exc()
                return False

            # Create a simple main window to hold the workbench
            self.main_window = QMainWindow()
            self.main_window.setWindowTitle("TKA Test - Save Image Button Test")

            # Get the actual widget from the workbench
            workbench_widget = self.sequence_workbench.get_widget()
            self.main_window.setCentralWidget(workbench_widget)
            self.main_window.resize(1200, 800)

            # Show the main window
            self.main_window.show()
            self.app.processEvents()

            print("✅ Application setup complete")
            return True

        except Exception as e:
            print(f"❌ Application setup failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def navigate_to_sequence_workbench(self):
        """Navigate to the sequence workbench tab."""
        print("🔄 Sequence workbench already available...")

        # Since we created the workbench directly, it's already available
        if self.sequence_workbench:
            print(f"✅ Workbench widget: {type(self.sequence_workbench)}")
            return True
        else:
            print("❌ No sequence workbench available")
            return False

    def create_test_sequence(self):
        """Create a test sequence in the beat frame."""
        print("📊 Creating test sequence...")

        try:
            if not self.sequence_workbench:
                print("❌ No sequence workbench available")
                return False

            # Find the beat frame section - look in the actual widget
            workbench_widget = self.sequence_workbench.get_widget()
            beat_frame_section = None

            # First try to get it directly from the workbench
            if hasattr(self.sequence_workbench, "_beat_frame_section"):
                beat_frame_section = self.sequence_workbench._beat_frame_section
                print(
                    f"✅ Found beat frame section directly: {type(beat_frame_section)}"
                )
            else:
                # Search in the widget children
                for child in workbench_widget.findChildren(object):
                    if (
                        hasattr(child, "add_beat")
                        or "beat_frame" in str(type(child)).lower()
                    ):
                        beat_frame_section = child
                        print(
                            f"✅ Found beat frame section in children: {type(beat_frame_section)}"
                        )
                        break

            if not beat_frame_section:
                print("❌ Beat frame section not found")
                return False

            print(f"✅ Found beat frame section: {type(beat_frame_section)}")

            # Try to add beats programmatically
            if hasattr(beat_frame_section, "add_beat"):
                print("🔄 Adding beats programmatically...")
                for i in range(3):
                    beat_frame_section.add_beat()
                    self.app.processEvents()
                    time.sleep(0.1)
                print("✅ Added 3 beats to sequence")
                return True

            # Alternative: Try to find and click add beat button
            from PyQt6.QtWidgets import QPushButton

            add_buttons = self.sequence_workbench.findChildren(QPushButton)

            for button in add_buttons:
                if "add" in button.text().lower() or "+" in button.text():
                    print(f"🔄 Found add button: {button.text()}")
                    for i in range(3):
                        QTest.mouseClick(button, Qt.MouseButton.LeftButton)
                        self.app.processEvents()
                        time.sleep(0.1)
                    print("✅ Added beats via button clicks")
                    return True

            # Fallback: Create sequence programmatically via state manager
            print("🔄 Fallback: Creating sequence via state manager...")
            try:
                from application.services.workbench.workbench_state_manager import (
                    WorkbenchStateManager,
                )
                from domain.models.beat_data import BeatData
                from domain.models.sequence_data import SequenceData

                # Create test beats with realistic pictograph data
                print("🎨 Creating beats with pictograph data...")

                # Try to create beats with some basic pictograph data
                beat1 = BeatData(
                    beat_number=1,
                    is_blank=False,
                    metadata={
                        "letter": "A",
                        "start_pos": "alpha",
                        "end_pos": "beta",
                        "motion_type": "pro",
                        "turns": 0,
                    },
                )

                beat2 = BeatData(
                    beat_number=2,
                    is_blank=False,
                    metadata={
                        "letter": "B",
                        "start_pos": "beta",
                        "end_pos": "gamma",
                        "motion_type": "anti",
                        "turns": 1,
                    },
                )

                beat3 = BeatData(
                    beat_number=3,
                    is_blank=False,
                    metadata={
                        "letter": "C",
                        "start_pos": "gamma",
                        "end_pos": "alpha",
                        "motion_type": "static",
                        "turns": 0,
                    },
                )

                # Create sequence
                sequence = SequenceData(
                    name="E2E Test Sequence", word="TEST", beats=[beat1, beat2, beat3]
                )

                # Get state manager from container
                state_manager = self.container.resolve(WorkbenchStateManager)
                result = state_manager.set_sequence(sequence)

                if result.changed:
                    print("✅ Sequence created via state manager")
                    return True
                else:
                    print("❌ Failed to set sequence in state manager")
                    return False

            except Exception as e:
                print(f"❌ Fallback sequence creation failed: {e}")
                return False

        except Exception as e:
            print(f"❌ Sequence creation failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def test_save_image_button(self):
        """Test clicking the Save Image button."""
        print("🖼️ Testing Save Image button...")

        try:
            if not self.sequence_workbench:
                print("❌ No sequence workbench available")
                return False

            # Find the Save Image button - look in the workbench widget
            from PyQt6.QtWidgets import QPushButton

            workbench_widget = self.sequence_workbench.get_widget()
            buttons = workbench_widget.findChildren(QPushButton)

            print(f"🔍 Found {len(buttons)} buttons in workbench widget")

            save_image_button = None
            for button in buttons:
                button_text = button.text()
                print(f"  - Button: '{button.text()}' (enabled: {button.isEnabled()})")

                # Look for save/export buttons by text or emoji
                if (
                    ("save" in button_text.lower() and "image" in button_text.lower())
                    or "export" in button_text.lower()
                    or button_text == "💾"
                ):  # Save emoji
                    save_image_button = button
                    print(f"✅ Identified as Save Image button: '{button_text}'")
                    break

            # If not found in workbench widget, try looking in the button panel specifically
            if not save_image_button:
                print("🔍 Looking for button panel...")
                if hasattr(self.sequence_workbench, "_button_panel"):
                    button_panel = self.sequence_workbench._button_panel
                    print(f"✅ Found button panel: {type(button_panel)}")

                    if hasattr(button_panel, "get_widget"):
                        panel_widget = button_panel.get_widget()
                        panel_buttons = panel_widget.findChildren(QPushButton)
                        print(f"🔍 Found {len(panel_buttons)} buttons in button panel")

                        for button in panel_buttons:
                            button_text = button.text().lower()
                            print(
                                f"  - Panel Button: '{button.text()}' (enabled: {button.isEnabled()})"
                            )
                            if "save" in button_text and "image" in button_text:
                                save_image_button = button
                                break
                            elif "export" in button_text:
                                save_image_button = button
                                break

            if not save_image_button:
                print("❌ Save Image button not found")
                return False

            print(f"✅ Found Save Image button: {save_image_button.text()}")

            # Check if button is enabled
            if not save_image_button.isEnabled():
                print("⚠️ Save Image button is disabled")
                return False

            # Record initial state
            export_dir = project_root / "exports" / "workbench"
            initial_files = (
                list(export_dir.glob("*.png")) if export_dir.exists() else []
            )
            initial_count = len(initial_files)

            print(f"📁 Export directory: {export_dir}")
            print(f"📄 Initial file count: {initial_count}")

            # Click the Save Image button
            print("🖱️ Clicking Save Image button...")
            QTest.mouseClick(save_image_button, Qt.MouseButton.LeftButton)

            # Process events and wait for operation
            self.app.processEvents()
            time.sleep(2)  # Give time for export operation
            self.app.processEvents()

            # Check if new files were created
            final_files = list(export_dir.glob("*.png")) if export_dir.exists() else []
            final_count = len(final_files)

            print(f"📄 Final file count: {final_count}")

            if final_count > initial_count:
                new_files = [f for f in final_files if f not in initial_files]
                print(
                    f"✅ Save Image button worked! New files: {[f.name for f in new_files]}"
                )

                # Analyze and display each new file
                success = True
                for new_file in new_files:
                    file_success = self._analyze_and_display_exported_file(new_file)
                    success = success and file_success

                return success
            else:
                print("❌ No new files created - Save Image button may not be working")
                return False

        except Exception as e:
            print(f"❌ Save Image button test failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _analyze_and_display_exported_file(self, file_path: Path) -> bool:
        """Analyze and display an exported image file."""
        print(f"\n🔍 Analyzing exported file: {file_path.name}")

        try:
            # Check file size and type
            file_size = file_path.stat().st_size
            print(f"📏 File size: {file_size} bytes")

            if file_size == 0:
                print("❌ File is empty")
                return False

            # Check if it's a real image or placeholder
            is_real_image = self._is_real_image_file(file_path)

            if is_real_image:
                print("✅ Real image file detected")
                success = self._display_image_file(file_path)
                return success
            else:
                print("⚠️ Placeholder file detected (not a real image)")
                self._display_placeholder_content(file_path)
                return False

        except Exception as e:
            print(f"❌ Error analyzing file: {e}")
            return False

    def _is_real_image_file(self, file_path: Path) -> bool:
        """Check if file is a real image or placeholder text."""
        try:
            # Check file extension
            if not file_path.suffix.lower() in [".png", ".jpg", ".jpeg"]:
                return False

            # Try to read as binary and check for image headers
            with open(file_path, "rb") as f:
                header = f.read(8)

            # PNG header: 89 50 4E 47 0D 0A 1A 0A
            if header.startswith(b"\x89PNG\r\n\x1a\n"):
                return True

            # JPEG header: FF D8 FF
            if header.startswith(b"\xff\xd8\xff"):
                return True

            return False

        except Exception:
            return False

    def _display_placeholder_content(self, file_path: Path):
        """Display content of placeholder file."""
        try:
            with open(file_path, "r") as f:
                content = f.read()
            print("📄 Placeholder file content:")
            for line in content.split("\n")[:10]:  # Show first 10 lines
                print(f"   {line}")
        except Exception as e:
            print(f"❌ Could not read placeholder content: {e}")

    def _display_image_file(self, file_path: Path) -> bool:
        """Display the exported image file."""
        print(f"🖼️ Attempting to display image: {file_path.name}")

        try:
            # Try to create a simple Qt image viewer
            success = self._show_image_in_qt_window(file_path)
            if success:
                return True

            # Fallback: Try to open with system default
            print("🔄 Falling back to system image viewer...")
            success = self._open_with_system_viewer(file_path)
            return success

        except Exception as e:
            print(f"❌ Error displaying image: {e}")
            return False

    def _show_image_in_qt_window(self, file_path: Path) -> bool:
        """Show image in a Qt window within the test."""
        try:
            from PyQt6.QtCore import Qt
            from PyQt6.QtGui import QPixmap
            from PyQt6.QtWidgets import QDialog, QLabel, QPushButton, QVBoxLayout

            # Create image dialog
            dialog = QDialog(self.main_window)
            dialog.setWindowTitle(f"Exported Image: {file_path.name}")
            dialog.setModal(False)
            dialog.resize(800, 600)

            layout = QVBoxLayout(dialog)

            # Load and display image
            pixmap = QPixmap(str(file_path))
            if pixmap.isNull():
                print("❌ Could not load image as QPixmap")
                return False

            # Scale image to fit dialog
            scaled_pixmap = pixmap.scaled(
                750,
                500,
                Qt.AspectRatioMode.KeepAspectRatio,
                Qt.TransformationMode.SmoothTransformation,
            )

            image_label = QLabel()
            image_label.setPixmap(scaled_pixmap)
            image_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.addWidget(image_label)

            # Add info label
            info_label = QLabel(
                f"File: {file_path.name}\nSize: {file_path.stat().st_size} bytes\nDimensions: {pixmap.width()}x{pixmap.height()}"
            )
            info_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.addWidget(info_label)

            # Add close button
            close_button = QPushButton("Close")
            close_button.clicked.connect(dialog.close)
            layout.addWidget(close_button)

            # Show dialog non-blocking
            dialog.show()

            # Process events to ensure dialog is visible
            self.app.processEvents()

            print(
                f"✅ Image displayed in Qt window (dimensions: {pixmap.width()}x{pixmap.height()})"
            )
            print("📋 Image viewer window opened - you can view the exported image")

            # Keep dialog open for a few seconds for viewing
            for _ in range(30):  # 3 seconds
                self.app.processEvents()
                time.sleep(0.1)
                if not dialog.isVisible():
                    break

            return True

        except Exception as e:
            print(f"❌ Qt image display failed: {e}")
            return False

    def _open_with_system_viewer(self, file_path: Path) -> bool:
        """Open image with system default viewer."""
        try:
            import os
            import subprocess
            import sys

            if sys.platform.startswith("win"):
                os.startfile(str(file_path))
            elif sys.platform.startswith("darwin"):
                subprocess.run(["open", str(file_path)])
            else:
                subprocess.run(["xdg-open", str(file_path)])

            print(f"✅ Opened {file_path.name} with system viewer")
            return True

        except Exception as e:
            print(f"❌ System viewer failed: {e}")
            return False

    def cleanup(self):
        """Clean up the application."""
        print("🧹 Cleaning up...")

        try:
            if self.main_window:
                self.main_window.close()

            if self.app:
                self.app.processEvents()
                # Don't quit the app if it was already running
                if QApplication.instance() == self.app:
                    self.app.quit()

            print("✅ Cleanup complete")

        except Exception as e:
            print(f"⚠️ Cleanup warning: {e}")

    def run_test(self):
        """Run the complete end-to-end test."""
        print("🎯 Starting Enhanced Save Image Button End-to-End Test")
        print("🔧 This test will attempt REAL image export and display results")
        print("=" * 70)

        test_results = {
            "setup": False,
            "navigation": False,
            "sequence_creation": False,
            "button_test": False,
            "real_image_export": False,
            "image_display": False,
        }

        try:
            # Step 1: Setup application
            print("\n📋 STEP 1: Application Setup")
            test_results["setup"] = self.setup_application()
            if not test_results["setup"]:
                print("❌ Application setup failed")
                return self._print_final_results(test_results)

            # Step 2: Navigate to workbench
            print("\n📋 STEP 2: Workbench Navigation")
            test_results["navigation"] = self.navigate_to_sequence_workbench()
            if not test_results["navigation"]:
                print("❌ Navigation to workbench failed")
                return self._print_final_results(test_results)

            # Step 3: Create test sequence
            print("\n📋 STEP 3: Test Sequence Creation")
            test_results["sequence_creation"] = self.create_test_sequence()
            if not test_results["sequence_creation"]:
                print("❌ Test sequence creation failed")
                return self._print_final_results(test_results)

            # Step 4: Test Save Image button with real export
            print("\n📋 STEP 4: Save Image Button Test (Real Export)")
            test_results["button_test"] = self.test_save_image_button()

            # The button test now includes real image analysis
            # Check if we got real images vs placeholders
            export_dir = Path(
                self.sequence_workbench._export_service.get_export_directory()
                if hasattr(self.sequence_workbench, "_export_service")
                else "exports/workbench"
            )
            png_files = list(export_dir.glob("*.png"))

            if png_files:
                latest_file = max(png_files, key=lambda f: f.stat().st_mtime)
                test_results["real_image_export"] = self._is_real_image_file(
                    latest_file
                )

                if test_results["real_image_export"]:
                    print("✅ REAL IMAGE EXPORT SUCCESSFUL!")
                    test_results["image_display"] = (
                        True  # Display was handled in button test
                    )
                else:
                    print("⚠️ Only placeholder files created (real export failed)")

            return self._print_final_results(test_results)

        except Exception as e:
            print(f"💥 Test failed with exception: {e}")
            import traceback

            traceback.print_exc()
            return self._print_final_results(test_results)

        finally:
            self.cleanup()

    def _print_final_results(self, results: dict) -> bool:
        """Print comprehensive test results."""
        print("\n" + "=" * 70)
        print("📊 COMPREHENSIVE TEST RESULTS")
        print("=" * 70)

        all_passed = True

        for step, passed in results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            step_name = step.replace("_", " ").title()
            print(f"{status} - {step_name}")
            if not passed:
                all_passed = False

        print("\n" + "=" * 70)

        if all_passed:
            print("🎉 ALL TESTS PASSED - REAL IMAGE EXPORT WORKING!")
            print("✅ Save Image button creates actual image files")
            print("✅ Images can be displayed and viewed")
            print("✅ Complete workflow from button click to image display works")
        else:
            print("💥 SOME TESTS FAILED")

            if not results["real_image_export"]:
                print("⚠️ Real image export is not working - only placeholders created")
                print("🔧 This indicates Qt rendering issues that need to be resolved")

            if results["button_test"] and not results["real_image_export"]:
                print("✅ Button workflow works but image rendering has issues")

        print("=" * 70)
        return all_passed


def main():
    """Run the end-to-end test."""
    test = SaveImageE2ETest()
    success = test.run_test()

    if success:
        print("\n🎉 Save Image functionality is confirmed working!")
        sys.exit(0)
    else:
        print("\n💥 Save Image functionality has issues!")
        sys.exit(1)


if __name__ == "__main__":
    main()
