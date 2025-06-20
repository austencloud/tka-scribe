#!/usr/bin/env python3
"""
Main entry point for The Kinetic Constructor Desktop application.
"""

import os
import sys
from pathlib import Path


def setup_paths():
    """Ensure the working directory and Python paths are set correctly."""
    # Get the directory where this script is located (tka-desktop)
    script_dir = Path(__file__).parent.absolute()

    # Change working directory to tka-desktop if we're not already there
    if Path.cwd() != script_dir:
        os.chdir(script_dir)

    # Add tka-desktop to Python path if not already there
    if str(script_dir) not in sys.path:
        sys.path.insert(0, str(script_dir))


def main():
    setup_paths()

    try:
        from launcher import LauncherApplication

        app = LauncherApplication(sys.argv)
        return app.run()
    except ImportError as e:
        print(f"Error importing launcher: {e}")
        print("Falling back to Legacy main application...")

        legacy_src_path = os.path.join(os.path.dirname(__file__), "legacy", "src")
        if legacy_src_path not in sys.path:
            sys.path.insert(0, legacy_src_path)

        try:
            from main import main as legacy_main

            return legacy_main()
        except ImportError as legacy_error:
            print(f"Error importing Legacy main: {legacy_error}")
            print("Please ensure the application is properly set up.")
            return 1


if __name__ == "__main__":
    sys.exit(main())
