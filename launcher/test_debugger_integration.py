#!/usr/bin/env python3
"""
Test the VS Code debugger integration with subprocess launching.
"""

import sys
from pathlib import Path

# Add launcher to path
launcher_path = Path(__file__).parent
if str(launcher_path) not in sys.path:
    sys.path.insert(0, str(launcher_path))

from services.application_launch_service import ApplicationLaunchService
from domain.models import ApplicationData, ApplicationCategory, LaunchRequest
from datetime import datetime


def test_debugger_integration():
    """Test the VS Code debugger integration."""
    print("🧪 Testing VS Code debugger integration...")
    
    # Create a mock state service
    class MockStateService:
        def update_application_status(self, app_id, status, pid):
            print(f"📊 Status update: {app_id} -> {status} (PID: {pid})")
        def add_application(self, app):
            print(f"📱 App added: {app.title}")
    
    # Create launch service
    launch_service = ApplicationLaunchService(MockStateService())
    
    # Test debug detection
    debug_mode = launch_service._is_debugger_attached()
    print(f"🐛 Debug mode detected: {debug_mode}")
    
    if not debug_mode:
        print("ℹ️ Not in debug mode - simulating debug mode behavior")
        # Temporarily override debug detection for testing
        original_method = launch_service._is_debugger_attached
        launch_service._is_debugger_attached = lambda: True
        print("🔧 Overridden debug detection to return True")
    
    # Create test app
    tka_root = Path(__file__).parent.parent
    test_app = ApplicationData(
        id="desktop_modern",
        title="TKA Desktop (Modern)",
        description="Modern TKA Desktop application with updated architecture",
        icon="✨",
        category=ApplicationCategory.DESKTOP,
        command="python main.py",
        working_dir=tka_root / "src" / "desktop" / "modern",
    )
    
    # Create launch request
    request = LaunchRequest(
        application_id="desktop_modern",
        timestamp=datetime.now().isoformat(),
        session_id="test",
        user_initiated=True,
        launch_options={},
    )
    
    print(f"\n🚀 Testing debugger integration for: {test_app.title}")
    print(f"📁 Working dir: {test_app.working_dir}")
    print(f"🔍 TKA app: {launch_service._is_tka_application(test_app)}")
    print(f"🐛 Debug mode: {launch_service._is_debugger_attached()}")
    
    # Test the launch
    try:
        print("\n🎯 Attempting debugger-integrated launch...")
        result = launch_service._launch_process(test_app, request)
        
        if result:
            print(f"✅ Launch successful! PID: {result.pid}")
            print("🎯 In real scenario, VS Code debugger should connect to subprocess")
            print("🎯 Your breakpoints in arrow_renderer.py and pictograph_scene.py would work!")
            
            # Wait a moment then terminate
            import time
            time.sleep(3)  # Give more time for debugger connection
            result.terminate()
            print("🛑 Terminated test process")
            
            return True
        else:
            print("❌ Launch failed!")
            return False
            
    except Exception as e:
        print(f"❌ Launch exception: {e}")
        import traceback
        print(f"❌ Full traceback: {traceback.format_exc()}")
        return False
    
    finally:
        if not debug_mode:
            # Restore original method
            launch_service._is_debugger_attached = original_method
            print("🔧 Restored original debug detection")


def test_debugpy_availability():
    """Test if debugpy is available and working."""
    print("\n🔍 Testing debugpy availability...")
    
    try:
        import debugpy
        print("✅ debugpy is available")
        
        # Test connection detection
        connected = debugpy.is_client_connected()
        print(f"🔍 Debugger connected: {connected}")
        
        if connected:
            print("✅ VS Code debugger is attached!")
            print("🎯 Subprocess debugging should work")
        else:
            print("ℹ️ No debugger attached (expected when not running under F5)")
            print("🎯 Run this test with F5 in VS Code to test full integration")
        
        return True
        
    except ImportError:
        print("❌ debugpy not available")
        print("🔧 Install debugpy: pip install debugpy")
        return False
    except Exception as e:
        print(f"❌ debugpy error: {e}")
        return False


if __name__ == "__main__":
    print("🚀 VS Code Debugger Integration Test\n")
    
    # Test debugpy availability first
    debugpy_ok = test_debugpy_availability()
    
    if debugpy_ok:
        success = test_debugger_integration()
        
        if success:
            print("\n✅ Debugger integration test passed!")
            print("🎯 The enhanced subprocess approach with debugger connection should work")
            print("🎯 When you run the launcher with F5:")
            print("   1. Launcher detects VS Code debugger")
            print("   2. Subprocess launches with debugpy listening")
            print("   3. VS Code connects to subprocess debugger")
            print("   4. Your breakpoints in desktop app files work!")
        else:
            print("\n❌ Debugger integration test failed")
            print("🔧 Check the logs for specific issues")
    else:
        print("\n❌ Cannot test debugger integration without debugpy")
        print("🔧 Install debugpy and try again")
