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
from typing import Optional, Tuple

from domain.models.sequence_data import SequenceData

logger = logging.getLogger(__name__)


class WorkbenchExportService:
    """
    Framework-agnostic implementation of workbench export operations.
    
    Responsibilities:
    - Export sequences as images (via existing services)
    - Export sequences as JSON with proper formatting
    - Manage export directories and file naming
    - Provide validation and error handling
    """
    
    def __init__(self, base_export_directory: Optional[str] = None):
        """
        Initialize export service.
        
        Args:
            base_export_directory: Base directory for exports, defaults to project exports folder
        """
        self._base_directory = base_export_directory or self._get_default_export_directory()
        self._ensure_export_directory_exists()
        
        logger.debug(f"WorkbenchExportService initialized with directory: {self._base_directory}")
    
    def _get_default_export_directory(self) -> str:
        """Get default export directory based on project structure."""
        try:
            # Navigate to project root and create exports directory
            current_dir = Path(__file__).parent
            project_root = current_dir
            
            # Find project root by looking for known files
            while project_root.parent != project_root:
                if (project_root / "main.py").exists() or (project_root / "pyproject.toml").exists():
                    break
                project_root = project_root.parent
            
            exports_dir = project_root / "exports" / "workbench"
            return str(exports_dir)
            
        except Exception as e:
            logger.warning(f"Could not determine project root, using temp directory: {e}")
            return str(Path.home() / "TKA_Exports")
    
    def _ensure_export_directory_exists(self) -> None:
        """Ensure export directory exists."""
        try:
            Path(self._base_directory).mkdir(parents=True, exist_ok=True)
            logger.debug(f"Export directory ensured: {self._base_directory}")
        except Exception as e:
            logger.error(f"Failed to create export directory {self._base_directory}: {e}")
            raise
    
    def export_sequence_image(self, sequence: SequenceData, file_path: Optional[str] = None) -> Tuple[bool, str]:
        """
        Export sequence as image file.
        
        Note: This is a placeholder implementation. The actual image export
        would require integration with the existing pictograph rendering services.
        """
        try:
            if not sequence or sequence.length == 0:
                return False, "No sequence data to export"
            
            # Generate file path if not provided
            if not file_path:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"sequence_{sequence.length}beats_{timestamp}.png"
                file_path = str(Path(self._base_directory) / filename)
            
            # TODO: Integrate with actual image rendering service
            # For now, create a placeholder file to test the export logic
            try:
                with open(file_path, 'w') as f:
                    f.write(f"# Sequence Image Export Placeholder\n")
                    f.write(f"# Sequence: {sequence.length} beats\n")
                    f.write(f"# Exported: {datetime.now().isoformat()}\n")
                    f.write(f"# This would be an actual image in full implementation\n")
                
                logger.info(f"Sequence image exported to: {file_path}")
                return True, file_path
                
            except Exception as e:
                logger.error(f"Failed to write export file {file_path}: {e}")
                return False, f"Failed to write export file: {e}"
            
        except Exception as e:
            logger.error(f"Image export failed: {e}")
            return False, f"Image export failed: {e}"
    
    def export_sequence_json(self, sequence: SequenceData) -> Tuple[bool, str]:
        """
        Export sequence as JSON string.
        """
        try:
            if not sequence:
                return False, "No sequence data to export"
            
            # Create comprehensive JSON representation
            export_data = {
                "metadata": {
                    "export_timestamp": datetime.now().isoformat(),
                    "export_version": "1.0",
                    "sequence_length": sequence.length
                },
                "sequence": {
                    "length": sequence.length,
                    "beats": []
                }
            }
            
            # Add beat data
            for i, beat in enumerate(sequence.beats):
                beat_data = {
                    "index": i,
                    "letter": getattr(beat, 'letter', f'Beat_{i}'),
                    # Add more beat properties as needed
                    "data": str(beat) if hasattr(beat, '__dict__') else repr(beat)
                }
                export_data["sequence"]["beats"].append(beat_data)
            
            # Convert to formatted JSON
            json_string = json.dumps(export_data, indent=2, ensure_ascii=False)
            
            logger.info(f"Sequence JSON exported: {len(json_string)} characters")
            return True, json_string
            
        except Exception as e:
            logger.error(f"JSON export failed: {e}")
            return False, f"JSON export failed: {e}"
    
    def get_export_directory(self) -> str:
        """Get the directory where exports are saved."""
        return self._base_directory
    
    def validate_export_directory(self) -> bool:
        """Validate that export directory exists and is writable."""
        try:
            export_path = Path(self._base_directory)
            
            # Check if directory exists
            if not export_path.exists():
                logger.warning(f"Export directory does not exist: {self._base_directory}")
                return False
            
            # Check if directory is writable
            if not os.access(self._base_directory, os.W_OK):
                logger.warning(f"Export directory is not writable: {self._base_directory}")
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
                    "writable": False
                }
            
            files = list(export_path.glob("*"))
            
            return {
                "directory": self._base_directory,
                "exists": True,
                "file_count": len(files),
                "writable": os.access(self._base_directory, os.W_OK),
                "recent_files": [f.name for f in files[-5:]]  # Last 5 files
            }
            
        except Exception as e:
            logger.error(f"Failed to get export stats: {e}")
            return {
                "directory": self._base_directory,
                "error": str(e)
            }
