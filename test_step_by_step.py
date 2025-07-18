"""
Step by step import test.
"""

print("Step 1: Basic imports...")
from enum import Enum

print("✅ Enum imported")

from dataclasses import dataclass

print("✅ dataclass imported")

from typing import Any, Dict, List, Optional

print("✅ typing imported")

print("Step 2: Try importing browse models...")
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent.parent))

try:
    print("Trying to import from presentation.tabs.browse.models...")
    from src.desktop.modern.src.presentation.tabs.browse.models import FilterType

    print("✅ FilterType imported successfully!")
except Exception as e:
    print(f"❌ Failed: {e}")
    import traceback

    traceback.print_exc()
