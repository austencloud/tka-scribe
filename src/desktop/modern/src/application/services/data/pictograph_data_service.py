"""
Pictograph Data Service - Focused Pictograph CRUD Operations

Handles all core pictograph data operations including:
- Pictograph creation and manipulation
- Dataset management and querying
- Pictograph caching and indexing
- Category-based organization

This service provides a clean, focused interface for pictograph data operations
while maintaining the proven data management algorithms.
"""

import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from domain.models.arrow_data import ArrowData
from domain.models.beat_data import BeatData
from domain.models.enums import GridMode
from domain.models.grid_data import GridData
from domain.models.pictograph_data import PictographData


class IPictographDataService(ABC):
    """Interface for pictograph data operations."""

    @abstractmethod
    def create_pictograph(
        self, grid_mode: GridMode = GridMode.DIAMOND
    ) -> PictographData:
        """Create a new blank pictograph."""

    @abstractmethod
    def create_from_beat(self, beat_data: BeatData) -> PictographData:
        """Create pictograph from beat data."""

    @abstractmethod
    def update_pictograph_arrows(
        self, pictograph: PictographData, arrows: Dict[str, ArrowData]
    ) -> PictographData:
        """Update arrows in pictograph."""

    @abstractmethod
    def search_dataset(self, query: Dict[str, Any]) -> List[PictographData]:
        """Search pictograph dataset with query."""

    @abstractmethod
    def get_start_position_pictograph(
        self, position_key: str, prop_type: str
    ) -> Optional[BeatData]:
        """Get start position pictograph as BeatData."""

    @abstractmethod
    def add_to_dataset(
        self, pictograph: PictographData, category: str = "user_created"
    ) -> str:
        """Add pictograph to dataset."""


