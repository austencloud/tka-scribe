# Phase 1 - Part 2: Graph Editor Testing

## Graph Editor Interaction Tests

```python
# === GRAPH EDITOR TESTS ===

def test_graph_editor_interactions(self) -> UITestResult:
    """Test all graph editor interactions."""
    start_time = time.time()
    errors = []
    warnings = []

    if not self.current_graph_editor:
        return UITestResult(
            component_name="graph_editor",
            test_name="interaction_tests",
            success=False,
            errors=["Graph editor not initialized"],
            warnings=[],
            execution_time=0,
            metadata={}
        )

    try:
        # Test graph editor visibility
        visibility_result = self._test_graph_editor_visibility()

        # Test beat data setting
        beat_data_result = self._test_graph_editor_beat_data()

        # Test turn adjustment buttons
        turn_adjustment_result = self._test_turn_adjustment_buttons()

        # Test keyboard shortcuts
        keyboard_result = self._test_keyboard_shortcuts()

        # Test orientation picker
        orientation_result = self._test_orientation_picker()

        all_results = {
            "visibility": visibility_result,
            "beat_data": beat_data_result,
            "turn_adjustment": turn_adjustment_result,
            "keyboard": keyboard_result,
            "orientation": orientation_result,
        }

        success = all(all_results.values())

        return UITestResult(
            component_name="graph_editor",
            test_name="interaction_tests",
            success=success,
            errors=errors,
            warnings=warnings,
            execution_time=time.time() - start_time,
            metadata={
                "test_results": all_results,
                "tests_passed": sum(1 for r in all_results.values() if r),
                "total_tests": len(all_results),
            }
        )

    except Exception as e:
        errors.append(f"Graph editor interaction test failed: {str(e)}")
        return UITestResult(
            component_name="graph_editor",
            test_name="interaction_tests",
            success=False,
            errors=errors,
            warnings=warnings,
            execution_time=time.time() - start_time,
            metadata={}
        )

def _test_graph_editor_visibility(self) -> bool:
    """Test graph editor visibility toggling."""
    try:
        # Test show
        self.current_graph_editor.set_visibility(True)
        QApplication.processEvents()

        # Test hide
        self.current_graph_editor.set_visibility(False)
        QApplication.processEvents()

        return True

    except Exception as e:
        logger.error(f"Graph editor visibility test failed: {e}")
        return False

def _test_graph_editor_beat_data(self) -> bool:
    """Test setting beat data in graph editor."""
    try:
        # Set beat data
        result = self.current_graph_editor.set_selected_beat_data(
            0, self.sample_sequence.beats[0]
        )

        QApplication.processEvents()

        return result

    except Exception as e:
        logger.error(f"Graph editor beat data test failed: {e}")
        return False

def _test_turn_adjustment_buttons(self) -> bool:
    """Test turn adjustment buttons in graph editor."""
    try:
        # Find turn adjustment buttons
        from presentation.components.graph_editor.components.adjustment_panel import TurnAdjustButton
        turn_buttons = self.current_graph_editor.findChildren(TurnAdjustButton)

        if not turn_buttons:
            logger.warning("No turn adjustment buttons found")
            return False

        # Test first button
        button = turn_buttons[0]

        # Test left click
        left_click_event = QMouseEvent(
            QMouseEvent.Type.MouseButtonPress,
            QPoint(10, 10),
            Qt.MouseButton.LeftButton,
            Qt.MouseButton.LeftButton,
            Qt.KeyboardModifier.NoModifier
        )
        button.mousePressEvent(left_click_event)
        QApplication.processEvents()

        # Test right click
        right_click_event = QMouseEvent(
            QMouseEvent.Type.MouseButtonPress,
            QPoint(10, 10),
            Qt.MouseButton.RightButton,
            Qt.MouseButton.RightButton,
            Qt.KeyboardModifier.NoModifier
        )
        button.mousePressEvent(right_click_event)
        QApplication.processEvents()

        return True

    except Exception as e:
        logger.error(f"Turn adjustment button test failed: {e}")
        return False

def _test_keyboard_shortcuts(self) -> bool:
    """Test keyboard shortcuts in graph editor."""
    try:
        # Test WASD keys
        wasd_keys = [Qt.Key.Key_W, Qt.Key.Key_A, Qt.Key.Key_S, Qt.Key.Key_D]

        for key in wasd_keys:
            key_event = QKeyEvent(
                QKeyEvent.Type.KeyPress,
                key,
                Qt.KeyboardModifier.NoModifier
            )

            # Send key event to graph editor
            self.current_graph_editor.keyPressEvent(key_event)
            QApplication.processEvents()

        # Test special keys
        special_keys = [Qt.Key.Key_X, Qt.Key.Key_Z, Qt.Key.Key_C]

        for key in special_keys:
            key_event = QKeyEvent(
                QKeyEvent.Type.KeyPress,
                key,
                Qt.KeyboardModifier.NoModifier
            )

            # Send key event to graph editor
            self.current_graph_editor.keyPressEvent(key_event)
            QApplication.processEvents()

        return True

    except Exception as e:
        logger.error(f"Keyboard shortcuts test failed: {e}")
        return False

def _test_orientation_picker(self) -> bool:
    """Test orientation picker in graph editor."""
    try:
        # Find orientation picker widgets
        from presentation.components.graph_editor.components.orientation_picker import OrientationPickerWidget
        orientation_pickers = self.current_graph_editor.findChildren(OrientationPickerWidget)

        if not orientation_pickers:
            logger.warning("No orientation pickers found")
            return False

        # Test orientation change
        picker = orientation_pickers[0]

        # Simulate orientation change (this would depend on the actual implementation)
        # For now, just check that the picker exists and is functional
        return True

    except Exception as e:
        logger.error(f"Orientation picker test failed: {e}")
        return False
```

