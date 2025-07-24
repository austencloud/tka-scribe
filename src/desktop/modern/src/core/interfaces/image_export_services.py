"""
Core interfaces for image export services.

This module defines the interfaces for image export functionality in the modern TKA system.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from pathlib import Path

from PyQt6.QtGui import QImage


@dataclass
class ImageExportOptions:
    """Configuration options for image export."""
    
    # Visual elements to include
    add_word: bool = True
    add_user_info: bool = True
    add_difficulty_level: bool = True
    add_date: bool = True
    add_note: bool = True
    add_beat_numbers: bool = True
    add_reversal_symbols: bool = True
    include_start_position: bool = True
    combined_grids: bool = False
    
    # User information
    user_name: str = "Unknown"
    export_date: str = ""
    notes: str = "Created using The Kinetic Alphabet"
    
    # Image quality settings
    png_compression: int = 1  # 0-9, lower is better quality
    high_quality: bool = True
    
    # Additional height for text elements
    additional_height_top: int = 0
    additional_height_bottom: int = 0


@dataclass
class ExportResult:
    """Result of an image export operation."""
    
    success: bool
    output_path: Optional[Path] = None
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ExportProgress:
    """Progress information for export operations."""
    
    current: int
    total: int
    message: str
    percentage: float = 0.0
    
    def __post_init__(self):
        if self.total > 0:
            self.percentage = (self.current / self.total) * 100


class IImageExportService(ABC):
    """Interface for image export services."""
    
    @abstractmethod
    def export_sequence_image(
        self,
        sequence_data: List[Dict[str, Any]],
        word: str,
        output_path: Path,
        options: ImageExportOptions
    ) -> ExportResult:
        """
        Export a single sequence as an image.
        
        Args:
            sequence_data: The sequence data to export
            word: The word associated with the sequence
            output_path: Where to save the exported image
            options: Export configuration options
            
        Returns:
            ExportResult with success status and details
        """
        pass
    
    @abstractmethod
    def export_all_sequences(
        self,
        source_directory: Path,
        export_directory: Path,
        options: ImageExportOptions,
        progress_callback: Optional[callable] = None
    ) -> Dict[str, Any]:
        """
        Export all sequences from a directory.
        
        Args:
            source_directory: Directory containing sequence files
            export_directory: Directory to export images to
            options: Export configuration options
            progress_callback: Optional callback for progress updates
            
        Returns:
            Dictionary with export statistics and results
        """
        pass
    
    @abstractmethod
    def create_sequence_image(
        self,
        sequence_data: List[Dict[str, Any]],
        word: str,
        options: ImageExportOptions
    ) -> QImage:
        """
        Create a QImage from sequence data.
        
        Args:
            sequence_data: The sequence data to render
            word: The word associated with the sequence
            options: Export configuration options
            
        Returns:
            QImage containing the rendered sequence
        """
        pass


class IImageRenderer(ABC):
    """Interface for image rendering components."""
    
    @abstractmethod
    def render_sequence_beats(
        self,
        image: QImage,
        sequence_data: List[Dict[str, Any]],
        options: ImageExportOptions
    ) -> None:
        """Render sequence beats onto the image."""
        pass
    
    @abstractmethod
    def render_word(
        self,
        image: QImage,
        word: str,
        options: ImageExportOptions
    ) -> None:
        """Render the word text onto the image."""
        pass
    
    @abstractmethod
    def render_user_info(
        self,
        image: QImage,
        options: ImageExportOptions
    ) -> None:
        """Render user information onto the image."""
        pass
    
    @abstractmethod
    def render_difficulty_level(
        self,
        image: QImage,
        difficulty_level: int,
        options: ImageExportOptions
    ) -> None:
        """Render difficulty level indicator onto the image."""
        pass


class ISequenceMetadataExtractor(ABC):
    """Interface for extracting metadata from sequence files."""
    
    @abstractmethod
    def extract_sequence_data(self, file_path: Path) -> Optional[List[Dict[str, Any]]]:
        """Extract sequence data from a file."""
        pass
    
    @abstractmethod
    def extract_metadata(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Extract metadata from a sequence file."""
        pass
    
    @abstractmethod
    def get_difficulty_level(self, sequence_data: List[Dict[str, Any]]) -> int:
        """Calculate difficulty level for a sequence."""
        pass


class IImageLayoutCalculator(ABC):
    """Interface for calculating image layout dimensions."""
    
    @abstractmethod
    def calculate_layout(
        self,
        num_beats: int,
        include_start_position: bool
    ) -> tuple[int, int]:
        """
        Calculate optimal layout (columns, rows) for the given number of beats.
        
        Args:
            num_beats: Number of beats in the sequence
            include_start_position: Whether to include start position
            
        Returns:
            Tuple of (columns, rows)
        """
        pass
    
    @abstractmethod
    def calculate_image_dimensions(
        self,
        columns: int,
        rows: int,
        beat_size: int,
        additional_height: int = 0
    ) -> tuple[int, int]:
        """
        Calculate image dimensions based on layout.
        
        Args:
            columns: Number of columns
            rows: Number of rows
            beat_size: Size of each beat in pixels
            additional_height: Additional height for text elements
            
        Returns:
            Tuple of (width, height)
        """
        pass
