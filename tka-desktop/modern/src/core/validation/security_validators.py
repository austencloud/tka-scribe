"""
Security-focused validators and input sanitization.
"""

import re
import html
import urllib.parse
from typing import Any, List, Dict, Optional
from pathlib import Path

from .validators import IValidator
from .validation_error import ValidationResult


class InputSanitizer:
    """Utility class for input sanitization."""
    
    @staticmethod
    def sanitize_html(value: str) -> str:
        """Sanitize HTML input to prevent XSS."""
        if not isinstance(value, str):
            return str(value)
        
        # HTML escape
        sanitized = html.escape(value, quote=True)
        
        # Remove potentially dangerous tags
        dangerous_tags = [
            'script', 'iframe', 'object', 'embed', 'form', 'input',
            'button', 'textarea', 'select', 'option', 'link', 'meta'
        ]
        
        for tag in dangerous_tags:
            # Remove opening and closing tags
            sanitized = re.sub(f'<{tag}[^>]*>', '', sanitized, flags=re.IGNORECASE)
            sanitized = re.sub(f'</{tag}>', '', sanitized, flags=re.IGNORECASE)
        
        # Remove javascript: and data: URLs
        sanitized = re.sub(r'javascript:', '', sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r'data:', '', sanitized, flags=re.IGNORECASE)
        
        return sanitized
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent path traversal."""
        if not isinstance(filename, str):
            filename = str(filename)
        
        # Remove path separators and dangerous characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '', filename)
        
        # Remove leading/trailing dots and spaces
        sanitized = sanitized.strip('. ')
        
        # Prevent reserved names on Windows
        reserved_names = [
            'CON', 'PRN', 'AUX', 'NUL',
            'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
            'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
        ]
        
        if sanitized.upper() in reserved_names:
            sanitized = f"_{sanitized}"
        
        # Ensure filename is not empty
        if not sanitized:
            sanitized = "unnamed_file"
        
        return sanitized
    
    @staticmethod
    def sanitize_sql_input(value: str) -> str:
        """Basic SQL injection prevention."""
        if not isinstance(value, str):
            return str(value)
        
        # Remove or escape dangerous SQL characters
        dangerous_chars = ["'", '"', ';', '--', '/*', '*/', 'xp_', 'sp_']
        
        sanitized = value
        for char in dangerous_chars:
            sanitized = sanitized.replace(char, '')
        
        return sanitized
    
    @staticmethod
    def sanitize_path(path: str) -> str:
        """Sanitize file path to prevent directory traversal."""
        if not isinstance(path, str):
            path = str(path)
        
        # Normalize path and remove traversal attempts
        sanitized = Path(path).name  # Get just the filename
        
        # Additional sanitization
        sanitized = re.sub(r'\.\.', '', sanitized)  # Remove ..
        sanitized = re.sub(r'[<>:"|?*]', '', sanitized)  # Remove dangerous chars
        
        return sanitized


class XSSValidator(IValidator):
    """Validator to detect potential XSS attacks."""
    
    def __init__(self, message: str = "Potentially dangerous content detected"):
        self.message = message
        
        # Common XSS patterns
        self.xss_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe[^>]*>',
            r'<object[^>]*>',
            r'<embed[^>]*>',
            r'<form[^>]*>',
            r'data:text/html',
        ]
        
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.xss_patterns]
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate input for XSS patterns."""
        result = ValidationResult(is_valid=True)
        
        if value is None:
            return result
        
        if not isinstance(value, str):
            return result
        
        # Check for XSS patterns
        for pattern in self.compiled_patterns:
            if pattern.search(value):
                result.add_error(field_name, self.message, value)
                break
        
        return result


