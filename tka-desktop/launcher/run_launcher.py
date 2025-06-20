#!/usr/bin/env python3
"""
Standalone launcher runner that avoids import conflicts.
This is the main entry point for the TKA launcher.
"""

import sys
import os
from pathlib import Path

def main():
    """Main entry point for the launcher."""
    
    # Add the launcher directory to Python path
    launcher_dir = Path(__file__).parent
    sys.path.insert(0, str(launcher_dir))
    
    try:
        # Import PyQt6 first to check if it's available
        from PyQt6.QtWidgets import QApplication, QMessageBox
        from PyQt6.QtCore import Qt
        
        # Import launcher components
        from accessibility import AccessibilityManager
        from apps import AppDefinitions, AppDefinition
        from unified_web_server import get_unified_server
        
        # Import the main launcher classes
        from launcher import LauncherWindow, LauncherApplication
        
        print("🚀 Starting TKA Minimalist Launcher...")
        
        # Create and run the application
        app = LauncherApplication(sys.argv)
        return app.run()
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        
        # Try to show a GUI error if PyQt6 is available
        try:
            app = QApplication(sys.argv)
            msg = QMessageBox()
            msg.setIcon(QMessageBox.Icon.Critical)
            msg.setWindowTitle("TKA Launcher Error")
            msg.setText(f"Failed to import required modules:\n\n{e}")
            msg.setDetailedText(
                "Please ensure all dependencies are installed:\n\n"
                "pip install PyQt6\n"
                "npm install (in web app directories)"
            )
            msg.exec()
        except:
            pass
        
        return 1
        
    except Exception as e:
        print(f"❌ Launcher error: {e}")
        
        # Try to show a GUI error
        try:
            app = QApplication(sys.argv)
            msg = QMessageBox()
            msg.setIcon(QMessageBox.Icon.Critical)
            msg.setWindowTitle("TKA Launcher Error")
            msg.setText(f"Launcher failed to start:\n\n{e}")
            msg.exec()
        except:
            pass
        
        return 1

if __name__ == "__main__":
    sys.exit(main())
