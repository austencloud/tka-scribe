# Enhanced UI Tester Plan - Bite-Sized Chunks

## Chunk 1: Basic Button Testing Framework (Week 1)

### File to Create: `src/core/testing/ui_component_tester.py`

```python
"""
UI Component Testing Framework for TKA Modern Application - CHUNK 1

Simple testing of workbench buttons with legacy analysis guidance.
When a button fails, provides clear instructions to read legacy equivalent.
"""

import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from PyQt6.QtWidgets import QApplication, QPushButton

from core.application.application_factory import ApplicationFactory

logger = logging.getLogger(__name__)

@dataclass
class UITestResult:
    """Result of UI component test."""
    component_name: str
    test_name: str
    success: bool
    errors: List[str]
    execution_time: float
    legacy_guidance: Optional[str] = None

class UIComponentTester:
    """Simple UI component tester with legacy analysis guidance."""

    def __init__(self, use_headless_mode: bool = False):
        self.use_headless_mode = use_headless_mode
        self.container = ApplicationFactory.create_test_app()
        self.test_results: List[UITestResult] = []
        self.current_workbench = None

        # Initialize QApplication
        self.app = QApplication.instance()
        if self.app is None:
            self.app = QApplication([])

        # Legacy file mappings for when buttons fail
        self.legacy_guidance = {
            "add_to_dictionary": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/add_to_dictionary_manager/add_to_dictionary_manager.py → Method: add_to_dictionary()",
            "save_image": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_workbench.py → Method: save_image()",
            "view_fullscreen": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/full_screen_viewer.py → Method: show_fullscreen()",
            "mirror_sequence": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_reflector.py → Method: reflect_sequence()",
            "swap_colors": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_color_swapper.py → Method: swap_colors()",
            "rotate_sequence": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_rotater.py → Method: rotate_sequence()",
            "copy_json": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_workbench.py → Method: copy_sequence_json()",
            "delete_beat": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/beat_deleter/beat_deleter.py → Method: delete_beat()",
            "clear_sequence": "📁 Legacy: F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/beat_deleter/beat_deleter.py → Method: reset_widgets()",
        }

    def setup_test_environment(self) -> bool:
        """Set up test environment."""
        try:
            print("🔧 Setting up test environment...")
            self._initialize_components()
            print("✅ Test environment setup complete")
            return True
        except Exception as e:
            print(f"❌ Failed to setup test environment: {e}")
            return False

    def _initialize_components(self):
        """Initialize UI components."""
        from core.interfaces.workbench_services import (
            ISequenceWorkbenchService,
            IFullScreenService,
            IBeatDeletionService,
            IGraphEditorService,
            IDictionaryService,
        )
        from core.interfaces.core_services import ILayoutService

        # Resolve services
        layout_service = self.container.resolve(ILayoutService)
        workbench_service = self.container.resolve(ISequenceWorkbenchService)
        fullscreen_service = self.container.resolve(IFullScreenService)
        deletion_service = self.container.resolve(IBeatDeletionService)
        graph_service = self.container.resolve(IGraphEditorService)
        dictionary_service = self.container.resolve(IDictionaryService)

        # Create workbench
        from presentation.components.workbench.workbench import SequenceWorkbench
        self.current_workbench = SequenceWorkbench(
            layout_service=layout_service,
            workbench_service=workbench_service,
            fullscreen_service=fullscreen_service,
            deletion_service=deletion_service,
            graph_service=graph_service,
            dictionary_service=dictionary_service,
        )

        # Show if not headless
        if not self.use_headless_mode:
            self.current_workbench.show()

    def test_single_button(self, button_name: str) -> UITestResult:
        """Test a single workbench button."""
        start_time = time.time()

        print(f"\n🧪 Testing button: {button_name}")

        try:
            # Try to execute the button's functionality
            if button_name == "add_to_dictionary":
                success = self._test_add_to_dictionary()
            elif button_name == "save_image":
                success = self._test_save_image()
            elif button_name == "view_fullscreen":
                success = self._test_view_fullscreen()
            elif button_name == "mirror_sequence":
                success = self._test_mirror_sequence()
            elif button_name == "swap_colors":
                success = self._test_swap_colors()
            elif button_name == "rotate_sequence":
                success = self._test_rotate_sequence()
            elif button_name == "copy_json":
                success = self._test_copy_json()
            elif button_name == "delete_beat":
                success = self._test_delete_beat()
            elif button_name == "clear_sequence":
                success = self._test_clear_sequence()
            else:
                success = False

            if success:
                print(f"✅ Button {button_name} working correctly")
                return UITestResult(
                    component_name="workbench",
                    test_name=button_name,
                    success=True,
                    errors=[],
                    execution_time=time.time() - start_time
                )
            else:
                print(f"❌ Button {button_name} failed")
                self._print_legacy_guidance(button_name)
                return UITestResult(
                    component_name="workbench",
                    test_name=button_name,
                    success=False,
                    errors=["Button functionality not working"],
                    execution_time=time.time() - start_time,
                    legacy_guidance=self.legacy_guidance.get(button_name, "No legacy guidance available")
                )

        except Exception as e:
            print(f"❌ Button {button_name} threw exception: {e}")
            self._print_legacy_guidance(button_name)
            return UITestResult(
                component_name="workbench",
                test_name=button_name,
                success=False,
                errors=[str(e)],
                execution_time=time.time() - start_time,
                legacy_guidance=self.legacy_guidance.get(button_name, "No legacy guidance available")
            )

    def _print_legacy_guidance(self, button_name: str):
        """Print guidance for AI agent when button fails."""
        print(f"┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓")
        print(f"┃ 🤖 AI AGENT: Button '{button_name}' failed - Please implement missing functionality")
        print(f"┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛")
        print(f"")
        guidance = self.legacy_guidance.get(button_name, "No legacy guidance available")
        print(f"📋 INSTRUCTIONS:")
        print(f"   1. Read the legacy file and understand the functionality")
        print(f"   2. Implement the missing functionality in the modern version")
        print(f"   3. Re-run this test to verify it works")
        print(f"")
        print(f"🔍 LEGACY REFERENCE:")
        print(f"   {guidance}")
        print(f"")

    # Simple button test methods
    def _test_add_to_dictionary(self) -> bool:
        """Test add to dictionary button."""
        try:
            self.current_workbench._handle_add_to_dictionary()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_save_image(self) -> bool:
        """Test save image button."""
        try:
            self.current_workbench._handle_save_image()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_view_fullscreen(self) -> bool:
        """Test view fullscreen button."""
        try:
            self.current_workbench._handle_fullscreen()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_mirror_sequence(self) -> bool:
        """Test mirror sequence button."""
        try:
            self.current_workbench._handle_reflection()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_swap_colors(self) -> bool:
        """Test swap colors button."""
        try:
            self.current_workbench._handle_color_swap()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_rotate_sequence(self) -> bool:
        """Test rotate sequence button."""
        try:
            self.current_workbench._handle_rotation()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_copy_json(self) -> bool:
        """Test copy JSON button."""
        try:
            self.current_workbench._handle_copy_json()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_delete_beat(self) -> bool:
        """Test delete beat button."""
        try:
            self.current_workbench._handle_delete_beat()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False

    def _test_clear_sequence(self) -> bool:
        """Test clear sequence button."""
        try:
            self.current_workbench._handle_clear()
            return True
        except Exception as e:
            print(f"   Error: {e}")
            return False
```

