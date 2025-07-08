#!/usr/bin/env python3
"""
TKA - Clean Entry Point
======================

This is a simple, reliable entry point that launches the TKA Modern Launcher.
No path manipulation, no directory changes, no complexity.
"""

import sys
import os
from pathlib import Path


def main():
    """Launch TKA Modern Launcher directly."""
    try:
        print("="*60)
        print("🚀 ROOT MAIN.PY STARTING (NOT THE LAUNCHER!)")
        print("="*60)
        print("⚠️ This is the root main.py, not the launcher main.py")
        print("⚠️ If you see this, VS Code is running the wrong file!")
        print("="*60)
        
        # Get the launcher directory
        tka_root = Path(__file__).parent
        launcher_dir = tka_root / "launcher"
        launcher_script = launcher_dir / "main.py"
        
        if not launcher_script.exists():
            print("❌ Launcher script not found at:", launcher_script)
            return 1
        
        print("🚀 Starting TKA Modern Launcher...")
        
        # Change to launcher directory and add to path
        original_cwd = os.getcwd()
        original_path = sys.path.copy()
        
        try:
            os.chdir(str(launcher_dir))
            sys.path.insert(0, str(launcher_dir))
            
            # Import and run the launcher main function
            import main as launcher_main
            return launcher_main.main()
            
        finally:
            # Restore original state
            os.chdir(original_cwd)
            sys.path[:] = original_path
        
    except KeyboardInterrupt:
        print("⚠️ Interrupted by user")
        return 0
    except Exception as e:
        print(f"❌ Error launching TKA: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
