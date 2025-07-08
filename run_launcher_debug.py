#!/usr/bin/env python3
"""
Debug launcher runner - bypasses VS Code debugger issues
"""
import os
import sys
from pathlib import Path

# Add launcher to path
launcher_dir = Path(__file__).parent / "launcher"
sys.path.insert(0, str(launcher_dir))

# Change to launcher directory
os.chdir(str(launcher_dir))

# Import and run the launcher
try:
    import main as launcher_main
    sys.exit(launcher_main.main())
except Exception as e:
    print(f"Error running launcher: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
