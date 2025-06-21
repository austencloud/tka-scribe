"""
Main Window for TKA Unified Launcher.
Enhanced with state persistence, responsive design, and premium glassmorphism.
"""

from typing import Optional
from PyQt6.QtWidgets import (
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QStackedWidget,
    QMenuBar,
    QMenu,
    QSystemTrayIcon,
    QMessageBox,
)
from PyQt6.QtCore import Qt, pyqtSignal, QTimer
from PyQt6.QtGui import QAction, QKeySequence

from launcher.core.app_manager import ApplicationManager
from launcher.config.settings import SettingsManager
from launcher.core.state_manager import StateManager
from launcher.ui.window_widget import WindowLauncherWidget
from launcher.ui.docked_widget import DockedLauncherWidget
from launcher.ui.styles import ModernLauncherStyles


class MainLauncherWindow(QMainWindow):
    """
    Main launcher window with dual-mode operation and premium 2025 design.
    Features state persistence, responsive layout, and glassmorphism styling.
    """

    # Signals
    mode_changed = pyqtSignal(str)  # mode

    def __init__(
        self,
        app_manager: ApplicationManager,
        settings_manager: SettingsManager,
        state_manager: StateManager,
    ):
        super().__init__()

        self.app_manager = app_manager
        self.settings_manager = settings_manager
        self.state_manager = state_manager

        self.current_mode = "window"
        self.window_widget: Optional[WindowLauncherWidget] = None
        self.docked_widget: Optional[DockedLauncherWidget] = None

        self._setup_window()
        self._setup_ui()
        self._setup_menu()
        self._setup_shortcuts()
        self._setup_system_tray()
        self._connect_signals()

        # Apply premium 2025 styling
        self.setStyleSheet(ModernLauncherStyles.get_premium_main_window_style())

        # Restore previous window state
        self._restore_window_state()

    def _setup_window(self):
        """Setup basic window properties."""
        self.setWindowTitle("TKA Unified Launcher")
        # Set reasonable minimum size for window mode
        self.setMinimumSize(800, 600)

        # Set window flags for modern appearance
        self.setWindowFlags(
            Qt.WindowType.Window
            | Qt.WindowType.WindowCloseButtonHint
            | Qt.WindowType.WindowMinimizeButtonHint
            | Qt.WindowType.WindowMaximizeButtonHint
        )

    def _setup_ui(self):
        """Setup the main UI layout."""
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main layout
        layout = QVBoxLayout(central_widget)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Stacked widget for mode switching
        self.stacked_widget = QStackedWidget()
        layout.addWidget(self.stacked_widget)

        # Create mode widgets
        self.window_widget = WindowLauncherWidget(
            self.app_manager, self.settings_manager
        )
        self.docked_widget = DockedLauncherWidget(
            self.app_manager, self.settings_manager
        )

        # Add widgets to stack
        self.stacked_widget.addWidget(self.window_widget)
        self.stacked_widget.addWidget(self.docked_widget)

        # Start in window mode
        self.stacked_widget.setCurrentWidget(self.window_widget)

    def _setup_menu(self):
        """Setup the menu bar."""
        menubar = self.menuBar()

        # File menu
        file_menu = menubar.addMenu("&File")

        # Mode switching actions
        self.window_mode_action = QAction("&Window Mode", self)
        self.window_mode_action.setShortcut(QKeySequence("Ctrl+W"))
        self.window_mode_action.triggered.connect(self.switch_to_window_mode)
        file_menu.addAction(self.window_mode_action)

        self.docked_mode_action = QAction("&Docked Mode", self)
        self.docked_mode_action.setShortcut(QKeySequence("Ctrl+D"))
        self.docked_mode_action.triggered.connect(self.switch_to_docked_mode)
        file_menu.addAction(self.docked_mode_action)

        file_menu.addSeparator()

        # Exit action
        exit_action = QAction("E&xit", self)
        exit_action.setShortcut(QKeySequence("Ctrl+Q"))
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # View menu
        view_menu = menubar.addMenu("&View")

        refresh_action = QAction("&Refresh", self)
        refresh_action.setShortcut(QKeySequence("F5"))
        refresh_action.triggered.connect(self._refresh_applications)
        view_menu.addAction(refresh_action)

        # Help menu
        help_menu = menubar.addMenu("&Help")

        about_action = QAction("&About", self)
        about_action.triggered.connect(self._show_about)
        help_menu.addAction(about_action)

    def _setup_shortcuts(self):
        """Setup keyboard shortcuts."""
        pass

    def _setup_system_tray(self):
        """Setup system tray icon."""
        if QSystemTrayIcon.isSystemTrayAvailable():
            self.tray_icon = QSystemTrayIcon(self)

            # Create tray menu
            tray_menu = QMenu()

            show_action = tray_menu.addAction("Show Launcher")
            show_action.triggered.connect(self.show)

            tray_menu.addSeparator()

            quit_action = tray_menu.addAction("Quit")
            quit_action.triggered.connect(self.close)

            self.tray_icon.setContextMenu(tray_menu)
            self.tray_icon.activated.connect(self._on_tray_activated)

            # Set a default icon (use the application icon or create a simple one)
            icon = self.style().standardIcon(self.style().StandardPixmap.SP_ComputerIcon)
            self.tray_icon.setIcon(icon)
            self.tray_icon.setToolTip("TKA Unified Launcher")
            self.tray_icon.show()

    def _connect_signals(self):
        """Connect internal signals."""
        # Connect app manager signals
        self.app_manager.app_launched.connect(self._on_app_launched)
        self.app_manager.app_finished.connect(self._on_app_finished)
        self.app_manager.app_error.connect(self._on_app_error)

        # Connect widget signals
        if self.window_widget:
            self.window_widget.mode_switch_requested.connect(self.switch_to_docked_mode)

        if self.docked_widget:
            self.docked_widget.mode_switch_requested.connect(self.switch_to_window_mode)

    def switch_to_window_mode(self):
        """Switch to window mode with state persistence."""
        if self.current_mode == "window":
            return

        self.current_mode = "window"
        self.stacked_widget.setCurrentWidget(self.window_widget)

        # Update window properties for window mode
        self.setWindowFlags(
            Qt.WindowType.Window
            | Qt.WindowType.WindowCloseButtonHint
            | Qt.WindowType.WindowMinimizeButtonHint
            | Qt.WindowType.WindowMaximizeButtonHint
        )

        # Show menu bar
        self.menuBar().show()

        # Restore minimum size for window mode
        self.setMinimumSize(800, 600)

        # Set optimal window size for content visibility
        self._set_optimal_window_size()

        # Center window on screen
        self._center_window_on_screen()

        self.show()
        self.mode_changed.emit("window")

        # Save window state
        self._save_current_window_state()

    def switch_to_docked_mode(self):
        """Switch to docked mode with glassmorphism styling."""
        if self.current_mode == "docked":
            return

        self.current_mode = "docked"
        self.stacked_widget.setCurrentWidget(self.docked_widget)

        # Update window properties for docked mode
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
            | Qt.WindowType.Tool
        )

        # Hide menu bar
        self.menuBar().hide()

        # Remove minimum size constraint for docked mode
        self.setMinimumSize(50, 100)

        # Store current screen before switching to docked mode
        self._store_current_screen()

        # Position and size for docked mode
        self._position_docked_window()

        self.show()
        self.mode_changed.emit("docked")

        # Save docked state
        self._save_current_window_state()

    def _store_current_screen(self):
        """Store the current screen for docked mode positioning."""
        from PyQt6.QtWidgets import QApplication

        # Get the screen that contains the center of the current window
        window_center = self.geometry().center()
        screens = QApplication.screens()

        self._target_screen = None
        for screen in screens:
            if screen.geometry().contains(window_center):
                self._target_screen = screen
                break

        # Fallback to primary screen if not found
        if self._target_screen is None:
            self._target_screen = QApplication.primaryScreen()

    def _position_docked_window(self):
        """Position window for docked mode as a thin left sidebar on the correct screen."""
        from PyQt6.QtWidgets import QApplication

        # Use stored target screen or fallback to primary
        if hasattr(self, "_target_screen") and self._target_screen:
            screen = self._target_screen
        else:
            screen = QApplication.primaryScreen()

        screen_geometry = screen.geometry()

        # Create properly sized vertical sidebar on LEFT edge
        width = self.settings_manager.get("dock_width", 110)
        height = screen_geometry.height()  # Full screen height
        x = screen_geometry.x()  # Left edge of target screen
        y = screen_geometry.y()  # Top of target screen

        self.setGeometry(x, y, width, height)

    def _set_optimal_window_size(self):
        """Set optimal window size for content visibility."""
        from PyQt6.QtWidgets import QApplication

        # Get screen geometry
        screen = QApplication.primaryScreen()
        screen_geometry = screen.geometry()

        # Calculate optimal size based on screen size
        # Use 70% of screen width and 80% of screen height, with reasonable minimums
        optimal_width = max(1000, int(screen_geometry.width() * 0.7))
        optimal_height = max(700, int(screen_geometry.height() * 0.8))

        # Set maximum limits to prevent oversized windows
        max_width = int(screen_geometry.width() * 0.9)
        max_height = int(screen_geometry.height() * 0.9)

        final_width = min(optimal_width, max_width)
        final_height = min(optimal_height, max_height)

        self.resize(final_width, final_height)

    def _center_window_on_screen(self):
        """Center the window on the primary screen."""
        from PyQt6.QtWidgets import QApplication

        # Get screen geometry
        screen = QApplication.primaryScreen()
        screen_geometry = screen.geometry()

        # Calculate center position
        window_geometry = self.geometry()
        x = (
            screen_geometry.x()
            + (screen_geometry.width() - window_geometry.width()) // 2
        )
        y = (
            screen_geometry.y()
            + (screen_geometry.height() - window_geometry.height()) // 2
        )

        # Move window to center
        self.move(x, y)

    def _restore_window_state(self):
        """Restore window state from settings."""
        window_state = self.settings_manager.get_window_state()

        # Restore to the last used mode
        if window_state["mode"] == "docked":
            self.switch_to_docked_mode()
        else:
            # Restore window geometry if available
            if window_state["window_geometry"]:
                geom = window_state["window_geometry"]
                self.setGeometry(geom["x"], geom["y"], geom["width"], geom["height"])
            self.switch_to_window_mode()

    def _save_current_window_state(self):
        """Save current window state to settings."""
        from PyQt6.QtWidgets import QApplication

        # Get current geometry
        geom = self.geometry()
        geometry_dict = {
            "x": geom.x(),
            "y": geom.y(),
            "width": geom.width(),
            "height": geom.height(),
        }

        # Determine which screen we're on
        screen_index = 0
        screens = QApplication.screens()
        window_center = geom.center()

        for i, screen in enumerate(screens):
            if screen.geometry().contains(window_center):
                screen_index = i
                break

        # Save state
        self.settings_manager.save_window_state(
            geometry=geometry_dict, mode=self.current_mode, screen_index=screen_index
        )

    def closeEvent(self, event):
        """Handle window close event."""
        # Save current state before closing
        self._save_current_window_state()

        # Hide to system tray if available, otherwise close
        if hasattr(self, "tray_icon") and self.tray_icon.isVisible():
            self.hide()
            event.ignore()
        else:
            event.accept()

    def _on_tray_activated(self, reason):
        """Handle system tray activation."""
        if reason == QSystemTrayIcon.ActivationReason.Trigger:
            if self.isVisible():
                self.hide()
            else:
                self.show()
                self.raise_()
                self.activateWindow()

    def _on_app_launched(self, app_id: str, process_info: str):
        """Handle application launch notification."""
        print(f"✅ Launched {app_id}: {process_info}")

    def _on_app_finished(self, app_id: str, exit_code: int):
        """Handle application finish notification."""
        print(f"🏁 Finished {app_id} with exit code {exit_code}")

    def _on_app_error(self, app_id: str, error_message: str):
        """Handle application error notification."""
        print(f"❌ Error in {app_id}: {error_message}")

    def _refresh_applications(self):
        """Refresh application definitions."""
        self.app_manager.app_definitions.reload()
        if self.window_widget:
            self.window_widget.refresh_applications()
        if self.docked_widget:
            self.docked_widget.refresh_applications()

    def _show_about(self):
        """Show about dialog."""
        QMessageBox.about(
            self,
            "About TKA Unified Launcher",
            "TKA Unified Launcher v2.0.0\n\n"
            "Modern, professional launcher for The Kinetic Constructor applications.\n"
            "Supports dual-mode operation with comprehensive application management.",
        )
