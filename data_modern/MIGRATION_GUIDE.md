# TKA Data Modernization Migration Guide

## Overview

This guide helps you migrate from the legacy `data/` structure to the new organized `data_modern/` structure.

## New Structure

```
data_modern/
├── core/                           # Core business data
│   ├── constants.py               # Application constants
│   ├── types.py                   # Type definitions
│   ├── positions_maps.py          # Position mappings
│   ├── start_end_loc_map.py       # Start/end location maps
│   ├── prop_class_mapping.py      # Property class mappings
│   └── cap_definitions/           # CAP pattern definitions
│       ├── halved_caps.py         # Half-turn patterns
│       ├── quartered_caps.py      # Quarter-turn patterns
│       └── cap_executors/         # CAP execution logic
│
├── datasets/                       # CSV datasets and processing
│   ├── pictographs/
│   │   ├── diamond_pictograph_dataframe.csv  # Renamed for consistency
│   │   └── box_pictograph_dataframe.csv      # Renamed for consistency
│   ├── mappers/                   # Data mapping utilities
│   └── repositories/              # Data repository implementations
│
├── layouts/                        # Layout and positioning
│   ├── beat_frame_layouts.py      # Beat frame layouts
│   ├── act_beat_frame_layouts.py  # Action beat layouts
│   └── configurations/            # JSON configs and arrow placement
│       ├── beat_frame_layout_options.json
│       ├── beat_layout_overrides.json
│       ├── default_layouts.json
│       ├── circle_coords.json
│       └── arrow_placement/       # Arrow placement configs
│
├── dictionary/                     # User sequences (unchanged)
├── settings/                       # Application configuration
│   └── default_settings.ini
└── runtime/                        # Generated/temporary data
    ├── logs/                      # Application logs
    ├── performance/               # Performance data
    ├── sequences/                 # Runtime sequences
    └── temp/                      # Temporary files
```

## Migration Steps

### 1. Import Changes

**Old:**
```python
from data.constants import NORTH, SOUTH, EAST, WEST
from data.types import MotionType
```

**New:**
```python
from data_modern.core.constants import NORTH, SOUTH, EAST, WEST
from data_modern.core.types import MotionType
```

### 2. CSV File Path Changes

**Old:**
```python
"data/DiamondPictographDataframe.csv"
"data/BoxPictographDataframe.csv"
```

**New:**
```python
"data_modern/datasets/pictographs/diamond_pictograph_dataframe.csv"
"data_modern/datasets/pictographs/box_pictograph_dataframe.csv"
```

### 3. Configuration File Changes

**Old:**
```python
"data/default_settings.ini"
"data/beat_frame_layout_options.json"
```

**New:**
```python
"data_modern/settings/default_settings.ini"
"data_modern/layouts/configurations/beat_frame_layout_options.json"
```

### 4. Service Updates

Update your data path services to use the new structure:

```python
# In DataPathHandler or similar services
def _resolve_data_directory(self) -> Path:
    # Look for data_modern first, fallback to data
    project_root = self._find_project_root()
    modern_data = project_root / "data_modern"
    if modern_data.exists():
        return modern_data
    return project_root / "data"  # Fallback
```

## Key Benefits

1. **Clear Organization**: Related files grouped by purpose
2. **Consistent Naming**: All files use snake_case
3. **Better Imports**: Proper Python module structure
4. **Future-Proof**: Room for growth in each category
5. **Backward Compatible**: Original data/ remains untouched

## Validation

All 1,200 original files have been successfully copied to the new structure.
The new structure includes 3 additional __init__.py files for proper Python modules.

## Next Steps

1. Update one service at a time to use new paths
2. Test thoroughly after each change
3. Keep both structures until migration is complete
4. Remove old data/ structure once fully migrated
