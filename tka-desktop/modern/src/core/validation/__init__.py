"""
TKA Desktop Validation & Security Module

A+ Enhancement: Comprehensive input validation, security headers, and validation
builder patterns for robust data integrity and security.

ARCHITECTURE: Provides validation framework with builder patterns, security
utilities, and comprehensive input sanitization for data integrity.

EXPORTS:
- ValidationBuilder: Fluent validation builder
- IValidator: Validator interface
- ValidationError: Validation error class
- SecurityValidator: Security-focused validators
- InputSanitizer: Input sanitization utilities
- validate_required: Common validation functions
"""

# Validation Framework Components
from .validators import (
    IValidator,
    ValidationBuilder,
    RequiredValidator,
    TypeValidator,
    RangeValidator,
    LengthValidator,
    PatternValidator,
    CustomValidator,
)

from .validation_error import (
    ValidationError,
    ValidationResult,
    FieldValidationError,
)

from .security_validators import (
    SecurityValidator,
    InputSanitizer,
    XSSValidator,
    SQLInjectionValidator,
    PathTraversalValidator,
)

from .common_validators import (
    validate_required,
    validate_email,
    validate_url,
    validate_filename,
    validate_sequence_name,
    validate_beat_data,
)

__all__ = [
    "IValidator",
    "ValidationBuilder",
    "RequiredValidator",
    "TypeValidator", 
    "RangeValidator",
    "LengthValidator",
    "PatternValidator",
    "CustomValidator",
    "ValidationError",
    "ValidationResult",
    "FieldValidationError",
    "SecurityValidator",
    "InputSanitizer",
    "XSSValidator",
    "SQLInjectionValidator",
    "PathTraversalValidator",
    "validate_required",
    "validate_email",
    "validate_url",
    "validate_filename",
    "validate_sequence_name",
    "validate_beat_data",
]
