"""
Modern Layout Calculator

This service calculates optimal layouts and dimensions for exported images,
replicating the legacy system's layout logic exactly.
"""

import logging
import math
from typing import Tuple

from core.interfaces.image_export_services import IImageLayoutCalculator

logger = logging.getLogger(__name__)


class ModernLayoutCalculator(IImageLayoutCalculator):
    """
    Modern implementation of layout calculator.
    
    This calculator replicates the legacy system's layout logic exactly,
    ensuring exported images have the same dimensions and proportions.
    """
    
    def __init__(self):
        # Legacy-compatible layout mappings
        # These are the exact mappings used by the legacy system
        self.layout_mappings = {
            1: (1, 1),
            2: (2, 1),
            3: (3, 1),
            4: (2, 2),
            5: (3, 2),
            6: (3, 2),
            7: (4, 2),
            8: (4, 2),
            9: (3, 3),
            10: (4, 3),
            11: (4, 3),
            12: (4, 3),
            13: (5, 3),
            14: (5, 3),
            15: (5, 3),
            16: (4, 4),
            17: (5, 4),
            18: (5, 4),
            19: (5, 4),
            20: (5, 4),
            21: (6, 4),
            22: (6, 4),
            23: (6, 4),
            24: (6, 4),
            25: (5, 5),
        }
        
        logger.info("Modern layout calculator initialized")
    
    def calculate_layout(
        self,
        num_beats: int,
        include_start_position: bool
    ) -> Tuple[int, int]:
        """
        Calculate optimal layout (columns, rows) for the given number of beats.
        
        This replicates the legacy layout calculation logic exactly.
        """
        logger.debug(f"Calculating layout for {num_beats} beats, include_start_position={include_start_position}")
        
        # Adjust beat count if including start position
        total_positions = num_beats
        if include_start_position and num_beats > 0:
            total_positions += 1
        
        # Handle edge cases
        if total_positions <= 0:
            return (1, 1)
        
        # Use predefined mappings for common cases
        if total_positions in self.layout_mappings:
            columns, rows = self.layout_mappings[total_positions]
            logger.debug(f"Using predefined layout: {columns}x{rows} for {total_positions} positions")
            return (columns, rows)
        
        # For larger sequences, calculate dynamically
        columns, rows = self._calculate_dynamic_layout(total_positions)
        
        logger.debug(f"Calculated dynamic layout: {columns}x{rows} for {total_positions} positions")
        return (columns, rows)
    
    def calculate_image_dimensions(
        self,
        columns: int,
        rows: int,
        beat_size: int,
        additional_height: int = 0
    ) -> Tuple[int, int]:
        """
        Calculate image dimensions based on layout.
        
        This replicates the legacy dimension calculation exactly.
        """
        logger.debug(f"Calculating dimensions for {columns}x{rows} layout, beat_size={beat_size}, additional_height={additional_height}")
        
        # Legacy calculation: simple multiplication
        width = columns * beat_size
        height = rows * beat_size + additional_height
        
        # Ensure minimum dimensions
        width = max(width, 300)  # Minimum width
        height = max(height, 300)  # Minimum height
        
        logger.debug(f"Calculated dimensions: {width}x{height}")
        return (width, height)
    
    def _calculate_dynamic_layout(self, total_positions: int) -> Tuple[int, int]:
        """
        Calculate layout dynamically for sequences larger than predefined mappings.
        
        This uses the same algorithm as the legacy system for consistency.
        """
        # Legacy algorithm: try to create a roughly square layout
        # with a slight preference for wider layouts
        
        # Start with square root as base
        sqrt_positions = math.sqrt(total_positions)
        
        # Try different column counts around the square root
        best_columns = int(sqrt_positions)
        best_rows = math.ceil(total_positions / best_columns)
        best_aspect_ratio = abs(best_columns / best_rows - 1.0)  # Closer to 1.0 is more square
        
        # Test nearby column counts
        for test_columns in range(max(1, best_columns - 2), best_columns + 3):
            test_rows = math.ceil(total_positions / test_columns)
            
            # Skip if this creates too many empty positions
            if test_columns * test_rows - total_positions > test_columns:
                continue
            
            # Calculate aspect ratio (prefer slightly wider layouts)
            aspect_ratio = test_columns / test_rows
            aspect_ratio_score = abs(aspect_ratio - 1.2)  # Prefer 1.2:1 ratio (slightly wider)
            
            # Update if this is better
            if aspect_ratio_score < best_aspect_ratio:
                best_columns = test_columns
                best_rows = test_rows
                best_aspect_ratio = aspect_ratio_score
        
        return (best_columns, best_rows)
    
    def get_layout_for_sequence_length(self, sequence_length: int) -> Tuple[int, int]:
        """
        Get the standard layout for a given sequence length.
        
        This is a convenience method that uses the most common settings.
        """
        return self.calculate_layout(sequence_length, include_start_position=True)
    
    def calculate_beat_positions(
        self,
        num_beats: int,
        columns: int,
        rows: int,
        beat_size: int,
        margin: int = 10
    ) -> list[Tuple[int, int]]:
        """
        Calculate the pixel positions for each beat in the layout.
        
        Returns a list of (x, y) coordinates for each beat position.
        """
        positions = []
        
        for i in range(num_beats):
            row = i // columns
            col = i % columns
            
            x = margin + col * (beat_size + margin)
            y = margin + row * (beat_size + margin)
            
            positions.append((x, y))
        
        return positions
    
    def calculate_optimal_beat_size(
        self,
        target_width: int,
        target_height: int,
        columns: int,
        rows: int,
        additional_height: int = 0
    ) -> int:
        """
        Calculate optimal beat size to fit within target dimensions.
        
        This is useful for creating images that fit specific size constraints.
        """
        # Calculate available space
        available_width = target_width
        available_height = target_height - additional_height
        
        # Calculate beat size based on constraints
        beat_size_by_width = available_width // columns
        beat_size_by_height = available_height // rows
        
        # Use the smaller constraint to ensure everything fits
        optimal_beat_size = min(beat_size_by_width, beat_size_by_height)
        
        # Ensure minimum beat size
        optimal_beat_size = max(optimal_beat_size, 100)
        
        logger.debug(f"Calculated optimal beat size: {optimal_beat_size} for target {target_width}x{target_height}")
        return optimal_beat_size
    
    def validate_layout(self, columns: int, rows: int, num_beats: int) -> bool:
        """
        Validate that a layout can accommodate the required number of beats.
        
        Returns True if the layout is valid, False otherwise.
        """
        total_positions = columns * rows
        return total_positions >= num_beats
    
    def get_layout_efficiency(self, columns: int, rows: int, num_beats: int) -> float:
        """
        Calculate layout efficiency (how well the layout uses available space).
        
        Returns a value between 0.0 and 1.0, where 1.0 means perfect efficiency.
        """
        if columns <= 0 or rows <= 0:
            return 0.0
        
        total_positions = columns * rows
        if total_positions == 0:
            return 0.0
        
        efficiency = num_beats / total_positions
        return min(1.0, efficiency)  # Cap at 1.0
