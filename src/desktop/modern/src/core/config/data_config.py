"""
TKA Data Configuration

Provides clean, dependency-injectable data configuration to replace the singleton DataPathHandler.
Uses Result types for proper error handling.

USAGE:
    from core.config.data_config import create_data_config, DataConfig
    
    # Create configuration
    config_result = create_data_config()
    if config_result.is_success():
        config = config_result.value
        # Use config.diamond_csv_path, etc.
    else:
        logger.error(f"Config error: {config_result.error}")
        
    # Inject into services
    class DataService:
        def __init__(self, config: DataConfig):
            self.config = config
"""

import os
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

from core.types.result import Result, AppError, ErrorType, success, failure, app_error


@dataclass(frozen=True)
class DataConfig:
    """Immutable data configuration for TKA with modern/legacy support."""
    data_dir: Path
    diamond_csv_path: Path
    box_csv_path: Path
    is_modern_structure: bool = False

    def validate_paths(self) -> Result[bool, AppError]:
        """Validate that all required paths exist."""
        if not self.data_dir.exists():
            return failure(app_error(
                ErrorType.CONFIG_ERROR,
                f"Data directory not found: {self.data_dir}",
                {"attempted_path": str(self.data_dir)}
            ))

        if not self.diamond_csv_path.exists():
            return failure(app_error(
                ErrorType.DATA_ERROR,
                f"Diamond CSV not found: {self.diamond_csv_path}",
                {"path": str(self.diamond_csv_path)}
            ))

        # Box CSV is optional - don't fail if missing
        if not self.box_csv_path.exists():
            # Just log a warning, don't fail
            pass

        return success(True)

    def get_structure_info(self) -> str:
        """Get human-readable info about the data structure being used."""
        return "Modern (data_modern/)" if self.is_modern_structure else "Legacy (data/)"
    
    def get_status(self) -> dict:
        """Get status of all data files."""
        return {
            "diamond_exists": self.diamond_csv_path.exists(),
            "box_exists": self.box_csv_path.exists(),
            "diamond_path": str(self.diamond_csv_path),
            "box_path": str(self.box_csv_path),
            "data_dir": str(self.data_dir),
        }


def create_data_config(base_path: Optional[Path] = None) -> Result[DataConfig, AppError]:
    """
    Create data configuration with simple, predictable logic.
    
    Args:
        base_path: Optional base path for data directory. If None, uses environment or default.
        
    Returns:
        Result containing DataConfig or AppError
    """
    try:
        if base_path is None:
            # Use environment variable or default
            env_path = os.environ.get("TKA_DATA_DIR")
            if env_path:
                base_path = Path(env_path)
            else:
                # Default: look for data directory relative to project root
                base_path = _find_project_data_dir()
        
        data_dir = base_path.resolve()

        # Detect structure type and set appropriate paths
        is_modern = _is_modern_data_structure(data_dir)

        if is_modern:
            # Modern structure: data_modern/datasets/pictographs/
            diamond_csv = data_dir / "datasets" / "pictographs" / "diamond_pictograph_dataframe.csv"
            box_csv = data_dir / "datasets" / "pictographs" / "box_pictograph_dataframe.csv"
        else:
            # Legacy structure: data/
            diamond_csv = data_dir / "DiamondPictographDataframe.csv"
            box_csv = data_dir / "BoxPictographDataframe.csv"

        config = DataConfig(data_dir, diamond_csv, box_csv, is_modern)
        
        # Validate the configuration
        validation_result = config.validate_paths()
        if validation_result.is_failure():
            return failure(validation_result.error)
            
        return success(config)
        
    except Exception as e:
        return failure(app_error(
            ErrorType.CONFIG_ERROR,
            f"Failed to create data config: {e}",
            {"base_path": str(base_path) if base_path else "None"},
            e
        ))


def _find_project_data_dir() -> Path:
    """
    Find the project data directory with modern/legacy fallback support.

    Prioritizes data_modern/ structure but falls back to legacy data/ for compatibility.

    Returns:
        Path to data directory (modern preferred, legacy fallback)
    """
    # Start from this file and search upward
    current_path = Path(__file__).resolve().parent

    # Search upward for TKA project root
    while current_path.parent != current_path:  # Not at filesystem root
        # First priority: Look for modern data structure
        potential_modern_data = current_path / "data_modern"
        if potential_modern_data.exists() and (potential_modern_data / "datasets" / "pictographs" / "diamond_pictograph_dataframe.csv").exists():
            return potential_modern_data

        # Second priority: Look for legacy data directory
        potential_legacy_data = current_path / "data"
        if potential_legacy_data.exists() and (potential_legacy_data / "DiamondPictographDataframe.csv").exists():
            return potential_legacy_data

        # Check if this is the TKA root directory
        if current_path.name == "TKA":
            # Try modern first, then legacy
            modern_data = current_path / "data_modern"
            if modern_data.exists():
                return modern_data
            return current_path / "data"

        current_path = current_path.parent

    # Fallback: use current working directory + data_modern, then data
    modern_fallback = Path.cwd() / "data_modern"
    if modern_fallback.exists():
        return modern_fallback
    return Path.cwd() / "data"


def _is_modern_data_structure(data_dir: Path) -> bool:
    """
    Determine if the data directory uses modern or legacy structure.

    Args:
        data_dir: Path to the data directory

    Returns:
        True if modern structure (data_modern/), False if legacy (data/)
    """
    # Modern structure indicators
    modern_indicators = [
        data_dir / "core" / "constants.py",
        data_dir / "datasets" / "pictographs",
        data_dir / "layouts" / "configurations",
        data_dir / "runtime",
        data_dir / "settings"
    ]

    # Check if most modern structure elements exist
    modern_count = sum(1 for indicator in modern_indicators if indicator.exists())

    # If 3 or more modern indicators exist, consider it modern structure
    return modern_count >= 3


def create_data_config_from_env() -> Result[DataConfig, AppError]:
    """Create data configuration from environment variables only."""
    env_path = os.environ.get("TKA_DATA_DIR")
    if not env_path:
        return failure(app_error(
            ErrorType.CONFIG_ERROR,
            "TKA_DATA_DIR environment variable not set",
            {"available_env_vars": [k for k in os.environ.keys() if "TKA" in k]}
        ))
    
    return create_data_config(Path(env_path))


def create_data_config_with_fallback() -> DataConfig:
    """
    Create data configuration with fallback to defaults.
    
    This is for cases where you need a config and can't handle Result types.
    Logs errors but doesn't fail.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    result = create_data_config()
    if result.is_success():
        return result.value
    
    # Log the error and create a fallback config
    logger.warning(f"Failed to create data config: {result.error}")
    
    # Create minimal fallback config
    fallback_data_dir = Path.cwd() / "data"
    fallback_data_dir.mkdir(exist_ok=True)
    
    return DataConfig(
        data_dir=fallback_data_dir,
        diamond_csv_path=fallback_data_dir / "DiamondPictographDataframe.csv",
        box_csv_path=fallback_data_dir / "BoxPictographDataframe.csv"
    )
