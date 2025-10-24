"""
Generation Services Interfaces

Defines interfaces for sequence generation and management services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class ISequenceGenerator(ABC):
    """Interface for sequence generation."""

    @abstractmethod
    def generate_sequence(self, parameters: dict[str, Any]) -> dict[str, Any]:
        """Generate a sequence based on parameters."""
        pass

    @abstractmethod
    def validate_generation_parameters(self, parameters: dict[str, Any]) -> bool:
        """Validate generation parameters."""
        pass

    @abstractmethod
    def get_generation_options(self) -> dict[str, Any]:
        """Get available generation options."""
        pass


class ISequenceBuilder(ABC):
    """Interface for sequence building services."""

    @abstractmethod
    def build_sequence(self, beats: list[dict[str, Any]]) -> dict[str, Any]:
        """Build a sequence from beats."""
        pass

    @abstractmethod
    def add_beat(self, beat: dict[str, Any]) -> None:
        """Add a beat to the sequence."""
        pass

    @abstractmethod
    def remove_beat(self, index: int) -> None:
        """Remove a beat from the sequence."""
        pass

    @abstractmethod
    def get_sequence_data(self) -> dict[str, Any]:
        """Get current sequence data."""
        pass


class ISequenceValidator(ABC):
    """Interface for sequence validation."""

    @abstractmethod
    def validate_sequence(self, sequence: dict[str, Any]) -> bool:
        """Validate a sequence."""
        pass

    @abstractmethod
    def get_validation_errors(self) -> list[str]:
        """Get validation errors."""
        pass
