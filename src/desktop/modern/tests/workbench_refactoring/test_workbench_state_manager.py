"""
Test Suite for Workbench State Manager

Tests the framework-agnostic workbench state management business logic
to ensure proper separation of concerns from Qt presentation layer.
"""

import pytest
from unittest.mock import Mock, MagicMock

from application.services.workbench.workbench_state_manager import (
    WorkbenchStateManager,
    WorkbenchState,
    StateChangeResult,
)
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData


class TestWorkbenchStateManager:
    """Test suite for WorkbenchStateManager business logic."""

    def setup_method(self):
        """Setup test fixtures."""
        self.mock_sequence_tracker = Mock()
        self.state_manager = WorkbenchStateManager(
            sequence_state_tracker=self.mock_sequence_tracker
        )
        
        # Create test data
        self.test_beat = BeatData(
            duration=4,
            beat=1,
            start_pos=1,
            end_pos=2,
            position_details={},
            letter="A",
            movement_type="Static"
        )
        
        self.test_sequence = SequenceData(
            beats=[self.test_beat],
            name="Test Sequence",
            level=1,
            start_position=None
        )

    def test_initial_state(self):
        """Test initial state is empty."""
        assert self.state_manager.get_workbench_state() == WorkbenchState.EMPTY
        assert self.state_manager.get_current_sequence() is None
        assert self.state_manager.get_start_position() is None
        assert self.state_manager.is_empty()
        assert not self.state_manager.has_sequence()
        assert not self.state_manager.has_start_position()
        assert not self.state_manager.is_restoring()

    def test_set_sequence_normal_flow(self):
        """Test setting sequence in normal flow."""
        result = self.state_manager.set_sequence(self.test_sequence)
        
        assert result.changed
        assert result.new_state == WorkbenchState.SEQUENCE_LOADED
        assert result.sequence_changed
        assert not result.start_position_changed
        
        assert self.state_manager.get_current_sequence() == self.test_sequence
        assert self.state_manager.has_sequence()
        assert not self.state_manager.is_empty()
        
        # Should coordinate with sequence tracker
        self.mock_sequence_tracker.set_sequence_direct.assert_called_once_with(self.test_sequence)

    def test_set_sequence_restoration_flow(self):
        """Test setting sequence during restoration."""
        result = self.state_manager.set_sequence(self.test_sequence, from_restoration=True)
        
        assert result.changed
        assert result.new_state == WorkbenchState.RESTORING
        assert self.state_manager.is_restoring()
        
        # Should NOT coordinate with sequence tracker during restoration
        self.mock_sequence_tracker.set_sequence_direct.assert_not_called()

    def test_set_start_position_normal_flow(self):
        """Test setting start position in normal flow."""
        result = self.state_manager.set_start_position(self.test_beat)
        
        assert result.changed
        assert result.new_state == WorkbenchState.START_POSITION_SET
        assert not result.sequence_changed
        assert result.start_position_changed
        
        assert self.state_manager.get_start_position() == self.test_beat
        assert self.state_manager.has_start_position()
        
        # Should coordinate with sequence tracker
        self.mock_sequence_tracker.set_start_position_direct.assert_called_once_with(self.test_beat)

    def test_set_start_position_restoration_flow(self):
        """Test setting start position during restoration."""
        result = self.state_manager.set_start_position(self.test_beat, from_restoration=True)
        
        assert result.changed
        assert result.new_state == WorkbenchState.RESTORING
        assert self.state_manager.is_restoring()
        
        # Should NOT coordinate with sequence tracker during restoration
        self.mock_sequence_tracker.set_start_position_direct.assert_not_called()

    def test_both_sequence_and_start_position(self):
        """Test state when both sequence and start position are set."""
        # Set sequence first
        self.state_manager.set_sequence(self.test_sequence)
        
        # Then set start position
        result = self.state_manager.set_start_position(self.test_beat)
        
        assert result.new_state == WorkbenchState.BOTH_SET
        assert self.state_manager.has_sequence()
        assert self.state_manager.has_start_position()
        assert not self.state_manager.is_empty()

    def test_clear_all_state(self):
        """Test clearing all state."""
        # Setup initial state
        self.state_manager.set_sequence(self.test_sequence)
        self.state_manager.set_start_position(self.test_beat)
        
        # Clear all
        result = self.state_manager.clear_all_state()
        
        assert result.changed
        assert result.new_state == WorkbenchState.EMPTY
        assert result.sequence_changed
        assert result.start_position_changed
        
        assert self.state_manager.is_empty()
        assert not self.state_manager.has_sequence()
        assert not self.state_manager.has_start_position()
        assert not self.state_manager.is_restoring()

    def test_operation_enablement_logic(self):
        """Test derived state calculations for operation enablement."""
        # Empty state - no operations enabled except clear
        assert not self.state_manager.should_enable_sequence_operations()
        assert not self.state_manager.should_enable_export_operations()
        assert not self.state_manager.should_enable_transform_operations()
        assert not self.state_manager.should_enable_clear_operation()
        assert not self.state_manager.should_prevent_auto_save()
        
        # With sequence - operations enabled
        self.state_manager.set_sequence(self.test_sequence)
        assert self.state_manager.should_enable_sequence_operations()
        assert self.state_manager.should_enable_export_operations()
        assert self.state_manager.should_enable_transform_operations()
        assert self.state_manager.should_enable_clear_operation()
        
        # During restoration - auto-save prevented
        self.state_manager.begin_restoration()
        assert self.state_manager.should_prevent_auto_save()

    def test_restoration_lifecycle(self):
        """Test restoration state lifecycle."""
        # Begin restoration
        self.state_manager.begin_restoration()
        assert self.state_manager.is_restoring()
        assert not self.state_manager.is_restoration_complete()
        
        # Complete restoration
        self.state_manager.complete_restoration()
        assert not self.state_manager.is_restoring()
        assert self.state_manager.is_restoration_complete()
        
        # Reset restoration
        self.state_manager.reset_restoration_state()
        assert not self.state_manager.is_restoring()
        assert not self.state_manager.is_restoration_complete()

    def test_complete_sequence_with_start_position(self):
        """Test getting complete sequence with start position included."""
        # Without start position
        self.state_manager.set_sequence(self.test_sequence)
        complete = self.state_manager.get_complete_sequence_with_start_position()
        assert complete == self.test_sequence
        
        # With start position
        self.state_manager.set_start_position(self.test_beat)
        complete = self.state_manager.get_complete_sequence_with_start_position()
        assert complete.start_position == self.test_beat

    def test_state_validation(self):
        """Test state validation logic."""
        # Valid empty state
        is_valid, issues = self.state_manager.validate_state_consistency()
        assert is_valid
        assert len(issues) == 0
        
        # Valid state with sequence
        self.state_manager.set_sequence(self.test_sequence)
        is_valid, issues = self.state_manager.validate_state_consistency()
        assert is_valid
        assert len(issues) == 0

    def test_state_summary(self):
        """Test state summary for debugging."""
        summary = self.state_manager.get_state_summary()
        
        # Check required fields
        assert "workbench_state" in summary
        assert "has_sequence" in summary
        assert "has_start_position" in summary
        assert "is_restoring" in summary
        assert "operations_enabled" in summary
        assert "state_valid" in summary
        
        # Check operations enabled structure
        ops = summary["operations_enabled"]
        assert "sequence_ops" in ops
        assert "export_ops" in ops
        assert "transform_ops" in ops
        assert "clear_op" in ops

    def test_no_change_scenarios(self):
        """Test scenarios that should result in no state change."""
        # Setting same sequence twice
        self.state_manager.set_sequence(self.test_sequence)
        result = self.state_manager.set_sequence(self.test_sequence)
        assert not result.changed
        
        # Setting same start position twice
        self.state_manager.set_start_position(self.test_beat)
        result = self.state_manager.set_start_position(self.test_beat)
        assert not result.changed

    def test_without_sequence_tracker(self):
        """Test state manager without sequence tracker dependency."""
        state_manager = WorkbenchStateManager(sequence_state_tracker=None)
        
        # Should still work without sequence tracker
        result = state_manager.set_sequence(self.test_sequence)
        assert result.changed
        assert state_manager.has_sequence()
