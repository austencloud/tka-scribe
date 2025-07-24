"""
Test Progressive Loading in Browse Tab

This test script demonstrates the new progressive loading functionality
in the modern browse tab. It shows how sequences are loaded incrementally
with immediate navigation to the sequence browser.
"""

import sys
from pathlib import Path
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget
from PyQt6.QtCore import QTimer

# Add the src directory to the path so we can import our modules
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from presentation.tabs.browse.browse_tab import BrowseTab
from presentation.tabs.browse.models import FilterType


class ProgressiveLoadingTestWindow(QMainWindow):
    """Test window for progressive loading functionality."""
    
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TKA Browse Tab - Progressive Loading Test")
        self.setGeometry(100, 100, 1200, 800)
        
        # Create the browse tab
        sequences_dir = Path("data/sequences")  # Adjust as needed
        settings_file = Path("settings.json")  # Adjust as needed
        
        self.browse_tab = BrowseTab(sequences_dir, settings_file)
        
        # Set up the UI
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        layout = QVBoxLayout(central_widget)
        layout.addWidget(self.browse_tab)
        
        # Connect signals for testing
        self.browse_tab.sequence_selected.connect(self._on_sequence_selected)
        self.browse_tab.open_in_construct.connect(self._on_open_in_construct)
        
        # Schedule a test filter after startup
        QTimer.singleShot(2000, self._test_progressive_loading)
        
    def _on_sequence_selected(self, sequence_id: str):
        """Handle sequence selection."""
        print(f"🎯 Test: Sequence selected: {sequence_id}")
        
    def _on_open_in_construct(self, sequence_id: str):
        """Handle open in construct."""
        print(f"🔧 Test: Open in construct: {sequence_id}")
        
    def _test_progressive_loading(self):
        """Test the progressive loading functionality."""
        print("\\n" + "="*60)
        print("🧪 TESTING PROGRESSIVE LOADING")
        print("="*60)
        
        # Test different filters to see progressive loading in action
        test_filters = [
            (FilterType.STARTING_LETTER, "A"),
            (FilterType.LENGTH, 4),
            (FilterType.STARTING_LETTER, "All Letters"),
        ]
        
        current_test = 0
        
        def run_next_test():
            nonlocal current_test
            if current_test < len(test_filters):
                filter_type, filter_value = test_filters[current_test]
                print(f"\\n🔬 Test {current_test + 1}: {filter_type} = {filter_value}")
                
                # Trigger the filter (this should cause immediate navigation + progressive loading)
                self.browse_tab._on_filter_selected(filter_type, filter_value)
                
                current_test += 1
                # Schedule next test
                QTimer.singleShot(5000, run_next_test)  # Wait 5 seconds between tests
            else:
                print("\\n✅ All progressive loading tests completed!")
                
        # Start the first test
        run_next_test()


def main():
    """Run the progressive loading test."""
    app = QApplication(sys.argv)
    
    print("🚀 Starting Progressive Loading Test for TKA Browse Tab")
    print("This will demonstrate:")
    print("  1. Immediate navigation to browse view when filter is selected")
    print("  2. Progressive loading of sequences with visual feedback")
    print("  3. Incremental thumbnail display as sequences are processed")
    print("  4. Responsive UI during heavy loading operations")
    print("\\nWatch the console for detailed progress information...")
    
    window = ProgressiveLoadingTestWindow()
    window.show()
    
    # Additional console instructions
    print("\\n" + "="*60)
    print("🎮 INTERACTIVE TESTING INSTRUCTIONS")
    print("="*60)
    print("1. Use the filter selection panel to choose different filters")
    print("2. Notice immediate navigation to the sequence browser")
    print("3. Watch the loading progress bar and incremental thumbnail loading")
    print("4. Try the cancel button during loading")
    print("5. Test different sort methods while loading")
    print("6. Resize the window to see responsive thumbnail sizing")
    print("="*60)
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
