"""
Test Suite for Workbench Operation Coordinator

Tests the framework-agnostic operation coordination business logic
to ensure proper separation of concerns from Qt presentation layer.
"""

import pytest
from unittest.mock import Mock, MagicMock

from application.services.workbench.workbench_operation_coordinator import (
    WorkbenchOperationCoordinator,
    OperationType,
    OperationResult,
)
from application.services.workbench.workbench_state_manager import WorkbenchStateManager
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData


class TestWorkbenchOperationCoordinator:
    """Test suite for WorkbenchOperationCoordinator business logic."""

    def setup_method(self):
        """Setup test fixtures."""
        # Create mock services
        self.mock_state_manager = Mock(spec=WorkbenchStateManager)
        self.mock_beat_operations = Mock()
        self.mock_dictionary_service = Mock()
        self.mock_fullscreen_service = Mock()
        self.mock_sequence_transformer = Mock()
        self.mock_sequence_persister = Mock()
        
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
        
        # Setup state manager defaults
        self.mock_state_manager.has_sequence.return_value = True
        self.mock_state_manager.get_current_sequence.return_value = self.test_sequence
        
        # Create coordinator
        self.coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=self.mock_state_manager,
            beat_operations=self.mock_beat_operations,
            dictionary_service=self.mock_dictionary_service,
            fullscreen_service=self.mock_fullscreen_service,
            sequence_transformer=self.mock_sequence_transformer,
            sequence_persister=self.mock_sequence_persister,
        )

    def test_add_to_dictionary_success(self):
        """Test successful add to dictionary operation."""
        self.mock_dictionary_service.add_sequence_to_dictionary.return_value = True
        
        result = self.coordinator.add_to_dictionary()
        
        assert result.success
        assert result.operation_type == OperationType.ADD_TO_DICTIONARY
        assert "Added to dictionary!" in result.message
        assert result.updated_sequence is None
        assert result.error_details is None
        
        self.mock_dictionary_service.add_sequence_to_dictionary.assert_called_once_with(
            self.test_sequence, ""
        )

    def test_add_to_dictionary_already_exists(self):
        """Test add to dictionary when already exists."""
        self.mock_dictionary_service.add_sequence_to_dictionary.return_value = False
        
        result = self.coordinator.add_to_dictionary()
        
        assert not result.success
        assert "already in dictionary" in result.message

    def test_add_to_dictionary_no_sequence(self):
        """Test add to dictionary with no sequence."""
        self.mock_state_manager.has_sequence.return_value = False
        
        result = self.coordinator.add_to_dictionary()
        
        assert not result.success
        assert "No sequence to add" in result.message
        self.mock_dictionary_service.add_sequence_to_dictionary.assert_not_called()

    def test_add_to_dictionary_service_unavailable(self):
        """Test add to dictionary with service unavailable."""
        coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=self.mock_state_manager,
            dictionary_service=None  # Service unavailable
        )
        
        result = coordinator.add_to_dictionary()
        
        assert not result.success
        assert "service not available" in result.message

    def test_add_to_dictionary_exception(self):
        """Test add to dictionary with exception."""
        self.mock_dictionary_service.add_sequence_to_dictionary.side_effect = Exception("Test error")
        
        result = self.coordinator.add_to_dictionary()
        
        assert not result.success
        assert "Failed to add to dictionary" in result.message
        assert result.error_details == "Test error"

    def test_save_image_success(self):
        """Test successful save image operation."""
        result = self.coordinator.save_image()
        
        assert result.success
        assert result.operation_type == OperationType.SAVE_IMAGE
        assert "Image saved!" in result.message

    def test_save_image_no_sequence(self):
        """Test save image with no sequence."""
        self.mock_state_manager.has_sequence.return_value = False
        
        result = self.coordinator.save_image()
        
        assert not result.success
        assert "No sequence to export" in result.message

    def test_view_fullscreen_success(self):
        """Test successful fullscreen view operation."""
        result = self.coordinator.view_fullscreen()
        
        assert result.success
        assert result.operation_type == OperationType.VIEW_FULLSCREEN
        assert "Opening full screen view" in result.message
        
        self.mock_fullscreen_service.show_full_screen_view.assert_called_once_with(
            self.test_sequence
        )

    def test_view_fullscreen_service_unavailable(self):
        """Test fullscreen view with service unavailable."""
        coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=self.mock_state_manager,
            fullscreen_service=None  # Service unavailable
        )
        
        result = coordinator.view_fullscreen()
        
        assert not result.success
        assert "service not available" in result.message

    def test_mirror_sequence_success(self):
        """Test successful mirror sequence operation."""
        mirrored_sequence = SequenceData(
            beats=[self.test_beat],
            name="Mirrored Sequence",
            level=1
        )
        self.mock_sequence_transformer.reflect_sequence.return_value = mirrored_sequence
        
        result = self.coordinator.mirror_sequence()
        
        assert result.success
        assert result.operation_type == OperationType.MIRROR_SEQUENCE
        assert "Sequence mirrored!" in result.message
        assert result.updated_sequence == mirrored_sequence
        
        self.mock_sequence_transformer.reflect_sequence.assert_called_once_with(
            self.test_sequence
        )

    def test_swap_colors_success(self):
        """Test successful swap colors operation."""
        swapped_sequence = SequenceData(
            beats=[self.test_beat],
            name="Swapped Sequence",
            level=1
        )
        self.mock_sequence_transformer.swap_colors.return_value = swapped_sequence
        
        result = self.coordinator.swap_colors()
        
        assert result.success
        assert result.operation_type == OperationType.SWAP_COLORS
        assert "Colors swapped!" in result.message
        assert result.updated_sequence == swapped_sequence

    def test_rotate_sequence_success(self):
        """Test successful rotate sequence operation."""
        rotated_sequence = SequenceData(
            beats=[self.test_beat],
            name="Rotated Sequence",
            level=1
        )
        self.mock_sequence_transformer.rotate_sequence.return_value = rotated_sequence
        
        result = self.coordinator.rotate_sequence()
        
        assert result.success
        assert result.operation_type == OperationType.ROTATE_SEQUENCE
        assert "Sequence rotated!" in result.message
        assert result.updated_sequence == rotated_sequence

    def test_delete_beat_success(self):
        """Test successful delete beat operation."""
        updated_sequence = SequenceData(beats=[], name="Empty Sequence", level=1)
        self.mock_beat_operations.delete_beat.return_value = updated_sequence
        
        result = self.coordinator.delete_beat(beat_index=0)
        
        assert result.success
        assert result.operation_type == OperationType.DELETE_BEAT
        assert "Beat deleted!" in result.message
        assert result.updated_sequence == updated_sequence
        
        self.mock_beat_operations.delete_beat.assert_called_once_with(
            self.test_sequence, 0
        )

    def test_delete_beat_no_index(self):
        """Test delete beat with no index selected."""
        result = self.coordinator.delete_beat(beat_index=None)
        
        assert not result.success
        assert "No beat selected" in result.message
        self.mock_beat_operations.delete_beat.assert_not_called()

    def test_clear_sequence_success(self):
        """Test successful clear sequence operation."""
        result = self.coordinator.clear_sequence()
        
        assert result.success
        assert result.operation_type == OperationType.CLEAR_SEQUENCE
        assert "Sequence cleared!" in result.message
        
        self.mock_sequence_persister.clear_current_sequence.assert_called_once()
        self.mock_state_manager.clear_all_state.assert_called_once()

    def test_copy_json_success(self):
        """Test successful copy JSON operation."""
        result = self.coordinator.copy_json()
        
        assert result.success
        assert result.operation_type == OperationType.COPY_JSON
        assert "JSON copied to clipboard!" in result.message

    def test_can_execute_operation_validation(self):
        """Test operation execution validation."""
        # Test with sequence available
        can_execute, reason = self.coordinator.can_execute_operation(
            OperationType.ADD_TO_DICTIONARY
        )
        assert can_execute
        assert reason == ""
        
        # Test without sequence
        self.mock_state_manager.has_sequence.return_value = False
        can_execute, reason = self.coordinator.can_execute_operation(
            OperationType.ADD_TO_DICTIONARY
        )
        assert not can_execute
        assert "No sequence loaded" in reason
        
        # Test clear operation (always available)
        can_execute, reason = self.coordinator.can_execute_operation(
            OperationType.CLEAR_SEQUENCE
        )
        assert can_execute
        assert reason == ""

    def test_can_execute_operation_missing_services(self):
        """Test operation validation with missing services."""
        # Create coordinator with missing services
        coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=self.mock_state_manager,
            dictionary_service=None,  # Missing service
        )
        
        can_execute, reason = coordinator.can_execute_operation(
            OperationType.ADD_TO_DICTIONARY
        )
        assert not can_execute
        assert "Required service" in reason

    def test_operation_status_summary(self):
        """Test operation status summary for debugging."""
        summary = self.coordinator.get_operation_status_summary()
        
        # Check structure
        assert "state_manager_available" in summary
        assert "has_sequence" in summary
        assert "operations" in summary
        
        # Check operations
        operations = summary["operations"]
        assert OperationType.ADD_TO_DICTIONARY.value in operations
        assert OperationType.CLEAR_SEQUENCE.value in operations
        
        # Check operation structure
        add_dict_op = operations[OperationType.ADD_TO_DICTIONARY.value]
        assert "can_execute" in add_dict_op
        assert "reason" in add_dict_op

    def test_transform_operations_without_transformer(self):
        """Test transform operations without transformer service."""
        coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=self.mock_state_manager,
            sequence_transformer=None  # No transformer
        )
        
        result = coordinator.mirror_sequence()
        assert not result.success
        assert "transformer not available" in result.message

    def test_operation_result_creation(self):
        """Test operation result creation methods."""
        # Success result
        success_result = OperationResult.success_result(
            OperationType.ADD_TO_DICTIONARY,
            "Success message",
            self.test_sequence
        )
        assert success_result.success
        assert success_result.operation_type == OperationType.ADD_TO_DICTIONARY
        assert success_result.message == "Success message"
        assert success_result.updated_sequence == self.test_sequence
        assert success_result.error_details is None
        
        # Failure result
        failure_result = OperationResult.failure_result(
            OperationType.ADD_TO_DICTIONARY,
            "Failure message",
            "Error details"
        )
        assert not failure_result.success
        assert failure_result.operation_type == OperationType.ADD_TO_DICTIONARY
        assert failure_result.message == "Failure message"
        assert failure_result.updated_sequence is None
        assert failure_result.error_details == "Error details"

    def test_coordinator_without_state_manager(self):
        """Test coordinator without state manager."""
        coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=None  # No state manager
        )
        
        can_execute, reason = coordinator.can_execute_operation(
            OperationType.ADD_TO_DICTIONARY
        )
        assert not can_execute
        assert "State manager not available" in reason
