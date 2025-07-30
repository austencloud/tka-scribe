"""
Freeform Generation Service

Implements freeform sequence generation by porting logic from legacy FreeFormSequenceBuilder.
Generates sequences based on selected letter types and other freeform-specific parameters.
"""

import logging
import random
from copy import deepcopy
from typing import Any, Dict, List, Optional, Set, TYPE_CHECKING

from desktop.modern.core.interfaces.generation_services import (
    GenerationMode,
    LetterType,
    PropContinuity,
)
from desktop.modern.domain.models.generation_models import GenerationConfig
from .base_sequence_builder import BaseSequenceBuilder
from .turn_intensity_manager import TurnIntensityManager

# Constants
LETTER = "letter"
CLOCKWISE = "cw"
COUNTER_CLOCKWISE = "ccw"

if TYPE_CHECKING:
    from desktop.modern.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class FreeformGenerationService(BaseSequenceBuilder):
    """
    Freeform sequence generation service.
    
    Generates sequences based on letter types, prop continuity,
    and other freeform-specific parameters.
    """

    def __init__(self, container: "DIContainer"):
        super().__init__(container)
        self.turn_manager = TurnIntensityManager()
        
        # Letter type mappings (from legacy LetterType enum)
        self.letter_type_mappings = {
            LetterType.TYPE1: [
                "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", 
                "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"
            ],
            LetterType.TYPE2: ["W", "X", "Y", "Z", "Σ", "Δ", "θ", "Ω"],
            LetterType.TYPE3: ["W-", "X-", "Y-", "Z-", "Σ-", "Δ-", "θ-", "Ω-"],
            LetterType.TYPE4: ["Φ", "Ψ", "Λ"],
            LetterType.TYPE5: ["Φ-", "Ψ-", "Λ-"],
            LetterType.TYPE6: ["α", "β", "Γ"],
        }

    def generate_sequence(self, config: GenerationConfig) -> List[Dict[str, Any]]:
        """
        Generate a freeform sequence based on configuration.
        
        Args:
            config: Generation configuration
            
        Returns:
            List of pictograph data dictionaries
        """
        logger.info(f"Starting freeform generation: length={config.length}, level={config.level}")
        
        # Initialize sequence
        self.initialize_sequence(config.length, config)
        
        # Determine prop rotation directions for continuous mode
        blue_rot_dir = None
        red_rot_dir = None
        
        if config.prop_continuity == PropContinuity.CONTINUOUS:
            blue_rot_dir = random.choice([CLOCKWISE, COUNTER_CLOCKWISE])
            red_rot_dir = random.choice([CLOCKWISE, COUNTER_CLOCKWISE])
        
        # Calculate how many beats we need to generate
        length_upon_start = len(self.sequence) - 2  # Account for existing beats
        beats_to_generate = config.length - length_upon_start
        
        if beats_to_generate <= 0:
            logger.info("Sequence already at target length")
            return self.sequence
        
        # Allocate turns for the sequence
        turns_blue, turns_red = self.turn_manager.allocate_turns_for_sequence(
            beats_to_generate, config.level, config.turn_intensity
        )
        
        # Generate each beat
        for i in range(beats_to_generate):
            try:
                next_pictograph = self._generate_next_pictograph(
                    config,
                    turns_blue[i],
                    turns_red[i],
                    blue_rot_dir,
                    red_rot_dir,
                )
                self.sequence.append(next_pictograph)
                
            except Exception as e:
                logger.error(f"Failed to generate beat {i}: {str(e)}")
                # Continue with next beat rather than failing entirely
                continue
        
        logger.info(f"Generated freeform sequence with {len(self.sequence)} total beats")
        return self.sequence

    def _generate_next_pictograph(
        self,
        config: GenerationConfig,
        turn_blue: Any,
        turn_red: Any,
        blue_rot_dir: Optional[str],
        red_rot_dir: Optional[str],
    ) -> Dict[str, Any]:
        """
        Generate the next pictograph in the sequence.
        
        Args:
            config: Generation configuration
            turn_blue: Blue prop turn value
            turn_red: Red prop turn value
            blue_rot_dir: Blue prop rotation direction
            red_rot_dir: Red prop rotation direction
            
        Returns:
            Pictograph data dictionary
        """
        # Get available options (this is a simplified version)
        option_dicts = self._get_option_dicts()
        option_dicts = [deepcopy(option) for option in option_dicts]
        
        # Filter by letter type
        option_dicts = self._filter_options_by_letter_type(option_dicts, config.letter_types)
        
        # Filter by rotation if using continuous prop continuity
        if config.prop_continuity == PropContinuity.CONTINUOUS:
            option_dicts = self.filter_options_by_rotation(
                option_dicts, blue_rot_dir, red_rot_dir
            )
        
        if not option_dicts:
            logger.warning("No valid options found, using fallback")
            option_dicts = self._get_fallback_options()
        
        # Select random option
        last_beat = self.sequence[-1] if self.sequence else {}
        next_beat = random.choice(option_dicts)
        
        # Set turns for levels 2 and 3
        if config.level >= 2:
            next_beat = self.set_turns(next_beat, turn_blue, turn_red)
        
        # Update orientations and other properties
        self.update_start_orientations(next_beat, last_beat)
        self.update_dash_static_prop_rot_dirs(
            next_beat, config.prop_continuity, blue_rot_dir, red_rot_dir
        )
        self.update_end_orientations(next_beat)
        next_beat = self.update_beat_number(next_beat, self.sequence)
        
        return next_beat

    def _get_option_dicts(self) -> List[Dict[str, Any]]:
        """
        Get available option dictionaries for generation.
        
        This is a simplified version - the full implementation would
        integrate with the construct tab and option picker system.
        """
        # Placeholder implementation
        # In the real system, this would load from the pictograph dataset
        # and filter based on current sequence context
        
        # Return some basic options for testing
        basic_options = [
            {
                LETTER: "A",
                "blue_attributes": {
                    "motion_type": "pro",
                    "prop_rot_dir": "cw",
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                },
                "red_attributes": {
                    "motion_type": "anti", 
                    "prop_rot_dir": "ccw",
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                }
            },
            {
                LETTER: "B",
                "blue_attributes": {
                    "motion_type": "anti",
                    "prop_rot_dir": "ccw",
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                },
                "red_attributes": {
                    "motion_type": "pro",
                    "prop_rot_dir": "cw", 
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                }
            }
        ]
        
        return basic_options

    def _filter_options_by_letter_type(
        self, 
        options: List[Dict[str, Any]], 
        selected_types: Optional[Set[LetterType]]
    ) -> List[Dict[str, Any]]:
        """
        Filter options based on selected letter types.
        
        Args:
            options: Available option dictionaries
            selected_types: Set of selected letter types
            
        Returns:
            Filtered options list
        """
        if not selected_types:
            return options
        
        # Get all letters from selected types
        selected_letters = []
        for letter_type in selected_types:
            if letter_type in self.letter_type_mappings:
                selected_letters.extend(self.letter_type_mappings[letter_type])
        
        if not selected_letters:
            return options
        
        # Filter options by letter
        filtered_options = [
            option for option in options 
            if option.get(LETTER) in selected_letters
        ]
        
        return filtered_options if filtered_options else options

    def _get_fallback_options(self) -> List[Dict[str, Any]]:
        """Get fallback options when no valid options are found."""
        return [
            {
                LETTER: "A",
                "blue_attributes": {
                    "motion_type": "static",
                    "prop_rot_dir": "no_rot",
                    "turns": 0,
                    "start_ori": "in",
                    "end_ori": "in"
                },
                "red_attributes": {
                    "motion_type": "static",
                    "prop_rot_dir": "no_rot",
                    "turns": 0,
                    "start_ori": "in", 
                    "end_ori": "in"
                }
            }
        ]
