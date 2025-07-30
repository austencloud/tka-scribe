"""
Mock Validation Service for Testing

Provides simple mock implementation of generation validation service.
"""

from desktop.modern.core.interfaces.generation_services import (
    IGenerationValidationService,
    ValidationResult,
)
from desktop.modern.domain.models.generation_models import GenerationConfig


class MockGenerationValidationService(IGenerationValidationService):
    """Mock validation service for testing."""
    
    def __init__(self, container):
        self.container = container

    def validate_length(self, length: int, mode) -> ValidationResult:
        return ValidationResult(is_valid=4 <= length <= 32)

    def validate_level(self, level: int, length: int) -> ValidationResult:
        return ValidationResult(is_valid=1 <= level <= 6)

    def validate_turn_intensity(self, intensity: float, level: int) -> ValidationResult:
        return ValidationResult(is_valid=0.5 <= intensity <= 3.0)

    def validate_letter_combination(self, letters, mode) -> ValidationResult:
        return ValidationResult(is_valid=True)

    def validate_complete_config(self, config: GenerationConfig) -> ValidationResult:
        return ValidationResult(is_valid=config.is_valid())
