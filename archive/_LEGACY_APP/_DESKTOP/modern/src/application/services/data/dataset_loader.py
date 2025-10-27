"""
Dataset Loader - CORRECTED Interface Implementation

Handles loading and caching of CSV pictograph datasets.
Focused solely on data access and file I/O operations.

CORRECTION: Keep existing method signatures, add interface for future flexibility.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
import logging

import pandas as pd

from desktop.modern.src.infrastructure.data_path_handler import DataPathHandler


logger = logging.getLogger(__name__)


class IDatasetLoader(ABC):
    """
    Interface for dataset loading operations.

    DESIGN PRINCIPLE: Match existing method signatures exactly
    to maintain backward compatibility.
    """

    @abstractmethod
    def load_datasets(self) -> bool:
        """Load the diamond and box pictograph datasets."""
        pass

    @abstractmethod
    def get_diamond_dataset(self) -> pd.DataFrame | None:
        """Get the diamond dataset."""
        pass

    @abstractmethod
    def get_box_dataset(self) -> pd.DataFrame | None:
        """Get the box dataset."""
        pass

    @abstractmethod
    def get_combined_dataset(self) -> pd.DataFrame | None:
        """Get the combined dataset."""
        pass

    @abstractmethod
    def get_dataset_by_mode(self, grid_mode: str) -> pd.DataFrame | None:
        """Get dataset by grid mode ('diamond' or 'box')."""
        pass

    @abstractmethod
    def is_dataset_available(self, grid_mode: str) -> bool:
        """Check if a dataset is available and not empty."""
        pass

    @abstractmethod
    def get_dataset_info(self) -> dict:
        """Get information about loaded datasets."""
        pass

    @abstractmethod
    def reload_datasets(self) -> bool:
        """Force reload of all datasets."""
        pass

    @abstractmethod
    def clear_cache(self) -> bool:
        """Clear cached datasets to free memory."""
        pass


class DatasetLoader(IDatasetLoader):
    """
    Loads and caches CSV pictograph datasets.

    CORRECTED: Maintains exact same method signatures as before,
    just implements the interface. Zero breaking changes!
    """

    def __init__(self):
        """Initialize the dataset loader."""
        self._data_handler = DataPathHandler()
        self._diamond_dataset: pd.DataFrame | None = None
        self._box_dataset: pd.DataFrame | None = None
        self._combined_dataset: pd.DataFrame | None = None
        self._datasets_loaded = False

    def load_datasets(self) -> bool:
        """Load the diamond and box pictograph datasets."""
        if self._datasets_loaded:
            return True  # Already loaded

        try:
            # Load individual datasets
            self._diamond_dataset = self._data_handler.load_diamond_dataset()
            self._box_dataset = self._data_handler.load_box_dataset()

            # Create combined dataset
            self._create_combined_dataset()

            # Validate and report status
            self._validate_and_report_status()

            self._datasets_loaded = True
            return True

        except Exception as e:
            logger.exception(f"Error loading datasets: {e}")
            self._create_empty_datasets()
            self._datasets_loaded = (
                True  # Mark as loaded even if failed to prevent retries
            )
            return False

    def _create_combined_dataset(self) -> None:
        """Create combined dataset from diamond and box datasets."""
        datasets_to_combine = []

        if self._diamond_dataset is not None and not self._diamond_dataset.empty:
            datasets_to_combine.append(self._diamond_dataset)

        if self._box_dataset is not None and not self._box_dataset.empty:
            datasets_to_combine.append(self._box_dataset)

        if datasets_to_combine:
            self._combined_dataset = pd.concat(datasets_to_combine, ignore_index=True)
        else:
            self._combined_dataset = pd.DataFrame()

    def _validate_and_report_status(self) -> None:
        """Validate data files and report status."""
        status = self._data_handler.validate_data_files()

        if not status["diamond_exists"]:
            logger.warning(f"Diamond dataset not found: {status['diamond_path']}")

        if not status["box_exists"]:
            logger.warning(f"Box dataset not found: {status['box_path']}")

    def _create_empty_datasets(self) -> None:
        """Create empty datasets as fallback."""
        self._diamond_dataset = pd.DataFrame()
        self._box_dataset = pd.DataFrame()
        self._combined_dataset = pd.DataFrame()

    def get_diamond_dataset(self) -> pd.DataFrame | None:
        """Get the diamond dataset."""
        try:
            if not self._datasets_loaded:
                self.load_datasets()
            return self._diamond_dataset
        except Exception as e:
            logger.exception(f"Failed to get diamond dataset: {e}")
            return None

    def get_box_dataset(self) -> pd.DataFrame | None:
        """Get the box dataset."""
        try:
            if not self._datasets_loaded:
                self.load_datasets()
            return self._box_dataset
        except Exception as e:
            logger.exception(f"Failed to get box dataset: {e}")
            return None

    def get_combined_dataset(self) -> pd.DataFrame | None:
        """Get the combined dataset."""
        try:
            if not self._datasets_loaded:
                self.load_datasets()
            return self._combined_dataset
        except Exception as e:
            logger.exception(f"Failed to get combined dataset: {e}")
            return None

    def get_dataset_by_mode(self, grid_mode: str) -> pd.DataFrame | None:
        """Get dataset by grid mode."""
        try:
            if not self._datasets_loaded:
                self.load_datasets()

            if grid_mode == "diamond":
                return self._diamond_dataset
            if grid_mode == "box":
                return self._box_dataset
            logger.warning(f"Unknown grid mode: {grid_mode}")
            return None
        except Exception as e:
            logger.exception(f"Failed to get dataset by mode: {e}")
            return None

    def is_dataset_available(self, grid_mode: str) -> bool:
        """Check if a dataset is available and not empty."""
        try:
            dataset = self.get_dataset_by_mode(grid_mode)
            return dataset is not None and not dataset.empty
        except Exception as e:
            logger.exception(f"Failed to check dataset availability: {e}")
            return False

    def get_dataset_info(self) -> dict:
        """Get information about loaded datasets."""
        try:
            if not self._datasets_loaded:
                self.load_datasets()

            return {
                "diamond_loaded": self._diamond_dataset is not None
                and not self._diamond_dataset.empty,
                "box_loaded": self._box_dataset is not None
                and not self._box_dataset.empty,
                "diamond_entries": (
                    len(self._diamond_dataset)
                    if self._diamond_dataset is not None
                    else 0
                ),
                "box_entries": (
                    len(self._box_dataset) if self._box_dataset is not None else 0
                ),
                "total_entries": (
                    len(self._combined_dataset)
                    if self._combined_dataset is not None
                    else 0
                ),
                "datasets_loaded": self._datasets_loaded,
            }
        except Exception as e:
            logger.exception(f"Failed to get dataset info: {e}")
            return {}

    def reload_datasets(self) -> bool:
        """Force reload of all datasets."""
        try:
            self._datasets_loaded = False
            self._diamond_dataset = None
            self._box_dataset = None
            self._combined_dataset = None
            return self.load_datasets()
        except Exception as e:
            logger.exception(f"Failed to reload datasets: {e}")
            return False

    def clear_cache(self) -> bool:
        """Clear cached datasets to free memory."""
        try:
            self._diamond_dataset = None
            self._box_dataset = None
            self._combined_dataset = None
            self._datasets_loaded = False
            logger.info("Dataset cache cleared")
            return True
        except Exception as e:
            logger.exception(f"Failed to clear cache: {e}")
            return False
