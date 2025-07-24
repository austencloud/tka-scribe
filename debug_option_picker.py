#!/usr/bin/env python3
"""
Debug script to test option picker functionality.
Tests the complete workflow: start position selection → option loading.
"""

import os
import sys

# Change to the correct directory
os.chdir("src/desktop/modern")

import logging

from PyQt6.QtCore import QTimer
from PyQt6.QtWidgets import QApplication

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def test_option_picker_workflow():
    """Test the complete option picker workflow."""
    print("🔧 [DEBUG] Starting option picker workflow test...")

    try:
        # Import main application
        from main import TKAMainWindow

        # Create application
        app = QApplication(sys.argv)

        # Create main window
        print("🔧 [DEBUG] Creating main window...")
        main_window = TKAMainWindow()

        # Show the window
        main_window.show()

        # Wait for initialization
        QTimer.singleShot(2000, lambda: test_start_position_selection(main_window))

        # Start event loop
        app.exec()

    except Exception as e:
        print(f"❌ [DEBUG] Error in workflow test: {e}")
        import traceback

        traceback.print_exc()


def test_start_position_selection(main_window):
    """Test start position selection and option loading."""
    print("🔧 [DEBUG] Testing start position selection...")

    try:
        # Get the construct tab
        construct_tab = main_window.main_widget.construct_tab
        if not construct_tab:
            print("❌ [DEBUG] Construct tab not found")
            return

        # Get the layout manager
        layout_manager = construct_tab.layout_manager
        if not layout_manager:
            print("❌ [DEBUG] Layout manager not found")
            return

        # Get the start position picker
        start_pos_picker = layout_manager.start_position_picker
        if not start_pos_picker:
            print("❌ [DEBUG] Start position picker not found")
            return

        print("✅ [DEBUG] Found start position picker")

        # Get the option picker
        option_picker = layout_manager.option_picker
        if not option_picker:
            print("❌ [DEBUG] Option picker not found")
            return

        print("✅ [DEBUG] Found option picker")

        # Check option picker sections
        if hasattr(option_picker, "scroll_area") and hasattr(
            option_picker.scroll_area, "sections"
        ):
            sections = option_picker.scroll_area.sections
            print(f"✅ [DEBUG] Found {len(sections)} option picker sections")

            for letter_type, section in sections.items():
                print(f"   - {letter_type}: {section}")
                if hasattr(section, "pictographs"):
                    print(
                        f"     Pictographs: {len(section.pictographs) if section.pictographs else 0}"
                    )
        else:
            print("❌ [DEBUG] Option picker sections not accessible")

        # Test start position selection
        print("🔧 [DEBUG] Simulating start position selection...")

        # Emit start position selected signal
        test_position = "alpha1_alpha1"
        start_pos_picker.start_position_selected.emit(test_position)

        print(f"✅ [DEBUG] Emitted start_position_selected signal: {test_position}")

        # Wait a bit for processing
        QTimer.singleShot(3000, lambda: check_option_loading(option_picker))

    except Exception as e:
        print(f"❌ [DEBUG] Error in start position selection test: {e}")
        import traceback

        traceback.print_exc()


def check_option_loading(option_picker):
    """Check if options were loaded after start position selection."""
    print("🔧 [DEBUG] Checking option loading results...")

    try:
        if hasattr(option_picker, "scroll_area") and hasattr(
            option_picker.scroll_area, "sections"
        ):
            sections = option_picker.scroll_area.sections

            total_pictographs = 0
            for letter_type, section in sections.items():
                if hasattr(section, "pictographs") and section.pictographs:
                    count = len(section.pictographs)
                    total_pictographs += count
                    print(f"✅ [DEBUG] {letter_type}: {count} pictographs loaded")
                else:
                    print(f"❌ [DEBUG] {letter_type}: No pictographs loaded")

            if total_pictographs > 0:
                print(
                    f"🎉 [DEBUG] SUCCESS: {total_pictographs} total pictographs loaded!"
                )
            else:
                print("❌ [DEBUG] FAILURE: No pictographs loaded in any section")

                # Debug the content loading pipeline
                debug_content_loading_pipeline(option_picker)
        else:
            print("❌ [DEBUG] Cannot access option picker sections")

    except Exception as e:
        print(f"❌ [DEBUG] Error checking option loading: {e}")
        import traceback

        traceback.print_exc()

    # Exit after test
    QTimer.singleShot(1000, QApplication.quit)


def debug_content_loading_pipeline(option_picker):
    """Debug the content loading pipeline to find where it's failing."""
    print("🔧 [DEBUG] Debugging content loading pipeline...")

    try:
        # Check if refresh orchestrator exists
        scroll_area = option_picker.scroll_area
        if hasattr(scroll_area, "_refresh_orchestrator"):
            print("✅ [DEBUG] Refresh orchestrator exists")

            # Check if sections are initialized
            if hasattr(scroll_area, "_all_sections_initialized"):
                print(
                    f"✅ [DEBUG] Sections initialized: {scroll_area._all_sections_initialized}"
                )
            else:
                print("❌ [DEBUG] Sections initialization flag missing")

            # Check individual sections
            for letter_type, section in scroll_area.sections.items():
                print(f"🔧 [DEBUG] Checking section {letter_type}:")

                # Check if layout is initialized
                if hasattr(section, "_layout_manager"):
                    layout_mgr = section._layout_manager
                    if hasattr(layout_mgr, "is_layout_initialized"):
                        is_init = layout_mgr.is_layout_initialized()
                        print(f"   Layout initialized: {is_init}")
                    else:
                        print("   Layout initialization check missing")
                else:
                    print("   Layout manager missing")

                # Check content loader
                if hasattr(section, "_content_loader"):
                    print("   Content loader exists")
                else:
                    print("   Content loader missing")
        else:
            print("❌ [DEBUG] Refresh orchestrator missing")

    except Exception as e:
        print(f"❌ [DEBUG] Error in pipeline debug: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    test_option_picker_workflow()
