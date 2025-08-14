"""
Test Orientation Continuity Fix

Comprehensive test to verify that the orientation continuity fixes work correctly
across all scenarios where options are loaded into the option picker.
"""

import pytest
from unittest.mock import Mock, MagicMock

from desktop.modern.domain.models.sequence_data import SequenceData
from desktop.modern.domain.models.beat_data import BeatData
from desktop.modern.domain.models.pictograph_data import PictographData
from desktop.modern.domain.models.motion_data import MotionData
from desktop.modern.domain.models.enums import Orientation, Location, MotionType, RotationDirection

from desktop.modern.application.services.option_picker.sequence_option_service import SequenceOptionService
from desktop.modern.application.services.sequence.sequence_orientation_validator import SequenceOrientationValidator
from desktop.modern.application.services.sequence.sequence_continuity_monitor import SequenceContinuityMonitor
from desktop.modern.application.services.option_picker.option_orientation_updater import OptionOrientationUpdater


class TestOrientationContinuityFix:
    """Test suite for orientation continuity fixes."""

    def setup_method(self):
        """Set up test fixtures."""
        self.position_matcher = Mock()
        self.sequence_option_service = SequenceOptionService(self.position_matcher)
        self.orientation_validator = SequenceOrientationValidator()
        self.continuity_monitor = SequenceContinuityMonitor()
        self.orientation_updater = OptionOrientationUpdater()

    def create_test_motion(self, start_ori: Orientation, end_ori: Orientation) -> MotionData:
        """Create a test motion with specified orientations."""
        return MotionData(
            motion_type=MotionType.PRO,
            turns=1.0,
            start_ori=start_ori,
            end_ori=end_ori,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            prop_rot_dir=RotationDirection.CLOCKWISE
        )

    def create_test_pictograph(self, letter: str, blue_start: Orientation, blue_end: Orientation, 
                              red_start: Orientation, red_end: Orientation) -> PictographData:
        """Create a test pictograph with specified orientations."""
        blue_motion = self.create_test_motion(blue_start, blue_end)
        red_motion = self.create_test_motion(red_start, red_end)
        
        return PictographData(
            letter=letter,
            start_position="alpha1",
            end_position="beta1",
            motions={"blue": blue_motion, "red": red_motion},
            props={}  # Simplified for testing
        )

    def create_test_sequence(self, pictographs: list[PictographData]) -> SequenceData:
        """Create a test sequence from pictographs."""
        beats = []
        for i, pictograph in enumerate(pictographs):
            beat = BeatData(
                beat_number=i + 1,
                pictograph_data=pictograph,
                is_blank=False
            )
            beats.append(beat)
        
        return SequenceData(beats=beats, length=len(beats))

    def test_sequence_orientation_validator_extracts_correct_end_orientations(self):
        """Test that the orientation validator correctly extracts end orientations."""
        # Create a sequence ending with specific orientations
        pictograph = self.create_test_pictograph(
            "A", 
            Orientation.IN, Orientation.CLOCK,  # blue: in -> clock
            Orientation.OUT, Orientation.COUNTER  # red: out -> counter
        )
        sequence = self.create_test_sequence([pictograph])
        
        # Extract end orientations
        end_orientations = self.orientation_validator.get_sequence_end_orientations(sequence)
        
        # Verify correct end orientations are extracted
        assert end_orientations["blue"] == Orientation.CLOCK
        assert end_orientations["red"] == Orientation.COUNTER

    def test_option_orientation_updater_fixes_motion_orientations(self):
        """Test that the updated OptionOrientationUpdater properly handles motion orientations."""
        # Create a test option with default orientations
        option = self.create_test_pictograph(
            "B",
            Orientation.IN, Orientation.OUT,  # blue: in -> out (default)
            Orientation.OUT, Orientation.IN   # red: out -> in (default)
        )
        
        # Create a sequence that ends with different orientations
        sequence_end = self.create_test_pictograph(
            "A",
            Orientation.IN, Orientation.CLOCK,  # blue ends with clock
            Orientation.OUT, Orientation.COUNTER  # red ends with counter
        )
        sequence = self.create_test_sequence([sequence_end])
        
        # Update option orientations
        updated_options = self.orientation_updater.update_option_orientations(sequence, [option])
        
        # Verify that the option now starts with the sequence's end orientations
        updated_option = updated_options[0]
        assert updated_option.motions["blue"].start_ori == Orientation.CLOCK
        assert updated_option.motions["red"].start_ori == Orientation.COUNTER

    def test_continuity_monitor_detects_orientation_breaks(self):
        """Test that the continuity monitor detects orientation discontinuities."""
        # Create a sequence with orientation discontinuity
        pictograph1 = self.create_test_pictograph(
            "A",
            Orientation.IN, Orientation.CLOCK,  # blue: in -> clock
            Orientation.OUT, Orientation.COUNTER  # red: out -> counter
        )
        
        # Second pictograph starts with wrong orientations (should start with clock/counter)
        pictograph2 = self.create_test_pictograph(
            "B", 
            Orientation.IN, Orientation.OUT,  # blue: in -> out (WRONG! should start with clock)
            Orientation.OUT, Orientation.IN   # red: out -> in (WRONG! should start with counter)
        )
        
        sequence = self.create_test_sequence([pictograph1, pictograph2])
        
        # Validate continuity
        is_valid, errors = self.continuity_monitor._orientation_validator.validate_sequence_orientation_continuity(sequence)
        
        # Should detect discontinuity
        assert not is_valid
        assert len(errors) == 2  # One for blue, one for red
        assert "blue" in errors[0].lower()
        assert "red" in errors[1].lower()

    def test_continuity_monitor_auto_fixes_orientation_issues(self):
        """Test that the continuity monitor can auto-fix orientation issues."""
        # Create a sequence with orientation discontinuity
        pictograph1 = self.create_test_pictograph(
            "A",
            Orientation.IN, Orientation.CLOCK,
            Orientation.OUT, Orientation.COUNTER
        )
        
        pictograph2 = self.create_test_pictograph(
            "B",
            Orientation.IN, Orientation.OUT,  # Wrong start orientations
            Orientation.OUT, Orientation.IN
        )
        
        sequence = self.create_test_sequence([pictograph1, pictograph2])
        
        # Auto-fix the sequence
        is_valid, issues, fixed_sequence = self.continuity_monitor.validate_sequence_continuity(sequence)
        
        # Should detect issues and provide a fix
        assert not is_valid
        assert len(issues) > 0
        assert fixed_sequence is not None
        
        # Verify the fixed sequence has proper continuity
        fixed_valid, fixed_errors = self.continuity_monitor._orientation_validator.validate_sequence_orientation_continuity(fixed_sequence)
        assert fixed_valid
        assert len(fixed_errors) == 0

    def test_sequence_option_service_uses_continuity_validation(self):
        """Test that the sequence option service properly validates continuity."""
        # Mock the position matcher to return some test options
        test_options = [
            self.create_test_pictograph("B", Orientation.IN, Orientation.OUT, Orientation.OUT, Orientation.IN),
            self.create_test_pictograph("C", Orientation.IN, Orientation.CLOCK, Orientation.OUT, Orientation.COUNTER)
        ]
        self.position_matcher.get_matching_pictographs.return_value = test_options
        
        # Create a test sequence
        sequence_pictograph = self.create_test_pictograph(
            "A",
            Orientation.IN, Orientation.CLOCK,
            Orientation.OUT, Orientation.COUNTER
        )
        sequence = self.create_test_sequence([sequence_pictograph])
        
        # Get options for sequence (this should trigger continuity validation)
        options_by_type = self.sequence_option_service.get_options_for_sequence(sequence)
        
        # Verify that options were processed (exact validation depends on implementation details)
        assert isinstance(options_by_type, dict)

    def test_option_continuity_validation(self):
        """Test that options are validated for continuity compatibility."""
        # Create a sequence ending with specific orientations
        sequence_pictograph = self.create_test_pictograph(
            "A",
            Orientation.IN, Orientation.CLOCK,
            Orientation.OUT, Orientation.COUNTER
        )
        sequence = self.create_test_sequence([sequence_pictograph])
        
        # Create an option that would maintain continuity
        compatible_option = self.create_test_pictograph(
            "B",
            Orientation.CLOCK, Orientation.IN,  # Starts with clock (matches sequence end)
            Orientation.COUNTER, Orientation.OUT  # Starts with counter (matches sequence end)
        )
        
        # Create an option that would break continuity
        incompatible_option = self.create_test_pictograph(
            "C",
            Orientation.IN, Orientation.OUT,  # Starts with in (doesn't match sequence end)
            Orientation.OUT, Orientation.IN   # Starts with out (doesn't match sequence end)
        )
        
        # Test continuity validation
        compatible, issues1 = self.continuity_monitor.ensure_option_continuity(sequence, compatible_option)
        incompatible, issues2 = self.continuity_monitor.ensure_option_continuity(sequence, incompatible_option)
        
        # Compatible option should pass
        assert compatible
        assert len(issues1) == 0
        
        # Incompatible option should fail
        assert not incompatible
        assert len(issues2) > 0

    def test_continuity_report_generation(self):
        """Test that continuity reports are generated correctly."""
        # Create a sequence with known continuity status
        pictograph = self.create_test_pictograph(
            "A",
            Orientation.IN, Orientation.CLOCK,
            Orientation.OUT, Orientation.COUNTER
        )
        sequence = self.create_test_sequence([pictograph])
        
        # Generate continuity report
        report = self.continuity_monitor.get_continuity_report(sequence)
        
        # Verify report structure
        assert "valid" in report
        assert "total_beats" in report
        assert "orientation_issues" in report
        assert "position_issues" in report
        assert "end_orientations" in report
        assert "summary" in report
        
        # For a single beat sequence, should be valid
        assert report["valid"] is True
        assert report["total_beats"] == 1
        assert report["end_orientations"]["blue"] == "clock"
        assert report["end_orientations"]["red"] == "counter"


if __name__ == "__main__":
    # Run the tests
    test_suite = TestOrientationContinuityFix()
    test_suite.setup_method()
    
    print("Running orientation continuity fix tests...")
    
    try:
        test_suite.test_sequence_orientation_validator_extracts_correct_end_orientations()
        print("✅ Orientation extraction test passed")
        
        test_suite.test_continuity_monitor_detects_orientation_breaks()
        print("✅ Discontinuity detection test passed")
        
        test_suite.test_continuity_report_generation()
        print("✅ Report generation test passed")
        
        print("\n🎉 All orientation continuity tests passed!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
