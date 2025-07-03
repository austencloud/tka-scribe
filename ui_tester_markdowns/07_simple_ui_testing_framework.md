# Simple UI Testing Framework - Bite-Sized Chunks

## Chunk 1: Basic Test Infrastructure

### File: `src/core/testing/simple_ui_tester.py`

```python
"""
Simple UI Testing Framework - Chunk 1: Basic Infrastructure

Tests UI components and provides clear console guidance for AI agents.
Uses existing current_sequence.json and SequenceDataConverter.
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional
from PyQt6.QtWidgets import QApplication

from core.application.application_factory import ApplicationFactory
from application.services.data.sequence_data_converter import SequenceDataConverter

logger = logging.getLogger(__name__)

class SimpleUITester:
    """Simple UI testing with rich console output for AI agents."""

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.container = ApplicationFactory.create_test_app()
        self.converter = SequenceDataConverter()

        # Load real sequence data
        self.current_sequence_path = Path("current_sequence.json")
        self.sample_sequence_data = self._load_real_sequence_data()

        # Initialize QApplication
        self.app = QApplication.instance()
        if self.app is None:
            self.app = QApplication([])

        # Components (will be initialized in setup)
        self.workbench = None
        self.graph_editor = None

    def _load_real_sequence_data(self) -> List[Dict]:
        """Load the real current_sequence.json data."""
        try:
            if self.current_sequence_path.exists():
                with open(self.current_sequence_path, 'r') as f:
                    data = json.load(f)
                print(f"✅ Loaded real sequence data: {len(data)-1} beats")
                return data
            else:
                print(f"⚠️  current_sequence.json not found, using minimal data")
                return self._create_minimal_sequence()
        except Exception as e:
            print(f"❌ Error loading sequence data: {e}")
            return self._create_minimal_sequence()

    def _create_minimal_sequence(self) -> List[Dict]:
        """Create minimal sequence data if file not found."""
        return [
            {"word": "TEST", "author": "tester", "level": 1, "prop_type": "staff"},
            {
                "beat": 0, "sequence_start_position": "alpha", "letter": "α",
                "blue_attributes": {"start_loc": "s", "end_loc": "s", "motion_type": "static"},
                "red_attributes": {"start_loc": "n", "end_loc": "n", "motion_type": "static"}
            }
        ]

    def setup_test_environment(self) -> bool:
        """Set up test environment with real data."""
        try:
            print("🔧 Setting up test environment with real sequence data...")

            # Convert legacy data to modern using existing converter
            modern_beats = []
            start_position_beat = None

            for i, beat_dict in enumerate(self.sample_sequence_data[1:], 1):  # Skip metadata [0]
                if "sequence_start_position" in beat_dict:
                    start_position_beat = self.converter.convert_legacy_start_position_to_beat_data(beat_dict)
                else:
                    modern_beat = self.converter.convert_legacy_to_beat_data(beat_dict, i)
                    modern_beats.append(modern_beat)

            # Initialize components with real data
            self._initialize_components_with_data(modern_beats, start_position_beat)

            print("✅ Test environment ready with real sequence data")
            return True

        except Exception as e:
            print(f"❌ Failed to setup test environment: {e}")
            return False

    def _initialize_components_with_data(self, beats, start_position):
        """Initialize UI components with real sequence data."""
        # This will be implemented in Chunk 2
        print("📋 Component initialization deferred to Chunk 2")
        pass
```

## Chunk 2: Component Initialization

### File: `src/core/testing/component_initializer.py`

