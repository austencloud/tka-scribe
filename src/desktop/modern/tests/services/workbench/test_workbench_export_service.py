"""
Comprehensive test suite for WorkbenchExportService

Tests all export functionality including image export, JSON export,
directory management, validation, and error handling.
"""

import json
import os
import tempfile
import pytest
from pathlib import Path
from unittest.mock import Mock, patch

# Test imports - adjust paths as needed for your test environment
import sys
sys.path.append(str(Path(__file__).parent.parent.parent.parent.parent))

from application.services.workbench.workbench_export_service import WorkbenchExportService
from domain.models.sequence_data import SequenceData
from domain.models.beat_data import BeatData


class TestWorkbenchExportService:
    """Test suite for WorkbenchExportService."""
    
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
    def sample_sequence(self):
        """Create sample sequence for testing."""
        beat1 = Mock()
        beat1.letter = "A"
        beat1.__dict__ = {"letter": "A", "data": "test_data_1"}
        
        beat2 = Mock()
        beat2.letter = "B"  
        beat2.__dict__ = {"letter": "B", "data": "test_data_2"}
        
        sequence = Mock()
        sequence.length = 2
        sequence.beats = [beat1, beat2]
        
        return sequence
    
    @pytest.fixture
    def empty_sequence(self):
        """Create empty sequence for testing."""
        sequence = Mock()
        sequence.length = 0
        sequence.beats = []
        return sequence

    # Initialization Tests
    def test_export_service_initialization_with_custom_directory(self, temp_export_dir):
        """Test service initializes correctly with custom directory."""
        service = WorkbenchExportService(base_export_directory=temp_export_dir)
        
        assert service.get_export_directory() == temp_export_dir
        assert Path(temp_export_dir).exists()
        assert service.validate_export_directory()
    
    def test_export_service_initialization_with_default_directory(self):
        """Test service initializes correctly with default directory."""
        service = WorkbenchExportService()
        
        # Should not raise exception
        directory = service.get_export_directory()
        assert isinstance(directory, str)
        assert len(directory) > 0
    
    def test_export_directory_creation(self, temp_export_dir):
        """Test that export directory is created if it doesn't exist."""
        # Create service with non-existent subdirectory
        export_subdir = os.path.join(temp_export_dir, "test_subdir")
        assert not Path(export_subdir).exists()
        
        service = WorkbenchExportService(base_export_directory=export_subdir)
        
        assert Path(export_subdir).exists()
        assert service.validate_export_directory()

    # Image Export Tests
    def test_export_sequence_image_success(self, export_service, sample_sequence):
        """Test successful image export."""
        success, result = export_service.export_sequence_image(sample_sequence)
        
        assert success is True
        assert isinstance(result, str)  # Should return file path
        assert Path(result).exists()
        assert "sequence_2beats_" in result  # Should contain beat count
        assert result.endswith(".png")
    
    def test_export_sequence_image_with_custom_path(self, export_service, sample_sequence, temp_export_dir):
        """Test image export with custom file path."""
        custom_path = os.path.join(temp_export_dir, "custom_sequence.png")
        
        success, result = export_service.export_sequence_image(sample_sequence, custom_path)
        
        assert success is True
        assert result == custom_path
        assert Path(custom_path).exists()
    
    def test_export_sequence_image_empty_sequence(self, export_service, empty_sequence):
        """Test image export with empty sequence."""
        success, result = export_service.export_sequence_image(empty_sequence)
        
        assert success is False
        assert "No sequence data to export" in result
    
    def test_export_sequence_image_none_sequence(self, export_service):
        """Test image export with None sequence."""
        success, result = export_service.export_sequence_image(None)
        
        assert success is False
        assert "No sequence data to export" in result
    
    def test_export_sequence_image_file_write_error(self, export_service, sample_sequence):
        """Test image export with file write error."""
        # Try to write to invalid path
        invalid_path = "/invalid/path/that/does/not/exist/test.png"
        
        success, result = export_service.export_sequence_image(sample_sequence, invalid_path)
        
        assert success is False
        assert "Failed to write export file" in result

    # JSON Export Tests
    def test_export_sequence_json_success(self, export_service, sample_sequence):
        """Test successful JSON export."""
        success, result = export_service.export_sequence_json(sample_sequence)
        
        assert success is True
        assert isinstance(result, str)
        
        # Validate JSON structure
        json_data = json.loads(result)
        assert "metadata" in json_data
        assert "sequence" in json_data
        assert json_data["metadata"]["sequence_length"] == 2
        assert json_data["sequence"]["length"] == 2
        assert len(json_data["sequence"]["beats"]) == 2
        
        # Validate beat data
        beat_data = json_data["sequence"]["beats"]
        assert beat_data[0]["letter"] == "A"
        assert beat_data[1]["letter"] == "B"
    
    def test_export_sequence_json_empty_sequence(self, export_service, empty_sequence):
        """Test JSON export with empty sequence."""
        success, result = export_service.export_sequence_json(empty_sequence)
        
        assert success is True  # Empty sequence should still export
        
        json_data = json.loads(result)
        assert json_data["metadata"]["sequence_length"] == 0
        assert json_data["sequence"]["length"] == 0
        assert len(json_data["sequence"]["beats"]) == 0
    
    def test_export_sequence_json_none_sequence(self, export_service):
        """Test JSON export with None sequence."""
        success, result = export_service.export_sequence_json(None)
        
        assert success is False
        assert "No sequence data to export" in result
    
    def test_export_sequence_json_format_validation(self, export_service, sample_sequence):
        """Test that exported JSON has correct format and structure."""
        success, result = export_service.export_sequence_json(sample_sequence)
        
        assert success is True
        json_data = json.loads(result)
        
        # Check required metadata fields
        metadata = json_data["metadata"]
        assert "export_timestamp" in metadata
        assert "export_version" in metadata
        assert "sequence_length" in metadata
        
        # Check sequence structure
        sequence = json_data["sequence"]
        assert "length" in sequence
        assert "beats" in sequence
        
        # Check beat structure
        for i, beat in enumerate(sequence["beats"]):
            assert "index" in beat
            assert "letter" in beat
            assert "data" in beat
            assert beat["index"] == i

    # Directory Management Tests
    def test_get_export_directory(self, export_service, temp_export_dir):
        """Test getting export directory."""
        directory = export_service.get_export_directory()
        assert directory == temp_export_dir
    
    def test_validate_export_directory_valid(self, export_service):
        """Test validation of valid export directory."""
        assert export_service.validate_export_directory() is True
    
    def test_validate_export_directory_nonexistent(self, temp_export_dir):
        """Test validation of non-existent directory."""
        nonexistent_dir = os.path.join(temp_export_dir, "does_not_exist")
        service = WorkbenchExportService(base_export_directory=nonexistent_dir)
        
        # Directory should be created during initialization
        assert service.validate_export_directory() is True
    
    @patch('os.access')
    def test_validate_export_directory_not_writable(self, mock_access, export_service):
        """Test validation of non-writable directory."""
        mock_access.return_value = False  # Simulate non-writable directory
        
        assert export_service.validate_export_directory() is False

    # Statistics and Diagnostics Tests
    def test_get_export_stats_valid_directory(self, export_service, sample_sequence):
        """Test export statistics for valid directory."""
        # Create some export files first
        export_service.export_sequence_image(sample_sequence)
        export_service.export_sequence_image(sample_sequence)
        
        stats = export_service.get_export_stats()
        
        assert stats["exists"] is True
        assert stats["writable"] is True
        assert stats["file_count"] >= 2  # At least the files we created
        assert "recent_files" in stats
        assert isinstance(stats["recent_files"], list)
    
    def test_get_export_stats_nonexistent_directory(self, temp_export_dir):
        """Test export statistics for non-existent directory."""
        nonexistent_dir = os.path.join(temp_export_dir, "does_not_exist")
        
        # Create service but delete directory after initialization
        service = WorkbenchExportService(base_export_directory=nonexistent_dir)
        os.rmdir(nonexistent_dir)  # Remove directory
        
        stats = service.get_export_stats()
        
        assert stats["exists"] is False
        assert stats["file_count"] == 0
        assert stats["writable"] is False

    # Error Handling Tests
    def test_export_handling_with_corrupted_sequence(self, export_service):
        """Test export handling with corrupted sequence data."""
        # Create a sequence with missing attributes
        corrupted_sequence = Mock()
        corrupted_sequence.length = 1
        corrupted_sequence.beats = [None]  # Beat is None
        
        # JSON export should handle this gracefully
        success, result = export_service.export_sequence_json(corrupted_sequence)
        assert success is True  # Should not crash
        
        json_data = json.loads(result)
        assert json_data["sequence"]["length"] == 1
    
    def test_export_with_unicode_in_sequence(self, export_service):
        """Test export handling with unicode characters in sequence."""
        # Create sequence with unicode data
        unicode_beat = Mock()
        unicode_beat.letter = "🎵"  # Unicode emoji
        unicode_beat.__dict__ = {"letter": "🎵", "data": "test_unicode_データ"}
        
        unicode_sequence = Mock()
        unicode_sequence.length = 1
        unicode_sequence.beats = [unicode_beat]
        
        success, result = export_service.export_sequence_json(unicode_sequence)
        
        assert success is True
        json_data = json.loads(result)
        assert json_data["sequence"]["beats"][0]["letter"] == "🎵"
    
    def test_export_with_large_sequence(self, export_service):
        """Test export handling with large sequence."""
        # Create large sequence
        large_beats = []
        for i in range(100):
            beat = Mock()
            beat.letter = f"Beat_{i}"
            beat.__dict__ = {"letter": f"Beat_{i}", "data": f"data_{i}" * 100}
            large_beats.append(beat)
        
        large_sequence = Mock()
        large_sequence.length = 100
        large_sequence.beats = large_beats
        
        success, result = export_service.export_sequence_json(large_sequence)
        
        assert success is True
        json_data = json.loads(result)
        assert json_data["sequence"]["length"] == 100
        assert len(json_data["sequence"]["beats"]) == 100

    # Integration Tests
    def test_full_export_workflow(self, export_service, sample_sequence):
        """Test complete export workflow."""
        # Test directory validation
        assert export_service.validate_export_directory()
        
        # Test image export
        image_success, image_path = export_service.export_sequence_image(sample_sequence)
        assert image_success
        assert Path(image_path).exists()
        
        # Test JSON export
        json_success, json_data = export_service.export_sequence_json(sample_sequence)
        assert json_success
        assert json.loads(json_data)  # Should be valid JSON
        
        # Test statistics
        stats = export_service.get_export_stats()
        assert stats["file_count"] >= 1
        assert stats["exists"]
        assert stats["writable"]
    
    def test_concurrent_exports(self, export_service, sample_sequence):
        """Test multiple concurrent exports."""
        results = []
        
        # Simulate concurrent exports
        for i in range(5):
            image_success, image_path = export_service.export_sequence_image(sample_sequence)
            json_success, json_data = export_service.export_sequence_json(sample_sequence)
            
            results.append((image_success, image_path, json_success, json_data))
        
        # All exports should succeed
        for image_success, image_path, json_success, json_data in results:
            assert image_success
            assert Path(image_path).exists()
            assert json_success
            assert json.loads(json_data)
        
        # Check that files were created
        stats = export_service.get_export_stats()
        assert stats["file_count"] >= 5


if __name__ == "__main__":
    # Run tests directly
    pytest.main([__file__, "-v"])
