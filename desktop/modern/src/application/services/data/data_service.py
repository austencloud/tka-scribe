"""
TKA Data Service

Clean, dependency-injectable data service to replace the singleton DataPathHandler.
Uses simple exceptions for error handling and configuration injection.
"""

import logging
from abc import ABC, abstractmethod
from typing import Any, Dict

import pandas as pd
from core.config.data_config import DataConfig

logger = logging.getLogger(__name__)


class IDataService(ABC):
    """Interface for core data operations."""

    @abstractmethod
    def load_diamond_dataset(self) -> pd.DataFrame:
        """Load diamond pictograph dataset with error handling."""
        pass

    @abstractmethod
    def load_box_dataset(self) -> pd.DataFrame:
        """Load box pictograph dataset with error handling."""
        pass

    @abstractmethod
    def load_combined_dataset(self) -> pd.DataFrame:
        """Load and combine both diamond and box datasets."""
        pass

    @abstractmethod
    def validate_data_files(self) -> Dict[str, Any]:
        """Validate data files and return status information."""
        pass

    @abstractmethod
    def get_data_config(self) -> DataConfig:
        """Get the current data configuration."""
        pass

    @abstractmethod
    def reload_config(self, new_config: DataConfig) -> None:
        """Reload with new configuration."""
        pass


class DataService(IDataService):
    """
    Clean data service with dependency injection and proper error handling.

    Replaces the singleton DataPathHandler with a focused, testable service.
    """

    def __init__(self, config: DataConfig):
        """
        Initialize with data configuration.

        Args:
            config: Data configuration with validated paths
        """
        self.config = config

    def load_diamond_dataset(self) -> pd.DataFrame:
        """
        Load diamond pictograph dataset with error handling.

        Returns:
            DataFrame with diamond pictograph data

        Raises:
            FileNotFoundError: If diamond CSV file doesn't exist
            ValueError: If CSV file is empty or invalid
        """
        try:
            if not self.config.diamond_csv_path.exists():
                raise FileNotFoundError(
                    f"Diamond CSV file not found: {self.config.diamond_csv_path}"
                )

            df = pd.read_csv(self.config.diamond_csv_path)

            if df.empty:
                raise ValueError(
                    f"Diamond CSV file is empty: {self.config.diamond_csv_path}"
                )

            logger.info(
                f"Loaded diamond dataset: {df.shape[0]} rows, {df.shape[1]} columns"
            )
            return df

        except pd.errors.EmptyDataError:
            raise ValueError(
                f"Diamond CSV file contains no data: {self.config.diamond_csv_path}"
            )
        except pd.errors.ParserError as e:
            raise ValueError(f"Failed to parse diamond CSV: {e}") from e
        except Exception as e:
            raise ValueError(f"Failed to load diamond dataset: {e}") from e

    def load_box_dataset(self) -> pd.DataFrame:
        """Load box pictograph dataset with error handling."""
        try:
            if not self.config.box_csv_path.exists():
                raise FileNotFoundError(
                    f"Box CSV file not found: {self.config.box_csv_path}"
                )

            df = pd.read_csv(self.config.box_csv_path)

            if df.empty:
                raise ValueError(f"Box CSV file is empty: {self.config.box_csv_path}")

            logger.info(
                f"Loaded box dataset: {df.shape[0]} rows, {df.shape[1]} columns"
            )
            return df

        except pd.errors.EmptyDataError:
            raise ValueError(
                f"Box CSV file contains no data: {self.config.box_csv_path}"
            )
        except pd.errors.ParserError as e:
            raise ValueError(f"Failed to parse box CSV: {e}") from e
        except Exception as e:
            raise ValueError(f"Failed to load box dataset: {e}") from e

    def load_combined_dataset(self) -> pd.DataFrame:
        """Load and combine both diamond and box datasets."""
        try:
            # Load diamond dataset (required)
            diamond_df = self.load_diamond_dataset()

            # Load box dataset (optional)
            try:
                box_df = self.load_box_dataset()
                # Combine datasets
                combined_df = pd.concat([diamond_df, box_df], ignore_index=True)
                logger.info(
                    f"Combined dataset: {combined_df.shape[0]} rows, {combined_df.shape[1]} columns"
                )
                return combined_df
            except Exception as e:
                # Box dataset is optional - just use diamond if box fails
                logger.warning(f"Box dataset not available: {e}")
                return diamond_df

        except Exception as e:
            raise ValueError(f"Failed to load combined dataset: {e}") from e

    def validate_data_files(self) -> Dict[str, Any]:
        """Validate data files and return status information."""
        try:
            status = {
                "diamond_exists": self.config.diamond_csv_path.exists(),
                "box_exists": self.config.box_csv_path.exists(),
                "diamond_path": str(self.config.diamond_csv_path),
                "box_path": str(self.config.box_csv_path),
                "data_dir": str(self.config.data_dir),
                "data_dir_exists": self.config.data_dir.exists(),
            }

            # Add file sizes if files exist
            if status["diamond_exists"]:
                status["diamond_size_bytes"] = (
                    self.config.diamond_csv_path.stat().st_size
                )

            if status["box_exists"]:
                status["box_size_bytes"] = self.config.box_csv_path.stat().st_size

            return status

        except Exception as e:
            raise ValueError(f"Failed to validate data files: {e}") from e

    def get_data_config(self) -> DataConfig:
        """Get the current data configuration."""
        return self.config

    def reload_config(self, new_config: DataConfig) -> None:
        """
        Reload with new configuration.

        Args:
            new_config: New data configuration to use
        """
        self.config = new_config
        logger.info(f"Reloaded data service with new config: {new_config.data_dir}")
