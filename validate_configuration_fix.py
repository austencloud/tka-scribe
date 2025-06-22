#!/usr/bin/env python3
"""
TKA Configuration Fix Validation Script

This script validates that the configuration fix has been applied correctly
and that all the expected improvements are working.
"""

import json
import os
import sys
from pathlib import Path


def check_file_exists(filepath: str, should_exist: bool = True) -> bool:
    """Check if a file exists (or doesn't exist)."""
    exists = Path(filepath).exists()
    if should_exist:
        return exists
    return not exists


def validate_configuration_cleanup():
    """Validate that conflicting configuration files have been removed."""
    print("🔍 Validating configuration cleanup...")

    # These files should NOT exist anymore
    conflicting_files = ["F:/CODE/TKA/pyrightconfig.json", "F:/CODE/TKA/.pylintrc"]

    all_good = True
    for file_path in conflicting_files:
        if check_file_exists(file_path, should_exist=False):
            print(f"✅ {os.path.basename(file_path)} correctly removed")
        else:
            print(
                f"❌ {os.path.basename(file_path)} still exists - this will cause conflicts!"
            )
            all_good = False

    return all_good


def validate_pyproject_toml():
    """Validate that pyproject.toml has the correct configuration."""
    print("\n🔍 Validating pyproject.toml configuration...")

    pyproject_path = "F:/CODE/TKA/pyproject.toml"

    if not check_file_exists(pyproject_path):
        print("❌ pyproject.toml not found!")
        return False

    with open(pyproject_path, "r", encoding="utf-8") as f:
        content = f.read()

    required_sections = [
        "[tool.pyright]",
        "extraPaths =",
        'pythonVersion = "3.12"',
        'reportReturnType = "warning"',
        'reportArgumentType = "warning"',
        'reportOptionalMemberAccess = "none"',
    ]

    all_good = True
    for section in required_sections:
        if section in content:
            print(f"✅ Found required config: {section}")
        else:
            print(f"❌ Missing required config: {section}")
            all_good = False

    return all_good


def validate_vs_code_settings():
    """Validate VS Code settings."""
    print("\n🔍 Validating VS Code settings...")

    settings_path = "F:/CODE/TKA/.vscode/settings.json"

    if not check_file_exists(settings_path):
        print("❌ .vscode/settings.json not found!")
        return False

    try:
        with open(settings_path, "r", encoding="utf-8") as f:
            # Remove comments for JSON parsing
            content = f.read()
            lines = content.split("\n")
            clean_lines = []
            for line in lines:
                if "//" in line:
                    # Keep the part before the comment
                    clean_line = line.split("//")[0].rstrip()
                    if clean_line.strip():
                        clean_lines.append(clean_line)
                else:
                    clean_lines.append(line)
            clean_content = "\n".join(clean_lines)

        settings = json.loads(clean_content)

        required_settings = [
            "python.linting.enabled",
            "python.linting.pylintEnabled",
            "python.formatting.provider",
        ]

        # Check that conflicting settings are NOT present
        conflicting_settings = [
            "python.analysis.extraPaths",
            "python.analysis.typeCheckingMode",
            "python.analysis.include",
        ]

        all_good = True

        for setting in required_settings:
            if setting in settings:
                print(f"✅ Found required setting: {setting}")
            else:
                print(f"❌ Missing required setting: {setting}")
                all_good = False

        for setting in conflicting_settings:
            if setting not in settings:
                print(f"✅ Correctly removed conflicting setting: {setting}")
            else:
                print(f"❌ Found conflicting setting that should be removed: {setting}")
                all_good = False

        return all_good

    except json.JSONDecodeError as e:
        print(f"❌ Error parsing settings.json: {e}")
        return False


def test_imports():
    """Test that imports work correctly."""
    print("\n🔍 Testing Python imports...")

    # Add the paths that should be available
    sys.path.insert(0, "F:/CODE/TKA/src/desktop/legacy/src")

    all_good = True

    imports_to_test = [
        ("core.application_context", "ApplicationContext"),
        (
            "main_window.main_widget.settings_dialog.core.settings_dialog_coordinator",
            "SettingsDialogCoordinator",
        ),
    ]

    for module_name, class_name in imports_to_test:
        try:
            module = __import__(module_name, fromlist=[class_name])
            getattr(module, class_name)
            print(f"✅ Successfully imported {class_name} from {module_name}")
        except ImportError as e:
            print(f"❌ Failed to import {class_name} from {module_name}: {e}")
            all_good = False
        except AttributeError as e:
            print(f"❌ {class_name} not found in {module_name}: {e}")
            all_good = False

    return all_good


def main():
    """Run all validation checks."""
    print("🚀 TKA Configuration Fix Validation")
    print("=" * 50)

    os.chdir("F:/CODE/TKA")

    checks = [
        validate_configuration_cleanup,
        validate_pyproject_toml,
        validate_vs_code_settings,
        test_imports,
    ]

    results = []
    for check in checks:
        results.append(check())

    print("\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)

    if all(results):
        print("🎉 ALL CHECKS PASSED!")
        print("\nYour TKA configuration fix has been successfully applied!")
        print("\nNext steps:")
        print("1. Close VS Code completely")
        print("2. Restart VS Code")
        print("3. Open the TKA folder")
        print("4. Wait for Pylance to re-index (watch the status bar)")
        print("5. You should see significantly fewer type errors!")
    else:
        print("❌ Some checks failed. Please review the output above.")
        print("\nFailed checks need to be addressed before the fix will work properly.")

    return all(results)


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
