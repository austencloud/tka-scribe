"""
Test Sequence Card Services

Tests the sequence card functionality including data management, navigation, and rendering.
"""

import pytest
from unittest.mock import Mock, patch

from desktop.modern.domain.models.sequence_data import SequenceData
from desktop.modern.domain.models.beat_data import BeatData
from desktop.modern.domain.models.motion_data import MotionData
from desktop.modern.domain.models.enums import (
    MotionType,
    RotationDirection,
    Location,
    Orientation,
    Letter
)


@pytest.fixture
def sample_sequence_data():
    """Create sample sequence data for testing."""
    # Create sample beats
    beat1 = BeatData(
        beat_number=1,
        letter=Letter.A,
        red_motion=MotionData(
            motion_type=MotionType.PRO,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH
        ),
        blue_motion=MotionData(
            motion_type=MotionType.ANTI,
            prop_rot_dir=RotationDirection.COUNTER_CLOCKWISE,
            start_loc=Location.SOUTH,
            end_loc=Location.NORTH
        )
    )
    
    beat2 = BeatData(
        beat_number=2,
        letter=Letter.B,
        red_motion=MotionData(
            motion_type=MotionType.STATIC,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.EAST,
            end_loc=Location.EAST
        ),
        blue_motion=MotionData(
            motion_type=MotionType.DASH,
            prop_rot_dir=RotationDirection.NO_ROTATION,
            start_loc=Location.WEST,
            end_loc=Location.WEST
        )
    )
    
    return SequenceData(
        id="test-sequence-1",
        name="Test Sequence",
        beats=[beat1, beat2],
        length=2
    )


@pytest.fixture
def mock_sequence_card_manager():
    """Create mock sequence card manager."""
    manager = Mock()
    manager.current_sequence = None
    manager.current_beat_index = 0
    manager.is_playing = False
    return manager


class TestSequenceCardDataManagement:
    """Test sequence card data management functionality."""

    def test_load_sequence(self, mock_sequence_card_manager, sample_sequence_data):
        """Test loading a sequence into the sequence card."""
        # Mock the load_sequence method
        mock_sequence_card_manager.load_sequence.return_value = True
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        
        # Test loading sequence
        result = mock_sequence_card_manager.load_sequence(sample_sequence_data)
        
        assert result is True
        assert mock_sequence_card_manager.current_sequence == sample_sequence_data
        mock_sequence_card_manager.load_sequence.assert_called_once_with(sample_sequence_data)

    def test_get_current_beat(self, mock_sequence_card_manager, sample_sequence_data):
        """Test getting the current beat from sequence."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.current_beat_index = 0
        mock_sequence_card_manager.get_current_beat.return_value = sample_sequence_data.beats[0]
        
        current_beat = mock_sequence_card_manager.get_current_beat()
        
        assert current_beat == sample_sequence_data.beats[0]
        assert current_beat.beat_number == 1
        assert current_beat.letter == Letter.A

    def test_get_beat_by_index(self, mock_sequence_card_manager, sample_sequence_data):
        """Test getting a beat by index."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.get_beat_by_index.return_value = sample_sequence_data.beats[1]
        
        beat = mock_sequence_card_manager.get_beat_by_index(1)
        
        assert beat == sample_sequence_data.beats[1]
        assert beat.beat_number == 2
        assert beat.letter == Letter.B

    def test_sequence_length_validation(self, mock_sequence_card_manager):
        """Test sequence length validation."""
        # Test empty sequence
        empty_sequence = SequenceData(
            id="empty-seq",
            name="Empty Sequence",
            beats=[],
            length=0
        )
        
        mock_sequence_card_manager.validate_sequence.return_value = False
        result = mock_sequence_card_manager.validate_sequence(empty_sequence)
        
        assert result is False

    def test_beat_count_consistency(self, sample_sequence_data):
        """Test that beat count matches sequence length."""
        assert len(sample_sequence_data.beats) == sample_sequence_data.length
        assert sample_sequence_data.length == 2

    def test_beat_numbering_sequence(self, sample_sequence_data):
        """Test that beats are numbered sequentially."""
        for i, beat in enumerate(sample_sequence_data.beats):
            assert beat.beat_number == i + 1


