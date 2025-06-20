"""
Validation error classes and result types.
"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field


@dataclass
class FieldValidationError:
    """Validation error for a specific field."""
    field: str
    message: str
    value: Any = None
    code: str = "VALIDATION_ERROR"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'field': self.field,
            'message': self.message,
            'value': str(self.value) if self.value is not None else None,
            'code': self.code
        }


@dataclass
class ValidationResult:
    """Result of validation operation."""
    is_valid: bool
    errors: List[FieldValidationError] = field(default_factory=list)
    warnings: List[FieldValidationError] = field(default_factory=list)
    
    def add_error(self, field: str, message: str, value: Any = None, code: str = "VALIDATION_ERROR"):
        """Add a validation error."""
        self.errors.append(FieldValidationError(field, message, value, code))
        self.is_valid = False
    
    def add_warning(self, field: str, message: str, value: Any = None, code: str = "VALIDATION_WARNING"):
        """Add a validation warning."""
        self.warnings.append(FieldValidationError(field, message, value, code))
    
    def has_errors(self) -> bool:
        """Check if there are any validation errors."""
        return len(self.errors) > 0
    
    def has_warnings(self) -> bool:
        """Check if there are any validation warnings."""
        return len(self.warnings) > 0
    
    def get_error_messages(self) -> List[str]:
        """Get list of error messages."""
        return [error.message for error in self.errors]
    
    def get_warning_messages(self) -> List[str]:
        """Get list of warning messages."""
        return [warning.message for warning in self.warnings]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            'is_valid': self.is_valid,
            'errors': [error.to_dict() for error in self.errors],
            'warnings': [warning.to_dict() for warning in self.warnings],
            'error_count': len(self.errors),
            'warning_count': len(self.warnings)
        }
    
    @classmethod
    def success(cls) -> 'ValidationResult':
        """Create a successful validation result."""
        return cls(is_valid=True)
    
    @classmethod
    def failure(cls, errors: List[FieldValidationError]) -> 'ValidationResult':
        """Create a failed validation result."""
        return cls(is_valid=False, errors=errors)


class ValidationError(Exception):
    """
    Exception raised when validation fails.
    
    Contains detailed information about validation failures
    including field-specific errors and context.
    """
    
    def __init__(self, message: str, validation_result: Optional[ValidationResult] = None, 
                 field: Optional[str] = None, value: Any = None):
        super().__init__(message)
        self.validation_result = validation_result or ValidationResult(is_valid=False)
        self.field = field
        self.value = value
        
        # If no validation result provided but field/value given, create one
        if field and not validation_result:
            self.validation_result.add_error(field, message, value)
    
    def get_errors(self) -> List[FieldValidationError]:
        """Get all validation errors."""
        return self.validation_result.errors
    
    def get_error_dict(self) -> Dict[str, List[str]]:
        """Get errors grouped by field."""
        error_dict = {}
        for error in self.validation_result.errors:
            if error.field not in error_dict:
                error_dict[error.field] = []
            error_dict[error.field].append(error.message)
        return error_dict
    
    def __str__(self) -> str:
        """String representation of validation error."""
        if self.validation_result.has_errors():
            error_messages = self.validation_result.get_error_messages()
            return f"Validation failed: {'; '.join(error_messages)}"
        return super().__str__()


class ValidationException(ValidationError):
    """Alias for ValidationError for backward compatibility."""
    pass
