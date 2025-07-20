"""
Sequence Card Layout Service Implementation

Handles layout calculations and responsive design.
"""

import logging
from typing import Tuple

from core.interfaces.sequence_card_services import ISequenceCardLayoutService, GridDimensions

logger = logging.getLogger(__name__)


class SequenceCardLayoutService(ISequenceCardLayoutService):
    """Implementation of sequence card layout calculations."""
    
    # Grid mappings from legacy system - EXACT replication
    GRID_MAPPINGS = {
        2: (3, 2),   # 3 columns, 2 rows
        3: (3, 2),   # 3 columns, 2 rows  
        4: (10, 2),  # 10 columns, 2 rows
        5: (2, 3),   # 2 columns, 3 rows
        6: (2, 3),   # 2 columns, 3 rows
        8: (5, 2),   # 5 columns, 2 rows
        10: (4, 3),  # 4 columns, 3 rows
        12: (4, 3),  # 4 columns, 3 rows
        16: (3, 2),  # 3 columns, 2 rows
    }
    
    def calculate_grid_dimensions(self, sequence_length: int) -> GridDimensions:
        """Calculate optimal grid dimensions for sequence length."""
        if sequence_length in self.GRID_MAPPINGS:
            cols, rows = self.GRID_MAPPINGS[sequence_length]
            return GridDimensions(
                columns=cols,
                rows=rows,
                total_positions=cols * rows
            )
        else:
            # Default fallback for unknown lengths
            logger.warning(f"Unknown sequence length {sequence_length}, using default grid")
            return GridDimensions(columns=4, rows=4, total_positions=16)
    
    def calculate_page_size(self, available_width: int, column_count: int) -> Tuple[int, int]:
        """Calculate optimal page size."""
        # Account for margins and spacing - exact legacy behavior
        margin = 20
        spacing = 10
        
        # Calculate page width
        available_for_pages = available_width - (2 * margin)
        total_spacing = (column_count - 1) * spacing
        page_width = max(200, (available_for_pages - total_spacing) // column_count)
        
        # Maintain aspect ratio (pages are typically wider than tall)
        # Legacy system uses approximately 0.7 ratio
        page_height = int(page_width * 0.7)
        
        return page_width, page_height
    
    def calculate_scale_factor(self, original_size: Tuple[int, int], target_size: Tuple[int, int]) -> float:
        """Calculate appropriate scale factor."""
        orig_width, orig_height = original_size
        target_width, target_height = target_size
        
        if orig_width <= 0 or orig_height <= 0:
            return 1.0
        
        # Calculate scale factors for both dimensions
        width_scale = target_width / orig_width
        height_scale = target_height / orig_height
        
        # Use the smaller scale to ensure image fits
        scale_factor = min(width_scale, height_scale)
        
        # Ensure scale factor is reasonable (not too small or too large)
        return max(0.1, min(scale_factor, 5.0))
