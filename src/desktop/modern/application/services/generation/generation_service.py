"""
Generation Service - Main Implementation

Orchestrates sequence generation for both freeform and circular modes.
Implements the IGenerationService interface with dependency injection.
"""

import logging
import time
from typing import TYPE_CHECKING, Any, Dict, List

from desktop.modern.core.interfaces.generation_services import (
    IGenerationService,
    GenerationMode,
    ValidationResult,
)
from desktop.modern.domain.models.generation_models import (
    GenerationConfig,
    GenerationResult,
    GenerationMetadata,
)

if TYPE_CHECKING:
    from desktop.modern.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class GenerationService(IGenerationService):
    """
    Main generation service that orchestrates sequence generation.
    
    Delegates to specific generators based on mode (freeform vs circular)
    and provides validation, error handling, and result packaging.
    """

    def __init__(self, container: "DIContainer"):
        self.container = container
        
        # Initialize sub-services
        from .freeform_generation_service import FreeformGenerationService
        from .circular_generation_service import CircularGenerationService
        from .generation_validation_service import GenerationValidationService
        
        self.freeform_service = FreeformGenerationService(container)
        self.circular_service = CircularGenerationService(container)
        self.validation_service = GenerationValidationService(container)

    def generate_freeform_sequence(self, config: GenerationConfig) -> GenerationResult:
        """
        Generate a freeform sequence based on configuration.
        
        Args:
            config: Generation configuration
            
        Returns:
            Generation result with sequence data or error
        """
        try:
            start_time = time.time()
            
            # Validate configuration
            validation = self.validate_generation_parameters(config)
            if not validation.is_valid:
                return GenerationResult(
                    success=False,
                    error_message=f"Configuration validation failed: {validation.errors}",
                    warnings=validation.warnings
                )
            
            # Generate sequence using freeform service
            sequence_data = self.freeform_service.generate_sequence(config)
            
            # Create metadata
            generation_time = int((time.time() - start_time) * 1000)
            metadata = GenerationMetadata(
                generation_time_ms=generation_time,
                algorithm_used="freeform",
                parameters_hash=self._hash_config(config),
                warnings=validation.warnings
            )
            
            logger.info(f"Successfully generated freeform sequence with {len(sequence_data)} beats")
            
            return GenerationResult(
                success=True,
                sequence_data=sequence_data,
                metadata=metadata,
                warnings=validation.warnings
            )
            
        except Exception as e:
            logger.error(f"Freeform generation failed: {str(e)}", exc_info=True)
            return GenerationResult(
                success=False,
                error_message=f"Generation failed: {str(e)}"
            )

    def generate_circular_sequence(self, config: GenerationConfig) -> GenerationResult:
        """
        Generate a circular sequence based on configuration.
        
        Args:
            config: Generation configuration
            
        Returns:
            Generation result with sequence data or error
        """
        try:
            start_time = time.time()
            
            # Validate configuration
            validation = self.validate_generation_parameters(config)
            if not validation.is_valid:
                return GenerationResult(
                    success=False,
                    error_message=f"Configuration validation failed: {validation.errors}",
                    warnings=validation.warnings
                )
            
            # Generate sequence using circular service
            sequence_data = self.circular_service.generate_sequence(config)
            
            # Create metadata
            generation_time = int((time.time() - start_time) * 1000)
            metadata = GenerationMetadata(
                generation_time_ms=generation_time,
                algorithm_used="circular",
                parameters_hash=self._hash_config(config),
                warnings=validation.warnings
            )
            
            logger.info(f"Successfully generated circular sequence with {len(sequence_data)} beats")
            
            return GenerationResult(
                success=True,
                sequence_data=sequence_data,
                metadata=metadata,
                warnings=validation.warnings
            )
            
        except Exception as e:
            logger.error(f"Circular generation failed: {str(e)}", exc_info=True)
            return GenerationResult(
                success=False,
                error_message=f"Generation failed: {str(e)}"
            )

    def auto_complete_sequence(self, current_sequence: Any) -> GenerationResult:
        """
        Auto-complete an existing sequence.
        
        Args:
            current_sequence: Current sequence data
            
        Returns:
            Generation result with completed sequence
        """
        try:
            start_time = time.time()
            
            # For now, this is a simplified implementation
            # In the full version, this would analyze the current sequence
            # and generate appropriate continuation
            
            logger.info("Auto-completion requested")
            
            # Placeholder: return the current sequence unchanged
            # TODO: Implement actual auto-completion logic
            
            metadata = GenerationMetadata(
                generation_time_ms=int((time.time() - start_time) * 1000),
                algorithm_used="auto_complete",
                parameters_hash="auto_complete",
                warnings=["Auto-completion is not yet fully implemented"]
            )
            
            return GenerationResult(
                success=True,
                sequence_data=current_sequence if isinstance(current_sequence, list) else [],
                metadata=metadata,
                warnings=["Auto-completion feature is under development"]
            )
            
        except Exception as e:
            logger.error(f"Auto-completion failed: {str(e)}", exc_info=True)
            return GenerationResult(
                success=False,
                error_message=f"Auto-completion failed: {str(e)}"
            )

    def validate_generation_parameters(self, config: GenerationConfig) -> ValidationResult:
        """
        Validate generation configuration.
        
        Args:
            config: Configuration to validate
            
        Returns:
            Validation result
        """
        try:
            return self.validation_service.validate_complete_config(config)
        except Exception as e:
            logger.error(f"Validation failed: {str(e)}", exc_info=True)
            return ValidationResult(
                is_valid=False,
                errors=[f"Validation error: {str(e)}"]
            )

    def _hash_config(self, config: GenerationConfig) -> str:
        """Create a hash of the configuration for metadata."""
        import hashlib
        
        # Create a string representation of key config parameters
        config_str = f"{config.mode.value}_{config.length}_{config.level}_{config.turn_intensity}"
        if config.letter_types:
            letter_types_str = "_".join(sorted([lt.value for lt in config.letter_types]))
            config_str += f"_{letter_types_str}"
        if config.cap_type:
            config_str += f"_{config.cap_type.value}"
        
        return hashlib.md5(config_str.encode()).hexdigest()[:8]
