"""
Settings Module

Contains application configuration files.

Files:
- default_settings.ini: Default application settings
"""

from pathlib import Path

# Provide easy access to settings file paths
_module_dir = Path(__file__).parent

DEFAULT_SETTINGS_PATH = _module_dir / "default_settings.ini"

__all__ = [
    "DEFAULT_SETTINGS_PATH"
]
