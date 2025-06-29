#!/usr/bin/env python3
"""
Dock Window Setup - Window Configuration and Styling
====================================================

Handles window setup and styling for the TKA dock window:
- Window flags and attributes configuration
- Layout setup and container creation
- Styling and theme application
- Window properties management

Architecture:
- Extracted from dock_window.py for better separation of concerns
- Focused on window configuration and visual setup
- Reusable setup logic for different dock configurations
"""

import logging
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QFrame
from PyQt6.QtCore import Qt

from domain.models import DockConfiguration

logger = logging.getLogger(__name__)


class DockWindowSetup:
    """Handles setup and configuration of dock window properties."""

    def __init__(self, dock_config: DockConfiguration):
        """Initialize the window setup helper."""
        self.dock_config = dock_config

    def setup_dock_window(self, dock_widget: QWidget):
        """Setup dock window properties."""
        # Window flags for dock behavior
        dock_widget.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.Tool
            | Qt.WindowType.X11BypassWindowManagerHint
        )

        # Set window attributes
        dock_widget.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        dock_widget.setAttribute(Qt.WidgetAttribute.WA_ShowWithoutActivating)

        # Enable mouse tracking for hover effects
        dock_widget.setMouseTracking(True)

        # Set window title
        dock_widget.setWindowTitle("TKA Dock")

        logger.debug("✅ Dock window properties configured")

    def setup_layout(
        self, dock_widget: QWidget
    ) -> tuple[QVBoxLayout, QFrame, QVBoxLayout]:
        """Setup the dock layout and return layout components."""
        # Main layout - vertical for stacking icons
        main_layout = QVBoxLayout(dock_widget)
        main_layout.setContentsMargins(4, 4, 4, 4)
        main_layout.setSpacing(2)

        # Application icons container
        icons_container = QFrame()
        icons_container.setObjectName("dock_icons_container")

        icons_layout = QVBoxLayout(icons_container)
        icons_layout.setContentsMargins(0, 0, 0, 0)
        icons_layout.setSpacing(2)

        main_layout.addWidget(icons_container)
        main_layout.addStretch()  # Push icons to top

        logger.debug("✅ Dock layout configured")

        return main_layout, icons_container, icons_layout

    def setup_styling(self, dock_widget: QWidget):
        """Setup dock styling."""
        stylesheet = self.get_dock_stylesheet()
        dock_widget.setStyleSheet(stylesheet)
        logger.debug("✅ Dock styling applied")

    def get_dock_stylesheet(self) -> str:
        """Get the complete stylesheet for the dock window."""
        return f"""
            TKADockWindow {{
                background: rgba(20, 20, 20, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }}
            
            #dock_icons_container {{
                background: transparent;
                border: none;
            }}
        """

    def apply_size_configuration(self, dock_widget: QWidget, height: int):
        """Apply size configuration to the dock widget."""
        dock_widget.setFixedSize(self.dock_config.width, height)
        logger.debug(f"✅ Dock size set to {self.dock_config.width}x{height}")

    def get_window_flags(self) -> Qt.WindowType:
        """Get the appropriate window flags for dock behavior."""
        return (
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.Tool
            | Qt.WindowType.X11BypassWindowManagerHint
        )

    def get_window_attributes(self) -> list[Qt.WidgetAttribute]:
        """Get the appropriate window attributes for dock behavior."""
        return [
            Qt.WidgetAttribute.WA_TranslucentBackground,
            Qt.WidgetAttribute.WA_ShowWithoutActivating,
        ]

    def configure_for_position(self, dock_widget: QWidget):
        """Configure window based on dock position."""
        # Additional configuration based on dock position
        if self.dock_config.always_on_top:
            # Ensure always on top is maintained
            dock_widget.raise_()
            dock_widget.activateWindow()

        logger.debug(f"✅ Configured for position: {self.dock_config.position}")

    def update_configuration(self, new_config: DockConfiguration):
        """Update dock configuration."""
        self.dock_config = new_config
        logger.info(f"📝 Updated dock window configuration")

    def get_layout_margins(self) -> tuple[int, int, int, int]:
        """Get layout margins for the dock."""
        return (4, 4, 4, 4)  # left, top, right, bottom

    def get_icon_spacing(self) -> int:
        """Get spacing between icons."""
        return 2

    def validate_configuration(self) -> bool:
        """Validate the current dock configuration."""
        if self.dock_config.width <= 0:
            logger.error("❌ Invalid dock width")
            return False

        if self.dock_config.margin_x < 0 or self.dock_config.margin_y < 0:
            logger.error("❌ Invalid dock margins")
            return False

        return True

    def get_setup_info(self) -> dict:
        """Get information about the current setup configuration."""
        return {
            "dock_config": {
                "width": self.dock_config.width,
                "position": self.dock_config.position.value,
                "always_on_top": self.dock_config.always_on_top,
                "auto_hide": self.dock_config.auto_hide,
            },
            "layout_settings": {
                "margins": self.get_layout_margins(),
                "icon_spacing": self.get_icon_spacing(),
            },
            "window_flags": str(self.get_window_flags()),
            "window_attributes": [str(attr) for attr in self.get_window_attributes()],
        }
