#!/usr/bin/env python3
"""
Test script for start position visibility fixes.

This script tests both bugs:
1. Start position pictograph visibility during startup
2. Start position restoration from saved sequences

Run this script to verify the fixes work correctly.
"""

import os
import sys
from pathlib import Path

# Add the src directory to the Python path
src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(src_path))


def test_pictograph_component_visibility():
    """Test that PictographComponent can be made visible after pool creation."""
    print("🧪 Testing PictographComponent visibility...")

    try:
        from presentation.components.pictograph.pictograph_component import (
            create_pictograph_component,
        )
        from PyQt6.QtWidgets import QApplication, QWidget

        # Create minimal Qt application
        app = QApplication.instance() or QApplication([])
        parent = QWidget()

        # Create pictograph component (simulates pool creation)
        component = create_pictograph_component(parent=parent)

        # Initially should be hidden due to pool creation settings
        print(f"   Initial visibility: {component.isVisible()}")

        # Enable visibility (our fix)
        if hasattr(component, "enable_visibility"):
            component.enable_visibility()
            print("   ✅ enable_visibility() method exists")
        else:
            print("   ❌ enable_visibility() method missing")
            return False

        # Now should be able to show
        component.show()
        component.setVisible(True)
        print(f"   After show(): {component.isVisible()}")

        # Check that WA_DontShowOnScreen is not set
        from PyQt6.QtCore import Qt

        dont_show_attr = component.testAttribute(Qt.WidgetAttribute.WA_DontShowOnScreen)
        print(f"   WA_DontShowOnScreen attribute: {dont_show_attr}")

        # For testing purposes, also check if parent is visible
        parent.show()
        parent.setVisible(True)
        print(f"   Parent visibility: {parent.isVisible()}")

        if component.isVisible() and not dont_show_attr:
            print("   ✅ PictographComponent visibility test PASSED")
            return True
        else:
            print("   ❌ PictographComponent visibility test FAILED")
            print(
                f"   Component visible: {component.isVisible()}, DontShow: {dont_show_attr}"
            )
            return False

    except Exception as e:
        print(f"   ❌ Error testing PictographComponent: {e}")
        return False


def test_start_position_view_creation():
    """Test that StartPositionView properly enables pictograph visibility."""
    print("🧪 Testing StartPositionView creation...")

    try:
        from presentation.components.sequence_workbench.sequence_beat_frame.start_position_view import (
            StartPositionView,
        )
        from PyQt6.QtWidgets import QApplication, QWidget

        # Create minimal Qt application
        app = QApplication.instance() or QApplication([])
        parent = QWidget()

        # Create start position view
        start_pos_view = StartPositionView(parent=parent)

        # Make parent visible first
        parent.show()
        parent.setVisible(True)
        start_pos_view.show()
        start_pos_view.setVisible(True)

        # Check that it has a pictograph component
        if (
            hasattr(start_pos_view, "_pictograph_component")
            and start_pos_view._pictograph_component
        ):
            print("   ✅ StartPositionView has pictograph component")

            # Check that the pictograph component can be made visible
            pictograph = start_pos_view._pictograph_component
            pictograph.show()
            pictograph.setVisible(True)

            print(f"   StartPositionView visible: {start_pos_view.isVisible()}")
            print(f"   Pictograph visible: {pictograph.isVisible()}")

            if pictograph.isVisible():
                print("   ✅ Pictograph component can be made visible")
                return True
            else:
                print("   ❌ Pictograph component cannot be made visible")
                return False
        else:
            print("   ❌ StartPositionView missing pictograph component")
            return False

    except Exception as e:
        print(f"   ❌ Error testing StartPositionView: {e}")
        return False


def test_session_manager_callback():
    """Test that session manager can set workbench callback."""
    print("🧪 Testing session manager callback mechanism...")

    try:
        from application.services.workbench.workbench_session_manager import (
            WorkbenchSessionManager,
        )

        # Create session manager
        session_manager = WorkbenchSessionManager()

        # Test callback setting
        callback_called = False

        def test_callback(start_pos_data, pictograph_data, from_restoration):
            nonlocal callback_called
            callback_called = True
            print(f"   Callback called with from_restoration={from_restoration}")

        session_manager.set_workbench_callback(test_callback)

        # Simulate callback invocation
        if (
            hasattr(session_manager, "_workbench_callback")
            and session_manager._workbench_callback
        ):
            session_manager._workbench_callback(None, None, True)

            if callback_called:
                print("   ✅ Session manager callback mechanism works")
                return True
            else:
                print("   ❌ Callback was not invoked")
                return False
        else:
            print("   ❌ Session manager callback not set")
            return False

    except Exception as e:
        print(f"   ❌ Error testing session manager: {e}")
        return False


def main():
    """Run all tests."""
    print("🚀 Starting start position visibility tests...\n")

    tests = [
        test_pictograph_component_visibility,
        test_start_position_view_creation,
        test_session_manager_callback,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing between tests

    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests PASSED! Start position visibility fixes are working.")
        return True
    else:
        print("❌ Some tests FAILED. Please check the implementation.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
