#!/usr/bin/env python3
"""
TKA Test Runner - Diagnose and Run Tests
=======================================

This script runs tests in smaller batches to help identify and fix import issues.
"""

import sys
import os
import subprocess
from pathlib import Path
from typing import List, Dict

def setup_environment():
    """Set up the environment for testing."""
    root_dir = Path(__file__).parent.absolute()
    
    # Add to Python path
    paths = [
        str(root_dir),
        str(root_dir / 'src'),
        str(root_dir / 'src' / 'desktop' / 'modern' / 'src'),
        str(root_dir / 'src' / 'desktop' / 'legacy' / 'src'),
        str(root_dir / 'launcher'),
    ]
    
    for path in paths:
        if path not in sys.path:
            sys.path.insert(0, path)
    
    os.environ['PYTHONPATH'] = os.pathsep.join(paths)

def test_imports():
    """Test key imports to diagnose issues."""
    print("=== TESTING KEY IMPORTS ===")
    
    test_cases = [
        ("project_root", "from project_root import ensure_project_setup"),
        ("domain.models.core_models", "from domain.models.core_models import BeatData"),
        ("core.dependency_injection", "from core.dependency_injection.di_container import DIContainer"),
        ("PyQt6.QtCore", "from PyQt6.QtCore import Qt"),
    ]
    
    results = {}
    for name, import_stmt in test_cases:
        try:
            exec(import_stmt)
            print(f"✅ {name}")
            results[name] = True
        except Exception as e:
            print(f"❌ {name}: {e}")
            results[name] = False
    
    return results

def run_test_subset(test_pattern: str, max_failures: int = 5) -> bool:
    """Run a subset of tests with early failure detection."""
    print(f"\n=== RUNNING TESTS: {test_pattern} ===")
    
    cmd = [
        sys.executable, "-m", "pytest", 
        test_pattern,
        "-v",
        "--tb=short",
        f"--maxfail={max_failures}",
        "--disable-warnings"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print(f"✅ {test_pattern} - All tests passed")
            return True
        else:
            print(f"❌ {test_pattern} - Some tests failed")
            print("STDOUT:", result.stdout[-500:])  # Last 500 chars
            print("STDERR:", result.stderr[-500:])  # Last 500 chars
            return False
            
    except subprocess.TimeoutExpired:
        print(f"⏰ {test_pattern} - Tests timed out")
        return False
    except Exception as e:
        print(f"💥 {test_pattern} - Error running tests: {e}")
        return False

def main():
    """Main test runner."""
    print("TKA Test Diagnosis and Runner")
    print("=" * 50)
    
    # Set up environment
    setup_environment()
    
    # Test imports first
    import_results = test_imports()
    
    # Define test categories in order of complexity
    test_categories = [
        ("Basic Setup", "test_pytest_setup.py"),
        ("Modern Unit - Core", "src/desktop/modern/tests/unit/core/ -k 'not dependency_injection'"),
        ("Modern Unit - Domain", "src/desktop/modern/tests/unit/application/services/core/"),
        ("Launcher Tests", "launcher/tests/test_base.py"),
    ]
    
    print(f"\n=== RUNNING TEST CATEGORIES ===")
    
    for category, pattern in test_categories:
        print(f"\n--- {category} ---")
        
        # Skip categories with known import issues
        if category == "Launcher Tests" and not import_results.get("PyQt6.QtCore", False):
            print("⏭️  Skipping launcher tests (PyQt6 not available)")
            continue
            
        success = run_test_subset(pattern, max_failures=3)
        
        if not success:
            print(f"❌ Stopping at {category} due to failures")
            break
    
    print(f"\n=== DIAGNOSTIC SUMMARY ===")
    print("Import Status:")
    for name, status in import_results.items():
        status_icon = "✅" if status else "❌"
        print(f"  {status_icon} {name}")
    
    print(f"\nTo run individual test categories:")
    print(f"  python run_test_diagnosis.py")
    print(f"  python run_pytest_fixed.py test_pytest_setup.py -v")
    print(f"  python run_pytest_fixed.py src/desktop/modern/tests/unit/core/ -v --maxfail=3")

if __name__ == "__main__":
    main()
