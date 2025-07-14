"""
Test script to verify pictograph visibility in Advanced Start Position Picker.
User clicks ✓ if pictographs are visible, ✗ if not visible.
"""
import sys
import os

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

from PyQt6.QtWidgets import QApplication, QWidget, QVBoxLayout, QHBoxLayout, QPushButton, QLabel
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont
from unittest.mock import Mock


class VisibilityTestWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Advanced Picker Visibility Test")
        self.setGeometry(100, 100, 1000, 700)
        
        # Main layout
        layout = QVBoxLayout(self)
        
        # Test instructions
        instructions = QLabel("Are the pictographs VISIBLE in the advanced picker below?")
        instructions.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        instructions.setAlignment(Qt.AlignmentFlag.AlignCenter)
        instructions.setStyleSheet("color: #2c3e50; padding: 10px; background: #ecf0f1; border-radius: 5px;")
        layout.addWidget(instructions)
        
        # Feedback buttons
        button_layout = QHBoxLayout()
        
        self.visible_button = QPushButton("✓ YES - Pictographs are VISIBLE")
        self.visible_button.setStyleSheet("""
            QPushButton {
                background: #27ae60; 
                color: white; 
                font-size: 16px; 
                font-weight: bold; 
                padding: 15px; 
                border-radius: 8px;
                border: none;
            }
            QPushButton:hover { background: #2ecc71; }
        """)
        self.visible_button.clicked.connect(self.on_visible_clicked)
        
        self.not_visible_button = QPushButton("✗ NO - Pictographs are NOT VISIBLE")
        self.not_visible_button.setStyleSheet("""
            QPushButton {
                background: #e74c3c; 
                color: white; 
                font-size: 16px; 
                font-weight: bold; 
                padding: 15px; 
                border-radius: 8px;
                border: none;
            }
            QPushButton:hover { background: #c0392b; }
        """)
        self.not_visible_button.clicked.connect(self.on_not_visible_clicked)
        
        button_layout.addWidget(self.visible_button)
        button_layout.addWidget(self.not_visible_button)
        layout.addLayout(button_layout)
        
        # Create advanced picker
        self.create_advanced_picker()
        layout.addWidget(self.advanced_picker, 1)
        
        # Result label
        self.result_label = QLabel("")
        self.result_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.result_label.setFont(QFont("Arial", 12))
        layout.addWidget(self.result_label)
    
    def create_advanced_picker(self):
        """Create the advanced picker with mock pool manager."""
        # Create mock pool manager
        mock_pool_manager = Mock()
        
        def mock_checkout_pictograph(parent=None):
            from PyQt6.QtWidgets import QWidget, QLabel, QVBoxLayout
            widget = QWidget(parent)
            widget.setFixedSize(100, 100)
            # Make it very obvious with bright colors
            widget.setStyleSheet("""
                background: red; 
                border: 3px solid blue; 
                border-radius: 10px;
            """)
            
            layout = QVBoxLayout(widget)
            label = QLabel("TEST", widget)
            label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            label.setStyleSheet("color: white; font-weight: bold; font-size: 14px;")
            layout.addWidget(label)
            
            widget.update_from_pictograph_data = Mock()
            return widget
        
        mock_pool_manager.checkout_pictograph = mock_checkout_pictograph
        mock_pool_manager.checkin_pictograph = Mock()
        
        # Create advanced picker
        from presentation.components.start_position_picker.advanced_start_position_picker import AdvancedStartPositionPicker
        
        self.advanced_picker = AdvancedStartPositionPicker(mock_pool_manager, "diamond")
        
        # Force immediate update
        QTimer.singleShot(100, self.force_update)
    
    def force_update(self):
        """Force update of the advanced picker."""
        self.advanced_picker.update()
        self.advanced_picker.positions_container.update()
        
        # Force show all position options
        for option in self.advanced_picker.position_options:
            option.show()
            option.setVisible(True)
            option.update()
            option.repaint()
    
    def on_visible_clicked(self):
        """User confirms pictographs are visible."""
        self.result_label.setText("✅ SUCCESS! Pictographs are visible. Test passed!")
        self.result_label.setStyleSheet("color: #27ae60; font-weight: bold; padding: 10px;")
        print("✅ SUCCESS: User confirmed pictographs are VISIBLE")
        QTimer.singleShot(2000, self.close)
    
    def on_not_visible_clicked(self):
        """User reports pictographs are not visible."""
        self.result_label.setText("❌ FAILED! Pictographs are not visible. Need to fix...")
        self.result_label.setStyleSheet("color: #e74c3c; font-weight: bold; padding: 10px;")
        print("❌ FAILED: User confirmed pictographs are NOT VISIBLE")
        QTimer.singleShot(2000, self.close)


def main():
    app = QApplication(sys.argv)
    
    print("🧪 Testing Advanced Picker Pictograph Visibility")
    print("=" * 50)
    print("Look at the advanced picker and click:")
    print("✓ if you can SEE the pictographs")
    print("✗ if you CANNOT see the pictographs")
    
    test_widget = VisibilityTestWidget()
    test_widget.show()
    
    app.exec()


if __name__ == "__main__":
    main()
