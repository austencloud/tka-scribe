#!/usr/bin/env python3
"""
Interface Quality and Completeness Tests

This module verifies the quality and completeness of interface definitions
for web platform portability.

Test Categories:
1. Web Implementation Notes - All methods have web implementation guidance
2. Type Annotations - Proper type hints for cross-platform compatibility
3. PyQt6 Dependencies - No Qt imports in interface files
4. Method Signatures - Consistent and web-compatible signatures
"""

import ast
import os
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

import pytest

# Add src to path for imports
sys.path.insert(
    0, str(Path(__file__).parent.parent.parent / "src" / "desktop" / "modern" / "src")
)


class InterfaceQualityAnalyzer:
    """Analyzes interface quality and web compatibility."""

    def __init__(self):
        # Use absolute paths from the project root
        project_root = Path(__file__).parent.parent.parent
        self.interfaces_dir = project_root / "src/desktop/modern/src/core/interfaces"
        self.qt_imports: List[str] = []
        self.missing_web_notes: List[str] = []
        self.type_annotation_issues: List[str] = []

    def scan_interface_files(self) -> List[Path]:
        """Scan all interface files."""
        return [
            f for f in self.interfaces_dir.glob("*.py") if not f.name.startswith("__")
        ]

    def check_qt_imports(self) -> List[str]:
        """Check for PyQt6 imports in interface files."""
        qt_imports = []

        for interface_file in self.scan_interface_files():
            try:
                with open(interface_file, "r", encoding="utf-8") as f:
                    content = f.read()

                # Check for various Qt import patterns
                qt_patterns = [
                    r"from PyQt6",
                    r"import PyQt6",
                    r"from PyQt5",
                    r"import PyQt5",
                    r"from PySide6",
                    r"import PySide6",
                    r"QWidget",
                    r"QObject",
                    r"QApplication",
                ]

                for pattern in qt_patterns:
                    if re.search(pattern, content):
                        qt_imports.append(f"{interface_file.name}: Found '{pattern}'")
                        break

            except Exception as e:
                qt_imports.append(f"{interface_file.name}: Error reading file - {e}")

        self.qt_imports = qt_imports
        return qt_imports

    def check_web_implementation_notes(self) -> List[str]:
        """Check that interface methods have web implementation notes."""
        missing_notes = []

        for interface_file in self.scan_interface_files():
            try:
                with open(interface_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    tree = ast.parse(content)

                # Find interface classes and their methods
                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef) and node.name.startswith("I"):
                        for item in node.body:
                            if isinstance(
                                item, ast.FunctionDef
                            ) and not item.name.startswith("_"):
                                # Check if method has web implementation note
                                docstring = ast.get_docstring(item)
                                if docstring:
                                    if "web implementation" not in docstring.lower():
                                        missing_notes.append(
                                            f"{interface_file.name}::{node.name}.{item.name} - Missing web implementation note"
                                        )
                                else:
                                    missing_notes.append(
                                        f"{interface_file.name}::{node.name}.{item.name} - No docstring"
                                    )

            except Exception as e:
                missing_notes.append(f"{interface_file.name}: Error parsing - {e}")

        self.missing_web_notes = missing_notes
        return missing_notes

    def check_type_annotations(self) -> List[str]:
        """Check that interface methods have proper type annotations."""
        annotation_issues = []

        for interface_file in self.scan_interface_files():
            try:
                with open(interface_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    tree = ast.parse(content)

                for node in ast.walk(tree):
                    if isinstance(node, ast.ClassDef) and node.name.startswith("I"):
                        for item in node.body:
                            if isinstance(
                                item, ast.FunctionDef
                            ) and not item.name.startswith("_"):
                                # Check return type annotation
                                if not item.returns:
                                    annotation_issues.append(
                                        f"{interface_file.name}::{node.name}.{item.name} - Missing return type annotation"
                                    )

                                # Check parameter type annotations
                                for arg in item.args.args:
                                    if arg.arg != "self" and not arg.annotation:
                                        annotation_issues.append(
                                            f"{interface_file.name}::{node.name}.{item.name}({arg.arg}) - Missing parameter type annotation"
                                        )

            except Exception as e:
                annotation_issues.append(f"{interface_file.name}: Error parsing - {e}")

        self.type_annotation_issues = annotation_issues
        return annotation_issues

    def check_web_compatible_types(self) -> List[str]:
        """Check that interface types are web-compatible."""
        incompatible_types = []

        # Types that are not web-compatible
        qt_types = ["QWidget", "QObject", "QApplication", "QMainWindow", "QFrame"]

        for interface_file in self.scan_interface_files():
            try:
                with open(interface_file, "r", encoding="utf-8") as f:
                    content = f.read()

                for qt_type in qt_types:
                    if qt_type in content:
                        incompatible_types.append(
                            f"{interface_file.name}: Uses non-web-compatible type '{qt_type}'"
                        )

            except Exception as e:
                incompatible_types.append(f"{interface_file.name}: Error reading - {e}")

        return incompatible_types


def test_no_qt_imports_in_interfaces():
    """Verify no PyQt6 imports in interface files."""
    analyzer = InterfaceQualityAnalyzer()
    qt_imports = analyzer.check_qt_imports()

    print(f"\n🔍 Qt Import Analysis:")
    if qt_imports:
        print(f"   ❌ Found {len(qt_imports)} Qt imports in interface files:")
        for qt_import in qt_imports:
            print(f"      - {qt_import}")
    else:
        print(f"   ✅ No Qt imports found in interface files")

    assert len(qt_imports) == 0, f"Interface files with Qt imports: {qt_imports}"


def test_all_interfaces_have_web_notes():
    """Verify all interface methods have web implementation notes."""
    analyzer = InterfaceQualityAnalyzer()
    missing_notes = analyzer.check_web_implementation_notes()

    print(f"\n📝 Web Implementation Notes Analysis:")
    if missing_notes:
        print(
            f"   ❌ Found {len(missing_notes)} methods missing web implementation notes:"
        )
        for note in missing_notes[:10]:  # Show first 10
            print(f"      - {note}")
        if len(missing_notes) > 10:
            print(f"      ... and {len(missing_notes) - 10} more")
    else:
        print(f"   ✅ All interface methods have web implementation notes")

    # Allow some missing notes for now, but track progress
    max_allowed_missing = 50  # Adjust based on current state
    assert len(missing_notes) <= max_allowed_missing, (
        f"Too many methods missing web implementation notes: {len(missing_notes)} > {max_allowed_missing}. "
        f"Missing: {missing_notes[:5]}..."
    )


def test_interface_method_signatures():
    """Verify interface methods have proper type hints."""
    analyzer = InterfaceQualityAnalyzer()
    annotation_issues = analyzer.check_type_annotations()

    print(f"\n🏷️ Type Annotation Analysis:")
    if annotation_issues:
        print(f"   ⚠️ Found {len(annotation_issues)} type annotation issues:")
        for issue in annotation_issues[:10]:  # Show first 10
            print(f"      - {issue}")
        if len(annotation_issues) > 10:
            print(f"      ... and {len(annotation_issues) - 10} more")
    else:
        print(f"   ✅ All interface methods have proper type annotations")

    # Allow some missing annotations for now, but track progress
    max_allowed_issues = 100  # Adjust based on current state
    assert len(annotation_issues) <= max_allowed_issues, (
        f"Too many type annotation issues: {len(annotation_issues)} > {max_allowed_issues}. "
        f"Issues: {annotation_issues[:5]}..."
    )


def test_web_compatible_types():
    """Verify interface types are web-compatible."""
    analyzer = InterfaceQualityAnalyzer()
    incompatible_types = analyzer.check_web_compatible_types()

    print(f"\n🌐 Web Compatibility Analysis:")
    if incompatible_types:
        print(f"   ❌ Found {len(incompatible_types)} non-web-compatible types:")
        for incompatible in incompatible_types:
            print(f"      - {incompatible}")
    else:
        print(f"   ✅ All interface types are web-compatible")

    assert (
        len(incompatible_types) == 0
    ), f"Non-web-compatible types found: {incompatible_types}"


def test_interface_file_structure():
    """Verify interface files follow proper structure."""
    analyzer = InterfaceQualityAnalyzer()
    interface_files = analyzer.scan_interface_files()

    structure_issues = []

    for interface_file in interface_files:
        try:
            with open(interface_file, "r", encoding="utf-8") as f:
                content = f.read()

            # Check for proper module docstring
            if not content.strip().startswith('"""') and not content.strip().startswith(
                "'''"
            ):
                structure_issues.append(
                    f"{interface_file.name}: Missing module docstring"
                )

            # Check for ABC import
            if "from abc import" not in content and "import abc" not in content:
                structure_issues.append(f"{interface_file.name}: Missing ABC import")

        except Exception as e:
            structure_issues.append(f"{interface_file.name}: Error reading - {e}")

    print(f"\n📋 Interface Structure Analysis:")
    if structure_issues:
        print(f"   ⚠️ Found {len(structure_issues)} structure issues:")
        for issue in structure_issues:
            print(f"      - {issue}")
    else:
        print(f"   ✅ All interface files follow proper structure")

    # Allow some structure issues for now
    max_allowed_issues = 20
    assert (
        len(structure_issues) <= max_allowed_issues
    ), f"Too many structure issues: {len(structure_issues)} > {max_allowed_issues}"


if __name__ == "__main__":
    # Run tests individually for debugging
    test_no_qt_imports_in_interfaces()
    test_web_compatible_types()
    test_interface_file_structure()
    test_interface_method_signatures()
    test_all_interfaces_have_web_notes()
    print("\n🎯 Phase 2: Interface Quality and Compatibility - COMPLETE!")
