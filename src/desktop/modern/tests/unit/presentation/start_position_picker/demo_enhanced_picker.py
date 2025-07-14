"""
Visual demonstration of the Enhanced Start Position Picker.

This script creates a simple window to showcase the enhanced picker functionality.
Run this to see the glassmorphism design and advanced features in action.
"""
import sys
import os
from unittest.mock import Mock

from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QLabel
from PyQt6.QtCore import Qt

# Add the source directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'src'))


class MockPictographPoolManager:
    """Mock pool manager that returns real QWidget objects."""
    
    def __init__(self):
        self.pictographs = []
    
    def checkout_pictograph(self, parent=None):
        """Return a real QWidget that can be added to layouts."""
        widget = QWidget(parent)
        widget.setFixedSize(150, 150)
        widget.setStyleSheet("""
            QWidget {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(100, 150, 255, 100),
                    stop:1 rgba(150, 100, 255, 100));
                border: 2px solid rgba(255, 255, 255, 50);
                border-radius: 15px;
            }
        """)
        
        # Add a label to show it's a mock pictograph
        layout = QVBoxLayout(widget)
        label = QLabel("Mock\nPictograph", widget)
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        label.setStyleSheet("color: white; font-weight: bold;")
        layout.addWidget(label)
        
        # Mock the update method
        widget.update_from_pictograph_data = Mock()
        
        return widget
    
    def checkin_pictograph(self, widget):
        """Mock checkin method."""
        pass
    
    def get_start_position_pictographs(self):
        """Return mock start position data."""
        return [
            {"position_key": "alpha1_alpha1", "letter": "α"},
            {"position_key": "beta1_beta1", "letter": "β"},
            {"position_key": "gamma1_gamma1", "letter": "γ"},
            {"position_key": "delta1_delta1", "letter": "δ"},
        ]


class EnhancedPickerDemo(QMainWindow):
    """Demo window for the enhanced start position picker."""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Enhanced Start Position Picker - Demo")
        self.setGeometry(100, 100, 800, 600)
        
        # Create central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Create layout
        layout = QVBoxLayout(central_widget)
        
        # Add title
        title = QLabel("Enhanced Start Position Picker Demo")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setStyleSheet("""
            QLabel {
                font-size: 24px;
                font-weight: bold;
                color: #333;
                margin: 20px;
            }
        """)
        layout.addWidget(title)
        
        # Create mock pool manager
        self.pool_manager = MockPictographPoolManager()
        
        # Create the enhanced picker
        self.create_enhanced_picker(layout)
        
        # Set window styling
        self.setStyleSheet("""
            QMainWindow {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #f0f0f0, stop:1 #e0e0e0);
            }
        """)
    
    def create_enhanced_picker(self, layout):
        """Create and add the enhanced picker to the layout."""
        try:
            # Mock the dependencies
            from unittest.mock import patch
            
            with patch('application.services.data.dataset_query.DatasetQuery') as mock_dataset, \
                 patch('core.service_locator.get_command_processor') as mock_cmd_proc, \
                 patch('core.service_locator.get_event_bus') as mock_event_bus:
                
                # Setup mocks
                mock_dataset.return_value = Mock()
                mock_cmd_proc.return_value = Mock()
                mock_event_bus.return_value = Mock()
                
                from presentation.components.start_position_picker.enhanced_start_position_picker import EnhancedStartPositionPicker
                
                self.enhanced_picker = EnhancedStartPositionPicker(self.pool_manager)
                
                # Connect signal to show selection
                self.enhanced_picker.start_position_selected.connect(self.on_position_selected)
                
                layout.addWidget(self.enhanced_picker)
                
                # Add status label
                self.status_label = QLabel("Select a start position to see the enhanced features!")
                self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
                self.status_label.setStyleSheet("""
                    QLabel {
                        font-size: 14px;
                        color: #666;
                        margin: 10px;
                        padding: 10px;
                        background: rgba(255, 255, 255, 100);
                        border-radius: 5px;
                    }
                """)
                layout.addWidget(self.status_label)
                
        except Exception as e:
            error_label = QLabel(f"Error creating enhanced picker: {e}")
            error_label.setStyleSheet("color: red; font-weight: bold;")
            layout.addWidget(error_label)
    
    def on_position_selected(self, position_key):
        """Handle position selection."""
        self.status_label.setText(f"Selected position: {position_key}")
        print(f"Enhanced picker selected: {position_key}")


def main():
    """Run the demo application."""
    app = QApplication(sys.argv)
    
    # Create and show the demo window
    demo = EnhancedPickerDemo()
    demo.show()
    
    print("Enhanced Start Position Picker Demo")
    print("=" * 40)
    print("This demo showcases the enhanced start position picker with:")
    print("- Glassmorphism design")
    print("- Variations button")
    print("- Advanced picker integration")
    print("- Responsive layout")
    print("- Modern animations")
    print()
    print("Click on positions to see the selection in action!")
    print("Press Ctrl+C or close the window to exit.")
    
    # Run the application
    try:
        sys.exit(app.exec())
    except KeyboardInterrupt:
        print("\nDemo closed by user.")
        sys.exit(0)


if __name__ == "__main__":
    main()
