"""
Workbench Export Service Interfaces

Framework-agnostic interfaces for workbench export operations.
These interfaces define contracts for export functionality without
being tied to specific implementations or UI frameworks.
"""

from typing import Protocol, Optional
from domain.models.sequence_data import SequenceData


class IWorkbenchExportService(Protocol):
    """Interface for workbench export operations."""
    
    def export_sequence_image(self, sequence: SequenceData, file_path: Optional[str] = None) -> tuple[bool, str]:
        """
        Export sequence as image file.
        
        Args:
            sequence: Sequence to export
            file_path: Optional specific file path, if None uses default naming
            
        Returns:
            Tuple of (success, message/file_path)
        """
        ...
    
    def export_sequence_json(self, sequence: SequenceData) -> tuple[bool, str]:
        """
        Export sequence as JSON string.
        
        Args:
            sequence: Sequence to export
            
        Returns:
            Tuple of (success, json_string/error_message)
        """
        ...
    
    def get_export_directory(self) -> str:
        """Get the directory where exports are saved."""
        ...
    
    def validate_export_directory(self) -> bool:
        """Validate that export directory exists and is writable."""
        ...


class IWorkbenchClipboardService(Protocol):
    """Interface for workbench clipboard operations."""
    
    def copy_text_to_clipboard(self, text: str) -> tuple[bool, str]:
        """
        Copy text to system clipboard.
        
        Args:
            text: Text to copy
            
        Returns:
            Tuple of (success, message)
        """
        ...
    
    def get_clipboard_text(self) -> tuple[bool, str]:
        """
        Get text from system clipboard.
        
        Returns:
            Tuple of (success, text/error_message)
        """
        ...
    
    def is_clipboard_available(self) -> bool:
        """Check if clipboard is available for operations."""
        ...
