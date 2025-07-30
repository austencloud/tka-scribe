"""
Generation Validation Service

Validates generation configurations and parameters.
Implements IGenerationValidationService with comprehensive validation logic.
"""

import logging
from typing import List, Set, TYPE_CHECKING

from desktop.modern.core.interfaces.generation_services import (
    IGenerationValidationService,
    GenerationMode,
    LetterType,
    ValidationResult,
)
from desktop.modern.domain.models.generation_models import GenerationConfig

if TYPE_CHECKING:
    from desktop.modern.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class GenerationValidationService(IGenerationValidationService):
    """
    Validates generation configurations and parameters.
    
    Provides comprehensive validation for all generation parameters
    including length, level, turn intensity, and mode-specific settings.
    """

    def __init__(self, container: "DIContainer"):
        self.container = container

    def validate_length(self, length: int, mode: GenerationMode) -> ValidationResult:
        """Validate sequence length parameter."""
        errors = []
        warnings = []
        
        if length < 4:
            errors.append("Sequence length must be at least 4 beats")
        elif length > 32:
            errors.append("Sequence length cannot exceed 32 beats")
        
        if length % 2 != 0 and mode == GenerationMode.CIRCULAR:
            warnings.append("Odd lengths may not work optimally with circular generation")
        
        if length > 24:
            warnings.append("Very long sequences may take significant time to generate")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors if errors else None,
            warnings=warnings if warnings else None
        )

    def validate_level(self, level: int, length: int) -> ValidationResult:
        """Validate difficulty level parameter."""
        errors = []
        warnings = []
        
        if level < 1:
            errors.append("Level must be at least 1")
        elif level > 6:
            errors.append("Level cannot exceed 6")
        
        if level > 3 and length < 8:
            warnings.append("High levels work better with longer sequences")
        
        if level == 1:
            warnings.append("Level 1 generates static sequences with no turns")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors if errors else None,
            warnings=warnings if warnings else None
        )

    def validate_turn_intensity(self, intensity: float, level: int) -> ValidationResult:
        """Validate turn intensity parameter."""
        errors = []
        warnings = []
        
        if intensity < 0.5:
            errors.append("Turn intensity must be at least 0.5")
        elif intensity > 3.0:
            errors.append("Turn intensity cannot exceed 3.0")
        
        if level == 1 and intensity > 0.5:
            warnings.append("Turn intensity has no effect at level 1")
        
        if level == 2 and intensity not in [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]:
            warnings.append("Level 2 works best with standard intensity values")
        
        if intensity > 2.5:
            warnings.append("Very high turn intensity may create complex sequences")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors if errors else None,
            warnings=warnings if warnings else None
        )

    def validate_letter_combination(
        self, letters: Set[LetterType], mode: GenerationMode
    ) -> ValidationResult:
        """Validate letter type combination."""
        errors = []
        warnings = []
        
        if mode == GenerationMode.FREEFORM:
            if not letters:
                errors.append("At least one letter type must be selected for freeform generation")
            elif len(letters) == 1:
                warnings.append("Using only one letter type may limit sequence variety")
        
        # Check for potentially problematic combinations
        if LetterType.TYPE6 in letters and len(letters) == 1:
            warnings.append("Using only static letters may create monotonous sequences")
        
        if len(letters) > 4:
            warnings.append("Using many letter types may create inconsistent sequences")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors if errors else None,
            warnings=warnings if warnings else None
        )

    def validate_complete_config(self, config: GenerationConfig) -> ValidationResult:
        """Validate complete generation configuration."""
        all_errors = []
        all_warnings = []
        
        # Validate individual parameters
        validations = [
            self.validate_length(config.length, config.mode),
            self.validate_level(config.level, config.length),
            self.validate_turn_intensity(config.turn_intensity, config.level),
        ]
        
        # Add mode-specific validations
        if config.mode == GenerationMode.FREEFORM and config.letter_types:
            validations.append(
                self.validate_letter_combination(config.letter_types, config.mode)
            )
        
        # Collect all errors and warnings
        for validation in validations:
            if validation.errors:
                all_errors.extend(validation.errors)
            if validation.warnings:
                all_warnings.extend(validation.warnings)
        
        # Add configuration-specific validations
        config_validation = self._validate_config_consistency(config)
        if config_validation.errors:
            all_errors.extend(config_validation.errors)
        if config_validation.warnings:
            all_warnings.extend(config_validation.warnings)
        
        return ValidationResult(
            is_valid=len(all_errors) == 0,
            errors=all_errors if all_errors else None,
            warnings=all_warnings if all_warnings else None,
            suggestions=self._generate_suggestions(config) if len(all_errors) == 0 else None
        )

    def _validate_config_consistency(self, config: GenerationConfig) -> ValidationResult:
        """Validate internal consistency of configuration."""
        errors = []
        warnings = []
        
        # Check mode-specific requirements
        if config.mode == GenerationMode.CIRCULAR:
            if not config.cap_type:
                errors.append("CAP type is required for circular generation")
            if not config.slice_size:
                errors.append("Slice size is required for circular generation")
        
        if config.mode == GenerationMode.FREEFORM:
            if not config.letter_types:
                errors.append("Letter types are required for freeform generation")
        
        # Check parameter combinations
        if config.level == 1 and config.turn_intensity > 1.0:
            warnings.append("Turn intensity will be ignored at level 1")
        
        if config.length < 8 and config.mode == GenerationMode.CIRCULAR:
            warnings.append("Short sequences may not showcase circular patterns effectively")
        
        return ValidationResult(
            is_valid=len(errors) == 0,
            errors=errors if errors else None,
            warnings=warnings if warnings else None
        )

    def _generate_suggestions(self, config: GenerationConfig) -> List[str]:
        """Generate helpful suggestions for the configuration."""
        suggestions = []
        
        # Length suggestions
        if config.length == 4:
            suggestions.append("Try a longer sequence (8-16 beats) for more interesting patterns")
        
        # Level suggestions
        if config.level == 1:
            suggestions.append("Try level 2 or 3 for sequences with turns and movement")
        
        # Mode-specific suggestions
        if config.mode == GenerationMode.FREEFORM:
            if config.letter_types and len(config.letter_types) < 3:
                suggestions.append("Include more letter types for greater variety")
        
        if config.mode == GenerationMode.CIRCULAR:
            if config.length % 4 == 0:
                suggestions.append("Consider quartered slice size for even-length sequences")
        
        # Turn intensity suggestions
        if config.turn_intensity == 0.5:
            suggestions.append("Try higher turn intensity (1.0-2.0) for more dynamic sequences")
        
        return suggestions[:3]  # Limit to 3 suggestions to avoid overwhelming
