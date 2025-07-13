"""
Modern Menu Bar Widget

Main menu bar component for the TKA modern desktop app.
Provides navigation, settings access, and social media integration.
"""

from typing import TYPE_CHECKING, Callable, Optional

from PyQt6.QtCore import QSize, pyqtSignal
from PyQt6.QtWidgets import QHBoxLayout, QVBoxLayout, QWidget

from .buttons.styled_button import ButtonContext, StyledButton
from .navigation.menu_bar_navigation_widget import MenuBarNavigationWidget

if TYPE_CHECKING:
    pass


class MenuBarWidget(QWidget):
    """Modern menu bar with navigation and utility buttons."""

    tab_changed = pyqtSignal(str)  # Forward navigation signals
    settings_requested = pyqtSignal()

    def __init__(
        self, parent=None, size_provider: Optional[Callable[[], QSize]] = None
    ):
        super().__init__(parent)

        self._size_provider = size_provider or self._default_size_provider

        self._setup_ui()
        self._setup_styling()
        self._connect_signals()

    def _default_size_provider(self) -> QSize:
        """Default size provider if none given."""
        return QSize(1200, 800)

    def _setup_ui(self):
        """Setup the UI layout and components."""
        # Main layout
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Create single container that holds both navigation and settings
        self.main_container = QWidget()
        main_layout.addWidget(self.main_container)

        # Container layout - horizontal to hold navigation and settings side by side
        container_layout = QHBoxLayout(self.main_container)
        container_layout.setContentsMargins(10, 5, 10, 5)
        container_layout.setSpacing(0)

        # Navigation section
        self.navigation_widget = MenuBarNavigationWidget(
            parent=self.main_container, size_provider=self._size_provider
        )
        container_layout.addWidget(self.navigation_widget)

        # Settings button - positioned on the right
        self.settings_button = StyledButton(
            label="⚙️ Settings",
            context=ButtonContext.SETTINGS,
            parent=self.main_container,
        )
        self.settings_button.clicked.connect(lambda: self.settings_requested.emit())
        container_layout.addWidget(self.settings_button)

        # Style the main container with more transparency to show background
        self.main_container.setStyleSheet(
            """
            QWidget {
                background: rgba(30, 30, 30, 0.3);
                border-bottom: 2px solid rgba(100, 149, 237, 0.2);
                border-radius: 0px;
            }
        """
        )
        self.main_container.setFixedHeight(60)

    def _setup_styling(self):
        """Apply styling to the menu bar."""
        self.setStyleSheet(
            """
            MenuBarWidget {
                background: transparent;
                border: none;
            }
        """
        )

    def _connect_signals(self):
        """Connect internal signals."""
        # Forward navigation signals
        self.navigation_widget.tab_changed.connect(self.tab_changed.emit)

    def set_active_tab(self, tab_name: str):
        """Set the active tab in the navigation widget."""
        self.navigation_widget.set_active_tab(tab_name)

    def get_current_tab(self) -> str:
        """Get the currently active tab."""
        return self.navigation_widget.get_current_tab()

    def get_available_tabs(self) -> list[str]:
        """Get list of available tabs."""
        return self.navigation_widget.get_available_tabs()

    def update_size_provider(self, size_provider: Callable[[], QSize]):
        """Update size provider for responsive design."""
        self._size_provider = size_provider
        self.navigation_widget.update_size_provider(size_provider)

    def resizeEvent(self, event):
        """Handle resize events."""
        super().resizeEvent(event)

        # Update button sizing in settings button
        if hasattr(self, "settings_button"):
            available_size = self._size_provider()
            font_size = max(9, min(12, available_size.width() // 120))

            from PyQt6.QtGui import QFont

            font = QFont("Segoe UI", font_size, QFont.Weight.Medium)
            self.settings_button.setFont(font)
            self.settings_button.update_appearance()

            # Set a reasonable fixed width for the settings button
            settings_width = max(100, min(140, available_size.width() // 10))
            self.settings_button.setFixedSize(settings_width, 40)
