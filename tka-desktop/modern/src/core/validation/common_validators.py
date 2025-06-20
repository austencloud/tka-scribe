"""
Common validation functions for TKA Desktop.
"""

import re
from typing import Any, Dict, List
from pathlib import Path

from .validation_error import ValidationResult
from .validators import ValidationBuilder


def validate_required(value: Any, field_name: str = "") -> ValidationResult:
    """Validate that a field is required and not empty."""
    validator = ValidationBuilder().required().build()
    return validator.validate(value, field_name)


def validate_email(email: str, field_name: str = "email") -> ValidationResult:
    """Validate email address format."""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    validator = ValidationBuilder() \
        .required("Email is required") \
        .type(str, "Email must be a string") \
        .pattern(email_pattern, "Invalid email format") \
        .build()
    
    return validator.validate(email, field_name)


def validate_url(url: str, field_name: str = "url") -> ValidationResult:
    """Validate URL format."""
    url_pattern = r'^https?://(?:[-\w.])+(?:\:[0-9]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$'
    
    validator = ValidationBuilder() \
        .required("URL is required") \
        .type(str, "URL must be a string") \
        .pattern(url_pattern, "Invalid URL format") \
        .build()
    
    return validator.validate(url, field_name)


def validate_filename(filename: str, field_name: str = "filename") -> ValidationResult:
    """Validate filename for safety and compatibility."""
    def is_valid_filename(name: str) -> bool:
        if not name or not name.strip():
            return False
        
        # Check for dangerous characters
        dangerous_chars = r'[<>:"/\\|?*]'
        if re.search(dangerous_chars, name):
            return False
        
        # Check for reserved names (Windows)
        reserved_names = [
            'CON', 'PRN', 'AUX', 'NUL',
            'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
            'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
        ]
        
        if name.upper() in reserved_names:
            return False
        
        # Check length
        if len(name) > 255:
            return False
        
        return True
    
    validator = ValidationBuilder() \
        .required("Filename is required") \
        .type(str, "Filename must be a string") \
        .length(min_length=1, max_length=255, message="Filename must be 1-255 characters") \
        .custom(is_valid_filename, "Invalid filename format") \
        .build()
    
    return validator.validate(filename, field_name)


def validate_sequence_name(name: str, field_name: str = "sequence_name") -> ValidationResult:
    """Validate sequence name for TKA Desktop."""
    def is_valid_sequence_name(seq_name: str) -> bool:
        if not seq_name or not seq_name.strip():
            return False
        
        # Allow alphanumeric, spaces, hyphens, underscores
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', seq_name):
            return False
        
        # Must start with alphanumeric
        if not re.match(r'^[a-zA-Z0-9]', seq_name):
            return False
        
        return True
    
    validator = ValidationBuilder() \
        .required("Sequence name is required") \
        .type(str, "Sequence name must be a string") \
        .length(min_length=1, max_length=100, message="Sequence name must be 1-100 characters") \
        .custom(is_valid_sequence_name, "Sequence name can only contain letters, numbers, spaces, hyphens, and underscores, and must start with a letter or number") \
        .build()
    
    return validator.validate(name, field_name)


def validate_beat_data(beat_data: Dict[str, Any], field_name: str = "beat") -> ValidationResult:
    """Validate beat data structure for TKA Desktop."""
    result = ValidationResult(is_valid=True)
    
    if not isinstance(beat_data, dict):
        result.add_error(field_name, "Beat data must be a dictionary", beat_data)
        return result
    
    # Required fields
    required_fields = ['beat_number']
    for field in required_fields:
        if field not in beat_data:
            result.add_error(f"{field_name}.{field}", f"Required field '{field}' is missing")
        elif beat_data[field] is None:
            result.add_error(f"{field_name}.{field}", f"Required field '{field}' cannot be None")
    
    # Validate beat_number
    if 'beat_number' in beat_data:
        beat_number = beat_data['beat_number']
        if not isinstance(beat_number, int) or beat_number < 1:
            result.add_error(f"{field_name}.beat_number", "Beat number must be a positive integer", beat_number)
    
    # Validate letter if present
    if 'letter' in beat_data and beat_data['letter'] is not None:
        letter = beat_data['letter']
        if not isinstance(letter, str) or len(letter) != 1 or not letter.isalpha():
            result.add_error(f"{field_name}.letter", "Letter must be a single alphabetic character", letter)
    
    # Validate duration if present
    if 'duration' in beat_data and beat_data['duration'] is not None:
        duration = beat_data['duration']
        if not isinstance(duration, (int, float)) or duration <= 0:
            result.add_error(f"{field_name}.duration", "Duration must be a positive number", duration)
    
    # Validate boolean fields
    boolean_fields = ['is_blank', 'blue_reversal', 'red_reversal']
    for field in boolean_fields:
        if field in beat_data and beat_data[field] is not None:
            if not isinstance(beat_data[field], bool):
                result.add_error(f"{field_name}.{field}", f"Field '{field}' must be a boolean", beat_data[field])
    
    return result


