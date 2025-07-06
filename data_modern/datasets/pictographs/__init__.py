"""
Pictograph Datasets Module

Contains CSV datasets for diamond and box pictographs.

Files:
- diamond_pictograph_dataframe.csv: Diamond pictograph dataset
- box_pictograph_dataframe.csv: Box pictograph dataset
"""

import os
from pathlib import Path

# Provide easy access to dataset paths
_module_dir = Path(__file__).parent

DIAMOND_CSV_PATH = _module_dir / "diamond_pictograph_dataframe.csv"
BOX_CSV_PATH = _module_dir / "box_pictograph_dataframe.csv"

__all__ = [
    "DIAMOND_CSV_PATH",
    "BOX_CSV_PATH"
]
