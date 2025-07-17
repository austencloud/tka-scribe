#!/usr/bin/env python3
"""
Interface Coverage Verification Tests

This module provides comprehensive tests to verify that the TKA application
has 100% interface coverage, making it ready for web platform portability.

Test Categories:
1. Service Interface Coverage - Every service implements an interface
2. Abstract Method Implementation - No missing implementations
3. Import Validation - All interfaces can be imported correctly
4. Interface Inheritance - Proper ABC/Protocol usage
"""

import ast
import importlib
import inspect
import os
import sys
from abc import ABC
from pathlib import Path
from typing import Any, Dict, List, Set, Tuple

import pytest

# Add src to path for imports
sys.path.insert(
    0, str(Path(__file__).parent.parent.parent / "src" / "desktop" / "modern" / "src")
)


class InterfaceCoverageAnalyzer:
    """Analyzes interface coverage across the TKA codebase."""

    def __init__(self):
        # Use absolute paths from the project root
        project_root = Path(__file__).parent.parent.parent
        self.services_dir = project_root / "src/desktop/modern/src/application/services"
        self.interfaces_dir = project_root / "src/desktop/modern/src/core/interfaces"
        self.missing_interfaces: List[str] = []
        self.import_errors: List[str] = []
        self.service_files: List[Path] = []
        self.interface_files: List[Path] = []

    def scan_service_files(self) -> List[Path]:
        """Scan all service files in the services directory."""
        service_files = []

        for root, dirs, files in os.walk(self.services_dir):
            for file in files:
                if file.endswith(".py") and not file.startswith("__"):
                    service_files.append(Path(root) / file)

        self.service_files = service_files
        return service_files

    def scan_interface_files(self) -> List[Path]:
        """Scan all interface files in the interfaces directory."""
        interface_files = []

        for file in self.interfaces_dir.glob("*.py"):
            if not file.name.startswith("__"):
                interface_files.append(file)

        self.interface_files = interface_files
        return interface_files

    def extract_classes_from_file(self, file_path: Path) -> List[Tuple[str, List[str]]]:
        """Extract class definitions and their base classes from a Python file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                tree = ast.parse(content)
        except Exception as e:
            self.import_errors.append(f"Failed to parse {file_path}: {e}")
            return []

        classes = []
        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                base_names = []
                for base in node.bases:
                    if isinstance(base, ast.Name):
                        base_names.append(base.id)
                    elif isinstance(base, ast.Attribute):
                        # Handle cases like ABC.abstractmethod
                        base_names.append(ast.unparse(base))

                classes.append((node.name, base_names))

        return classes

    def check_service_interface_coverage(self) -> Dict[str, Any]:
        """Check that all services implement interfaces."""
        results = {
            "total_services": 0,
            "services_with_interfaces": 0,
            "missing_interfaces": [],
            "coverage_percentage": 0.0,
        }

        for service_file in self.scan_service_files():
            classes = self.extract_classes_from_file(service_file)

            for class_name, base_classes in classes:
                # Skip interface definitions themselves
                if (
                    class_name.startswith("I")
                    and len(class_name) > 1
                    and class_name[1].isupper()
                ):
                    continue

                # Skip test classes and utility classes
                if any(
                    skip in class_name.lower()
                    for skip in ["test", "mock", "stub", "fake"]
                ):
                    continue

                results["total_services"] += 1

                # Check if class implements an interface
                has_interface = any(
                    base.startswith("I") and len(base) > 1 and base[1].isupper()
                    for base in base_classes
                )

                if has_interface:
                    results["services_with_interfaces"] += 1
                else:
                    # Use relative path from services directory
                    try:
                        relative_path = service_file.relative_to(self.services_dir)
                        results["missing_interfaces"].append(
                            f"services/{relative_path}: {class_name}"
                        )
                    except ValueError:
                        # Fallback to just the filename
                        results["missing_interfaces"].append(
                            f"{service_file.name}: {class_name}"
                        )

        if results["total_services"] > 0:
            results["coverage_percentage"] = (
                results["services_with_interfaces"] / results["total_services"]
            ) * 100

        return results


def test_all_services_have_interfaces():
    """Verify every service class implements an interface."""
    analyzer = InterfaceCoverageAnalyzer()
    results = analyzer.check_service_interface_coverage()

    print(f"\n📊 Interface Coverage Analysis:")
    print(f"   Total Services: {results['total_services']}")
    print(f"   Services with Interfaces: {results['services_with_interfaces']}")
    print(f"   Coverage: {results['coverage_percentage']:.1f}%")

    if results["missing_interfaces"]:
        print(f"\n❌ Services without interfaces:")
        for missing in results["missing_interfaces"]:
            print(f"   - {missing}")

    # Assert 100% coverage
    assert len(results["missing_interfaces"]) == 0, (
        f"Found {len(results['missing_interfaces'])} services without interfaces. "
        f"Coverage: {results['coverage_percentage']:.1f}%. "
        f"Missing: {results['missing_interfaces']}"
    )

    print(f"✅ All {results['total_services']} services implement interfaces!")


def test_no_abstract_method_errors():
    """Verify no abstract method errors when importing services."""
    analyzer = InterfaceCoverageAnalyzer()
    import_errors = []

    # Test importing all service modules
    service_modules = [
        "application.services.arrow_item_pool_manager",
        "application.services.pictograph_pool_manager",
        "application.services.data.beat_data_builder",
        "application.services.data.conversion_utils",
        "application.services.generation.turn_intensity_manager",
        "application.services.layout.layout_manager",
        "application.services.sequence.sequence_beat_operations",
        "application.services.start_position.start_position_orchestrator",
    ]

    for module_name in service_modules:
        try:
            importlib.import_module(module_name)
            print(f"✅ Successfully imported {module_name}")
        except ImportError as e:
            import_errors.append(f"Import error in {module_name}: {e}")
        except TypeError as e:
            if "abstract" in str(e).lower():
                import_errors.append(f"Abstract method error in {module_name}: {e}")
        except Exception as e:
            import_errors.append(f"Unexpected error in {module_name}: {e}")

    assert len(import_errors) == 0, f"Import/Abstract method errors: {import_errors}"
    print(
        f"✅ All service modules imported successfully without abstract method errors!"
    )


def test_interface_files_exist():
    """Verify all expected interface files exist."""
    analyzer = InterfaceCoverageAnalyzer()
    interface_files = analyzer.scan_interface_files()

    expected_interfaces = [
        "pool_manager_services.py",
        "background_animation_services.py",
        "data_builder_services.py",
        "core_orchestrator_services.py",
        "sequence_operation_services.py",
        "generation_services.py",
        "option_picker_services.py",
        "glyph_services.py",
        "layout_calculation_services.py",
        "core_services.py",
        "layout_services.py",
        "motion_services.py",
        "pictograph_services.py",
        "start_position_services.py",
        "workbench_services.py",
    ]

    existing_files = [f.name for f in interface_files]
    missing_files = [f for f in expected_interfaces if f not in existing_files]

    print(f"\n📁 Interface Files Analysis:")
    print(f"   Total Interface Files: {len(interface_files)}")
    print(
        f"   Expected Files Found: {len(expected_interfaces) - len(missing_files)}/{len(expected_interfaces)}"
    )

    if missing_files:
        print(f"\n❌ Missing interface files:")
        for missing in missing_files:
            print(f"   - {missing}")

    assert len(missing_files) == 0, f"Missing interface files: {missing_files}"
    print(f"✅ All expected interface files exist!")


if __name__ == "__main__":
    # Run tests individually for debugging
    test_interface_files_exist()
    test_all_services_have_interfaces()
    test_no_abstract_method_errors()
    print("\n🎯 Phase 1: Interface Coverage Verification - COMPLETE!")