class SQLInjectionValidator(IValidator):
    """Validator to detect potential SQL injection attacks."""
    
    def __init__(self, message: str = "Potentially dangerous SQL content detected"):
        self.message = message
        
        # Common SQL injection patterns
        self.sql_patterns = [
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)",
            r"(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)",
            r"(--|#|/\*|\*/)",
            r"(\b(xp_|sp_)\w+)",
            r"(\b(CAST|CONVERT|CHAR|ASCII)\s*\()",
            r"(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))",
        ]
        
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.sql_patterns]
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate input for SQL injection patterns."""
        result = ValidationResult(is_valid=True)
        
        if value is None:
            return result
        
        if not isinstance(value, str):
            return result
        
        # Check for SQL injection patterns
        for pattern in self.compiled_patterns:
            if pattern.search(value):
                result.add_error(field_name, self.message, value)
                break
        
        return result


class PathTraversalValidator(IValidator):
    """Validator to detect path traversal attacks."""
    
    def __init__(self, message: str = "Invalid path detected"):
        self.message = message
        
        # Path traversal patterns
        self.traversal_patterns = [
            r'\.\.',
            r'%2e%2e',
            r'%252e%252e',
            r'\.%2e',
            r'%2e\.',
            r'%c0%ae',
            r'%c1%9c',
        ]
        
        self.compiled_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.traversal_patterns]
    
    def validate(self, value: Any, field_name: str = "") -> ValidationResult:
        """Validate input for path traversal patterns."""
        result = ValidationResult(is_valid=True)
        
        if value is None:
            return result
        
        if not isinstance(value, str):
            return result
        
        # Check for path traversal patterns
        for pattern in self.compiled_patterns:
            if pattern.search(value):
                result.add_error(field_name, self.message, value)
                break
        
        # Additional checks
        if value.startswith('/') or value.startswith('\\'):
            result.add_error(field_name, "Absolute paths not allowed", value)
        
        return result


class SecurityValidator:
    """
    Comprehensive security validator combining multiple security checks.
    
    Usage:
        validator = SecurityValidator()
        result = validator.validate_input("user_input", "username")
        
        if not result.is_valid:
            print("Security validation failed:", result.get_error_messages())
    """
    
    def __init__(self, enable_xss: bool = True, enable_sql: bool = True, 
                 enable_path: bool = True, sanitize: bool = True):
        self.enable_xss = enable_xss
        self.enable_sql = enable_sql
        self.enable_path = enable_path
        self.sanitize = sanitize
        
        # Initialize validators
        self.xss_validator = XSSValidator() if enable_xss else None
        self.sql_validator = SQLInjectionValidator() if enable_sql else None
        self.path_validator = PathTraversalValidator() if enable_path else None
        self.sanitizer = InputSanitizer()
    
    def validate_input(self, value: Any, field_name: str = "") -> ValidationResult:
        """
        Perform comprehensive security validation on input.
        
        Args:
            value: Input value to validate
            field_name: Name of the field being validated
            
        Returns:
            ValidationResult with security validation results
        """
        combined_result = ValidationResult(is_valid=True)
        
        if value is None:
            return combined_result
        
        # Run enabled validators
        if self.xss_validator:
            xss_result = self.xss_validator.validate(value, field_name)
            combined_result.errors.extend(xss_result.errors)
            if not xss_result.is_valid:
                combined_result.is_valid = False
        
        if self.sql_validator:
            sql_result = self.sql_validator.validate(value, field_name)
            combined_result.errors.extend(sql_result.errors)
            if not sql_result.is_valid:
                combined_result.is_valid = False
        
        if self.path_validator:
            path_result = self.path_validator.validate(value, field_name)
            combined_result.errors.extend(path_result.errors)
            if not path_result.is_valid:
                combined_result.is_valid = False
        
        return combined_result
    
    def sanitize_input(self, value: str, input_type: str = "general") -> str:
        """
        Sanitize input based on type.
        
        Args:
            value: Input value to sanitize
            input_type: Type of input (html, filename, path, sql, general)
            
        Returns:
            Sanitized input value
        """
        if not isinstance(value, str):
            value = str(value)
        
        if input_type == "html":
            return self.sanitizer.sanitize_html(value)
        elif input_type == "filename":
            return self.sanitizer.sanitize_filename(value)
        elif input_type == "path":
            return self.sanitizer.sanitize_path(value)
        elif input_type == "sql":
            return self.sanitizer.sanitize_sql_input(value)
        else:
            # General sanitization
            sanitized = self.sanitizer.sanitize_html(value)
            return sanitized
    
    def validate_and_sanitize(self, value: str, field_name: str = "", 
                            input_type: str = "general") -> tuple[ValidationResult, str]:
        """
        Validate and sanitize input in one operation.
        
        Args:
            value: Input value
            field_name: Field name for validation
            input_type: Type of input for sanitization
            
        Returns:
            Tuple of (validation_result, sanitized_value)
        """
        validation_result = self.validate_input(value, field_name)
        sanitized_value = self.sanitize_input(value, input_type) if self.sanitize else value
        
        return validation_result, sanitized_value
