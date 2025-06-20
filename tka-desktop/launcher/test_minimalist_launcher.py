#!/usr/bin/env python3
"""
Test the minimalist launcher with web app integration.
"""

import sys
from pathlib import Path

# Add the launcher directory to the Python path
launcher_dir = Path(__file__).parent
sys.path.insert(0, str(launcher_dir))

def test_launcher():
    """Test the launcher functionality."""
    print("🧪 Testing TKA Minimalist Launcher")
    print("=" * 40)
    
    # Test imports
    try:
        from PyQt6.QtWidgets import QApplication
        print("✅ PyQt6 imported successfully")
    except ImportError as e:
        print(f"❌ PyQt6 import failed: {e}")
        return False
    
    try:
        from apps import AppDefinitions
        print("✅ Apps module imported successfully")
        
        apps = AppDefinitions.all()
        print(f"✅ Found {len(apps)} applications:")
        for app in apps:
            print(f"   • {app.icon} {app.title} ({app.app_type})")
    except ImportError as e:
        print(f"❌ Apps import failed: {e}")
        return False
    
    try:
        from unified_web_server import UnifiedWebServer
        print("✅ Unified web server imported successfully")
    except ImportError as e:
        print(f"❌ Web server import failed: {e}")
        return False
    
    try:
        from launcher import LauncherWindow, LauncherApplication
        print("✅ Launcher classes imported successfully")
    except ImportError as e:
        print(f"❌ Launcher import failed: {e}")
        return False
    
    print("\n🎉 All imports successful!")
    print("\n💡 To run the launcher:")
    print("   python tka-desktop/launcher/launcher.py")
    
    return True

def test_web_server():
    """Test the web server functionality."""
    print("\n🌐 Testing Web Server")
    print("-" * 30)
    
    try:
        from unified_web_server import UnifiedWebServer
        
        server = UnifiedWebServer()
        print(f"✅ Web server created")
        print(f"   Monorepo root: {server.monorepo_root}")
        print(f"   Apps directory: {server.apps_dir}")
        
        # Check if apps directories exist
        for app_name in ["web", "landing", "animator"]:
            app_path = server.apps_dir / app_name
            if app_path.exists():
                print(f"   ✅ {app_name} directory found")
                
                package_json = app_path / "package.json"
                if package_json.exists():
                    print(f"      ✅ package.json found")
                else:
                    print(f"      ⚠️  package.json missing")
            else:
                print(f"   ❌ {app_name} directory missing")
        
        return True
        
    except Exception as e:
        print(f"❌ Web server test failed: {e}")
        return False

def main():
    """Run all tests."""
    success = True
    
    if not test_launcher():
        success = False
    
    if not test_web_server():
        success = False
    
    if success:
        print("\n🎉 All tests passed!")
        print("\n🚀 Ready to launch TKA!")
        return 0
    else:
        print("\n💥 Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main())
