"""
Tests for the validation and security system.
"""

import pytest
from core.validation.validators import (
    ValidationBuilder, RequiredValidator, TypeValidator, 
    RangeValidator, LengthValidator, PatternValidator
)
from core.validation.security_validators import (
    SecurityValidator, XSSValidator, SQLInjectionValidator, 
    PathTraversalValidator, InputSanitizer
)
from core.validation.common_validators import (
    validate_sequence_name, validate_beat_data, validate_filename,
    validate_email, validate_url
)
from core.validation.validation_error import ValidationResult

from .fixtures import sample_validation_data


class TestValidationBuilder:
    """Test the validation builder pattern."""
    
    def test_required_validation_success(self):
        """Test successful required field validation."""
        validator = ValidationBuilder().required().build()
        
        result = validator.validate("test_value", "test_field")
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_required_validation_failure(self):
        """Test required field validation failure."""
        validator = ValidationBuilder().required().build()
        
        # Test None value
        result = validator.validate(None, "test_field")
        assert not result.is_valid
        assert len(result.errors) == 1
        assert "required" in result.errors[0].message.lower()
        
        # Test empty string
        result = validator.validate("", "test_field")
        assert not result.is_valid
        assert len(result.errors) == 1
    
    def test_type_validation_success(self):
        """Test successful type validation."""
        validator = ValidationBuilder().type(str).build()
        
        result = validator.validate("test_string", "test_field")
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_type_validation_failure(self):
        """Test type validation failure."""
        validator = ValidationBuilder().type(str).build()
        
        result = validator.validate(123, "test_field")
        
        assert not result.is_valid
        assert len(result.errors) == 1
        assert "type" in result.errors[0].message.lower()
    
    def test_chained_validation_success(self):
        """Test successful chained validation."""
        validator = ValidationBuilder() \
            .required() \
            .type(str) \
            .length(min_length=3, max_length=20) \
            .pattern(r'^[a-zA-Z0-9_]+$') \
            .build()
        
        result = validator.validate("valid_name_123", "test_field")
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_chained_validation_multiple_failures(self):
        """Test chained validation with multiple failures."""
        validator = ValidationBuilder() \
            .required() \
            .type(str) \
            .length(min_length=10, max_length=20) \
            .pattern(r'^[a-zA-Z0-9_]+$') \
            .build()
        
        result = validator.validate("bad@", "test_field")
        
        assert not result.is_valid
        assert len(result.errors) >= 2  # Length and pattern failures


class TestSecurityValidators:
    """Test security-focused validators."""
    
    def test_xss_validator_detects_script_tags(self):
        """Test XSS validator detects script tags."""
        validator = XSSValidator()
        
        malicious_input = "<script>alert('xss')</script>"
        result = validator.validate(malicious_input, "user_input")
        
        assert not result.is_valid
        assert len(result.errors) == 1
        assert "dangerous" in result.errors[0].message.lower()
    
    def test_xss_validator_detects_javascript_urls(self):
        """Test XSS validator detects javascript URLs."""
        validator = XSSValidator()
        
        malicious_input = "javascript:alert('xss')"
        result = validator.validate(malicious_input, "user_input")
        
        assert not result.is_valid
        assert len(result.errors) == 1
    
    def test_xss_validator_allows_safe_content(self):
        """Test XSS validator allows safe content."""
        validator = XSSValidator()
        
        safe_input = "This is safe content with <b>bold</b> text"
        result = validator.validate(safe_input, "user_input")
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_sql_injection_validator_detects_sql_keywords(self):
        """Test SQL injection validator detects SQL keywords."""
        validator = SQLInjectionValidator()
        
        malicious_input = "'; DROP TABLE users; --"
        result = validator.validate(malicious_input, "user_input")
        
        assert not result.is_valid
        assert len(result.errors) == 1
    
    def test_sql_injection_validator_detects_union_attacks(self):
        """Test SQL injection validator detects UNION attacks."""
        validator = SQLInjectionValidator()
        
        malicious_input = "1 UNION SELECT password FROM users"
        result = validator.validate(malicious_input, "user_input")
        
        assert not result.is_valid
        assert len(result.errors) == 1
    
    def test_path_traversal_validator_detects_dot_dot(self):
        """Test path traversal validator detects .. sequences."""
        validator = PathTraversalValidator()
        
        malicious_input = "../../../etc/passwd"
        result = validator.validate(malicious_input, "file_path")
        
        assert not result.is_valid
        assert len(result.errors) == 1
    
    def test_path_traversal_validator_detects_encoded_sequences(self):
        """Test path traversal validator detects encoded sequences."""
        validator = PathTraversalValidator()
        
        malicious_input = "%2e%2e%2f%2e%2e%2fetc%2fpasswd"
        result = validator.validate(malicious_input, "file_path")
        
        assert not result.is_valid
        assert len(result.errors) == 1
    
    def test_security_validator_comprehensive(self):
        """Test comprehensive security validator."""
        validator = SecurityValidator()
        
        # Test XSS
        xss_result = validator.validate_input("<script>alert('xss')</script>", "xss_test")
        assert not xss_result.is_valid
        
        # Test SQL injection
        sql_result = validator.validate_input("'; DROP TABLE users; --", "sql_test")
        assert not sql_result.is_valid
        
        # Test path traversal
        path_result = validator.validate_input("../../../etc/passwd", "path_test")
        assert not path_result.is_valid
        
        # Test safe input
        safe_result = validator.validate_input("safe input text", "safe_test")
        assert safe_result.is_valid


