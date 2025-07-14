"""
Comprehensive test suite for WorkbenchClipboardService

Tests all clipboard functionality including text copying, retrieval,
adapter integration, error handling, and mock functionality.
"""

import pytest
from unittest.mock import Mock, patch

# Test imports - adjust paths as needed for your test environment
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent.parent.parent))

from application.services.workbench.workbench_clipboard_service import (
    WorkbenchClipboardService,
    QtClipboardAdapter,
    MockClipboardAdapter
)


class TestWorkbenchClipboardService:
    """Test suite for WorkbenchClipboardService."""
    
    @pytest.fixture
    def mock_clipboard_adapter(self):
        """Create mock clipboard adapter for testing."""
        adapter = Mock()
        adapter.is_available.return_value = True
        adapter.set_text.return_value = True
        adapter.get_text.return_value = "test_text"
        return adapter
    
    @pytest.fixture
    def clipboard_service(self, mock_clipboard_adapter):
        """Create clipboard service with mock adapter."""
        return WorkbenchClipboardService(clipboard_adapter=mock_clipboard_adapter)
    
    @pytest.fixture
    def clipboard_service_no_adapter(self):
        """Create clipboard service without adapter."""
        return WorkbenchClipboardService(clipboard_adapter=None)

    # Initialization Tests
    def test_clipboard_service_initialization_with_adapter(self, mock_clipboard_adapter):
        """Test service initializes correctly with adapter."""
        service = WorkbenchClipboardService(clipboard_adapter=mock_clipboard_adapter)
        
        assert service._clipboard_adapter is mock_clipboard_adapter
        assert service.is_clipboard_available() is True
    
    def test_clipboard_service_initialization_without_adapter(self):
        """Test service initializes correctly without adapter."""
        service = WorkbenchClipboardService(clipboard_adapter=None)
        
        assert service._clipboard_adapter is None
        assert service.is_clipboard_available() is False

    # Copy Text Tests
    def test_copy_text_to_clipboard_success(self, clipboard_service, mock_clipboard_adapter):
        """Test successful text copying."""
        test_text = "Hello, World!"
        
        success, message = clipboard_service.copy_text_to_clipboard(test_text)
        
        assert success is True
        assert "Text copied to clipboard" in message
        mock_clipboard_adapter.set_text.assert_called_once_with(test_text)
    
    def test_copy_text_to_clipboard_empty_text(self, clipboard_service):
        """Test copying empty text."""
        success, message = clipboard_service.copy_text_to_clipboard("")
        
        assert success is False
        assert "No text provided to copy" in message
    
    def test_copy_text_to_clipboard_none_text(self, clipboard_service):
        """Test copying None text."""
        success, message = clipboard_service.copy_text_to_clipboard(None)
        
        assert success is False
        assert "No text provided to copy" in message
    
    def test_copy_text_to_clipboard_no_adapter(self, clipboard_service_no_adapter):
        """Test copying text without adapter."""
        success, message = clipboard_service_no_adapter.copy_text_to_clipboard("test")
        
        assert success is False
        assert "Clipboard not available" in message
    
    def test_copy_text_to_clipboard_adapter_failure(self, clipboard_service, mock_clipboard_adapter):
        """Test copying text when adapter fails."""
        mock_clipboard_adapter.set_text.return_value = False
        
        success, message = clipboard_service.copy_text_to_clipboard("test")
        
        assert success is False
        assert "Failed to copy text to clipboard" in message
    
    def test_copy_text_to_clipboard_non_string_input(self, clipboard_service, mock_clipboard_adapter):
        """Test copying non-string input (should be converted)."""
        number_input = 12345
        
        success, message = clipboard_service.copy_text_to_clipboard(number_input)
        
        assert success is True
        mock_clipboard_adapter.set_text.assert_called_once_with("12345")
    
    def test_copy_text_to_clipboard_adapter_exception(self, clipboard_service, mock_clipboard_adapter):
        """Test copying text when adapter raises exception."""
        mock_clipboard_adapter.set_text.side_effect = Exception("Adapter error")
        
        success, message = clipboard_service.copy_text_to_clipboard("test")
        
        assert success is False
        assert "Clipboard operation failed" in message

    # Get Text Tests
    def test_get_clipboard_text_success(self, clipboard_service, mock_clipboard_adapter):
        """Test successful text retrieval."""
        expected_text = "Retrieved text"
        mock_clipboard_adapter.get_text.return_value = expected_text
        
        success, result = clipboard_service.get_clipboard_text()
        
        assert success is True
        assert result == expected_text
        mock_clipboard_adapter.get_text.assert_called_once()
    
    def test_get_clipboard_text_no_adapter(self, clipboard_service_no_adapter):
        """Test text retrieval without adapter."""
        success, result = clipboard_service_no_adapter.get_clipboard_text()
        
        assert success is False
        assert "Clipboard not available" in result
    
    def test_get_clipboard_text_adapter_returns_none(self, clipboard_service, mock_clipboard_adapter):
        """Test text retrieval when adapter returns None."""
        mock_clipboard_adapter.get_text.return_value = None
        
        success, result = clipboard_service.get_clipboard_text()
        
        assert success is False
        assert "No text in clipboard" in result
    
    def test_get_clipboard_text_adapter_exception(self, clipboard_service, mock_clipboard_adapter):
        """Test text retrieval when adapter raises exception."""
        mock_clipboard_adapter.get_text.side_effect = Exception("Adapter error")
        
        success, result = clipboard_service.get_clipboard_text()
        
        assert success is False
        assert "Clipboard operation failed" in result

    # Availability Tests
    def test_is_clipboard_available_with_adapter(self, clipboard_service, mock_clipboard_adapter):
        """Test clipboard availability with working adapter."""
        mock_clipboard_adapter.is_available.return_value = True
        
        assert clipboard_service.is_clipboard_available() is True
    
    def test_is_clipboard_available_adapter_not_available(self, clipboard_service, mock_clipboard_adapter):
        """Test clipboard availability when adapter is not available."""
        mock_clipboard_adapter.is_available.return_value = False
        
        assert clipboard_service.is_clipboard_available() is False
    
    def test_is_clipboard_available_no_adapter(self, clipboard_service_no_adapter):
        """Test clipboard availability without adapter."""
        assert clipboard_service_no_adapter.is_clipboard_available() is False
    
    def test_is_clipboard_available_adapter_exception(self, clipboard_service, mock_clipboard_adapter):
        """Test clipboard availability when adapter raises exception."""
        mock_clipboard_adapter.is_available.side_effect = Exception("Adapter error")
        
        assert clipboard_service.is_clipboard_available() is False

    # Statistics Tests
    def test_get_clipboard_stats_with_adapter(self, clipboard_service, mock_clipboard_adapter):
        """Test clipboard statistics with adapter."""
        stats = clipboard_service.get_clipboard_stats()
        
        assert stats["adapter_available"] is True
        assert stats["clipboard_available"] is True
        assert "Mock" in stats["adapter_type"]  # Mock adapter type
    
    def test_get_clipboard_stats_no_adapter(self, clipboard_service_no_adapter):
        """Test clipboard statistics without adapter."""
        stats = clipboard_service_no_adapter.get_clipboard_stats()
        
        assert stats["adapter_available"] is False
        assert stats["clipboard_available"] is False
        assert stats["adapter_type"] is None
    
    def test_get_clipboard_stats_exception(self, clipboard_service, mock_clipboard_adapter):
        """Test clipboard statistics when exception occurs."""
        mock_clipboard_adapter.is_available.side_effect = Exception("Stats error")
        
        stats = clipboard_service.get_clipboard_stats()
        
        assert "error" in stats
        assert stats["adapter_available"] is False
        assert stats["clipboard_available"] is False