class PictographDataService(IPictographDataService):
    """
    Focused pictograph data service.

    Provides comprehensive pictograph data management including:
    - Pictograph creation and manipulation
    - Dataset management and querying
    - Pictograph caching and indexing
    - Category-based organization
    """

    def __init__(self):
        # Dataset management
        self._pictograph_cache: Dict[str, PictographData] = {}
        self._dataset_index: Dict[str, List[str]] = {}

    def create_pictograph(
        self, grid_mode: GridMode = GridMode.DIAMOND
    ) -> PictographData:
        """Create a new blank pictograph."""
        grid_data = GridData(
            grid_mode=grid_mode,
            center_x=200.0,
            center_y=200.0,
            radius=100.0,
        )

        return PictographData(
            grid_data=grid_data,
            arrows={},
            props={},
            is_blank=True,
            metadata={"created_by": "pictograph_data_service"},
        )

    def create_from_beat(self, beat_data: BeatData) -> PictographData:
        """Create pictograph from beat data."""
        pictograph = self.create_pictograph()

        # Add arrows and motions based on beat data
        arrows = {}
        motions = {}

        if beat_data.pictograph_data and beat_data.pictograph_data.motions:
            # Use motion data from pictograph_data if available
            if "blue" in beat_data.pictograph_data.motions:
                blue_motion = beat_data.pictograph_data.motions["blue"]
                arrows["blue"] = ArrowData(color="blue", is_visible=True)
                motions["blue"] = blue_motion

            if "red" in beat_data.pictograph_data.motions:
                red_motion = beat_data.pictograph_data.motions["red"]
                arrows["red"] = ArrowData(color="red", is_visible=True)
                motions["red"] = red_motion
        else:
            # Fallback: use legacy beat motion fields (deprecated)
            if hasattr(beat_data, "blue_motion") and beat_data.blue_motion:
                arrows["blue"] = ArrowData(color="blue", is_visible=True)
                motions["blue"] = beat_data.blue_motion

            if hasattr(beat_data, "red_motion") and beat_data.red_motion:
                arrows["red"] = ArrowData(color="red", is_visible=True)
                motions["red"] = beat_data.red_motion

        return pictograph.update(
            arrows=arrows,
            motions=motions,  # NEW: Add motions dictionary
            is_blank=len(arrows) == 0,
            metadata={
                "created_from_beat": beat_data.beat_number,
                "letter": beat_data.letter,
            },
        )

    def update_pictograph_arrows(
        self, pictograph: PictographData, arrows: Dict[str, ArrowData]
    ) -> PictographData:
        """Update arrows in pictograph."""
        return pictograph.update(
            arrows=arrows,
            is_blank=len(arrows) == 0,
        )

    def search_dataset(self, query: Dict[str, Any]) -> List[PictographData]:
        """Search pictograph dataset with query."""
        results = []

        # Extract search criteria
        max_results = query.get("max_results", 50)

        # Search through cached pictographs
        for pictograph_id, pictograph in self._pictograph_cache.items():
            if self._matches_query(pictograph, query):
                results.append(pictograph)

                if len(results) >= max_results:
                    break

        return results

    def add_to_dataset(
        self, pictograph: PictographData, category: str = "user_created"
    ) -> str:
        """Add pictograph to dataset."""
        pictograph_id = str(uuid.uuid4())

        # Cache the pictograph
        self._pictograph_cache[pictograph_id] = pictograph

        # Update dataset index
        if category not in self._dataset_index:
            self._dataset_index[category] = []
        self._dataset_index[category].append(pictograph_id)

        return pictograph_id

    def get_dataset_categories(self) -> List[str]:
        """Get all available dataset categories."""
        return list(self._dataset_index.keys())

    def get_pictographs_by_category(self, category: str) -> List[PictographData]:
        """Get all pictographs in a category."""
        pictograph_ids = self._dataset_index.get(category, [])
        return [
            self._pictograph_cache[pid]
            for pid in pictograph_ids
            if pid in self._pictograph_cache
        ]

    def get_pictograph_by_id(self, pictograph_id: str) -> Optional[PictographData]:
        """Get pictograph by ID."""
        return self._pictograph_cache.get(pictograph_id)

    def remove_from_dataset(self, pictograph_id: str) -> bool:
        """Remove pictograph from dataset."""
        if pictograph_id not in self._pictograph_cache:
            return False

        # Remove from cache
        del self._pictograph_cache[pictograph_id]

        # Remove from all categories
        for category, ids in self._dataset_index.items():
            if pictograph_id in ids:
                ids.remove(pictograph_id)

        return True

    def get_dataset_stats(self) -> Dict[str, Any]:
        """Get dataset statistics."""
        return {
            "total_pictographs": len(self._pictograph_cache),
            "categories": {
                category: len(ids) for category, ids in self._dataset_index.items()
            },
            "cache_size": len(self._pictograph_cache),
        }

    def clear_cache(self) -> None:
        """Clear the pictograph cache."""
        self._pictograph_cache.clear()
        self._dataset_index.clear()

    def get_start_position_pictograph(
        self, position_key: str, prop_type: str
    ) -> Optional[BeatData]:
        """Get start position pictograph as BeatData."""
        try:
            # Create a basic start position beat data
            # This is a simplified implementation for testing
            if position_key and prop_type:
                # Map position keys to Greek letters for consistency
                position_to_letter = {
                    "alpha1": "α",
                    "alpha1_alpha1": "α",
                    "beta5": "β",
                    "beta5_beta5": "β",
                    "gamma": "γ",
                    "delta": "δ",
                }

                letter = position_to_letter.get(position_key, "α")  # Default to α

                return BeatData(
                    letter=letter,
                    duration=1.0,
                    beat_number=1,  # Regular beats start from 1
                )
            return None
        except Exception:
            return None

    # Private helper methods

    def _matches_query(self, pictograph: PictographData, query: Dict[str, Any]) -> bool:
        """Check if pictograph matches search query."""
        # Letter matching
        if "letter" in query:
            letter = pictograph.metadata.get("letter", "").lower()
            query_letter = query["letter"].lower()
            if query_letter not in letter:
                return False

        # Motion type matching
        if "motion_type" in query:
            query_motion_type = query["motion_type"]
            has_matching_motion = False

            for arrow in pictograph.arrows.values():
                if (
                    arrow.motion_data
                    and arrow.motion_data.motion_type == query_motion_type
                ):
                    has_matching_motion = True
                    break

            if not has_matching_motion:
                return False

        # Start position matching
        if "start_position" in query:
            query_start_position = query["start_position"]
            has_matching_start = False

            for arrow in pictograph.arrows.values():
                if (
                    arrow.motion_data
                    and arrow.motion_data.start_loc == query_start_position
                ):
                    has_matching_start = True
                    break

            if not has_matching_start:
                return False

        return True
