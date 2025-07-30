"""
Circular Generation Service

Implements circular sequence generation with CAP (Circular Arrangement Pattern) support.
Ported from legacy CircularSequenceBuilder with modern architecture patterns.
"""

import logging
import random
from copy import deepcopy
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from desktop.modern.core.interfaces.generation_services import (
    CAPType,
    SliceSize,
    PropContinuity,
)
from desktop.modern.domain.models.generation_models import GenerationConfig
from .base_sequence_builder import BaseSequenceBuilder
from .turn_intensity_manager import TurnIntensityManager

# Constants
BLUE_ATTRS = "blue_attributes"
RED_ATTRS = "red_attributes"
END_POS = "end_pos"
MOTION_TYPE = "motion_type"
DASH = "dash"
STATIC = "static"

if TYPE_CHECKING:
    from desktop.modern.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class CircularGenerationService(BaseSequenceBuilder):
    """
    Circular sequence generation service.
    
    Generates sequences using circular arrangement patterns (CAP) with
    support for different slice sizes and transformation types.
    """

    def __init__(self, container: "DIContainer"):
        super().__init__(container)
        self.turn_manager = TurnIntensityManager()
        
        # Position transformation mappings (simplified versions)
        self.position_mappings = self._initialize_position_mappings()

    def _initialize_position_mappings(self) -> Dict[str, Dict[str, str]]:
        """Initialize position transformation mappings for CAP operations."""
        # Simplified mappings - in the full implementation these would be loaded
        # from data files (swapped_positions, mirrored_positions, etc.)
        return {
            "swapped": {
                "alpha1": "alpha2", "alpha2": "alpha1",
                "beta5": "beta4", "beta4": "beta5",
                "gamma11": "gamma12", "gamma12": "gamma11",
            },
            "mirrored": {
                "alpha1": "alpha1", "alpha2": "alpha2",  # Mirror mappings
                "beta5": "beta5", "beta4": "beta4",
                "gamma11": "gamma11", "gamma12": "gamma12",
            },
            "rotated": {
                "alpha1": "gamma11", "gamma11": "alpha1",  # 180-degree rotation
                "alpha2": "gamma12", "gamma12": "alpha2",
                "beta5": "beta4", "beta4": "beta5",
            }
        }

    def generate_sequence(self, config: GenerationConfig) -> List[Dict[str, Any]]:
        """
        Generate a circular sequence based on configuration.
        
        Args:
            config: Generation configuration including CAP type and slice size
            
        Returns:
            List of pictograph data dictionaries
        """
        logger.info(f"Starting circular generation: length={config.length}, CAP={config.cap_type}")
        
        # Initialize sequence
        self.initialize_sequence(config.length, config)
        
        # Determine prop rotation directions for continuous mode
        blue_rot_dir = None
        red_rot_dir = None
        
        if config.prop_continuity == PropContinuity.CONTINUOUS:
            blue_rot_dir = random.choice(["cw", "ccw"])
            red_rot_dir = random.choice(["cw", "ccw"])
        
        # Calculate word length and slice information
        word_length = self._calculate_word_length(config.length, config.slice_size)
        
        # Generate base pattern
        base_pattern = self._generate_base_pattern(
            word_length, config, blue_rot_dir, red_rot_dir
        )
        
        # Apply CAP transformations
        full_sequence = self._apply_cap_transformations(
            base_pattern, config.cap_type, config.slice_size
        )
        
        # Extend sequence to target length
        while len(self.sequence) < config.length + 2:  # +2 for start position and buffer
            if full_sequence:
                next_beat = deepcopy(full_sequence[len(self.sequence) % len(full_sequence)])
                next_beat = self.update_beat_number(next_beat, self.sequence)
                self.sequence.append(next_beat)
            else:
                break
        
        logger.info(f"Generated circular sequence with {len(self.sequence)} total beats")
        return self.sequence

    def _calculate_word_length(self, total_length: int, slice_size: SliceSize) -> int:
        """Calculate the word length based on total length and slice size."""
        if slice_size == SliceSize.QUARTERED:
            return max(1, total_length // 4)
        else:  # HALVED
            return max(1, total_length // 2)

    def _generate_base_pattern(
        self,
        word_length: int,
        config: GenerationConfig,
        blue_rot_dir: Optional[str],
        red_rot_dir: Optional[str],
    ) -> List[Dict[str, Any]]:
        """
        Generate the base pattern that will be transformed by CAP operations.
        
        Args:
            word_length: Length of the base word/pattern
            config: Generation configuration
            blue_rot_dir: Blue prop rotation direction
            red_rot_dir: Red prop rotation direction
            
        Returns:
            Base pattern as list of pictograph dictionaries
        """
        base_pattern = []
        
        # Allocate turns for the base pattern
        turns_blue, turns_red = self.turn_manager.allocate_turns_for_sequence(
            word_length, config.level, config.turn_intensity
        )
        
        # Generate each beat in the base pattern
        for i in range(word_length):
            try:
                next_pictograph = self._generate_circular_pictograph(
                    config,
                    turns_blue[i],
                    turns_red[i],
                    blue_rot_dir,
                    red_rot_dir,
                    base_pattern
                )
                base_pattern.append(next_pictograph)
                
            except Exception as e:
                logger.error(f"Failed to generate base pattern beat {i}: {str(e)}")
                continue
        
        return base_pattern

    def _generate_circular_pictograph(
        self,
        config: GenerationConfig,
        turn_blue: Any,
        turn_red: Any,
        blue_rot_dir: Optional[str],
        red_rot_dir: Optional[str],
        current_pattern: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate a single pictograph for circular sequence."""
        # Get available options (simplified)
        option_dicts = self._get_circular_options()
        option_dicts = [deepcopy(option) for option in option_dicts]
        
        # Apply rotation filtering if continuous
        if config.prop_continuity == PropContinuity.CONTINUOUS:
            option_dicts = self.filter_options_by_rotation(
                option_dicts, blue_rot_dir, red_rot_dir
            )
        
        if not option_dicts:
            option_dicts = self._get_fallback_circular_options()
        
        # Select option
        last_beat = current_pattern[-1] if current_pattern else (self.sequence[-1] if self.sequence else {})
        next_beat = random.choice(option_dicts)
        
        # Set turns for levels 2 and 3
        if config.level >= 2:
            next_beat = self.set_turns(next_beat, turn_blue, turn_red)
        
        # Update orientations and properties
        self.update_start_orientations(next_beat, last_beat)
        self.update_dash_static_prop_rot_dirs(
            next_beat, config.prop_continuity, blue_rot_dir, red_rot_dir
        )
        self.update_end_orientations(next_beat)
        
        return next_beat

    def _apply_cap_transformations(
        self,
        base_pattern: List[Dict[str, Any]],
        cap_type: CAPType,
        slice_size: SliceSize
    ) -> List[Dict[str, Any]]:
        """
        Apply CAP transformations to create the full sequence pattern.
        
        Args:
            base_pattern: Base pattern to transform
            cap_type: Type of CAP transformation
            slice_size: Slice size (quartered or halved)
            
        Returns:
            Transformed sequence pattern
        """
        if not base_pattern:
            return base_pattern
        
        try:
            if cap_type == CAPType.STRICT_ROTATED:
                return self._apply_strict_rotated(base_pattern)
            elif cap_type == CAPType.STRICT_MIRRORED:
                return self._apply_strict_mirrored(base_pattern)
            elif cap_type == CAPType.STRICT_SWAPPED:
                return self._apply_strict_swapped(base_pattern)
            elif cap_type == CAPType.STRICT_COMPLEMENTARY:
                return self._apply_strict_complementary(base_pattern)
            else:
                # For other CAP types, return base pattern for now
                # TODO: Implement remaining CAP transformations
                logger.warning(f"CAP type {cap_type} not yet implemented, using base pattern")
                return base_pattern * 2  # Simple duplication as fallback
                
        except Exception as e:
            logger.error(f"CAP transformation failed: {str(e)}")
            return base_pattern

    def _apply_strict_rotated(self, pattern: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply strict rotated CAP transformation."""
        rotated_pattern = []
        
        for beat in pattern:
            rotated_beat = deepcopy(beat)
            # Apply 180-degree rotation transformation
            rotated_beat = self._rotate_beat_positions(rotated_beat)
            rotated_pattern.append(rotated_beat)
        
        return pattern + rotated_pattern

    def _apply_strict_mirrored(self, pattern: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply strict mirrored CAP transformation."""
        mirrored_pattern = []
        
        for beat in pattern:
            mirrored_beat = deepcopy(beat)
            # Apply mirror transformation
            mirrored_beat = self._mirror_beat_positions(mirrored_beat)
            mirrored_pattern.append(mirrored_beat)
        
        return pattern + mirrored_pattern

    def _apply_strict_swapped(self, pattern: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply strict swapped CAP transformation."""
        swapped_pattern = []
        
        for beat in pattern:
            swapped_beat = deepcopy(beat)
            # Swap blue and red attributes
            if BLUE_ATTRS in swapped_beat and RED_ATTRS in swapped_beat:
                blue_attrs = swapped_beat[BLUE_ATTRS]
                red_attrs = swapped_beat[RED_ATTRS]
                swapped_beat[BLUE_ATTRS] = red_attrs
                swapped_beat[RED_ATTRS] = blue_attrs
            swapped_pattern.append(swapped_beat)
        
        return pattern + swapped_pattern

    def _apply_strict_complementary(self, pattern: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply strict complementary CAP transformation."""
        complementary_pattern = []
        
        for beat in pattern:
            comp_beat = deepcopy(beat)
            # Apply complementary transformation (invert motion types)
            comp_beat = self._complement_beat_motions(comp_beat)
            complementary_pattern.append(comp_beat)
        
        return pattern + complementary_pattern

    def _rotate_beat_positions(self, beat: Dict[str, Any]) -> Dict[str, Any]:
        """Rotate beat positions by 180 degrees."""
        # Apply rotation mappings to positions
        rotation_map = self.position_mappings.get("rotated", {})
        
        for pos_key in [END_POS]:  # Can extend to other position keys
            if pos_key in beat:
                old_pos = beat[pos_key]
                beat[pos_key] = rotation_map.get(old_pos, old_pos)
        
        return beat

    def _mirror_beat_positions(self, beat: Dict[str, Any]) -> Dict[str, Any]:
        """Mirror beat positions."""
        # Apply mirror mappings to positions
        mirror_map = self.position_mappings.get("mirrored", {})
        
        for pos_key in [END_POS]:  # Can extend to other position keys
            if pos_key in beat:
                old_pos = beat[pos_key]
                beat[pos_key] = mirror_map.get(old_pos, old_pos)
        
        return beat

    def _complement_beat_motions(self, beat: Dict[str, Any]) -> Dict[str, Any]:
        """Apply complementary motion transformations."""
        motion_complements = {
            "pro": "anti",
            "anti": "pro", 
            "dash": "dash",  # Dash complements to itself
            "static": "static",  # Static complements to itself
            "float": "float"  # Float complements to itself
        }
        
        for color_attrs in [BLUE_ATTRS, RED_ATTRS]:
            if color_attrs in beat and MOTION_TYPE in beat[color_attrs]:
                old_motion = beat[color_attrs][MOTION_TYPE]
                beat[color_attrs][MOTION_TYPE] = motion_complements.get(old_motion, old_motion)
        
        return beat

    def _get_circular_options(self) -> List[Dict[str, Any]]:
        """Get available options for circular generation."""
        # Simplified implementation - should integrate with actual option system
        return [
            {
                "letter": "C",
                BLUE_ATTRS: {
                    MOTION_TYPE: "pro",
                    "prop_rot_dir": "cw",
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                },
                RED_ATTRS: {
                    MOTION_TYPE: "anti",
                    "prop_rot_dir": "ccw", 
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                }
            }
        ]

    def _get_fallback_circular_options(self) -> List[Dict[str, Any]]:
        """Get fallback options for circular generation."""
        return [
            {
                "letter": "FALLBACK",
                BLUE_ATTRS: {
                    MOTION_TYPE: STATIC,
                    "prop_rot_dir": "no_rot",
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                },
                RED_ATTRS: {
                    MOTION_TYPE: STATIC,
                    "prop_rot_dir": "no_rot",
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                }
            }
        ]
