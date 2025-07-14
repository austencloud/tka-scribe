"""
Comprehensive test suite for EnhancedWorkbenchOperationCoordinator

Tests all coordinator functionality including operation execution,
service integration, error handling, and enhanced features.
"""

import pytest
from unittest.mock import Mock, patch
from enum import Enum

# Test imports - adjust paths as needed for your test environment
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent.parent.parent))

from application.services.workbench.enhanced_workbench_operation_coordinator import (
    EnhancedWorkbenchOperationCoordinator,
    OperationType,
    OperationResult
)


class TestEnhancedWorkbenchOperationCoordinator:
    """Test suite for EnhancedWorkbenchOperationCoordinator."""
    
    @pytest.fixture
    def mock_state_manager(self):
        """Create mock state manager."""
        manager = Mock()
        manager.has_sequence.return_value = True
        
        # Create mock sequence
        mock_sequence = Mock()
        mock_sequence.length = 3
        mock_sequence.beats = [Mock(), Mock(), Mock()]
        manager.get_current_sequence.return_value = mock_sequence
        
        return manager
    
    @pytest.fixture
    def mock_export_service(self):
        """Create mock export service."""
        service = Mock()
        service.export_sequence_image.return_value = (True, "/path/to/image.png")
        service.export_sequence_json.return_value = (True, '{"test": "json"}')
        service.validate_export_directory.return_value = True
        service.get_export_directory.return_value = "/test/export/dir"
        service.get_export_stats.return_value = {"file_count": 5, "exists": True}
        return service
    
    @pytest.fixture
    def mock_clipboard_service(self):
        """Create mock clipboard service."""
        service = Mock()
        service.copy_text_to_clipboard.return_value = (True, "Text copied")
        service.is_clipboard_available.return_value = True
        service.get_clipboard_stats.return_value = {"available": True}
        return service
    
    @pytest.fixture
    def mock_dictionary_service(self):
        """Create mock dictionary service."""
        service = Mock()
        service.add_sequence_to_dictionary.return_value = True
        return service
    
    @pytest.fixture
    def mock_fullscreen_service(self):
        """Create mock fullscreen service."""
        service = Mock()
        return service
    
    @pytest.fixture
    def mock_sequence_transformer(self):
        """Create mock sequence transformer."""
        transformer = Mock()
        
        # Create mock transformed sequences
        mock_transformed = Mock()
        mock_transformed.length = 3
        mock_transformed.beats = [Mock(), Mock(), Mock()]
        
        transformer.reflect_sequence.return_value = mock_transformed
        transformer.swap_colors.return_value = mock_transformed
        transformer.rotate_sequence.return_value = mock_transformed
        
        return transformer
    
    @pytest.fixture
    def mock_beat_operations(self):
        """Create mock beat operations service."""
        operations = Mock()
        
        # Create mock sequence after deletion
        mock_after_delete = Mock()
        mock_after_delete.length = 2
        mock_after_delete.beats = [Mock(), Mock()]
        
        operations.delete_beat.return_value = mock_after_delete
        
        return operations
    
    @pytest.fixture
    def mock_sequence_persister(self):
        """Create mock sequence persister."""
        persister = Mock()
        return persister
    
    @pytest.fixture
    def coordinator(self, mock_state_manager, mock_export_service, mock_clipboard_service,
                   mock_dictionary_service, mock_fullscreen_service, mock_sequence_transformer,
                   mock_beat_operations, mock_sequence_persister):
        """Create coordinator with all mocked services."""
        return EnhancedWorkbenchOperationCoordinator(
            workbench_state_manager=mock_state_manager,
            beat_operations=mock_beat_operations,
            dictionary_service=mock_dictionary_service,
            fullscreen_service=mock_fullscreen_service,
            sequence_transformer=mock_sequence_transformer,
            sequence_persister=mock_sequence_persister,
            export_service=mock_export_service,
            clipboard_service=mock_clipboard_service
        )
    
    @pytest.fixture
    def minimal_coordinator(self):
        """Create coordinator with minimal services for error testing."""
        return EnhancedWorkbenchOperationCoordinator()

    # Initialization Tests
    def test_coordinator_initialization_full_services(self, coordinator):
        """Test coordinator initializes with all services."""
        assert coordinator._state_manager is not None
        assert coordinator._export_service is not None
        assert coordinator._clipboard_service is not None
        assert coordinator._dictionary_service is not None
        assert coordinator._fullscreen_service is not None
        assert coordinator._sequence_transformer is not None
        assert coordinator._beat_operations is not None
        assert coordinator._sequence_persister is not None
    
    def test_coordinator_initialization_minimal(self, minimal_coordinator):
        """Test coordinator initializes with minimal services."""
        assert minimal_coordinator._state_manager is None
        assert minimal_coordinator._export_service is None
        assert minimal_coordinator._clipboard_service is None

    # Dictionary Operations Tests
    def test_add_to_dictionary_success(self, coordinator, mock_dictionary_service):
        """Test successful add to dictionary operation."""
        result = coordinator.add_to_dictionary()
        
        assert result.success is True
        assert result.operation_type == OperationType.ADD_TO_DICTIONARY
        assert "Added to dictionary!" in result.message
        mock_dictionary_service.add_sequence_to_dictionary.assert_called_once()
    
    def test_add_to_dictionary_already_exists(self, coordinator, mock_dictionary_service):
        """Test add to dictionary when sequence already exists."""
        mock_dictionary_service.add_sequence_to_dictionary.return_value = False
        
        result = coordinator.add_to_dictionary()
        
        assert result.success is False
        assert "already in dictionary" in result.message
    
    def test_add_to_dictionary_no_sequence(self, coordinator, mock_state_manager):
        """Test add to dictionary without sequence."""
        mock_state_manager.has_sequence.return_value = False
        
        result = coordinator.add_to_dictionary()
        
        assert result.success is False
        assert "No sequence to add" in result.message
    
    def test_add_to_dictionary_no_service(self, minimal_coordinator):
        """Test add to dictionary without dictionary service."""
        result = minimal_coordinator.add_to_dictionary()
        
        assert result.success is False
        assert "Dictionary service not available" in result.message

    # Export Operations Tests
    def test_save_image_success(self, coordinator, mock_export_service):
        """Test successful image export."""
        result = coordinator.save_image()
        
        assert result.success is True
        assert result.operation_type == OperationType.SAVE_IMAGE
        assert "Image saved successfully!" in result.message
        assert result.additional_data["file_path"] == "/path/to/image.png"
        assert result.additional_data["export_type"] == "image"
        mock_export_service.export_sequence_image.assert_called_once()
    
    def test_save_image_export_failure(self, coordinator, mock_export_service):
        """Test image export failure."""
        mock_export_service.export_sequence_image.return_value = (False, "Export failed")
        
        result = coordinator.save_image()
        
        assert result.success is False
        assert "Image export failed" in result.message
    
    def test_save_image_no_sequence(self, coordinator, mock_state_manager):
        """Test image export without sequence."""
        mock_state_manager.has_sequence.return_value = False
        
        result = coordinator.save_image()
        
        assert result.success is False
        assert "No sequence to export" in result.message
    
    def test_save_image_no_service(self, minimal_coordinator):
        """Test image export without export service."""
        result = minimal_coordinator.save_image()
        
        assert result.success is False
        assert "Export service not available" in result.message
    
    def test_copy_json_success(self, coordinator, mock_export_service, mock_clipboard_service):
        """Test successful JSON copy operation."""
        result = coordinator.copy_json()
        
        assert result.success is True
        assert result.operation_type == OperationType.COPY_JSON
        assert "JSON copied to clipboard!" in result.message
        assert result.additional_data["json_length"] == len('{"test": "json"}')
        assert result.additional_data["sequence_length"] == 3
        
        mock_export_service.export_sequence_json.assert_called_once()
        mock_clipboard_service.copy_text_to_clipboard.assert_called_once_with('{"test": "json"}')
    
    def test_copy_json_export_failure(self, coordinator, mock_export_service):
        """Test JSON copy when export fails."""
        mock_export_service.export_sequence_json.return_value = (False, "JSON export failed")
        
        result = coordinator.copy_json()
        
        assert result.success is False
        assert "JSON export failed" in result.message
    
    def test_copy_json_clipboard_failure(self, coordinator, mock_export_service, mock_clipboard_service):
        """Test JSON copy when clipboard operation fails."""
        mock_clipboard_service.copy_text_to_clipboard.return_value = (False, "Clipboard failed")
        
        result = coordinator.copy_json()
        
        assert result.success is False
        assert "Clipboard operation failed" in result.message
    
    def test_copy_json_no_export_service(self, coordinator):
        """Test JSON copy without export service."""
        coordinator._export_service = None
        
        result = coordinator.copy_json()
        
        assert result.success is False
        assert "Export service not available" in result.message
    
    def test_copy_json_no_clipboard_service(self, coordinator):
        """Test JSON copy without clipboard service."""
        coordinator._clipboard_service = None
        
        result = coordinator.copy_json()
        
        assert result.success is False
        assert "Clipboard service not available" in result.message

    # View Operations Tests
    def test_view_fullscreen_success(self, coordinator, mock_fullscreen_service):
        """Test successful fullscreen view."""
        result = coordinator.view_fullscreen()
        
        assert result.success is True
        assert result.operation_type == OperationType.VIEW_FULLSCREEN
        assert "Opening full screen view" in result.message
        mock_fullscreen_service.show_full_screen_view.assert_called_once()
    
    def test_view_fullscreen_no_sequence(self, coordinator, mock_state_manager):
        """Test fullscreen view without sequence."""
        mock_state_manager.has_sequence.return_value = False
        
        result = coordinator.view_fullscreen()
        
        assert result.success is False
        assert "No sequence to view" in result.message
    
    def test_view_fullscreen_no_service(self, minimal_coordinator):
        """Test fullscreen view without service."""
        result = minimal_coordinator.view_fullscreen()
        
        assert result.success is False
        assert "Fullscreen service not available" in result.message

    # Transform Operations Tests
    def test_mirror_sequence_success(self, coordinator, mock_sequence_transformer):
        """Test successful sequence mirroring."""
        result = coordinator.mirror_sequence()
        
        assert result.success is True
        assert result.operation_type == OperationType.MIRROR_SEQUENCE
        assert "Sequence mirrored!" in result.message
        assert result.updated_sequence is not None
        assert result.additional_data["original_length"] == 3
        assert result.additional_data["mirrored_length"] == 3
        mock_sequence_transformer.reflect_sequence.assert_called_once()
    
    def test_swap_colors_success(self, coordinator, mock_sequence_transformer):
        """Test successful color swapping."""
        result = coordinator.swap_colors()
        
        assert result.success is True
        assert result.operation_type == OperationType.SWAP_COLORS
        assert "Colors swapped!" in result.message
        assert result.updated_sequence is not None
        assert result.additional_data["original_length"] == 3
        assert result.additional_data["swapped_length"] == 3
        mock_sequence_transformer.swap_colors.assert_called_once()
    
    def test_rotate_sequence_success(self, coordinator, mock_sequence_transformer):
        """Test successful sequence rotation."""
        result = coordinator.rotate_sequence()
        
        assert result.success is True
        assert result.operation_type == OperationType.ROTATE_SEQUENCE
        assert "Sequence rotated!" in result.message
        assert result.updated_sequence is not None
        assert result.additional_data["original_length"] == 3
        assert result.additional_data["rotated_length"] == 3
        mock_sequence_transformer.rotate_sequence.assert_called_once()
    
    def test_transform_operations_no_sequence(self, coordinator, mock_state_manager):
        """Test transform operations without sequence."""
        mock_state_manager.has_sequence.return_value = False
        
        operations = [
            coordinator.mirror_sequence,
            coordinator.swap_colors,
            coordinator.rotate_sequence
        ]
        
        for operation in operations:
            result = operation()
            assert result.success is False
            assert "No sequence to" in result.message
    
    def test_transform_operations_no_service(self, minimal_coordinator):
        """Test transform operations without transformer service."""
        operations = [
            (minimal_coordinator.mirror_sequence, "Sequence transformer not available"),
            (minimal_coordinator.swap_colors, "Sequence transformer not available"),
            (minimal_coordinator.rotate_sequence, "Sequence transformer not available")
        ]
        
        for operation, expected_message in operations:
            result = operation()
            assert result.success is False
            assert expected_message in result.message

    # Beat Operations Tests
    def test_delete_beat_success(self, coordinator, mock_beat_operations):
        """Test successful beat deletion."""
        result = coordinator.delete_beat(1)
        
        assert result.success is True
        assert result.operation_type == OperationType.DELETE_BEAT
        assert "Beat deleted!" in result.message
        assert result.updated_sequence is not None
        assert result.additional_data["deletion_type"] == "single_beat"
        assert result.additional_data["deleted_index"] == 1
        assert result.additional_data["original_length"] == 3
        assert result.additional_data["new_length"] == 2
        mock_beat_operations.delete_beat.assert_called_once()
    
    def test_delete_beat_all_beats(self, coordinator, mock_state_manager):
        """Test deleting all beats (start position deletion)."""
        result = coordinator.delete_beat(-1)
        
        assert result.success is True
        assert "All beats deleted!" in result.message
        assert result.additional_data["deletion_type"] == "all_beats"
        assert result.additional_data["original_length"] == 3
        assert result.additional_data["new_length"] == 0
    
    def test_delete_beat_no_index(self, coordinator):
        """Test beat deletion without index."""
        result = coordinator.delete_beat(None)
        
        assert result.success is False
        assert "No beat selected" in result.message
    
    def test_delete_beat_no_sequence(self, coordinator, mock_state_manager):
        """Test beat deletion without sequence."""
        mock_state_manager.has_sequence.return_value = False
        
        result = coordinator.delete_beat(1)
        
        assert result.success is False
        assert "No beats to delete" in result.message
    
    def test_delete_beat_no_service(self, minimal_coordinator):
        """Test beat deletion without beat operations service."""
        result = minimal_coordinator.delete_beat(1)
        
        assert result.success is False
        assert "Beat operations service not available" in result.message

    # Clear Operations Tests
    def test_clear_sequence_success(self, coordinator, mock_sequence_persister, mock_state_manager):
        """Test successful sequence clearing."""
        result = coordinator.clear_sequence()
        
        assert result.success is True
        assert result.operation_type == OperationType.CLEAR_SEQUENCE
        assert "Sequence cleared!" in result.message
        mock_sequence_persister.clear_current_sequence.assert_called_once()
        mock_state_manager.clear_all_state.assert_called_once()
    
    def test_clear_sequence_persister_exception(self, coordinator, mock_sequence_persister):
        """Test sequence clearing when persister raises exception."""
        mock_sequence_persister.clear_current_sequence.side_effect = Exception("Persister error")
        
        result = coordinator.clear_sequence()
        
        assert result.success is False
        assert "Clear failed" in result.message

    # Operation Validation Tests
    def test_can_execute_operation_all_available(self, coordinator):
        """Test operation validation when all services are available."""
        for operation_type in OperationType:
            can_execute, reason = coordinator.can_execute_operation(operation_type)
            assert can_execute is True
            assert reason == ""
    
    def test_can_execute_operation_no_sequence(self, coordinator, mock_state_manager):
        """Test operation validation without sequence."""
        mock_state_manager.has_sequence.return_value = False
        
        sequence_required_ops = [
            OperationType.ADD_TO_DICTIONARY,
            OperationType.SAVE_IMAGE,
            OperationType.VIEW_FULLSCREEN,
            OperationType.MIRROR_SEQUENCE,
            OperationType.SWAP_COLORS,
            OperationType.ROTATE_SEQUENCE,
            OperationType.COPY_JSON,
            OperationType.DELETE_BEAT,
        ]
        
        for op_type in sequence_required_ops:
            can_execute, reason = coordinator.can_execute_operation(op_type)
            assert can_execute is False
            assert "No sequence loaded" in reason
        
        # Clear operation should still be available
        can_execute, reason = coordinator.can_execute_operation(OperationType.CLEAR_SEQUENCE)
        assert can_execute is True
    
    def test_can_execute_operation_missing_services(self, minimal_coordinator):
        """Test operation validation with missing services."""
        operations_requiring_services = [
            OperationType.ADD_TO_DICTIONARY,
            OperationType.VIEW_FULLSCREEN,
            OperationType.MIRROR_SEQUENCE,
            OperationType.SWAP_COLORS,
            OperationType.ROTATE_SEQUENCE,
            OperationType.DELETE_BEAT,
            OperationType.SAVE_IMAGE,
            OperationType.COPY_JSON,
        ]
        
        for op_type in operations_requiring_services:
            can_execute, reason = coordinator.can_execute_operation(op_type)
            assert can_execute is False
            assert "not available" in reason
    
    def test_can_execute_copy_json_special_validation(self, coordinator):
        """Test special validation for COPY_JSON operation."""
        # Test with clipboard not available
        coordinator._clipboard_service.is_clipboard_available.return_value = False
        
        can_execute, reason = coordinator.can_execute_operation(OperationType.COPY_JSON)
        assert can_execute is False
        assert "System clipboard not available" in reason

    # Status and Diagnostics Tests
    def test_get_operation_status_summary(self, coordinator):
        """Test operation status summary."""
        summary = coordinator.get_operation_status_summary()
        
        assert "services" in summary
        assert "state" in summary
        assert "operations" in summary
        assert "diagnostics" in summary
        
        # Check service status
        services = summary["services"]
        assert services["state_manager"] is True
        assert services["export_service"] is True
        assert services["clipboard_service"] is True
        
        # Check state info
        state = summary["state"]
        assert state["has_sequence"] is True
        assert state["sequence_length"] == 3
        
        # Check operations status
        operations = summary["operations"]
        for op_name, op_info in operations.items():
            assert op_info["can_execute"] is True
            assert op_info["reason"] == "Available"
        
        # Check enhanced diagnostics
        diagnostics = summary["diagnostics"]
        assert "export_service" in diagnostics
        assert "clipboard_service" in diagnostics
    
    def test_get_service_health_report(self, coordinator):
        """Test service health report."""
        health_report = coordinator.get_service_health_report()
        
        assert health_report["overall_health"] == "healthy"
        assert len(health_report["critical_services"]) == 0
        assert "service_details" in health_report
        
        # Check service details
        details = health_report["service_details"]
        assert "export_service" in details
        assert details["export_service"]["available"] is True
        assert "clipboard_service" in details
        assert details["clipboard_service"]["available"] is True
    
    def test_get_service_health_report_missing_critical_services(self, minimal_coordinator):
        """Test health report with missing critical services."""
        health_report = minimal_coordinator.get_service_health_report()
        
        assert health_report["overall_health"] == "critical"
        assert "state_manager" in health_report["critical_services"]
        assert "beat_operations" in health_report["critical_services"]
    
    def test_get_service_health_report_exception(self, coordinator, mock_export_service):
        """Test health report when exception occurs."""
        mock_export_service.validate_export_directory.side_effect = Exception("Health check error")
        
        health_report = coordinator.get_service_health_report()
        
        assert "error" in health_report
        assert health_report["overall_health"] == "error"

    # Error Handling Tests
    def test_operation_exception_handling(self, coordinator, mock_dictionary_service):
        """Test operation exception handling."""
        mock_dictionary_service.add_sequence_to_dictionary.side_effect = Exception("Service error")
        
        result = coordinator.add_to_dictionary()
        
        assert result.success is False
        assert "Failed to add to dictionary" in result.message
        assert "Service error" in result.error_details
    
    def test_all_operations_handle_exceptions_gracefully(self, coordinator):
        """Test that all operations handle exceptions gracefully."""
        # Make all services raise exceptions
        for service_attr in ['_dictionary_service', '_export_service', '_clipboard_service',
                           '_fullscreen_service', '_sequence_transformer', '_beat_operations',
                           '_sequence_persister']:
            service = getattr(coordinator, service_attr)
            if service:
                for method_name in dir(service):
                    if not method_name.startswith('_'):
                        method = getattr(service, method_name)
                        if callable(method):
                            method.side_effect = Exception("Test exception")
        
        # Test all operations
        operations = [
            (coordinator.add_to_dictionary, []),
            (coordinator.save_image, []),
            (coordinator.copy_json, []),
            (coordinator.view_fullscreen, []),
            (coordinator.mirror_sequence, []),
            (coordinator.swap_colors, []),
            (coordinator.rotate_sequence, []),
            (coordinator.delete_beat, [1]),
            (coordinator.clear_sequence, []),
        ]
        
        for operation, args in operations:
            result = operation(*args)
            assert result.success is False
            assert result.error_details is not None


class TestOperationResult:
    """Test suite for OperationResult helper methods."""
    
    def test_success_result_creation(self):
        """Test creating successful operation result."""
        result = OperationResult.success_result(
            OperationType.ADD_TO_DICTIONARY,
            "Success message",
            updated_sequence=Mock(),
            additional_data={"key": "value"}
        )
        
        assert result.success is True
        assert result.operation_type == OperationType.ADD_TO_DICTIONARY
        assert result.message == "Success message"
        assert result.updated_sequence is not None
        assert result.error_details is None
        assert result.additional_data["key"] == "value"
    
    def test_failure_result_creation(self):
        """Test creating failure operation result."""
        result = OperationResult.failure_result(
            OperationType.SAVE_IMAGE,
            "Failure message",
            error_details="Error details",
            additional_data={"error_code": 500}
        )
        
        assert result.success is False
        assert result.operation_type == OperationType.SAVE_IMAGE
        assert result.message == "Failure message"
        assert result.updated_sequence is None
        assert result.error_details == "Error details"
        assert result.additional_data["error_code"] == 500


if __name__ == "__main__":
    # Run tests directly
    pytest.main([__file__, "-v"])
