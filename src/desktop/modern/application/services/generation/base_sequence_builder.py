"""
Base Sequence Builder - Modern Implementation

Contains shared sequence building logic ported from legacy BaseSequenceBuilder.
Provides common functionality for both freeform and circular generation.
"""

import random
from copy import deepcopy
from typing import Dict, Any, List, Optional, TYPE_CHECKING

from desktop.modern.core.interfaces.generation_services import PropContinuity
from desktop.modern.domain.models.generation_models import GenerationConfig, GenerationResult

# Constants (will be imported from data.constants in actual implementation)
BLUE_ATTRS = "blue_attributes"
RED_ATTRS = "red_attributes"
BLUE = "blue"
RED = "red"
START_ORI = "start_ori"
END_ORI = "end_ori"
MOTION_TYPE = "motion_type"
PROP_ROT_DIR = "prop_rot_dir"
TURNS = "turns"
BEAT = "beat"
LETTER = "letter"
START_POS = "start_pos"
END_POS = "end_pos"

# Motion types
PRO = "pro"
ANTI = "anti"
FLOAT = "float"
DASH = "dash"
STATIC = "static"
PREFLOAT_MOTION_TYPE = "prefloat_motion_type"
PREFLOAT_PROP_ROT_DIR = "prefloat_prop_rot_dir"

# Rotation directions
CLOCKWISE = "cw"
COUNTER_CLOCKWISE = "ccw"
NO_ROT = "no_rot"

# Orientations
IN = "in"

if TYPE_CHECKING:
    from desktop.modern.core.dependency_injection.di_container import DIContainer