class TestQtClipboardAdapter:
    """Test suite for QtClipboardAdapter."""
    
    @pytest.fixture
    def mock_qapplication(self):
        """Mock QApplication for testing."""
        with patch('application.services.workbench.workbench_clipboard_service.QApplication') as mock_app:
            mock_instance = Mock()
            mock_clipboard = Mock()
            mock_instance.clipboard.return_value = mock_clipboard
            mock_app.instance.return_value = mock_instance
            yield mock_app, mock_instance, mock_clipboard
    
    def test_qt_adapter_initialization_success(self, mock_qapplication):
        """Test Qt adapter initializes successfully."""
        mock_app, mock_instance, mock_clipboard = mock_qapplication
        
        adapter = QtClipboardAdapter()
        
        assert adapter._clipboard is mock_clipboard
        assert adapter.is_available() is True
    
    def test_qt_adapter_initialization_no_qapplication(self):
        """Test Qt adapter initialization without QApplication."""
        with patch('application.services.workbench.workbench_clipboard_service.QApplication') as mock_app:
            mock_app.instance.return_value = None
            
            adapter = QtClipboardAdapter()
            
            assert adapter._clipboard is None
            assert adapter.is_available() is False
    
    def test_qt_adapter_initialization_import_error(self):
        """Test Qt adapter initialization with PyQt6 import error."""
        with patch('application.services.workbench.workbench_clipboard_service.QApplication', side_effect=ImportError("No PyQt6")):
            adapter = QtClipboardAdapter()
            
            assert adapter._clipboard is None
            assert adapter.is_available() is False
    
    def test_qt_adapter_set_text_success(self, mock_qapplication):
        """Test Qt adapter text setting."""
        mock_app, mock_instance, mock_clipboard = mock_qapplication
        
        adapter = QtClipboardAdapter()
        result = adapter.set_text("test text")
        
        assert result is True
        mock_clipboard.setText.assert_called_once_with("test text")
    
    def test_qt_adapter_set_text_no_clipboard(self):
        """Test Qt adapter text setting without clipboard."""
        adapter = QtClipboardAdapter()
        adapter._clipboard = None
        
        result = adapter.set_text("test text")
        
        assert result is False
    
    def test_qt_adapter_set_text_exception(self, mock_qapplication):
        """Test Qt adapter text setting with exception."""
        mock_app, mock_instance, mock_clipboard = mock_qapplication
        mock_clipboard.setText.side_effect = Exception("Qt error")
        
        adapter = QtClipboardAdapter()
        result = adapter.set_text("test text")
        
        assert result is False
    
    def test_qt_adapter_get_text_success(self, mock_qapplication):
        """Test Qt adapter text retrieval."""
        mock_app, mock_instance, mock_clipboard = mock_qapplication
        mock_clipboard.text.return_value = "retrieved text"
        
        adapter = QtClipboardAdapter()
        result = adapter.get_text()
        
        assert result == "retrieved text"
        mock_clipboard.text.assert_called_once()
    
    def test_qt_adapter_get_text_no_clipboard(self):
        """Test Qt adapter text retrieval without clipboard."""
        adapter = QtClipboardAdapter()
        adapter._clipboard = None
        
        result = adapter.get_text()
        
        assert result == ""
    
    def test_qt_adapter_get_text_exception(self, mock_qapplication):
        """Test Qt adapter text retrieval with exception."""
        mock_app, mock_instance, mock_clipboard = mock_qapplication
        mock_clipboard.text.side_effect = Exception("Qt error")
        
        adapter = QtClipboardAdapter()
        result = adapter.get_text()
        
        assert result == ""