def validate_motion_data(motion_data: Dict[str, Any], field_name: str = "motion") -> ValidationResult:
    """Validate motion data structure for TKA Desktop."""
    result = ValidationResult(is_valid=True)
    
    if not isinstance(motion_data, dict):
        result.add_error(field_name, "Motion data must be a dictionary", motion_data)
        return result
    
    # Validate motion_type
    if 'motion_type' in motion_data:
        motion_type = motion_data['motion_type']
        valid_types = ['pro', 'anti', 'static', 'dash', 'shift']
        if motion_type not in valid_types:
            result.add_error(f"{field_name}.motion_type", f"Motion type must be one of: {valid_types}", motion_type)
    
    # Validate prop_rot_dir
    if 'prop_rot_dir' in motion_data:
        prop_rot_dir = motion_data['prop_rot_dir']
        valid_dirs = ['cw', 'ccw']
        if prop_rot_dir not in valid_dirs:
            result.add_error(f"{field_name}.prop_rot_dir", f"Prop rotation direction must be one of: {valid_dirs}", prop_rot_dir)
    
    # Validate locations
    location_fields = ['start_loc', 'end_loc']
    valid_locations = ['alpha', 'beta', 'gamma']
    for field in location_fields:
        if field in motion_data:
            location = motion_data[field]
            if location not in valid_locations:
                result.add_error(f"{field_name}.{field}", f"Location must be one of: {valid_locations}", location)
    
    # Validate orientations
    orientation_fields = ['start_ori', 'end_ori']
    valid_orientations = ['in', 'out', 'clock', 'counter']
    for field in orientation_fields:
        if field in motion_data:
            orientation = motion_data[field]
            if orientation not in valid_orientations:
                result.add_error(f"{field_name}.{field}", f"Orientation must be one of: {valid_orientations}", orientation)
    
    # Validate turns
    if 'turns' in motion_data:
        turns = motion_data['turns']
        if not isinstance(turns, int) or turns < 0 or turns > 4:
            result.add_error(f"{field_name}.turns", "Turns must be an integer between 0 and 4", turns)
    
    return result


def validate_sequence_data(sequence_data: Dict[str, Any], field_name: str = "sequence") -> ValidationResult:
    """Validate complete sequence data structure."""
    result = ValidationResult(is_valid=True)
    
    if not isinstance(sequence_data, dict):
        result.add_error(field_name, "Sequence data must be a dictionary", sequence_data)
        return result
    
    # Validate sequence name
    if 'name' in sequence_data:
        name_result = validate_sequence_name(sequence_data['name'], f"{field_name}.name")
        result.errors.extend(name_result.errors)
        if not name_result.is_valid:
            result.is_valid = False
    else:
        result.add_error(f"{field_name}.name", "Sequence name is required")
    
    # Validate word if present
    if 'word' in sequence_data and sequence_data['word']:
        word = sequence_data['word']
        if not isinstance(word, str) or not word.isalpha():
            result.add_error(f"{field_name}.word", "Word must contain only alphabetic characters", word)
    
    # Validate start_position if present
    if 'start_position' in sequence_data:
        start_pos = sequence_data['start_position']
        valid_positions = ['alpha', 'beta', 'gamma']
        if start_pos not in valid_positions:
            result.add_error(f"{field_name}.start_position", f"Start position must be one of: {valid_positions}", start_pos)
    
    # Validate beats array
    if 'beats' in sequence_data:
        beats = sequence_data['beats']
        if not isinstance(beats, list):
            result.add_error(f"{field_name}.beats", "Beats must be a list", beats)
        else:
            for i, beat in enumerate(beats):
                beat_result = validate_beat_data(beat, f"{field_name}.beats[{i}]")
                result.errors.extend(beat_result.errors)
                if not beat_result.is_valid:
                    result.is_valid = False
    
    return result


def validate_user_input(input_data: Dict[str, Any]) -> ValidationResult:
    """Validate user input data with security checks."""
    from .security_validators import SecurityValidator
    
    result = ValidationResult(is_valid=True)
    security_validator = SecurityValidator()
    
    for key, value in input_data.items():
        if isinstance(value, str):
            # Perform security validation
            security_result = security_validator.validate_input(value, key)
            result.errors.extend(security_result.errors)
            if not security_result.is_valid:
                result.is_valid = False
    
    return result
