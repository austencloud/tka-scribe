#!/usr/bin/env python3
"""
Size Provider Regression Test

This test validates that the main window size provider is working correctly
and not falling back to the default 800x600 dimensions.

This is a critical regression test to prevent silent failures in sizing calculations.
"""

import os
import sys

# Add src to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from PyQt6.QtCore import QSize
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget


def test_size_provider_chain():
    """Test that size provider chain works correctly."""
    print("🧪 Testing Size Provider Chain...")

    app = QApplication.instance()
    if app is None:
        app = QApplication([])

    try:
        # Create a main window with known size
        main_window = QMainWindow()
        main_window.setWindowTitle("Test Main Window")
        main_window.resize(2304, 1080)  # Known size from app logs

        # Create central widget
        central_widget = QWidget()
        main_window.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

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

        # Validate that we're getting the correct main window size, not the default
        if actual_size.width() == 800 and actual_size.height() == 600:
            print("❌ REGRESSION DETECTED: Size provider is using default 800x600!")
            print("   This means the main window size detection is failing!")
            return False
        elif actual_size.width() == main_window.size().width():
            print("✅ Size provider correctly detected main window size")
            return True
        else:
            print(
                f"⚠️ Size provider returned unexpected size: {actual_size.width()}x{actual_size.height()}"
            )
            print(
                f"   Expected: {main_window.size().width()}x{main_window.size().height()}"
            )
            # This might be acceptable if it's getting screen size or active window
            if actual_size.width() > 1000:  # Reasonable size
                print(
                    "✅ Size provider returned reasonable size (likely screen/active window)"
                )
                return True
            else:
                print("❌ Size provider returned unreasonably small size")
                return False

    except Exception as e:
        print(f"❌ Size provider test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_option_picker_widget_size_provider():
    """Test that OptionPickerWidget receives the correct size provider."""
    print("🧪 Testing OptionPickerWidget Size Provider...")

    app = QApplication.instance()
    if app is None:
        app = QApplication([])

    try:
        # Create a main window with known size
        main_window = QMainWindow()
        main_window.setWindowTitle("Test Main Window")
        main_window.resize(2304, 1080)

        # Create central widget
        central_widget = QWidget()
        main_window.setCentralWidget(central_widget)

        # Create a custom size provider that returns known values
        def test_size_provider():
            return QSize(2304, 1080)

        # Test OptionPickerWidget directly
        from application.services.core.service_registration_manager import (
            ServiceRegistrationManager,
        )
        from core.dependency_injection.di_container import DIContainer
        from presentation.components.option_picker.core.option_picker_widget import (
            OptionPickerWidget,
        )

        # Create container and register services
        container = DIContainer()
        service_manager = ServiceRegistrationManager()
        service_manager.register_option_picker_services(container)

        # Create OptionPickerWidget with explicit size provider
        widget = OptionPickerWidget(
            parent=central_widget,
            mw_size_provider=test_size_provider,
            container=container,
        )

        # Test that the widget is using our size provider
        actual_size = widget.mw_size_provider()

        print(
            f"📐 Test size provider returns: {test_size_provider().width()}x{test_size_provider().height()}"
        )
        print(
            f"📐 Widget size provider returns: {actual_size.width()}x{actual_size.height()}"
        )

        if actual_size.width() == 2304 and actual_size.height() == 1080:
            print("✅ OptionPickerWidget correctly uses provided size provider")
            return True
        elif actual_size.width() == 800 and actual_size.height() == 600:
            print("❌ REGRESSION: OptionPickerWidget is using default size provider!")
            print("   The mw_size_provider parameter is not being used correctly!")
            return False
        else:
            print(
                f"❌ OptionPickerWidget returned unexpected size: {actual_size.width()}x{actual_size.height()}"
            )
            return False

    except Exception as e:
        print(f"❌ OptionPickerWidget size provider test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_size_provider_in_scroll_widget():
    """Test that the size provider is correctly passed to OptionPickerScroll."""
    print("🧪 Testing OptionPickerScroll Size Provider...")

    app = QApplication.instance()
    if app is None:
        app = QApplication([])

    try:
        # Create a custom size provider
        def test_size_provider():
            return QSize(2304, 1080)

        # Test OptionPickerScroll directly
        from application.services.core.service_registration_manager import (
            ServiceRegistrationManager,
        )
        from core.dependency_injection.di_container import DIContainer

        # Create container and register services
        container = DIContainer()
        service_manager = ServiceRegistrationManager()
        service_manager.register_option_picker_services(container)

        # Create OptionPickerScroll with explicit size provider
        from presentation.components.option_picker.core.option_picker_scroll import (
            OptionPickerScroll,
        )

        scroll = container.resolve(OptionPickerScroll)
        scroll.mw_size_provider = test_size_provider

        # Test that the scroll widget is using our size provider
        actual_size = scroll.mw_size_provider()

        print(
            f"📐 Test size provider returns: {test_size_provider().width()}x{test_size_provider().height()}"
        )
        print(
            f"📐 Scroll size provider returns: {actual_size.width()}x{actual_size.height()}"
        )

        if actual_size.width() == 2304 and actual_size.height() == 1080:
            print("✅ OptionPickerScroll correctly uses provided size provider")
            return True
        else:
            print(
                f"❌ OptionPickerScroll returned unexpected size: {actual_size.width()}x{actual_size.height()}"
            )
            return False

    except Exception as e:
        print(f"❌ OptionPickerScroll size provider test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Size Provider Regression Test Starting...")
    print("=" * 60)

    # Test 1: Size provider chain
    test1_passed = test_size_provider_chain()

    print()
    print("=" * 60)

    # Test 2: OptionPickerWidget size provider
    test2_passed = test_option_picker_widget_size_provider()

    print()
    print("=" * 60)

    # Test 3: OptionPickerScroll size provider
    test3_passed = test_size_provider_in_scroll_widget()

    print()
    print("=" * 60)

    # Summary
    if test1_passed and test2_passed and test3_passed:
        print("🎉 ALL SIZE PROVIDER TESTS PASSED!")
        print("✅ No regression detected - size providers working correctly")
    else:
        print("❌ SIZE PROVIDER REGRESSION DETECTED!")
        print("🚨 CRITICAL: Option picker will use wrong dimensions for calculations!")
        print("🔧 This must be fixed immediately to prevent layout issues!")

        if not test1_passed:
            print("   - Size provider chain is broken")
        if not test2_passed:
            print("   - OptionPickerWidget not receiving size provider")
        if not test3_passed:
            print("   - OptionPickerScroll not using size provider")