class TestMockClipboardAdapter:
    """Test suite for MockClipboardAdapter."""
    
    @pytest.fixture
    def mock_adapter(self):
        """Create mock clipboard adapter for testing."""
        return MockClipboardAdapter()
    
    def test_mock_adapter_initialization(self, mock_adapter):
        """Test mock adapter initializes correctly."""
        assert mock_adapter._clipboard_text == ""
        assert mock_adapter.is_available() is True
    
    def test_mock_adapter_set_text(self, mock_adapter):
        """Test mock adapter text setting."""
        result = mock_adapter.set_text("test text")
        
        assert result is True
        assert mock_adapter._clipboard_text == "test text"
    
    def test_mock_adapter_get_text(self, mock_adapter):
        """Test mock adapter text retrieval."""
        mock_adapter._clipboard_text = "stored text"
        
        result = mock_adapter.get_text()
        
        assert result == "stored text"
    
    def test_mock_adapter_round_trip(self, mock_adapter):
        """Test complete set/get cycle with mock adapter."""
        test_text = "Round trip test"
        
        set_result = mock_adapter.set_text(test_text)
        get_result = mock_adapter.get_text()
        
        assert set_result is True
        assert get_result == test_text
    
    def test_mock_adapter_set_text_exception_handling(self, mock_adapter):
        """Test mock adapter handles text conversion exceptions."""
        # Mock adapters should handle type conversion gracefully
        result = mock_adapter.set_text(12345)
        
        assert result is True
        assert mock_adapter.get_text() == "12345"
    
    def test_mock_adapter_is_always_available(self, mock_adapter):
        """Test mock adapter is always available."""
        assert mock_adapter.is_available() is True


