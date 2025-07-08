"""
Pictograph Dataset Service for Kinetic Constructor

This service provides access to the actual pictograph dataset,
enabling pixel-perfect accuracy for start position selection and motion combinations.
"""

from typing import Any, Dict, List, Optional

import pandas as pd
from domain.models.beat_models import BeatData
from domain.models.enums import Location, MotionType, RotationDirection
from domain.models.motion_models import MotionData
from domain.models.pictograph_models import (
    ArrowData,
    GridData,
    GridMode,
    PictographData,
    PropData,
)
from infrastructure.data_path_handler import DataPathHandler

from .glyph_data_service import GlyphDataService


class PictographDatasetService:
    """
    Service for accessing the pictograph dataset.

    Provides methods to:
    1. Load diamond and box pictograph datasets
    2. Find specific start position entries
    3. Convert dataset entries to modern BeatData format
    4. Generate accurate glyph data from dataset entries
    """

    def __init__(self):
        self._data_handler = DataPathHandler()
        self.glyph_service = GlyphDataService()
        self._diamond_dataset: Optional[pd.DataFrame] = None
        self._box_dataset: Optional[pd.DataFrame] = None
        self._combined_dataset: Optional[pd.DataFrame] = None
        self._load_datasets()

    def _load_datasets(self) -> None:
        """Load the diamond and box pictograph datasets."""
        try:
            self._diamond_dataset = self._data_handler.load_diamond_dataset()
            self._box_dataset = self._data_handler.load_box_dataset()

            if self._diamond_dataset is not None and self._box_dataset is not None:
                self._combined_dataset = pd.concat(
                    [self._diamond_dataset, self._box_dataset], ignore_index=True
                )
            elif self._diamond_dataset is not None:
                self._combined_dataset = self._diamond_dataset
            elif self._box_dataset is not None:
                self._combined_dataset = self._box_dataset

            status = self._data_handler.validate_data_files()
            if not status["diamond_exists"]:
                print(f"⚠️ Diamond dataset not found: {status['diamond_path']}")
            if not status["box_exists"]:
                print(f"⚠️ Box dataset not found: {status['box_path']}")

        except Exception as e:
            print(f"❌ Error loading datasets: {e}")
            self._diamond_dataset = pd.DataFrame()
            self._box_dataset = pd.DataFrame()
            self._combined_dataset = pd.DataFrame()

    def get_start_position_pictograph(
        self, position_key: str, grid_mode: str = "diamond"
    ) -> Optional[BeatData]:
        """
        Get the actual pictograph data for a start position.

        Args:
            position_key: Position key like "alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"
            grid_mode: "diamond" or "box"

        Returns:
            BeatData object with real dataset information, or None if not found
        """
        try:
            # Choose the appropriate dataset
            dataset = (
                self._diamond_dataset if grid_mode == "diamond" else self._box_dataset
            )

            if dataset is None or dataset.empty:
                return None  # Silent return for missing datasets

            # Parse position key
            start_pos, end_pos = position_key.split("_")

            # Find matching entry where start_pos == end_pos (start position entries)
            matching_entries = dataset[
                (dataset["start_pos"] == start_pos) & (dataset["end_pos"] == end_pos)
            ]

            if matching_entries.empty:
                return None  # Silent return for missing entries

            # Take the first matching entry
            entry = matching_entries.iloc[0]

            # Convert to BeatData
            beat_data = self._dataset_entry_to_beat_data(entry)

            return beat_data

        except Exception as e:
            # Only log actual unexpected errors, not validation failures
            if "split" in str(e) or "NoneType" in str(e):
                return None  # Silent return for invalid input format
            print(f"❌ Error getting start position {position_key}: {e}")
            return None

    def get_diamond_start_positions(self) -> List[str]:
        """Get available diamond start position keys."""
        return ["alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"]

    def get_box_start_positions(self) -> List[str]:
        """Get available box start position keys."""
        return ["alpha2_alpha2", "beta4_beta4", "gamma12_gamma12"]

    def get_start_position_pictograph_data(
        self, position_key: str, grid_mode: str = "diamond"
    ) -> Optional[PictographData]:
        """
        Get pictograph data for a start position (proper domain model).

        This method returns PictographData instead of BeatData, which is more
        appropriate for pickers and non-sequence contexts.

        Args:
            position_key: Position key like "alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"
            grid_mode: "diamond" or "box"

        Returns:
            PictographData object with motion data, or None if not found
        """
        try:
            # Parse the position key to get start and end positions
            if "_" not in position_key:
                return None

            start_pos, end_pos = position_key.split("_", 1)

            # Choose the appropriate dataset
            dataset = (
                self._diamond_dataset if grid_mode == "diamond" else self._box_dataset
            )

            if dataset is None or dataset.empty:
                return None

            # Find matching entries
            matching_entries = dataset[
                (dataset["start_pos"] == start_pos) & (dataset["end_pos"] == end_pos)
            ]

            if matching_entries.empty:
                return None

            # Take the first matching entry and convert directly to PictographData
            entry = matching_entries.iloc[0]
            return self._dataset_entry_to_pictograph_data(entry, grid_mode)

        except Exception as e:
            print(f"❌ Error getting pictograph data for {position_key}: {e}")
            return None

    def find_pictograph_by_criteria(
        self, letter: str, start_pos: str, end_pos: str, grid_mode: str = "diamond"
    ) -> Optional[BeatData]:
        """
        Find a pictograph by specific criteria.

        Args:
            letter: Letter to search for
            start_pos: Start position
            end_pos: End position
            grid_mode: "diamond" or "box"

        Returns:
            BeatData object if found, None otherwise
        """
        try:
            dataset = (
                self._diamond_dataset if grid_mode == "diamond" else self._box_dataset
            )

            if dataset is None or dataset.empty:
                return None

            matching_entries = dataset[
                (dataset["letter"] == letter)
                & (dataset["start_pos"] == start_pos)
                & (dataset["end_pos"] == end_pos)
            ]

            if matching_entries.empty:
                return None

            # Take the first matching entry
            entry = matching_entries.iloc[0]
            # Convert to pictograph data first, then to beat data for backward compatibility
            pictograph_data = self._dataset_entry_to_pictograph_data(entry, grid_mode)
            return self._pictograph_data_to_beat_data(pictograph_data)

        except Exception as e:
            print(f"❌ Error finding pictograph: {e}")
            return None

    def _dataset_entry_to_pictograph_data(
        self, entry: pd.Series, grid_mode: str
    ) -> PictographData:
        """
        Convert a dataset entry to PictographData format.

        Args:
            entry: Pandas Series representing a dataset row
            grid_mode: Grid mode ("diamond" or "box")

        Returns:
            PictographData object with proper motion data
        """
        # Parse motion types
        blue_motion_type = self._parse_motion_type(entry["blue_motion_type"])
        red_motion_type = self._parse_motion_type(entry["red_motion_type"])

        # Parse rotation directions
        blue_prop_rot_dir = self._parse_rotation_direction(entry["blue_prop_rot_dir"])
        red_prop_rot_dir = self._parse_rotation_direction(entry["red_prop_rot_dir"])

        # Parse locations
        blue_start_loc = self._parse_location(entry["blue_start_loc"])
        blue_end_loc = self._parse_location(entry["blue_end_loc"])
        red_start_loc = self._parse_location(entry["red_start_loc"])
        red_end_loc = self._parse_location(entry["red_end_loc"])

        # Create motion data
        blue_motion = MotionData(
            motion_type=blue_motion_type,
            prop_rot_dir=blue_prop_rot_dir,
            start_loc=blue_start_loc,
            end_loc=blue_end_loc,
            turns=1.0 if blue_motion_type in [MotionType.PRO, MotionType.ANTI] else 0.0,
            start_ori="in",
            end_ori=(
                "out" if blue_motion_type in [MotionType.PRO, MotionType.ANTI] else "in"
            ),
        )

        red_motion = MotionData(
            motion_type=red_motion_type,
            prop_rot_dir=red_prop_rot_dir,
            start_loc=red_start_loc,
            end_loc=red_end_loc,
            turns=1.0 if red_motion_type in [MotionType.PRO, MotionType.ANTI] else 0.0,
            start_ori="in",
            end_ori=(
                "out" if red_motion_type in [MotionType.PRO, MotionType.ANTI] else "in"
            ),
        )

        # Create arrow data using structured models
        blue_arrow = ArrowData(
            motion_data=blue_motion,
            color="blue",
        )

        red_arrow = ArrowData(
            motion_data=red_motion,
            color="red",
        )

        # Create arrows dictionary
        arrows = {
            "blue": blue_arrow,
            "red": red_arrow,
        }

        # Create grid data using enum
        grid_data = GridData(
            grid_mode=GridMode.DIAMOND if grid_mode == "diamond" else GridMode.BOX
        )

        # Create pictograph data using Pydantic model
        return PictographData(
            grid_data=grid_data,
            arrows=arrows,
            props={},  # Props will be generated during rendering
            letter=entry["letter"],
            start_position=entry.get("start_pos"),
            end_position=entry.get("end_pos"),
            metadata={
                "is_start_position": True,
                "source": "dataset",
            },
        )

    def _parse_motion_type(self, motion_type_str: str) -> MotionType:
        """Parse motion type string to MotionType enum."""
        motion_type_map = {
            "pro": MotionType.PRO,
            "anti": MotionType.ANTI,
            "static": MotionType.STATIC,
            "dash": MotionType.DASH,
        }
        return motion_type_map.get(motion_type_str.lower(), MotionType.STATIC)

    def _parse_rotation_direction(self, rot_dir_str: str) -> RotationDirection:
        """Parse rotation direction string to RotationDirection enum."""
        rot_dir_map = {
            "cw": RotationDirection.CLOCKWISE,
            "ccw": RotationDirection.COUNTER_CLOCKWISE,
            "no_rot": RotationDirection.NO_ROTATION,
        }
        return rot_dir_map.get(rot_dir_str.lower(), RotationDirection.NO_ROTATION)

    def _parse_location(self, location_str: str) -> Location:
        """Parse location string to Location enum."""
        location_map = {
            "n": Location.NORTH,
            "ne": Location.NORTHEAST,
            "e": Location.EAST,
            "se": Location.SOUTHEAST,
            "s": Location.SOUTH,
            "sw": Location.SOUTHWEST,
            "w": Location.WEST,
            "nw": Location.NORTHWEST,
        }
        return location_map.get(location_str.lower(), Location.NORTH)

    def _beat_data_to_pictograph_data(
        self, beat_data: BeatData, grid_mode: str
    ) -> PictographData:
        """
        Convert BeatData to PictographData.

        This extracts the pictograph-specific data from a BeatData object
        and creates a proper PictographData domain model.
        """
        # Create arrow data using structured models
        arrows = {}

        if beat_data.blue_motion:
            arrows["blue"] = ArrowData(
                motion_data=beat_data.blue_motion,
                color="blue",
            )

        if beat_data.red_motion:
            arrows["red"] = ArrowData(
                motion_data=beat_data.red_motion,
                color="red",
            )

        # Create grid data using enum
        grid_data = GridData(
            grid_mode=GridMode.DIAMOND if grid_mode == "diamond" else GridMode.BOX
        )

        # Create pictograph data using Pydantic model
        return PictographData(
            grid_data=grid_data,
            arrows=arrows,
            props={},  # Props will be generated during rendering
            letter=beat_data.letter,
            metadata={
                "is_start_position": True,
                "source": "dataset",
            },
        )

    def get_dataset_info(self) -> Dict[str, Any]:
        """Get information about the loaded datasets."""
        return {
            "diamond_loaded": self._diamond_dataset is not None
            and not self._diamond_dataset.empty,
            "box_loaded": self._box_dataset is not None and not self._box_dataset.empty,
            "diamond_entries": (
                len(self._diamond_dataset) if self._diamond_dataset is not None else 0
            ),
            "box_entries": (
                len(self._box_dataset) if self._box_dataset is not None else 0
            ),
            "total_entries": (
                len(self._combined_dataset) if self._combined_dataset is not None else 0
            ),
        }
