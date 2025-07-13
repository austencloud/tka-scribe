#!/usr/bin/env python3
"""
Test Section Sizing - Validate Option Picker Section Width Requirements

This test validates that:
1. Top sections (Type1, Type2, Type3) take full width of option picker
2. Bottom sections (Type4, Type5, Type6) take 1/3 width each
3. Section sizing calculations match expected values

Based on existing test requirements found in test_integration.py and documentation.
"""

import os
import sys

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from PyQt6.QtCore import QSize
from PyQt6.QtWidgets import QApplication


def test_section_sizing():
    """Test that section sizing calculations match requirements."""
    print("🧪 Testing Section Sizing Calculations...")

    # Test the sizing service directly
    from application.services.option_picker.option_sizing_service import (
        OptionSizingService,
    )
    from presentation.components.option_picker.types.letter_types import LetterType

    sizing_service = OptionSizingService()

    # Test parameters (matching typical main window size)
    main_window_width = 2304  # From actual app logs
    main_window_height = 1080
    expected_option_picker_width = main_window_width // 2  # 1152px

    print(f"📐 Main window width: {main_window_width}px")
    print(f"📐 Expected option picker width: {expected_option_picker_width}px")
    print()

    # Test individual sections (should take full width)
    individual_types = [LetterType.TYPE1, LetterType.TYPE2, LetterType.TYPE3]
    for letter_type in individual_types:
        dimensions = sizing_service.calculate_section_dimensions(
            letter_type=letter_type,
            main_window_width=main_window_width,
        )

        expected_width = expected_option_picker_width
        actual_width = dimensions["width"]

        if actual_width == expected_width:
            print(f"✅ {letter_type}: CORRECT full width ({actual_width}px)")
        else:
            print(
                f"❌ {letter_type}: INCORRECT width ({actual_width}px, expected: {expected_width}px)"
            )

    print()

    # Test grouped sections (should take 1/3 width each)
    grouped_types = [LetterType.TYPE4, LetterType.TYPE5, LetterType.TYPE6]
    for letter_type in grouped_types:
        dimensions = sizing_service.calculate_section_dimensions(
            letter_type=letter_type,
            main_window_width=main_window_width,
        )

        # Calculate what Legacy formula should produce
        base_width = main_window_width // 2  # 1152px
        COLUMN_COUNT = 8
        calculated_width = int(
            (base_width / COLUMN_COUNT) - 3
        )  # (1152/8) - 3 = 144 - 3 = 141
        view_width = min(
            calculated_width, main_window_height // 8
        )  # min(141, 135) = 135
        expected_width = int(view_width * 8) // 3  # int(135 * 8) // 3 = 1080 // 3 = 360

        actual_width = dimensions["width"]

        print(f"🔍 {letter_type}: Legacy calculation breakdown:")
        print(f"   base_width = {base_width}, calculated_width = {calculated_width}")
        print(f"   view_width = {view_width}, final_width = {actual_width}")

        if actual_width == expected_width:
            print(f"✅ {letter_type}: CORRECT Legacy width ({actual_width}px)")
        else:
            print(
                f"❌ {letter_type}: INCORRECT width ({actual_width}px, expected: {expected_width}px)"
            )

    print()
    print("🧪 Section sizing test completed!")


def test_with_real_widgets():
    """Test with actual Qt widgets to validate real-world behavior."""
    print("🧪 Testing with Real Qt Widgets...")

    app = QApplication.instance()
    if app is None:
        app = QApplication([])

    try:
        # Import and create the services
        from application.services.core.service_registration_manager import (
            ServiceRegistrationManager,
        )
        from core.dependency_injection.di_container import DIContainer

        # Create container and register services
        container = DIContainer()
        service_manager = ServiceRegistrationManager()
        service_manager.register_option_picker_services(container)

        # Create a mock size provider
        def mock_size_provider():
            return QSize(2304, 1080)

        # Test OptionPickerScroll creation
        from presentation.components.option_picker.core.option_picker_scroll import (
            OptionPickerScroll,
        )

        # Create scroll with proper size provider injection
        scroll = container.resolve(OptionPickerScroll)

        # CRITICAL: Set size provider BEFORE sections are initialized
        scroll.mw_size_provider = mock_size_provider

        # Re-initialize sections with correct size provider
        scroll._initialize_sections()

        # Check that sections are created
        print(f"📊 Created {len(scroll.sections)} sections")

        if len(scroll.sections) == 6:
            print("✅ Correct number of sections (6)")
        else:
            print(f"❌ Expected 6 sections, got {len(scroll.sections)}")

        # Test section width calculations
        expected_option_picker_width = 2304 // 2  # 1152px

        # Check if size provider is working correctly
        test_size = scroll.mw_size_provider()
        print(
            f"🔍 Scroll size provider returns: {test_size.width()}x{test_size.height()}"
        )

        if test_size.width() == 800 and test_size.height() == 600:
            print(
                "❌ REGRESSION DETECTED: Sections are using default 800x600 size provider!"
            )
            print("🚨 This will cause incorrect section sizing calculations!")
            return False

        for letter_type, section in scroll.sections.items():
            # Check section's size provider
            section_size = section.mw_size_provider()
            print(
                f"🔍 Section {letter_type} size provider returns: {section_size.width()}x{section_size.height()}"
            )

            # Trigger resize to calculate dimensions
            section.resizeEvent(None)

            section_width = section.width()

            # Debug: Check actual letter_type value and type
            print(f"🔍 DEBUG: letter_type = {letter_type}, type = {type(letter_type)}")

            # Use ACTUAL expected values based on real main window dimensions
            # Check for LetterType enum values, not strings
            from presentation.components.option_picker.types.letter_types import (
                LetterType,
            )

            if letter_type in [LetterType.TYPE1, LetterType.TYPE2, LetterType.TYPE3]:
                expected_width = 1152  # Individual sections: full width
                width_type = "INDIVIDUAL"
            else:
                expected_width = 360  # Grouped sections: Legacy calculation
                width_type = "GROUPED"

            print(
                f"🔍 {letter_type}: section_width={section_width}, expected_width={expected_width}, width_type={width_type}"
            )

            width_diff = abs(section_width - expected_width)
            if width_diff <= 5:  # Allow 5px tolerance
                print(
                    f"✅ {letter_type} {width_type}: CORRECT ({section_width}px, expected: {expected_width}px)"
                )
            else:
                print(
                    f"❌ {letter_type} {width_type}: INCORRECT ({section_width}px, expected: {expected_width}px, diff: {width_diff}px)"
                )

        print("✅ Real widget test completed!")

    except Exception as e:
        print(f"❌ Real widget test failed: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    print("🚀 Section Sizing Test Starting...")
    print("=" * 50)

    # Test 1: Pure calculation logic
    test_section_sizing()

    print()
    print("=" * 50)

    # Test 2: Real Qt widgets
    test_with_real_widgets()

    print()
    print("🎉 All section sizing tests completed!")