class TestInputSanitizer:
    """Test input sanitization functionality."""
    
    def test_sanitize_html_removes_script_tags(self):
        """Test HTML sanitization removes script tags."""
        malicious_html = "<script>alert('xss')</script><p>Safe content</p>"
        
        sanitized = InputSanitizer.sanitize_html(malicious_html)
        
        assert "<script>" not in sanitized
        assert "alert" not in sanitized
        assert "Safe content" in sanitized
    
    def test_sanitize_filename_removes_dangerous_chars(self):
        """Test filename sanitization removes dangerous characters."""
        dangerous_filename = "file<>name|with?bad*chars.txt"
        
        sanitized = InputSanitizer.sanitize_filename(dangerous_filename)
        
        assert "<" not in sanitized
        assert ">" not in sanitized
        assert "|" not in sanitized
        assert "?" not in sanitized
        assert "*" not in sanitized
        assert "filename" in sanitized
    
    def test_sanitize_filename_handles_reserved_names(self):
        """Test filename sanitization handles Windows reserved names."""
        reserved_name = "CON"
        
        sanitized = InputSanitizer.sanitize_filename(reserved_name)
        
        assert sanitized != "CON"
        assert sanitized.startswith("_")
    
    def test_sanitize_path_prevents_traversal(self):
        """Test path sanitization prevents directory traversal."""
        malicious_path = "../../../etc/passwd"
        
        sanitized = InputSanitizer.sanitize_path(malicious_path)
        
        assert ".." not in sanitized
        assert "/" not in sanitized or sanitized.count("/") <= 1


class TestCommonValidators:
    """Test TKA Desktop specific validators."""
    
    def test_validate_sequence_name_success(self, sample_validation_data):
        """Test successful sequence name validation."""
        valid_name = sample_validation_data["valid_data"]["sequence_name"]
        
        result = validate_sequence_name(valid_name)
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_validate_sequence_name_failure(self):
        """Test sequence name validation failure."""
        # Empty name
        result = validate_sequence_name("")
        assert not result.is_valid
        
        # Invalid characters
        result = validate_sequence_name("sequence@name!")
        assert not result.is_valid
        
        # Starting with non-alphanumeric
        result = validate_sequence_name("_sequence")
        assert not result.is_valid
    
    def test_validate_filename_success(self, sample_validation_data):
        """Test successful filename validation."""
        valid_filename = sample_validation_data["valid_data"]["filename"]
        
        result = validate_filename(valid_filename)
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_validate_filename_failure(self, sample_validation_data):
        """Test filename validation failure."""
        invalid_filename = sample_validation_data["invalid_data"]["filename"]
        
        result = validate_filename(invalid_filename)
        
        assert not result.is_valid
        assert len(result.errors) > 0
    
    def test_validate_email_success(self, sample_validation_data):
        """Test successful email validation."""
        valid_email = sample_validation_data["valid_data"]["email"]
        
        result = validate_email(valid_email)
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_validate_email_failure(self, sample_validation_data):
        """Test email validation failure."""
        invalid_email = sample_validation_data["invalid_data"]["email"]
        
        result = validate_email(invalid_email)
        
        assert not result.is_valid
        assert len(result.errors) > 0
    
    def test_validate_beat_data_success(self, sample_beat_data):
        """Test successful beat data validation."""
        result = validate_beat_data(sample_beat_data)
        
        assert result.is_valid
        assert len(result.errors) == 0
    
    def test_validate_beat_data_missing_required_field(self):
        """Test beat data validation with missing required field."""
        invalid_beat = {
            "letter": "A",
            "duration": 1.0
            # Missing beat_number
        }
        
        result = validate_beat_data(invalid_beat)
        
        assert not result.is_valid
        assert any("beat_number" in error.field for error in result.errors)
    
    def test_validate_beat_data_invalid_types(self):
        """Test beat data validation with invalid types."""
        invalid_beat = {
            "beat_number": "not_a_number",  # Should be int
            "letter": 123,  # Should be string
            "duration": "not_a_number",  # Should be float
            "is_blank": "not_a_boolean"  # Should be boolean
        }
        
        result = validate_beat_data(invalid_beat)
        
        assert not result.is_valid
        assert len(result.errors) >= 3  # Multiple type errors


class TestValidationIntegration:
    """Test validation system integration."""
    
    def test_validation_with_sanitization(self, sample_validation_data):
        """Test validation combined with sanitization."""
        validator = SecurityValidator(sanitize=True)
        malicious_data = sample_validation_data["malicious_data"]
        
        for key, value in malicious_data.items():
            validation_result, sanitized_value = validator.validate_and_sanitize(
                value, key, "general"
            )
            
            # Should detect as malicious
            assert not validation_result.is_valid
            
            # But sanitized value should be safer
            assert sanitized_value != value
            assert len(sanitized_value) <= len(value)  # Sanitization removes content
    
    def test_validation_error_aggregation(self):
        """Test validation error aggregation across multiple fields."""
        from core.validation.common_validators import validate_user_input
        
        invalid_data = {
            "xss_field": "<script>alert('xss')</script>",
            "sql_field": "'; DROP TABLE users; --",
            "path_field": "../../../etc/passwd"
        }
        
        result = validate_user_input(invalid_data)
        
        assert not result.is_valid
        assert len(result.errors) >= 3  # One error per field
        
        # Check that all fields are represented in errors
        error_fields = {error.field for error in result.errors}
        assert "xss_field" in error_fields
        assert "sql_field" in error_fields
        assert "path_field" in error_fields
