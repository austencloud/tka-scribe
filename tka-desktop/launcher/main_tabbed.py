#!/usr/bin/env python3
"""
Main entry point for the TKA Tabbed Launcher.
This launcher provides a tabbed interface for both desktop and web applications.
"""

import sys
import os
from pathlib import Path

# Add the launcher directory to the Python path
launcher_dir = Path(__file__).parent
sys.path.insert(0, str(launcher_dir))

# Import PyQt6 modules
try:
    from PyQt6.QtWidgets import QApplication, QMessageBox
    from PyQt6.QtWebEngineWidgets import QWebEngineView  # Import to ensure web engine is available
except ImportError as e:
    print(f"Error importing PyQt6: {e}")
    print("Please ensure PyQt6 and PyQt6-WebEngine are installed:")
    print("pip install PyQt6 PyQt6-WebEngine")
    sys.exit(1)

# Import launcher modules
try:
    from tabbed_launcher import TabbedLauncherApplication
except ImportError as e:
    print(f"Error importing launcher modules: {e}")
    sys.exit(1)


def check_dependencies():
    """Check if all required dependencies are available."""
    missing_deps = []
    
    # Check for npm (required for web apps)
    try:
        import subprocess
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode != 0:
            missing_deps.append("npm (Node.js package manager)")
    except FileNotFoundError:
        missing_deps.append("npm (Node.js package manager)")
    
    # Check for web engine
    try:
        from PyQt6.QtWebEngineWidgets import QWebEngineView
    except ImportError:
        missing_deps.append("PyQt6-WebEngine")
    
    return missing_deps


def show_dependency_error(missing_deps):
    """Show an error dialog for missing dependencies."""
    app = QApplication(sys.argv)
    
    msg = QMessageBox()
    msg.setIcon(QMessageBox.Icon.Warning)
    msg.setWindowTitle("Missing Dependencies")
    msg.setText("Some required dependencies are missing:")
    
    details = "\n".join([f"• {dep}" for dep in missing_deps])
    details += "\n\nPlease install the missing dependencies and try again."
    
    if "npm" in str(missing_deps):
        details += "\n\nTo install Node.js and npm:"
        details += "\n1. Download from https://nodejs.org/"
        details += "\n2. Install the LTS version"
        details += "\n3. Restart this application"
    
    if "PyQt6-WebEngine" in str(missing_deps):
        details += "\n\nTo install PyQt6-WebEngine:"
        details += "\npip install PyQt6-WebEngine"
    
    msg.setDetailedText(details)
    msg.exec()


def main():
    """Main entry point."""
    # Check dependencies
    missing_deps = check_dependencies()
    if missing_deps:
        show_dependency_error(missing_deps)
        return 1
    
    # Create and run the application
    try:
        app = TabbedLauncherApplication(sys.argv)
        
        # Set application properties
        app.setApplicationDisplayName("TKA Launcher")
        app.setApplicationVersion("2.0.0")
        
        return app.run()
        
    except Exception as e:
        print(f"Error starting launcher: {e}")
        
        # Try to show error in GUI if possible
        try:
            app = QApplication(sys.argv)
            msg = QMessageBox()
            msg.setIcon(QMessageBox.Icon.Critical)
            msg.setWindowTitle("Launcher Error")
            msg.setText(f"Failed to start TKA Launcher:\n\n{str(e)}")
            msg.exec()
        except:
            pass  # If GUI fails, error is already printed
        
        return 1


if __name__ == "__main__":
    sys.exit(main())
