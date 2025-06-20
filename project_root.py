"""
TKA Monorepo Project Root Configuration
======================================

This module establishes the canonical project root for the TKA monorepo
and sets up Python paths consistently across all execution contexts.

The TKA monorepo structure:
- TKA/ (root)
  - tka-desktop/ (desktop application)
  - tka-web/ (web applications)
  - data/ (shared data)
  - images/ (shared images)

Import this at the top of any script that needs reliable imports:
    from project_root import ensure_project_setup
    ensure_project_setup()
"""

import os
import sys
from pathlib import Path
from typing import List

# Global flag to prevent duplicate setup
_SETUP_COMPLETED = False


def get_project_root() -> Path:
    """
    Get the absolute path to the TKA monorepo root directory.
    This works regardless of where any script is executed from.

    Returns:
        Path: Absolute path to TKA/ directory (monorepo root)
    """
    return Path(__file__).parent.absolute()


def get_tka_desktop_root() -> Path:
    """
    Get the absolute path to the tka-desktop directory.
    
    Returns:
        Path: Absolute path to TKA/tka-desktop/ directory
    """
    return get_project_root() / "tka-desktop"


def get_import_paths() -> List[Path]:
    """
    Get all required Python import paths for the TKA monorepo.

    Returns:
        List[Path]: All paths that should be in sys.path
    """
    project_root = get_project_root()
    tka_desktop = get_tka_desktop_root()

    return [
        # TKA Desktop paths (most specific first)
        tka_desktop / "modern" / "src",  # Primary modern source code
        tka_desktop / "modern",          # Modern directory
        tka_desktop / "legacy" / "src",  # Legacy source code
        tka_desktop,                     # TKA Desktop root
        project_root,                    # TKA Monorepo root
    ]


def setup_python_paths(force: bool = False) -> bool:
    """
    Setup Python import paths consistently for the entire TKA monorepo.

    Args:
        force: If True, setup even if already completed

    Returns:
        bool: True if setup was successful
    """
    global _SETUP_COMPLETED

    if _SETUP_COMPLETED and not force:
        return True

    try:
        import_paths = get_import_paths()

        # Add paths to sys.path in correct order (most specific first)
        for path in import_paths:
            path_str = str(path)
            if path_str not in sys.path:
                sys.path.insert(0, path_str)

        # Set PYTHONPATH environment variable for subprocess consistency
        pythonpath_parts = [str(p) for p in import_paths]
        existing_pythonpath = os.environ.get("PYTHONPATH", "")

        if existing_pythonpath:
            # Avoid duplicates
            existing_parts = existing_pythonpath.split(os.pathsep)
            pythonpath_parts.extend(
                [p for p in existing_parts if p not in pythonpath_parts]
            )

        os.environ["PYTHONPATH"] = os.pathsep.join(pythonpath_parts)

        _SETUP_COMPLETED = True
        return True

    except Exception as e:
        print(f"ERROR: Failed to setup TKA monorepo paths: {e}")
        return False


def ensure_project_setup() -> bool:
    """
    Ensures TKA monorepo is properly set up. Call this from any entry point.
    This is the main function that should be imported and called.

    Returns:
        bool: True if setup successful
    """
    return setup_python_paths()


def validate_imports() -> bool:
    """
    Validate that key imports work correctly from the TKA monorepo structure.

    Returns:
        bool: True if all key imports work
    """
    test_imports = [
        "presentation.components.workbench",
        "domain.models.core_models", 
        "application.services",
        "infrastructure",
    ]

    for import_name in test_imports:
        try:
            __import__(import_name)
        except ImportError as e:
            print(f"VALIDATION FAILED: Cannot import {import_name}: {e}")
            return False

    print("✅ All key imports validated successfully")
    return True


def print_debug_info():
    """Print debugging information about paths and imports."""
    print("=== TKA MONOREPO IMPORT DEBUG INFO ===")
    print(f"TKA Monorepo Root: {get_project_root()}")
    print(f"TKA Desktop Root: {get_tka_desktop_root()}")
    print(f"Current Working Directory: {Path.cwd()}")
    print(f"Setup Completed: {_SETUP_COMPLETED}")
    print("\nImport Paths:")
    for i, path in enumerate(get_import_paths()):
        exists = "✅" if path.exists() else "❌"
        print(f"  {i+1}. {exists} {path}")

    print(f"\nPython sys.path (first 5 entries):")
    for i, path in enumerate(sys.path[:5]):
        print(f"  {i+1}. {path}")

    print(f"\nPYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")


# BULLETPROOF AUTO-SETUP: This runs automatically when ANY Python file imports this module
# This ensures that AI assistants and developers can run tests with standard commands
# without needing to understand the project's import structure
if __name__ != "__main__":
    try:
        ensure_project_setup()
    except Exception as e:
        # Fail silently to avoid breaking imports, but log the issue
        import warnings
        warnings.warn(f"TKA Monorepo auto-setup failed: {e}", UserWarning)

# Export key constants and functions
PROJECT_ROOT = get_project_root()
TKA_DESKTOP_ROOT = get_tka_desktop_root()
MODERN_SRC = TKA_DESKTOP_ROOT / "modern" / "src"
MODERN_DIR = TKA_DESKTOP_ROOT / "modern"
LEGACY_SRC = TKA_DESKTOP_ROOT / "legacy" / "src"

__all__ = [
    "ensure_project_setup",  # Main function - import and call this
    "get_project_root",
    "get_tka_desktop_root", 
    "setup_python_paths",
    "validate_imports",
    "print_debug_info",
    "PROJECT_ROOT",
    "TKA_DESKTOP_ROOT",
    "MODERN_SRC",
    "MODERN_DIR", 
    "LEGACY_SRC",
]

# If run directly, provide debugging info
if __name__ == "__main__":
    print("TKA Monorepo Project Root Setup")
    ensure_project_setup()
    print_debug_info()
    print("\nValidating imports...")
    validate_imports()
