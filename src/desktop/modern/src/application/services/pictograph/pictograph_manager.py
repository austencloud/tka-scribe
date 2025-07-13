"""
Pictograph Management Service

Consolidated pictograph management service that handles all pictograph-related
operations including creation, updates, dataset management, and data conversion.

REPLACES AND CONSOLIDATES:
- Various pictograph service wrappers
- Fragmented pictograph logic across multiple files

PROVIDES:
- Unified pictograph management interface
- Dataset operations and querying
- V1 to Modern data conversion
- Context-aware pictograph configuration
- CSV data loading and pictograph creation
"""

import uuid
from abc import ABC, abstractmethod
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Tuple, TypedDict, Union

import pandas as pd
from domain.models.arrow_data import ArrowData
from domain.models.beat_data import BeatData
from domain.models.enums import (
    ElementalType,
    GridMode,
    LetterType,
    Location,
    MotionType,
    RotationDirection,
    VTGMode,
)
from domain.models.glyph_data import GlyphData
from domain.models.grid_data import GridData
from domain.models.motion_data import MotionData
from domain.models.pictograph_data import PictographData


class PictographSearchQuery(TypedDict, total=False):
    """Type definition for pictograph search queries."""

    letter: Optional[str]
    motion_type: Optional[str]
    start_position: Optional[str]
    max_results: Optional[int]
    categories: Optional[List[str]]


class PictographContext(Enum):
    """Pictograph context types."""

    SEQUENCE_EDITOR = "sequence_editor"
    STANDALONE_VIEWER = "standalone_viewer"
    DICTIONARY_BROWSER = "dictionary_browser"
    COMPARISON_VIEW = "comparison_view"


class PictographManager:
    """
    Unified pictograph management service consolidating all pictograph operations.

    Provides comprehensive pictograph management including:
    - Pictograph creation and manipulation
    - Dataset management and querying
    - Data conversion between V1 and Modern formats
    - Context-aware configuration
    - Glyph data handling
    """

    def __init__(self):
        self._pictograph_cache: Dict[str, PictographData] = {}
        self._dataset_index: Dict[str, List[str]] = {}

        self._csv_data = None
        self._data_path = (
            Path(__file__).parent.parent.parent.parent.parent.parent
            / "data"
            / "DiamondPictographDataframe.csv"
        )

    def _load_csv_data(self) -> pd.DataFrame:
        """Load CSV data if not already loaded."""
        if self._csv_data is None:
            self._csv_data = pd.read_csv(self._data_path)
        return self._csv_data

    def _matches_query(
        self, pictograph: PictographData, query: PictographSearchQuery
    ) -> bool:
        """Check if pictograph matches search query."""
        if "letter" in query:
            letter = pictograph.letter
            query_letter = query["letter"].lower()
            if query_letter not in letter:
                return False

        # Motion type matching
        if "motion_type" in query:
            query_motion_type = query["motion_type"]
            has_matching_motion = False

            for arrow in pictograph.arrows.values():
                if (
                    arrow
                    and pictograph.motions[arrow.color].motion_type == query_motion_type
                ):
                    has_matching_motion = True
                    break

            if not has_matching_motion:
                return False

        return True
