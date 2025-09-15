"""
Legacy Data Converter Service - REFACTORED

Handles conversion between modern BeatData/PictographData and legacy JSON formats.
This service has been refactored to eliminate code duplication, improve error handling,
and separate concerns following SOLID principles.

ARCHITECTURE:
- Uses MotionDataConverter for all motion-related conversions
- Uses LegacyFormatValidator for input validation
- Uses BeatDataBuilder for complex object construction
- Converts modern data structures to legacy JSON format for persistence
- Converts legacy JSON format back to modern data structures for loading
- Maintains compatibility with existing sequence files
"""
from __future__ import annotations

from abc import ABC, abstractmethod
import logging
from typing import Any

from domain.models.beat_data import BeatData

from .beat_data_builder import BeatDataBuilder
from .legacy_format_validator import LegacyFormatValidator
from .motion_data_converter import MotionDataConverter


logger = logging.getLogger(__name__)


class ILegacyDataConverter(ABC):
    """Interface for legacy data conversion operations."""

    @abstractmethod
    def convert_beat_to_legacy_format(
        self, beat: BeatData, beat_number: int
    ) -> dict[str, Any]:
        """Convert modern BeatData to legacy JSON format exactly like legacy pictograph_data."""
        pass

    @abstractmethod
    def convert_start_position_to_legacy_format(
        self, start_position_data: BeatData
    ) -> dict[str, Any]:
        """Convert start position BeatData to legacy format exactly like JsonStartPositionHandler."""
        pass

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


