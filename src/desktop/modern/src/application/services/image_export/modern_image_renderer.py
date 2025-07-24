"""
Modern Image Renderer

This service handles rendering visual elements onto exported images,
replicating the legacy system's visual output exactly.
"""

import logging
from typing import Any, Dict, List, Optional

from application.services.data.pictograph_factory import PictographFactory
from core.interfaces.image_export_services import IImageRenderer, ImageExportOptions
from domain.models.enums import GridMode
from domain.models.pictograph_data import PictographData
from presentation.components.pictograph.pictograph_scene import PictographScene
from PyQt6.QtCore import QPoint, QRect, QRectF, Qt
from PyQt6.QtGui import (
    QBrush,
    QColor,
    QFont,
    QFontMetrics,
    QImage,
    QLinearGradient,
    QPainter,
    QPen,
    QPixmap,
)
from PyQt6.QtWidgets import QGraphicsView

logger = logging.getLogger(__name__)


class ModernImageRenderer(IImageRenderer):
    """
    Modern implementation of image renderer.

    This renderer replicates the legacy system's visual output exactly,
    including fonts, colors, positioning, and styling.
    """

    def __init__(self, container=None):
        # Legacy-compatible font settings (exact base sizes from legacy)
        self.word_font = QFont("Georgia", 175, QFont.Weight.DemiBold, False)
        self.user_info_font_bold = QFont("Georgia", 50, QFont.Weight.Bold)
        self.user_info_font_normal = QFont("Georgia", 50, QFont.Weight.Normal)

        # Legacy-compatible styling
        self.base_margin = 50
        self.border_width = 3
        self.kerning = 20

        # Pictograph rendering components
        self.pictograph_factory = PictographFactory()
        self.pictograph_size = 280  # Size for each pictograph in the grid

        # Store container reference for pictograph services
        self.container = container

        logger.info("Modern image renderer initialized")

    def _adjust_font_and_margin_legacy(
        self,
        base_font: QFont,
        num_filled_beats: int,
        base_margin: int,
        beat_scale: float = 1.0,
    ):
        """
        Adjust font and margin based on number of beats - exact legacy logic.

        This replicates the legacy FontMarginHelper.adjust_font_and_margin method.
        """
        # Get the base font size, ensuring it's at least 1
        base_font_size = max(1, base_font.pointSize())

        if num_filled_beats <= 1:
            font_size = max(1, int(base_font_size / 2.3))
            margin = max(1, base_margin // 3)
        elif num_filled_beats == 2:
            font_size = max(1, int(base_font_size / 1.5))
            margin = max(1, base_margin // 2)
        else:
            font_size = base_font_size
            margin = base_margin

        # Ensure the scaled font size is at least 1
        scaled_font_size = max(1, int(font_size * beat_scale))

        adjusted_font = QFont(
            base_font.family(),
            scaled_font_size,
            base_font.weight(),
            base_font.italic(),
        )

        return adjusted_font, margin

    def render_sequence_beats(
        self,
        image: QImage,
        sequence_data: List[Dict[str, Any]],
        options: ImageExportOptions,
        beat_size: int = None,
    ) -> None:
        """Render sequence beats onto the image using modern pictograph system."""
        logger.debug(f"Rendering {len(sequence_data)} sequence beats")

        if not sequence_data:
            logger.debug("No sequence data to render")
            return

        painter = QPainter(image)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)

        # Calculate grid layout
        num_beats = len(sequence_data)
        cols = min(4, num_beats)
        rows = (num_beats + cols - 1) // cols

        margin = 10
        # Use provided beat_size or fall back to default
        if beat_size is None:
            beat_size = self.pictograph_size

        # Render start position if enabled
        start_index = 0
        if options.include_start_position:
            start_index = 1
            self._render_start_position(
                painter,
                margin,
                options.additional_height_top,  # Fixed: Remove extra margin to match legacy
                beat_size,
                options,
            )

        # Render each beat
        for i, beat_data in enumerate(sequence_data):
            # Calculate position in grid (accounting for start position)
            grid_index = i + start_index
            row = grid_index // cols
            col = grid_index % cols

            x = margin + col * (beat_size + margin)
            # Fixed: Remove extra margin from Y positioning to match legacy behavior
            # Legacy: y = row * beat_size + additional_height_top
            # Modern was: y = additional_height_top + margin + row * (beat_size + margin)
            y = options.additional_height_top + row * beat_size

            # Render the actual pictograph
            self._render_single_beat(
                painter, beat_data, x, y, beat_size, i + 1, options
            )

        painter.end()
        logger.debug("Sequence beats rendered")

    def render_word(
        self,
        image: QImage,
        word: str,
        options: ImageExportOptions,
        num_filled_beats: int = 0,
    ) -> None:
        """Render the word text onto the image using legacy scaling."""
        logger.debug(f"Rendering word: '{word}' for {num_filled_beats} beats")

        # Calculate beat scale based on beat size (legacy logic)
        # Legacy uses beat_scale = 1.0, but the actual scaling comes from beat_size
        # We need to calculate beat_scale based on the ratio to a reference size
        reference_beat_size = 280  # Reference size (modern default)
        actual_beat_size = getattr(options, "beat_size", reference_beat_size)
        beat_scale = actual_beat_size / reference_beat_size

        # Apply legacy font and margin adjustment
        font, margin = self._adjust_font_and_margin_legacy(
            self.word_font, num_filled_beats, self.base_margin, beat_scale
        )

        # Adjust kerning with beat scale
        kerning = int(self.kerning * beat_scale)

        painter = QPainter(image)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setRenderHint(QPainter.RenderHint.TextAntialiasing)
        painter.setFont(font)

        # Calculate text dimensions
        metrics = QFontMetrics(font)
        text_width = metrics.horizontalAdvance(word)
        text_height = metrics.ascent()

        # Adjust font size if text is too wide (legacy behavior)
        while text_width + 2 * margin > image.width() - (image.width() // 4):
            font_size = font.pointSize() - 1
            if font_size <= 10:
                break
            font = QFont(font.family(), font_size, font.weight(), font.italic())
            painter.setFont(font)
            metrics = QFontMetrics(font)
            text_width = metrics.horizontalAdvance(word)
            text_height = metrics.ascent()

        # Calculate position (legacy positioning logic)
        y = (
            (options.additional_height_top // 2 + text_height // 2)
            - (text_height // 10)
            + self.border_width
        )
        x = (image.width() - text_width - kerning * (len(word) - 1)) // 2

        # Draw each letter with kerning (legacy behavior)
        painter.setPen(QPen(Qt.GlobalColor.black))
        for letter in word:
            painter.drawText(x, y, letter)
            x += metrics.horizontalAdvance(letter) + kerning

        painter.end()
        logger.debug(f"Word '{word}' rendered")

    def render_user_info(
        self, image: QImage, options: ImageExportOptions, num_filled_beats: int = 0
    ) -> None:
        """Render user information onto the image using legacy scaling."""
        logger.debug("Rendering user info")

        # Calculate beat scale based on beat size (legacy logic)
        # Legacy uses beat_scale = 1.0, but the actual scaling comes from beat_size
        # We need to calculate beat_scale based on the ratio to a reference size
        reference_beat_size = 280  # Reference size (modern default)
        actual_beat_size = getattr(options, "beat_size", reference_beat_size)
        beat_scale = actual_beat_size / reference_beat_size

        # Apply legacy font and margin adjustment for both fonts
        font_bold, margin = self._adjust_font_and_margin_legacy(
            self.user_info_font_bold, num_filled_beats, self.base_margin, beat_scale
        )
        font_normal, _ = self._adjust_font_and_margin_legacy(
            self.user_info_font_normal, num_filled_beats, self.base_margin, beat_scale
        )

        painter = QPainter(image)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setRenderHint(QPainter.RenderHint.TextAntialiasing)

        # Format export date (legacy format)
        export_date = self._format_export_date(options.export_date)

        # Calculate text widths with adjusted fonts
        metrics_normal = QFontMetrics(font_normal)
        date_width = metrics_normal.horizontalAdvance(export_date)
        notes_width = metrics_normal.horizontalAdvance(options.notes)

        # Draw user name (bottom-left)
        self._draw_text_at_position(
            painter, image, options.user_name, font_bold, margin, "bottom-left"
        )

        # Draw notes (bottom-center)
        self._draw_text_at_position(
            painter,
            image,
            options.notes,
            font_normal,
            margin,
            "bottom-center",
            notes_width,
        )

        # Draw export date (bottom-right)
        self._draw_text_at_position(
            painter, image, export_date, font_normal, margin, "bottom-right", date_width
        )

        painter.end()
        logger.debug("User info rendered")

    def render_difficulty_level(
        self, image: QImage, difficulty_level: int, options: ImageExportOptions
    ) -> None:
        """Render difficulty level indicator onto the image."""
        logger.debug(f"Rendering difficulty level: {difficulty_level}")

        painter = QPainter(image)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        # Calculate circle dimensions (legacy behavior)
        shape_size = int(options.additional_height_top * 0.75)
        inset = options.additional_height_top // 8
        rect = QRect(
            inset + self.border_width, inset + self.border_width, shape_size, shape_size
        )

        # Set up pen
        pen = QPen(Qt.GlobalColor.black, max(1, rect.height() // 50))
        painter.setPen(pen)

        # Create gradient based on difficulty level (legacy colors)
        gradient = self._create_difficulty_gradient(rect, difficulty_level)
        painter.setBrush(QBrush(gradient))

        # Draw circle
        painter.drawEllipse(rect)

        # Draw difficulty number
        font_size = int(rect.height() // 1.75)
        font = QFont("Georgia", font_size, QFont.Weight.Bold)
        painter.setFont(font)

        painter.setPen(Qt.GlobalColor.black)
        painter.drawText(rect, Qt.AlignmentFlag.AlignCenter, str(difficulty_level))

        painter.end()
        logger.debug(f"Difficulty level {difficulty_level} rendered")

    def _format_export_date(self, date_str: str) -> str:
        """Format export date in legacy format."""
        if not date_str:
            from datetime import datetime

            date_str = datetime.now().strftime("%m-%d-%Y")

        # Legacy format: remove leading zeros
        return "-".join([str(int(part)) for part in date_str.split("-")])

    def _draw_text_at_position(
        self,
        painter: QPainter,
        image: QImage,
        text: str,
        font: QFont,
        margin: int,
        position: str,
        text_width: int = None,
    ) -> None:
        """Draw text at the specified position (legacy positioning)."""
        painter.setFont(font)

        if not text_width:
            metrics = QFontMetrics(font)
            text_width = metrics.horizontalAdvance(text)

        # Calculate position based on legacy logic
        if position == "bottom-left":
            x = margin + self.border_width
            y = image.height() - margin - self.border_width
        elif position == "bottom-center":
            x = (image.width() - text_width) // 2
            y = image.height() - margin - self.border_width
        elif position == "bottom-right":
            x = image.width() - text_width - margin - self.border_width
            y = image.height() - margin - self.border_width
        else:
            return

        painter.setPen(QPen(Qt.GlobalColor.black))
        painter.drawText(x, y, text)

    def _create_difficulty_gradient(
        self, rect: QRect, difficulty_level: int
    ) -> QLinearGradient:
        """Create gradient for difficulty level indicator (legacy colors)."""
        gradient = QLinearGradient(
            float(rect.left()),
            float(rect.top()),
            float(rect.right()),
            float(rect.bottom()),
        )

        # Legacy difficulty colors
        if difficulty_level == 1:
            gradient.setColorAt(0, QColor(144, 238, 144))  # Light green
            gradient.setColorAt(1, QColor(0, 128, 0))  # Dark green
        elif difficulty_level == 2:
            gradient.setColorAt(0, QColor(255, 255, 0))  # Yellow
            gradient.setColorAt(1, QColor(255, 215, 0))  # Gold
        elif difficulty_level == 3:
            gradient.setColorAt(0, QColor(255, 165, 0))  # Orange
            gradient.setColorAt(1, QColor(255, 140, 0))  # Dark orange
        elif difficulty_level == 4:
            gradient.setColorAt(0, QColor(255, 99, 71))  # Tomato
            gradient.setColorAt(1, QColor(220, 20, 60))  # Crimson
        else:  # difficulty_level >= 5
            gradient.setColorAt(0, QColor(139, 0, 0))  # Dark red
            gradient.setColorAt(1, QColor(75, 0, 130))  # Indigo

        return gradient

    def _render_start_position(
        self, painter: QPainter, x: int, y: int, size: int, options: ImageExportOptions
    ) -> None:
        """Render the start position pictograph."""
        try:
            # Create a simple start position entry
            start_entry = {
                "letter": "α",  # Alpha symbol for start
                "start_pos": "alpha",
                "end_pos": "alpha",
                "blue_attributes": {"motion": "static"},
                "red_attributes": {"motion": "static"},
            }

            # Convert to pictograph data
            start_pictograph_data = self._convert_beat_data_to_pictograph(start_entry)

            if start_pictograph_data:
                # Render the pictograph
                self._render_pictograph_to_painter(
                    painter, start_pictograph_data, x, y, size
                )

            # Add "START" text overlay if beat numbers are enabled
            if options.add_beat_numbers:
                self._add_text_overlay(painter, "START", x, y, size)

        except Exception as e:
            logger.warning(f"Error rendering start position: {e}")
            # Fallback: draw a simple placeholder
            self._draw_placeholder_beat(painter, x, y, size, "START")

    def _render_single_beat(
        self,
        painter: QPainter,
        beat_data: Dict[str, Any],
        x: int,
        y: int,
        size: int,
        beat_number: int,
        options: ImageExportOptions,
    ) -> None:
        """Render a single beat pictograph."""
        try:
            # Convert beat data to pictograph data
            pictograph_data = self._convert_beat_data_to_pictograph(beat_data)

            if pictograph_data:
                # Render the actual pictograph
                self._render_pictograph_to_painter(painter, pictograph_data, x, y, size)

                # Add beat number if enabled
                if options.add_beat_numbers:
                    self._add_text_overlay(painter, str(beat_number), x, y, size)
            else:
                # Fallback: draw placeholder
                self._draw_placeholder_beat(painter, x, y, size, str(beat_number))

        except Exception as e:
            logger.warning(f"Error rendering beat {beat_number}: {e}")
            # Fallback: draw placeholder
            self._draw_placeholder_beat(painter, x, y, size, str(beat_number))

    def _convert_beat_data_to_pictograph(
        self, beat_data: Dict[str, Any]
    ) -> Optional[PictographData]:
        """Convert sequence beat data to PictographData."""
        try:
            # Create entry format expected by pictograph factory
            entry = {
                "letter": beat_data.get("letter", "?"),
                "start_pos": beat_data.get(
                    "start_pos", beat_data.get("start_position", "")
                ),
                "end_pos": beat_data.get("end_pos", beat_data.get("end_position", "")),
                "blue_attributes": beat_data.get("blue_attributes", {}),
                "red_attributes": beat_data.get("red_attributes", {}),
            }

            # Use pictograph factory to create pictograph data
            return self.pictograph_factory.create_pictograph_data_from_entry(
                entry, "diamond"
            )

        except Exception as e:
            logger.warning(f"Error converting beat data to pictograph: {e}")
            return None

    def _render_pictograph_to_painter(
        self,
        painter: QPainter,
        pictograph_data: PictographData,
        x: int,
        y: int,
        size: int,
    ) -> None:
        """Render a REAL pictograph to the painter at the specified position."""
        try:
            # Try to render the REAL pictograph using the modern pictograph system
            if self._render_real_pictograph(painter, pictograph_data, x, y, size):
                return

            # Fallback to simplified if real rendering fails
            logger.debug("Falling back to simplified pictograph rendering")
            self._render_simplified_pictograph(painter, pictograph_data, x, y, size)

        except Exception as e:
            logger.warning(f"Error rendering pictograph to painter: {e}")
            # Final fallback: draw placeholder
            self._draw_placeholder_beat(painter, x, y, size, "?")

    def _draw_placeholder_beat(
        self, painter: QPainter, x: int, y: int, size: int, text: str
    ) -> None:
        """Draw a placeholder beat rectangle with text."""
        rect = QRect(x, y, size, size)
        painter.setPen(QPen(Qt.GlobalColor.black, 2))
        painter.setBrush(QBrush(Qt.GlobalColor.lightGray))
        painter.drawRect(rect)

        # Draw text
        painter.setPen(QPen(Qt.GlobalColor.black))
        painter.setFont(QFont("Arial", 12, QFont.Weight.Bold))
        painter.drawText(rect, Qt.AlignmentFlag.AlignCenter, text)

    def _add_text_overlay(
        self, painter: QPainter, text: str, x: int, y: int, size: int
    ) -> None:
        """Add text overlay to a pictograph (for beat numbers or START text)."""
        # Position text in top-left corner of the pictograph
        text_rect = QRect(x + 5, y + 5, size // 3, 20)

        # Draw background for better readability
        painter.fillRect(text_rect, QBrush(QColor(255, 255, 255, 200)))

        # Draw text
        painter.setPen(QPen(Qt.GlobalColor.black))
        painter.setFont(QFont("Arial", 10, QFont.Weight.Bold))
        painter.drawText(text_rect, Qt.AlignmentFlag.AlignCenter, text)

    def _render_simplified_pictograph(
        self,
        painter: QPainter,
        pictograph_data: PictographData,
        x: int,
        y: int,
        size: int,
    ) -> None:
        """Render a simplified pictograph representation."""
        # Draw a white background with border
        rect = QRect(x, y, size, size)
        painter.setPen(QPen(Qt.GlobalColor.black, 2))
        painter.setBrush(QBrush(Qt.GlobalColor.white))
        painter.drawRect(rect)

        # Draw a diamond grid pattern
        self._draw_diamond_grid(painter, rect)

        # Draw simplified arrows based on pictograph data
        self._draw_simplified_arrows(painter, pictograph_data, rect)

        # Draw letter if available
        if hasattr(pictograph_data, "letter") and pictograph_data.letter:
            self._draw_letter_overlay(painter, pictograph_data.letter, rect)

    def _draw_diamond_grid(self, painter: QPainter, rect: QRect) -> None:
        """Draw a simplified diamond grid."""
        center_x = rect.center().x()
        center_y = rect.center().y()
        grid_size = min(rect.width(), rect.height()) // 3

        # Draw diamond shape
        painter.setPen(QPen(Qt.GlobalColor.lightGray, 1))

        # Diamond points
        top = QPoint(center_x, center_y - grid_size)
        right = QPoint(center_x + grid_size, center_y)
        bottom = QPoint(center_x, center_y + grid_size)
        left = QPoint(center_x - grid_size, center_y)

        # Draw diamond lines
        painter.drawLine(top, right)
        painter.drawLine(right, bottom)
        painter.drawLine(bottom, left)
        painter.drawLine(left, top)

        # Draw center point
        painter.setPen(QPen(Qt.GlobalColor.gray, 3))
        painter.drawPoint(center_x, center_y)

    def _draw_simplified_arrows(
        self, painter: QPainter, pictograph_data: PictographData, rect: QRect
    ) -> None:
        """Draw simplified arrows based on pictograph data."""
        center_x = rect.center().x()
        center_y = rect.center().y()
        arrow_length = min(rect.width(), rect.height()) // 4

        # Draw blue arrow (simplified)
        painter.setPen(QPen(QColor(0, 0, 255), 3))  # Blue
        blue_end_x = center_x + arrow_length
        blue_end_y = center_y
        painter.drawLine(center_x, center_y, blue_end_x, blue_end_y)

        # Draw arrowhead for blue
        self._draw_arrowhead(painter, center_x, center_y, blue_end_x, blue_end_y)

        # Draw red arrow (simplified)
        painter.setPen(QPen(QColor(255, 0, 0), 3))  # Red
        red_end_x = center_x - arrow_length
        red_end_y = center_y
        painter.drawLine(center_x, center_y, red_end_x, red_end_y)

        # Draw arrowhead for red
        self._draw_arrowhead(painter, center_x, center_y, red_end_x, red_end_y)

    def _draw_arrowhead(
        self, painter: QPainter, start_x: int, start_y: int, end_x: int, end_y: int
    ) -> None:
        """Draw a simple arrowhead."""
        import math

        # Calculate angle
        angle = math.atan2(end_y - start_y, end_x - start_x)

        # Arrowhead size
        head_length = 8
        head_angle = math.pi / 6  # 30 degrees

        # Calculate arrowhead points
        x1 = end_x - head_length * math.cos(angle - head_angle)
        y1 = end_y - head_length * math.sin(angle - head_angle)
        x2 = end_x - head_length * math.cos(angle + head_angle)
        y2 = end_y - head_length * math.sin(angle + head_angle)

        # Draw arrowhead
        painter.drawLine(end_x, end_y, int(x1), int(y1))
        painter.drawLine(end_x, end_y, int(x2), int(y2))

    def _draw_letter_overlay(self, painter: QPainter, letter: str, rect: QRect) -> None:
        """Draw letter overlay on the pictograph."""
        # Position letter in bottom-right corner
        letter_rect = QRect(rect.right() - 25, rect.bottom() - 25, 20, 20)

        # Draw background
        painter.fillRect(letter_rect, QBrush(QColor(255, 255, 255, 200)))

        # Draw letter
        painter.setPen(QPen(Qt.GlobalColor.black))
        painter.setFont(QFont("Arial", 10, QFont.Weight.Bold))
        painter.drawText(letter_rect, Qt.AlignmentFlag.AlignCenter, letter)

    def _render_real_pictograph(
        self,
        painter: QPainter,
        pictograph_data: PictographData,
        x: int,
        y: int,
        size: int,
    ) -> bool:
        """Render a REAL pictograph using the modern pictograph system."""
        try:
            # Ensure the global container is set so PictographScene can access services
            if self.container:
                from core.dependency_injection.di_container import set_container

                set_container(self.container)

            # Create a pictograph scene with the real rendering system
            scene = PictographScene()
            scene.setSceneRect(0, 0, 950, 950)  # Standard pictograph size

            # Render the pictograph data to the scene using the REAL system
            scene.render_pictograph(pictograph_data)

            # Create a QImage from the scene
            scene_image = QImage(950, 950, QImage.Format.Format_ARGB32)
            scene_image.fill(Qt.GlobalColor.white)

            # Render the scene to the image
            scene_painter = QPainter(scene_image)
            scene_painter.setRenderHint(QPainter.RenderHint.Antialiasing)
            scene_painter.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)

            # Render the scene
            scene.render(scene_painter)
            scene_painter.end()

            # Scale and draw the image to the target position
            target_rect = QRect(x, y, size, size)
            painter.drawImage(target_rect, scene_image)

            logger.debug(f"Successfully rendered REAL pictograph at ({x}, {y})")
            return True

        except Exception as e:
            logger.debug(f"Failed to render real pictograph: {e}")
            return False