```python
"""
Simple UI Testing Framework - Chunk 2: Component Initialization

Initializes workbench and graph editor with real data.
"""

from typing import List, Optional
from domain.models.core_models import BeatData, SequenceData

class ComponentInitializer:
    """Handles initialization of UI components for testing."""

    @staticmethod
    def initialize_workbench_and_graph_editor(container, beats: List[BeatData], start_position: Optional[BeatData]):
        """Initialize workbench and graph editor with real data."""

        # Create modern SequenceData from real beats
        if beats:
            sequence_data = SequenceData(
                name="Test Sequence",
                word="TEST",
                beats=beats,
                metadata={"level": 1, "prop_type": "staff"}
            )
        else:
            sequence_data = SequenceData.empty()

        # Get services from container
        from core.interfaces.workbench_services import (
            ISequenceWorkbenchService, IFullScreenService, IBeatDeletionService,
            IGraphEditorService, IDictionaryService
        )
        from core.interfaces.core_services import ILayoutService

        layout_service = container.resolve(ILayoutService)
        workbench_service = container.resolve(ISequenceWorkbenchService)
        fullscreen_service = container.resolve(IFullScreenService)
        deletion_service = container.resolve(IBeatDeletionService)
        graph_service = container.resolve(IGraphEditorService)
        dictionary_service = container.resolve(IDictionaryService)

        # Create workbench
        from presentation.components.workbench.workbench import SequenceWorkbench
        workbench = SequenceWorkbench(
            layout_service=layout_service,
            workbench_service=workbench_service,
            fullscreen_service=fullscreen_service,
            deletion_service=deletion_service,
            graph_service=graph_service,
            dictionary_service=dictionary_service,
        )

        # Create graph editor
        from presentation.components.graph_editor.graph_editor import GraphEditor
        graph_editor = GraphEditor(
            graph_service=graph_service,
            parent=workbench,
            workbench_width=800,
            workbench_height=600,
        )

        # Set real data
        workbench.set_sequence(sequence_data)
        if start_position:
            workbench.set_start_position(start_position)

        graph_editor.set_sequence(sequence_data)
        if start_position:
            graph_editor.set_selected_start_position(start_position)

        print(f"✅ Components initialized with {len(beats)} beats")
        return workbench, graph_editor
```

## Chunk 3: Button Testing with Legacy Guidance

### File: `src/core/testing/button_tester.py`

```python
"""
Simple UI Testing Framework - Chunk 3: Button Testing with Legacy Guidance

Tests buttons and provides clear guidance for AI agents when buttons fail.
"""

class ButtonTester:
    """Tests workbench buttons and provides AI agent guidance."""

    # Legacy guidance mapping
    BUTTON_LEGACY_MAP = {
        "add_to_dictionary": {
            "description": "Add current sequence to dictionary database",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/add_to_dictionary_manager/add_to_dictionary_manager.py",
            "legacy_method": "add_to_dictionary",
            "modern_service": "IDictionaryService",
            "modern_method": "add_sequence_to_dictionary"
        },
        "save_image": {
            "description": "Save sequence as image file",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_workbench.py",
            "legacy_method": "save_image",
            "modern_service": "IImageExportService",
            "modern_method": "save_sequence_image"
        },
        "view_fullscreen": {
            "description": "Display sequence in fullscreen view",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/full_screen_viewer.py",
            "legacy_method": "show_fullscreen",
            "modern_service": "IFullScreenService",
            "modern_method": "show_fullscreen_view"
        },
        "mirror_sequence": {
            "description": "Mirror/reflect the entire sequence",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_reflector.py",
            "legacy_method": "reflect_sequence",
            "modern_service": "ISequenceTransformService",
            "modern_method": "mirror_sequence"
        },
        "swap_colors": {
            "description": "Swap blue and red colors in sequence",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_color_swapper.py",
            "legacy_method": "swap_colors",
            "modern_service": "ISequenceTransformService",
            "modern_method": "swap_colors"
        },
        "rotate_sequence": {
            "description": "Rotate the entire sequence",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_rotater.py",
            "legacy_method": "rotate_sequence",
            "modern_service": "ISequenceTransformService",
            "modern_method": "rotate_sequence"
        },
        "copy_json": {
            "description": "Copy sequence JSON to clipboard",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/sequence_workbench.py",
            "legacy_method": "copy_sequence_json",
            "modern_service": "ISequenceDataService",
            "modern_method": "copy_sequence_json"
        },
        "delete_beat": {
            "description": "Delete selected beat from sequence",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/beat_deleter/beat_deleter.py",
            "legacy_method": "delete_beat",
            "modern_service": "IBeatDeletionService",
            "modern_method": "delete_beat"
        },
        "clear_sequence": {
            "description": "Clear entire sequence",
            "legacy_file": "F:/CODE/TKA/src/desktop/legacy/src/main_window/main_widget/sequence_workbench/beat_deleter/beat_deleter.py",
            "legacy_method": "reset_widgets",
            "modern_service": "IBeatDeletionService",
            "modern_method": "clear_sequence"
        }
    }

    @staticmethod
    def test_button(workbench, button_name: str) -> bool:
        """Test a specific button and print results."""
        print(f"\n🧪 Testing button: {button_name}")

        try:
            # Try to call the button functionality
            if button_name == "add_to_dictionary":
                workbench._handle_add_to_dictionary()
            elif button_name == "save_image":
                workbench._handle_save_image()
            elif button_name == "view_fullscreen":
                workbench._handle_fullscreen()
            elif button_name == "mirror_sequence":
                workbench._handle_reflection()
            elif button_name == "swap_colors":
                workbench._handle_color_swap()
            elif button_name == "rotate_sequence":
                workbench._handle_rotation()
            elif button_name == "copy_json":
                workbench._handle_copy_json()
            elif button_name == "delete_beat":
                workbench._handle_delete_beat()
            elif button_name == "clear_sequence":
                workbench._handle_clear()
            else:
                print(f"❌ Unknown button: {button_name}")
                return False

            print(f"✅ Button {button_name} executed without errors")
            return True

        except Exception as e:
            print(f"❌ Button {button_name} failed: {e}")
            ButtonTester._print_ai_guidance(button_name)
            return False

    @staticmethod
    def _print_ai_guidance(button_name: str):
        """Print detailed guidance for AI agent."""
        if button_name not in ButtonTester.BUTTON_LEGACY_MAP:
            print(f"❌ No guidance available for {button_name}")
            return

        guidance = ButtonTester.BUTTON_LEGACY_MAP[button_name]

        print(f"\n{'='*80}")
        print(f"🤖 AI AGENT: BUTTON {button_name.upper()} NEEDS IMPLEMENTATION")
        print(f"{'='*80}")
        print(f"📝 What it should do: {guidance['description']}")
        print(f"📁 Legacy file to read: {guidance['legacy_file']}")
        print(f"🔧 Legacy method to study: {guidance['legacy_method']}")
        print(f"🎯 Modern service to implement: {guidance['modern_service']}")
        print(f"🔧 Modern method to create: {guidance['modern_method']}")
        print(f"\n📋 AI INSTRUCTIONS:")
        print(f"1. Open and read: {guidance['legacy_file']}")
        print(f"2. Find method: {guidance['legacy_method']}")
        print(f"3. Understand the logic and dependencies")
        print(f"4. Create/update service: {guidance['modern_service']}")
        print(f"5. Implement method: {guidance['modern_method']}")
        print(f"6. Re-run this test to verify")
        print(f"{'='*80}\n")
```