class LegacyDataConverter:
    """
    Refactored service for converting between modern data structures and legacy JSON formats.

    This service now uses composition to eliminate code duplication and improve maintainability.
    All motion handling is centralized in MotionDataConverter, validation is handled by
    LegacyFormatValidator, and complex object construction uses BeatDataBuilder.
    """

    def __init__(
        self,
        motion_converter: MotionDataConverter = None,
        validator: LegacyFormatValidator = None,
        builder: BeatDataBuilder = None,
    ):
        """
        Initialize converter with optional dependencies for testing.

        Args:
            motion_converter: Handles motion data conversions
            validator: Validates legacy format data
            builder: Builds BeatData objects
        """
        self.motion_converter = motion_converter or MotionDataConverter()
        self.validator = validator or LegacyFormatValidator()
        self.builder = builder or BeatDataBuilder()

    def convert_beat_to_legacy_format(
        self, beat: BeatData, beat_number: int
    ) -> dict[str, Any]:
        """
        Convert modern BeatData to legacy JSON format.

        Args:
            beat: Modern BeatData object
            beat_number: Beat number for legacy format

        Returns:
            Dictionary in legacy JSON format

        Raises:
            ValueError: If beat data is invalid
        """
        if not beat:
            raise ValueError("Beat data cannot be None")

        logger.debug(f"Converting beat {beat.letter} (#{beat_number}) to legacy format")

        # Extract position data from pictograph data if available
        start_pos = ""
        end_pos = ""
        if beat.has_pictograph and beat.pictograph_data:
            start_pos = beat.pictograph_data.start_position or ""
            end_pos = beat.pictograph_data.end_position or ""

        # Extract motion data using centralized converter
        blue_motion = None
        red_motion = None
        if beat.has_pictograph:
            blue_motion = self.motion_converter.extract_motion_from_pictograph(
                "blue", beat.pictograph_data
            )
            red_motion = self.motion_converter.extract_motion_from_pictograph(
                "red", beat.pictograph_data
            )

        # Convert motions to legacy attributes
        blue_attrs = self.motion_converter.create_legacy_motion_attributes(blue_motion)
        red_attrs = self.motion_converter.create_legacy_motion_attributes(red_motion)

        # Determine timing and direction
        timing, direction = self.motion_converter.determine_timing_and_direction(
            blue_motion, red_motion
        )

        legacy_format = {
            "beat": beat_number,
            "letter": beat.letter,
            "start_pos": start_pos,
            "end_pos": end_pos,
            "timing": timing,
            "direction": direction,
            "blue_attributes": blue_attrs,
            "red_attributes": red_attrs,
        }

        logger.debug(f"Successfully converted beat {beat.letter} to legacy format")
        return legacy_format

    def convert_start_position_to_legacy_format(
        self, start_position_data: BeatData
    ) -> dict[str, Any]:
        """
        Convert start position BeatData to legacy format.

        Args:
            start_position_data: Modern BeatData representing start position

        Returns:
            Dictionary in legacy JSON format for start positions

        Raises:
            ValueError: If start position data is invalid
        """
        if not start_position_data:
            raise ValueError("Start position data cannot be None")

        logger.debug(
            f"Converting start position {start_position_data.letter} to legacy format"
        )

        # Extract position data with defaults
        end_pos = "alpha1"
        sequence_start_position = "alpha1"

        if start_position_data.has_pictograph and start_position_data.pictograph_data:
            end_pos = start_position_data.pictograph_data.end_position or "alpha1"
            sequence_start_position = (
                start_position_data.pictograph_data.start_position or "alpha1"
            )

        # Extract motion data using centralized converter
        blue_motion = None
        red_motion = None
        if start_position_data.has_pictograph:
            blue_motion = self.motion_converter.extract_motion_from_pictograph(
                "blue", start_position_data.pictograph_data
            )
            red_motion = self.motion_converter.extract_motion_from_pictograph(
                "red", start_position_data.pictograph_data
            )

        # Convert motions to legacy attributes
        blue_attrs = self.motion_converter.create_legacy_motion_attributes(blue_motion)
        red_attrs = self.motion_converter.create_legacy_motion_attributes(red_motion)

        legacy_format = {
            "beat": 0,
            "sequence_start_position": sequence_start_position,
            "end_pos": end_pos,
            "blue_attributes": blue_attrs,
            "red_attributes": red_attrs,
        }

        logger.debug(
            f"Successfully converted start position {start_position_data.letter} to legacy format"
        )
        return legacy_format

    def convert_legacy_to_beat_data(
        self, beat_dict: dict, beat_number: int
    ) -> BeatData:
        """
        Convert legacy JSON format back to modern BeatData.

        Args:
            beat_dict: Dictionary containing legacy beat data
            beat_number: Beat number for the new BeatData

        Returns:
            Modern BeatData object

        Raises:
            ValueError: If legacy data is invalid or conversion fails
        """
        if not beat_dict:
            raise ValueError("Beat dictionary cannot be None or empty")

        logger.debug(f"Converting legacy beat data to BeatData (beat #{beat_number})")

        # Validate input data
        validation_result = self.validator.validate_beat_dict(beat_dict)
        if not validation_result.is_valid:
            error_msg = (
                f"Invalid legacy beat data: {', '.join(validation_result.errors)}"
            )
            logger.error(error_msg)
            raise ValueError(error_msg)

        # Log any warnings
        for warning in validation_result.warnings:
            logger.warning(f"Legacy beat validation warning: {warning}")

        # Extract basic information
        letter = beat_dict.get("letter", "")
        start_pos = beat_dict.get("start_pos", "")
        end_pos = beat_dict.get("end_pos", "")
        timing = beat_dict.get("timing", "tog")
        direction = beat_dict.get("direction", "same")

        # Convert motion attributes using centralized converter
        blue_motion = None
        red_motion = None

        blue_attrs = beat_dict.get("blue_attributes", {})
        if blue_attrs:
            blue_result = self.motion_converter.create_motion_from_legacy_attributes(
                blue_attrs
            )
            if blue_result.success:
                blue_motion = blue_result.motion_data
            else:
                logger.error(f"Failed to convert blue motion: {blue_result.error}")
                # Use the fallback motion from the result
                blue_motion = blue_result.motion_data

        red_attrs = beat_dict.get("red_attributes", {})
        if red_attrs:
            red_result = self.motion_converter.create_motion_from_legacy_attributes(
                red_attrs
            )
            if red_result.success:
                red_motion = red_result.motion_data
            else:
                logger.error(f"Failed to convert red motion: {red_result.error}")
                # Use the fallback motion from the result
                red_motion = red_result.motion_data

        # Build BeatData using builder pattern
        beat_data = (
            self.builder.reset()
            .with_beat_number(beat_number)
            .with_letter(letter)
            .with_duration(1.0)
            .with_motion_data(blue_motion, red_motion)
            .with_glyph_data(start_pos, end_pos)
            .add_metadata("timing", timing)
            .add_metadata("direction", direction)
            .build()
        )

        logger.debug(f"Successfully converted legacy data to BeatData: {letter}")
        return beat_data

    def convert_legacy_start_position_to_beat_data(
        self, start_pos_dict: dict
    ) -> BeatData:
        """
        Convert legacy start position JSON back to modern BeatData.

        Args:
            start_pos_dict: Dictionary containing legacy start position data

        Returns:
            Modern BeatData object configured as start position

        Raises:
            ValueError: If legacy data is invalid or conversion fails
        """
        if not start_pos_dict:
            raise ValueError("Start position dictionary cannot be None or empty")

        logger.debug("Converting legacy start position data to BeatData")

        # Validate input data
        validation_result = self.validator.validate_start_position_dict(start_pos_dict)
        if not validation_result.is_valid:
            error_msg = f"Invalid legacy start position data: {', '.join(validation_result.errors)}"
            logger.error(error_msg)
            raise ValueError(error_msg)

        # Log any warnings
        for warning in validation_result.warnings:
            logger.warning(f"Legacy start position validation warning: {warning}")

        # Extract basic information
        letter = start_pos_dict.get("letter", "")
        sequence_start_position = start_pos_dict.get(
            "sequence_start_position", "alpha1"
        )
        end_pos = start_pos_dict.get("end_pos", "alpha1")

        # Convert motion attributes using centralized converter
        blue_motion = None
        red_motion = None

        blue_attrs = start_pos_dict.get("blue_attributes", {})
        if blue_attrs:
            blue_result = self.motion_converter.create_motion_from_legacy_attributes(
                blue_attrs
            )
            if blue_result.success:
                blue_motion = blue_result.motion_data
            else:
                logger.error(
                    f"Failed to convert start position blue motion: {blue_result.error}"
                )
                blue_motion = blue_result.motion_data  # Use fallback

        red_attrs = start_pos_dict.get("red_attributes", {})
        if red_attrs:
            red_result = self.motion_converter.create_motion_from_legacy_attributes(
                red_attrs
            )
            if red_result.success:
                red_motion = red_result.motion_data
            else:
                logger.error(
                    f"Failed to convert start position red motion: {red_result.error}"
                )
                red_motion = red_result.motion_data  # Use fallback

        # Build start position BeatData using builder pattern
        start_position_beat = (
            self.builder.reset()
            .with_letter(letter)
            .with_motion_data(blue_motion, red_motion)
            .with_glyph_data(sequence_start_position, end_pos)
            .as_start_position(sequence_start_position)
            .build()
        )

        logger.debug(
            f"Successfully converted legacy start position data to BeatData: {letter}"
        )
        return start_position_beat
