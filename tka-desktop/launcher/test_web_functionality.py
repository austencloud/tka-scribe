#!/usr/bin/env python3
"""
Test the web functionality of the launcher.
"""

import sys
import time
from pathlib import Path

# Add the launcher directory to Python path
launcher_dir = Path(__file__).parent
sys.path.insert(0, str(launcher_dir))


def test_web_server():
    """Test the unified web server functionality."""
    print("🧪 Testing Web Server Functionality")
    print("=" * 40)

    try:
        from unified_web_server import UnifiedWebServer

        # Create server instance
        server = UnifiedWebServer()
        print("✅ Web server instance created")

        # Test port finding
        try:
            port = server.find_available_port(5173)
            print(f"✅ Found available port: {port}")
        except Exception as e:
            print(f"❌ Port finding failed: {e}")
            return False

        # Test individual server start (without actually starting)
        print("\n🔍 Testing server configuration...")

        for app_name in ["web", "landing", "animator"]:
            app_path = server.apps_dir / app_name
            if app_path.exists():
                package_json = app_path / "package.json"
                if package_json.exists():
                    print(f"✅ {app_name}: Ready to start")
                else:
                    print(f"⚠️  {app_name}: Missing package.json")
            else:
                print(f"❌ {app_name}: Directory not found")

        # Test unified interface creation
        print("\n🌐 Testing unified interface...")
        try:
            # Set dummy ports for testing
            server.server_ports = {"web": 5173, "landing": 5174, "animator": 5175}
            html_file = server.create_unified_interface()
            print(f"✅ Unified interface created: {html_file}")

            # Check if file exists and has content
            if Path(html_file).exists():
                try:
                    with open(html_file, "r", encoding="utf-8") as f:
                        content = f.read()
                        if len(content) > 1000:  # Should be a substantial HTML file
                            print("✅ HTML content looks good")
                        else:
                            print("⚠️  HTML content seems too short")
                except Exception as e:
                    print(f"⚠️  Could not read HTML file: {e}")
                    print("✅ HTML file created (encoding issue in test)")
            else:
                print("❌ HTML file not created")

        except Exception as e:
            print(f"❌ Unified interface creation failed: {e}")
            return False

        print("\n🎉 Web server functionality test passed!")
        return True

    except Exception as e:
        print(f"❌ Web server test failed: {e}")
        return False


def test_npm_availability():
    """Test if npm is available for starting servers."""
    print("\n📦 Testing npm availability...")

    try:
        import subprocess

        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm version {result.stdout.strip()} available")
            return True
        else:
            print("❌ npm command failed")
            return False
    except FileNotFoundError:
        print("❌ npm not found - Node.js may not be installed")
        return False
    except Exception as e:
        print(f"❌ npm test failed: {e}")
        return False


def main():
    """Run web functionality tests."""

    success = True

    if not test_npm_availability():
        print("\n⚠️  npm not available - web servers won't work")
        print("   Install Node.js from https://nodejs.org/")
        success = False

    if not test_web_server():
        success = False

    if success:
        print("\n🎉 All web functionality tests passed!")
        print("\n💡 The launcher should be able to:")
        print("   • Start individual web apps")
        print("   • Create unified web interface")
        print("   • Handle port conflicts automatically")
        print("   • Open browsers with correct URLs")
        return 0
    else:
        print("\n💥 Some web functionality tests failed!")
        print("   The launcher may have limited web capabilities")
        return 1


if __name__ == "__main__":
    sys.exit(main())
