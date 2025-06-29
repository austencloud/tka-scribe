#!/usr/bin/env python3
"""
Kinetic Constructor - Main Application Entry Point

Modern modular architecture with dependency injection and clean separation of concerns.
"""

import sys
from pathlib import Path
from typing import Optional
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtCore import QTimer
from PyQt6.QtGui import QIcon, QGuiApplication

# Qt Integration A+ Enhancements - Temporarily disabled due to import issues
# from core.qt_integration import (
#     qt_compat,
#     qt_factory,
#     qt_resources,
#     memory_detector,
#     AutoManagedWidget,
# )

modern_src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(modern_src_path))


from presentation.components.ui.splash_screen import SplashScreen


class KineticConstructorModern(QMainWindow):
    def __init__(
        self,
        splash_screen: Optional[SplashScreen] = None,
        target_screen=None,
        parallel_mode=False,
        parallel_geometry=None,
        enable_api=True,
    ):
        super().__init__()
        self.splash = splash_screen
        self.target_screen = target_screen
        self.parallel_mode = parallel_mode
        self.parallel_geometry = parallel_geometry
        self.enable_api = enable_api

        # Initialize application using orchestrator
        from application.services.core.application_orchestrator import (
            ApplicationOrchestrator,
        )

        self.orchestrator = ApplicationOrchestrator()
        self.tab_widget = self.orchestrator.initialize_application(
            self,
            splash_screen,
            target_screen,
            parallel_mode,
            parallel_geometry,
            enable_api,
        )

        # Production debugging can be enabled by uncommenting the line below
        # self._attach_production_debugger()

    def _attach_production_debugger(self) -> None:
        """Attach production debugger to monitor toggle functionality"""
        try:
            # Import debugger
            from debug import attach_to_application

            # Delay attachment to ensure full initialization
            from PyQt6.QtCore import QTimer

            QTimer.singleShot(1000, lambda: self._do_debugger_attachment())

        except Exception as e:
            print(f"⚠️ Could not attach production debugger: {e}")

    def _do_debugger_attachment(self) -> None:
        """Perform the actual debugger attachment"""
        try:
            from debug import attach_to_application, get_production_debugger

            success = attach_to_application(self)
            if success:
                print("🔍 Production toggle debugger attached successfully!")
                print("🎯 Toggle functionality is now ready for testing!")
            else:
                print("⚠️ Production toggle debugger failed to attach")

        except Exception as e:
            print(f"⚠️ Error during debugger attachment: {e}")
            import traceback

            traceback.print_exc()

    def resizeEvent(self, a0):
        """Handle window resize events."""
        super().resizeEvent(a0)
        if hasattr(self, "orchestrator"):
            self.orchestrator.handle_window_resize(self)


def detect_parallel_testing_mode():
    """Detect if we're running in parallel testing mode."""
    import argparse
    import os

    # Check command line arguments
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--parallel-testing", action="store_true")
    parser.add_argument("--monitor", choices=["primary", "secondary", "left", "right"])
    args, _ = parser.parse_known_args()

    # Check environment variable
    env_parallel = os.environ.get("TKA_PARALLEL_TESTING", "").lower() == "true"
    env_monitor = os.environ.get("TKA_PARALLEL_MONITOR", "")
    env_geometry = os.environ.get("TKA_PARALLEL_GEOMETRY", "")

    parallel_mode = args.parallel_testing or env_parallel
    monitor = args.monitor or env_monitor

    if parallel_mode:
        print(f"🔄 Modern Parallel Testing Mode: {monitor} monitor")
        if env_geometry:
            print(f"   📐 Target geometry: {env_geometry}")

    return parallel_mode, monitor, env_geometry


def create_application():
    """Create Modern application for external use (like parallel testing)."""
    app = QApplication.instance()
    if not app:
        app = QApplication(sys.argv)
        app.setStyle("Fusion")

    # Detect parallel testing mode
    parallel_mode, monitor, geometry = detect_parallel_testing_mode()

    # Determine target screen
    screens = QGuiApplication.screens()
    if parallel_mode and monitor == "secondary" and len(screens) > 1:
        target_screen = screens[1]
    elif parallel_mode and monitor == "primary":
        target_screen = screens[0]
    else:
        target_screen = (
            screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
        )

    # Create window without splash for external use
    window = KineticConstructorModern(
        splash_screen=None,
        target_screen=target_screen,
        parallel_mode=parallel_mode,
        parallel_geometry=geometry,
    )

    return app, window


