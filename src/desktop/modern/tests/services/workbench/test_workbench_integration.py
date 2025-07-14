"""
Integration tests for complete workbench service workflow

Tests the interaction between all workbench services including
export, clipboard, and coordinator integration.
"""

import json
import tempfile
import pytest
from pathlib import Path
from unittest.mock import Mock, patch

# Test imports - adjust paths as needed for your test environment
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent.parent))

from application.services.workbench.workbench_export_service import WorkbenchExportService
from application.services.workbench.workbench_clipboard_service import (
    WorkbenchClipboardService,
    MockClipboardAdapter
)
from application.services.workbench.enhanced_workbench_operation_coordinator import (
    EnhancedWorkbenchOperationCoordinator,
    OperationType
)


class TestWorkbenchServiceIntegration:
    """Integration tests for complete workbench service workflows."""
    
    @pytest.fixture
    def temp_export_dir(self):
        """Create temporary directory for export tests."""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield temp_dir
    
    @pytest.fixture
    def export_service(self, temp_export_dir):
        """Create export service with temporary directory."""
        return WorkbenchExportService(base_export_directory=temp_export_dir)
    
    @pytest.fixture
    def clipboard_service(self):
        """Create clipboard service with mock adapter."""
        adapter = MockClipboardAdapter()
        return WorkbenchClipboardService(clipboard_adapter=adapter)
    
    @pytest.fixture
    def mock_state_manager(self):
        """Create mock state manager with test sequence."""
        manager = Mock()
        manager.has_sequence.return_value = True
        
        # Create realistic mock sequence
        mock_beats = []
        for i in range(3):
            beat = Mock()
            beat.letter = f"Beat_{i}"
            beat.__dict__ = {"letter": f"Beat_{i}", "data": f"test_data_{i}"}
            mock_beats.append(beat)
        
        mock_sequence = Mock()
        mock_sequence.length = 3
        mock_sequence.beats = mock_beats
        
        manager.get_current_sequence.return_value = mock_sequence
        return manager
    
    @pytest.fixture
    def integrated_coordinator(self, export_service, clipboard_service, mock_state_manager):
        """Create coordinator with real export and clipboard services."""
        return EnhancedWorkbenchOperationCoordinator(
            workbench_state_manager=mock_state_manager,
            export_service=export_service,
            clipboard_service=clipboard_service
        )

    # Service Integration Tests
    def test_export_and_clipboard_integration(self, export_service, clipboard_service, mock_state_manager):
        """Test integration between export and clipboard services."""
        sequence = mock_state_manager.get_current_sequence()
        
        # Step 1: Export sequence as JSON
        json_success, json_result = export_service.export_sequence_json(sequence)
        assert json_success is True
        assert isinstance(json_result, str)
        
        # Validate JSON structure
        json_data = json.loads(json_result)
        assert json_data["sequence"]["length"] == 3
        assert len(json_data["sequence"]["beats"]) == 3
        
        # Step 2: Copy JSON to clipboard
        clipboard_success, clipboard_message = clipboard_service.copy_text_to_clipboard(json_result)
        assert clipboard_success is True
        assert "Text copied to clipboard" in clipboard_message
        
        # Step 3: Verify clipboard contents
        get_success, retrieved_text = clipboard_service.get_clipboard_text()
        assert get_success is True
        assert retrieved_text == json_result
        
        # Validate that retrieved JSON is the same
        retrieved_json = json.loads(retrieved_text)
        assert retrieved_json == json_data
    
    def test_coordinator_export_workflow(self, integrated_coordinator, temp_export_dir):
        """Test complete export workflow through coordinator."""
        # Test image export
        image_result = integrated_coordinator.save_image()
        assert image_result.success is True
        assert "Image saved successfully!" in image_result.message
        assert "file_path" in image_result.additional_data
        
        # Verify file was created
        file_path = image_result.additional_data["file_path"]
        assert Path(file_path).exists()
        assert file_path.startswith(temp_export_dir)
    
    def test_coordinator_json_copy_workflow(self, integrated_coordinator):
        """Test complete JSON copy workflow through coordinator."""
        # Test JSON copy operation
        json_result = integrated_coordinator.copy_json()
        assert json_result.success is True
        assert "JSON copied to clipboard!" in json_result.message
        assert "json_length" in json_result.additional_data
        assert "sequence_length" in json_result.additional_data
        
        # Verify clipboard was used
        clipboard_stats = integrated_coordinator._clipboard_service.get_clipboard_stats()
        assert clipboard_stats["adapter_available"] is True
        assert clipboard_stats["clipboard_available"] is True
    
    def test_coordinator_operation_validation_integration(self, integrated_coordinator):
        """Test operation validation with integrated services."""
        # All operations should be available with proper services
        operations_to_test = [
            OperationType.SAVE_IMAGE,
            OperationType.COPY_JSON,
        ]
        
        for op_type in operations_to_test:
            can_execute, reason = integrated_coordinator.can_execute_operation(op_type)
            assert can_execute is True
            assert reason == ""
    
    def test_coordinator_status_reporting_integration(self, integrated_coordinator):
        """Test status reporting with integrated services."""
        # Test operation status summary
        summary = integrated_coordinator.get_operation_status_summary()
        
        assert summary["services"]["export_service"] is True
        assert summary["services"]["clipboard_service"] is True
        assert summary["state"]["has_sequence"] is True
        assert summary["state"]["sequence_length"] == 3
        
        # Check enhanced diagnostics
        diagnostics = summary["diagnostics"]
        assert "export_service" in diagnostics
        assert diagnostics["export_service"]["directory_valid"] is True
        assert "clipboard_service" in diagnostics
        assert diagnostics["clipboard_service"]["adapter_available"] is True
    
    def test_coordinator_health_report_integration(self, integrated_coordinator):
        """Test health report with integrated services."""
        health_report = integrated_coordinator.get_service_health_report()
        
        assert health_report["overall_health"] in ["healthy", "degraded"]  # Some services may be missing
        
        # Check service details
        service_details = health_report["service_details"]
        assert "export_service" in service_details
        assert service_details["export_service"]["available"] is True
        assert service_details["export_service"]["directory_valid"] is True
        
        assert "clipboard_service" in service_details
        assert service_details["clipboard_service"]["available"] is True
        assert service_details["clipboard_service"]["clipboard_available"] is True

    # Error Recovery Integration Tests
    def test_export_failure_recovery(self, integrated_coordinator, mock_state_manager):
        """Test error recovery in export operations."""
        # Simulate export service failure
        integrated_coordinator._export_service = None
        
        # Operations should fail gracefully
        image_result = integrated_coordinator.save_image()
        assert image_result.success is False
        assert "Export service not available" in image_result.message
        
        json_result = integrated_coordinator.copy_json()
        assert json_result.success is False
        assert "Export service not available" in json_result.message
    
    def test_clipboard_failure_recovery(self, integrated_coordinator):
        """Test error recovery in clipboard operations."""
        # Simulate clipboard service failure
        integrated_coordinator._clipboard_service = None
        
        # JSON copy should fail gracefully
        json_result = integrated_coordinator.copy_json()
        assert json_result.success is False
        assert "Clipboard service not available" in json_result.message
    
    def test_partial_service_availability(self, export_service, mock_state_manager):
        """Test coordinator behavior with partial service availability."""
        # Create coordinator with only export service
        coordinator = EnhancedWorkbenchOperationCoordinator(
            workbench_state_manager=mock_state_manager,
            export_service=export_service,
            clipboard_service=None  # No clipboard service
        )
        
        # Image export should work
        image_result = coordinator.save_image()
        assert image_result.success is True
        
        # JSON copy should fail due to missing clipboard
        json_result = coordinator.copy_json()
        assert json_result.success is False
        assert "Clipboard service not available" in json_result.message

    # Performance Integration Tests
    def test_concurrent_operations(self, integrated_coordinator):
        """Test concurrent operations through coordinator."""
        results = []
        
        # Perform multiple operations
        operations = [
            integrated_coordinator.save_image,
            integrated_coordinator.copy_json,
            integrated_coordinator.save_image,
            integrated_coordinator.copy_json,
        ]
        
        for operation in operations:
            result = operation()
            results.append(result)
        
        # All operations should succeed
        for result in results:
            assert result.success is True
        
        # Check that export directory has files
        export_stats = integrated_coordinator._export_service.get_export_stats()
        assert export_stats["file_count"] >= 2  # At least 2 image files
    
    def test_large_sequence_handling(self, integrated_coordinator, mock_state_manager):
        """Test handling of large sequences through integrated services."""
        # Create large sequence
        large_beats = []
        for i in range(50):
            beat = Mock()
            beat.letter = f"LargeBeat_{i}"
            beat.__dict__ = {"letter": f"LargeBeat_{i}", "data": f"large_data_{i}" * 10}
            large_beats.append(beat)
        
        large_sequence = Mock()
        large_sequence.length = 50
        large_sequence.beats = large_beats
        
        mock_state_manager.get_current_sequence.return_value = large_sequence
        
        # Test operations with large sequence
        image_result = integrated_coordinator.save_image()
        assert image_result.success is True
        
        json_result = integrated_coordinator.copy_json()
        assert json_result.success is True
        
        # Verify JSON handling
        assert json_result.additional_data["sequence_length"] == 50
        assert json_result.additional_data["json_length"] > 1000  # Should be substantial JSON

    # Service Configuration Integration Tests
    def test_export_directory_configuration(self, clipboard_service, mock_state_manager, temp_export_dir):
        """Test export service with different directory configurations."""
        # Test with custom directory
        custom_export_dir = Path(temp_export_dir) / "custom_exports"
        custom_export_service = WorkbenchExportService(base_export_directory=str(custom_export_dir))
        
        coordinator = EnhancedWorkbenchOperationCoordinator(
            workbench_state_manager=mock_state_manager,
            export_service=custom_export_service,
            clipboard_service=clipboard_service
        )
        
        # Test export operations
        image_result = coordinator.save_image()
        assert image_result.success is True
        
        # Verify file was created in custom directory
        file_path = image_result.additional_data["file_path"]
        assert str(custom_export_dir) in file_path
        assert Path(file_path).exists()
    
    def test_clipboard_adapter_configuration(self, export_service, mock_state_manager):
        """Test clipboard service with different adapter configurations."""
        # Test with mock adapter
        mock_adapter = MockClipboardAdapter()
        clipboard_service = WorkbenchClipboardService(clipboard_adapter=mock_adapter)
        
        coordinator = EnhancedWorkbenchOperationCoordinator(
            workbench_state_manager=mock_state_manager,
            export_service=export_service,
            clipboard_service=clipboard_service
        )
        
        # Test clipboard operations
        json_result = coordinator.copy_json()
        assert json_result.success is True
        
        # Verify mock adapter was used
        retrieved_text = mock_adapter.get_text()
        json_data = json.loads(retrieved_text)
        assert json_data["sequence"]["length"] == 3

    # Data Integrity Integration Tests
    def test_export_json_data_integrity(self, integrated_coordinator, mock_state_manager):
        """Test JSON export data integrity through full workflow."""
        original_sequence = mock_state_manager.get_current_sequence()
        
        # Export and copy JSON
        json_result = integrated_coordinator.copy_json()
        assert json_result.success is True
        
        # Retrieve from clipboard
        get_success, retrieved_json = integrated_coordinator._clipboard_service.get_clipboard_text()
        assert get_success is True
        
        # Parse and validate JSON structure
        json_data = json.loads(retrieved_json)
        
        # Verify metadata
        assert "metadata" in json_data
        assert json_data["metadata"]["sequence_length"] == original_sequence.length
        
        # Verify sequence data
        assert "sequence" in json_data
        assert json_data["sequence"]["length"] == original_sequence.length
        assert len(json_data["sequence"]["beats"]) == len(original_sequence.beats)
        
        # Verify beat data integrity
        for i, (original_beat, exported_beat) in enumerate(zip(original_sequence.beats, json_data["sequence"]["beats"])):
            assert exported_beat["index"] == i
            assert exported_beat["letter"] == original_beat.letter
    
    def test_round_trip_data_consistency(self, integrated_coordinator):
        """Test data consistency through multiple round trips."""
        # Perform multiple export/copy cycles
        results = []
        for i in range(3):
            json_result = integrated_coordinator.copy_json()
            assert json_result.success is True
            
            # Get from clipboard
            get_success, retrieved_json = integrated_coordinator._clipboard_service.get_clipboard_text()
            assert get_success is True
            
            json_data = json.loads(retrieved_json)
            results.append(json_data)
        
        # All results should be identical
        for i in range(1, len(results)):
            assert results[i] == results[0]


