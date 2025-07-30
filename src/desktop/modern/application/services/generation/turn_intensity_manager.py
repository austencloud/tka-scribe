"""
Turn Intensity Manager - Modern Implementation

Handles turn intensity calculations and allocation for sequence generation.
Ported from legacy TurnIntensityManager with modern architecture patterns.
"""

import random
from typing import List, Tuple, Union

from desktop.modern.core.interfaces.generation_services import ITurnIntensityManager


class TurnIntensityManager(ITurnIntensityManager):
    """
    Modern implementation of turn intensity management.
    
    Handles allocation of turns for blue and red props based on level,
    sequence length, and maximum turn intensity.
    """

    def __init__(self):
        # Define valid turn values per level
        self._level_turn_options = {
            1: [0],  # Level 1: No turns
            2: [0, 1, 2, 3],  # Level 2: Integer turns only
            3: [0, 0.5, 1, 1.5, 2, 2.5, 3, "fl"],  # Level 3: Half turns and float
        }
    
    def calculate_turn_intensity(self, sequence_data: dict, level: int) -> float:
        """Calculate appropriate turn intensity for given sequence and level."""
        if level <= 1:
            return 0.0
        elif level == 2:
            return random.choice([1.0, 2.0, 3.0])
        else:  # level >= 3
            return random.choice([0.5, 1.0, 1.5, 2.0, 2.5, 3.0])
    
    def apply_turn_intensity(self, sequence_data: dict, intensity: float) -> dict:
        """Apply turn intensity to sequence data (placeholder for future enhancement)."""
        # In the current implementation, turn intensity is applied during generation
        # This method can be enhanced for post-generation turn modifications
        return sequence_data
    
    def get_intensity_range(self, level: int) -> Tuple[float, float]:
        """Get valid intensity range for given level."""
        if level <= 1:
            return (0.0, 0.0)
        elif level == 2:
            return (0.0, 3.0)
        else:  # level >= 3
            return (0.0, 3.0)
    
    def validate_intensity(self, intensity: float, level: int) -> bool:
        """Validate if turn intensity is appropriate for given level."""
        min_intensity, max_intensity = self.get_intensity_range(level)
        return min_intensity <= intensity <= max_intensity
    
    def get_recommended_intensity(self, level: int) -> float:
        """Get recommended turn intensity for given level."""
        if level <= 1:
            return 0.0
        elif level == 2:
            return 1.0
        else:  # level >= 3
            return 1.5

    def allocate_turns_for_sequence(
        self,
        length: int,
        level: int,
        max_turn_intensity: float
    ) -> Tuple[List[Union[int, float, str]], List[Union[int, float, str]]]:
        """
        Allocate turns for blue and red props across the sequence.
        
        Args:
            length: Number of beats in sequence
            level: Difficulty level (1-6)
            max_turn_intensity: Maximum allowed turn value
            
        Returns:
            Tuple of (blue_turns, red_turns) lists
        """
        # Get valid turn options for this level
        possible_turns = self._level_turn_options.get(level, [0])
        
        # Filter by maximum intensity (except for special "fl" value)
        valid_turns = [
            turn for turn in possible_turns
            if turn == "fl" or (isinstance(turn, (int, float)) and turn <= max_turn_intensity)
        ]
        
        if not valid_turns:
            valid_turns = [0]  # Fallback to no turns
        
        # Allocate random turns for each beat
        turns_blue = []
        turns_red = []
        
        for _ in range(length):
            blue_turn = random.choice(valid_turns)
            red_turn = random.choice(valid_turns)
            
            turns_blue.append(blue_turn)
            turns_red.append(red_turn)
        
        return turns_blue, turns_red