def main():
    print("🚀 Kinetic Constructor - Starting...")

    # Detect parallel testing mode early
    parallel_mode, monitor, geometry = detect_parallel_testing_mode()

    app = QApplication(sys.argv)
    app.setStyle("Fusion")

    # A+ Enhancement: Apply Qt compatibility optimizations - Temporarily disabled
    # recommended_settings = compat_manager.get_recommended_settings()
    # if recommended_settings.get("high_dpi_scaling"):
    #     app.setAttribute(Qt.ApplicationAttribute.AA_EnableHighDpiScaling, True)
    #     print("✅ High DPI scaling enabled")

    # Determine target screen (dual monitor support)
    screens = QGuiApplication.screens()

    # Override screen selection for parallel testing
    if parallel_mode and len(screens) > 1:
        if monitor in ["secondary", "right"]:
            # Determine which screen is physically on the right
            primary_screen = screens[0]
            secondary_screen = screens[1]

            # If secondary has higher X coordinate, it's on the right
            if secondary_screen.geometry().x() > primary_screen.geometry().x():
                target_screen = secondary_screen
                print(
                    f"🔄 Modern forced to RIGHT monitor (secondary) for parallel testing"
                )
            else:
                target_screen = primary_screen
                print(
                    f"🔄 Modern forced to RIGHT monitor (primary) for parallel testing"
                )

        elif monitor in ["primary", "left"]:
            # Determine which screen is physically on the left
            primary_screen = screens[0]
            secondary_screen = screens[1]

            # If secondary has lower X coordinate, it's on the left
            if secondary_screen.geometry().x() < primary_screen.geometry().x():
                target_screen = secondary_screen
                print(
                    f"🔄 Modern forced to LEFT monitor (secondary) for parallel testing"
                )
            else:
                target_screen = primary_screen
                print(
                    f"🔄 Modern forced to LEFT monitor (primary) for parallel testing"
                )
        else:
            target_screen = screens[1]  # Default to secondary
    else:
        # Normal behavior: prefer secondary monitor if available
        target_screen = (
            screens[1] if len(screens) > 1 else QGuiApplication.primaryScreen()
        )

    try:
        print("🔍 DEBUG: Step 3 - Creating splash screen...")
        # Create and show splash screen on target screen
        splash = SplashScreen(target_screen=target_screen)
        print("🔍 DEBUG: Splash screen created successfully")

        print("🔍 DEBUG: Step 4 - Starting splash animation...")
        fade_in_animation = splash.show_animated()
        print("🔍 DEBUG: Splash animation started")

        # Initialize window variable in outer scope
        window = None

        # Wait for fade-in to complete before starting app initialization
        def start_initialization():
            nonlocal window
            try:
                print("🔍 DEBUG: Step 5 - Starting initialization...")
                splash.update_progress(5, "Initializing application...")
                app.processEvents()

                # Set application icon if available
                icon_path = Path(__file__).parent / "images" / "icons" / "app_icon.png"
                if icon_path.exists():
                    app.setWindowIcon(QIcon(str(icon_path)))

                print("🔍 DEBUG: Step 6 - Creating main window...")
                splash.update_progress(15, "Creating main window...")
                window = KineticConstructorModern(
                    splash_screen=splash,
                    target_screen=target_screen,
                    parallel_mode=parallel_mode,
                    parallel_geometry=geometry,
                )
                print("🔍 DEBUG: Main window created successfully")

                # Call complete_startup after window is created
                complete_startup()

            except Exception as e:
                print(f"❌ FATAL ERROR in start_initialization(): {e}")
                import traceback

                traceback.print_exc()
                return

        def complete_startup():
            if window is None:
                print("❌ ERROR: Window not created, cannot complete startup")
                return

            splash.update_progress(100, "Ready!")
            app.processEvents()

            # Hide splash immediately after reaching 100%
            QTimer.singleShot(200, lambda: splash.hide_animated())

            # Show main window after splash starts hiding
            QTimer.singleShot(300, lambda: window.show())

        fade_in_animation.finished.connect(start_initialization)

        print("✅ Application started successfully!")
        return app.exec()

    except Exception as e:
        print(f"❌ FATAL ERROR in splash/window creation: {e}")
        import traceback

        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
