"""
Option Picker Interfaces

Defines interfaces for option selection and management services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class IOptionPickerWidget(ABC):
    """Interface for option picker widgets."""

    @abstractmethod
    def set_options(self, options: list[Any]) -> None:
        """Set available options."""
        pass

    @abstractmethod
    def get_selected_option(self) -> Any:
        """Get the currently selected option."""
        pass

    @abstractmethod
    def set_selected_option(self, option: Any) -> None:
        """Set the selected option."""
        pass

    @abstractmethod
    def clear_selection(self) -> None:
        """Clear the current selection."""
        pass


class IAdvancedOptionPicker(IOptionPickerWidget):
    """Interface for advanced option picker with filtering and search."""

    @abstractmethod
    def set_filter(self, filter_text: str) -> None:
        """Set filter text."""
        pass

    @abstractmethod
    def get_filtered_options(self) -> list[Any]:
        """Get options after applying filter."""
        pass

    @abstractmethod
    def set_search_enabled(self, enabled: bool) -> None:
        """Enable or disable search functionality."""
        pass


class IOptionPickerService(ABC):
    """Interface for option picker management service."""

    @abstractmethod
    def create_option_picker(self, options: list[Any]) -> IOptionPickerWidget:
        """Create a new option picker widget."""
        pass

    @abstractmethod
    def register_option_picker(
        self, picker_id: str, picker: IOptionPickerWidget
    ) -> None:
        """Register an option picker."""
        pass

    @abstractmethod
    def get_option_picker(self, picker_id: str) -> IOptionPickerWidget | None:
        """Get a registered option picker."""
        pass