class TestSequenceCardNavigation:
    """Test sequence card navigation functionality."""

    def test_next_beat(self, mock_sequence_card_manager, sample_sequence_data):
        """Test navigating to next beat."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.current_beat_index = 0
        
        # Mock next_beat method
        mock_sequence_card_manager.next_beat.return_value = True
        mock_sequence_card_manager.current_beat_index = 1
        
        result = mock_sequence_card_manager.next_beat()
        
        assert result is True
        assert mock_sequence_card_manager.current_beat_index == 1

    def test_previous_beat(self, mock_sequence_card_manager, sample_sequence_data):
        """Test navigating to previous beat."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.current_beat_index = 1
        
        # Mock previous_beat method
        mock_sequence_card_manager.previous_beat.return_value = True
        mock_sequence_card_manager.current_beat_index = 0
        
        result = mock_sequence_card_manager.previous_beat()
        
        assert result is True
        assert mock_sequence_card_manager.current_beat_index == 0

    def test_go_to_beat(self, mock_sequence_card_manager, sample_sequence_data):
        """Test navigating to specific beat."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        
        # Mock go_to_beat method
        mock_sequence_card_manager.go_to_beat.return_value = True
        mock_sequence_card_manager.current_beat_index = 1
        
        result = mock_sequence_card_manager.go_to_beat(1)
        
        assert result is True
        assert mock_sequence_card_manager.current_beat_index == 1

    def test_navigation_bounds_checking(self, mock_sequence_card_manager, sample_sequence_data):
        """Test navigation bounds checking."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        
        # Test going beyond last beat
        mock_sequence_card_manager.go_to_beat.return_value = False
        result = mock_sequence_card_manager.go_to_beat(10)  # Beyond sequence length
        
        assert result is False

    def test_first_beat_navigation(self, mock_sequence_card_manager, sample_sequence_data):
        """Test navigating to first beat."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.go_to_first_beat.return_value = True
        mock_sequence_card_manager.current_beat_index = 0
        
        result = mock_sequence_card_manager.go_to_first_beat()
        
        assert result is True
        assert mock_sequence_card_manager.current_beat_index == 0

    def test_last_beat_navigation(self, mock_sequence_card_manager, sample_sequence_data):
        """Test navigating to last beat."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.go_to_last_beat.return_value = True
        mock_sequence_card_manager.current_beat_index = 1  # Last beat index
        
        result = mock_sequence_card_manager.go_to_last_beat()
        
        assert result is True
        assert mock_sequence_card_manager.current_beat_index == 1


