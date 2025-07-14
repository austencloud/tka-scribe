"""
Integration Test Suite for Workbench Refactoring

Tests the integration between framework-agnostic business services
and Qt presentation layer to validate separation of concerns.
"""

import pytest
from unittest.mock import Mock, MagicMock, patch
from PyQt6.QtWidgets import QApplication, QWidget
from PyQt6.QtCore import QTimer

from application.services.workbench.workbench_state_manager import (
    WorkbenchStateManager,
    WorkbenchState,
)
from application.services.workbench.workbench_operation_coordinator import (
    WorkbenchOperationCoordinator,
    OperationType,
)
from application.services.workbench.workbench_session_manager import (
    WorkbenchSessionManager,
    SessionRestorationPhase,
)
from core.dependency_injection.di_container import DIContainer
from domain.models.beat_data import BeatData
from domain.models.sequence_data import SequenceData
from presentation.components.workbench.modern_workbench import SequenceWorkbench


class TestWorkbenchRefactoringIntegration:
    """Integration tests for workbench refactoring."""

    @pytest.fixture(autouse=True)
    def setup_qt_app(self, qapp):
        """Setup Qt application for testing."""
        self.app = qapp

    def setup_method(self):
        """Setup test fixtures."""
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

        # Create mock DI container
        self.mock_container = Mock(spec=DIContainer)
        
        # Create business services
        self.state_manager = WorkbenchStateManager()
        self.operation_coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=self.state_manager
        )
        self.session_manager = WorkbenchSessionManager(
            workbench_state_manager=self.state_manager
        )
        
        # Setup DI container to return our services
        def mock_resolve(service_type):
            if service_type == WorkbenchStateManager:
                return self.state_manager
            elif isinstance(service_type, str):
                if service_type == "WorkbenchOperationCoordinator":
                    return self.operation_coordinator
                elif service_type == "WorkbenchSessionManager":
                    return self.session_manager
            return Mock()
            
        def mock_try_resolve(service_name):
            return Mock()
            
        self.mock_container.resolve.side_effect = mock_resolve
        self.mock_container.try_resolve.side_effect = mock_try_resolve

    def test_business_logic_isolation(self):
        """Test that business logic is completely isolated from Qt."""
        # Business services should work without Qt
        
        # Test state manager
        result = self.state_manager.set_sequence(self.test_sequence)
        assert result.changed
        assert self.state_manager.has_sequence()
        
        # Test operation coordinator
        can_execute, _ = self.operation_coordinator.can_execute_operation(
            OperationType.CLEAR_SEQUENCE
        )
        assert can_execute
        
        # Test session manager
        assert self.session_manager.get_current_phase() == SessionRestorationPhase.NOT_STARTED

    def test_service_dependency_injection(self):
        """Test that services are properly injected via DI container."""
        # Create mock layout service and beat selection service
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        # Create workbench with mocked dependencies
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        
        # Initialize workbench
        workbench.initialize()
        
        # Verify DI container was used to resolve services
        self.mock_container.resolve.assert_called()
        
        # Verify workbench is initialized
        assert workbench.is_initialized
        assert workbench.get_widget() is not None

    def test_state_manager_coordination(self):
        """Test coordination between Qt layer and state manager."""
        # Create workbench
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        workbench.initialize()
        
        # Set sequence through Qt layer
        with patch.object(workbench, 'sequence_modified') as mock_signal:
            workbench.set_sequence(self.test_sequence)
            
            # Verify state manager was updated
            assert self.state_manager.has_sequence()
            assert self.state_manager.get_current_sequence() == self.test_sequence
            
            # Verify Qt signal was emitted
            mock_signal.emit.assert_called_once()

    def test_operation_coordinator_integration(self):
        """Test integration between Qt layer and operation coordinator."""
        # Setup state manager with sequence
        self.state_manager.set_sequence(self.test_sequence)
        
        # Create workbench
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        workbench.initialize()
        
        # Test operation execution through Qt layer
        with patch.object(workbench, 'operation_completed') as mock_completed:
            with patch.object(workbench, 'error_occurred') as mock_error:
                # Execute clear operation
                workbench._execute_operation(OperationType.CLEAR_SEQUENCE)
                
                # Should emit operation completed signal
                mock_completed.emit.assert_called_once()
                mock_error.emit.assert_not_called()

    def test_session_manager_coordination(self):
        """Test session restoration coordination."""
        # Create workbench
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        workbench.initialize()
        
        # Test session restoration
        event_data = {
            "state_data": {
                "sequence_data": self.test_sequence,
                "start_position_data": self.test_beat,
            }
        }
        
        result = self.session_manager.handle_restoration_event(event_data)
        
        # Should successfully restore state
        assert result.success
        assert self.state_manager.has_sequence()
        assert self.state_manager.has_start_position()

    def test_auto_save_prevention_during_restoration(self):
        """Test that auto-save is prevented during session restoration."""
        # Create workbench
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        workbench.initialize()
        
        # Begin restoration
        self.state_manager.begin_restoration()
        
        with patch.object(workbench, 'sequence_modified') as mock_signal:
            # Set sequence during restoration
            workbench.set_sequence(self.test_sequence)
            
            # Should NOT emit sequence_modified signal during restoration
            mock_signal.emit.assert_not_called()
            
        # Complete restoration
        self.state_manager.complete_restoration()
        
        with patch.object(workbench, 'sequence_modified') as mock_signal:
            # Set sequence after restoration
            workbench.set_sequence(self.test_sequence)
            
            # Should emit signal after restoration is complete
            mock_signal.emit.assert_called_once()

    def test_error_handling_across_layers(self):
        """Test error propagation from business layer to Qt layer."""
        # Create operation coordinator with failing service
        mock_failing_service = Mock()
        mock_failing_service.add_sequence_to_dictionary.side_effect = Exception("Test error")
        
        failing_coordinator = WorkbenchOperationCoordinator(
            workbench_state_manager=self.state_manager,
            dictionary_service=mock_failing_service,
        )
        
        # Update container to return failing coordinator
        def mock_resolve_with_failure(service_type):
            if isinstance(service_type, str) and service_type == "WorkbenchOperationCoordinator":
                return failing_coordinator
            return self.mock_container.resolve.side_effect(service_type)
            
        self.mock_container.resolve.side_effect = mock_resolve_with_failure
        
        # Setup sequence
        self.state_manager.set_sequence(self.test_sequence)
        
        # Create workbench
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        workbench.initialize()
        
        # Test error propagation
        with patch.object(workbench, 'error_occurred') as mock_error:
            workbench._execute_operation(OperationType.ADD_TO_DICTIONARY)
            
            # Should emit error signal
            mock_error.emit.assert_called_once()

    def test_component_lifecycle_management(self):
        """Test proper lifecycle management of workbench components."""
        # Create workbench
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        
        # Test initialization
        workbench.initialize()
        assert workbench.is_initialized
        assert workbench.get_widget() is not None
        
        # Test cleanup
        with patch.object(self.session_manager, 'cleanup_event_subscriptions') as mock_cleanup:
            workbench.cleanup()
            
            # Should clean up session subscriptions
            mock_cleanup.assert_called_once()

    def test_signal_propagation_chain(self):
        """Test signal propagation from business layer through Qt layer."""
        # Create workbench
        mock_layout_service = Mock()
        mock_beat_selection_service = Mock()
        
        workbench = SequenceWorkbench(
            container=self.mock_container,
            layout_service=mock_layout_service,
            beat_selection_service=mock_beat_selection_service,
            parent=None
        )
        workbench.initialize()
        
        # Mock beat frame section to test signal chain
        mock_beat_frame = Mock()
        workbench._beat_frame_section = mock_beat_frame
        
        # Test signal connection
        with patch.object(workbench, 'sequence_modified') as mock_signal:
            # Simulate beat modification from UI
            workbench._on_beat_modified(0, self.test_beat)
            
            # Should update state and emit signal
            mock_signal.emit.assert_called_once()

    def test_derived_state_calculations(self):
        """Test that Qt layer uses business layer for derived state."""
        # Setup different states
        test_cases = [
            (None, False),  # No sequence
            (self.test_sequence, True),  # With sequence
        ]
        
        for sequence, expected_enabled in test_cases:
            # Reset state
            self.state_manager.clear_all_state()
            
            if sequence:
                self.state_manager.set_sequence(sequence)
            
            # Test derived state calculations
            assert self.state_manager.should_enable_sequence_operations() == expected_enabled
            assert self.state_manager.should_enable_export_operations() == expected_enabled
            assert self.state_manager.should_enable_transform_operations() == expected_enabled

    def test_memory_management_separation(self):
        """Test that business services don't hold Qt references."""
        # Create Qt widget
        widget = QWidget()
        
        # Set sequence with widget reference (this should NOT create circular refs)
        self.state_manager.set_sequence(self.test_sequence)
        
        # Delete widget
        widget.deleteLater()
        
        # Business services should still function
        assert self.state_manager.has_sequence()
        assert self.state_manager.get_current_sequence() == self.test_sequence
        
        # Operation coordinator should still work
        can_execute, _ = self.operation_coordinator.can_execute_operation(
            OperationType.CLEAR_SEQUENCE
        )
        assert can_execute
