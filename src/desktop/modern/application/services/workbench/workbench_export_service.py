"""
Workbench Export Service Implementation

Framework-agnostic implementation of workbench export operations.
Handles image and JSON export functionality for sequences.
"""

import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from domain.models.beat_data import BeatData
from domain.models.pictograph_data import PictographData
from PyQt6.QtCore import QObject

from desktop.modern.core.dependency_injection.di_container import DIContainer
from desktop.modern.core.dependency_injection.image_export_service_registration import (
    register_image_export_services,
)
from desktop.modern.core.interfaces.image_export_services import (
    ImageExportOptions,
    ISequenceImageExporter,
)
from desktop.modern.domain.models.sequence_data import SequenceData

logger = logging.getLogger(__name__)


class WorkbenchExportService(QObject):
    """
    Framework-agnostic implementation of workbench export operations.

    Responsibilities:
    - Export sequences as images (via existing services)
    - Export sequences as JSON with proper formatting
    - Manage export directories and file naming
    - Provide validation and error handling
    """

    def __init__(self, base_export_directory: Optional[str] = None, parent=None):
        """
        Initialize export service.

        Args:
            base_export_directory: Base directory for exports, defaults to project exports folder
            parent: Parent QObject for Qt integration
        """
        super().__init__(parent)
        self._base_directory = (
            base_export_directory or self._get_default_export_directory()
        )
        self._ensure_export_directory_exists()

        # Initialize the actual image export service using DI container
        self._container = DIContainer()
        register_image_export_services(self._container)
        self._image_export_service = self._container.resolve(ISequenceImageExporter)

        # Store reference to original global container for restoration
        self._original_container = None

        logger.debug(
            f"WorkbenchExportService initialized with directory: {self._base_directory}"
        )

    def _get_default_export_directory(self) -> str:
        """Get default export directory based on project structure."""
        try:
            # Navigate to project root and create exports directory
            current_dir = Path(__file__).parent
            project_root = current_dir

            # Find project root by looking for known files
            while project_root.parent != project_root:
                if (project_root / "main.py").exists() or (
                    project_root / "pyproject.toml"
                ).exists():
                    break
                project_root = project_root.parent

            exports_dir = project_root / "exports" / "workbench"
            return str(exports_dir)

        except Exception as e:
            logger.warning(
                f"Could not determine project root, using temp directory: {e}"
            )
            return str(Path.home() / "TKA_Exports")

    def _ensure_export_directory_exists(self) -> None:
        """Ensure export directory exists."""
        try:
            Path(self._base_directory).mkdir(parents=True, exist_ok=True)
            logger.debug(f"Export directory ensured: {self._base_directory}")
        except Exception as e:
            logger.error(
                f"Failed to create export directory {self._base_directory}: {e}"
            )
            raise

    def export_sequence_image(
        self, sequence: SequenceData, file_path: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Export sequence as image file using the modern image export service.
        """
        try:
            logger.debug(
                f"WorkbenchExportService.export_sequence_image called with sequence={sequence}"
            )
            if not sequence:
                logger.error("Export failed: No sequence provided")
                return False, "No sequence data to export"
            if sequence.length == 0:
                logger.error(
                    f"Export failed: Empty sequence (length={sequence.length})"
                )
                return False, "No sequence data to export"

            # Convert SequenceData to the format expected by the image export service
            sequence_data = self._convert_sequence_to_export_format(sequence)

            # Get the current word (for now, use a default or extract from sequence)
            word = getattr(sequence, "word", "SEQUENCE")

            # Show file dialog to get save location
            if not file_path:
                logger.debug(
                    f"Showing file dialog for word='{word}', length={sequence.length}"
                )
                try:
                    file_path = self._get_save_file_path(word, sequence.length)
                    logger.debug(f"File dialog result: file_path='{file_path}'")
                except Exception as e:
                    logger.error(f"File dialog failed: {e}")
                    # Fallback to automatic file path if dialog fails
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    default_filename = f"{word}_{sequence.length}beats_{timestamp}.png"
                    file_path = str(Path(self._base_directory) / default_filename)
                    logger.info(f"Using fallback file path: {file_path}")

                if not file_path:
                    logger.info("Export cancelled: User cancelled file dialog")
                    return False, "Export cancelled by user"

            # Create export options with default settings
            options = self._create_default_export_options()

            # Try actual image rendering with proper error handling
            logger.info("Attempting real image export with error handling...")

            try:
                # CRITICAL FIX: Set export container as global so pictograph scenes can access services
                self._set_export_container_as_global()

                # Use the modern image export service
                result = self._image_export_service.export_sequence_image(
                    sequence_data, word, Path(file_path), options
                )

                if result.success:
                    logger.info(f"Sequence image exported to: {file_path}")
                    # Don't auto-open file - let the test handle display
                    return True, file_path
                else:
                    logger.error(f"Image export failed: {result.error_message}")
                    return False, result.error_message

            except Exception as e:
                logger.error(f"Image export failed with exception: {e}")

                # Fallback to placeholder if real export fails
                logger.info("Falling back to placeholder file due to export error...")
                try:
                    with open(file_path, "w") as f:
                        f.write(f"# TKA Sequence Image Export Placeholder\n")
                        f.write(f"# Word: {word}\n")
                        f.write(f"# Beats: {len(sequence_data)}\n")
                        f.write(f"# File: {file_path}\n")
                        f.write(f"# Export failed with error: {e}\n")
                        f.write(f"# This is a fallback placeholder file\n")

                    logger.info(f"Fallback placeholder file created at: {file_path}")
                    return False, f"Real export failed: {e}. Placeholder created."

                except Exception as fallback_error:
                    logger.error(
                        f"Failed to create fallback placeholder: {fallback_error}"
                    )
                    return False, f"Image export failed: {e}"

            finally:
                # CRITICAL: Always restore original container
                self._restore_original_container()

        except Exception as e:
            logger.error(f"Image export failed: {e}")
            return False, f"Image export failed: {e}"

    def export_sequence_json(self, sequence: SequenceData) -> Tuple[bool, str]:
        """
        Export sequence as JSON string in legacy-compatible format.

        Produces JSON that matches the legacy current_sequence.json format
        for maximum compatibility with existing tools and workflows.
        """
        try:
            if not sequence:
                return False, "No sequence data to export"

            # Create legacy-compatible JSON array format
            sequence_json = []

            # First element: sequence metadata (legacy format)
            metadata = {
                "word": sequence.word or "",
                "author": sequence.author or "",
                "level": sequence.level or 1,
                "prop_type": sequence.prop_type or "staff",
                "grid_mode": sequence.grid_mode or "diamond",
                "is_circular": sequence.is_circular,
                "can_be_CAP": sequence.metadata.get("can_be_CAP", True),
                "is_strict_rotated_CAP": sequence.metadata.get(
                    "is_strict_rotated_CAP", False
                ),
                "is_strict_mirrored_CAP": sequence.metadata.get(
                    "is_strict_mirrored_CAP", True
                ),
                "is_strict_swapped_CAP": sequence.metadata.get(
                    "is_strict_swapped_CAP", False
                ),
                "is_mirrored_swapped_CAP": sequence.metadata.get(
                    "is_mirrored_swapped_CAP", False
                ),
                "is_rotated_swapped_CAP": sequence.metadata.get(
                    "is_rotated_swapped_CAP", False
                ),
            }
            sequence_json.append(metadata)

            # Add beat data in legacy format
            for beat in sequence.beats:
                beat_json = self._convert_beat_data_to_json_format(beat)
                if beat_json:
                    sequence_json.append(beat_json)

            # Convert to formatted JSON
            json_string = json.dumps(sequence_json, indent=4, ensure_ascii=False)

            logger.info(
                f"Sequence JSON exported: {len(json_string)} characters, {len(sequence.beats)} beats"
            )
            return True, json_string

        except Exception as e:
            logger.error(f"JSON export failed: {e}")
            return False, f"JSON export failed: {e}"

    def _convert_beat_data_to_json_format(
        self, beat: "BeatData"
    ) -> Optional[Dict[str, Any]]:
        """
        Convert modern BeatData to legacy JSON format.

        Args:
            beat: Modern BeatData object

        Returns:
            Dictionary in legacy format or None if conversion fails
        """
        try:
            if not beat.pictograph_data:
                logger.warning(f"Beat {beat.beat_number} has no pictograph data")
                return None

            pictograph_data = beat.pictograph_data

            # Extract letter from pictograph data
            letter = pictograph_data.letter or ""

            # Determine if this is a start position (beat 0)
            is_start_position = beat.beat_number == 0 or beat.metadata.get(
                "is_start_position", False
            )

            # Base beat data
            beat_json = {
                "beat": beat.beat_number,
                "letter": letter,
                "duration": beat.duration,
            }

            # Add start position specific fields
            if is_start_position:
                beat_json["sequence_start_position"] = (
                    self._extract_start_position_type(pictograph_data)
                )

            # Add position data
            beat_json.update(
                {
                    "start_pos": self._extract_position_string(
                        pictograph_data.start_position
                    ),
                    "end_pos": self._extract_position_string(
                        pictograph_data.end_position
                    ),
                    "timing": self._extract_timing_string(pictograph_data.timing),
                    "direction": self._extract_direction_string(
                        pictograph_data.direction
                    ),
                }
            )

            # Add letter type if available
            if hasattr(pictograph_data, "letter_type") and pictograph_data.letter_type:
                beat_json["letter_type"] = str(pictograph_data.letter_type)

            # Add motion attributes for blue and red
            beat_json["blue_attributes"] = self._extract_motion_attributes(
                pictograph_data, "blue"
            )
            beat_json["red_attributes"] = self._extract_motion_attributes(
                pictograph_data, "red"
            )

            return beat_json

        except Exception as e:
            logger.error(
                f"Failed to convert beat {beat.beat_number} to legacy format: {e}"
            )
            return None

    def _extract_start_position_type(self, pictograph: "PictographData") -> str:
        """Extract start position type (alpha, beta, gamma) from pictograph."""
        if not pictograph.start_position:
            return "alpha"  # Default

        position_str = str(pictograph.start_position).lower()
        if "alpha" in position_str:
            return "alpha"
        elif "beta" in position_str:
            return "beta"
        elif "gamma" in position_str:
            return "gamma"
        else:
            return "alpha"  # Default fallback

    def _extract_position_string(self, position) -> str:
        """Extract position string from position object."""
        if not position:
            return ""
        return str(position)

    def _extract_timing_string(self, timing) -> str:
        """Extract timing string from timing enum."""
        if not timing:
            return "none"
        return str(timing).lower()

    def _extract_direction_string(self, direction) -> str:
        """Extract direction string from direction enum."""
        if not direction:
            return "none"
        return str(direction).lower()

    def get_export_directory(self) -> str:
        """Get the directory where exports are saved."""
        return self._base_directory

    def validate_export_directory(self) -> bool:
        """Validate that export directory exists and is writable."""
        try:
            export_path = Path(self._base_directory)

            # Check if directory exists
            if not export_path.exists():
                logger.warning(
                    f"Export directory does not exist: {self._base_directory}"
                )
                return False

            # Check if directory is writable
            if not os.access(self._base_directory, os.W_OK):
                logger.warning(
                    f"Export directory is not writable: {self._base_directory}"
                )
                return False

            return True

        except Exception as e:
            logger.error(f"Export directory validation failed: {e}")
            return False

    def get_export_stats(self) -> dict:
        """Get statistics about exports for debugging."""
        try:
            export_path = Path(self._base_directory)

            if not export_path.exists():
                return {
                    "directory": self._base_directory,
                    "exists": False,
                    "file_count": 0,
                    "writable": False,
                }

            files = list(export_path.glob("*"))

            return {
                "directory": self._base_directory,
                "exists": True,
                "file_count": len(files),
                "writable": os.access(self._base_directory, os.W_OK),
                "recent_files": [f.name for f in files[-5:]],  # Last 5 files
            }

        except Exception as e:
            logger.error(f"Failed to get export stats: {e}")
            return {"directory": self._base_directory, "error": str(e)}

    def _convert_sequence_to_export_format(
        self, sequence: SequenceData
    ) -> List[Dict[str, Any]]:
        """Convert SequenceData to the format expected by the image export service."""
        sequence_data = []

        for i, beat in enumerate(sequence.beats):
            # Convert beat to dictionary format expected by image export
            beat_data = {
                "beat_number": beat.beat_number,
                "letter": self._extract_letter_from_beat(beat),
                "start_pos": self._extract_start_position_from_beat(beat),
                "end_pos": self._extract_end_position_from_beat(beat),
                "blue_attributes": self._extract_motion_attributes(beat, "blue"),
                "red_attributes": self._extract_motion_attributes(beat, "red"),
                "pictograph_data": (
                    beat.pictograph_data.to_dict() if beat.pictograph_data else None
                ),
                "is_blank": beat.is_blank,
                "blue_reversal": beat.blue_reversal,
                "red_reversal": beat.red_reversal,
            }
            sequence_data.append(beat_data)

        return sequence_data

    def _get_save_file_path(self, word: str, beat_count: int) -> Optional[str]:
        """Show file dialog to get save location for the image."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            default_filename = f"{word}_{beat_count}beats_{timestamp}.png"

            auto_path = str(Path(self._base_directory) / default_filename)
            logger.info(f"Using automatic file path (dialog bypassed): {auto_path}")
            return auto_path

        except Exception as e:
            logger.error(f"Failed to show save dialog: {e}")
            return None

    def _create_default_export_options(self) -> ImageExportOptions:
        """Create default export options matching legacy behavior."""
        return ImageExportOptions(
            # Enable all visual elements like legacy
            add_word=True,
            add_user_info=True,
            add_difficulty_level=True,
            add_date=True,
            add_note=True,
            add_beat_numbers=True,
            add_reversal_symbols=True,
            include_start_position=True,
            combined_grids=False,
            # User information
            user_name="TKA User",
            export_date=datetime.now().strftime("%m-%d-%Y"),
            notes="Exported from TKA Modern",
            # High quality settings
            png_compression=1,  # Maximum quality
            high_quality=True,
        )

    def _extract_letter_from_beat(self, beat: "BeatData") -> str:
        """Extract letter from beat data."""
        # Try to get letter from pictograph data first
        if beat.pictograph_data and hasattr(beat.pictograph_data, "letter"):
            return beat.pictograph_data.letter

        # Fallback to metadata or default
        return beat.metadata.get("letter", "A")

    def _extract_start_position_from_beat(self, beat: "BeatData") -> str:
        """Extract start position from beat data."""
        if beat.pictograph_data and hasattr(beat.pictograph_data, "start_position"):
            return beat.pictograph_data.start_position

        return beat.metadata.get("start_pos", "alpha")

    def _extract_end_position_from_beat(self, beat: "BeatData") -> str:
        """Extract end position from beat data."""
        if beat.pictograph_data and hasattr(beat.pictograph_data, "end_position"):
            return beat.pictograph_data.end_position

        return beat.metadata.get("end_pos", "beta")

    def _extract_motion_attributes(
        self, pictograph_data: "PictographData", color: str
    ) -> Dict[str, Any]:
        """Extract motion attributes for a specific color from beat data."""
        attributes = {}

        if pictograph_data and hasattr(pictograph_data, "motions"):
            motion_data = pictograph_data.motions.get(color)
            if motion_data:
                # Extract the actual values from enums using .value if available, otherwise convert to string
                motion_type = getattr(motion_data, "motion_type", "")
                motion_type = (
                    getattr(motion_type, "value", str(motion_type))
                    if motion_type
                    else ""
                )

                prop_rot_dir = getattr(motion_data, "prop_rot_dir", "")
                prop_rot_dir = (
                    getattr(prop_rot_dir, "value", str(prop_rot_dir))
                    if prop_rot_dir
                    else ""
                )

                start_ori = getattr(motion_data, "start_ori", "")
                start_ori = (
                    getattr(start_ori, "value", str(start_ori)) if start_ori else ""
                )

                end_ori = getattr(motion_data, "end_ori", "")
                end_ori = getattr(end_ori, "value", str(end_ori)) if end_ori else ""

                attributes = {
                    "motion_type": motion_type,
                    "prop_rot_dir": prop_rot_dir,
                    "turns": getattr(motion_data, "turns", 0),
                    "start_ori": start_ori,
                    "end_ori": end_ori,
                }

        return attributes

    def _set_export_container_as_global(self) -> None:
        """Set the export container as the global container for pictograph scene access."""
        try:
            from desktop.modern.core.dependency_injection.di_container import (
                get_container,
                set_container,
            )

            # Store the current global container
            self._original_container = get_container()

            # Set our export container as the global one
            set_container(self._container, force=True)

            logger.debug("Export container set as global for pictograph scene access")

        except Exception as e:
            logger.warning(f"Failed to set export container as global: {e}")

    def _restore_original_container(self) -> None:
        """Restore the original global container."""
        try:
            if self._original_container is not None:
                from desktop.modern.core.dependency_injection.di_container import (
                    set_container,
                )

                # Restore the original container
                set_container(self._original_container, force=True)
                self._original_container = None

                logger.debug("Original container restored")

        except Exception as e:
            logger.warning(f"Failed to restore original container: {e}")
