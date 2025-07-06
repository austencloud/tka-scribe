"""
Test Unified Graph Editor Styling System
========================================

Validates visual consistency and architectural improvements for TKA graph editor
orientation picker and turns adjustment components.
"""

import sys
import logging
from PyQt6.QtWidgets import (
    QApplication,
    QMainWindow,
    QVBoxLayout,
    QHBoxLayout,
    QWidget,
    QLabel,
)
from PyQt6.QtCore import Qt

# Add the source directory to the path
sys.path.insert(0, "../src/desktop/modern/src")

from core.application.application_factory import ApplicationFactory
from core.testing.ai_agent_helpers import TKAAITestHelper
from presentation.components.graph_editor.components.orientation_picker import (
    OrientationPickerWidget,
)
from presentation.components.graph_editor.components.dual_orientation_picker import (
    DualOrientationPicker,
)
from presentation.components.graph_editor.components.turn_adjustment_controls.turn_adjustment_controls import (
    TurnAdjustmentControls,
)
from presentation.components.graph_editor.components.turn_adjustment_controls.styling_helpers import (
    UNIFIED_BUTTON_WIDTH,
    UNIFIED_BUTTON_HEIGHT,
    UNIFIED_BORDER_RADIUS,
    UNIFIED_BUTTON_SPACING,
    get_unified_color_scheme,
)

logger = logging.getLogger(__name__)


