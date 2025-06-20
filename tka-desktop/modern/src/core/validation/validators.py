"""
Core validation framework with builder pattern.
"""

import re
from abc import ABC, abstractmethod
from typing import Any, List, Callable, Optional, Union, Pattern
from .validation_error import ValidationResult, FieldValidationError


class IValidator(ABC):
    """Interface for all validators."""
    
    @abstractmethod
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """
        Validate a value.
        
        Args:
            value: Value to validate
            field_name: Name of the field being validated
            
        Returns:
            ValidationResult with success/failure and error details
        """
        pass


class RequiredValidator(IValidator):
    """Validator for required fields."""
    
    def __init__(self, message: str = "This field is required"):
        self.message = message
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate that value is not None or empty."""
        result = ValidationResult(is_valid=True)
        
        if value is None:
            result.add_error(field_name, self.message, value)
        elif isinstance(value, str) and not value.strip():
            result.add_error(field_name, self.message, value)
        elif isinstance(value, (list, dict)) and len(value) == 0:
            result.add_error(field_name, self.message, value)
        
        return result


class TypeValidator(IValidator):
    """Validator for type checking."""
    
    def __init__(self, expected_type: Union[type, tuple], message: str = None):
        self.expected_type = expected_type
        self.message = message or f"Value must be of type {self._get_type_name()}"
    
    def _get_type_name(self) -> str:
        """Get human-readable type name."""
        if isinstance(self.expected_type, tuple):
            names = [t.__name__ for t in self.expected_type]
            return " or ".join(names)
        return self.expected_type.__name__
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate that value is of expected type."""
        result = ValidationResult(is_valid=True)
        
        if value is not None and not isinstance(value, self.expected_type):
            result.add_error(field_name, self.message, value)
        
        return result


class RangeValidator(IValidator):
    """Validator for numeric ranges."""
    
    def __init__(self, min_val: Optional[Union[int, float]] = None, 
                 max_val: Optional[Union[int, float]] = None,
                 message: str = None):
        self.min_val = min_val
        self.max_val = max_val
        
        if message:
            self.message = message
        elif min_val is not None and max_val is not None:
            self.message = f"Value must be between {min_val} and {max_val}"
        elif min_val is not None:
            self.message = f"Value must be at least {min_val}"
        elif max_val is not None:
            self.message = f"Value must be at most {max_val}"
        else:
            self.message = "Value is out of range"
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate that numeric value is within range."""
        result = ValidationResult(is_valid=True)
        
        if value is None:
            return result
        
        if not isinstance(value, (int, float)):
            result.add_error(field_name, "Value must be a number", value)
            return result
        
        if self.min_val is not None and value < self.min_val:
            result.add_error(field_name, self.message, value)
        elif self.max_val is not None and value > self.max_val:
            result.add_error(field_name, self.message, value)
        
        return result


class LengthValidator(IValidator):
    """Validator for string/collection length."""
    
    def __init__(self, min_length: Optional[int] = None, 
                 max_length: Optional[int] = None,
                 message: str = None):
        self.min_length = min_length
        self.max_length = max_length
        
        if message:
            self.message = message
        elif min_length is not None and max_length is not None:
            self.message = f"Length must be between {min_length} and {max_length}"
        elif min_length is not None:
            self.message = f"Length must be at least {min_length}"
        elif max_length is not None:
            self.message = f"Length must be at most {max_length}"
        else:
            self.message = "Invalid length"
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate length of string or collection."""
        result = ValidationResult(is_valid=True)
        
        if value is None:
            return result
        
        try:
            length = len(value)
        except TypeError:
            result.add_error(field_name, "Value must have a length", value)
            return result
        
        if self.min_length is not None and length < self.min_length:
            result.add_error(field_name, self.message, value)
        elif self.max_length is not None and length > self.max_length:
            result.add_error(field_name, self.message, value)
        
        return result


class PatternValidator(IValidator):
    """Validator for regex patterns."""
    
    def __init__(self, pattern: Union[str, Pattern], message: str = "Invalid format"):
        if isinstance(pattern, str):
            self.pattern = re.compile(pattern)
        else:
            self.pattern = pattern
        self.message = message
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate that value matches regex pattern."""
        result = ValidationResult(is_valid=True)
        
        if value is None:
            return result
        
        if not isinstance(value, str):
            result.add_error(field_name, "Value must be a string", value)
            return result
        
        if not self.pattern.match(value):
            result.add_error(field_name, self.message, value)
        
        return result


class CustomValidator(IValidator):
    """Validator using custom validation function."""
    
    def __init__(self, validation_func: Callable[[Any], bool], 
                 message: str = "Validation failed"):
        self.validation_func = validation_func
        self.message = message
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate using custom function."""
        result = ValidationResult(is_valid=True)
        
        try:
            if not self.validation_func(value):
                result.add_error(field_name, self.message, value)
        except Exception as e:
            result.add_error(field_name, f"Validation error: {str(e)}", value)
        
        return result


class ValidationBuilder:
    """
    Fluent builder for creating validation chains.
    
    Example:
        validator = ValidationBuilder() \
            .required() \
            .type(str) \
            .length(min_length=3, max_length=50) \
            .pattern(r'^[a-zA-Z0-9_]+$', "Only alphanumeric and underscore allowed") \
            .build()
        
        result = validator.validate("test_value", "username")
    """
    
    def __init__(self):
        self.validators: List[IValidator] = []
    
    def required(self, message: str = "This field is required") -> 'ValidationBuilder':
        """Add required field validation."""
        self.validators.append(RequiredValidator(message))
        return self
    
    def type(self, expected_type: Union[type, tuple], message: str = None) -> 'ValidationBuilder':
        """Add type validation."""
        self.validators.append(TypeValidator(expected_type, message))
        return self
    
    def range(self, min_val: Optional[Union[int, float]] = None, 
              max_val: Optional[Union[int, float]] = None,
              message: str = None) -> 'ValidationBuilder':
        """Add range validation."""
        self.validators.append(RangeValidator(min_val, max_val, message))
        return self
    
    def length(self, min_length: Optional[int] = None, 
               max_length: Optional[int] = None,
               message: str = None) -> 'ValidationBuilder':
        """Add length validation."""
        self.validators.append(LengthValidator(min_length, max_length, message))
        return self
    
    def pattern(self, pattern: Union[str, Pattern], message: str = "Invalid format") -> 'ValidationBuilder':
        """Add regex pattern validation."""
        self.validators.append(PatternValidator(pattern, message))
        return self
    
    def custom(self, validation_func: Callable[[Any], bool], 
               message: str = "Validation failed") -> 'ValidationBuilder':
        """Add custom validation function."""
        self.validators.append(CustomValidator(validation_func, message))
        return self
    
    def build(self) -> 'CompositeValidator':
        """Build the composite validator."""
        return CompositeValidator(self.validators)


class CompositeValidator(IValidator):
    """Validator that combines multiple validators."""
    
    def __init__(self, validators: List[IValidator]):
        self.validators = validators
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Run all validators and combine results."""
        combined_result = ValidationResult(is_valid=True)
        
        for validator in self.validators:
            result = validator.validate(value, field_name)
            
            # Combine errors and warnings
            combined_result.errors.extend(result.errors)
            combined_result.warnings.extend(result.warnings)
            
            # If any validator fails, the combined result fails
            if not result.is_valid:
                combined_result.is_valid = False
        
        return combined_result
