#!/usr/bin/env python3
"""
TKA Pytest Runner
================

This script ensures pytest runs correctly from any directory in the TKA monorepo.
It sets up the Python path properly before running pytest.

Usage:
    python run_pytest.py [pytest args...]
    
Or from the command line:
    pytest  # This should work after the fix
"""

import sys
import os
from pathlib import Path
import subprocess

def setup_tka_environment():
    """Set up the TKA environment for pytest."""
    # Get the directory containing this script (should be TKA root)
    root_dir = Path(__file__).parent.absolute()
    
    # Add root directory to Python path
    if str(root_dir) not in sys.path:
        sys.path.insert(0, str(root_dir))
    
    # Set PYTHONPATH environment variable
    current_pythonpath = os.environ.get('PYTHONPATH', '')
    paths_to_add = [
        str(root_dir),
        str(root_dir / 'src'),
        str(root_dir / 'src' / 'desktop' / 'modern' / 'src'),
        str(root_dir / 'launcher'),
        str(root_dir / 'packages'),
    ]
    
    # Combine paths
    all_paths = paths_to_add + ([current_pythonpath] if current_pythonpath else [])
    os.environ['PYTHONPATH'] = os.pathsep.join(all_paths)
    
    print(f"TKA Root: {root_dir}")
    print(f"PYTHONPATH set to: {os.environ['PYTHONPATH']}")

def main():
    """Main entry point."""
    # Set up environment
    setup_tka_environment()
    
    # Import and ensure project setup
    try:
        from project_root import ensure_project_setup
        success = ensure_project_setup()
        if not success:
            print("Failed to set up TKA project environment")
            return 1
    except ImportError as e:
        print(f"Failed to import project_root: {e}")
        return 1
    
    # Run pytest with all arguments passed through
    import pytest
    return pytest.main(sys.argv[1:] if len(sys.argv) > 1 else [])

if __name__ == "__main__":
    sys.exit(main())
