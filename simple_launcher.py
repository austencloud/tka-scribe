#!/usr/bin/env python3
"""
Simple TKA Launcher Interface

Provides a clean interface to launch different TKA applications.
"""

import sys
import subprocess
from pathlib import Path
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, 
    QWidget, QPushButton, QLabel, QFrame
)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont, QIcon


class TKALauncherWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TKA - The Kinetic Constructor")
        self.setFixedSize(500, 400)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #1e1e1e;
                color: #ffffff;
            }
            QPushButton {
                background-color: #0d7377;
                color: white;
                border: none;
                padding: 15px;
                margin: 5px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #14a085;
            }
            QPushButton:pressed {
                background-color: #0a5d61;
            }
            QLabel {
                color: #ffffff;
                font-size: 16px;
                margin: 10px;
            }
            QFrame {
                border: 1px solid #444444;
                border-radius: 8px;
                margin: 10px;
                padding: 10px;
            }
        """)
        
        self.setup_ui()
        self.center_on_screen()
        
    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)
        
        # Title
        title = QLabel("TKA - The Kinetic Constructor")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        title.setFont(QFont("Arial", 20, QFont.Weight.Bold))
        layout.addWidget(title)
        
        # Subtitle
        subtitle = QLabel("Choose your application:")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setFont(QFont("Arial", 12))
        layout.addWidget(subtitle)
        
        # Desktop App Section
        desktop_frame = QFrame()
        desktop_layout = QVBoxLayout(desktop_frame)
        
        desktop_label = QLabel("🖥️ Desktop Applications")
        desktop_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        desktop_layout.addWidget(desktop_label)
        
        modern_btn = QPushButton("Launch Modern Desktop App")
        modern_btn.clicked.connect(self.launch_modern_desktop)
        desktop_layout.addWidget(modern_btn)
        
        layout.addWidget(desktop_frame)
        
        # Web App Section
        web_frame = QFrame()
        web_layout = QVBoxLayout(web_frame)
        
        web_label = QLabel("🌐 Web Applications")
        web_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        web_layout.addWidget(web_label)
        
        web_btn = QPushButton("Launch Web App")
        web_btn.clicked.connect(self.launch_web_app)
        web_layout.addWidget(web_btn)
        
        api_btn = QPushButton("Start API Server")
        api_btn.clicked.connect(self.launch_api_server)
        web_layout.addWidget(api_btn)
        
        layout.addWidget(web_frame)
        
        # Development Section
        dev_frame = QFrame()
        dev_layout = QVBoxLayout(dev_frame)
        
        dev_label = QLabel("🛠️ Development Tools")
        dev_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        dev_layout.addWidget(dev_label)
        
        test_btn = QPushButton("Run All Tests")
        test_btn.clicked.connect(self.run_tests)
        dev_layout.addWidget(test_btn)
        
        layout.addWidget(dev_frame)
        
        # Exit button
        exit_btn = QPushButton("Exit Launcher")
        exit_btn.setStyleSheet("""
            QPushButton {
                background-color: #8b0000;
                margin-top: 20px;
            }
            QPushButton:hover {
                background-color: #a00000;
            }
        """)
        exit_btn.clicked.connect(self.close)
        layout.addWidget(exit_btn)
        
    def center_on_screen(self):
        screen = QApplication.primaryScreen().geometry()
        window = self.geometry()
        x = (screen.width() - window.width()) // 2
        y = (screen.height() - window.height()) // 2
        self.move(x, y)
        
    def launch_modern_desktop(self):
        print("🚀 Launching Modern Desktop App...")
        self.launch_subprocess([sys.executable, "main.py", "--modern"])
        self.close()
        
    def launch_web_app(self):
        print("🌐 Launching Web App...")
        self.launch_subprocess(["npm", "run", "dev"], cwd="src/web")
        QTimer.singleShot(2000, self.close)
        
    def launch_api_server(self):
        print("🔌 Starting API Server...")
        self.launch_subprocess([
            "uvicorn", "main:app", "--reload", 
            "--host", "0.0.0.0", "--port", "8000"
        ])
        QTimer.singleShot(2000, self.close)
        
    def run_tests(self):
        print("🧪 Running All Tests...")
        self.launch_subprocess([sys.executable, "-m", "pytest", "-q", "tests/desktop/", "--color=yes"])
        QTimer.singleShot(2000, self.close)
        
    def launch_subprocess(self, cmd, cwd=None):
        try:
            base_path = Path(__file__).parent
            work_dir = base_path / cwd if cwd else base_path
            subprocess.Popen(cmd, cwd=work_dir)
        except Exception as e:
            print(f"Error launching {' '.join(cmd)}: {e}")


def main():
    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    
    launcher = TKALauncherWindow()
    launcher.show()
    
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())
