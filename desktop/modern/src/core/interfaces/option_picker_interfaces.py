"""
Option Picker Interfaces

Defines interfaces for option selection and management services.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any


if TYPE_CHECKING:
    from desktop.modern.src.domain.models.pictograph_data import PictographData
    from desktop.modern.src.domain.models.sequence_data import SequenceData


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


class IOptionProvider(ABC):
    """Interface for option provider services."""

    @abstractmethod
    def load_options_from_sequence(
        self, sequence_data: list[dict[str, Any]]
    ) -> list[PictographData]:
        """Load pictograph options based on legacy sequence data."""
        pass

    @abstractmethod
    def load_options_from_modern_sequence(
        self, sequence: SequenceData
    ) -> list[PictographData]:
        """Load pictograph options based on modern sequence data."""
        pass

    @abstractmethod
    def get_current_options(self) -> list[PictographData]:
        """Get the currently loaded pictograph options."""
        pass

    @abstractmethod
    def clear_options(self) -> None:
        """Clear all loaded options."""
        pass

    @abstractmethod
    def get_option_count(self) -> int:
        """Get the number of currently loaded options."""
        pass

    @abstractmethod
    def get_option_by_index(self, index: int) -> PictographData | None:
        """Get option by index."""
        pass

    @abstractmethod
    def filter_options_by_letter(self, letter: str) -> list[PictographData]:
        """Filter current options by letter."""
        pass

    @abstractmethod
    def get_available_letters(self) -> list[str]:
        """Get list of available letters in current options."""
        pass

    @abstractmethod
    def set_signal_emitter(self, signal_emitter: IOptionServiceSignals) -> None:
        """Set the signal emitter for this service."""
        pass


class IOptionServiceSignals(ABC):
    """Interface for option service signal emission."""

    @abstractmethod
    def emit_options_loaded(self, options: list[PictographData]) -> None:
        """Emit signal when options are loaded."""
        pass

    @abstractmethod
    def emit_options_cleared(self) -> None:
        """Emit signal when options are cleared."""
        pass


class IOptionPickerDisplayService(ABC):
    """Interface for option picker display management."""

    @abstractmethod
    def show_options(self, options: list[PictographData]) -> None:
        """Display the given options in the picker."""
        pass

    @abstractmethod
    def hide_options(self) -> None:
        """Hide all options in the picker."""
        pass

    @abstractmethod
    def clear_selection(self) -> None:
        """Clear any selected options."""
        pass

    @abstractmethod
    def set_selected_option(self, option: PictographData) -> None:
        """Set the selected option."""
        pass

    @abstractmethod
    def get_selected_option(self) -> PictographData | None:
        """Get the currently selected option."""
        pass

    @abstractmethod
    def refresh_display(self) -> None:
        """Refresh the display of options."""
        pass

    @abstractmethod
    def set_filter(self, filter_text: str) -> None:
        """Apply a filter to the displayed options."""
        pass

    @abstractmethod
    def get_display_count(self) -> int:
        """Get the number of currently displayed options."""
        pass


class IOptionPickerEventService(ABC):
    """Interface for option picker event handling."""

    @abstractmethod
    def handle_option_selected(self, option: PictographData) -> None:
        """Handle option selection event."""
        pass

    @abstractmethod
    def handle_option_double_clicked(self, option: PictographData) -> None:
        """Handle option double-click event."""
        pass

    @abstractmethod
    def handle_filter_changed(self, filter_text: str) -> None:
        """Handle filter change event."""
        pass

    @abstractmethod
    def handle_clear_selection(self) -> None:
        """Handle clear selection event."""
        pass

    @abstractmethod
    def handle_refresh_requested(self) -> None:
        """Handle refresh request event."""
        pass

    @abstractmethod
    def register_event_handler(self, event_type: str, handler: callable) -> None:
        """Register an event handler for a specific event type."""
        pass

    @abstractmethod
    def unregister_event_handler(self, event_type: str, handler: callable) -> None:
        """Unregister an event handler."""
        pass


class IOptionPickerInitializer(ABC):
    """Interface for option picker initialization."""

    @abstractmethod
    def initialize_option_picker(self, picker_id: str, config: dict[str, Any]) -> None:
        """Initialize an option picker with the given configuration."""
        pass

    @abstractmethod
    def setup_default_options(self, picker_id: str) -> None:
        """Set up default options for an option picker."""
        pass

    @abstractmethod
    def configure_picker_layout(
        self, picker_id: str, layout_config: dict[str, Any]
    ) -> None:
        """Configure the layout of an option picker."""
        pass

    @abstractmethod
    def register_picker_callbacks(
        self, picker_id: str, callbacks: dict[str, callable]
    ) -> None:
        """Register callbacks for picker events."""
        pass

    @abstractmethod
    def validate_picker_configuration(self, config: dict[str, Any]) -> bool:
        """Validate picker configuration."""
        pass

    @abstractmethod
    def get_picker_status(self, picker_id: str) -> dict[str, Any]:
        """Get the current status of a picker."""
        pass

    @abstractmethod
    def cleanup_picker(self, picker_id: str) -> None:
        """Clean up resources for a picker."""
        pass


class IOptionPickerOrchestrator(ABC):
    """Interface for option picker orchestration."""

    @abstractmethod
    def orchestrate_option_loading(self, source: Any, picker_id: str) -> None:
        """Orchestrate the loading of options from a source."""
        pass

    @abstractmethod
    def orchestrate_option_selection(
        self, option: PictographData, picker_id: str
    ) -> None:
        """Orchestrate option selection across all related components."""
        pass

    @abstractmethod
    def orchestrate_filter_application(
        self, filter_criteria: dict[str, Any], picker_id: str
    ) -> None:
        """Orchestrate the application of filters."""
        pass

    @abstractmethod
    def orchestrate_picker_refresh(self, picker_id: str) -> None:
        """Orchestrate a complete refresh of the picker."""
        pass

    @abstractmethod
    def coordinate_multi_picker_sync(self, picker_ids: list[str]) -> None:
        """Coordinate synchronization between multiple pickers."""
        pass

    @abstractmethod
    def handle_picker_state_change(
        self, picker_id: str, new_state: dict[str, Any]
    ) -> None:
        """Handle state changes in a picker."""
        pass

    @abstractmethod
    def get_orchestration_status(self) -> dict[str, Any]:
        """Get the current orchestration status."""
        pass
