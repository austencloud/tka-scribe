"""
Manual test script to verify the Advanced Start Position Picker fixes.

This script tests:
1. Visibility of 16 pictographs in 4x4 grid
2. Grid mode toggle button functionality
3. Back button placement and text
4. Proper sizing and layout
"""
import sys
import os
from unittest.mock import Mock

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer


def test_advanced_picker_fixes():
    """Test the advanced picker fixes."""
    app = QApplication(sys.argv)
    
    print("🧪 Testing Advanced Start Position Picker Fixes")
    print("=" * 55)
    
    try:
        # Test 1: Create advanced picker with mock pool manager
        print("1. Creating advanced picker...")
        
        # Create mock pool manager
        mock_pool_manager = Mock()
        
        def mock_checkout_pictograph(parent=None):
            from PyQt6.QtWidgets import QWidget, QLabel, QVBoxLayout
            from PyQt6.QtCore import Qt
            widget = QWidget(parent)
            widget.setFixedSize(120, 120)
            widget.setStyleSheet("background: lightblue; border: 2px solid blue; border-radius: 10px;")
            
            layout = QVBoxLayout(widget)
            label = QLabel("Test\nPictograph", widget)
            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            layout.addWidget(label)
            
            widget.update_from_pictograph_data = Mock()
            return widget
        
        mock_pool_manager.checkout_pictograph = mock_checkout_pictograph
        mock_pool_manager.checkin_pictograph = Mock()
        
        # Create advanced picker
        from presentation.components.start_position_picker.advanced_start_position_picker import AdvancedStartPositionPicker
        
        advanced_picker = AdvancedStartPositionPicker(mock_pool_manager, "diamond")
        advanced_picker.show()
        advanced_picker.resize(800, 600)
        
        print("✅ Advanced picker created successfully")
        
        # Test 2: Check components
        print("2. Testing UI components...")
        
        # Check back button
        if hasattr(advanced_picker, 'back_button'):
            back_text = advanced_picker.back_button.text()
            print(f"✅ Back button text: '{back_text}'")
            if back_text == "← Back":
                print("✅ Back button text is correct")
            else:
                print(f"❌ Back button text should be '← Back', got '{back_text}'")
        else:
            print("❌ Back button not found")
        
        # Check grid mode toggle
        if hasattr(advanced_picker, 'grid_mode_button'):
            toggle_text = advanced_picker.grid_mode_button.text()
            print(f"✅ Grid mode toggle text: '{toggle_text}'")
            if "Grid" in toggle_text:
                print("✅ Grid mode toggle is working")
            else:
                print(f"❌ Grid mode toggle text unexpected: '{toggle_text}'")
        else:
            print("❌ Grid mode toggle button not found")
        
        # Test 3: Check position count
        print("3. Testing position display...")
        
        def check_positions():
            position_count = len(advanced_picker.position_options)
            print(f"✅ Position options created: {position_count}")
            
            if position_count == 16:
                print("✅ Correct number of positions (16) displayed")
            else:
                print(f"❌ Expected 16 positions, got {position_count}")
            
            # Check if positions are visible
            visible_count = sum(1 for option in advanced_picker.position_options if option.isVisible())
            print(f"✅ Visible positions: {visible_count}")
            
            if visible_count == position_count:
                print("✅ All positions are visible")
            else:
                print(f"⚠️ Only {visible_count} out of {position_count} positions are visible")
            
            # Test grid mode toggle
            print("4. Testing grid mode toggle...")
            current_mode = advanced_picker.current_grid_mode
            print(f"✅ Current grid mode: {current_mode}")
            
            # Simulate toggle
            advanced_picker._toggle_grid_mode()
            new_mode = advanced_picker.current_grid_mode
            print(f"✅ After toggle, grid mode: {new_mode}")
            
            if new_mode != current_mode:
                print("✅ Grid mode toggle is working correctly")
            else:
                print("❌ Grid mode toggle is not working")
            
            # Close after test
            QTimer.singleShot(2000, app.quit)
        
        # Run position check after a short delay to allow loading
        QTimer.singleShot(1000, check_positions)
        
        print("🚀 Starting test application...")
        print("The advanced picker should appear with:")
        print("- Back button in top left saying '← Back'")
        print("- Grid mode toggle button")
        print("- 16 visible pictographs in 4x4 grid")
        print("Test will run automatically and close after 3 seconds.")
        
        app.exec()
        
        print("\n📊 Test completed!")
        return True
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_advanced_picker_fixes()
    sys.exit(0 if success else 1)