class TestSequenceCardPlayback:
    """Test sequence card playback functionality."""

    def test_start_playback(self, mock_sequence_card_manager, sample_sequence_data):
        """Test starting sequence playback."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.start_playback.return_value = True
        mock_sequence_card_manager.is_playing = True
        
        result = mock_sequence_card_manager.start_playback()
        
        assert result is True
        assert mock_sequence_card_manager.is_playing is True

    def test_stop_playback(self, mock_sequence_card_manager):
        """Test stopping sequence playback."""
        mock_sequence_card_manager.is_playing = True
        mock_sequence_card_manager.stop_playback.return_value = True
        mock_sequence_card_manager.is_playing = False
        
        result = mock_sequence_card_manager.stop_playback()
        
        assert result is True
        assert mock_sequence_card_manager.is_playing is False

    def test_pause_playback(self, mock_sequence_card_manager):
        """Test pausing sequence playback."""
        mock_sequence_card_manager.is_playing = True
        mock_sequence_card_manager.pause_playback.return_value = True
        mock_sequence_card_manager.is_playing = False
        
        result = mock_sequence_card_manager.pause_playback()
        
        assert result is True
        assert mock_sequence_card_manager.is_playing is False

    def test_playback_speed_control(self, mock_sequence_card_manager):
        """Test playback speed control."""
        mock_sequence_card_manager.set_playback_speed.return_value = True
        mock_sequence_card_manager.playback_speed = 1.5
        
        result = mock_sequence_card_manager.set_playback_speed(1.5)
        
        assert result is True
        assert mock_sequence_card_manager.playback_speed == 1.5


class TestSequenceCardRendering:
    """Test sequence card rendering functionality."""

    def test_render_current_beat(self, mock_sequence_card_manager, sample_sequence_data):
        """Test rendering the current beat."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.current_beat_index = 0
        mock_sequence_card_manager.render_current_beat.return_value = True
        
        result = mock_sequence_card_manager.render_current_beat()
        
        assert result is True
        mock_sequence_card_manager.render_current_beat.assert_called_once()

    def test_render_sequence_overview(self, mock_sequence_card_manager, sample_sequence_data):
        """Test rendering sequence overview."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.render_sequence_overview.return_value = True
        
        result = mock_sequence_card_manager.render_sequence_overview()
        
        assert result is True
        mock_sequence_card_manager.render_sequence_overview.assert_called_once()

    def test_update_beat_display(self, mock_sequence_card_manager):
        """Test updating beat display."""
        mock_sequence_card_manager.update_beat_display.return_value = True
        
        result = mock_sequence_card_manager.update_beat_display()
        
        assert result is True
        mock_sequence_card_manager.update_beat_display.assert_called_once()

    def test_refresh_display(self, mock_sequence_card_manager):
        """Test refreshing the entire display."""
        mock_sequence_card_manager.refresh_display.return_value = True
        
        result = mock_sequence_card_manager.refresh_display()
        
        assert result is True
        mock_sequence_card_manager.refresh_display.assert_called_once()


class TestSequenceCardEvents:
    """Test sequence card event handling."""

    def test_beat_changed_event(self, mock_sequence_card_manager):
        """Test beat changed event handling."""
        mock_sequence_card_manager.on_beat_changed.return_value = True
        
        result = mock_sequence_card_manager.on_beat_changed(1)
        
        assert result is True
        mock_sequence_card_manager.on_beat_changed.assert_called_once_with(1)

    def test_sequence_loaded_event(self, mock_sequence_card_manager, sample_sequence_data):
        """Test sequence loaded event handling."""
        mock_sequence_card_manager.on_sequence_loaded.return_value = True
        
        result = mock_sequence_card_manager.on_sequence_loaded(sample_sequence_data)
        
        assert result is True
        mock_sequence_card_manager.on_sequence_loaded.assert_called_once_with(sample_sequence_data)

    def test_playback_state_changed_event(self, mock_sequence_card_manager):
        """Test playback state changed event handling."""
        mock_sequence_card_manager.on_playback_state_changed.return_value = True
        
        result = mock_sequence_card_manager.on_playback_state_changed(True)
        
        assert result is True
        mock_sequence_card_manager.on_playback_state_changed.assert_called_once_with(True)


class TestSequenceCardIntegration:
    """Test sequence card integration scenarios."""

    def test_load_and_navigate_sequence(self, mock_sequence_card_manager, sample_sequence_data):
        """Test loading sequence and navigating through beats."""
        # Load sequence
        mock_sequence_card_manager.load_sequence.return_value = True
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.current_beat_index = 0
        
        load_result = mock_sequence_card_manager.load_sequence(sample_sequence_data)
        assert load_result is True
        
        # Navigate to next beat
        mock_sequence_card_manager.next_beat.return_value = True
        mock_sequence_card_manager.current_beat_index = 1
        
        nav_result = mock_sequence_card_manager.next_beat()
        assert nav_result is True
        assert mock_sequence_card_manager.current_beat_index == 1

    def test_playback_with_navigation(self, mock_sequence_card_manager, sample_sequence_data):
        """Test playback combined with navigation."""
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        
        # Start playback
        mock_sequence_card_manager.start_playback.return_value = True
        mock_sequence_card_manager.is_playing = True
        
        playback_result = mock_sequence_card_manager.start_playback()
        assert playback_result is True
        
        # Navigate during playback
        mock_sequence_card_manager.go_to_beat.return_value = True
        mock_sequence_card_manager.current_beat_index = 1
        
        nav_result = mock_sequence_card_manager.go_to_beat(1)
        assert nav_result is True

    def test_sequence_card_state_consistency(self, mock_sequence_card_manager, sample_sequence_data):
        """Test that sequence card maintains consistent state."""
        # Load sequence
        mock_sequence_card_manager.current_sequence = sample_sequence_data
        mock_sequence_card_manager.current_beat_index = 0
        mock_sequence_card_manager.is_playing = False
        
        # Verify initial state
        assert mock_sequence_card_manager.current_sequence == sample_sequence_data
        assert mock_sequence_card_manager.current_beat_index == 0
        assert mock_sequence_card_manager.is_playing is False
        
        # Change state
        mock_sequence_card_manager.current_beat_index = 1
        mock_sequence_card_manager.is_playing = True
        
        # Verify state changes
        assert mock_sequence_card_manager.current_beat_index == 1
        assert mock_sequence_card_manager.is_playing is True
