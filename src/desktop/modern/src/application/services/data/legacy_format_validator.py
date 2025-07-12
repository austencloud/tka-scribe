"""
Legacy Format Validator - Validates legacy format data before conversion

Provides comprehensive validation of legacy JSON data to fail fast
on invalid data and provide clear error messages.
"""

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """Result of data validation with detailed error information."""

    is_valid: bool
    errors: List[str]
    warnings: List[str]

    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if self.warnings is None:
            self.warnings = []

    @property
    def has_errors(self) -> bool:
        """Check if there are any validation errors."""
        return len(self.errors) > 0

    @property
    def has_warnings(self) -> bool:
        """Check if there are any validation warnings."""
        return len(self.warnings) > 0


class LegacyFormatValidator:
    """Validates legacy format data before conversion attempts."""

    # Valid enum values for validation
    VALID_MOTION_TYPES = {"static", "pro", "anti", "dash", "float"}
    VALID_ORIENTATIONS = {"in", "out", "clock", "counter"}
    VALID_PROP_ROT_DIRS = {
        "no_rot",
        "cw",
        "ccw",
    }  # Updated to match RotationDirection enum
    VALID_LOCATIONS = {"n", "ne", "e", "se", "s", "sw", "w", "nw"}

    @classmethod
    def validate_beat_dict(cls, beat_dict: dict) -> ValidationResult:
        """
        Validate legacy beat dictionary structure and content.

        Args:
            beat_dict: Dictionary containing legacy beat data

        Returns:
            ValidationResult with validation status and any errors/warnings
        """
        errors = []
        warnings = []

        if not isinstance(beat_dict, dict):
            errors.append("Beat data must be a dictionary")
            return ValidationResult(False, errors, warnings)

        # Validate required fields
        required_fields = ["beat", "letter"]
        for field in required_fields:
            if field not in beat_dict:
                errors.append(f"Missing required field: {field}")

        # Validate beat number
        beat_num = beat_dict.get("beat")
        if beat_num is not None and not isinstance(beat_num, int):
            try:
                int(beat_num)
            except (ValueError, TypeError):
                errors.append(f"Beat number must be an integer, got: {beat_num}")

        # Validate letter
        letter = beat_dict.get("letter")
        if letter is not None and not isinstance(letter, str):
            warnings.append(f"Letter should be string, got: {type(letter).__name__}")

        # Validate position fields
        for pos_field in ["start_pos", "end_pos"]:
            pos_value = beat_dict.get(pos_field)
            if pos_value is not None and not isinstance(pos_value, str):
                warnings.append(
                    f"{pos_field} should be string, got: {type(pos_value).__name__}"
                )

        # Validate timing and direction
        timing = beat_dict.get("timing")
        if timing is not None and timing not in {"tog", "split"}:
            warnings.append(f"Unexpected timing value: {timing}")

        direction = beat_dict.get("direction")
        if direction is not None and direction not in {"same", "opp"}:
            warnings.append(f"Unexpected direction value: {direction}")

        # Validate motion attributes
        for color in ["blue", "red"]:
            attrs_key = f"{color}_attributes"
            attrs = beat_dict.get(attrs_key)
            if attrs is not None:
                attr_errors, attr_warnings = cls._validate_motion_attributes(
                    attrs, color
                )
                errors.extend(attr_errors)
                warnings.extend(attr_warnings)

        is_valid = len(errors) == 0
        return ValidationResult(is_valid, errors, warnings)

    @classmethod
    def validate_start_position_dict(cls, start_pos_dict: dict) -> ValidationResult:
        """
        Validate legacy start position dictionary structure and content.

        Args:
            start_pos_dict: Dictionary containing legacy start position data

        Returns:
            ValidationResult with validation status and any errors/warnings
        """
        errors = []
        warnings = []

        if not isinstance(start_pos_dict, dict):
            errors.append("Start position data must be a dictionary")
            return ValidationResult(False, errors, warnings)

        # Validate beat number (should be 0 for start positions)
        beat_num = start_pos_dict.get("beat")
        if beat_num is not None and beat_num != 0:
            warnings.append(f"Start position beat number should be 0, got: {beat_num}")

        # Validate sequence_start_position
        seq_start_pos = start_pos_dict.get("sequence_start_position")
        if seq_start_pos is not None and not isinstance(seq_start_pos, str):
            warnings.append(
                f"sequence_start_position should be string, got: {type(seq_start_pos).__name__}"
            )

        # Validate end_pos
        end_pos = start_pos_dict.get("end_pos")
        if end_pos is not None and not isinstance(end_pos, str):
            warnings.append(f"end_pos should be string, got: {type(end_pos).__name__}")

        # Validate motion attributes
        for color in ["blue", "red"]:
            attrs_key = f"{color}_attributes"
            attrs = start_pos_dict.get(attrs_key)
            if attrs is not None:
                attr_errors, attr_warnings = cls._validate_motion_attributes(
                    attrs, color
                )
                errors.extend(attr_errors)
                warnings.extend(attr_warnings)

        is_valid = len(errors) == 0
        return ValidationResult(is_valid, errors, warnings)

    @classmethod
    def _validate_motion_attributes(
        cls, attrs: Any, color: str
    ) -> tuple[List[str], List[str]]:
        """
        Validate motion attributes for a specific color.

        Args:
            attrs: Motion attributes to validate
            color: Color name for error messages

        Returns:
            Tuple of (errors, warnings) lists
        """
        errors = []
        warnings = []

        if not isinstance(attrs, dict):
            errors.append(f"{color} attributes must be a dictionary")
            return errors, warnings

        # Validate motion_type
        motion_type = attrs.get("motion_type")
        if motion_type and motion_type not in cls.VALID_MOTION_TYPES:
            warnings.append(f"Unknown {color} motion_type: {motion_type}")

        # Validate orientations
        for ori_field in ["start_ori", "end_ori"]:
            orientation = attrs.get(ori_field)
            if orientation and orientation not in cls.VALID_ORIENTATIONS:
                warnings.append(f"Unknown {color} {ori_field}: {orientation}")

        # Validate prop_rot_dir
        prop_rot_dir = attrs.get("prop_rot_dir")
        if prop_rot_dir and prop_rot_dir not in cls.VALID_PROP_ROT_DIRS:
            warnings.append(f"Unknown {color} prop_rot_dir: {prop_rot_dir}")

        # Validate locations
        for loc_field in ["start_loc", "end_loc"]:
            location = attrs.get(loc_field)
            if location and location not in cls.VALID_LOCATIONS:
                warnings.append(f"Unknown {color} {loc_field}: {location}")

        # Validate turns
        turns = attrs.get("turns")
        if turns is not None:
            try:
                float(turns)
            except (ValueError, TypeError):
                warnings.append(f"Invalid {color} turns value: {turns}")

        return errors, warnings
