#!/usr/bin/env python3
"""
Main entry point for TKA Unified Launcher.

This launcher provides a modern, professional interface for launching
all TKA applications with dual-mode operation (window/docked).
"""

import sys
import signal
import atexit
from pathlib import Path
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import QTimer

# Add launcher directory to path
launcher_dir = Path(__file__).parent
if str(launcher_dir) not in sys.path:
    sys.path.insert(0, str(launcher_dir))

# Add parent directory for launcher imports
parent_dir = launcher_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from launcher.core.app_manager import ApplicationManager
from launcher.config.settings import SettingsManager
from launcher.core.state_manager import StateManager
from launcher.config.app_definitions import AppDefinitions
from launcher.ui.main_window import MainLauncherWindow


class UnifiedLauncherApp:
    """Main application class for TKA Unified Launcher."""

    def __init__(self, argv):
        """Initialize the launcher application."""
        self.app = QApplication(argv)
        self.main_window = None

        # Setup signal handlers for proper termination
        self._setup_signal_handlers()

        # Setup application properties
        self.app.setApplicationName("TKA Unified Launcher")
        self.app.setApplicationVersion("2.0.0")
        self.app.setOrganizationName("The Kinetic Constructor")

        # Initialize core components
        self._initialize_components()

        # Create main window
        self._create_main_window()

        # Register cleanup handlers
        atexit.register(self._cleanup)

    def _setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown."""

        def signal_handler(signum, frame):
            print(f"\n🛑 Received signal {signum}, shutting down gracefully...")
            self.quit()

        # Handle common termination signals
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)

        # On Windows, handle Ctrl+C
        if sys.platform == "win32":
            import win32api

            def console_handler(dwCtrlType):
                if dwCtrlType in (0, 2):  # CTRL_C_EVENT, CTRL_CLOSE_EVENT
                    print("\n🛑 Console close event, shutting down gracefully...")
                    QTimer.singleShot(0, self.quit)
                    return True
                return False

            win32api.SetConsoleCtrlHandler(console_handler, True)

    def _initialize_components(self):
        """Initialize core application components."""
        try:
            # Initialize settings manager
            self.settings_manager = SettingsManager()

            # Initialize app definitions
            self.app_definitions = AppDefinitions()

            # Initialize app manager
            self.app_manager = ApplicationManager(self.app_definitions)

            # Initialize state manager
            self.state_manager = StateManager(self.settings_manager)

            print("✅ Core components initialized successfully")

        except Exception as e:
            print(f"❌ Failed to initialize components: {e}")
            sys.exit(1)

    def _create_main_window(self):
        """Create and setup the main launcher window."""
        try:
            self.main_window = MainLauncherWindow(
                app_manager=self.app_manager,
                settings_manager=self.settings_manager,
                state_manager=self.state_manager,
            )

            # Connect application quit signal
            self.app.aboutToQuit.connect(self._on_about_to_quit)

            print("✅ Main window created successfully")

        except Exception as e:
            print(f"❌ Failed to create main window: {e}")
            sys.exit(1)

    def run(self):
        """Run the launcher application."""
        try:
            # Show the main window
            self.main_window.show()

            print("🚀 TKA Unified Launcher started successfully")
            print("   Use Ctrl+C or close the window to exit")

            # Start the Qt event loop
            return self.app.exec()

        except KeyboardInterrupt:
            print("\n🛑 Keyboard interrupt received")
            return 0
        except Exception as e:
            print(f"❌ Application error: {e}")
            return 1

    def quit(self):
        """Gracefully quit the application."""
        print("🔄 Initiating graceful shutdown...")

        # Save current state
        if self.main_window:
            self.main_window._save_current_window_state()

        # Quit the application
        self.app.quit()

    def _on_about_to_quit(self):
        """Handle application about to quit signal."""
        print("💾 Saving application state...")

        # Ensure settings are saved
        if hasattr(self, "settings_manager"):
            self.settings_manager.save_settings()

    def _cleanup(self):
        """Cleanup resources on exit."""
        print("🧹 Cleaning up resources...")

        # Additional cleanup if needed
        if hasattr(self, "app_manager"):
            # Stop any running processes
            pass


def main():
    """Main entry point for the launcher."""
    try:
        # Create and run the launcher application
        launcher = UnifiedLauncherApp(sys.argv)
        exit_code = launcher.run()

        print(f"👋 TKA Unified Launcher exited with code {exit_code}")
        return exit_code

    except Exception as e:
        print(f"💥 Fatal error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
