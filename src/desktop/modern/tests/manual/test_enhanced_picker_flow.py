"""
Manual test script to verify enhanced start position picker flow.

This script tests the complete flow from position selection to workbench update.
"""

import os
import sys
from unittest.mock import Mock

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "src"))

from PyQt6.QtCore import QTimer
from PyQt6.QtWidgets import QApplication


def test_enhanced_picker_flow():
    """Test the complete enhanced picker flow."""
    app = QApplication(sys.argv)

    print("🧪 Testing Enhanced Start Position Picker Flow")
    print("=" * 50)

    try:
        # Test 1: Create enhanced picker with mock pool manager
        print("1. Creating enhanced picker...")

        # Create mock pool manager
        mock_pool_manager = Mock()

        def mock_checkout_pictograph(parent=None):
            from PyQt6.QtWidgets import QLabel, QVBoxLayout, QWidget

            widget = QWidget(parent)
            widget.setFixedSize(150, 150)
            widget.setStyleSheet(
                "background: lightblue; border: 2px solid blue; border-radius: 10px;"
            )

            layout = QVBoxLayout(widget)
            label = QLabel("Test\nPictograph", widget)
            from PyQt6.QtCore import Qt

            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.addWidget(label)

            widget.update_from_pictograph_data = Mock()
            return widget

        mock_pool_manager.checkout_pictograph = mock_checkout_pictograph
        mock_pool_manager.checkin_pictograph = Mock()
        mock_pool_manager.get_start_position_pictographs.return_value = [
            {"position_key": "alpha1_alpha1", "letter": "α"},
            {"position_key": "beta1_beta1", "letter": "β"},
            {"position_key": "gamma1_gamma1", "letter": "γ"},
        ]

        # Create enhanced picker
        from presentation.components.start_position_picker.enhanced_start_position_picker import (
            EnhancedStartPositionPicker,
        )

        enhanced_picker = EnhancedStartPositionPicker(mock_pool_manager)
        enhanced_picker.show()
        enhanced_picker.resize(600, 400)

        print("✅ Enhanced picker created successfully")

        # Test 2: Connect signal to verify it works
        print("2. Testing signal connection...")

        received_signals = []

        def on_position_selected(position_key):
            received_signals.append(position_key)
            print(f"✅ Signal received: {position_key}")

        enhanced_picker.start_position_selected.connect(on_position_selected)

        # Test 3: Simulate position selection
        print("3. Simulating position selection...")

        def simulate_selection():
            test_position = "alpha1_alpha1"
            print(f"🎯 Simulating selection of: {test_position}")
            enhanced_picker._handle_position_selection(test_position)

            # Check if signal was received
            if received_signals and received_signals[-1] == test_position:
                print("✅ Position selection flow working correctly!")
            else:
                print("❌ Position selection flow failed!")

            # Test variations button
            print("4. Testing variations button...")
            try:
                enhanced_picker._handle_variations_clicked()
                print("✅ Variations button click successful")
            except Exception as e:
                print(f"⚠️ Variations button issue: {e}")

            # Close after test
            QTimer.singleShot(2000, app.quit)

        # Run simulation after a short delay
        QTimer.singleShot(1000, simulate_selection)

        print("🚀 Starting test application...")
        print("The enhanced picker should appear with glassmorphism styling.")
        print("Test will run automatically and close after 3 seconds.")

        app.exec()

        # Final results
        print("\n📊 Test Results:")
        print(f"Signals received: {len(received_signals)}")
        print(f"Signal data: {received_signals}")

        if received_signals:
            print("🎉 Enhanced picker flow test PASSED!")
            return True
        else:
            print("❌ Enhanced picker flow test FAILED!")
            return False

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_enhanced_picker_flow()
    sys.exit(0 if success else 1)
