#!/usr/bin/env python3
"""
Standalone Centering Test Runner

This script runs automated geometric measurement tests to verify the mathematical
centering of Option Picker section header buttons.

Usage:
    python test_centering.py

The script will:
1. Launch the TKA application
2. Populate the Option Picker with test data
3. Capture precise coordinate measurements
4. Calculate centering metrics mathematically
5. Report results and exit

Exit codes:
    0: All header buttons are perfectly centered
    1: Some header buttons are not perfectly centered
    2: Test failed to run due to errors
"""

import sys
import os
import time
from pathlib import Path

# Add the src directory to Python path for imports
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

try:
    from PyQt6.QtWidgets import QApplication
    from PyQt6.QtCore import QTimer
    from presentation.components.option_picker.automated_centering_test import AutomatedCenteringTest
    from presentation.components.option_picker.geometric_measurement_logger import GeometricMeasurementLogger
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the tka-desktop/modern directory")
    sys.exit(2)


class StandaloneCenteringTestRunner:
    """
    Standalone test runner for Option Picker header button centering verification.
    
    This class provides a complete automated test that can be run independently
    to verify mathematical centering accuracy without manual intervention.
    """
    
    def __init__(self):
        self.test_instance = None
        self.app = None
        
    def run_test(self) -> int:
        """
        Run the complete centering test.
        
        Returns:
            int: Exit code (0=success, 1=centering issues, 2=test failure)
        """
        print("🧪 STANDALONE CENTERING TEST RUNNER")
        print("="*60)
        print("Testing mathematical centering of Option Picker header buttons...")
        print()
        
        try:
            # Initialize the test
            self.test_instance = AutomatedCenteringTest()
            
            # Run the automated test
            print("🚀 Starting automated centering test...")
            success = self.test_instance.run_automated_test()
            
            # Determine exit code based on results
            if success:
                print("\n✅ TEST PASSED: All header buttons are perfectly centered!")
                return 0
            else:
                print("\n❌ TEST FAILED: Some header buttons are not perfectly centered")
                return 1
                
        except KeyboardInterrupt:
            print("\n⚠️  Test interrupted by user")
            return 2
        except Exception as e:
            print(f"\n❌ Test failed with error: {e}")
            import traceback
            traceback.print_exc()
            return 2
        finally:
            # Ensure cleanup
            self._cleanup()
    
    def _cleanup(self):
        """Clean up resources."""
        try:
            if self.test_instance:
                self.test_instance._cleanup_application()
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")


def run_quick_measurement_test() -> int:
    """
    Run a quick measurement test without full application launch.
    
    This is useful for testing the measurement system itself.
    
    Returns:
        int: Exit code
    """
    print("🔬 QUICK MEASUREMENT SYSTEM TEST")
    print("="*50)
    
    try:
        # Test the measurement logger directly
        logger = GeometricMeasurementLogger()
        
        # Create a simple test app
        app = QApplication(sys.argv if sys.argv else ['test'])
        
        from PyQt6.QtWidgets import QWidget, QPushButton, QVBoxLayout, QHBoxLayout
        
        # Create test widgets
        container = QWidget()
        container.setFixedSize(400, 100)
        
        layout = QVBoxLayout(container)
        button_layout = QHBoxLayout()
        
        # Create a test button with centering layout
        button_layout.addStretch(1)
        test_button = QPushButton("Test Button")
        test_button.setFixedSize(120, 30)
        button_layout.addWidget(test_button)
        button_layout.addStretch(1)
        
        layout.addLayout(button_layout)
        
        container.show()
        app.processEvents()
        
        # Capture measurements
        logger.capture_widget_geometry(container, "test_container")
        logger.capture_widget_geometry(test_button, "test_button")
        
        # Analyze centering
        analysis = logger.analyze_button_centering("test_container", "test_button", "Test")
        
        if analysis:
            logger.log_centering_analysis(analysis)
            
            if analysis.is_perfectly_centered:
                print("✅ Quick test passed: Measurement system working correctly")
                return 0
            else:
                print(f"⚠️  Quick test shows offset: {analysis.centering_offset:.1f}px")
                return 1
        else:
            print("❌ Quick test failed: Could not analyze centering")
            return 2
            
    except Exception as e:
        print(f"❌ Quick test error: {e}")
        return 2
    finally:
        try:
            app.quit()
        except:
            pass


def main():
    """Main entry point for the test runner."""
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] in ['-h', '--help']:
            print(__doc__)
            return 0
        elif sys.argv[1] in ['-q', '--quick']:
            return run_quick_measurement_test()
    
    # Check if we're in the right directory
    if not (Path.cwd() / "main.py").exists():
        print("❌ Error: Please run this script from the tka-desktop/modern directory")
        print("   Current directory:", Path.cwd())
        print("   Expected to find: main.py")
        return 2
    
    # Run the full test
    runner = StandaloneCenteringTestRunner()
    return runner.run_test()


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
