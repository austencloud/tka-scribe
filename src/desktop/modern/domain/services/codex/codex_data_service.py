"""
Codex Data Service

Provides pictograph data for the codex, converting legacy letter mappings
to modern PictographData objects.
"""

from __future__ import annotations

import logging

from legacy.data.constants import (
    ALPHA1,
    ALPHA3,
    ALPHA5,
    ALPHA7,
    ANTI,
    BETA1,
    BETA3,
    BETA5,
    BETA7,
    BLUE,
    DASH,
    END_POS,
    GAMMA1,
    GAMMA3,
    GAMMA5,
    GAMMA7,
    GAMMA11,
    GAMMA13,
    GAMMA15,
    MOTION_TYPE,
    PRO,
    RED,
    START_POS,
    STATIC,
)
from legacy.enums.letter.letter import Letter
from legacy.enums.letter.letter_type import LetterType

from desktop.modern.domain.models.pictograph_data import PictographData


logger = logging.getLogger(__name__)


class CodexDataService:
    """
    Service for managing codex pictograph data.

    Converts legacy letter mappings to modern PictographData objects
    and provides organized access to all codex pictographs.
    """

    # Letter organization from legacy codex
    ROWS = [
        ["A", "B", "C", "D", "E", "F"],
        ["G", "H", "I", "J", "K", "L"],
        ["M", "N", "O", "P", "Q", "R"],
        ["S", "T", "U", "V"],
        ["W", "X", "Y", "Z"],
        ["Σ", "Δ", "θ", "Ω"],
        ["W-", "X-", "Y-", "Z-"],
        ["Σ-", "Δ-", "θ-", "Ω-"],
        ["Φ", "Ψ", "Λ"],
        ["Φ-", "Ψ-", "Λ-"],
        ["α", "β", "Γ"],
    ]

    def __init__(self, pictograph_data_service=None):
        self._pictograph_cache: dict[str, PictographData | None] = {}
        self.pictograph_data_service = pictograph_data_service
        self._initialize_pictograph_data()

    def _initialize_pictograph_data(self) -> None:
        """Initialize pictograph data for all letters."""
        logger.debug("Initializing codex pictograph data")

        # Get all letters from the Letter enum
        letters = [letter.value for letter in Letter]

        for letter in letters:
            try:
                # Get the legacy parameters for this letter
                legacy_params = self._get_legacy_pictograph_params(letter)
                if legacy_params:
                    # Use dataset service to get real pictograph data
                    pictograph_data = self._get_pictograph_from_dataset(
                        letter, legacy_params
                    )
                    self._pictograph_cache[letter] = pictograph_data
                else:
                    self._pictograph_cache[letter] = None
                    logger.debug(f"No parameters found for letter: {letter}")
            except Exception as e:
                logger.warning(f"Failed to initialize data for letter {letter}: {e}")
                self._pictograph_cache[letter] = None

    def _get_legacy_pictograph_params(self, letter: str) -> dict | None:
        """Get legacy pictograph parameters for a letter."""
        # Import additional constants here to avoid IDE auto-formatting issues

        # This is the complete mapping from the legacy CodexDataManager
        params_map = {
            "A": {
                START_POS: ALPHA1,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "B": {
                START_POS: ALPHA1,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "C": {
                START_POS: ALPHA1,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "D": {
                START_POS: BETA1,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "E": {
                START_POS: BETA1,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "F": {
                START_POS: BETA1,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "G": {
                START_POS: BETA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "H": {
                START_POS: BETA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "I": {
                START_POS: BETA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "J": {
                START_POS: ALPHA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "K": {
                START_POS: ALPHA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "L": {
                START_POS: ALPHA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "M": {
                START_POS: GAMMA11,
                END_POS: GAMMA1,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "N": {
                START_POS: GAMMA11,
                END_POS: GAMMA1,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "O": {
                START_POS: GAMMA11,
                END_POS: GAMMA1,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "P": {
                START_POS: GAMMA1,
                END_POS: GAMMA15,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "Q": {
                START_POS: GAMMA1,
                END_POS: GAMMA15,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "R": {
                START_POS: GAMMA1,
                END_POS: GAMMA15,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "S": {
                START_POS: GAMMA13,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "T": {
                START_POS: GAMMA13,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "U": {
                START_POS: GAMMA13,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": ANTI,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "V": {
                START_POS: GAMMA13,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": PRO,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "W": {
                START_POS: GAMMA13,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "X": {
                START_POS: GAMMA13,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "Y": {
                START_POS: GAMMA11,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "Z": {
                START_POS: GAMMA11,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "Σ": {
                START_POS: ALPHA3,
                END_POS: GAMMA13,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "Δ": {
                START_POS: ALPHA3,
                END_POS: GAMMA13,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "θ": {
                START_POS: BETA5,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "Ω": {
                START_POS: BETA5,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "W-": {
                START_POS: GAMMA5,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "X-": {
                START_POS: GAMMA5,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "Y-": {
                START_POS: GAMMA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "Z-": {
                START_POS: GAMMA3,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "Σ-": {
                START_POS: BETA3,
                END_POS: GAMMA13,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "Δ-": {
                START_POS: BETA3,
                END_POS: GAMMA13,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "θ-": {
                START_POS: ALPHA5,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": PRO,
            },
            "Ω-": {
                START_POS: ALPHA5,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": ANTI,
            },
            "Φ": {
                START_POS: BETA7,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": DASH,
            },
            "Ψ": {
                START_POS: ALPHA1,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": DASH,
            },
            "Λ": {
                START_POS: GAMMA7,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": DASH,
            },
            "Φ-": {
                START_POS: ALPHA3,
                END_POS: ALPHA7,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": DASH,
            },
            "Ψ-": {
                START_POS: BETA1,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": DASH,
            },
            "Λ-": {
                START_POS: GAMMA15,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": DASH,
                f"{RED}_{MOTION_TYPE}": DASH,
            },
            "α": {
                START_POS: ALPHA3,
                END_POS: ALPHA3,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": STATIC,
            },
            "β": {
                START_POS: BETA5,
                END_POS: BETA5,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": STATIC,
            },
            "Γ": {
                START_POS: GAMMA11,
                END_POS: GAMMA11,
                f"{BLUE}_{MOTION_TYPE}": STATIC,
                f"{RED}_{MOTION_TYPE}": STATIC,
            },
        }

        return params_map.get(letter)

    def _create_pictograph_data(
        self, letter: str, legacy_params: dict
    ) -> PictographData:
        """Create PictographData from legacy parameters."""
        from desktop.modern.domain.models.arrow_data import ArrowData
        from desktop.modern.domain.models.grid_data import GridData
        from desktop.modern.domain.models.motion_data import MotionData

        # Extract motion parameters
        start_pos = legacy_params[START_POS]
        end_pos = legacy_params[END_POS]
        blue_motion_type = legacy_params[f"{BLUE}_{MOTION_TYPE}"]
        red_motion_type = legacy_params[f"{RED}_{MOTION_TYPE}"]

        # Create motion data for blue and red
        motions = {}
        arrows = {}

        # Create blue motion and arrow
        if blue_motion_type != STATIC:
            blue_motion = MotionData(
                motion_type=blue_motion_type,
                start_loc=start_pos,
                end_loc=end_pos,
                start_ori="in",  # Default orientation
                end_ori="out",  # Default orientation
                turns=0,
            )
            motions["blue"] = blue_motion

            blue_arrow = ArrowData(
                color="blue",
                start_loc=start_pos,
                end_loc=end_pos,
                motion_type=blue_motion_type,
            )
            arrows["blue"] = blue_arrow

        # Create red motion and arrow
        if red_motion_type != STATIC:
            red_motion = MotionData(
                motion_type=red_motion_type,
                start_loc=start_pos,
                end_loc=end_pos,
                start_ori="in",  # Default orientation
                end_ori="out",  # Default orientation
                turns=0,
            )
            motions["red"] = red_motion

            red_arrow = ArrowData(
                color="red",
                start_loc=start_pos,
                end_loc=end_pos,
                motion_type=red_motion_type,
            )
            arrows["red"] = red_arrow

        # Create grid data
        grid_data = GridData(grid_mode="diamond")

        # Create the pictograph data
        return PictographData(
            letter=letter,
            start_position=start_pos,
            end_position=end_pos,
            grid_data=grid_data,
            arrows=arrows,
            motions=motions,
            props={},  # No props for basic codex pictographs
            metadata={"source": "codex_legacy_conversion"},
        )

    def _get_pictograph_from_dataset(
        self, letter: str, legacy_params: dict
    ) -> PictographData | None:
        """Get real pictograph data from dataset service."""
        if not self.pictograph_data_service:
            # Fallback to basic data creation if no dataset service
            logger.debug(
                "No pictograph data service available, using fallback data creation"
            )
            return self._create_pictograph_data(letter, legacy_params)

        try:
            # Get the dataset from the service
            dataset = self.pictograph_data_service.get_pictograph_dataset()
            letter_data_list = dataset.get(letter, [])

            # Find matching pictograph data
            for pictograph_entry in letter_data_list:
                # Check if this entry matches our legacy parameters
                if self._matches_legacy_params(pictograph_entry, legacy_params):
                    # Extract the PictographData from the entry
                    if (
                        isinstance(pictograph_entry, dict)
                        and "data" in pictograph_entry
                    ):
                        return pictograph_entry["data"]
                    elif hasattr(pictograph_entry, "pictograph_data"):
                        return pictograph_entry.pictograph_data
                    else:
                        # Try to convert the entry directly
                        return PictographData.from_dict(pictograph_entry)

            # If no exact match found, use the first available entry for this letter
            if letter_data_list:
                logger.debug(
                    f"No exact match for {letter}, using first available entry"
                )
                first_entry = letter_data_list[0]
                if isinstance(first_entry, dict) and "data" in first_entry:
                    return first_entry["data"]
                elif hasattr(first_entry, "pictograph_data"):
                    return first_entry.pictograph_data
                else:
                    return PictographData.from_dict(first_entry)

            # No data found, fallback to basic creation
            logger.debug(f"No dataset entry found for letter {letter}, using fallback")
            return self._create_pictograph_data(letter, legacy_params)

        except Exception as e:
            logger.warning(f"Failed to get pictograph from dataset for {letter}: {e}")
            return self._create_pictograph_data(letter, legacy_params)

    def _matches_legacy_params(
        self, pictograph_entry: dict, legacy_params: dict
    ) -> bool:
        """Check if a pictograph entry matches legacy parameters."""
        try:
            # Handle different data formats
            if isinstance(pictograph_entry, dict):
                if "data" in pictograph_entry:
                    # Extract from nested data structure
                    data = pictograph_entry["data"]
                    if hasattr(data, "to_dict"):
                        entry_dict = data.to_dict()
                    else:
                        entry_dict = data
                else:
                    entry_dict = pictograph_entry
            else:
                # Assume it has a to_dict method
                entry_dict = pictograph_entry.to_dict()

            # Check start_pos, end_pos, and motion types
            return (
                entry_dict.get(START_POS) == legacy_params.get(START_POS)
                and entry_dict.get(END_POS) == legacy_params.get(END_POS)
                and entry_dict.get(f"{BLUE}_{MOTION_TYPE}")
                == legacy_params.get(f"{BLUE}_{MOTION_TYPE}")
                and entry_dict.get(f"{RED}_{MOTION_TYPE}")
                == legacy_params.get(f"{RED}_{MOTION_TYPE}")
            )
        except Exception as e:
            logger.debug(f"Error matching legacy params: {e}")
            return False

    def get_pictograph_data(self, letter: str) -> PictographData | None:
        """Get pictograph data for a specific letter."""
        return self._pictograph_cache.get(letter)

    def get_all_pictograph_data(self) -> dict[str, PictographData | None]:
        """Get all pictograph data."""
        return self._pictograph_cache.copy()

    def get_letters_by_row(self) -> list[list[str]]:
        """Get letters organized by rows for grid display."""
        return self.ROWS

    def get_letters_by_type(self, letter_type: LetterType) -> list[str]:
        """Get letters filtered by letter type."""
        # This would need to be implemented based on how letter types are determined
        # For now, return all letters
        return [
            letter
            for letter in self._pictograph_cache.keys()
            if self._pictograph_cache[letter] is not None
        ]

    def refresh_data(self) -> None:
        """Refresh all pictograph data."""
        self._pictograph_cache.clear()
        self._initialize_pictograph_data()
        logger.info("Codex pictograph data refreshed")
