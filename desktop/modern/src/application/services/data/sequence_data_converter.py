"""
SequenceDataConverter

Facade service that delegates to focused conversion services.
Maintains backward compatibility while using the new focused architecture.
Includes performance optimizations through caching.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
import logging
from typing import Any


# Result pattern removed - using simple exceptions

logger = logging.getLogger(__name__)
from desktop.modern.src.domain.models.beat_data import BeatData
from desktop.modern.src.domain.models.sequence_data import SequenceData

from .legacy_to_modern_converter import LegacyToModernConverter
from .modern_to_legacy_converter import ModernToLegacyConverter
from .sequence_format_adapter import SequenceFormatAdapter


class ISequenceDataConverter(ABC):
    """Interface for sequence data format conversion operations."""

    @abstractmethod
    def convert_legacy_to_beat_data(
        self, beat_dict: dict, beat_number: int
    ) -> BeatData:
        """Convert legacy JSON format back to modern BeatData with full pictograph data."""
        pass

    @abstractmethod
    def convert_legacy_start_position_to_beat_data(
        self, start_pos_dict: dict
    ) -> BeatData:
        """Convert legacy start position JSON back to modern BeatData with full data."""
        pass

    @abstractmethod
    def convert_beat_data_to_legacy_format(
        self, beat: BeatData, beat_number: int
    ) -> dict:
        """Convert modern BeatData to legacy JSON format exactly like legacy pictograph_data."""
        pass

    @abstractmethod
    def convert_start_position_to_legacy_format(
        self, start_position_data: BeatData
    ) -> dict:
        """Convert start position BeatData to legacy format exactly like JsonStartPositionHandler."""
        pass

    @abstractmethod
    def convert_sequence_to_legacy_format(
        self, sequence: SequenceData
    ) -> list[dict[str, Any]]:
        """Convert modern SequenceData back to legacy JSON format with caching."""
        pass

    @abstractmethod
    def extract_end_position_from_position_key(self, position_key: str) -> str:
        """Extract end position from a position key."""
        pass

    @abstractmethod
    def get_cached_end_position(self, beat: BeatData) -> str:
        """Get end position with caching to eliminate redundant calculations."""
        pass


class SequenceDataConverter(ISequenceDataConverter):
    """
    Facade service for converting between legacy JSON format and modern domain models.

    This service delegates to focused services while maintaining the same public interface
    for backward compatibility.
    """

    def __init__(self):
        """Initialize the sequence data converter with focused services and caches."""
        self.legacy_to_modern = LegacyToModernConverter()
        self.modern_to_legacy = ModernToLegacyConverter()
        self.sequence_adapter = SequenceFormatAdapter()

        # Performance optimization: Caches for position calculations and conversions
        self._position_cache = {}
        self._sequence_conversion_cache = {}

    def convert_legacy_to_beat_data(
        self, beat_dict: dict, beat_number: int
    ) -> BeatData:
        """Convert legacy JSON format back to modern BeatData with full pictograph data"""
        try:
            return self.legacy_to_modern.convert_legacy_to_beat_data(
                beat_dict, beat_number
            )
        except Exception as e:
            logger.exception(f"Failed to convert legacy beat data: {e}")
            raise

    def convert_legacy_start_position_to_beat_data(
        self, start_pos_dict: dict
    ) -> BeatData:
        """Convert legacy start position JSON back to modern BeatData with full data"""
        try:
            return self.legacy_to_modern.convert_legacy_start_position_to_beat_data(
                start_pos_dict
            )
        except Exception as e:
            logger.exception(f"Failed to convert legacy start position data: {e}")
            raise

    def convert_beat_data_to_legacy_format(
        self, beat: BeatData, beat_number: int
    ) -> dict:
        """Convert modern BeatData to legacy JSON format exactly like legacy pictograph_data"""
        try:
            legacy_dict = self.modern_to_legacy.convert_beat_data_to_legacy_format(
                beat, beat_number
            )
            return legacy_dict
        except Exception as e:
            logger.exception(f"Failed to convert beat data to legacy format: {e}")
            raise

    def convert_start_position_to_legacy_format(
        self, start_position_data: BeatData
    ) -> dict:
        """Convert start position BeatData to legacy format exactly like JsonStartPositionHandler"""
        try:
            legacy_dict = self.modern_to_legacy.convert_start_position_to_legacy_format(
                start_position_data
            )
            return legacy_dict
        except Exception as e:
            logger.exception(f"Failed to convert start position to legacy format: {e}")
            raise

    def convert_sequence_to_legacy_format(
        self, sequence: SequenceData
    ) -> list[dict[str, Any]]:
        """Convert modern SequenceData back to legacy JSON format with caching"""
        try:
            # Create cache key from sequence hash
            sequence_hash = hash(
                tuple(beat.letter + str(beat.beat_number) for beat in sequence.beats)
            )

            # Check cache first
            if sequence_hash in self._sequence_conversion_cache:
                return self._sequence_conversion_cache[sequence_hash]

            # Use the sequence adapter for the conversion
            legacy_sequence = self.sequence_adapter.convert_sequence_to_legacy_format(
                sequence
            )

            # Apply additional processing for construct tab compatibility
            processed_sequence = self._apply_construct_tab_processing(
                legacy_sequence, sequence
            )

            # Cache the result for future use
            self._sequence_conversion_cache[sequence_hash] = processed_sequence

            # Limit cache size to prevent memory issues
            if len(self._sequence_conversion_cache) > 100:
                # Remove oldest entries (simple FIFO)
                oldest_key = next(iter(self._sequence_conversion_cache))
                del self._sequence_conversion_cache[oldest_key]

            return processed_sequence

        except Exception as e:
            logger.exception(f"Failed to convert sequence to legacy format: {e}")
            raise

    def _convert_beat_to_legacy_dict(self, beat: BeatData) -> dict:
        """Convert a single BeatData to legacy dictionary format"""
        return self.modern_to_legacy.convert_beat_to_legacy_dict(beat)

    def extract_end_position_from_position_key(self, position_key: str) -> str:
        """
        Extract end position from a position key.

        Args:
            position_key: Position key in format "blue_end_red_end"

        Returns:
            End position string
        """
        try:
            # Simple parsing for now - can be enhanced with more complex logic
            if not position_key or "_" not in position_key:
                return "beta5"  # Default fallback

            parts = position_key.split("_")
            if len(parts) < 2:
                return "beta5"  # Default fallback

            blue_end = parts[0]
            red_end = parts[1]

            # Logic to determine combined end position
            # For start positions where both props end at the same location,
            # the end position is just that location (e.g., "alpha1_alpha1" -> "alpha1")
            if blue_end == red_end:
                return blue_end  # Same position - just return the position itself
            # For different positions, use a mapping or algorithm
            # This is placeholder logic that can be enhanced
            result = f"beta{min(5, max(1, ord(blue_end[0]) - ord('a') + 1))}"
            return result

        except Exception as e:
            logger.exception(f"Failed to extract end position from position key: {e}")
            raise

    def get_cached_end_position(self, beat: BeatData) -> str:
        """
        Get end position with caching to eliminate redundant calculations.

        Args:
            beat: BeatData object with motion information

        Returns:
            End position string
        """
        try:
            # Create cache key from motion data
            blue_end = (
                beat.blue_motion.end_loc.value
                if beat.blue_motion and beat.blue_motion.end_loc
                else "s"
            )
            red_end = (
                beat.red_motion.end_loc.value
                if beat.red_motion and beat.red_motion.end_loc
                else "s"
            )

            cache_key = f"{blue_end}_{red_end}"

            # Check cache first
            if cache_key in self._position_cache:
                return self._position_cache[cache_key]

            # Calculate end position
            end_position = self.extract_end_position_from_position_key(cache_key)

            # Cache the result
            self._position_cache[cache_key] = end_position

            return end_position

        except Exception as e:
            logger.exception(f"Failed to get cached end position: {e}")
            raise

    def _apply_construct_tab_processing(
        self, legacy_sequence: list[dict[str, Any]], sequence: SequenceData
    ) -> list[dict[str, Any]]:
        """
        Apply additional processing for construct tab compatibility.

        Args:
            legacy_sequence: Legacy sequence data from sequence adapter
            sequence: Original modern sequence data

        Returns:
            Processed legacy sequence with construct tab compatibility
        """
        try:
            # Process each beat to ensure end_pos is correctly set
            for i in range(1, len(legacy_sequence)):
                beat_dict = legacy_sequence[i]

                # Skip metadata or non-dict items
                if not isinstance(beat_dict, dict) or "beat" not in beat_dict:
                    continue

                # CRITICAL FIX: Use end_pos from metadata if available, otherwise calculate
                if "end_pos" not in beat_dict and i - 1 < len(sequence.beats):
                    beat = sequence.beats[i - 1]

                    # First try to get end_pos from beat metadata
                    metadata_end_pos = (
                        beat.metadata.get("end_pos") if beat.metadata else None
                    )

                    if metadata_end_pos:
                        # Use the correct end position from metadata
                        beat_dict["end_pos"] = metadata_end_pos
                    elif beat.blue_motion and beat.red_motion:
                        # Optimized: Use cached position calculation
                        end_pos = self.get_cached_end_position(beat)
                        beat_dict["end_pos"] = end_pos
                    else:
                        # Final fallback
                        beat_dict["end_pos"] = "beta5"

            return legacy_sequence

        except Exception as e:
            print(f"Error applying construct tab processing: {e}")
            return legacy_sequence

    def clear_caches(self):
        """Clear all caches to free memory"""
        self._position_cache.clear()
        self._sequence_conversion_cache.clear()
        print("🧹 Data conversion caches cleared")