class TestIntegrationWorkflows:
    """Integration tests for complete clipboard workflows."""
    
    def test_complete_clipboard_workflow_with_mock_adapter(self):
        """Test complete clipboard workflow using mock adapter."""
        # Create service with mock adapter
        adapter = MockClipboardAdapter()
        service = WorkbenchClipboardService(clipboard_adapter=adapter)
        
        # Test availability
        assert service.is_clipboard_available() is True
        
        # Test copying text
        copy_success, copy_message = service.copy_text_to_clipboard("Hello, World!")
        assert copy_success is True
        assert "Text copied to clipboard" in copy_message
        
        # Test retrieving text
        get_success, get_result = service.get_clipboard_text()
        assert get_success is True
        assert get_result == "Hello, World!"
        
        # Test statistics
        stats = service.get_clipboard_stats()
        assert stats["adapter_available"] is True
        assert stats["clipboard_available"] is True
    
    def test_clipboard_workflow_without_adapter(self):
        """Test clipboard workflow without adapter."""
        service = WorkbenchClipboardService(clipboard_adapter=None)
        
        # Test availability
        assert service.is_clipboard_available() is False
        
        # Test operations should fail gracefully
        copy_success, copy_message = service.copy_text_to_clipboard("test")
        assert copy_success is False
        assert "Clipboard not available" in copy_message
        
        get_success, get_result = service.get_clipboard_text()
        assert get_success is False
        assert "Clipboard not available" in get_result
    
    def test_clipboard_workflow_with_multiple_operations(self):
        """Test multiple clipboard operations in sequence."""
        adapter = MockClipboardAdapter()
        service = WorkbenchClipboardService(clipboard_adapter=adapter)
        
        test_texts = ["First text", "Second text", "Third text"]
        
        for text in test_texts:
            # Copy text
            copy_success, _ = service.copy_text_to_clipboard(text)
            assert copy_success is True
            
            # Verify text was copied
            get_success, result = service.get_clipboard_text()
            assert get_success is True
            assert result == text
    
    def test_clipboard_service_error_recovery(self):
        """Test clipboard service error recovery."""
        # Create adapter that fails intermittently
        adapter = Mock()
        adapter.is_available.return_value = True
        
        service = WorkbenchClipboardService(clipboard_adapter=adapter)
        
        # First operation fails
        adapter.set_text.return_value = False
        copy_success, _ = service.copy_text_to_clipboard("test")
        assert copy_success is False
        
        # Second operation succeeds
        adapter.set_text.return_value = True
        copy_success, _ = service.copy_text_to_clipboard("test")
        assert copy_success is True


if __name__ == "__main__":
    # Run tests directly
    pytest.main([__file__, "-v"])
