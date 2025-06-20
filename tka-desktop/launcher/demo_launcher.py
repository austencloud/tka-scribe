#!/usr/bin/env python3
"""
Demo launcher to test the tabbed interface without requiring npm.
This creates a simplified version that shows the UI structure.
"""

import sys
from pathlib import Path

# Add the launcher directory to the Python path
launcher_dir = Path(__file__).parent
sys.path.insert(0, str(launcher_dir))

try:
    from PyQt6.QtWidgets import (
        QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
        QTabWidget, QPushButton, QLabel, QFrame, QMessageBox
    )
    from PyQt6.QtCore import Qt
    from PyQt6.QtGui import QFont
except ImportError as e:
    print(f"Error importing PyQt6: {e}")
    print("Please ensure PyQt6 is installed: pip install PyQt6")
    sys.exit(1)

from apps import AppDefinitions


class DemoLauncherWindow(QMainWindow):
    """A demo launcher window to test the tabbed interface."""

    def __init__(self):
        super().__init__()
        self.setup_window()
        self.setup_layout()
        self.center_window()

    def setup_window(self):
        self.setWindowTitle("TKA Application Launcher (Demo)")
        self.setMinimumSize(800, 600)
        self.resize(1000, 700)
        
        self.setStyleSheet("""
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
        """)

    def setup_layout(self):
        central = QWidget(self)
        layout = QVBoxLayout(central)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(10)
        self.setCentralWidget(central)

        # Header
        header = self.create_header()
        layout.addWidget(header)

        # Tab widget
        self.tab_widget = QTabWidget()
        self.tab_widget.setTabPosition(QTabWidget.TabPosition.North)
        layout.addWidget(self.tab_widget)

        # Create tabs for all applications
        self.create_application_tabs()

    def create_header(self):
        """Create the header with title and controls."""
        header = QFrame()
        header.setFrameStyle(QFrame.Shape.StyledPanel)
        header.setMaximumHeight(80)
        header.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1: 0, y1: 0, x2: 0, y2: 1,
                                          stop: 0 #ffffff, stop: 1 #f0f0f0);
                border: 1px solid #d0d0d0;
                border-radius: 8px;
            }
        """)
        
        layout = QHBoxLayout(header)
        layout.setContentsMargins(20, 10, 20, 10)
        
        # Title section
        title_layout = QVBoxLayout()
        
        title_label = QLabel("The Kinetic Constructor")
        title_font = QFont("Arial", 18, QFont.Weight.Bold)
        title_label.setFont(title_font)
        title_label.setStyleSheet("color: #2c3e50;")
        title_layout.addWidget(title_label)
        
        subtitle_label = QLabel("Application Launcher (Demo Mode)")
        subtitle_font = QFont("Arial", 11)
        subtitle_label.setFont(subtitle_font)
        subtitle_label.setStyleSheet("color: #7f8c8d;")
        title_layout.addWidget(subtitle_label)
        
        layout.addLayout(title_layout)
        layout.addStretch()
        
        return header

    def create_application_tabs(self):
        """Create tabs for all applications."""
        for app in AppDefinitions.all():
            if app.app_type == "web":
                # Create demo web application tab
                web_tab = self.create_demo_web_tab(app)
                self.tab_widget.addTab(web_tab, f"{app.icon} {app.title}")
            else:
                # Create desktop application tab
                desktop_tab = self.create_desktop_tab(app)
                self.tab_widget.addTab(desktop_tab, f"{app.icon} {app.title}")

    def create_demo_web_tab(self, app):
        """Create a demo tab for a web application."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)
        
        # Header with controls
        header = QFrame()
        header.setFrameStyle(QFrame.Shape.StyledPanel)
        header.setMaximumHeight(50)
        header.setStyleSheet("""
            QFrame {
                background: #f0f0f0;
                border-bottom: 1px solid #ccc;
            }
        """)
        
        header_layout = QHBoxLayout(header)
        header_layout.setContentsMargins(10, 5, 10, 5)
        
        # App title
        title_label = QLabel(f"🌐 {app.title}")
        title_label.setFont(QFont("Arial", 12, QFont.Weight.Bold))
        header_layout.addWidget(title_label)
        
        header_layout.addStretch()
        
        # Demo buttons
        start_button = QPushButton("Start Server (Demo)")
        start_button.clicked.connect(lambda: self.show_demo_message(app.title, "start"))
        start_button.setStyleSheet("""
            QPushButton {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover { background: #45a049; }
        """)
        header_layout.addWidget(start_button)
        
        stop_button = QPushButton("Stop Server (Demo)")
        stop_button.clicked.connect(lambda: self.show_demo_message(app.title, "stop"))
        stop_button.setStyleSheet("""
            QPushButton {
                background: #f44336;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover { background: #da190b; }
        """)
        header_layout.addWidget(stop_button)
        
        layout.addWidget(header)
        
        # Content area
        content = QFrame()
        content.setFrameStyle(QFrame.Shape.StyledPanel)
        content.setStyleSheet("""
            QFrame {
                background: #ecf0f1;
                border: 1px solid #bdc3c7;
                border-radius: 8px;
                padding: 15px;
            }
        """)
        content_layout = QVBoxLayout(content)
        
        info_label = QLabel(f"{app.icon} {app.title}")
        info_font = QFont("Arial", 16, QFont.Weight.Bold)
        info_label.setFont(info_font)
        info_label.setStyleSheet("color: #2c3e50;")
        content_layout.addWidget(info_label)
        
        desc_label = QLabel(app.description)
        desc_label.setStyleSheet("color: #7f8c8d; font-size: 12px;")
        desc_label.setWordWrap(True)
        content_layout.addWidget(desc_label)
        
        demo_label = QLabel("🚧 Demo Mode: Web server functionality not available")
        demo_label.setStyleSheet("color: #e67e22; font-size: 11px; font-style: italic;")
        content_layout.addWidget(demo_label)
        
        note_label = QLabel(f"Web app name: {app.web_app_name}")
        note_label.setStyleSheet("color: #95a5a6; font-size: 10px;")
        content_layout.addWidget(note_label)
        
        content_layout.addStretch()
        
        layout.addWidget(content)
        
        return tab

    def create_desktop_tab(self, app):
        """Create a tab for a desktop application."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)
        
        # App info
        info_frame = QFrame()
        info_frame.setFrameStyle(QFrame.Shape.StyledPanel)
        info_frame.setStyleSheet("""
            QFrame {
                background: #ecf0f1;
                border: 1px solid #bdc3c7;
                border-radius: 8px;
                padding: 15px;
            }
        """)
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
        launch_button = QPushButton(f"Launch {app.title} (Demo)")
        launch_button.clicked.connect(lambda: self.show_demo_message(app.title, "launch"))
        launch_button.setMinimumHeight(50)
        launch_button.setStyleSheet("""
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
        """)
        layout.addWidget(launch_button)
        
        layout.addStretch()
        
        return tab

    def show_demo_message(self, app_title, action):
        """Show a demo message."""
        QMessageBox.information(
            self, 
            "Demo Mode", 
            f"Demo: Would {action} {app_title}\n\n"
            f"This is a demonstration of the launcher interface.\n"
            f"Full functionality requires proper setup."
        )

    def center_window(self):
        """Center the window on the screen."""
        screen = QApplication.primaryScreen().geometry()
        window = self.geometry()
        x = (screen.width() - window.width()) // 2
        y = (screen.height() - window.height()) // 2
        self.move(x, y)


def main():
    """Main entry point."""
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    app.setApplicationName("TKA Launcher Demo")
    
    window = DemoLauncherWindow()
    window.show()
    
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
