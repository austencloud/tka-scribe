#!/usr/bin/env python3
"""
Test file to verify VS Code import resolution is working correctly.

This file tests imports from various parts of the TKA project structure
to ensure VS Code can resolve them properly and provide auto-completion.
"""

# Test imports from different parts of the project structure
try:
    # Test infrastructure imports
    from src.infrastructure.paths import tka_paths
    print("✅ Infrastructure import successful")
except ImportError as e:
    print(f"❌ Infrastructure import failed: {e}")

try:
    # Test shared imports
    from src.shared.application import services
    print("✅ Shared application import successful")
except ImportError as e:
    print(f"❌ Shared application import failed: {e}")

try:
    # Test desktop modern imports
    from src.desktop.modern.application import services as modern_services
    print("✅ Desktop modern import successful")
except ImportError as e:
    print(f"❌ Desktop modern import failed: {e}")

try:
    # Test desktop legacy imports
    from src.desktop.legacy.core import application_context
    print("✅ Desktop legacy import successful")
except ImportError as e:
    print(f"❌ Desktop legacy import failed: {e}")

try:
    # Test launcher imports
    from launcher.core import application
    print("✅ Launcher import successful")
except ImportError as e:
    print(f"❌ Launcher import failed: {e}")

try:
    # Test data imports
    from data import constants
    print("✅ Data import successful")
except ImportError as e:
    print(f"❌ Data import failed: {e}")

if __name__ == "__main__":
    print("\n🔍 Import resolution test completed!")
    print("If you see ✅ marks, those imports should work in VS Code.")
    print("If you see ❌ marks, those paths may need further configuration.")
    print("\nTo test VS Code import resolution:")
    print("1. Open this file in VS Code")
    print("2. Try typing 'from src.' and see if auto-completion works")
    print("3. Place cursor on any import and press Ctrl+. for quick fixes")
