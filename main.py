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
    """Launch the TKA Desktop launcher interface."""
    try:
        # Import and setup the desktop project
        tka_desktop_path = Path(__file__).parent / "tka-desktop"
        if str(tka_desktop_path) not in sys.path:
            sys.path.insert(0, str(tka_desktop_path))
        
        from tka_desktop.launcher import LauncherApplication
        
        app = LauncherApplication(sys.argv)
        return app.run()
    except ImportError as e:
        print(f"Error importing TKA Desktop launcher: {e}")
        print("Falling back to legacy TKA Desktop main application...")
        return launch_legacy_direct()


def launch_legacy_direct():
    """Launch the legacy TKA Desktop application directly."""
    try:
        tka_desktop_path = Path(__file__).parent / "tka-desktop"
        legacy_src_path = tka_desktop_path / "legacy" / "src"
        
        if str(legacy_src_path) not in sys.path:
            sys.path.insert(0, str(legacy_src_path))
        
        # Change to tka-desktop directory for legacy compatibility
        original_cwd = Path.cwd()
        os.chdir(tka_desktop_path)
        
        try:
            from main import main as legacy_main
            return legacy_main()
        finally:
            # Restore original working directory
            os.chdir(original_cwd)
            
    except ImportError as legacy_error:
        print(f"Error importing Legacy main: {legacy_error}")
        print("Please ensure the TKA Desktop application is properly set up.")
        return 1


def launch_modern_direct():
    """Launch the modern TKA Desktop application directly."""
    try:
        tka_desktop_path = Path(__file__).parent / "tka-desktop"
        modern_path = tka_desktop_path / "modern"
        
        if str(modern_path) not in sys.path:
            sys.path.insert(0, str(modern_path))
        
        # Change to tka-desktop directory for compatibility
        original_cwd = Path.cwd()
        os.chdir(tka_desktop_path)
        
        try:
            from modern.main import main as modern_main
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
        tka_desktop_path = Path(__file__).parent / "tka-desktop"
        
        if str(tka_desktop_path) not in sys.path:
            sys.path.insert(0, str(tka_desktop_path))
        
        # Change to tka-desktop directory for compatibility
        original_cwd = Path.cwd()
        os.chdir(tka_desktop_path)
        
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
  python main.py --legacy     # Launch legacy TKA directly
  python main.py --modern     # Launch modern TKA directly
  python main.py --dev        # Launch development tools
        """
    )
    
    parser.add_argument(
        "--legacy", 
        action="store_true", 
        help="Launch legacy TKA Desktop directly"
    )
    parser.add_argument(
        "--modern", 
        action="store_true", 
        help="Launch modern TKA Desktop directly"
    )
    parser.add_argument(
        "--dev", 
        action="store_true", 
        help="Launch TKA development tools"
    )
    
    args = parser.parse_args()
    
    # Setup monorepo environment
    setup_monorepo_paths()
    
    # Route to appropriate launcher based on arguments
    if args.legacy:
        return launch_legacy_direct()
    elif args.modern:
        return launch_modern_direct()
    elif args.dev:
        return launch_dev_tools()
    else:
        # Default: launch the desktop launcher interface
        return launch_desktop_launcher()


if __name__ == "__main__":
    sys.exit(main())
