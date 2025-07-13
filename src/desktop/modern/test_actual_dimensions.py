#!/usr/bin/env python3
"""
Test Actual Main Window Dimensions

This test gets the ACTUAL main window dimensions using Qt built-in commands
and calculates what section sizes SHOULD be based on those real dimensions.

No assumptions - only real measurements and calculations.
"""

import os
import sys

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from PyQt6.QtCore import QSize
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget


def test_actual_main_window_dimensions():
    """Get ACTUAL main window dimensions and calculate correct section sizes."""
    print("🧪 Testing ACTUAL Main Window Dimensions...")

    app = QApplication.instance()
    if app is None:
        app = QApplication([])

    try:
        # Create a REAL main window with REAL dimensions
        main_window = QMainWindow()
        main_window.setWindowTitle("Real Test Main Window")
        main_window.resize(2304, 1080)  # Set to realistic size
        main_window.show()  # Actually show it so it has real dimensions

        # Force the window to process events and get real size
        app.processEvents()

        # Get ACTUAL main window size using Qt built-in commands
        actual_main_window_size = main_window.size()
        actual_width = actual_main_window_size.width()
        actual_height = actual_main_window_size.height()

        print(f"📐 ACTUAL main window size: {actual_width}x{actual_height}")

        # Calculate what the sections SHOULD be based on ACTUAL dimensions
        from application.services.option_picker.option_sizing_service import (
            OptionSizingService,
        )
        from presentation.components.option_picker.types.letter_types import LetterType

        sizing_service = OptionSizingService()

        # Calculate expected values based on ACTUAL main window size
        print(
            f"📊 Calculating expected section sizes based on ACTUAL main window size..."
        )

        # Individual sections (Type1, Type2, Type3) should be full width
        individual_expected = actual_width // 2  # Half of main window width
        print(f"📊 Individual sections (Type1,2,3) should be: {individual_expected}px")

        # Grouped sections (Type4, Type5, Type6) use Legacy calculation
        base_width = actual_width // 2
        COLUMN_COUNT = 8
        calculated_width = int((base_width / COLUMN_COUNT) - 3)
        view_width = min(calculated_width, actual_height // 8)
        grouped_expected = int(view_width * 8) // 3
        print(f"📊 Grouped sections (Type4,5,6) should be: {grouped_expected}px")

        # Show the calculation breakdown
        print(f"📊 Legacy calculation breakdown:")
        print(f"   base_width = {base_width}")
        print(f"   calculated_width = {calculated_width}")
        print(f"   view_width = {view_width}")
        print(f"   grouped_expected = {grouped_expected}")

        # Test each section type with ACTUAL dimensions
        all_correct = True

        for letter_type in LetterType.ALL_TYPES:
            dimensions = sizing_service.calculate_section_dimensions(
                letter_type=letter_type, main_window_width=actual_width
            )

            actual_section_width = dimensions["width"]

            if letter_type in [LetterType.TYPE1, LetterType.TYPE2, LetterType.TYPE3]:
                expected_width = individual_expected
                section_type = "INDIVIDUAL"
            else:
                expected_width = grouped_expected
                section_type = "GROUPED"

            if actual_section_width == expected_width:
                print(
                    f"✅ {letter_type} ({section_type}): CORRECT {actual_section_width}px"
                )
            else:
                print(
                    f"❌ {letter_type} ({section_type}): INCORRECT {actual_section_width}px, expected {expected_width}px"
                )
                all_correct = False

        main_window.close()
        return all_correct

    except Exception as e:
        print(f"❌ Actual main window dimensions test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_size_provider_regression():
    """Test that size provider is NOT falling back to 800x600 default."""
    print("🧪 Testing Size Provider Regression...")

    app = QApplication.instance()
    if app is None:
        app = QApplication([])

    try:
        # Create a main window with known size
        main_window = QMainWindow()
        main_window.setWindowTitle("Test Main Window")
        main_window.resize(2304, 1080)
        main_window.show()
        app.processEvents()

        # Create central widget
        central_widget = QWidget()
        main_window.setCentralWidget(central_widget)

        # Test the OptionPicker size provider logic
        from application.services.core.service_registration_manager import (
            ServiceRegistrationManager,
        )
        from core.dependency_injection.di_container import DIContainer
        from presentation.components.option_picker.core.option_picker import (
            OptionPicker,
        )

        # Create container and register services
        container = DIContainer()
        service_manager = ServiceRegistrationManager()
        service_manager.register_option_picker_services(container)

        # Create OptionPicker as a child of the main window
        option_picker = OptionPicker(container=container, parent=central_widget)

        # Test the size provider
        size_provider = option_picker._get_size_provider()
        actual_size = size_provider()

        print(
            f"📐 Main window size: {main_window.size().width()}x{main_window.size().height()}"
        )
        print(
            f"📐 Size provider returned: {actual_size.width()}x{actual_size.height()}"
        )

        # Check for regression to default 800x600
        if actual_size.width() == 800 and actual_size.height() == 600:
            print("❌ REGRESSION DETECTED: Size provider is using default 800x600!")
            print("🚨 CRITICAL: This will cause incorrect section sizing calculations!")
            main_window.close()
            return False
        elif actual_size.width() >= 1000:  # Reasonable size
            print("✅ Size provider is NOT using default 800x600")
            print("✅ Size provider returned reasonable dimensions")
            main_window.close()
            return True
        else:
            print(
                f"⚠️ Size provider returned unexpected size: {actual_size.width()}x{actual_size.height()}"
            )
            main_window.close()
            return False

    except Exception as e:
        print(f"❌ Size provider regression test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Actual Dimensions Test Starting...")
    print("=" * 60)

    # Test 1: Get actual main window dimensions and calculate correct section sizes
    test1_passed = test_actual_main_window_dimensions()

    print()
    print("=" * 60)

    # Test 2: Check for size provider regression to 800x600
    test2_passed = test_size_provider_regression()

    print()
    print("=" * 60)

    # Summary
    if test1_passed and test2_passed:
        print("🎉 ALL ACTUAL DIMENSION TESTS PASSED!")
        print("✅ Section sizing calculations are based on real main window dimensions")
        print("✅ No regression to default 800x600 detected")
    else:
        print("❌ ACTUAL DIMENSION TESTS FAILED!")
        if not test1_passed:
            print("   - Section sizing calculations are incorrect")
        if not test2_passed:
            print("   - Size provider regression to 800x600 detected")
        print("🔧 This must be fixed to ensure correct option picker layout!")
