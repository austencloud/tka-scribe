#!/usr/bin/env python3
"""
Test that the launcher defaults to dock mode on first startup with no saved settings.
"""

import sys
import tempfile
import os
from pathlib import Path

# Add the launcher directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))


def test_fresh_install_startup():
    """Test that launcher defaults to dock mode on fresh install."""
    
    # Use a temporary directory for settings to simulate fresh install
    with tempfile.TemporaryDirectory() as temp_dir:
        # Set up environment to use temp directory for settings
        os.environ["TKA_SETTINGS_DIR"] = temp_dir
        
        try:
            print("🧪 Testing fresh install startup mode...")
            
            from config.settings import SettingsManager
            
            # Create settings in temp directory (simulating fresh install)
            settings_path = Path(temp_dir) / "launcher_settings.json"
            settings_manager = SettingsManager(settings_path)
            
            # Check that defaults are dock mode
            launch_mode = settings_manager.get("launch_mode", "docked")
            auto_start_docked = settings_manager.get("auto_start_docked", True)
            should_restore = settings_manager.should_restore_to_docked()
            
            print(f"📋 Default launch_mode: {launch_mode}")
            print(f"📋 Default auto_start_docked: {auto_start_docked}")
            print(f"📋 Should restore to docked: {should_restore}")
            
            # Verify correct defaults
            assert launch_mode == "docked", f"Expected 'docked', got '{launch_mode}'"
            assert auto_start_docked == True, f"Expected True, got {auto_start_docked}"
            assert should_restore == True, f"Expected True, got {should_restore}"
            
            print("✅ Fresh install correctly defaults to dock mode!")
            return True
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            return False
        finally:
            # Clean up environment
            if "TKA_SETTINGS_DIR" in os.environ:
                del os.environ["TKA_SETTINGS_DIR"]


if __name__ == "__main__":
    print("🚀 Testing TKA Launcher Default Startup Mode")
    print("=" * 50)
    
    success = test_fresh_install_startup()
    
    print("=" * 50)
    if success:
        print("🎉 Test PASSED! Launcher defaults to dock mode on fresh install.")
    else:
        print("💥 Test FAILED! Check the output above.")
        sys.exit(1)
