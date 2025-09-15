#!/usr/bin/env python3
"""
TKA Main Window
===============

Main application window for the TKA Desktop Modern application.
Provides the primary UI container and orchestrates the application components.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from PyQt6.QtWidgets import QMainWindow, QTabWidget


if TYPE_CHECKING:
    from desktop.modern.src.core.dependency_injection.di_container import DIContainer

logger = logging.getLogger(__name__)


class TKAMainWindow(QMainWindow):
    """
    Main application window for TKA Desktop Modern.

    Responsibilities:
    - Provide main window container
    - Initialize application orchestrator
    - Manage window lifecycle
    - Handle window positioning and sizing
    """

    def __init__(self, container: DIContainer):
        """Initialize the main window with dependency injection container."""
        super().__init__()

        self.container = container
        self.tab_widget: QTabWidget | None = None
        self.orchestrator = None

        # Initialize the UI
        self._initialize_ui()

        logger.info("TKAMainWindow initialized successfully")

    def _initialize_ui(self) -> None:
        """Initialize the main UI components."""
        from desktop.modern.src.application.services.core.application_orchestrator import (
            ApplicationOrchestrator,
        )

        # Create orchestrator and initialize application
        self.orchestrator = ApplicationOrchestrator()
        self.tab_widget = self.orchestrator.initialize_application(self)

    def show(self):
        """Override show to ensure tab widget is properly displayed."""
        super().show()

        # Ensure tab widget is shown when main window is shown
        if hasattr(self, "tab_widget") and self.tab_widget:
            self.tab_widget.show()

    def closeEvent(self, event):
        """Handle window close event with proper cleanup."""
        try:
            if self.orchestrator:
                self.orchestrator.cleanup_application()
            logger.info("TKAMainWindow closed successfully")
        except Exception as e:
            logger.exception(f"Error during window close: {e}")

        event.accept()
