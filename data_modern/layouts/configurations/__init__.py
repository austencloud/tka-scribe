"""
Layout Configurations Module

Contains JSON configuration files and arrow placement data.

Structure:
- beat_frame_layout_options.json: Beat frame layout options
- beat_layout_overrides.json: Layout override configurations
- default_layouts.json: Default layout configurations
- circle_coords.json: Circle coordinate definitions
- arrow_placement/: Arrow placement configurations for box and diamond modes
"""

import json
from pathlib import Path

# Provide easy access to configuration file paths
_module_dir = Path(__file__).parent

BEAT_FRAME_LAYOUT_OPTIONS_PATH = _module_dir / "beat_frame_layout_options.json"
BEAT_LAYOUT_OVERRIDES_PATH = _module_dir / "beat_layout_overrides.json"
DEFAULT_LAYOUTS_PATH = _module_dir / "default_layouts.json"
CIRCLE_COORDS_PATH = _module_dir / "circle_coords.json"
ARROW_PLACEMENT_DIR = _module_dir / "arrow_placement"

def load_json_config(file_path: Path) -> dict:
    """Load a JSON configuration file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Warning: Could not load {file_path}: {e}")
        return {}

__all__ = [
    "BEAT_FRAME_LAYOUT_OPTIONS_PATH",
    "BEAT_LAYOUT_OVERRIDES_PATH", 
    "DEFAULT_LAYOUTS_PATH",
    "CIRCLE_COORDS_PATH",
    "ARROW_PLACEMENT_DIR",
    "load_json_config",
    "arrow_placement"
]
