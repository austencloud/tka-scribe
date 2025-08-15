"""
Positioning Services Interfaces

Defines interfaces for position and coordinate management services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class IPositionManager(ABC):
    """Interface for position management."""

    @abstractmethod
    def get_position_coordinates(self, position: str) -> tuple[int, int]:
        """Get coordinates for a position."""
        pass

    @abstractmethod
    def set_position_coordinates(self, position: str, x: int, y: int) -> None:
        """Set coordinates for a position."""
        pass

    @abstractmethod
    def get_all_positions(self) -> list[str]:
        """Get all available positions."""
        pass

    @abstractmethod
    def validate_position(self, position: str) -> bool:
        """Validate if a position is valid."""
        pass


class ICoordinateService(ABC):
    """Interface for coordinate system services."""

    @abstractmethod
    def transform_coordinates(
        self, x: int, y: int, from_system: str, to_system: str
    ) -> tuple[int, int]:
        """Transform coordinates between systems."""
        pass

    @abstractmethod
    def get_coordinate_systems(self) -> list[str]:
        """Get available coordinate systems."""
        pass

    @abstractmethod
    def set_default_coordinate_system(self, system: str) -> None:
        """Set the default coordinate system."""
        pass


class IPositioningService(ABC):
    """Interface for positioning calculations and management."""

    @abstractmethod
    def calculate_position(self, parameters: dict[str, Any]) -> dict[str, Any]:
        """Calculate position based on parameters."""
        pass

    @abstractmethod
    def get_position_data(self, position_id: str) -> dict[str, Any]:
        """Get position data."""
        pass

    @abstractmethod
    def update_position_data(self, position_id: str, data: dict[str, Any]) -> None:
        """Update position data."""
        pass

    @abstractmethod
    def validate_positioning_data(self, data: dict[str, Any]) -> bool:
        """Validate positioning data."""
        pass
