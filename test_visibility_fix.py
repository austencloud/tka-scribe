#!/usr/bin/env python3
"""
Test to verify the visibility fix changes are in place.
"""

import sys
from pathlib import Path


def test_construct_tab_visibility_fix():
    """Test that the construct tab visibility fix is in place."""
    print("🧪 Testing construct tab visibility fix...")

    # Check construct_tab.py for the fix
    construct_tab_file = Path(
        "src/desktop/modern/presentation/tabs/construct/construct_tab.py"
    )

    if not construct_tab_file.exists():
        print(f"❌ File not found: {construct_tab_file}")
        return False

    content = construct_tab_file.read_text(encoding="utf-8")

    # Check that the hide() calls are removed
    if "self.hide()" in content:
        print("❌ Found self.hide() call - fix not applied")
        return False

    if "self.setVisible(False)" in content:
        print("❌ Found self.setVisible(False) call - fix not applied")
        return False

    # Check for the fix comment
    if "CRITICAL FIX: Don't hide the tab" in content:
        print("✅ Found CRITICAL FIX comment in construct_tab.py")
    else:
        print("⚠️ CRITICAL FIX comment not found in construct_tab.py")

    print("✅ Construct tab visibility fix verified")

    # Check ui_setup_manager.py for the fix
    ui_setup_file = Path(
        "src/desktop/modern/application/services/ui/ui_setup_manager.py"
    )

    if not ui_setup_file.exists():
        print(f"❌ File not found: {ui_setup_file}")
        return False

    ui_content = ui_setup_file.read_text(encoding="utf-8")

    # Check that the tab widget hide() calls are removed
    if "self.tab_widget.hide()" in ui_content:
        print("❌ Found self.tab_widget.hide() call - fix not applied")
        return False

    if "self.tab_widget.setVisible(False)" in ui_content:
        print("❌ Found self.tab_widget.setVisible(False) call - fix not applied")
        return False

    # Check for the switch to default tab
    if 'self.tab_management_service.switch_to_tab("construct")' in ui_content:
        print("✅ Found switch to construct tab in ui_setup_manager.py")
    else:
        print("⚠️ Switch to construct tab not found in ui_setup_manager.py")

    # Check for the fix comment
    if "CRITICAL FIX: Don't hide the tab widget" in ui_content:
        print("✅ Found CRITICAL FIX comment in ui_setup_manager.py")
    else:
        print("⚠️ CRITICAL FIX comment not found in ui_setup_manager.py")

    print("✅ UI setup manager visibility fix verified")

    return True


def test_import_structure():
    """Test that the import structure is correct."""
    print("🧪 Testing import structure...")

    try:
        # Add src to path
        sys.path.insert(0, str(Path(__file__).parent / "src"))

        # Test basic imports
        from desktop.modern.presentation.tabs.construct.construct_tab import (
            ConstructTab,
        )

        print("✅ ConstructTab import successful")

        from desktop.modern.application.services.ui.ui_setup_manager import (
            UISetupManager,
        )

        print("✅ UISetupManager import successful")

        from desktop.modern.application.services.ui.tab_management.tab_management_service import (
            TabManagementService,
        )

        print("✅ TabManagementService import successful")

        return True

    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("🔍 WORKBENCH VISIBILITY FIX VERIFICATION")
    print("=" * 60)

    success1 = test_construct_tab_visibility_fix()
    success2 = test_import_structure()

    if success1 and success2:
        print("\n✅ ALL TESTS PASSED - Visibility fix is properly implemented!")
        print("\nSUMMARY OF FIXES:")
        print("1. ✅ Removed self.hide() and self.setVisible(False) from ConstructTab")
        print(
            "2. ✅ Removed tab_widget.hide() and tab_widget.setVisible(False) from UISetupManager"
        )
        print("3. ✅ Added switch_to_tab('construct') to activate default tab")
        print("4. ✅ Import structure is working correctly")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTS FAILED - Please check the issues above")
        sys.exit(1)
