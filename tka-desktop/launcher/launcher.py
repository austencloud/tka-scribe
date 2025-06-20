from PyQt6.QtWidgets import (
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QApplication,
    QPushButton,
    QMessageBox,
    QLabel,
)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QKeySequence, QShortcut
from typing import List
import sys
import subprocess
import os
from pathlib import Path

# Handle both relative and absolute imports
try:
    from .accessibility import AccessibilityManager
    from .apps import AppDefinitions, AppDefinition
    from .unified_web_server import get_unified_server
except ImportError:
    # Fall back to absolute imports when run as standalone
    from accessibility import AccessibilityManager
    from apps import AppDefinitions, AppDefinition
    from unified_web_server import get_unified_server


class LauncherWindow(QMainWindow):
    """A slim, horizontally-oriented launcher bar."""

    HEIGHT = 45  # px, adjusted to better match typical taskbar height
    WIDTH = 520  # px, increased to accommodate web app buttons

    def __init__(self) -> None:
        super().__init__()
        self.a11y = AccessibilityManager.instance()
        self._setup_window()
        self._setup_layout()
        self._setup_shortcuts()
        self.position_overlay_taskbar_secondary_left_fifth()

    def _setup_window(self) -> None:
        self.setWindowTitle("TKA Launcher")
        # Frameless & always on top keeps it minimal and unobtrusive
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint
        )
        # High‑contrast palette for accessibility; relies on system colors
        self.setStyleSheet("background: palette(window);")

    def _setup_layout(self) -> None:
        central = QWidget(self)
        layout = QHBoxLayout(central)
        layout.setContentsMargins(
            4, 2, 4, 2
        )  # Reduced margins (left, top, right, bottom)
        layout.setSpacing(8)  # Increased spacing between widgets (e.g., from 4 to 8)
        self.setCentralWidget(central)

        # Add TKA Label
        tka_label = QLabel("TKA:")  # Added colon
        tka_label_font = tka_label.font()
        tka_label_font.setFamily("Monotype Corsiva")  # Set font family
        tka_label_font.setPointSize(18)  # Slightly larger for style
        # tka_label_font.setBold(True) # Monotype Corsiva is often better not bold
        tka_label.setFont(tka_label_font)
        tka_label.setStyleSheet(
            "color: palette(text); padding-right: 10px; margin-left: 5px;"
        )  # Style and spacing
        layout.addWidget(tka_label)

        for app in AppDefinitions.all():
            btn = QPushButton(f"{app.icon}  {app.title}")
            btn.clicked.connect(lambda _, a=app: self._launch(a))
            btn.setToolTip(app.description)
            self.a11y.configure(btn, f"Launch {app.title}", app.description)
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setMinimumHeight(
                self.HEIGHT
                - 8  # e.g., 48 - 8 = 40px button height, allowing 4px top/bottom margin within launcher
            )
            btn.setStyleSheet(
                """
                QPushButton {
                    border: 2px solid transparent; /* Reserve space for focus border */
                    padding: 0 10px; 
                    font-size: 14px; 
                    font-weight: 600;
                    color: palette(text);
                    background: palette(base);
                    border-radius: 4px; 
                }
                QPushButton:hover { background: palette(light); }
                QPushButton:focus {
                    border: 2px solid #0078d4; /* Use border for focus to follow radius */
                    /* outline: none; */ /* Optionally remove outline if border is used */
                }
                """
            )
            layout.addWidget(btn)

    def _setup_shortcuts(self) -> None:
        QShortcut(QKeySequence("Ctrl+Q"), self, self.close)
        QShortcut(QKeySequence("F5"), self, self._refresh)

    def position_overlay_taskbar_secondary_left_fifth(self) -> None:
        """Moves the launcher to overlay the taskbar area on the secondary screen,
        positioned 1/5 from the left edge of the full screen geometry."""
        screens = QApplication.screens()
        if len(screens) > 1:
            secondary_screen = screens[1]  # Assuming the second screen is the target
        else:
            secondary_screen = (
                QApplication.primaryScreen()
            )  # Fallback to primary if no secondary

        screen_geometry = (
            secondary_screen.geometry()
        )  # Use .geometry() to include taskbar area        # Position 1/5 from the left edge of the full screen area
        x_position = screen_geometry.x() + (screen_geometry.width() // 5)

        # Position at the bottom of the full screen area
        y_position = screen_geometry.y() + screen_geometry.height() - self.HEIGHT

        self.setGeometry(x_position, y_position, self.WIDTH, self.HEIGHT)

    def _launch(self, app: AppDefinition) -> None:
        try:
            if app.app_type == "web":
                # Handle web applications
                self._launch_web_app(app)
            elif app.script_path:
                # Handle desktop applications
                launcher_dir = Path(__file__).parent

                # Check if we're in the new monorepo structure
                potential_monorepo_root = launcher_dir.parent.parent.parent
                if (potential_monorepo_root / "apps" / "desktop").exists():
                    # New monorepo structure
                    desktop_dir = potential_monorepo_root / "apps" / "desktop"
                else:
                    # Old structure
                    desktop_dir = launcher_dir.parent

                script_full_path = desktop_dir / app.script_path
                subprocess.Popen([sys.executable, str(script_full_path)])
            elif app.command:
                subprocess.Popen(app.command, shell=True)
        except Exception as e:
            QMessageBox.warning(
                self, "Launch Error", f"Failed to launch {app.title}:\n{e}"
            )

    def _launch_web_app(self, app: AppDefinition) -> None:
        """Launch a web application with auto-resolution."""
        try:
            web_server = get_unified_server()

            if app.web_app_name == "unified":
                # Launch unified interface
                url = web_server.start_unified_server()
                if url:
                    import webbrowser

                    webbrowser.open(url)
                else:
                    QMessageBox.warning(
                        self,
                        "Web Server Error",
                        "Failed to start unified web interface.\n\n"
                        "Please ensure:\n"
                        "• Node.js and npm are installed\n"
                        "• Web app directories exist\n"
                        "• No port conflicts",
                    )
            else:
                # Launch individual app
                success = web_server.open_individual_app(app.web_app_name)
                if not success:
                    QMessageBox.warning(
                        self,
                        "Web Server Error",
                        f"Failed to start {app.title}.\n\n"
                        f"Please ensure:\n"
                        f"• Node.js and npm are installed\n"
                        f"• {app.web_app_name} directory exists\n"
                        f"• No port conflicts",
                    )
        except Exception as e:
            QMessageBox.warning(
                self,
                "Web Launch Error",
                f"Failed to launch {app.title}:\n{e}\n\n"
                "This may be due to missing dependencies or network issues.",
            )

    def _refresh(self) -> None:
        self.close()
        new = LauncherWindow()
        new.show()

    def closeEvent(self, event):
        """Handle window close event."""
        try:
            # Stop all web servers when closing
            web_server = get_unified_server()
            web_server.stop_all_servers()
        except Exception:
            pass  # Ignore errors during cleanup
        event.accept()


class LauncherApplication(QApplication):
    def __init__(self, argv: List[str]) -> None:
        super().__init__(argv)
        self.setStyle("Fusion")
        self.setApplicationName("Kinetic Constructor Launcher")
        self.setOrganizationName("Kinetic Constructor")

    def run(self) -> int:
        window = LauncherWindow()
        window.show()
        return self.exec()
