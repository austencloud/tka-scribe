"""
Option Picker Widget - Clean Service Integration

Main option picker widget that coordinates between services and UI components.
Uses dependency injection to obtain services from DI container.

Key principles:
- Service resolution from DI container
- Clean coordination between services and UI
- No business logic - pure widget composition
"""

from typing import Callable, Optional

# Services are resolved via DI container - no direct imports needed
from core.dependency_injection.di_container import DIContainer
from presentation.components.option_picker.components.choose_your_next_option_label import (
    ChooseYourNextOptionLabel,
)
from presentation.components.option_picker.components.option_picker_scroll import (
    OptionPickerScroll,
)
from PyQt6.QtCore import QSize, pyqtSignal
from PyQt6.QtWidgets import QVBoxLayout, QWidget


class OptionPickerWidget(QWidget):
    """
    Clean option picker widget with service integration.

    Resolves services from DI container and coordinates UI components.
    """

    # Signal emitted when a pictograph is selected
    pictograph_selected = pyqtSignal(object)  # PictographData

    def __init__(
        self,
        parent=None,
        mw_size_provider: Callable[[], QSize] = None,
        progress_callback: Optional[Callable[[str, float], None]] = None,
        container: Optional[DIContainer] = None,
    ):
        """Initialize with service resolution from DI container."""
        super().__init__(parent)

        self.mw_size_provider = mw_size_provider
        self.progress_callback = progress_callback
        self.container = container

        # ✅ Create the "Choose your next option" label (matching legacy)
        self.choose_next_label = ChooseYourNextOptionLabel(
            size_provider=self.mw_size_provider, parent=self
        )

        # ✅ Use DI container to create OptionPickerScroll with injected services
        if not container:
            raise ValueError(
                "DI container is required for OptionPickerWidget - no fallback available"
            )

        try:
            # Use the DI container factory to create OptionPickerScroll with proper service injection
            self.option_picker_scroll = container.resolve(OptionPickerScroll)
            # Set the parent and size provider after creation
            self.option_picker_scroll.setParent(self)
            self.option_picker_scroll.mw_size_provider = self.mw_size_provider
            print("✅ [OPTION_WIDGET] Created OptionPickerScroll with proper DI")
        except Exception as e:
            print(
                f"❌ [OPTION_WIDGET] Failed to resolve OptionPickerScroll from container: {e}"
            )
            raise RuntimeError(f"Failed to create OptionPickerScroll: {e}") from e

        # ✅ Connect Qt signals
        self.option_picker_scroll.pictograph_selected.connect(
            self.pictograph_selected.emit
        )

        # ✅ Setup Qt layout with label and scroll area
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(5)  # Small spacing between label and scroll area
        
        # Add the label first, then the scroll area
        layout.addWidget(self.choose_next_label)
        layout.addWidget(self.option_picker_scroll)

        # Report progress
        if self.progress_callback:
            self.progress_callback("Option picker initialized", 1.0)

    def refresh_options(self) -> None:
        """Refresh options - clear all sections."""
        self.option_picker_scroll.clear_all_sections()

    def clear_options(self) -> None:
        """Clear all options."""
        self.option_picker_scroll.clear_all_sections()

    def get_widget(self) -> QWidget:
        """Get the main widget for integration."""
        return self.option_picker_scroll

    def load_motion_combinations(self, sequence_data) -> None:
        """Load motion combinations based on sequence data."""
        self.option_picker_scroll.load_options_from_sequence(sequence_data)

    def refresh_from_sequence(self, sequence) -> None:
        """Refresh from sequence data."""
        self.option_picker_scroll.load_options_from_sequence(sequence)

    def initialize(self) -> None:
        """Initialize - already done in constructor."""
        pass

    def cleanup(self) -> None:
        """Cleanup resources."""
        if hasattr(self, "option_picker_scroll") and self.option_picker_scroll:
            self.option_picker_scroll.clear_all_sections()
        
        # Clean up the label
        if hasattr(self, "choose_next_label") and self.choose_next_label:
            self.choose_next_label.setParent(None)

    def get_service_status(self) -> dict:
        """Get status of injected services (for debugging)."""
        return {
            "option_picker_scroll": self.option_picker_scroll is not None,
            "container": self.container is not None,
            "mw_size_provider": self.mw_size_provider is not None,
        }
