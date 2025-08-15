"""
UI Setup Manager

Pure service for managing UI component setup and initialization.
Extracted from KineticConstructorModern to follow single responsibility principle.

PROVIDES:
- Main window UI setup
- Tab widget creation and configuration
- Header layout with title and settings
- Construct tab loading with progress tracking
- Component styling and layout management
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Callable

from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont
from PyQt6.QtWidgets import (
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from desktop.modern.src.core.interfaces.session_services import ISessionStateTracker
from presentation.tabs.construct.construct_tab_widget import ConstructTabWidget


if TYPE_CHECKING:
    from desktop.modern.src.core.dependency_injection.di_container import DIContainer


class IUISetupManager(ABC):
    """Interface for UI setup operations."""

    @abstractmethod
    def setup_main_ui(
        self,
        main_window: QMainWindow,
        container: DIContainer,
        progress_callback: Callable | None = None,
    ) -> QTabWidget:
        """Setup the main UI components and return the tab widget."""

    @abstractmethod
    def create_header_layout(self, main_window: QMainWindow) -> QHBoxLayout:
        """Create header layout with title and settings button."""

    @abstractmethod
    def create_tab_widget(self) -> QTabWidget:
        """Create and configure the main tab widget."""


class UISetupManager(IUISetupManager):
    """
    Pure service for UI setup and component management.

    Handles all UI initialization without business logic dependencies.
    Uses clean separation of concerns following TKA architecture.
    """

    def __init__(self):
        """Initialize UI setup manager."""
        self.tab_widget: QTabWidget | None = None
        self.settings_button = None

    def setup_main_ui(
        self,
        main_window: QMainWindow,
        container: DIContainer,
        progress_callback: Callable | None = None,
        session_service=None,
    ) -> QTabWidget:
        """Setup the main UI components and return the tab widget."""
        if progress_callback:
            progress_callback(65, "Creating central widget...")

        # Create central widget
        central_widget = QWidget()
        central_widget.setStyleSheet("background: transparent;")
        main_window.setCentralWidget(central_widget)

        if progress_callback:
            progress_callback(67, "Setting up main layout...")

        # Create main layout
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(20, 20, 20, 20)

        if progress_callback:
            progress_callback(70, "Creating header interface...")

        # Create header
        header_layout = self.create_header_layout(main_window)
        layout.addLayout(header_layout)

        if progress_callback:
            progress_callback(72, "Creating tab interface...")

        # Create tab widget
        self.tab_widget = self.create_tab_widget()
        layout.addWidget(self.tab_widget)

        if progress_callback:
            progress_callback(75, "Loading construct tab...")

        # Load construct tab completely during splash screen phase
        self._load_construct_tab(container, progress_callback, session_service)

        if progress_callback:
            progress_callback(95, "Finalizing interface...")

        # Note: Only Construct tab is needed - placeholder tabs removed for cleaner UI

        return self.tab_widget

    def create_header_layout(self, main_window: QMainWindow) -> QHBoxLayout:
        """Create header layout with title and settings button."""
        header_layout = QHBoxLayout()

        # Create title
        title = QLabel("🚀 Kinetic Constructor")
        title.setFont(QFont("Arial", 20, QFont.Weight.Bold))
        title.setStyleSheet("color: white; margin: 20px; background: transparent;")

        # Create settings button using dependency injection
        self.settings_button = self._create_settings_button()
        self.settings_button.settings_requested.connect(
            lambda: self._show_settings(main_window)
        )

        header_layout.addWidget(title)
        header_layout.addStretch()
        header_layout.addWidget(self.settings_button)

        return header_layout

    def create_tab_widget(self) -> QTabWidget:
        """Create and configure the main tab widget."""
        tab_widget = QTabWidget()
        tab_widget.setTabPosition(QTabWidget.TabPosition.North)

        # Hide tab bar since we only have one tab for cleaner UI
        tab_widget.tabBar().setVisible(False)

        tab_widget.setStyleSheet(
            """
            QTabWidget::pane {
                border: none;
                background: transparent;
            }
            QTabBar::tab {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                padding: 8px 16px;
                margin: 2px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
                border-bottom-color: transparent;
            }
            QTabBar::tab:selected {
                background: rgba(255, 255, 255, 0.2);
                border-bottom-color: transparent;
            }
            QTabBar::tab:hover {
                background: rgba(255, 255, 255, 0.15);
            }
        """
        )
        return tab_widget

    def _load_construct_tab(
        self,
        container: DIContainer,
        progress_callback: Callable | None = None,
        session_service=None,
    ) -> None:
        """Load construct tab with granular progress updates."""
        try:
            # Step 1: Initialize container (76-78%)
            if progress_callback:
                progress_callback(76, "Preparing construct tab dependencies...")

            if progress_callback:
                progress_callback(78, "Loading pictograph dataset...")

            # Lazy import construct tab only when loading
            from presentation.tabs.construct.construct_tab_widget import (
                ConstructTabWidget,
            )

            if progress_callback:
                progress_callback(80, "Initializing construct tab services...")

            if progress_callback:
                progress_callback(82, "Setting up option picker components...")

            # Step 3: Create widget with progress callback (84-90%)
            if progress_callback:
                progress_callback(84, "Creating construct tab widget...")

            # Create internal progress callback with enhanced feedback
            def internal_progress_callback(step: str, progress: float):
                if progress_callback:
                    # Map internal progress (0.0-1.0) to our range (84-90%)
                    mapped_progress = 84 + (progress * 6)  # 6% range for internal steps
                    progress_callback(int(mapped_progress), f"🔧 {step}")

            if progress_callback:
                progress_callback(86, "Initializing UI components...")

            # Create construct tab
            construct_tab = ConstructTabWidget(
                container, progress_callback=internal_progress_callback
            )

            # CRITICAL: Connect construct tab to session service for auto-save
            self._connect_construct_tab_to_session(construct_tab, session_service)

            if progress_callback:
                progress_callback(88, "Configuring construct tab styling...")

            construct_tab.setStyleSheet("background: transparent;")

            if progress_callback:
                progress_callback(90, "Adding construct tab to interface...")

            self.tab_widget.addTab(construct_tab, "🔧 Construct")

            # WINDOW MANAGEMENT FIX: Keep widgets hidden during splash screen
            # They will be shown when the main window is displayed
            self.tab_widget.hide()
            self.tab_widget.setVisible(False)
            construct_tab.hide()
            construct_tab.setVisible(False)

            # Set construct tab as current tab
            self.tab_widget.setCurrentIndex(0)

            if progress_callback:
                progress_callback(92, "Construct tab fully loaded and ready!")

        except Exception as e:
            import traceback

            print(f"⚠️ Error loading construct tab: {e}")
            print("🔍 Full traceback:")
            traceback.print_exc()
            if progress_callback:
                progress_callback(85, "Construct tab load failed, using fallback...")

            # Create fallback placeholder
            fallback_placeholder = QLabel("🚧 Construct tab loading failed...")
            fallback_placeholder.setAlignment(Qt.AlignmentFlag.AlignCenter)
            fallback_placeholder.setStyleSheet(
                "color: white; font-size: 14px; background: transparent;"
            )
            self.tab_widget.addTab(fallback_placeholder, "🔧 Construct")

    def _connect_construct_tab_to_session(
        self,
        construct_tab: ConstructTabWidget,
        session_state_tracker: ISessionStateTracker,
    ) -> None:
        """Connect construct tab sequence modifications to session service for auto-save."""
        try:
            if not session_state_tracker:
                return

            # Connect sequence modification signals to session service
            def on_sequence_modified(sequence_data):
                """Handle sequence modification from construct tab."""
                # Update session with current sequence
                sequence_id = (
                    sequence_data.id
                    if hasattr(sequence_data, "id")
                    else str(sequence_data)
                )
                session_state_tracker.update_current_sequence(
                    sequence_data, sequence_id
                )

            # Connect the signal
            construct_tab.sequence_modified.connect(on_sequence_modified)

        except Exception as e:
            print(f"⚠️ Failed to connect construct tab to session service: {e}")

    def _create_settings_button(self):
        """Create settings button using dependency injection."""
        from desktop.modern.src.presentation.components.ui.settings.settings_button import (
            SettingsButton,
        )

        return SettingsButton()

    def _show_settings(self, main_window: QMainWindow) -> None:
        """Open the settings dialog using dependency injection."""
        try:
            from desktop.modern.src.core.dependency_injection.di_container import (
                get_container,
            )
            from desktop.modern.src.core.interfaces.core_services import IUIStateManager
            from desktop.modern.src.presentation.components.ui.settings.settings_dialog import (
                SettingsDialog,
            )

            # Get UI state service from container
            container = get_container()
            ui_state_service = container.resolve(IUIStateManager)
            dialog = SettingsDialog(ui_state_service, main_window, container)

            # Connect to settings changes if needed
            dialog.settings_changed.connect(
                lambda key, value: self._on_setting_changed(key, value, main_window)
            )

            # Show the dialog
            _ = dialog.exec()

            # Clean up dialog resources after it closes
            dialog.deleteLater()

        except Exception as e:
            print(f"⚠️ Failed to open settings dialog: {e}")
            import traceback

            traceback.print_exc()

    def _on_setting_changed(self, key: str, value, main_window: QMainWindow) -> None:
        """Handle settings changes from the dialog."""
        print(f"🔧 Setting changed: {key} = {value}")

        # Handle background changes
        if key == "background_type":
            # Delegate to background manager
            from desktop.modern.src.application.services.ui.background_manager import (
                BackgroundManager,
            )

            background_manager = BackgroundManager()
            background_manager.apply_background_change(main_window, value)
