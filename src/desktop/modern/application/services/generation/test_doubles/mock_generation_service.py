"""
Mock Generation Service for Testing

Provides simple mock implementations of generation services for testing purposes.
"""

from typing import Any, List, Dict

from desktop.modern.core.interfaces.generation_services import (
    IGenerationService,
    ISequenceConfigurationService,
    IGenerationValidationService,
    ValidationResult,
)
from desktop.modern.domain.models.generation_models import (
    GenerationConfig,
    GenerationResult,
    GenerationMetadata,
)


class MockGenerationService(IGenerationService):
    """Mock generation service for testing."""
    
    def __init__(self, container):
        self.container = container
        self.generation_count = 0

    def generate_freeform_sequence(self, config: GenerationConfig) -> GenerationResult:
        """Generate a mock freeform sequence."""
        self.generation_count += 1
        
        # Create simple mock sequence
        mock_sequence = [
            {"beat": i, "letter": "MOCK", "blue_attributes": {}, "red_attributes": {}}
            for i in range(config.length)
        ]
        
        metadata = GenerationMetadata(
            generation_time_ms=10,
            algorithm_used="mock_freeform",
            parameters_hash="mock_hash"
        )
        
        return GenerationResult(
            success=True,
            sequence_data=mock_sequence,
            metadata=metadata
        )

    def generate_circular_sequence(self, config: GenerationConfig) -> GenerationResult:
        """Generate a mock circular sequence."""
        self.generation_count += 1
        
        # Create simple mock sequence
        mock_sequence = [
            {"beat": i, "letter": "CIRCULAR", "blue_attributes": {}, "red_attributes": {}}
            for i in range(config.length)
        ]
        
        metadata = GenerationMetadata(
            generation_time_ms=15,
            algorithm_used="mock_circular", 
            parameters_hash="mock_hash"
        )
        
        return GenerationResult(
            success=True,
            sequence_data=mock_sequence,
            metadata=metadata
        )

    def auto_complete_sequence(self, current_sequence: Any) -> GenerationResult:
        """Mock auto-complete sequence."""
        return GenerationResult(
            success=True,
            sequence_data=current_sequence if isinstance(current_sequence, list) else [],
            metadata=GenerationMetadata(
                generation_time_ms=5,
                algorithm_used="mock_auto_complete",
                parameters_hash="mock_hash"
            )
        )

    def validate_generation_parameters(self, config: GenerationConfig) -> ValidationResult:
        """Mock validation - always passes."""
        return ValidationResult(is_valid=True)


class MockSequenceConfigurationService(ISequenceConfigurationService):
    """Mock configuration service for testing."""
    
    def __init__(self, container):
        self.container = container
        self._current_config = GenerationConfig()
        self._presets = {}

    def get_current_config(self) -> GenerationConfig:
        return self._current_config

    def update_config(self, updates: Dict[str, Any]) -> None:
        self._current_config = self._current_config.with_updates(**updates)

    def save_config_as_preset(self, name: str) -> None:
        self._presets[name] = self._current_config

    def load_config_preset(self, name: str) -> GenerationConfig:
        return self._presets.get(name, self._current_config)

    def get_default_config(self) -> GenerationConfig:
        return GenerationConfig()

    def get_preset_names(self) -> List[str]:
        return list(self._presets.keys())


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
