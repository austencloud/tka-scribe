"""
Core Business Data Module

Contains fundamental business constants, types, and mappings used throughout TKA.

Modules:
- constants: Core application constants
- types: Type definitions and enums
- positions_maps: Position mapping logic
- start_end_loc_map: Start/end location mappings
- prop_class_mapping: Property class mappings
- cap_definitions/: CAP (Continuous Action Pattern) definitions
"""

# Re-export commonly used constants and types
try:
    from .constants import *
    from .types import *
except ImportError:
    pass

__all__ = [
    "constants",
    "types", 
    "positions_maps",
    "start_end_loc_map",
    "prop_class_mapping",
    "cap_definitions"
]