## Chunk 2: Simple CLI (Week 1)

### File to Create: `src/core/testing/simple_ui_cli.py`

```python
"""
Simple CLI for UI Component Testing
"""

import argparse
import sys
from .ui_component_tester import UIComponentTester

def main():
    parser = argparse.ArgumentParser(description="TKA UI Component Testing CLI")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode")
    parser.add_argument("--button", help="Test specific button")
    parser.add_argument("--all", action="store_true", help="Test all buttons")

    args = parser.parse_args()

    # Initialize tester
    tester = UIComponentTester(use_headless_mode=args.headless)

    if not tester.setup_test_environment():
        print("❌ Failed to setup test environment")
        sys.exit(1)

    if args.button:
        # Test single button
        result = tester.test_single_button(args.button)
        print(f"\n{'='*60}")
        print(f"RESULT: {'✅ PASS' if result.success else '❌ FAIL'}")
        print(f"{'='*60}")
        sys.exit(0 if result.success else 1)

    elif args.all:
        # Test all buttons
        buttons = [
            "add_to_dictionary", "save_image", "view_fullscreen",
            "mirror_sequence", "swap_colors", "rotate_sequence",
            "copy_json", "delete_beat", "clear_sequence"
        ]

        results = []
        for button in buttons:
            result = tester.test_single_button(button)
            results.append(result)

        # Print summary
        passed = sum(1 for r in results if r.success)
        total = len(results)

        print(f"\n{'='*60}")
        print(f"SUMMARY: {passed}/{total} buttons working")
        print(f"{'='*60}")

        for result in results:
            status = "✅" if result.success else "❌"
            print(f"{status} {result.test_name}")

        sys.exit(0 if passed == total else 1)

    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Usage (Simple & Focused)

```bash
# Test one button at a time
python -m core.testing.simple_ui_cli --button add_to_dictionary
python -m core.testing.simple_ui_cli --button save_image

# Test all buttons
python -m core.testing.simple_ui_cli --all

# Run in headless mode
python -m core.testing.simple_ui_cli --headless --button mirror_sequence
```