## Chunk 4: CLI Interface

### File: `src/core/testing/ui_test_cli.py`

```python
"""
Simple UI Testing Framework - Chunk 4: CLI Interface

Command line interface for running tests.
"""

import argparse
import sys
from .simple_ui_tester import SimpleUITester
from .component_initializer import ComponentInitializer
from .button_tester import ButtonTester

def main():
    parser = argparse.ArgumentParser(description="Simple UI Component Testing")
    parser.add_argument("--button", help="Test specific button")
    parser.add_argument("--all-buttons", action="store_true", help="Test all buttons")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")

    args = parser.parse_args()

    # Initialize tester
    print("🚀 Starting Simple UI Tester...")
    tester = SimpleUITester(headless=True)

    if not tester.setup_test_environment():
        print("❌ Failed to setup test environment")
        sys.exit(1)

    # Initialize components using Chunk 2
    workbench, graph_editor = ComponentInitializer.initialize_workbench_and_graph_editor(
        tester.container,
        [], # Will use real data from setup
        None
    )

    if args.button:
        # Test specific button using Chunk 3
        success = ButtonTester.test_button(workbench, args.button)
        sys.exit(0 if success else 1)

    elif args.all_buttons:
        # Test all buttons
        buttons = list(ButtonTester.BUTTON_LEGACY_MAP.keys())
        results = {}

        for button_name in buttons:
            results[button_name] = ButtonTester.test_button(workbench, button_name)

        # Print summary
        total = len(results)
        passed = sum(results.values())
        failed = total - passed

        print(f"\n{'='*50}")
        print(f"SUMMARY: {passed}/{total} buttons working")
        print(f"Passed: {passed}, Failed: {failed}")

        if failed > 0:
            print(f"\n❌ Failed buttons:")
            for name, success in results.items():
                if not success:
                    print(f"  - {name}")

        sys.exit(0 if failed == 0 else 1)

    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
```

## Usage Examples (Bite-Sized)

```bash
# Test one specific button
python -m core.testing.ui_test_cli --button add_to_dictionary

# Test all buttons and see which ones need implementation
python -m core.testing.ui_test_cli --all-buttons

# Verbose output
python -m core.testing.ui_test_cli --all-buttons --verbose
```

## AI Agent Workflow

1. **Run test**: `python -m core.testing.ui_test_cli --button add_to_dictionary`
2. **Read console output** that tells you exactly which legacy file to read
3. **Open legacy file** and study the implementation
4. **Implement missing functionality** in the modern service
5. **Re-run test** to verify it works
6. **Move to next button**

This breaks down the testing into small, manageable chunks that give your AI agent clear, actionable guidance without overengineering!
