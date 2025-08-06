from __future__ import annotations

"""
Thumbnail Size Calculator - Handles size calculations for different view modes.

Extracted from ThumbnailImageLabel to follow Single Responsibility Principle.
"""

import logging
from typing import TYPE_CHECKING

from PyQt6.QtCore import QSize

if TYPE_CHECKING:
    from ..thumbnail_box import ThumbnailBox


class ThumbnailSizeCalculator:
    """
    Calculates thumbnail sizes for different view modes and contexts.

    Responsibilities:
    - Calculate target sizes based on view mode
    - Handle sequence viewer vs browse mode sizing
    - Manage aspect ratio considerations
    - Provide consistent sizing logic
    """

    # No hard-coded size constants - all sizing calculated dynamically

    def __init__(self, thumbnail_box: ThumbnailBox):
        self.thumbnail_box = thumbnail_box
        self.logger = logging.getLogger(__name__)

    def calculate_target_size(self, is_sequence_viewer: bool) -> QSize:
        """
        Calculate the target size for thumbnail processing.

        Args:
            is_sequence_viewer: Whether in sequence viewer mode

        Returns:
            Target QSize for thumbnail processing
        """
        try:
            if is_sequence_viewer:
                return self._calculate_sequence_viewer_size()
            else:
                return self._calculate_browse_mode_size()

        except Exception as e:
            self.logger.warning(f"Error calculating target size: {e}")
            # Emergency fallback
            return QSize(140, 140)

    def _calculate_sequence_viewer_size(self) -> QSize:
        """
        Calculate size for sequence viewer mode based on container space.

        Returns:
            QSize optimized for sequence viewer that fills container
        """
        try:
            # Get the thumbnail box container size
            container_size = self.thumbnail_box.size()

            # If container is not ready, try to get parent container size
            if container_size.width() <= 1 or container_size.height() <= 1:
                parent = self.thumbnail_box.parent()
                if parent:
                    container_size = parent.size()
                    self.logger.debug(
                        f"Using parent container size for sequence viewer: {container_size}"
                    )

            # Use the container width and height, with minimal padding
            padding = 10  # Small padding for sequence viewer
            available_width = max(container_size.width() - padding, 50)
            available_height = max(container_size.height() - padding, 50)

            # Use the smaller dimension to maintain square aspect ratio
            size = min(available_width, available_height)

            # Ensure reasonable minimum size
            size = max(size, 50)

            calculated_size = QSize(size, size)
            self.logger.debug(
                f"Calculated sequence viewer size: {calculated_size} from container: {container_size}"
            )

            return calculated_size

        except Exception as e:
            self.logger.error(f"Error calculating sequence viewer size: {e}")
            # Emergency fallback - use reasonable minimum
            return QSize(100, 100)

    def _calculate_browse_mode_size(self) -> QSize:
        """
        Calculate size for browse mode using modern responsive approach.
        Based on modern app's 3-column grid calculation.

        Returns:
            QSize calculated from container space using 3-column grid logic
        """
        try:
            # Get the scroll widget to calculate available space (like modern app)
            scroll_widget = self.thumbnail_box.sequence_picker.scroll_widget
            available_width = scroll_widget.width()

            # Use modern app's calculation approach
            scrollbar_width = scroll_widget.calculate_scrollbar_width()
            content_margins = 40  # Content margins
            grid_margins = 30  # Grid margins

            usable_width = (
                available_width - scrollbar_width - content_margins - grid_margins
            )
            grid_spacing = 15 * 2  # 2 spaces between 3 columns
            width_per_column = (usable_width - grid_spacing) // 3

            # Use minimum of 150px as fallback (like modern app)
            thumbnail_width = max(150, width_per_column)

            # For thumbnails, use square aspect ratio
            thumbnail_height = thumbnail_width

            # Leave small padding inside the thumbnail container for the image
            image_padding = 10
            image_width = max(50, thumbnail_width - image_padding)
            image_height = max(50, thumbnail_height - image_padding)

            # Ensure integers for QSize
            calculated_size = QSize(int(image_width), int(image_height))

            # DETAILED DEBUG LOGGING
            self.logger.info("🔍 MODERN BROWSE MODE SIZE CALCULATION:")
            self.logger.info(f"  � Available width: {available_width}px")
            self.logger.info(f"  � Scrollbar width: {scrollbar_width}px")
            self.logger.info(f"  📐 Usable width: {usable_width}px")
            self.logger.info(f"  📊 Width per column: {width_per_column}px")
            self.logger.info(
                f"  📦 Thumbnail container: {thumbnail_width}x{thumbnail_height}px"
            )
            self.logger.info(f"  �️ Image size: {image_width}x{image_height}px")

            return calculated_size

        except Exception as e:
            self.logger.error(f"Error calculating browse mode size: {e}")
            # Emergency fallback - use reasonable minimum
            return QSize(140, 140)  # 150 - 10 padding

    def calculate_display_size(
        self, target_size: QSize, available_size: QSize
    ) -> QSize:
        """
        Calculate the actual display size within available space.

        Args:
            target_size: Desired target size
            available_size: Available space for display

        Returns:
            Actual display size that fits within available space
        """
        try:
            # Ensure thumbnail fits within available space
            scale_w = available_size.width() / target_size.width()
            scale_h = available_size.height() / target_size.height()
            scale = min(scale_w, scale_h, 1.0)  # Don't scale up

            display_size = QSize(
                int(target_size.width() * scale), int(target_size.height() * scale)
            )

            return self._clamp_size(display_size)

        except Exception as e:
            self.logger.warning(f"Error calculating display size: {e}")
            return target_size

    def calculate_aspect_ratio_size(
        self, original_size: QSize, target_size: QSize
    ) -> QSize:
        """
        Calculate size maintaining aspect ratio within target bounds.

        Args:
            original_size: Original image size
            target_size: Target bounds

        Returns:
            Size that maintains aspect ratio within target bounds
        """
        try:
            if original_size.width() == 0 or original_size.height() == 0:
                return target_size

            aspect_ratio = original_size.width() / original_size.height()
            target_aspect = target_size.width() / target_size.height()

            if aspect_ratio > target_aspect:
                # Image is wider - fit to width
                new_width = target_size.width()
                new_height = int(target_size.width() / aspect_ratio)
            else:
                # Image is taller - fit to height
                new_height = target_size.height()
                new_width = int(target_size.height() * aspect_ratio)

            return self._clamp_size(QSize(new_width, new_height))

        except Exception as e:
            self.logger.warning(f"Error calculating aspect ratio size: {e}")
            return target_size

    def get_grid_cell_size(
        self, container_width: int, columns: int, spacing: int = 10
    ) -> QSize:
        """
        Calculate cell size for grid layout.

        Args:
            container_width: Width of the container
            columns: Number of columns in grid
            spacing: Spacing between items

        Returns:
            Size for each grid cell
        """
        try:
            if columns <= 0:
                columns = 1

            # Calculate available width per column
            total_spacing = spacing * (columns - 1)
            available_width = container_width - total_spacing
            cell_width = max(available_width // columns, self.MINIMUM_SIZE.width())

            # Use square cells for thumbnails
            cell_height = cell_width

            return self._clamp_size(QSize(cell_width, cell_height))

        except Exception as e:
            self.logger.warning(f"Error calculating grid cell size: {e}")
            return self.BROWSE_MODE_SIZE

    def _clamp_size(self, size: QSize) -> QSize:
        """
        Clamp size to minimum and maximum bounds.

        Args:
            size: Size to clamp

        Returns:
            Clamped size within bounds
        """
        width = max(
            self.MINIMUM_SIZE.width(), min(size.width(), self.MAXIMUM_SIZE.width())
        )
        height = max(
            self.MINIMUM_SIZE.height(), min(size.height(), self.MAXIMUM_SIZE.height())
        )

        return QSize(width, height)
