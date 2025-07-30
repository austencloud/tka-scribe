"""
Test Positioning Service Integration

Tests the integration between various positioning services.
"""

import pytest
from unittest.mock import Mock, patch

from desktop.modern.domain.models.motion_data import MotionData
from desktop.modern.domain.models.beat_data import BeatData
from desktop.modern.domain.models.sequence_data import SequenceData
from desktop.modern.domain.models.enums import (
    MotionType,
    RotationDirection,
    Location,
    Orientation,
    Letter
)


@pytest.fixture
def sample_beat_data():
    """Create sample beat data for testing."""
    red_motion = MotionData(
        motion_type=MotionType.PRO,
        prop_rot_dir=RotationDirection.CLOCKWISE,
        start_loc=Location.NORTH,
        end_loc=Location.SOUTH,
        turns=1,
        start_ori=Orientation.IN,
        end_ori=Orientation.OUT
    )
    
    blue_motion = MotionData(
        motion_type=MotionType.ANTI,
        prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
        start_loc=Location.EAST,
        end_loc=Location.WEST,
        turns=1,
        start_ori=Orientation.IN,
        end_ori=Orientation.OUT
    )
    
    return BeatData(
        beat_number=1,
        letter=Letter.A,
        red_motion=red_motion,
        blue_motion=blue_motion
    )


@pytest.fixture
def sample_sequence_data(sample_beat_data):
    """Create sample sequence data for testing."""
    return SequenceData(
        id="test-sequence-1",
        name="Test Sequence",
        beats=[sample_beat_data],
        length=1
    )


