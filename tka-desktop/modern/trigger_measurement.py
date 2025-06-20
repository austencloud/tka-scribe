#!/usr/bin/env python3
"""
Trigger Measurement Script

This script can be executed to trigger geometric measurements on the running
TKA application's Option Picker header buttons.

Usage:
    1. Start the TKA application: python main.py
    2. Select a start position to populate the Option Picker
    3. In a Python console or terminal, run: python trigger_measurement.py

This script will find the running application and trigger the measurement.
"""

import sys
import time
from pathlib import Path

# Add the src directory to Python path for imports
src_path = Path(__file__).parent / "src"
if str(src_path) not in sys.path:
    sys.path.insert(0, str(src_path))


def find_application_components():
    """Find the main application components."""
    try:
        from PyQt6.QtWidgets import QApplication

        app = QApplication.instance()
        if not app:
            print("❌ No QApplication instance found")
            print("   Make sure the TKA application is running")
            return None, None, None

        print("✅ Found running QApplication")

        # Search through all widgets to find the main application
        main_app = None
        for widget in app.allWidgets():
            widget_name = type(widget).__name__

            # Look for the main application window
            if "KineticConstructorModern" in widget_name:
                main_app = widget
                print(f"✅ Found main application: {widget_name}")
                break

        if not main_app:
            print("❌ Could not find main application window")
            return None, None, None

        # Navigate to components
        option_picker = None
        start_position_handler = None

        if hasattr(main_app, "construct_tab"):
            construct_tab = main_app.construct_tab
            if hasattr(construct_tab, "workbench"):
                workbench = construct_tab.workbench

                # Find Option Picker
                if hasattr(workbench, "option_picker_manager"):
                    option_picker_manager = workbench.option_picker_manager
                    if hasattr(option_picker_manager, "option_picker"):
                        option_picker = option_picker_manager.option_picker
                        print(f"✅ Found Option Picker: {type(option_picker).__name__}")

                # Find Start Position Handler
                if hasattr(workbench, "start_position_handler"):
                    start_position_handler = workbench.start_position_handler
                    print(
                        f"✅ Found Start Position Handler: {type(start_position_handler).__name__}"
                    )

        return main_app, option_picker, start_position_handler

    except Exception as e:
        print(f"❌ Error finding application components: {e}")
        return None, None, None


def find_option_picker_in_app():
    """Find the Option Picker component in the running application."""
    main_app, option_picker, _ = find_application_components()
    return option_picker


def trigger_start_position_selection():
    """Trigger start position selection to populate the Option Picker."""
    print("🎯 TRIGGERING START POSITION SELECTION")
    print("=" * 50)

    try:
        main_app, option_picker, start_position_handler = find_application_components()

        if not start_position_handler:
            print("❌ Could not find Start Position Handler")
            return False

        print("✅ Found Start Position Handler")

        # Check if the handler has a select method
        if hasattr(start_position_handler, "select_start_position"):
            print("🎯 Selecting start position: alpha1_alpha1")
            start_position_handler.select_start_position("alpha1_alpha1")

            # Wait a moment for the selection to process
            import time

            time.sleep(2)

            print("✅ Start position selection triggered")
            return True
        else:
            print(
                "❌ Start Position Handler does not have select_start_position method"
            )
            return False

    except Exception as e:
        print(f"❌ Error triggering start position selection: {e}")
        import traceback

        traceback.print_exc()
        return False


def trigger_measurement():
    """Trigger the geometric measurement on the running application."""
    print("🚀 TRIGGERING OPTION PICKER HEADER BUTTON MEASUREMENT")
    print("=" * 70)

    # Find the Option Picker
    option_picker = find_option_picker_in_app()
    if not option_picker:
        print("❌ Could not find Option Picker component")
        print("   Make sure:")
        print("   1. The TKA application is running")
        print("   2. A start position has been selected")
        print("   3. The Option Picker is populated with pictographs")
        return False

    # Check if the measurement method exists
    if not hasattr(option_picker, "measure_header_button_centering"):
        print("❌ Option Picker does not have measurement method")
        print("   The measurement functionality may not be available")
        return False

    print("✅ Option Picker found with measurement capability")
    print("🔍 Starting geometric measurement analysis...")
    print()

    try:
        # Trigger the measurement
        success = option_picker.measure_header_button_centering()

        print()
        print("=" * 70)
        if success:
            print("🎉 MEASUREMENT COMPLETE: All header buttons are perfectly centered!")
        else:
            print("⚠️  MEASUREMENT COMPLETE: Some header buttons need centering fixes")

        return success

    except Exception as e:
        print(f"❌ Error during measurement: {e}")
        import traceback

        traceback.print_exc()
        return False


def check_application_state():
    """Check the state of the running application."""
    print("🔍 CHECKING APPLICATION STATE")
    print("=" * 40)

    try:
        from PyQt6.QtWidgets import QApplication

        app = QApplication.instance()
        if not app:
            print("❌ No QApplication instance found")
            return False

        print("✅ QApplication is running")

        # Count widgets
        all_widgets = app.allWidgets()
        print(f"📊 Total widgets: {len(all_widgets)}")

        # Look for specific components
        main_window = None
        option_picker_sections = []

        for widget in all_widgets:
            widget_name = type(widget).__name__

            if "KineticConstructorModern" in widget_name:
                main_window = widget
            elif "OptionPickerSection" in widget_name:
                option_picker_sections.append(widget)

        if main_window:
            print(f"✅ Main window found: {type(main_window).__name__}")
            print(
                f"   Size: {main_window.size().width()}x{main_window.size().height()}"
            )
        else:
            print("❌ Main window not found")

        if option_picker_sections:
            print(f"✅ Found {len(option_picker_sections)} Option Picker sections")
            for i, section in enumerate(option_picker_sections, 1):
                section_name = getattr(section, "letter_type", f"Section_{i}")
                pictograph_count = len(getattr(section, "pictographs", []))
                print(f"   {i}. {section_name}: {pictograph_count} pictographs")
        else:
            print("❌ No Option Picker sections found")
            print("   The Option Picker may not be populated yet")

        print("=" * 40)
        return len(option_picker_sections) > 0

    except Exception as e:
        print(f"❌ Error checking application state: {e}")
        return False


def main():
    """Main entry point."""
    print("🧪 OPTION PICKER MEASUREMENT TRIGGER")
    print("=" * 50)

    # Check application state first
    app_ready = check_application_state()

    if not app_ready:
        print("\n⚠️  Option Picker not populated yet")
        print("🎯 Attempting to trigger start position selection...")

        if trigger_start_position_selection():
            print("✅ Start position selection successful")
            print("⏳ Waiting for Option Picker to populate...")

            # Wait and check again
            import time

            time.sleep(3)

            app_ready = check_application_state()
            if not app_ready:
                print(
                    "❌ Option Picker still not populated after start position selection"
                )
                return 1
        else:
            print("❌ Failed to trigger start position selection")
            print("   Please manually select a start position in the application")
            return 1

    print("\n✅ Application state looks good")
    print("🚀 Proceeding with measurement...")
    print()

    # Trigger the measurement
    success = trigger_measurement()

    if success:
        print("\n🎉 SUCCESS: All header buttons are perfectly centered!")
        return 0
    else:
        print("\n⚠️  ISSUES FOUND: Some header buttons need centering adjustments")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
