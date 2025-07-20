"""
Mock Pictograph Data Service for Learn Tab Testing

Provides a simple implementation of IPictographDataService for testing
the Learn Tab functionality without requiring the full pictograph system.
"""

import logging
from typing import Optional, Any, Dict, List, Tuple

from core.interfaces.data_builder_services import IPictographDataService

logger = logging.getLogger(__name__)


class MockPictographDataService(IPictographDataService):
    """
    Mock implementation of IPictographDataService for Learn Tab testing.

    Provides minimal functionality to support question generation
    without requiring the full pictograph data infrastructure.
    """

    def __init__(self):
        """Initialize mock service with test data."""
        self._mock_data: Dict[str, Any] = {}
        self._initialize_test_data()
        logger.info("Mock pictograph data service initialized")

    def get_pictograph_data(self, pictograph_id: str) -> Optional[Any]:
        """
        Get pictograph data by ID.

        Args:
            pictograph_id: Unique identifier for pictograph

        Returns:
            Mock pictograph data or None if not found
        """
        return self._mock_data.get(pictograph_id)

    def save_pictograph_data(self, pictograph_id: str, data: Any) -> bool:
        """
        Save pictograph data.

        Args:
            pictograph_id: Unique identifier for pictograph
            data: Pictograph data to save

        Returns:
            True (always succeeds in mock)
        """
        self._mock_data[pictograph_id] = data
        return True

    def delete_pictograph_data(self, pictograph_id: str) -> bool:
        """
        Delete pictograph data.

        Args:
            pictograph_id: Unique identifier for pictograph

        Returns:
            True if deleted successfully
        """
        if pictograph_id in self._mock_data:
            del self._mock_data[pictograph_id]
            return True
        return False

    def list_pictograph_ids(self) -> List[str]:
        """
        List all pictograph IDs.

        Returns:
            List of pictograph identifiers
        """
        return list(self._mock_data.keys())

    def search_pictographs(self, search_criteria: Dict[str, Any]) -> List[Any]:
        """
        Search pictographs by criteria.

        Args:
            search_criteria: Search criteria dictionary

        Returns:
            List of matching pictographs
        """
        results = []
        letter = search_criteria.get("letter")

        if letter:
            # Return mock pictographs for the specified letter
            for pictograph_id, data in self._mock_data.items():
                if data.get("letter") == letter:
                    results.append(data)
        else:
            # Return all pictographs if no specific criteria
            results = list(self._mock_data.values())

        return results

    def validate_pictograph_data(self, data: Any) -> Tuple[bool, List[str]]:
        """
        Validate pictograph data.

        Args:
            data: Pictograph data to validate

        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []

        if not isinstance(data, dict):
            errors.append("Data must be a dictionary")
        else:
            if "id" not in data:
                errors.append("Missing required field: id")
            if "letter" not in data:
                errors.append("Missing required field: letter")

        return len(errors) == 0, errors

    def get_pictograph_metadata(self, pictograph_id: str) -> Optional[Dict[str, Any]]:
        """
        Get pictograph metadata.

        Args:
            pictograph_id: Unique identifier for pictograph

        Returns:
            Metadata dictionary or None if not found
        """
        data = self._mock_data.get(pictograph_id)
        if data:
            return data.get("metadata", {})
        return None

    def update_pictograph_metadata(
        self, pictograph_id: str, metadata: Dict[str, Any]
    ) -> bool:
        """
        Update pictograph metadata.

        Args:
            pictograph_id: Unique identifier for pictograph
            metadata: Metadata to update

        Returns:
            True if updated successfully
        """
        if pictograph_id in self._mock_data:
            if "metadata" not in self._mock_data[pictograph_id]:
                self._mock_data[pictograph_id]["metadata"] = {}
            self._mock_data[pictograph_id]["metadata"].update(metadata)
            return True
        return False

    def get_all_pictograph_ids(self) -> List[str]:
        """Get all available pictograph IDs for testing."""
        return list(self._mock_data.keys())

    def get_pictographs_by_letter(self, letter: str) -> List[Dict[str, Any]]:
        """Get mock pictographs for a specific letter."""
        # Return mock pictographs for testing
        return [
            {
                "id": f"mock_{letter}_1",
                "letter": letter,
                "type": "mock",
                "data": {"letter": letter, "variant": 1},
            },
            {
                "id": f"mock_{letter}_2",
                "letter": letter,
                "type": "mock",
                "data": {"letter": letter, "variant": 2},
            },
            {
                "id": f"mock_{letter}_3",
                "letter": letter,
                "type": "mock",
                "data": {"letter": letter, "variant": 3},
            },
            {
                "id": f"mock_{letter}_4",
                "letter": letter,
                "type": "mock",
                "data": {"letter": letter, "variant": 4},
            },
        ]

    def get_pictograph_dataset(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get the complete pictograph dataset for question generation.

        Returns:
            Dictionary mapping letters to lists of pictograph data
        """
        dataset = {}
        test_letters = [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
        ]

        for letter in test_letters:
            dataset[letter] = self.get_pictographs_by_letter(letter)

        return dataset

    def _initialize_test_data(self) -> None:
        """Initialize mock test data for common letters."""
        test_letters = ["A", "B", "C", "D", "E", "F", "G", "H"]

        for letter in test_letters:
            for variant in range(1, 5):  # 4 variants per letter
                pictograph_id = f"mock_{letter}_{variant}"
                self._mock_data[pictograph_id] = {
                    "id": pictograph_id,
                    "letter": letter,
                    "type": "mock",
                    "data": {
                        "letter": letter,
                        "variant": variant,
                        "grid_mode": "diamond",
                        "arrows": {},
                        "props": {},
                        "metadata": {
                            "created_by": "mock_service",
                            "is_test_data": True,
                        },
                    },
                }
