"""
Tabbed Launcher for TKA Applications
Supports both desktop and web applications in a tabbed interface.
"""

from PyQt6.QtWidgets import (
    QMainWindow,
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QTabWidget,
    QApplication,
    QPushButton,
    QMessageBox,
    QLabel,
    QFrame,
)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QKeySequence, QShortcut, QFont
from typing import List
import sys
import subprocess
import os
from pathlib import Path

from accessibility import AccessibilityManager
from apps import AppDefinitions, AppDefinition
from web_tab_widget import WebTabWidget
from web_server_manager import get_server_manager


class TabbedLauncherWindow(QMainWindow):
    """A tabbed launcher window for TKA applications."""

    def __init__(self) -> None:
        super().__init__()
        self.a11y = AccessibilityManager.instance()
        self.server_manager = get_server_manager()
        self.web_tabs = {}  # Track web tab widgets

        self._setup_window()
        self._setup_layout()
        self._setup_shortcuts()
        self._center_window()

    def _setup_window(self) -> None:
        self.setWindowTitle("TKA Application Launcher")
        self.setMinimumSize(800, 600)
        self.resize(1000, 700)

        # Set application icon and styling
        self.setStyleSheet(
            """
            QMainWindow {
                background: #f5f5f5;
            }
            QTabWidget::pane {
                border: 1px solid #c0c0c0;
                background: white;
            }
            QTabWidget::tab-bar {
                alignment: center;
            }
            QTabBar::tab {
                background: #e0e0e0;
                border: 1px solid #c0c0c0;
                padding: 8px 16px;
                margin-right: 2px;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            QTabBar::tab:selected {
                background: white;
                border-bottom-color: white;
            }
            QTabBar::tab:hover {
                background: #f0f0f0;
            }
        """
        )

    def _setup_layout(self) -> None:
        central = QWidget(self)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(10)
        self.setCentralWidget(central)

        # Header
        header = self._create_header()
        layout.addWidget(header)

        # Tab widget
        self.tab_widget = QTabWidget()
        self.tab_widget.setTabPosition(QTabWidget.TabPosition.North)
        layout.addWidget(self.tab_widget)

        # Create tabs for all applications
        self._create_application_tabs()

    def _create_header(self) -> QWidget:
        """Create the header with title and controls."""
        header = QFrame()
        header.setFrameStyle(QFrame.Shape.StyledPanel)
        header.setMaximumHeight(80)
        header.setStyleSheet(
            """
            QFrame {
                background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                          stop: 0 #ffffff, stop: 1 #f0f0f0);
                border: 1px solid #d0d0d0;
                border-radius: 8px;
            }
        """
        )

        layout = QHBoxLayout(header)
        layout.setContentsMargins(20, 10, 20, 10)

        # Title section
        title_layout = QVBoxLayout()

        title_label = QLabel("The Kinetic Constructor")
        title_font = QFont("Arial", 18, QFont.Weight.Bold)
        title_label.setFont(title_font)
        title_label.setStyleSheet("color: #2c3e50;")
        title_layout.addWidget(title_label)

        subtitle_label = QLabel("Application Launcher")
        subtitle_font = QFont("Arial", 11)
        subtitle_label.setFont(subtitle_font)
        subtitle_label.setStyleSheet("color: #7f8c8d;")
        title_layout.addWidget(subtitle_label)

        layout.addLayout(title_layout)
        layout.addStretch()

        # Control buttons
        self.stop_all_button = QPushButton("Stop All Servers")
        self.stop_all_button.clicked.connect(self._stop_all_servers)
        self.stop_all_button.setStyleSheet(
            """
            QPushButton {
                background: #e74c3c;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 11px;
            }
            QPushButton:hover { background: #c0392b; }
            QPushButton:disabled { background: #bdc3c7; }
        """
        )
        layout.addWidget(self.stop_all_button)

        return header

    def _create_application_tabs(self):
        """Create tabs for all applications."""
        for app in AppDefinitions.all():
            if app.app_type == "web":
                # Create web application tab
                web_tab = WebTabWidget(app.web_app_name, app.title)
                self.web_tabs[app.web_app_name] = web_tab
                self.tab_widget.addTab(web_tab, f"{app.icon} {app.title}")
            else:
                # Create desktop application tab
                desktop_tab = self._create_desktop_tab(app)
                self.tab_widget.addTab(desktop_tab, f"{app.icon} {app.title}")

    def _create_desktop_tab(self, app: AppDefinition) -> QWidget:
        """Create a tab for a desktop application."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)

        # App info
        info_frame = QFrame()
        info_frame.setFrameStyle(QFrame.Shape.StyledPanel)
        info_frame.setStyleSheet(
            """
            QFrame {
                background: #ecf0f1;
                border: 1px solid #bdc3c7;
                border-radius: 8px;
                padding: 15px;
            }
        """
        )
        info_layout = QVBoxLayout(info_frame)

        title_label = QLabel(f"{app.icon} {app.title}")
        title_font = QFont("Arial", 16, QFont.Weight.Bold)
        title_label.setFont(title_font)
        title_label.setStyleSheet("color: #2c3e50;")
        info_layout.addWidget(title_label)

        desc_label = QLabel(app.description)
        desc_label.setStyleSheet("color: #7f8c8d; font-size: 12px;")
        desc_label.setWordWrap(True)
        info_layout.addWidget(desc_label)

        layout.addWidget(info_frame)

        # Launch button
        launch_button = QPushButton(f"Launch {app.title}")
        launch_button.clicked.connect(lambda _, a=app: self._launch_desktop_app(a))
        launch_button.setMinimumHeight(50)
        launch_button.setStyleSheet(
            """
            QPushButton {
                background: #3498db;
                color: white;
                border: none;
                padding: 15px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover { background: #2980b9; }
            QPushButton:pressed { background: #21618c; }
        """
        )
        layout.addWidget(launch_button)

        layout.addStretch()

        return tab

    def _setup_shortcuts(self) -> None:
        QShortcut(QKeySequence("Ctrl+Q"), self, self.close)
        QShortcut(QKeySequence("F5"), self, self._refresh)

    def _center_window(self) -> None:
        """Center the window on the screen."""
        screen = QApplication.primaryScreen().geometry()
        window = self.geometry()
        x = (screen.width() - window.width()) // 2
        y = (screen.height() - window.height()) // 2
        self.move(x, y)

    def _launch_desktop_app(self, app: AppDefinition) -> None:
        """Launch a desktop application."""
        try:
            if app.script_path:
                # Get the monorepo root (4 levels up from launcher)
                launcher_dir = Path(__file__).parent
                monorepo_root = launcher_dir.parent.parent.parent

                # Check if we're in the new structure
                if (monorepo_root / "apps" / "desktop").exists():
                    # New monorepo structure
                    desktop_dir = monorepo_root / "apps" / "desktop"
                else:
                    # Old structure - use tka-desktop
                    desktop_dir = launcher_dir.parent

                script_full_path = desktop_dir / app.script_path
                subprocess.Popen([sys.executable, str(script_full_path)])
            elif app.command:
                subprocess.Popen(app.command, shell=True)
        except Exception as e:
            QMessageBox.warning(
                self, "Launch Error", f"Failed to launch {app.title}:\n{e}"
            )

    def _stop_all_servers(self):
        """Stop all running web servers."""
        self.server_manager.stop_all_servers()

    def _refresh(self) -> None:
        """Refresh the launcher."""
        self.close()
        new = TabbedLauncherWindow()
        new.show()

    def closeEvent(self, event):
        """Handle window close event."""
        # Stop all servers when closing
        self.server_manager.stop_all_servers()

        # Clean up web tabs
        for tab in self.web_tabs.values():
            tab.cleanup()

        event.accept()


class TabbedLauncherApplication(QApplication):
    def __init__(self, argv: List[str]) -> None:
        super().__init__(argv)
        self.setStyle("Fusion")
        self.setApplicationName("TKA Application Launcher")
        self.setOrganizationName("The Kinetic Constructor")

    def run(self) -> int:
        window = TabbedLauncherWindow()
        window.show()
        return self.exec()
