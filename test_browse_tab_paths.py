#!/usr/bin/env python3
"""
Test script to verify Browse Tab data directory resolution.
"""

import sys
from pathlib import Path

# Add the workspace to Python path
workspace_root = Path(__file__).resolve().parent
sys.path.insert(0, str(workspace_root))
sys.path.insert(0, str(workspace_root / "src"))

print(f"Testing Browse Tab data directory resolution...")

try:
    # Test the path resolution logic directly (without creating the full tab)
    from desktop.shared.infrastructure.path_resolver import path_resolver
    expected_data_dir = path_resolver.data_dir
    print(f"✅ Expected data_dir from path resolver: {expected_data_dir}")
    
    # Verify it has the dictionary
    dict_dir = expected_data_dir / "dictionary"
    print(f"✅ Dictionary directory exists: {dict_dir.exists()}")
    
    if dict_dir.exists():
        dirs = [d.name for d in dict_dir.iterdir() if d.is_dir() and not d.name.startswith('__')][:3]
        print(f"✅ Sample dictionary entries: {dirs}")
    
except Exception as e:
    print(f"❌ Error testing path resolution: {e}")
    import traceback
    traceback.print_exc()
