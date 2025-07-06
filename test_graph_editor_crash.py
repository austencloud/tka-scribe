#!/usr/bin/env python3
"""
Test to reproduce the graph editor button crash
"""

import sys
from pathlib import Path

# Add the modern src directory to Python path
modern_src = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
if str(modern_src) not in sys.path:
    sys.path.insert(0, str(modern_src))

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer, Qt
from PyQt6.QtTest import QTest
import time

# Import TKA application components
from core.application.application_factory import ApplicationFactory


def test_graph_editor_button_crash():
    """Test clicking the graph editor button to reproduce crash"""
    print("🔍 [GRAPH_EDITOR_TEST] Starting graph editor button crash test...")

    # Create application
    app = QApplication.instance() or QApplication(sys.argv)

    try:
        # Create production container
        container = ApplicationFactory.create_production_app()
        print("✅ [GRAPH_EDITOR_TEST] Production container created")

        # Get main window
        sys.path.insert(0, str(Path(__file__).parent / "src" / "desktop" / "modern"))
        from main import TKAMainWindow

        main_window = TKAMainWindow(container=container)
        main_window.show()
        main_window.resize(1200, 800)
        print("✅ [GRAPH_EDITOR_TEST] Main window shown")

        # Wait for UI to initialize
        app.processEvents()
        time.sleep(3)
        app.processEvents()

        # Find construct tab - try multiple approaches
        construct_tab = None
        tab_widget = None

        # Try to find tab widget
        for attr_name in ["_tab_widget", "tab_widget", "tabs"]:
            if hasattr(main_window, attr_name):
                tab_widget = getattr(main_window, attr_name)
                print(f"✅ [GRAPH_EDITOR_TEST] Found tab widget: {attr_name}")
                break

        if tab_widget:
            for i in range(tab_widget.count()):
                widget = tab_widget.widget(i)
                tab_text = tab_widget.tabText(i)
                print(
                    f"🔍 [GRAPH_EDITOR_TEST] Tab {i}: {tab_text}, widget: {type(widget).__name__}"
                )

                # Look for construct/sequence builder tab
                if (
                    "construct" in tab_text.lower()
                    or "sequence" in tab_text.lower()
                    or hasattr(widget, "_workbench")
                ):
                    construct_tab = widget
                    tab_widget.setCurrentIndex(i)
                    print(f"✅ [GRAPH_EDITOR_TEST] Found construct tab at index {i}")
                    break

        if not construct_tab:
            print("❌ [GRAPH_EDITOR_TEST] Could not find construct tab")
            print(
                f"🔍 [GRAPH_EDITOR_TEST] Main window attributes: {[attr for attr in dir(main_window) if not attr.startswith('_')]}"
            )
            return False

        print("✅ [GRAPH_EDITOR_TEST] Found construct tab")

        # Get workbench - try multiple attribute names
        workbench = None
        for attr_name in ["_workbench", "workbench"]:
            if hasattr(construct_tab, attr_name):
                workbench = getattr(construct_tab, attr_name)
                print(f"✅ [GRAPH_EDITOR_TEST] Found workbench via: {attr_name}")
                break

        if not workbench:
            print("❌ [GRAPH_EDITOR_TEST] Could not find workbench")
            print(
                f"🔍 [GRAPH_EDITOR_TEST] Construct tab attributes: {[attr for attr in dir(construct_tab) if not attr.startswith('__')]}"
            )
            return False

        print("✅ [GRAPH_EDITOR_TEST] Found workbench")

        # Get beat frame section
        beat_frame_section = getattr(workbench, "_beat_frame_section", None)
        if not beat_frame_section:
            print("❌ [GRAPH_EDITOR_TEST] Could not find beat frame section")
            return False

        print("✅ [GRAPH_EDITOR_TEST] Found beat frame section")

        # Get button panel
        button_panel = getattr(beat_frame_section, "_button_panel", None)
        if not button_panel:
            print("❌ [GRAPH_EDITOR_TEST] Could not find button panel")
            return False

        print("✅ [GRAPH_EDITOR_TEST] Found button panel")

        # Find the edit/construct toggle button
        edit_button = None
        if hasattr(button_panel, "_buttons"):
            edit_button = button_panel._buttons.get("edit_construct_toggle")

        if not edit_button:
            print("❌ [GRAPH_EDITOR_TEST] Could not find edit/construct toggle button")
            print(
                f"🔍 [GRAPH_EDITOR_TEST] Available buttons: {list(button_panel._buttons.keys()) if hasattr(button_panel, '_buttons') else 'No _buttons attribute'}"
            )
            return False

        print("✅ [GRAPH_EDITOR_TEST] Found edit/construct toggle button")

        # Add some beats first to have something to edit
        print("🎯 [GRAPH_EDITOR_TEST] Adding beats first...")

        # Get option picker and add a beat
        option_picker = getattr(workbench, "_option_picker", None)
        if option_picker and hasattr(option_picker, "widget"):
            from presentation.components.option_picker.components.frames.clickable_pictograph_frame import (
                ClickablePictographFrame,
            )

            frames = option_picker.widget.findChildren(ClickablePictographFrame)

            if frames and len(frames) >= 1:
                print(
                    "🎯 [GRAPH_EDITOR_TEST] Clicking option picker frame to add beat..."
                )
                QTest.mouseClick(frames[0], Qt.MouseButton.LeftButton)
                app.processEvents()
                time.sleep(1)
                print("✅ [GRAPH_EDITOR_TEST] Added beat via option picker")
            else:
                print(
                    "⚠️ [GRAPH_EDITOR_TEST] No option picker frames found, proceeding anyway..."
                )

        # Now try clicking the graph editor button
        print("🎯 [GRAPH_EDITOR_TEST] Clicking edit/construct toggle button...")
        try:
            QTest.mouseClick(edit_button, Qt.MouseButton.LeftButton)
            app.processEvents()
            time.sleep(2)
            app.processEvents()
            print("✅ [GRAPH_EDITOR_TEST] Edit/construct button clicked successfully!")

            # Try clicking it again to toggle back
            print("🎯 [GRAPH_EDITOR_TEST] Clicking button again to toggle back...")
            QTest.mouseClick(edit_button, Qt.MouseButton.LeftButton)
            app.processEvents()
            time.sleep(2)
            app.processEvents()
            print("✅ [GRAPH_EDITOR_TEST] Button toggled back successfully!")

            return True

        except Exception as e:
            print(f"❌ [GRAPH_EDITOR_TEST] Error clicking edit/construct button: {e}")
            import traceback

            traceback.print_exc()
            return False

    except Exception as e:
        print(f"❌ [GRAPH_EDITOR_TEST] Error: {e}")
        import traceback

        traceback.print_exc()
        return False

    finally:
        # Clean up
        if "app" in locals():
            app.quit()


if __name__ == "__main__":
    success = test_graph_editor_button_crash()
    sys.exit(0 if success else 1)
