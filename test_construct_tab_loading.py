#!/usr/bin/env python3
"""
Test Construct Tab Loading

This script tests that the construct tab can be loaded without infinite loops.
"""

import sys
import time
from pathlib import Path

# Add the modern src directory to Python path
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))

def test_construct_tab_loading():
    """Test construct tab loading functionality."""
    
    print("🧪 TESTING CONSTRUCT TAB LOADING")
    print("=" * 50)
    print()
    
    try:
        # Basic setup
        from PyQt6.QtWidgets import QApplication
        from PyQt6.QtGui import QGuiApplication
        
        app = QApplication.instance()
        if not app:
            app = QApplication(sys.argv)
            app.setStyle("Fusion")
        
        from core.application.application_factory import ApplicationFactory, ApplicationMode
        container = ApplicationFactory.create_app(ApplicationMode.PRODUCTION)
        
        try:
            from core.service_locator import initialize_services
            initialize_services()
        except:
            pass
        
        screens = QGuiApplication.screens()
        target_screen = screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
        
        from presentation.components.ui.splash_screen import SplashScreen
        splash = SplashScreen(target_screen=target_screen)
        
        print("✅ Basic setup complete")
        
        # Create main window with placeholder
        from src.desktop.modern.main import TKAMainWindow
        window = TKAMainWindow(
            container=container,
            splash_screen=splash,
            target_screen=target_screen,
            parallel_mode=False,
            parallel_geometry=None,
        )
        
        print("✅ Main window created with placeholder")
        print("✅ Application should now be running with 'Load Construct Tab' button")
        print()
        print("🔍 To test construct tab loading:")
        print("   1. Look for the 'Load Construct Tab' button in the application")
        print("   2. Click it to load the real construct tab")
        print("   3. Verify it loads without infinite loops")
        print("   4. Check that the console shows reasonable pool expansion")
        print()
        print("Expected behavior:")
        print("   - Pool should expand by small amounts (5 components at a time)")
        print("   - Should not create hundreds of components")
        print("   - Should complete loading within 30 seconds")
        print()
        print("❌ If you see infinite loops, press Ctrl+C to stop")
        
        # Keep the application running
        print("🏃 Application is running... (Press Ctrl+C to exit)")
        app.exec()
        
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"❌ Error during test: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_construct_tab_loading()
