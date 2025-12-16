"""
TKA Desktop Import Configuration

This module sets up the Python path to ensure all internal modules resolve correctly.
Import this at the start of your main.py files.
"""

import sys
from pathlib import Path

# Get the desktop root directory
desktop_root = Path(__file__).parent

# Add all necessary paths to sys.path
paths_to_add = [
    str(desktop_root),  # desktop root
    str(desktop_root / "modern" / "src"),  # modern source root
    str(desktop_root / "legacy"),  # legacy source root
    str(desktop_root / "data"),  # data directory
    str(desktop_root.parent),  # TKA root
    str(desktop_root.parent / "src"),  # src directory
]

for path in paths_to_add:
    if path not in sys.path:
        sys.path.insert(0, path)

# Create module aliases for common import patterns
import importlib
import types


def create_module_alias(alias_name: str, target_path: str):
    """Create a module alias in sys.modules."""
    if alias_name not in sys.modules:
        try:
            target_module = importlib.import_module(target_path)
            sys.modules[alias_name] = target_module
        except ImportError:
            # Create a dummy module if target doesn't exist
            dummy_module = types.ModuleType(alias_name)
            sys.modules[alias_name] = dummy_module


# Set up common aliases
module_aliases = {
    "desktop": "modern",
    "src": "modern.src",
    "application": "modern.src.application",
    "presentation": "modern.src.presentation",
    "core": "modern.src.core",
    "domain": "modern.src.domain",
}

for alias, target in module_aliases.items():
    create_module_alias(alias, target)
