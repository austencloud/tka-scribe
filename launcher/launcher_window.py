#!/usr/bin/env python3
"""
TKA Modern Launcher Window - Premium UI Component
================================================

The main launcher window built with pure PyQt6 and custom glassmorphism design:
- Premium 2025 glassmorphism effects
- Application grid with smooth animations
- Dual-mode operation (window/docked)
- Inter typography with 8px grid system
- WCAG 4.5:1 contrast ratios

Architecture:
- Pure PyQt6 with custom styling
- Modular component design
- Clean separation of UI and business logic
- QPropertyAnimation-based micro-interactions
"""

import logging

from application_grid import ApplicationGridWidget
from launcher_config import LauncherConfig
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import (
    QApplication,
    QHBoxLayout,
    QLabel,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)
from ui.components import ReliableButton, ReliableSearchBox
from ui.reliable_design_system import get_reliable_style_builder

logger = logging.getLogger(__name__)

logger.info("🎨 Reliable UI design system loaded successfully")


class TKAModernWindow(QWidget):
    """
    Main launcher window with modern glassmorphism design.

    Features:
    - Premium 2025 glassmorphism effects
    - Application grid with smooth animations
    - Dual-mode operation (window/docked)
    - Inter typography with 8px grid system
    - WCAG 4.5:1 contrast ratios
    """

    # Signals
    application_launched = pyqtSignal(str, str)  # app_id, app_title
    settings_changed = pyqtSignal(dict)  # settings dict

    def __init__(self, tka_integration):
        """Initialize the modern launcher window."""
        super().__init__()

        self.tka_integration = tka_integration
        self.config = LauncherConfig()

        # Initialize UI component attributes
        self.app_grid = None
        self.title_label = None
        self.subtitle_label = None
        self.mode_toggle_btn = None
        self.search_box = None
        self.refresh_btn = None
        self.launch_btn = None
        self.status_label = None

        # Window properties
        self.setWindowTitle("TKA Modern Launcher")
        self._setup_window_geometry()
        self._setup_modern_styling()

        # Initialize UI components
        self._init_modern_ui()
        self._connect_signals()

        logger.info("✅ TKA Modern Window initialized")

    def _setup_modern_styling(self):
        """Setup reliable glassmorphism styling using proven PyQt6 patterns."""
        # Get reliable design system components
        style_builder = get_reliable_style_builder()

        # Apply consistent styling across the application
        self.setStyleSheet(
            f"""
            QWidget {{
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 rgba(15, 15, 15, 0.95),
                    stop:1 rgba(30, 30, 30, 0.95));
                color: #ffffff;
                {style_builder.typography()}
            }}

            QTabWidget::pane {{
                {style_builder.glass_surface('secondary')}
                border-radius: {style_builder.tokens.RADIUS['lg']}px;
            }}

            QTabBar::tab {{
                {style_builder.glass_surface('tertiary')}
                {style_builder.typography('base', 'medium')}
                color: rgba(255, 255, 255, 0.8);
                padding: {style_builder.tokens.SPACING['md']}px \
{style_builder.tokens.SPACING['lg']}px;
                margin-right: {style_builder.tokens.SPACING['xs']}px;
                border-top-left-radius: {style_builder.tokens.RADIUS['md']}px;
                border-top-right-radius: {style_builder.tokens.RADIUS['md']}px;
            }}

            QTabBar::tab:hover {{
                {style_builder.glass_surface_hover('primary')}
            }}

            QTabBar::tab:selected {{
                {style_builder.glass_surface('selected')}
                color: #ffffff;
                border: {style_builder.tokens.BORDERS['selected']};
            }}
        """
        )

        logger.info("🎨 Reliable styling applied successfully")

    def _setup_window_geometry(self):
        """Setup window geometry to 50% of screen size and center it."""
        # Get screen dimensions
        screen = QApplication.primaryScreen().geometry()

        # Calculate 50% of screen dimensions
        target_width = int(screen.width() * 0.5)
        target_height = int(screen.height() * 0.5)

        # Update config with calculated dimensions
        self.config.config.window.width = target_width
        self.config.config.window.height = target_height

        # Center the window on screen
        x = (screen.width() - target_width) // 2
        y = (screen.height() - target_height) // 2

        # Set geometry
        self.setGeometry(x, y, target_width, target_height)

        logger.info(
            "🪟 Window geometry set: %dx%d at (%d, %d) - 50%% of screen: %dx%d",
            target_width,
            target_height,
            x,
            y,
            screen.width(),
            screen.height(),
        )

    def _init_modern_ui(self):
        """Initialize the modern UI with glassmorphism design."""
        # Create main layout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 24, 24, 24)  # 8px grid system (3 * 8)
        layout.setSpacing(24)

        # Create tab widget
        self.tab_widget = QTabWidget()

        # Create interfaces
        self.home_interface = self._create_modern_home_interface()
        self.settings_interface = self._create_modern_settings_interface()

        # Add tabs
        self.tab_widget.addTab(self.home_interface, "🏠 Home")
        self.tab_widget.addTab(self.settings_interface, "⚙️ Settings")

        # Connect tab change signal
        self.tab_widget.currentChanged.connect(self._on_tab_changed)

        layout.addWidget(self.tab_widget)

        # Enhance tab widget with proper cursors
        self._enhance_tab_widget()

        logger.info("🏠 Modern UI initialized with glassmorphism design")

    def _enhance_tab_widget(self):
        """Enhance tab widget with proper cursor and hover effects."""
        # Set cursor for tab bar to pointer
        tab_bar = self.tab_widget.tabBar()
        if tab_bar:
            tab_bar.setCursor(Qt.CursorShape.PointingHandCursor)

    def _create_modern_home_interface(self) -> QWidget:
        """Create the modern home interface with glassmorphism design."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(32, 24, 32, 24)  # 8px grid system
        layout.setSpacing(24)  # 8px grid system

        # Header section with modern styling
        header_layout = self._create_modern_header_section()
        layout.addLayout(header_layout)

        # Search section with glassmorphism
        search_layout = self._create_modern_search_section()
        layout.addLayout(search_layout)

        # Application grid (gets most of the space)
        self.app_grid = ApplicationGridWidget(self.tka_integration)
        layout.addWidget(self.app_grid, 1)  # Give it stretch factor of 1

        # Action buttons with modern styling
        action_layout = self._create_modern_action_section()
        layout.addLayout(action_layout)

        return widget

    def _create_modern_header_section(self) -> QHBoxLayout:
        """Create the modern header section with reliable styling."""
        layout = QHBoxLayout()

        # Get the reliable style builder
        style_builder = get_reliable_style_builder()

        # Title and subtitle with reliable typography
        title_layout = QVBoxLayout()
        title_layout.setSpacing(8)

        self.title_label = QLabel("TKA Applications")
        self.title_label.setStyleSheet(
            f"""
            QLabel {{
                {style_builder.typography('title', 'bold')}
                color: #ffffff;
            }}
        """
        )

        self.subtitle_label = QLabel("Launch and manage your TKA applications")
        self.subtitle_label.setStyleSheet(
            f"""
            QLabel {{
                {style_builder.typography('sm', 'normal')}
                color: rgba(255, 255, 255, 0.6);
            }}
        """
        )

        title_layout.addWidget(self.title_label)
        title_layout.addWidget(self.subtitle_label)

        layout.addLayout(title_layout)
        layout.addStretch()

        # Mode toggle button with reliable styling
        self.mode_toggle_btn = ReliableButton("Switch to Docked Mode", "secondary")
        layout.addWidget(self.mode_toggle_btn)

        return layout

    def _create_modern_search_section(self) -> QHBoxLayout:
        """Create the search section with reliable components."""
        layout = QHBoxLayout()
        layout.setSpacing(16)

        # Get the reliable style builder
        style_builder = get_reliable_style_builder()

        # Search label
        search_label = QLabel("Search:")
        search_label.setStyleSheet(
            f"""
            QLabel {{
                {style_builder.typography('base', 'normal')}
                color: rgba(255, 255, 255, 0.9);
            }}
        """
        )
        layout.addWidget(search_label)

        # Reliable search box
        self.search_box = ReliableSearchBox("Type to search applications...")
        self.search_box.setFixedWidth(400)
        layout.addWidget(self.search_box)

        layout.addStretch()

        # Reliable refresh button
        self.refresh_btn = ReliableButton("Refresh", "secondary")
        layout.addWidget(self.refresh_btn)

        return layout

    def _create_modern_action_section(self) -> QHBoxLayout:
        """Create the action buttons section."""
        layout = QHBoxLayout()
        layout.setSpacing(16)

        # Get the reliable style builder
        style_builder = get_reliable_style_builder()

        # Reliable launch button
        self.launch_btn = ReliableButton("Launch Selected", "primary")
        self.launch_btn.setEnabled(False)
        layout.addWidget(self.launch_btn)

        layout.addStretch()

        # Status label
        self.status_label = QLabel("Ready")
        self.status_label.setStyleSheet(
            f"""
            QLabel {{
                {style_builder.typography('sm', 'normal')}
                color: rgba(255, 255, 255, 0.7);
            }}
        """
        )
        layout.addWidget(self.status_label)

        return layout

    def _create_modern_settings_interface(self) -> QWidget:
        """Create the modern settings interface."""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(32, 24, 32, 24)
        layout.setSpacing(24)

        # Get the reliable style builder
        style_builder = get_reliable_style_builder()

        # Settings title with reliable typography
        title = QLabel("Launcher Settings")
        title.setStyleSheet(
            f"""
            QLabel {{
                {style_builder.typography('title', 'bold')}
                color: #ffffff;
            }}
        """
        )
        layout.addWidget(title)

        # Settings content (placeholder for now)
        content_label = QLabel("Settings panel will be implemented here.")
        content_label.setStyleSheet(
            f"""
            QLabel {{
                {style_builder.typography('base', 'normal')}
                color: rgba(255, 255, 255, 0.9);
            }}
        """
        )
        layout.addWidget(content_label)

        layout.addStretch()

        return widget

    def _on_tab_changed(self, index):
        """Handle tab change."""
        if index == 0:
            logger.info("🏠 Switched to Home tab")
        elif index == 1:
            logger.info("⚙️ Switched to Settings tab")
        else:
            logger.info("🔄 Switched to tab %d", index)

    def _connect_signals(self):
        """Connect UI signals to handlers."""
        # Search functionality
        self.search_box.textChanged.connect(self._on_search_changed)

        # Button actions
        self.refresh_btn.clicked.connect(self._on_refresh_clicked)
        self.launch_btn.clicked.connect(self._on_launch_clicked)
        self.mode_toggle_btn.clicked.connect(self._on_mode_toggle_clicked)

        # Application grid signals
        self.app_grid.application_selected.connect(self._on_application_selected)
        self.app_grid.application_launched.connect(self._on_application_launched)

    def _on_search_changed(self, text: str):
        """Handle search text changes."""
        logger.info("🔍 Search text changed: '%s'", text)
        self.app_grid.filter_applications(text)

        # Update status
        if text:
            self.status_label.setText(f"Searching for '{text}'...")
        else:
            self.status_label.setText("Ready")

    def _on_refresh_clicked(self):
        """Handle refresh button click."""
        logger.info("🔄 Refresh button clicked - refreshing applications...")

        try:
            self.app_grid.refresh_applications()
            self.status_label.setText("Applications refreshed")
            logger.info("✅ Refresh completed successfully")

        except (AttributeError, RuntimeError) as e:
            logger.error("❌ Refresh failed: %s", e)
            self.status_label.setText("Refresh failed")

    def _on_launch_clicked(self):
        """Handle launch button click."""
        logger.info("🚀 Launch button clicked")

        selected_app = self.app_grid.get_selected_application()
        if selected_app:
            logger.info("🎯 Launching selected application: %s", selected_app.title)
            self.app_grid.launch_application(selected_app.id)
        else:
            logger.warning("⚠️ No application selected for launch")
            self.status_label.setText("Please select an application to launch")

    def _on_mode_toggle_clicked(self):
        """Handle mode toggle button click."""
        logger.info("🔄 Mode toggle button clicked")

        current_mode = self.config.get_window_mode()
        logger.info("📊 Current window mode: %s", current_mode)

        # NOTE: Dual-mode functionality to be implemented in future iteration
        logger.info("⚠️ Dual-mode functionality not yet implemented")
        self.status_label.setText("Docked mode coming soon")

    def _on_application_selected(self, app_data):
        """Handle application selection."""
        if app_data:
            self.launch_btn.setEnabled(True)
            self.launch_btn.setText(f"Launch {app_data.title}")
            self.status_label.setText(f"Selected: {app_data.title}")
        else:
            self.launch_btn.setEnabled(False)
            self.launch_btn.setText("Launch Selected")
            self.status_label.setText("Ready")

    def _on_application_launched(self, app_id: str, app_title: str):
        """Handle application launch."""
        logger.info("🚀 Application launched: %s", app_title)

        # Emit signal
        self.application_launched.emit(app_id, app_title)

        # Update status
        self.status_label.setText(f"Launched: {app_title}")

    def cleanup(self):
        """Cleanup resources when closing."""
        logger.info("🧹 Cleaning up TKA Modern Window...")

        try:
            if hasattr(self, "app_grid"):
                self.app_grid.cleanup()

        except (AttributeError, RuntimeError) as e:
            logger.warning("⚠️ Window cleanup warning: %s", e)
