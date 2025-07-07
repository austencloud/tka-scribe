"""
TKA Data Migration Service

Provides utilities for migrating from legacy data/ structure to modern data_modern/ structure.
Includes validation, path resolution, and migration status tracking.

USAGE:
    from core.config.data_migration_service import DataMigrationService
    
    migration_service = DataMigrationService()
    status = migration_service.get_migration_status()
    
    if status.needs_migration:
        result = migration_service.validate_migration_readiness()
        if result.is_success():
            # Ready to migrate
            pass
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional, Set
from dataclasses import dataclass
from enum import Enum

from core.types.result import Result, AppError, ErrorType, success, failure, app_error

logger = logging.getLogger(__name__)


class MigrationStatus(Enum):
    """Migration status indicators."""
    LEGACY_ONLY = "legacy_only"          # Only data/ exists
    MODERN_ONLY = "modern_only"          # Only data_modern/ exists  
    BOTH_AVAILABLE = "both_available"    # Both structures exist
    NEITHER_FOUND = "neither_found"      # No data directories found


@dataclass(frozen=True)
class MigrationInfo:
    """Information about current migration state."""
    status: MigrationStatus
    legacy_path: Optional[Path]
    modern_path: Optional[Path]
    needs_migration: bool
    can_migrate: bool
    missing_files: List[str]
    conflicting_files: List[str]
    
    def get_recommended_action(self) -> str:
        """Get human-readable recommendation for next steps."""
        if self.status == MigrationStatus.MODERN_ONLY:
            return "✅ Using modern data structure - no action needed"
        elif self.status == MigrationStatus.LEGACY_ONLY:
            return "⚠️ Using legacy structure - consider migrating to data_modern/"
        elif self.status == MigrationStatus.BOTH_AVAILABLE:
            return "🔄 Both structures available - using modern, legacy as fallback"
        else:
            return "❌ No data directories found - check project structure"


class DataMigrationService:
    """Service for managing data directory migration between legacy and modern structures."""
    
    def __init__(self, project_root: Optional[Path] = None):
        """
        Initialize migration service.
        
        Args:
            project_root: Optional project root path. If None, will auto-detect.
        """
        self.project_root = project_root or self._find_project_root()
        self.legacy_data_dir = self.project_root / "data"
        self.modern_data_dir = self.project_root / "data_modern"
        
    def get_migration_status(self) -> MigrationInfo:
        """
        Get current migration status and recommendations.
        
        Returns:
            MigrationInfo with current state and recommendations
        """
        legacy_exists = self.legacy_data_dir.exists()
        modern_exists = self.modern_data_dir.exists()
        
        # Determine status
        if modern_exists and legacy_exists:
            status = MigrationStatus.BOTH_AVAILABLE
        elif modern_exists:
            status = MigrationStatus.MODERN_ONLY
        elif legacy_exists:
            status = MigrationStatus.LEGACY_ONLY
        else:
            status = MigrationStatus.NEITHER_FOUND
            
        # Check migration needs and capabilities
        needs_migration = status == MigrationStatus.LEGACY_ONLY
        can_migrate = legacy_exists and self._validate_legacy_structure()
        
        # Find missing and conflicting files
        missing_files = self._find_missing_files() if legacy_exists else []
        conflicting_files = self._find_conflicting_files() if modern_exists and legacy_exists else []
        
        return MigrationInfo(
            status=status,
            legacy_path=self.legacy_data_dir if legacy_exists else None,
            modern_path=self.modern_data_dir if modern_exists else None,
            needs_migration=needs_migration,
            can_migrate=can_migrate,
            missing_files=missing_files,
            conflicting_files=conflicting_files
        )
    
    def validate_migration_readiness(self) -> Result[bool, AppError]:
        """
        Validate that the system is ready for migration.
        
        Returns:
            Result indicating if migration can proceed safely
        """
        try:
            # Check if legacy data exists
            if not self.legacy_data_dir.exists():
                return failure(app_error(
                    ErrorType.CONFIG_ERROR,
                    "Legacy data directory not found",
                    {"path": str(self.legacy_data_dir)}
                ))
            
            # Validate legacy structure
            if not self._validate_legacy_structure():
                return failure(app_error(
                    ErrorType.DATA_ERROR,
                    "Legacy data structure is incomplete or corrupted",
                    {"path": str(self.legacy_data_dir)}
                ))
            
            # Check for critical files
            critical_files = [
                "DiamondPictographDataframe.csv",
                "constants.py",
                "types.py"
            ]
            
            missing_critical = []
            for file in critical_files:
                if not (self.legacy_data_dir / file).exists():
                    missing_critical.append(file)
            
            if missing_critical:
                return failure(app_error(
                    ErrorType.DATA_ERROR,
                    f"Critical files missing: {', '.join(missing_critical)}",
                    {"missing_files": missing_critical}
                ))
            
            return success(True)
            
        except Exception as e:
            return failure(app_error(
                ErrorType.SYSTEM_ERROR,
                f"Error validating migration readiness: {str(e)}",
                {"exception": str(e)}
            ))
    
    def get_path_mappings(self) -> Dict[str, str]:
        """
        Get mapping of legacy paths to modern paths for import updates.
        
        Returns:
            Dictionary mapping old import paths to new ones
        """
        return {
            # Python imports
            "from data.constants": "from data_modern.core.constants",
            "from data.types": "from data_modern.core.types",
            "from data.positions_maps": "from data_modern.core.positions_maps",
            "from data.start_end_loc_map": "from data_modern.core.start_end_loc_map",
            "from data.prop_class_mapping": "from data_modern.core.prop_class_mapping",
            
            # File paths
            "data/DiamondPictographDataframe.csv": "data_modern/datasets/pictographs/diamond_pictograph_dataframe.csv",
            "data/BoxPictographDataframe.csv": "data_modern/datasets/pictographs/box_pictograph_dataframe.csv",
            "data/default_settings.ini": "data_modern/settings/default_settings.ini",
            "data/beat_frame_layout_options.json": "data_modern/layouts/configurations/beat_frame_layout_options.json",
            "data/circle_coords.json": "data_modern/layouts/configurations/circle_coords.json",
            "data/performance/": "data_modern/runtime/performance/",
            "data/sequences/": "data_modern/runtime/sequences/",
            "data/temp/": "data_modern/runtime/temp/",
        }
    
    def _find_project_root(self) -> Path:
        """Find the TKA project root directory."""
        current_path = Path(__file__).resolve().parent
        
        while current_path.parent != current_path:
            if current_path.name == "TKA" or (current_path / "data").exists():
                return current_path
            current_path = current_path.parent
            
        return Path.cwd()
    
    def _validate_legacy_structure(self) -> bool:
        """Validate that legacy data structure has required components."""
        required_files = [
            "constants.py",
            "DiamondPictographDataframe.csv"
        ]
        
        return all((self.legacy_data_dir / file).exists() for file in required_files)
    
    def _find_missing_files(self) -> List[str]:
        """Find files that exist in legacy but not in modern structure."""
        if not self.legacy_data_dir.exists() or not self.modern_data_dir.exists():
            return []
        
        # This would be implemented to compare file structures
        # For now, return empty list as placeholder
        return []
    
    def _find_conflicting_files(self) -> List[str]:
        """Find files that exist in both structures but may have conflicts."""
        if not self.legacy_data_dir.exists() or not self.modern_data_dir.exists():
            return []
        
        # This would be implemented to find actual conflicts
        # For now, return empty list as placeholder
        return []


def create_migration_service(project_root: Optional[Path] = None) -> Result[DataMigrationService, AppError]:
    """
    Create a DataMigrationService instance.
    
    Args:
        project_root: Optional project root path
        
    Returns:
        Result containing DataMigrationService or AppError
    """
    try:
        service = DataMigrationService(project_root)
        return success(service)
    except Exception as e:
        return failure(app_error(
            ErrorType.SYSTEM_ERROR,
            f"Failed to create migration service: {str(e)}",
            {"exception": str(e)}
        ))
