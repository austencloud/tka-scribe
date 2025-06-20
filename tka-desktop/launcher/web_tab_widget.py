"""
Web Tab Widget for TKA Launcher
Provides embedded web browser functionality for web applications.
"""

from PyQt6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QHBoxLayout,
    QLabel,
    QPushButton,
    QProgressBar,
    QTextEdit,
    QSplitter,
    QFrame,
)
from PyQt6.QtCore import Qt, QUrl, pyqtSlot
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtGui import QFont, QIcon
from typing import Optional
import logging

from web_server_manager import get_server_manager


class WebTabWidget(QWidget):
    """A widget that displays a web application with server management."""

    def __init__(self, app_name: str, app_title: str, parent=None):
        super().__init__(parent)
        self.app_name = app_name
        self.app_title = app_title
        self.server_manager = get_server_manager()
        self.web_view: Optional[QWebEngineView] = None
        self.is_server_starting = False

        self.setup_ui()
        self.connect_signals()

    def setup_ui(self):
        """Set up the user interface."""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Header with controls
        header = self.create_header()
        layout.addWidget(header)

        # Main content area with splitter
        splitter = QSplitter(Qt.Orientation.Vertical)

        # Web view container
        web_container = QFrame()
        web_container.setFrameStyle(QFrame.Shape.StyledPanel)
        web_layout = QVBoxLayout(web_container)
        web_layout.setContentsMargins(0, 0, 0, 0)

        # Status label (shown when not loaded)
        self.status_label = QLabel(f"Click 'Start Server' to launch {self.app_title}")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.status_label.setStyleSheet(
            """
            QLabel {
                color: #666;
                font-size: 14px;
                padding: 20px;
                background: #f5f5f5;
                border: 2px dashed #ccc;
                border-radius: 8px;
                margin: 20px;
            }
        """
        )
        web_layout.addWidget(self.status_label)

        # Progress bar (hidden initially)
        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 0)  # Indeterminate progress
        self.progress_bar.hide()
        web_layout.addWidget(self.progress_bar)

        # Web view (created when needed)
        self.web_view_container = web_layout

        splitter.addWidget(web_container)

        # Console output (collapsible)
        self.console_widget = QTextEdit()
        self.console_widget.setMaximumHeight(150)
        self.console_widget.setFont(QFont("Consolas", 9))
        self.console_widget.setStyleSheet(
            """
            QTextEdit {
                background: #1e1e1e;
                color: #d4d4d4;
                border: 1px solid #3e3e3e;
                border-radius: 4px;
            }
        """
        )
        self.console_widget.hide()  # Hidden by default
        splitter.addWidget(self.console_widget)

        # Set splitter proportions
        splitter.setSizes([400, 150])
        layout.addWidget(splitter)

    def create_header(self) -> QWidget:
        """Create the header with controls."""
        header = QFrame()
        header.setFrameStyle(QFrame.Shape.StyledPanel)
        header.setMaximumHeight(50)
        header.setStyleSheet(
            """
            QFrame {
                background: #f0f0f0;
                border-bottom: 1px solid #ccc;
            }
        """
        )

        layout = QHBoxLayout(header)
        layout.setContentsMargins(10, 5, 10, 5)

        # App title
        title_label = QLabel(f"🌐 {self.app_title}")
        title_label.setFont(QFont("Arial", 12, QFont.Weight.Bold))
        layout.addWidget(title_label)

        layout.addStretch()

        # Server status
        self.status_indicator = QLabel("●")
        self.status_indicator.setStyleSheet("color: #ccc; font-size: 16px;")
        layout.addWidget(self.status_indicator)

        self.status_text = QLabel("Stopped")
        self.status_text.setStyleSheet("color: #666; font-size: 11px;")
        layout.addWidget(self.status_text)

        # Control buttons
        self.start_button = QPushButton("Start Server")
        self.start_button.clicked.connect(self.start_server)
        self.start_button.setStyleSheet(
            """
            QPushButton {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover { background: #45a049; }
            QPushButton:disabled { background: #ccc; }
        """
        )
        layout.addWidget(self.start_button)

        self.stop_button = QPushButton("Stop Server")
        self.stop_button.clicked.connect(self.stop_server)
        self.stop_button.setEnabled(False)
        self.stop_button.setStyleSheet(
            """
            QPushButton {
                background: #f44336;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover { background: #da190b; }
            QPushButton:disabled { background: #ccc; }
        """
        )
        layout.addWidget(self.stop_button)

        # Console toggle
        self.console_button = QPushButton("Console")
        self.console_button.setCheckable(True)
        self.console_button.clicked.connect(self.toggle_console)
        self.console_button.setStyleSheet(
            """
            QPushButton {
                background: #2196F3;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover { background: #1976D2; }
            QPushButton:checked { background: #1565C0; }
        """
        )
        layout.addWidget(self.console_button)

        return header

    def connect_signals(self):
        """Connect server manager signals."""
        self.server_manager.server_started.connect(self.on_server_started)
        self.server_manager.server_stopped.connect(self.on_server_stopped)
        self.server_manager.server_error.connect(self.on_server_error)
        self.server_manager.server_output.connect(self.on_server_output)

    def start_server(self):
        """Start the development server."""
        if self.is_server_starting:
            return

        self.is_server_starting = True
        self.start_button.setEnabled(False)
        self.progress_bar.show()
        self.status_label.setText(f"Starting {self.app_title} server...")
        self.update_status("Starting...", "#ff9800")

        # Start server in background
        success = self.server_manager.start_server(self.app_name)
        if not success:
            self.is_server_starting = False
            self.start_button.setEnabled(True)
            self.progress_bar.hide()

    def stop_server(self):
        """Stop the development server."""
        self.server_manager.stop_server(self.app_name)

    def toggle_console(self):
        """Toggle console visibility."""
        if self.console_button.isChecked():
            self.console_widget.show()
        else:
            self.console_widget.hide()

    @pyqtSlot(str, str, int)
    def on_server_started(self, app_name: str, url: str, port: int):
        """Handle server started signal."""
        if app_name != self.app_name:
            return

        self.is_server_starting = False
        self.start_button.setEnabled(False)
        self.stop_button.setEnabled(True)
        self.progress_bar.hide()
        self.update_status(f"Running on port {port}", "#4CAF50")

        # Create and load web view
        self.create_web_view(url)

    @pyqtSlot(str)
    def on_server_stopped(self, app_name: str):
        """Handle server stopped signal."""
        if app_name != self.app_name:
            return

        self.start_button.setEnabled(True)
        self.stop_button.setEnabled(False)
        self.update_status("Stopped", "#ccc")

        # Remove web view and show status
        if self.web_view:
            self.web_view.hide()
            self.web_view.deleteLater()
            self.web_view = None

        self.status_label.setText(f"Click 'Start Server' to launch {self.app_title}")
        self.status_label.show()

    @pyqtSlot(str, str)
    def on_server_error(self, app_name: str, error: str):
        """Handle server error signal."""
        if app_name != self.app_name:
            return

        self.is_server_starting = False
        self.start_button.setEnabled(True)
        self.progress_bar.hide()
        self.update_status("Error", "#f44336")
        self.status_label.setText(f"Error starting {self.app_title}: {error}")

        # Log to console
        self.log_to_console(f"ERROR: {error}", "#f44336")

    @pyqtSlot(str, str)
    def on_server_output(self, app_name: str, output: str):
        """Handle server output signal."""
        if app_name != self.app_name:
            return

        self.log_to_console(output)

    def create_web_view(self, url: str):
        """Create and configure the web view."""
        if self.web_view:
            self.web_view.deleteLater()

        self.web_view = QWebEngineView()
        self.web_view.load(QUrl(url))

        # Hide status label and show web view
        self.status_label.hide()
        self.web_view_container.addWidget(self.web_view)

    def update_status(self, text: str, color: str):
        """Update the status indicator."""
        self.status_indicator.setStyleSheet(f"color: {color}; font-size: 16px;")
        self.status_text.setText(text)

    def log_to_console(self, message: str, color: str = "#d4d4d4"):
        """Add a message to the console."""
        self.console_widget.append(f'<span style="color: {color};">{message}</span>')

    def cleanup(self):
        """Clean up resources when tab is closed."""
        if self.server_manager.is_server_running(self.app_name):
            self.server_manager.stop_server(self.app_name)