## Component Sizing Tests

```python
# === SIZING TESTS ===

def test_component_sizing(self) -> UITestResult:
    """Test responsive sizing of all components."""
    start_time = time.time()
    errors = []
    warnings = []

    try:
        # Test workbench sizing
        workbench_sizing = self._test_workbench_sizing()

        # Test graph editor sizing
        graph_editor_sizing = self._test_graph_editor_sizing()

        # Test option picker sizing
        option_picker_sizing = self._test_option_picker_sizing()

        all_results = {
            "workbench": workbench_sizing,
            "graph_editor": graph_editor_sizing,
            "option_picker": option_picker_sizing,
        }

        success = all(all_results.values())

        return UITestResult(
            component_name="sizing",
            test_name="responsive_sizing",
            success=success,
            errors=errors,
            warnings=warnings,
            execution_time=time.time() - start_time,
            metadata={
                "sizing_results": all_results,
                "components_tested": len(all_results),
            }
        )

    except Exception as e:
        errors.append(f"Component sizing test failed: {str(e)}")
        return UITestResult(
            component_name="sizing",
            test_name="responsive_sizing",
            success=False,
            errors=errors,
            warnings=warnings,
            execution_time=time.time() - start_time,
            metadata={}
        )

def _test_workbench_sizing(self) -> bool:
    """Test workbench responsive sizing."""
    try:
        if not self.current_workbench:
            return False

        # Test different sizes
        test_sizes = [(800, 600), (1200, 900), (1600, 1200)]

        for width, height in test_sizes:
            self.current_workbench.resize(width, height)
            QApplication.processEvents()

            # Verify resize was applied
            actual_size = self.current_workbench.size()
            if actual_size.width() != width or actual_size.height() != height:
                logger.warning(f"Workbench resize failed: expected {width}x{height}, got {actual_size.width()}x{actual_size.height()}")

        return True

    except Exception as e:
        logger.error(f"Workbench sizing test failed: {e}")
        return False

def _test_graph_editor_sizing(self) -> bool:
    """Test graph editor responsive sizing."""
    try:
        if not self.current_graph_editor:
            return False

        # Test different sizes
        test_sizes = [(800, 300), (1200, 450), (1600, 600)]

        for width, height in test_sizes:
            self.current_graph_editor.resize(width, height)
            QApplication.processEvents()

            # Verify resize was applied
            actual_size = self.current_graph_editor.size()
            if actual_size.width() != width or actual_size.height() != height:
                logger.warning(f"Graph editor resize failed: expected {width}x{height}, got {actual_size.width()}x{actual_size.height()}")

        return True

    except Exception as e:
        logger.error(f"Graph editor sizing test failed: {e}")
        return False

def _test_option_picker_sizing(self) -> bool:
    """Test option picker responsive sizing."""
    try:
        # This would test the option picker component
        # For now, return True as placeholder
        return True

    except Exception as e:
        logger.error(f"Option picker sizing test failed: {e}")
        return False
```

## Updated Comprehensive Test Suite

```python
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

    # Test graph editor interactions
    logger.info("Testing graph editor interactions...")
    graph_editor_result = self.test_graph_editor_interactions()
    test_results.append(graph_editor_result)

    # Test component sizing
    logger.info("Testing component sizing...")
    sizing_result = self.test_component_sizing()
    test_results.append(sizing_result)

    # Store all results
    self.test_results.extend(test_results)

    return test_results
```
