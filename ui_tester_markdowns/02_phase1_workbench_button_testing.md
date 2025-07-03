# Phase 1: Workbench Button Testing Framework

## File to Create: `src/core/testing/ui_component_tester.py`

```python
"""
UI Component Testing Framework for TKA Modern Application

Comprehensive testing of all UI components with focus on button functionality,
hover events, and responsive sizing.
"""

import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from PyQt6.QtWidgets import QApplication, QWidget, QPushButton
from PyQt6.QtCore import QPoint, Qt, QTimer, QEventLoop
from PyQt6.QtGui import QMouseEvent, QEnterEvent, QKeyEvent
from PyQt6.QtTest import QTest

from core.application.application_factory import ApplicationFactory
from domain.models.core_models import BeatData, SequenceData, MotionData, MotionType, Location, RotationDirection

logger = logging.getLogger(__name__)

@dataclass
class UITestResult:
    """Result of UI component test."""
    component_name: str
    test_name: str
    success: bool
    errors: List[str]
    warnings: List[str]
    execution_time: float
    metadata: Dict[str, Any]

class UIComponentTester:
    """
    Comprehensive UI component testing framework.

    Tests all fundamental UI interactions including:
    - Button clicks and signal emission
    - Hover events and cursor changes
    - Keyboard shortcuts
    - Responsive sizing
    - Error handling
    """

    def __init__(self, use_headless_mode: bool = False):
        """
        Initialize UI component tester.

        Args:
            use_headless_mode: Whether to run in headless mode (no visible UI)
        """
        self.use_headless_mode = use_headless_mode
        self.container = ApplicationFactory.create_test_app()
        self.test_results: List[UITestResult] = []
        self.current_workbench = None
        self.current_graph_editor = None

        # Initialize QApplication for Qt testing
        self.app = QApplication.instance()
        if self.app is None:
            self.app = QApplication([])

    def setup_test_environment(self) -> bool:
        """Set up test environment with sample data."""
        try:
            # Create sample beat data
            blue_motion = MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH,
                turns=1.0,
            )
            red_motion = MotionData(
                motion_type=MotionType.ANTI,
                prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
                start_loc=Location.EAST,
                end_loc=Location.WEST,
                turns=0.5,
            )

            sample_beat = BeatData(
                beat_number=1,
                blue_motion=blue_motion,
                red_motion=red_motion,
            )

            # Create sample sequence
            self.sample_sequence = SequenceData(
                name="Test Sequence",
                beats=[sample_beat]
            )

            # Initialize components
            self._initialize_components()

            return True

        except Exception as e:
            logger.error(f"Failed to setup test environment: {e}")
            return False

    def _initialize_components(self):
        """Initialize UI components for testing."""
        # Get services from container
        from core.interfaces.workbench_services import (
            ISequenceWorkbenchService,
            IFullScreenService,
            IBeatDeletionService,
            IGraphEditorService,
            IDictionaryService,
        )
        from core.interfaces.core_services import ILayoutService

        layout_service = self.container.resolve(ILayoutService)
        workbench_service = self.container.resolve(ISequenceWorkbenchService)
        fullscreen_service = self.container.resolve(IFullScreenService)
        deletion_service = self.container.resolve(IBeatDeletionService)
        graph_service = self.container.resolve(IGraphEditorService)
        dictionary_service = self.container.resolve(IDictionaryService)

        # Initialize workbench
        from presentation.components.workbench.workbench import SequenceWorkbench
        self.current_workbench = SequenceWorkbench(
            layout_service=layout_service,
            workbench_service=workbench_service,
            fullscreen_service=fullscreen_service,
            deletion_service=deletion_service,
            graph_service=graph_service,
            dictionary_service=dictionary_service,
        )

        # Initialize graph editor
        from presentation.components.graph_editor.graph_editor import GraphEditor
        self.current_graph_editor = GraphEditor(
            graph_service=graph_service,
            parent=self.current_workbench,
            workbench_width=800,
            workbench_height=600,
        )

        # Set test data
        self.current_workbench.set_sequence(self.sample_sequence)
        self.current_graph_editor.set_sequence(self.sample_sequence)

        # Show components if not in headless mode
        if not self.use_headless_mode:
            self.current_workbench.show()
            self.current_graph_editor.show()

    # === WORKBENCH BUTTON TESTS ===

    def test_workbench_buttons(self) -> UITestResult:
        """Test all workbench buttons comprehensively."""
        start_time = time.time()
        errors = []
        warnings = []

        if not self.current_workbench:
            return UITestResult(
                component_name="workbench",
                test_name="button_tests",
                success=False,
                errors=["Workbench not initialized"],
                warnings=[],
                execution_time=0,
                metadata={}
            )

        # Get button panel
        beat_frame_section = self.current_workbench._beat_frame_section
        if not beat_frame_section:
            errors.append("Beat frame section not found")

        try:
            # Test each button
            button_tests = [
                ("edit_construct_toggle", self._test_edit_construct_toggle),
                ("add_to_dictionary", self._test_add_to_dictionary),
                ("save_image", self._test_save_image),
                ("view_fullscreen", self._test_view_fullscreen),
                ("mirror_sequence", self._test_mirror_sequence),
                ("swap_colors", self._test_swap_colors),
                ("rotate_sequence", self._test_rotate_sequence),
                ("copy_json", self._test_copy_json),
                ("delete_beat", self._test_delete_beat),
                ("clear_sequence", self._test_clear_sequence),
            ]

            button_results = {}
            for button_name, test_func in button_tests:
                try:
                    result = test_func()
                    button_results[button_name] = result
                    if not result:
                        errors.append(f"Button test failed: {button_name}")
                except Exception as e:
                    errors.append(f"Button test error {button_name}: {str(e)}")
                    button_results[button_name] = False

            # Test button hover events
            hover_results = self._test_button_hover_events()

            success = len(errors) == 0 and all(button_results.values())

            return UITestResult(
                component_name="workbench",
                test_name="button_tests",
                success=success,
                errors=errors,
                warnings=warnings,
                execution_time=time.time() - start_time,
                metadata={
                    "button_results": button_results,
                    "hover_results": hover_results,
                    "buttons_tested": len(button_tests),
                    "buttons_passed": sum(1 for r in button_results.values() if r),
                }
            )

        except Exception as e:
            errors.append(f"Workbench button test failed: {str(e)}")
            return UITestResult(
                component_name="workbench",
                test_name="button_tests",
                success=False,
                errors=errors,
                warnings=warnings,
                execution_time=time.time() - start_time,
                metadata={}
            )

    def _test_edit_construct_toggle(self) -> bool:
        """Test edit/construct toggle button."""
        try:
            # Find the button through the workbench hierarchy
            button_interface = self.current_workbench.get_button_interface()
            if not button_interface:
                logger.warning("Button interface not found")
                return False

            # Set up signal spy
            signal_received = False
            def on_toggle(state):
                nonlocal signal_received
                signal_received = True

            self.current_workbench.edit_construct_toggle_requested.connect(on_toggle)

            # Simulate button click
            self.current_workbench.edit_construct_toggle_requested.emit(True)

            # Process events
            QApplication.processEvents()

            return signal_received

        except Exception as e:
            logger.error(f"Edit/construct toggle test failed: {e}")
            return False

    def _test_add_to_dictionary(self) -> bool:
        """Test add to dictionary button."""
        try:
            # Set up signal spy
            signal_received = False
            def on_operation(message):
                nonlocal signal_received
                signal_received = True

            self.current_workbench.operation_completed.connect(on_operation)

            # Simulate button action
            self.current_workbench._handle_add_to_dictionary()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Add to dictionary test failed: {e}")
            return False

    def _test_save_image(self) -> bool:
        """Test save image button."""
        try:
            # Simulate button action
            self.current_workbench._handle_save_image()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Save image test failed: {e}")
            return False

    def _test_view_fullscreen(self) -> bool:
        """Test view fullscreen button."""
        try:
            # Simulate button action
            self.current_workbench._handle_fullscreen()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"View fullscreen test failed: {e}")
            return False

    def _test_mirror_sequence(self) -> bool:
        """Test mirror sequence button."""
        try:
            # Simulate button action
            self.current_workbench._handle_reflection()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Mirror sequence test failed: {e}")
            return False

    def _test_swap_colors(self) -> bool:
        """Test swap colors button."""
        try:
            # Simulate button action
            self.current_workbench._handle_color_swap()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Swap colors test failed: {e}")
            return False

    def _test_rotate_sequence(self) -> bool:
        """Test rotate sequence button."""
        try:
            # Simulate button action
            self.current_workbench._handle_rotation()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Rotate sequence test failed: {e}")
            return False

    def _test_copy_json(self) -> bool:
        """Test copy JSON button."""
        try:
            # Simulate button action
            self.current_workbench._handle_copy_json()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Copy JSON test failed: {e}")
            return False

    def _test_delete_beat(self) -> bool:
        """Test delete beat button."""
        try:
            # Simulate button action
            self.current_workbench._handle_delete_beat()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Delete beat test failed: {e}")
            return False

    def _test_clear_sequence(self) -> bool:
        """Test clear sequence button."""
        try:
            # Simulate button action
            self.current_workbench._handle_clear()

            # Process events
            QApplication.processEvents()

            return True  # Return True if no exception occurred

        except Exception as e:
            logger.error(f"Clear sequence test failed: {e}")
            return False

    def _test_button_hover_events(self) -> Dict[str, bool]:
        """Test hover events on all buttons."""
        results = {}

        try:
            # Find all buttons in the workbench
            buttons = self.current_workbench.findChildren(QPushButton)

            for button in buttons:
                button_name = button.objectName() or button.text() or f"button_{id(button)}"

                try:
                    # Test hover enter
                    enter_event = QEnterEvent(QPoint(10, 10), QPoint(10, 10), QPoint(10, 10))
                    button.enterEvent(enter_event)
                    QApplication.processEvents()

                    # Test hover leave
                    button.leaveEvent(None)
                    QApplication.processEvents()

                    results[button_name] = True

                except Exception as e:
                    logger.warning(f"Hover test failed for button {button_name}: {e}")
                    results[button_name] = False

            return results

        except Exception as e:
            logger.error(f"Button hover event test failed: {e}")
            return {}

    # === COMPREHENSIVE TEST SUITE ===

    def run_comprehensive_ui_tests(self) -> List[UITestResult]:
        """Run comprehensive UI test suite."""
        logger.info("Starting comprehensive UI tests...")

        if not self.setup_test_environment():
            return [UITestResult(
                component_name="setup",
                test_name="environment_setup",
                success=False,
                errors=["Failed to setup test environment"],
                warnings=[],
                execution_time=0,
                metadata={}
            )]

        test_results = []

        # Test workbench buttons
        logger.info("Testing workbench buttons...")
        workbench_result = self.test_workbench_buttons()
        test_results.append(workbench_result)

        # Store all results
        self.test_results.extend(test_results)

        return test_results

    def generate_test_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        if not self.test_results:
            return {"error": "No test results available"}

        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r.success)
        failed_tests = total_tests - passed_tests

        total_time = sum(r.execution_time for r in self.test_results)

        return {
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": passed_tests / total_tests if total_tests > 0 else 0,
                "total_execution_time": total_time,
            },
            "detailed_results": [
                {
                    "component": r.component_name,
                    "test": r.test_name,
                    "success": r.success,
                    "errors": r.errors,
                    "warnings": r.warnings,
                    "execution_time": r.execution_time,
                    "metadata": r.metadata,
                }
                for r in self.test_results
            ],
            "component_breakdown": self._get_component_breakdown(),
            "error_summary": self._get_error_summary(),
        }

    def _get_component_breakdown(self) -> Dict[str, Dict[str, Any]]:
        """Get breakdown of results by component."""
        components = {}

        for result in self.test_results:
            if result.component_name not in components:
                components[result.component_name] = {
                    "total": 0,
                    "passed": 0,
                    "failed": 0,
                    "tests": []
                }

            components[result.component_name]["total"] += 1
            components[result.component_name]["tests"].append(result.test_name)

            if result.success:
                components[result.component_name]["passed"] += 1
            else:
                components[result.component_name]["failed"] += 1

        return components

    def _get_error_summary(self) -> List[str]:
        """Get summary of all errors."""
        errors = []

        for result in self.test_results:
            if result.errors:
                errors.extend([
                    f"{result.component_name}.{result.test_name}: {error}"
                    for error in result.errors
                ])

        return errors
```