class TestServiceCompatibility:
    """Test compatibility between new services and existing patterns."""
    
    def test_service_interface_compatibility(self):
        """Test that new services follow established interface patterns."""
        # Test export service interface
        export_service = WorkbenchExportService()
        
        # Should have required methods
        assert hasattr(export_service, 'export_sequence_image')
        assert hasattr(export_service, 'export_sequence_json')
        assert hasattr(export_service, 'get_export_directory')
        assert hasattr(export_service, 'validate_export_directory')
        
        # Test clipboard service interface
        clipboard_service = WorkbenchClipboardService()
        
        # Should have required methods
        assert hasattr(clipboard_service, 'copy_text_to_clipboard')
        assert hasattr(clipboard_service, 'get_clipboard_text')
        assert hasattr(clipboard_service, 'is_clipboard_available')
    
    def test_coordinator_interface_compatibility(self):
        """Test that enhanced coordinator maintains interface compatibility."""
        coordinator = EnhancedWorkbenchOperationCoordinator()
        
        # Should have all original operation methods
        original_methods = [
            'add_to_dictionary', 'view_fullscreen', 'mirror_sequence',
            'swap_colors', 'rotate_sequence', 'delete_beat', 'clear_sequence'
        ]
        
        for method_name in original_methods:
            assert hasattr(coordinator, method_name)
            assert callable(getattr(coordinator, method_name))
        
        # Should have enhanced operation methods
        enhanced_methods = ['save_image', 'copy_json']
        
        for method_name in enhanced_methods:
            assert hasattr(coordinator, method_name)
            assert callable(getattr(coordinator, method_name))
        
        # Should have validation and diagnostics methods
        diagnostic_methods = ['can_execute_operation', 'get_operation_status_summary', 'get_service_health_report']
        
        for method_name in diagnostic_methods:
            assert hasattr(coordinator, method_name)
            assert callable(getattr(coordinator, method_name))
    
    def test_result_format_compatibility(self):
        """Test that operation results follow consistent format."""
        coordinator = EnhancedWorkbenchOperationCoordinator()
        
        # All operations should return OperationResult
        operations = [
            coordinator.add_to_dictionary,
            coordinator.save_image,
            coordinator.copy_json,
            coordinator.view_fullscreen,
            coordinator.mirror_sequence,
            coordinator.swap_colors,
            coordinator.rotate_sequence,
            coordinator.clear_sequence,
        ]
        
        for operation in operations:
            result = operation()
            
            # Should have consistent attributes
            assert hasattr(result, 'success')
            assert hasattr(result, 'operation_type')
            assert hasattr(result, 'message')
            assert hasattr(result, 'updated_sequence')
            assert hasattr(result, 'error_details')
            assert hasattr(result, 'additional_data')
            
            # Success should be boolean
            assert isinstance(result.success, bool)
            
            # Message should be string
            assert isinstance(result.message, str)


if __name__ == "__main__":
    # Run tests directly
    pytest.main([__file__, "-v"])