class UnifiedStylingTestWindow(QMainWindow):
    """Test window to validate unified styling across graph editor components."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("TKA Graph Editor Unified Styling Test")
        self.setGeometry(100, 100, 1200, 800)

        # Create test application context
        self.container = ApplicationFactory.create_test_app()
        self.helper = TKAAITestHelper()

        self._setup_ui()
        self._validate_styling_consistency()

    def _setup_ui(self):
        """Setup the test UI with all components for visual comparison."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(20)
        main_layout.setContentsMargins(20, 20, 20, 20)

        # Title
        title = QLabel("TKA Graph Editor Unified Styling Validation")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet(
            """
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #2C3E50;
                padding: 10px;
                background: rgba(52, 152, 219, 0.1);
                border-radius: 8px;
                margin-bottom: 10px;
            }
        """
        )
        main_layout.addWidget(title)

        # Component comparison section
        comparison_layout = QHBoxLayout()

        # Left column: Orientation Pickers
        left_column = QVBoxLayout()
        left_column.addWidget(self._create_section_label("Orientation Pickers"))

        # Single orientation picker (blue)
        blue_orientation_picker = OrientationPickerWidget("blue")
        left_column.addWidget(blue_orientation_picker)

        # Single orientation picker (red)
        red_orientation_picker = OrientationPickerWidget("red")
        left_column.addWidget(red_orientation_picker)

        # Dual orientation picker
        dual_orientation_picker = DualOrientationPicker()
        left_column.addWidget(dual_orientation_picker)

        left_column.addStretch()
        comparison_layout.addLayout(left_column)

        # Right column: Turn Adjustment Controls
        right_column = QVBoxLayout()
        right_column.addWidget(self._create_section_label("Turn Adjustment Controls"))

        # Turn adjustment controls
        turn_controls = TurnAdjustmentControls()
        right_column.addWidget(turn_controls)

        right_column.addStretch()
        comparison_layout.addLayout(right_column)

        main_layout.addLayout(comparison_layout)

        # Validation results section
        self.validation_label = QLabel("Validation Results: Running tests...")
        self.validation_label.setStyleSheet(
            """
            QLabel {
                font-size: 14px;
                padding: 10px;
                background: rgba(241, 196, 15, 0.1);
                border-radius: 6px;
                border: 1px solid rgba(241, 196, 15, 0.3);
            }
        """
        )
        main_layout.addWidget(self.validation_label)

        # Store component references for validation
        self.components = {
            "blue_orientation": blue_orientation_picker,
            "red_orientation": red_orientation_picker,
            "dual_orientation": dual_orientation_picker,
            "turn_controls": turn_controls,
        }

    def _create_section_label(self, text: str) -> QLabel:
        """Create a styled section label."""
        label = QLabel(text)
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        label.setStyleSheet(
            """
            QLabel {
                font-size: 16px;
                font-weight: bold;
                color: #34495E;
                padding: 8px;
                background: rgba(149, 165, 166, 0.1);
                border-radius: 6px;
                margin-bottom: 5px;
            }
        """
        )
        return label

    def _validate_styling_consistency(self):
        """Validate that all components use consistent styling."""
        validation_results = []

        # Test 1: Unified constants are properly defined
        try:
            assert (
                UNIFIED_BUTTON_WIDTH == 75
            ), f"Expected button width 75, got {UNIFIED_BUTTON_WIDTH}"
            assert (
                UNIFIED_BUTTON_HEIGHT == 55
            ), f"Expected button height 55, got {UNIFIED_BUTTON_HEIGHT}"
            assert (
                UNIFIED_BORDER_RADIUS == 10
            ), f"Expected border radius 10, got {UNIFIED_BORDER_RADIUS}"
            assert (
                UNIFIED_BUTTON_SPACING == 10
            ), f"Expected button spacing 10, got {UNIFIED_BUTTON_SPACING}"
            validation_results.append("✅ Unified constants properly defined")
        except AssertionError as e:
            validation_results.append(f"❌ Unified constants: {e}")

        # Test 2: Color schemes are consistent
        try:
            blue_colors = get_unified_color_scheme("blue")
            red_colors = get_unified_color_scheme("red")

            assert "base_rgb" in blue_colors, "Blue color scheme missing base_rgb"
            assert "hover_rgb" in blue_colors, "Blue color scheme missing hover_rgb"
            assert (
                "gradient_start" in blue_colors
            ), "Blue color scheme missing gradient_start"

            assert (
                blue_colors["base_rgb"] == "74, 144, 226"
            ), f"Unexpected blue base color: {blue_colors['base_rgb']}"
            assert (
                red_colors["base_rgb"] == "231, 76, 60"
            ), f"Unexpected red base color: {red_colors['base_rgb']}"

            validation_results.append("✅ Color schemes are consistent")
        except Exception as e:
            validation_results.append(f"❌ Color schemes: {e}")

        # Test 3: TKA system integration
        try:
            test_result = self.helper.run_comprehensive_test_suite()
            if test_result.success:
                validation_results.append("✅ TKA system integration working")
            else:
                validation_results.append(
                    f"❌ TKA system integration: {test_result.error_message}"
                )
        except Exception as e:
            validation_results.append(f"❌ TKA system integration: {e}")

        # Test 4: Component instantiation
        try:
            for name, component in self.components.items():
                assert component is not None, f"{name} component is None"
                assert hasattr(
                    component, "setStyleSheet"
                ), f"{name} component missing setStyleSheet"
            validation_results.append("✅ All components instantiated successfully")
        except Exception as e:
            validation_results.append(f"❌ Component instantiation: {e}")

        # Update validation display
        results_text = "\n".join(validation_results)
        self.validation_label.setText(f"Validation Results:\n{results_text}")

        # Set color based on results
        if all("✅" in result for result in validation_results):
            self.validation_label.setStyleSheet(
                """
                QLabel {
                    font-size: 14px;
                    padding: 10px;
                    background: rgba(39, 174, 96, 0.1);
                    border-radius: 6px;
                    border: 1px solid rgba(39, 174, 96, 0.3);
                    color: #27AE60;
                }
            """
            )
        else:
            self.validation_label.setStyleSheet(
                """
                QLabel {
                    font-size: 14px;
                    padding: 10px;
                    background: rgba(231, 76, 60, 0.1);
                    border-radius: 6px;
                    border: 1px solid rgba(231, 76, 60, 0.3);
                    color: #E74C3C;
                }
            """
            )


def main():
    """Run the unified styling test."""
    app = QApplication(sys.argv)

    # Set application style
    app.setStyle("Fusion")

    # Create and show test window
    window = UnifiedStylingTestWindow()
    window.show()

    print("TKA Graph Editor Unified Styling Test")
    print("=====================================")
    print("Visual validation window opened.")
    print("Check the following:")
    print("1. All buttons have consistent sizing (75x55)")
    print("2. Border radius is uniform (10px)")
    print("3. Color schemes match between components")
    print("4. Glassmorphism effects are consistent")
    print("5. Spacing and layout are harmonious")
    print("\nPress Ctrl+C to exit")

    try:
        sys.exit(app.exec())
    except KeyboardInterrupt:
        print("\nTest completed.")


if __name__ == "__main__":
    main()
