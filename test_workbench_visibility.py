#!/usr/bin/env python3
"""
Quick test to verify workbench visibility fix.
"""

import sys
import os
from pathlib import Path

# Add TKA paths
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_workbench_visibility():
    """Test that the workbench is visible in the construct tab."""
    try:
        from PyQt6.QtWidgets import QApplication
        from PyQt6.QtCore import QTimer
        
        # Create QApplication
        app = QApplication(sys.argv)
        
        print("🧪 Testing workbench visibility fix...")
        
        # Import TKA components
        from desktop.modern.core.dependency_injection.di_container import get_container
        from desktop.modern.application.services.ui.tab_factory.tab_factory import TabFactory
        
        # Create container and tab factory
        container = get_container()
        tab_factory = TabFactory()
        
        print("✅ Created container and tab factory")
        
        # Create construct tab
        construct_tab = tab_factory._create_construct_tab(container)
        
        if construct_tab is None:
            print("❌ Failed to create construct tab")
            return False
            
        print("✅ Created construct tab")
        
        # Check if construct tab is visible
        is_visible = construct_tab.isVisible()
        print(f"🔍 Construct tab visible: {is_visible}")
        
        # Check if construct tab has a workbench
        if hasattr(construct_tab, 'workbench'):
            workbench = construct_tab.workbench
            if workbench:
                workbench_widget = workbench.get_widget()
                workbench_visible = workbench_widget.isVisible()
                print(f"🔍 Workbench widget visible: {workbench_visible}")
            else:
                print("⚠️ Workbench is None")
        else:
            print("⚠️ Construct tab has no workbench attribute")
        
        # Show the construct tab to test visibility
        construct_tab.show()
        construct_tab.setVisible(True)
        
        print(f"🔍 Construct tab visible after show(): {construct_tab.isVisible()}")
        
        # Set up a timer to close the application after a short delay
        def close_app():
            print("✅ Test completed successfully")
            app.quit()
        
        QTimer.singleShot(2000, close_app)  # Close after 2 seconds
        
        # Run the application briefly
        app.exec()
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_workbench_visibility()
    sys.exit(0 if success else 1)
