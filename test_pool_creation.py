#!/usr/bin/env python3
"""
Test pool manager frame creation.
"""

import sys
import os
import logging

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src"))

# Set up logging to see debug messages
logging.basicConfig(level=logging.DEBUG, format='%(levelname)s - %(name)s - %(message)s')

def test_pool_creation():
    """Test pool manager frame creation."""
    print("Testing pool manager frame creation...")
    
    try:
        # Create QApplication first
        from PyQt6.QtWidgets import QApplication
        app = QApplication(sys.argv)
        print("   QApplication created")
        
        # Import required components
        from core.application.application_factory import ApplicationFactory
        
        # Create test application
        container = ApplicationFactory.create_test_app()
        print("   Test application created")
        
        # Create orchestrator (this should trigger pool creation)
        from application.services.option_picker.orchestrator import OptionPickerOrchestrator
        
        print("   Creating orchestrator...")
        orchestrator = OptionPickerOrchestrator(container=container)
        
        print("   Initializing orchestrator...")
        orchestrator.initialize()
        print("   Orchestrator initialized")
        
        # Check pool frames
        if orchestrator.pool_manager:
            print(f"   Pool manager available with {len(orchestrator.pool_manager._pictograph_pool)} frames")
            
            # Check first few frames
            for i in range(min(5, len(orchestrator.pool_manager._pictograph_pool))):
                frame = orchestrator.pool_manager.get_pictograph_from_pool(i)
                if frame:
                    has_component = hasattr(frame, 'pictograph_component') and frame.pictograph_component
                    print(f"   Frame {i}: has_pictograph_component = {has_component}")
                else:
                    print(f"   Frame {i}: None")
        else:
            print("   No pool manager available")
        
        return True
        
    except Exception as e:
        print(f"   Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_pool_creation()
    
    print(f"\nPool Creation Test Results:")
    if success:
        print("   Test completed successfully")
    else:
        print("   Test failed")
    
    sys.exit(0 if success else 1)
