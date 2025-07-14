"""
Test Suite for Workbench Session Manager

Tests the framework-agnostic session restoration business logic
to ensure proper separation of concerns from Qt presentation layer.
"""

import pytest
from unittest.mock import Mock, MagicMock

from application.services.workbench.workbench_session_manager import (
    WorkbenchSessionManager,
    SessionRestorationPhase,
    SessionRestorationResult,
)
from application.services.workbench.workbench_state_manager import WorkbenchStateManager
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData


class TestWorkbenchSessionManager:
    """Test suite for WorkbenchSessionManager business logic."""

    def setup_method(self):
        """Setup test fixtures."""
        # Create mock services
        self.mock_state_manager = Mock(spec=WorkbenchStateManager)
        self.mock_session_coordinator = Mock()
        self.mock_event_bus = Mock()
        
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
        
        # Create session manager
        self.session_manager = WorkbenchSessionManager(
            workbench_state_manager=self.mock_state_manager,
            session_restoration_coordinator=self.mock_session_coordinator,
            event_bus=self.mock_event_bus,
        )

    def test_initial_state(self):
        """Test initial session manager state."""
        assert self.session_manager.get_current_phase() == SessionRestorationPhase.NOT_STARTED
        assert not self.session_manager.is_restoration_completed()
        assert not self.session_manager.is_restoration_in_progress()
        assert not self.session_manager.has_pending_restoration_data()
        assert len(self.session_manager.get_restoration_errors()) == 0

    def test_begin_restoration_from_event_success(self):
        """Test successfully beginning restoration from event."""
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
                "start_position_data": self.test_beat,
            }
        }
        
        result = self.session_manager.begin_restoration_from_event(event_data)
        
        assert result.success
        assert result.phase == SessionRestorationPhase.PREPARING
        assert self.session_manager.get_current_phase() == SessionRestorationPhase.PREPARING
        assert self.session_manager.has_pending_restoration_data()
        
        # Should activate restoration mode in state manager
        self.mock_state_manager.begin_restoration.assert_called_once()

    def test_begin_restoration_with_sequence_start_position(self):
        """Test restoration when start position is in sequence data."""
        sequence_with_start = SequenceData(
            beats=[self.test_beat],
            name="Test Sequence",
            level=1,
            start_position=self.test_beat
        )
        
        event_data = {
            "state_data": {
                "sequence_data": sequence_with_start,
                "start_position_data": None,  # No separate start position
            }
        }
        
        result = self.session_manager.begin_restoration_from_event(event_data)
        
        assert result.success
        assert self.session_manager.has_pending_restoration_data()

    def test_begin_restoration_exception(self):
        """Test restoration beginning with exception."""
        event_data = None  # Invalid data to trigger exception
        
        result = self.session_manager.begin_restoration_from_event(event_data)
        
        assert not result.success
        assert result.phase == SessionRestorationPhase.FAILED
        assert len(result.errors) > 0

    def test_execute_restoration_success(self):
        """Test successful restoration execution."""
        # Setup pending data
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
                "start_position_data": self.test_beat,
            }
        }
        self.session_manager.begin_restoration_from_event(event_data)
        
        # Mock state manager methods
        from application.services.workbench.workbench_state_manager import StateChangeResult, WorkbenchState
        sequence_result = StateChangeResult(True, WorkbenchState.EMPTY, WorkbenchState.SEQUENCE_LOADED, True, False)
        start_pos_result = StateChangeResult(True, WorkbenchState.SEQUENCE_LOADED, WorkbenchState.BOTH_SET, False, True)
        
        self.mock_state_manager.set_sequence.return_value = sequence_result
        self.mock_state_manager.set_start_position.return_value = start_pos_result
        
        # Execute restoration
        result = self.session_manager.execute_restoration()
        
        assert result.success
        assert result.phase == SessionRestorationPhase.COMPLETED
        assert result.sequence_restored
        assert result.start_position_restored
        
        # Should call state manager methods with restoration flag
        self.mock_state_manager.set_sequence.assert_called_once_with(
            self.test_sequence, from_restoration=True
        )
        self.mock_state_manager.set_start_position.assert_called_once_with(
            self.test_beat, from_restoration=True
        )
        
        # Should complete restoration
        self.mock_state_manager.complete_restoration.assert_called_once()
        
        assert self.session_manager.is_restoration_completed()
        assert not self.session_manager.has_pending_restoration_data()

    def test_execute_restoration_no_pending_data(self):
        """Test restoration execution without pending data."""
        result = self.session_manager.execute_restoration()
        
        assert not result.success
        assert result.phase == SessionRestorationPhase.FAILED
        assert "No pending session data" in result.errors[0]

    def test_execute_restoration_exception(self):
        """Test restoration execution with exception."""
        # Setup pending data
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
                "start_position_data": None,
            }
        }
        self.session_manager.begin_restoration_from_event(event_data)
        
        # Mock state manager to raise exception
        self.mock_state_manager.set_sequence.side_effect = Exception("Test error")
        
        result = self.session_manager.execute_restoration()
        
        assert not result.success
        assert result.phase == SessionRestorationPhase.FAILED
        assert len(result.errors) > 0
        
        # Should reset restoration state on failure
        self.mock_state_manager.reset_restoration_state.assert_called_once()

    def test_handle_restoration_event_complete_flow(self):
        """Test complete restoration flow from event."""
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
                "start_position_data": self.test_beat,
            }
        }
        
        # Mock successful state changes
        from application.services.workbench.workbench_state_manager import StateChangeResult, WorkbenchState
        sequence_result = StateChangeResult(True, WorkbenchState.EMPTY, WorkbenchState.SEQUENCE_LOADED, True, False)
        start_pos_result = StateChangeResult(True, WorkbenchState.SEQUENCE_LOADED, WorkbenchState.BOTH_SET, False, True)
        
        self.mock_state_manager.set_sequence.return_value = sequence_result
        self.mock_state_manager.set_start_position.return_value = start_pos_result
        
        result = self.session_manager.handle_restoration_event(event_data)
        
        assert result.success
        assert result.phase == SessionRestorationPhase.COMPLETED
        assert result.sequence_restored
        assert result.start_position_restored

    def test_handle_missing_start_position_restoration(self):
        """Test handling missing start position restoration."""
        self.session_manager.handle_missing_start_position_restoration()
        
        # Should set start position to None with restoration flag
        self.mock_state_manager.set_start_position.assert_called_once_with(
            None, from_restoration=True
        )

    def test_setup_event_subscriptions(self):
        """Test event subscription setup."""
        subscription_ids = self.session_manager.setup_event_subscriptions()
        
        # Should subscribe to restoration events
        self.mock_event_bus.subscribe.assert_called()
        assert len(subscription_ids) > 0

    def test_setup_event_subscriptions_no_event_bus(self):
        """Test event subscription setup without event bus."""
        session_manager = WorkbenchSessionManager(
            workbench_state_manager=self.mock_state_manager,
            session_restoration_coordinator=self.mock_session_coordinator,
            event_bus=None,  # No event bus
        )
        
        subscription_ids = session_manager.setup_event_subscriptions()
        assert len(subscription_ids) == 0

    def test_cleanup_event_subscriptions(self):
        """Test event subscription cleanup."""
        subscription_ids = ["sub1", "sub2"]
        
        self.session_manager.cleanup_event_subscriptions(subscription_ids)
        
        # Should unsubscribe from all subscriptions
        assert self.mock_event_bus.unsubscribe.call_count == 2

    def test_reset_restoration_state(self):
        """Test restoration state reset."""
        # Setup some state
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
            }
        }
        self.session_manager.begin_restoration_from_event(event_data)
        
        # Reset state
        self.session_manager.reset_restoration_state()
        
        assert self.session_manager.get_current_phase() == SessionRestorationPhase.NOT_STARTED
        assert not self.session_manager.is_restoration_completed()
        assert not self.session_manager.has_pending_restoration_data()
        assert len(self.session_manager.get_restoration_errors()) == 0
        
        # Should reset state manager restoration state
        self.mock_state_manager.reset_restoration_state.assert_called_once()

    def test_restoration_status_summary(self):
        """Test restoration status summary for debugging."""
        summary = self.session_manager.get_restoration_status_summary()
        
        # Check required fields
        assert "current_phase" in summary
        assert "restoration_completed" in summary
        assert "is_in_progress" in summary
        assert "has_pending_data" in summary
        assert "error_count" in summary
        assert "errors" in summary
        assert "state_manager_available" in summary
        assert "session_coordinator_available" in summary
        assert "event_bus_available" in summary

    def test_restoration_phases(self):
        """Test restoration phase transitions."""
        assert not self.session_manager.is_restoration_in_progress()
        
        # Begin restoration
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
            }
        }
        self.session_manager.begin_restoration_from_event(event_data)
        
        assert self.session_manager.is_restoration_in_progress()
        assert self.session_manager.get_current_phase() == SessionRestorationPhase.PREPARING

    def test_beat_data_conversion(self):
        """Test BeatData conversion from dict during restoration."""
        # Test with dict start position data
        beat_dict = {
            "duration": 4,
            "beat": 1,
            "start_pos": 1,
            "end_pos": 2,
            "position_details": {},
            "letter": "A",
            "movement_type": "Static"
        }
        
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
                "start_position_data": beat_dict,  # Dict instead of BeatData
            }
        }
        
        # Mock BeatData.from_dict
        with pytest.mock.patch.object(BeatData, 'from_dict', return_value=self.test_beat) as mock_from_dict:
            self.session_manager.begin_restoration_from_event(event_data)
            
            # Mock state manager methods
            from application.services.workbench.workbench_state_manager import StateChangeResult, WorkbenchState
            start_pos_result = StateChangeResult(True, WorkbenchState.EMPTY, WorkbenchState.START_POSITION_SET, False, True)
            self.mock_state_manager.set_start_position.return_value = start_pos_result
            
            result = self.session_manager.execute_restoration()
            
            # Should convert dict to BeatData
            mock_from_dict.assert_called_once_with(beat_dict)

    def test_session_restoration_result_creation(self):
        """Test session restoration result creation methods."""
        # Success result
        success_result = SessionRestorationResult.success_result(
            SessionRestorationPhase.COMPLETED,
            sequence_restored=True,
            start_position_restored=True
        )
        assert success_result.success
        assert success_result.phase == SessionRestorationPhase.COMPLETED
        assert success_result.sequence_restored
        assert success_result.start_position_restored
        assert len(success_result.errors) == 0
        
        # Failure result
        failure_result = SessionRestorationResult.failure_result(
            SessionRestorationPhase.FAILED,
            ["Error 1", "Error 2"]
        )
        assert not failure_result.success
        assert failure_result.phase == SessionRestorationPhase.FAILED
        assert not failure_result.sequence_restored
        assert not failure_result.start_position_restored
        assert len(failure_result.errors) == 2

    def test_session_manager_without_dependencies(self):
        """Test session manager without optional dependencies."""
        session_manager = WorkbenchSessionManager(
            workbench_state_manager=None,
            session_restoration_coordinator=None,
            event_bus=None,
        )
        
        # Should still work but with limited functionality
        summary = session_manager.get_restoration_status_summary()
        assert not summary["state_manager_available"]
        assert not summary["session_coordinator_available"]
        assert not summary["event_bus_available"]
