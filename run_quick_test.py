#!/usr/bin/env python3
"""
Quick Test Runner - Start Small and Build Up
===========================================

This script runs tests incrementally, starting with the simplest cases.
"""

import sys
import subprocess
from pathlib import Path

def run_command(cmd, description):
    """Run a command and report results."""
    print(f"\n--- {description} ---")
    print(f"Running: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print("✅ SUCCESS")
            if result.stdout.strip():
                print(result.stdout)
            return True
        else:
            print("❌ FAILED")
            if result.stderr.strip():
                print("Error:", result.stderr[-300:])
            return False
            
    except subprocess.TimeoutExpired:
        print("⏰ TIMEOUT")
        return False
    except Exception as e:
        print(f"💥 ERROR: {e}")
        return False

def main():
    """Run incremental tests."""
    print("TKA Quick Test Runner")
    print("=" * 40)
    
    # Test 1: Basic setup verification
    success1 = run_command([
        sys.executable, "run_pytest_fixed.py", 
        "test_pytest_setup.py", "-v"
    ], "Basic Setup Test")
    
    if not success1:
        print("\n❌ Basic setup failed. Fix project_root imports first.")
        return
    
    # Test 2: Single modern unit test file
    success2 = run_command([
        sys.executable, "run_pytest_fixed.py",
        "src/desktop/modern/tests/unit/test_refactored_di_container.py", "-v"
    ], "Single Modern Test File")
    
    # Test 3: Core modern tests (excluding problematic ones)
    if success2:
        run_command([
            sys.executable, "run_pytest_fixed.py",
            "src/desktop/modern/tests/unit/core/", "-v", "--maxfail=3",
            "-k", "not dependency_injection"
        ], "Core Modern Tests (filtered)")
    
    print(f"\n=== SUMMARY ===")
    print(f"Basic Setup: {'✅' if success1 else '❌'}")
    print(f"Single Test: {'✅' if success2 else '❌'}")
    
    if success1:
        print("\n✅ Pytest is working! You can now run:")
        print("   python run_pytest_fixed.py test_pytest_setup.py")
        print("   python run_pytest_fixed.py -k 'not (legacy or launcher)'")
    else:
        print("\n❌ Need to fix basic imports first")

if __name__ == "__main__":
    main()
