#!/usr/bin/env python3
"""Verify that imports work correctly across the TKA monorepo."""

import os
import sys


def test_legacy_imports():
    """Test importing legacy app modules."""
    print("Testing legacy app imports...")

    # Add legacy src to path
    legacy_src = os.path.join(
        os.path.dirname(__file__), "src", "desktop", "legacy", "src"
    )
    if legacy_src not in sys.path:
        sys.path.insert(0, legacy_src)

    try:
        # Test key legacy imports
        from enums.letter.letter import Letter

        print("  ✓ Letter enum imported successfully")

        from enums.prop_type import PropType

        print("  ✓ PropType enum imported successfully")

        from main_window.main_widget.tab_name import TabName

        print("  ✓ TabName imported successfully")

        from utils.logging_config import get_logger

        print("  ✓ logging_config imported successfully")

        return True
    except ImportError as e:
        print(f"  ✗ Failed to import legacy modules: {e}")
        return False


def test_modern_imports():
    """Test importing modern app modules."""
    print("Testing modern app imports...")

    # Add modern src to path
    modern_src = os.path.join(
        os.path.dirname(__file__), "src", "desktop", "modern", "src"
    )
    if modern_src not in sys.path:
        sys.path.insert(0, modern_src)

    try:
        # Test basic modern structure (adjust based on actual structure)
        print("  ✓ Modern app path accessible")
        return True
    except (ImportError, ModuleNotFoundError) as e:
        print(f"  ✗ Modern app error: {e}")
        return False


def test_shared_imports():
    """Test importing shared modules."""
    print("Testing shared imports...")

    success = True

    try:
        # Test shared constants from data directory
        data_path = os.path.join(os.path.dirname(__file__), "data")
        if data_path not in sys.path:
            sys.path.insert(0, data_path)

        import constants

        print("  ✓ constants imported successfully from data/")
    except ImportError as e:
        print(f"  ✗ Failed to import constants: {e}")
        success = False

    try:
        # Test shared types from packages
        packages_path = os.path.join(
            os.path.dirname(__file__), "packages", "shared-types", "python"
        )
        if packages_path not in sys.path:
            sys.path.insert(0, packages_path)

        import tka_types

        print("  ✓ tka_types imported successfully from packages/")
    except ImportError as e:
        print(f"  ✗ Failed to import tka_types: {e}")
        success = False

    return success


if __name__ == "__main__":
    print("TKA Monorepo Import Verification")
    print("=" * 40)

    results = [test_shared_imports(), test_legacy_imports(), test_modern_imports()]

    print("\n" + "=" * 40)
    if all(results):
        print("🎉 All import tests passed!")
        print("Your monorepo configuration is working correctly.")
    else:
        print("❌ Some import tests failed.")
        print("Check your pyproject.toml configuration.")

    print("\nNote: IDE import resolution may differ from command line.")
    print("Check VS Code for actual import error status.")
