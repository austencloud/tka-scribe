#!/usr/bin/env python3
"""
Test the complete VS Code debugger integration workflow.
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


def test_complete_workflow():
    """Test the complete debugger integration workflow."""
    print("🧪 Testing complete VS Code debugger integration workflow...")
    
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
    
    if debug_mode:
        print("✅ Running under VS Code debugger - full workflow test")
    else:
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
    
    print(f"\n🚀 Testing complete workflow for: {test_app.title}")
    print(f"📁 Working dir: {test_app.working_dir}")
    print(f"🔍 TKA app: {launch_service._is_tka_application(test_app)}")
    print(f"🐛 Debug mode: {launch_service._is_debugger_attached()}")
    
    # Test the launch
    try:
        print("\n🎯 Attempting complete debugger workflow...")
        result = launch_service._launch_process(test_app, request)
        
        if result:
            print(f"✅ Launch successful! PID: {result.pid}")
            
            if debug_mode:
                print("🎯 REAL DEBUG MODE - Your breakpoints should work now!")
                print("🎯 Try setting a breakpoint in:")
                print("   - src/desktop/modern/src/presentation/components/pictograph/renderers/arrow_renderer.py")
                print("   - src/desktop/modern/src/presentation/components/pictograph/pictograph_scene.py")
                print("   - Any other desktop application file")
                print("🎯 Then interact with the desktop application to trigger the breakpoints")
            else:
                print("🎯 SIMULATED MODE - In real scenario:")
                print("   1. Subprocess would be launched with debugpy listening")
                print("   2. VS Code debug configuration would be created")
                print("   3. You could attach VS Code debugger to the subprocess")
                print("   4. Your breakpoints would work in all desktop app files")
            
            # Wait a moment then terminate
            import time
            time.sleep(2)
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


def print_usage_instructions():
    """Print instructions for using the debugger integration."""
    print("\n" + "="*80)
    print("🎯 HOW TO USE THE VS CODE DEBUGGER INTEGRATION")
    print("="*80)
    print()
    print("1. 🚀 START THE LAUNCHER IN DEBUG MODE:")
    print("   - Press F5 in VS Code")
    print("   - Select '🚀 TKA Launcher (Auto-Debug Mode)'")
    print("   - The launcher will start with debugger attached")
    print()
    print("2. 🎯 SET BREAKPOINTS:")
    print("   - Open any desktop application file in VS Code")
    print("   - Examples:")
    print("     * src/desktop/modern/src/presentation/components/pictograph/renderers/arrow_renderer.py")
    print("     * src/desktop/modern/src/presentation/components/pictograph/pictograph_scene.py")
    print("     * src/desktop/modern/src/application/services/motion/motion_validation_service.py")
    print("   - Click in the left margin to set breakpoints (red dots)")
    print()
    print("3. 🖱️ LAUNCH DESKTOP APP:")
    print("   - In the launcher window, click 'TKA Desktop (Modern)'")
    print("   - The launcher will detect debug mode and launch with debugpy")
    print("   - A VS Code debug configuration will be created automatically")
    print()
    print("4. 🔗 ATTACH DEBUGGER TO SUBPROCESS:")
    print("   - Go to VS Code Run and Debug panel (Ctrl+Shift+D)")
    print("   - Look for '🔗 Attach to TKA Subprocess (Port XXXX)'")
    print("   - Click the green play button to attach")
    print("   - OR use Command Palette (Ctrl+Shift+P) → 'Python: Attach to Process'")
    print()
    print("5. 🎯 TRIGGER BREAKPOINTS:")
    print("   - Interact with the desktop application")
    print("   - When code execution hits your breakpoints, VS Code will pause")
    print("   - You can inspect variables, step through code, etc.")
    print()
    print("6. 🛑 DEBUGGING TIPS:")
    print("   - Set 'justMyCode': false in debug configs to debug into libraries")
    print("   - Use conditional breakpoints for specific scenarios")
    print("   - Check the VS Code Debug Console for output")
    print("   - Use the Call Stack panel to navigate execution context")
    print()
    print("="*80)


if __name__ == "__main__":
    print("🚀 Complete VS Code Debugger Integration Workflow Test\n")
    
    success = test_complete_workflow()
    
    if success:
        print("\n✅ Complete debugger workflow test passed!")
        print_usage_instructions()
    else:
        print("\n❌ Complete debugger workflow test failed")
        print("🔧 Check the logs for specific issues")
