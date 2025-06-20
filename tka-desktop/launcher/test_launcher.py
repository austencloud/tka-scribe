#!/usr/bin/env python3
"""
Test script for the TKA Launcher.
This script tests the launcher functionality without requiring full setup.
"""

import sys
import os
from pathlib import Path

# Add the launcher directory to the Python path
launcher_dir = Path(__file__).parent
sys.path.insert(0, str(launcher_dir))

def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")
    
    try:
        from PyQt6.QtWidgets import QApplication
        print("✅ PyQt6.QtWidgets imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import PyQt6.QtWidgets: {e}")
        return False
    
    try:
        from PyQt6.QtWebEngineWidgets import QWebEngineView
        print("✅ PyQt6.QtWebEngineWidgets imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import PyQt6.QtWebEngineWidgets: {e}")
        print("   Please install: pip install PyQt6-WebEngine")
        return False
    
    try:
        from apps import AppDefinitions
        print("✅ apps module imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import apps module: {e}")
        return False
    
    try:
        from web_server_manager import WebServerManager
        print("✅ web_server_manager imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import web_server_manager: {e}")
        return False
    
    try:
        from web_tab_widget import WebTabWidget
        print("✅ web_tab_widget imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import web_tab_widget: {e}")
        return False
    
    try:
        from tabbed_launcher import TabbedLauncherApplication
        print("✅ tabbed_launcher imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import tabbed_launcher: {e}")
        return False
    
    return True

def test_app_definitions():
    """Test that app definitions are correctly configured."""
    print("\nTesting app definitions...")
    
    try:
        from apps import AppDefinitions
        apps = AppDefinitions.all()
        
        print(f"Found {len(apps)} applications:")
        for app in apps:
            print(f"  • {app.icon} {app.title} ({app.app_type})")
            if app.app_type == "web":
                print(f"    Web app name: {app.web_app_name}")
            else:
                print(f"    Script path: {app.script_path}")
        
        # Check for web apps
        web_apps = [app for app in apps if app.app_type == "web"]
        if len(web_apps) >= 3:
            print(f"✅ Found {len(web_apps)} web applications")
        else:
            print(f"⚠️  Expected at least 3 web apps, found {len(web_apps)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing app definitions: {e}")
        return False

def test_monorepo_structure():
    """Test that the monorepo structure is accessible."""
    print("\nTesting monorepo structure...")
    
    try:
        from web_server_manager import WebServerManager
        manager = WebServerManager()
        
        print(f"Monorepo root: {manager.monorepo_root}")
        
        # Check for apps directory
        apps_dir = manager.monorepo_root / "apps"
        if apps_dir.exists():
            print("✅ Apps directory found")
            
            # Check for specific web apps
            for app_name in ["web", "landing", "animator"]:
                app_dir = apps_dir / app_name
                if app_dir.exists():
                    print(f"✅ {app_name} directory found")
                    
                    # Check for package.json
                    package_json = app_dir / "package.json"
                    if package_json.exists():
                        print(f"✅ {app_name}/package.json found")
                    else:
                        print(f"⚠️  {app_name}/package.json not found")
                else:
                    print(f"❌ {app_name} directory not found")
        else:
            print("❌ Apps directory not found")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing monorepo structure: {e}")
        return False

def test_dependencies():
    """Test external dependencies."""
    print("\nTesting external dependencies...")
    
    import subprocess
    
    # Test npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm version {result.stdout.strip()} found")
        else:
            print("❌ npm not working properly")
            return False
    except FileNotFoundError:
        print("❌ npm not found - please install Node.js")
        return False
    
    # Test node
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js version {result.stdout.strip()} found")
        else:
            print("❌ Node.js not working properly")
            return False
    except FileNotFoundError:
        print("❌ Node.js not found")
        return False
    
    return True

def main():
    """Run all tests."""
    print("🧪 TKA Launcher Test Suite")
    print("=" * 40)
    
    tests = [
        ("Import Tests", test_imports),
        ("App Definitions", test_app_definitions),
        ("Monorepo Structure", test_monorepo_structure),
        ("External Dependencies", test_dependencies),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        
        try:
            if test_func():
                print(f"✅ {test_name} PASSED")
                passed += 1
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"💥 {test_name} ERROR: {e}")
    
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The launcher should work correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please address the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