class BaseSequenceBuilder:
    """
    Base class for sequence builders with common generation logic.
    
    Provides shared functionality for orientation management, turn allocation,
    and sequence manipulation that's used by both freeform and circular builders.
    """
    
    def __init__(self, container: "DIContainer"):
        self.container = container
        self.sequence: List[Dict[str, Any]] = []
        
        # Get required services from container
        try:
            from desktop.modern.core.interfaces.core_services import ISequenceManager
            self.sequence_manager = container.resolve(ISequenceManager)
        except Exception:
            self.sequence_manager = None
            
        try:
            from desktop.modern.core.interfaces.core_services import ISettingsCoordinator
            self.settings_service = container.resolve(ISettingsCoordinator)
        except Exception:
            self.settings_service = None

    def initialize_sequence(self, length: int, config: GenerationConfig) -> None:
        """
        Initialize sequence for generation.
        
        Args:
            length: Target sequence length
            config: Generation configuration
        """
        # Load current sequence from sequence manager
        if self.sequence_manager:
            try:
                self.sequence = self.sequence_manager.get_current_sequence()
            except Exception:
                self.sequence = [{}]  # Start with empty beat
        else:
            self.sequence = [{}]  # Fallback
        
        # Add start position if sequence is empty
        if len(self.sequence) == 1:
            self._add_start_position(config)
            
        # Update sequence length if needed
        self._ensure_sequence_length(length)

    def _add_start_position(self, config: GenerationConfig) -> None:
        """Add a start position to the sequence."""
        # Define possible start positions based on grid mode
        diamond_keys = ["alpha1_alpha1", "beta5_beta5", "gamma11_gamma11"]
        other_keys = ["alpha2_alpha2", "beta4_beta4", "gamma12_gamma12"]
        alphabeta_keys = ["alpha1_alpha1", "beta5_beta5"]
        
        # Choose appropriate keys based on CAP type
        if hasattr(config, 'cap_type') and str(config.cap_type).lower() == "mirrored":
            start_keys = alphabeta_keys
        else:
            start_keys = diamond_keys  # Default to diamond mode
        
        chosen_key = random.choice(start_keys)
        start_pos, end_pos = chosen_key.split("_")
        
        # Create start position data
        start_position_data = {
            START_POS: start_pos,
            END_POS: end_pos,
            BLUE_ATTRS: {
                START_ORI: IN,
                END_ORI: IN,
                MOTION_TYPE: STATIC,
                PROP_ROT_DIR: NO_ROT,
                TURNS: 0
            },
            RED_ATTRS: {
                START_ORI: IN,
                END_ORI: IN,
                MOTION_TYPE: STATIC,
                PROP_ROT_DIR: NO_ROT,
                TURNS: 0
            },
            BEAT: 0
        }
        
        # Add to sequence
        self.sequence.append(start_position_data)

    def _ensure_sequence_length(self, target_length: int) -> None:
        """Ensure sequence can accommodate target length."""
        # This is a placeholder - in the full implementation,
        # this would interact with the sequence workbench
        pass

    def update_start_orientations(
        self, 
        next_data: Dict[str, Any], 
        last_data: Dict[str, Any]
    ) -> None:
        """
        Update start orientations based on previous beat's end orientations.
        
        Args:
            next_data: Next beat data to update
            last_data: Previous beat data for reference
        """
        if BLUE_ATTRS not in last_data or RED_ATTRS not in last_data:
            return
            
        blue_end_ori = last_data[BLUE_ATTRS].get(END_ORI)
        red_end_ori = last_data[RED_ATTRS].get(END_ORI)
        
        if blue_end_ori and red_end_ori:
            next_data[BLUE_ATTRS][START_ORI] = blue_end_ori
            next_data[RED_ATTRS][START_ORI] = red_end_ori

    def update_end_orientations(self, next_data: Dict[str, Any]) -> None:
        """
        Update end orientations using orientation calculator.
        
        This is a simplified implementation - the full version would use
        the ori_calculator service from the container.
        """
        # Placeholder implementation - in reality this would calculate
        # end orientations based on motion type, turns, etc.
        # For now, just copy start orientations
        if BLUE_ATTRS in next_data and RED_ATTRS in next_data:
            blue_start = next_data[BLUE_ATTRS].get(START_ORI, IN)
            red_start = next_data[RED_ATTRS].get(START_ORI, IN)
            
            next_data[BLUE_ATTRS][END_ORI] = blue_start
            next_data[RED_ATTRS][END_ORI] = red_start

    def update_dash_static_prop_rot_dirs(
        self,
        next_beat: Dict[str, Any],
        prop_continuity: PropContinuity,
        blue_rot_dir: Optional[str],
        red_rot_dir: Optional[str],
    ) -> None:
        """
        Update prop rotation directions for dash/static motion types.
        
        Args:
            next_beat: Beat data to update
            prop_continuity: Prop continuity setting
            blue_rot_dir: Blue prop rotation direction
            red_rot_dir: Red prop rotation direction
        """
        def update_attr(color: str, rot_dir: Optional[str]):
            color_attrs = f"{color}_attributes"
            if color_attrs not in next_beat:
                return
                
            motion_data = next_beat[color_attrs]
            motion_type = motion_data.get(MOTION_TYPE)
            turns = motion_data.get(TURNS, 0)
            
            if motion_type in [DASH, STATIC]:
                if prop_continuity == PropContinuity.CONTINUOUS and rot_dir:
                    motion_data[PROP_ROT_DIR] = rot_dir if turns > 0 else NO_ROT
                else:
                    # Random continuity
                    if turns > 0:
                        motion_data[PROP_ROT_DIR] = random.choice([CLOCKWISE, COUNTER_CLOCKWISE])
                    else:
                        motion_data[PROP_ROT_DIR] = NO_ROT

        update_attr(BLUE, blue_rot_dir)
        update_attr(RED, red_rot_dir)

    def set_turns(
        self, 
        next_beat: Dict[str, Any], 
        turn_blue: Any, 
        turn_red: Any
    ) -> Dict[str, Any]:
        """
        Set turn values for both colors.
        
        Args:
            next_beat: Beat data to update
            turn_blue: Blue turn value
            turn_red: Red turn value
            
        Returns:
            Updated beat data
        """
        def set_float_turns(color: str):
            """Handle special 'fl' (float) turn values."""
            color_attrs = f"{color}_attributes"
            if color_attrs not in next_beat:
                return
                
            attr = next_beat[color_attrs]
            motion_type = attr.get(MOTION_TYPE)
            
            if motion_type in [PRO, ANTI]:
                attr[TURNS] = "fl"
                attr[PREFLOAT_MOTION_TYPE] = motion_type
                attr[PREFLOAT_PROP_ROT_DIR] = attr.get(PROP_ROT_DIR, NO_ROT)
                attr[MOTION_TYPE] = FLOAT
                attr[PROP_ROT_DIR] = NO_ROT
            else:
                attr[TURNS] = 0

        # Handle blue turns
        if turn_blue == "fl":
            set_float_turns(BLUE)
        else:
            if BLUE_ATTRS in next_beat:
                next_beat[BLUE_ATTRS][TURNS] = turn_blue

        # Handle red turns
        if turn_red == "fl":
            set_float_turns(RED)
        else:
            if RED_ATTRS in next_beat:
                next_beat[RED_ATTRS][TURNS] = turn_red

        return next_beat

    def update_beat_number(
        self, 
        next_data: Dict[str, Any], 
        sequence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Set beat number based on sequence length."""
        next_data[BEAT] = len(sequence) - 1
        return next_data

    def filter_options_by_rotation(
        self, 
        options: List[Dict[str, Any]], 
        blue_rot: Optional[str], 
        red_rot: Optional[str]
    ) -> List[Dict[str, Any]]:
        """Filter options to match given rotation directions."""
        if not blue_rot and not red_rot:
            return options
            
        filtered = []
        for opt in options:
            blue_matches = (
                not blue_rot or 
                opt.get(BLUE_ATTRS, {}).get(PROP_ROT_DIR) in [blue_rot, NO_ROT]
            )
            red_matches = (
                not red_rot or 
                opt.get(RED_ATTRS, {}).get(PROP_ROT_DIR) in [red_rot, NO_ROT]
            )
            
            if blue_matches and red_matches:
                filtered.append(opt)
        
        return filtered if filtered else options  # Return original if no matches
