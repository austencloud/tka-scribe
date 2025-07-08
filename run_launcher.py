#!/usr/bin/env python3
"""Simple launcher runner that bypasses VS Code path issues"""
import os
import sys
from pathlib import Path

# Change to launcher directory
launcher_dir = Path(__file__).parent / "launcher"
os.chdir(str(launcher_dir))

# Add launcher to Python path
sys.path.insert(0, str(launcher_dir))

# Run the launcher
if __name__ == "__main__":
    import main
    sys.exit(main.main())
