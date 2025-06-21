#!/usr/bin/env python3
"""
Main entry point for The Kinetic Constructor (TKA) Monorepo.

This script provides a unified entry point for all TKA applications:
- TKA Desktop (legacy and modern versions)
- Launcher interface
- Development tools

Usage:
    python main.py                    # Launch TKA Desktop launcher
    python main.py --legacy           # Launch legacy TKA directly
    python main.py --modern           # Launch modern TKA directly
    python main.py --dev              # Launch development tools
    python main.py --help             # Show help
"""

import os
import sys
import argparse
from pathlib import Path


def setup_monorepo_paths():
    """Ensure the working directory and Python paths are set correctly for the monorepo."""
    # Get the directory where this script is located (TKA root)
    script_dir = Path(__file__).parent.absolute()

    # Change working directory to TKA root if we're not already there
    if Path.cwd() != script_dir:
        os.chdir(script_dir)

    # Add TKA root to Python path if not already there
    if str(script_dir) not in sys.path:
        sys.path.insert(0, str(script_dir))


def launch_desktop_launcher():
    """Launch the TKA Unified Launcher interface."""
    try:
        # Import and setup the unified launcher
        launcher_path = Path(__file__).parent / "launcher"
        if str(launcher_path) not in sys.path:
            sys.path.insert(0, str(launcher_path))

        # Change to launcher directory
        original_cwd = Path.cwd()
        os.chdir(launcher_path)

        try:
            from main import main as launcher_main

            return launcher_main()
        finally:
            # Restore original working directory
            os.chdir(original_cwd)

    except ImportError as e:
        print(f"Error importing TKA Unified Launcher: {e}")
        print("Please ensure the TKA Unified Launcher is properly set up.")
        return 1


def launch_modern_direct():
    """Launch the modern TKA Desktop application directly."""
    try:
        modern_desktop_path = Path(__file__).parent / "src" / "desktop" / "modern"

        if str(modern_desktop_path) not in sys.path:
            sys.path.insert(0, str(modern_desktop_path))

        # Change to modern desktop directory
        original_cwd = Path.cwd()
        os.chdir(modern_desktop_path)

        try:
            from main import main as modern_main

            return modern_main()
        finally:
            # Restore original working directory
            os.chdir(original_cwd)

    except ImportError as modern_error:
        print(f"Error importing Modern main: {modern_error}")
        print("Please ensure the TKA Desktop modern application is properly set up.")
        return 1


def launch_dev_tools():
    """Launch TKA development tools."""
    try:
        desktop_path = Path(__file__).parent / "src" / "desktop"

        if str(desktop_path) not in sys.path:
            sys.path.insert(0, str(desktop_path))

        # Change to desktop directory
        original_cwd = Path.cwd()
        os.chdir(desktop_path)

        try:
            import dev_setup

            return dev_setup.main()
        finally:
            # Restore original working directory
            os.chdir(original_cwd)

    except ImportError as dev_error:
        print(f"Error importing development tools: {dev_error}")
        print("Please ensure the TKA Desktop development tools are properly set up.")
        return 1


def main():
    """Main entry point with command line argument parsing."""
    parser = argparse.ArgumentParser(
        description="TKA Monorepo - The Kinetic Constructor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py              # Launch TKA Desktop launcher
  python main.py --modern     # Launch modern TKA directly
  python main.py --dev        # Launch development tools
        """,
    )

    parser.add_argument(
        "--modern", action="store_true", help="Launch modern TKA Desktop directly"
    )
    parser.add_argument(
        "--dev", action="store_true", help="Launch TKA development tools"
    )

    args = parser.parse_args()

    # Setup monorepo environment
    setup_monorepo_paths()

    # Route to appropriate launcher based on arguments
    if args.modern:
        return launch_modern_direct()
    elif args.dev:
        return launch_dev_tools()
    else:
        # Default: launch the desktop launcher interface
        return launch_desktop_launcher()


if __name__ == "__main__":
    sys.exit(main())
