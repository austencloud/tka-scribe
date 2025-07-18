"""
Modern Browse Tab - Main Entry Point

Clean, simplified browse tab implementation focused on the real complexity
identified in the Legacy audit: UI responsiveness and thumbnail management.
"""

from pathlib import Path
from typing import Optional

from presentation.tabs.browse.components.browse_navigation_stack import (
    BrowseNavigationStack,
)
from presentation.tabs.browse.components.filter_selection_panel import (
    FilterSelectionPanel,
)
from presentation.tabs.browse.components.sequence_browser_panel import (
    SequenceBrowserPanel,
)
from presentation.tabs.browse.models import BrowseTabSection, FilterType, NavigationMode
from presentation.tabs.browse.services.browse_service import BrowseService
from presentation.tabs.browse.services.browse_state_service import BrowseStateService
from PyQt6.QtCore import QTimer, pyqtSignal
from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import QFrame, QLabel, QStackedWidget, QVBoxLayout, QWidget


class ModernBrowseTab(QWidget):
    """
    REPLACES: Legacy BrowseTab with clean modern architecture

    Main browse tab widget that coordinates between filter selection and sequence browsing.
    Focuses on the real complexity: responsive UI and state management.
    """

    # Signals for communication with main app
    sequence_selected = pyqtSignal(str)  # sequence_id
    open_in_construct = pyqtSignal(str)  # sequence_id

    def __init__(
        self, sequences_dir: Path, settings_file: Path, parent: Optional[QWidget] = None
    ):
        """Initialize the modern browse tab."""
        super().__init__(parent)

        # Initialize services
        self.browse_service = BrowseService(sequences_dir)
        self.state_service = BrowseStateService(settings_file)

        # Setup UI
        self._setup_ui()
        self._connect_signals()

        # Load initial state
        QTimer.singleShot(0, self._load_initial_state)

    def _setup_ui(self) -> None:
        """Setup the main UI layout."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Create main navigation stack
        self.navigation_stack = BrowseNavigationStack()

        # Create panels
        self.filter_panel = FilterSelectionPanel(self.browse_service)
        self.browser_panel = SequenceBrowserPanel(
            self.browse_service, self.state_service
        )

        # Add panels to navigation stack
        self.navigation_stack.add_panel("filter_selection", self.filter_panel)
        self.navigation_stack.add_panel("sequence_browser", self.browser_panel)

        # Add to main layout
        layout.addWidget(self.navigation_stack)

        # Start with filter selection
        self.navigation_stack.show_panel("filter_selection")

    def _connect_signals(self) -> None:
        """Connect component signals."""
        # Filter selection signals
        self.filter_panel.filter_selected.connect(self._on_filter_selected)

        # Browser panel signals
        self.browser_panel.sequence_selected.connect(self.sequence_selected.emit)
        self.browser_panel.open_in_construct.connect(self.open_in_construct.emit)
        self.browser_panel.back_to_filters.connect(self._show_filter_selection)

    def _load_initial_state(self) -> None:
        """Load and restore the previous browse state."""
        current_mode = self.state_service.get_current_navigation_mode()

        if current_mode == NavigationMode.FILTER_SELECTION:
            self._show_filter_selection()
        else:
            self._show_sequence_browser()

    def _on_filter_selected(self, filter_type: FilterType, filter_value) -> None:
        """Handle filter selection - show filtered sequences."""
        # Save filter state
        self.state_service.set_filter(filter_type, filter_value)

        # Apply filter and show results
        filtered_sequences = self.browse_service.apply_filter(filter_type, filter_value)
        self.browser_panel.show_sequences(filtered_sequences)

        # Switch to browser view
        self._show_sequence_browser()

    def _show_filter_selection(self) -> None:
        """Show filter selection panel."""
        self.state_service.set_navigation_mode(NavigationMode.FILTER_SELECTION)
        self.navigation_stack.show_panel("filter_selection")

    def _show_sequence_browser(self) -> None:
        """Show sequence browser panel."""
        self.state_service.set_navigation_mode(NavigationMode.SEQUENCE_BROWSER)
        self.navigation_stack.show_panel("sequence_browser")

    def refresh_sequences(self) -> None:
        """Refresh sequence data from disk."""
        self.browse_service.clear_cache()

        # If we're currently showing filtered results, reapply the filter
        filter_type, filter_value = self.state_service.get_current_filter()
        if filter_type:
            filtered_sequences = self.browse_service.apply_filter(
                filter_type, filter_value
            )
            self.browser_panel.show_sequences(filtered_sequences)

    def get_current_section(self) -> BrowseTabSection:
        """Get current browse tab section for external coordination."""
        current_mode = self.state_service.get_current_navigation_mode()

        if current_mode == NavigationMode.FILTER_SELECTION:
            return BrowseTabSection.FILTER_SELECTOR
        else:
            return BrowseTabSection.SEQUENCE_PICKER
