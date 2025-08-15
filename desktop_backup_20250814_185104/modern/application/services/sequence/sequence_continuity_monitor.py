"""
Sequence Continuity Monitor Service

A service that continuously monitors and maintains orientation and position continuity
in motion sequences. This service validates sequence integrity after major adjustments
and ensures all metadata shows proper continuity of both positions and orientations.

This addresses the legacy requirement where a service continuously checked sequence
continuity and maintained proper flow between motions.
"""

import logging
from typing import Optional, List, Tuple, Dict, Any

from desktop.modern.domain.models.sequence_data import SequenceData
from desktop.modern.domain.models.beat_data import BeatData
from desktop.modern.domain.models.enums import Orientation
from desktop.modern.application.services.sequence.sequence_orientation_validator import (
    SequenceOrientationValidator,
)

logger = logging.getLogger(__name__)


class SequenceContinuityMonitor:
    """
    Service for continuously monitoring and maintaining sequence continuity.
    
    This service:
    1. Validates orientation continuity throughout sequences
    2. Detects and reports continuity breaks
    3. Provides automatic fixing capabilities
    4. Monitors sequences after major modifications
    5. Ensures proper flow between consecutive motions
    """

    def __init__(self):
        """Initialize the continuity monitor."""
        self._orientation_validator = SequenceOrientationValidator()
        self._monitoring_enabled = True
        self._auto_fix_enabled = True
        
    def enable_monitoring(self, enabled: bool = True) -> None:
        """Enable or disable continuous monitoring."""
        self._monitoring_enabled = enabled
        logger.info(f"Sequence continuity monitoring {'enabled' if enabled else 'disabled'}")
        
    def enable_auto_fix(self, enabled: bool = True) -> None:
        """Enable or disable automatic fixing of continuity issues."""
        self._auto_fix_enabled = enabled
        logger.info(f"Auto-fix for continuity issues {'enabled' if enabled else 'disabled'}")

    def validate_sequence_continuity(
        self, sequence: SequenceData
    ) -> Tuple[bool, List[str], Optional[SequenceData]]:
        """
        Comprehensive validation of sequence continuity.
        
        Args:
            sequence: The sequence to validate
            
        Returns:
            Tuple of (is_valid, list_of_issues, fixed_sequence_if_auto_fix_enabled)
        """
        if not self._monitoring_enabled:
            return True, [], None
            
        if not sequence or not sequence.beats:
            return True, [], None
            
        logger.debug(f"Validating continuity for sequence with {len(sequence.beats)} beats")
        
        # Validate orientation continuity
        orientation_valid, orientation_errors = self._orientation_validator.validate_sequence_orientation_continuity(sequence)
        
        # Validate position continuity
        position_valid, position_errors = self._validate_position_continuity(sequence)
        
        # Combine all issues
        all_issues = orientation_errors + position_errors
        is_valid = orientation_valid and position_valid
        
        fixed_sequence = None
        if not is_valid and self._auto_fix_enabled:
            logger.info(f"Auto-fixing {len(all_issues)} continuity issues")
            fixed_sequence = self._auto_fix_continuity_issues(sequence, all_issues)
            
        if all_issues:
            logger.warning(f"Sequence continuity validation found {len(all_issues)} issues: {all_issues}")
        else:
            logger.debug("Sequence continuity validation passed")
            
        return is_valid, all_issues, fixed_sequence

    def monitor_sequence_modification(
        self, original_sequence: SequenceData, modified_sequence: SequenceData
    ) -> Tuple[bool, List[str], Optional[SequenceData]]:
        """
        Monitor sequence after modification to ensure continuity is maintained.
        
        Args:
            original_sequence: The sequence before modification
            modified_sequence: The sequence after modification
            
        Returns:
            Tuple of (continuity_maintained, list_of_new_issues, fixed_sequence_if_needed)
        """
        if not self._monitoring_enabled:
            return True, [], None
            
        logger.debug("Monitoring sequence modification for continuity changes")
        
        # Validate the modified sequence
        is_valid, issues, fixed_sequence = self.validate_sequence_continuity(modified_sequence)
        
        if not is_valid:
            logger.warning(f"Sequence modification introduced {len(issues)} continuity issues")
            
        return is_valid, issues, fixed_sequence

    def ensure_option_continuity(
        self, sequence: SequenceData, new_option_data: Any
    ) -> Tuple[bool, List[str]]:
        """
        Ensure that adding a new option maintains sequence continuity.
        
        Args:
            sequence: Current sequence
            new_option_data: The new option being added
            
        Returns:
            Tuple of (will_maintain_continuity, list_of_potential_issues)
        """
        if not self._monitoring_enabled:
            return True, []
            
        # Get sequence end orientations
        end_orientations = self._orientation_validator.get_sequence_end_orientations(sequence)
        
        # Check if new option starts with compatible orientations
        issues = []
        
        # This would need to be implemented based on the specific option data structure
        # For now, we'll do a basic check
        if hasattr(new_option_data, 'motions'):
            for color in ['blue', 'red']:
                if color in new_option_data.motions:
                    motion = new_option_data.motions[color]
                    if hasattr(motion, 'start_ori'):
                        expected_start = end_orientations.get(color)
                        actual_start = motion.start_ori
                        
                        if expected_start and actual_start and expected_start != actual_start:
                            issues.append(
                                f"Option {color} motion starts with {actual_start.value} "
                                f"but sequence ends with {expected_start.value}"
                            )
        
        is_compatible = len(issues) == 0
        if not is_compatible:
            logger.warning(f"New option would break continuity: {issues}")
            
        return is_compatible, issues

    def _validate_position_continuity(self, sequence: SequenceData) -> Tuple[bool, List[str]]:
        """
        Validate that positions flow correctly throughout the sequence.
        
        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        if not sequence or not sequence.beats:
            return True, []
            
        errors = []
        regular_beats = [
            beat for beat in sequence.beats 
            if not beat.is_blank and beat.beat_number > 0
        ]
        
        if len(regular_beats) < 2:
            return True, []  # Need at least 2 beats to check continuity
            
        # Check position continuity between consecutive beats
        for i in range(1, len(regular_beats)):
            previous_beat = regular_beats[i - 1]
            current_beat = regular_beats[i]
            
            if (previous_beat.pictograph_data and current_beat.pictograph_data):
                prev_end_pos = previous_beat.pictograph_data.end_position
                curr_start_pos = current_beat.pictograph_data.start_position
                
                if prev_end_pos and curr_start_pos and prev_end_pos != curr_start_pos:
                    errors.append(
                        f"Position discontinuity between beats {previous_beat.beat_number} "
                        f"and {current_beat.beat_number}: {prev_end_pos} -> {curr_start_pos}"
                    )
        
        return len(errors) == 0, errors

    def _auto_fix_continuity_issues(
        self, sequence: SequenceData, issues: List[str]
    ) -> Optional[SequenceData]:
        """
        Automatically fix continuity issues in the sequence.
        
        Args:
            sequence: The sequence with continuity issues
            issues: List of identified issues
            
        Returns:
            Fixed sequence or None if fixing failed
        """
        try:
            # Use the orientation validator's fix method for orientation issues
            fixed_sequence, fixes_applied = self._orientation_validator.validate_and_fix_sequence_orientations(sequence)
            
            if fixes_applied:
                logger.info(f"Applied {len(fixes_applied)} orientation fixes: {fixes_applied}")
                
            return fixed_sequence
            
        except Exception as e:
            logger.error(f"Failed to auto-fix continuity issues: {e}")
            return None

    def get_continuity_report(self, sequence: SequenceData) -> Dict[str, Any]:
        """
        Generate a comprehensive continuity report for a sequence.
        
        Args:
            sequence: The sequence to analyze
            
        Returns:
            Dictionary containing detailed continuity analysis
        """
        if not sequence or not sequence.beats:
            return {
                "valid": True,
                "total_beats": 0,
                "orientation_issues": [],
                "position_issues": [],
                "summary": "Empty sequence - no continuity issues"
            }
            
        # Validate both orientation and position continuity
        orientation_valid, orientation_errors = self._orientation_validator.validate_sequence_orientation_continuity(sequence)
        position_valid, position_errors = self._validate_position_continuity(sequence)
        
        # Get sequence end orientations for reference
        end_orientations = self._orientation_validator.get_sequence_end_orientations(sequence)
        
        report = {
            "valid": orientation_valid and position_valid,
            "total_beats": len([b for b in sequence.beats if not b.is_blank]),
            "orientation_issues": orientation_errors,
            "position_issues": position_errors,
            "end_orientations": {
                color: ori.value for color, ori in end_orientations.items()
            },
            "summary": self._generate_summary(orientation_valid, position_valid, orientation_errors, position_errors)
        }
        
        return report

    def _generate_summary(
        self, orientation_valid: bool, position_valid: bool, 
        orientation_errors: List[str], position_errors: List[str]
    ) -> str:
        """Generate a human-readable summary of continuity status."""
        if orientation_valid and position_valid:
            return "Sequence has perfect continuity"
            
        issues = []
        if not orientation_valid:
            issues.append(f"{len(orientation_errors)} orientation issue(s)")
        if not position_valid:
            issues.append(f"{len(position_errors)} position issue(s)")
            
        return f"Sequence has {', '.join(issues)}"
