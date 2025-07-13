"""
Sequence Option Service - Pure Business Logic

Handles sequence state analysis and option generation without Qt dependencies.
Extracted from option_picker_scroll.py to maintain clean architecture.
"""

from typing import Dict, List

from application.services.positioning.arrows.utilities.pictograph_position_matcher import (
    PictographPositionMatcher,
)
from domain.models.letter_type_classifier import LetterTypeClassifier
from domain.models.pictograph_data import PictographData
from domain.models.sequence_data import SequenceData
from presentation.components.option_picker.types.letter_types import LetterType


class SequenceOptionService:
    """
    Pure service for generating options based on sequence state.

    No Qt dependencies - returns domain data only.
    """

    def __init__(self, position_matcher: PictographPositionMatcher):
        """Initialize with position matcher dependency."""
        self._position_matcher = position_matcher

    def get_options_for_sequence(
        self, sequence_data: SequenceData
    ) -> Dict[LetterType, List[PictographData]]:
        """
        Get options organized by letter type for given sequence state.

        Returns pure domain data - no Qt objects.
        """
        try:
            # Extract end position from sequence
            end_position = self._extract_end_position(sequence_data)
            if not end_position:
                print(
                    "❌ [SEQUENCE_OPTION] Could not extract end position from sequence"
                )
                return {}

            # Get all valid next options
            all_options = self._position_matcher.get_next_options(end_position)

            # Group by letter type
            return self._group_options_by_type(all_options)

        except Exception as e:
            print(f"❌ [SEQUENCE_OPTION] Error getting options for sequence: {e}")
            return {}

    def _extract_end_position(self, sequence_data: SequenceData) -> str:
        """
        Extract end position from sequence data.

        Pure data extraction logic - no Qt dependencies.
        """
        try:
            # If sequence has no beats, use alpha1
            if not sequence_data:
                return "alpha1"  # Default start position

            # Handle different sequence data types
            if hasattr(sequence_data, "length"):
                if sequence_data.length == 0:
                    return "alpha1"
            elif hasattr(sequence_data, "__len__"):
                if len(sequence_data) == 0:
                    return "alpha1"

            # If sequence only has start position (no actual beats), use alpha1
            if not sequence_data.beats or len(sequence_data.beats) == 0:
                return "alpha1"

            # Get the last beat from the beats list
            if sequence_data.beats:
                last_beat = sequence_data.beats[-1]

                # BeatData objects have pictograph_data with end_pos
                if hasattr(last_beat, "pictograph_data") and last_beat.pictograph_data:
                    end_pos = last_beat.pictograph_data.end_position
                    print(
                        f"🔍 [SEQUENCE_OPTION] Extracted end position: {end_pos} from beat {last_beat.beat_number}"
                    )
                    return end_pos or "alpha1"
                # Fallback for dict-based data
                elif isinstance(last_beat, dict) and "end_pos" in last_beat:
                    return last_beat["end_pos"]
                elif isinstance(last_beat, dict) and "end_position" in last_beat:
                    return last_beat["end_position"]

            return "alpha1"  # Default fallback

        except Exception as e:
            print(f"❌ [SEQUENCE_OPTION] Error extracting end position: {e}")
            return "alpha1"

    def _group_options_by_type(
        self, options: List[PictographData]
    ) -> Dict[LetterType, List[PictographData]]:
        """
        Group options by their letter type.

        Pure data processing - no Qt dependencies.
        """
        options_by_type = {}

        for option in options:
            letter = option.letter
            if letter:
                letter_type = LetterTypeClassifier.get_letter_type(letter)
                if letter_type not in options_by_type:
                    options_by_type[letter_type] = []
                options_by_type[letter_type].append(option)

        return options_by_type

    def validate_sequence_state(self, sequence_data: SequenceData) -> bool:
        """
        Validate that sequence data is in a valid state for option generation.

        Pure validation logic - no Qt dependencies.
        """
        try:
            if not sequence_data:
                return False

            # Check if we can extract a valid end position
            end_position = self._extract_end_position(sequence_data)
            return bool(end_position and end_position != "")

        except Exception as e:
            print(f"❌ [SEQUENCE_OPTION] Error validating sequence state: {e}")
            return False