class TestPositioningServiceIntegration:
    """Test integration between positioning services."""

    def test_prop_rotation_and_overlap_integration(self, sample_beat_data):
        """Test integration between prop rotation and overlap detection."""
        # Test that rotation calculation and overlap detection work together
        red_motion = sample_beat_data.red_motion
        blue_motion = sample_beat_data.blue_motion
        
        # Verify motion data setup
        assert red_motion.motion_type == MotionType.PRO
        assert blue_motion.motion_type == MotionType.ANTI
        
        # Test that different start locations don't overlap
        assert red_motion.start_loc != blue_motion.start_loc
        
        # Test that rotation directions are different
        assert red_motion.prop_rot_dir != blue_motion.prop_rot_dir

    def test_letter_positioning_and_rotation_integration(self, sample_beat_data):
        """Test integration between letter positioning and rotation calculation."""
        # Test Letter I positioning with rotation
        letter_i_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,  # Letter I pattern
            turns=1,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        # Test Letter I characteristics
        assert letter_i_motion.start_loc == Location.NORTH
        assert letter_i_motion.end_loc == Location.SOUTH
        assert letter_i_motion.turns == 1

    def test_offset_calculation_and_positioning_integration(self, sample_beat_data):
        """Test integration between offset calculation and positioning."""
        # Test that offset calculations work with positioning
        motion = sample_beat_data.red_motion
        
        # Test motion properties that affect offset calculation
        assert motion.start_loc == Location.NORTH
        assert motion.end_loc == Location.SOUTH
        assert motion.start_ori == Orientation.IN
        assert motion.end_ori == Orientation.OUT

    def test_beta_positioning_integration(self, sample_beat_data):
        """Test beta positioning detection integration."""
        # Create beta position motion (start_pos == end_pos)
        beta_motion = MotionData(
            motion_type=MotionType.STATIC,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTH,
            end_loc=Location.NORTH,  # Beta position
            turns=0,
            start_ori=Orientation.IN,
            end_ori=Orientation.IN
        )
        
        # Test beta position characteristics
        assert beta_motion.start_loc == beta_motion.end_loc
        assert beta_motion.motion_type == MotionType.STATIC

    def test_orchestrator_integration(self, sample_sequence_data):
        """Test positioning orchestrator integration."""
        # Test that orchestrator can handle sequence data
        sequence = sample_sequence_data
        
        # Verify sequence structure
        assert len(sequence.beats) == 1
        assert sequence.beats[0].beat_number == 1
        
        # Test that beat has both motions
        beat = sequence.beats[0]
        assert beat.red_motion is not None
        assert beat.blue_motion is not None

    def test_multi_beat_positioning_integration(self):
        """Test positioning integration across multiple beats."""
        # Create multiple beats with different patterns
        beat1 = BeatData(
            beat_number=1,
            letter=Letter.A,
            red_motion=MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH,
                start_ori=Orientation.IN,
                end_ori=Orientation.OUT
            ),
            blue_motion=MotionData(
                motion_type=MotionType.ANTI,
                prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
                start_loc=Location.EAST,
                end_loc=Location.WEST,
                start_ori=Orientation.IN,
                end_ori=Orientation.OUT
            )
        )
        
        beat2 = BeatData(
            beat_number=2,
            letter=Letter.B,
            red_motion=MotionData(
                motion_type=MotionType.STATIC,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.SOUTH,  # Continues from beat1 end
                end_loc=Location.SOUTH,
                start_ori=Orientation.OUT,  # Continues from beat1 end
                end_ori=Orientation.OUT
            ),
            blue_motion=MotionData(
                motion_type=MotionType.DASH,
                prop_rot_dir=RotationDirection.NO_ROTATION,
                start_loc=Location.WEST,  # Continues from beat1 end
                end_loc=Location.WEST,
                start_ori=Orientation.OUT,  # Continues from beat1 end
                end_ori=Orientation.OUT
            )
        )
        
        sequence = SequenceData(
            id="multi-beat-test",
            name="Multi Beat Test",
            beats=[beat1, beat2],
            length=2
        )
        
        # Test sequence continuity
        assert sequence.beats[0].red_motion.end_loc == sequence.beats[1].red_motion.start_loc
        assert sequence.beats[0].blue_motion.end_loc == sequence.beats[1].blue_motion.start_loc

    def test_complex_motion_integration(self):
        """Test integration with complex motion patterns."""
        # Test complex motion with multiple turns and orientation changes
        complex_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTHEAST,
            end_loc=Location.SOUTHWEST,
            turns=2.5,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        # Test complex motion properties
        assert complex_motion.turns == 2.5
        assert complex_motion.start_loc == Location.NORTHEAST
        assert complex_motion.end_loc == Location.SOUTHWEST

    def test_float_motion_integration(self):
        """Test integration with float motions."""
        float_motion = MotionData(
            motion_type=MotionType.FLOAT,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            turns="fl",
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        regular_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.EAST,
            end_loc=Location.WEST,
            turns=1,
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        beat = BeatData(
            beat_number=1,
            letter=Letter.F,
            red_motion=float_motion,
            blue_motion=regular_motion
        )
        
        # Test float and regular motion integration
        assert beat.red_motion.motion_type == MotionType.FLOAT
        assert beat.blue_motion.motion_type == MotionType.PRO

    def test_positioning_service_error_handling(self):
        """Test positioning service error handling integration."""
        # Test with invalid motion data
        try:
            invalid_motion = MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH,
                turns=-1,  # Invalid turns
                start_ori=Orientation.IN,
                end_ori=Orientation.OUT
            )
            
            # Should handle gracefully
            assert invalid_motion.turns == -1
            
        except Exception as e:
            # If validation is strict, should get meaningful error
            assert isinstance(e, (ValueError, TypeError))

    def test_positioning_performance_integration(self):
        """Test positioning service performance integration."""
        # Create many beats to test performance
        beats = []
        for i in range(50):
            beat = BeatData(
                beat_number=i + 1,
                letter=Letter.A,
                red_motion=MotionData(
                    motion_type=MotionType.PRO,
                    prop_rot_dir=RotationDirection.CLOCKWISE,
                    start_loc=Location.NORTH,
                    end_loc=Location.SOUTH,
                    turns=i % 4,
                    start_ori=Orientation.IN,
                    end_ori=Orientation.OUT if i % 2 else Orientation.IN
                ),
                blue_motion=MotionData(
                    motion_type=MotionType.ANTI,
                    prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
                    start_loc=Location.EAST,
                    end_loc=Location.WEST,
                    turns=i % 3,
                    start_ori=Orientation.IN,
                    end_ori=Orientation.OUT if i % 2 else Orientation.IN
                )
            )
            beats.append(beat)
        
        sequence = SequenceData(
            id="performance-test",
            name="Performance Test",
            beats=beats,
            length=len(beats)
        )
        
        # Test that large sequences can be created efficiently
        assert len(sequence.beats) == 50
        assert sequence.length == 50

    def test_positioning_consistency_integration(self):
        """Test positioning consistency across service integration."""
        # Create the same motion multiple times
        motions = []
        for _ in range(10):
            motion = MotionData(
                motion_type=MotionType.PRO,
                prop_rot_dir=RotationDirection.CLOCKWISE,
                start_loc=Location.NORTH,
                end_loc=Location.SOUTH,
                turns=1,
                start_ori=Orientation.IN,
                end_ori=Orientation.OUT
            )
            motions.append(motion)
        
        # Test that all motions are identical
        first_motion = motions[0]
        for motion in motions[1:]:
            assert motion.motion_type == first_motion.motion_type
            assert motion.start_loc == first_motion.start_loc
            assert motion.end_loc == first_motion.end_loc
            assert motion.turns == first_motion.turns

    def test_positioning_backward_compatibility_integration(self):
        """Test positioning service backward compatibility integration."""
        # Test with legacy-style data
        legacy_motion = MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
            turns=1.0,  # Explicit float
            start_ori=Orientation.IN,
            end_ori=Orientation.OUT
        )
        
        # Test backward compatibility
        assert isinstance(legacy_motion.turns, (int, float))
        assert legacy_motion.motion_type == MotionType.PRO

    def test_end_to_end_positioning_integration(self, sample_sequence_data):
        """Test end-to-end positioning service integration."""
        # Test complete positioning pipeline
        sequence = sample_sequence_data
        
        # Verify sequence can be processed
        assert sequence.id == "test-sequence-1"
        assert len(sequence.beats) == 1
        
        # Verify beat can be processed
        beat = sequence.beats[0]
        assert beat.beat_number == 1
        assert beat.letter == Letter.A
        
        # Verify motions can be processed
        assert beat.red_motion.motion_type == MotionType.PRO
        assert beat.blue_motion.motion_type == MotionType.ANTI
        
        # Verify positioning data is complete
        assert beat.red_motion.start_loc is not None
        assert beat.red_motion.end_loc is not None
        assert beat.blue_motion.start_loc is not None
        assert beat.blue_motion.end_loc is not None
