"""
Browse Service Interfaces

Interfaces for browse-related services following clean architecture patterns.
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional

from PyQt6.QtWidgets import QWidget


class ISequenceDeletionService(ABC):
    """Interface for sequence deletion service."""
    
    @abstractmethod
    def delete_variation(
        self, 
        word: str, 
        thumbnails: List[str], 
        variation_index: int,
        parent_widget: Optional[QWidget] = None
    ) -> bool:
        """
        Delete a specific variation of a sequence.
        
        Args:
            word: The sequence word/name
            thumbnails: List of thumbnail file paths
            variation_index: Index of variation to delete
            parent_widget: Parent widget for dialogs
            
        Returns:
            True if deletion was successful, False if cancelled or failed
        """
        pass
    
    @abstractmethod
    def delete_entire_sequence(
        self, 
        word: str, 
        parent_widget: Optional[QWidget] = None
    ) -> bool:
        """
        Delete an entire sequence (all variations).
        
        Args:
            word: The sequence word/name to delete
            parent_widget: Parent widget for dialogs
            
        Returns:
            True if deletion was successful, False if cancelled or failed
        """
        pass
