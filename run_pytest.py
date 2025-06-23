#!/usr/bin/env python3
"""
TKA Monorepo Pytest Runner
==========================

This script provides a convenient way to run pytest across the TKA monorepo
from any directory. It handles the complex import path setup automatically.

Usage:
    python run_pytest.py                    # Run all tests
    python run_pytest.py --modern           # Run modern desktop tests only
    python run_pytest.py --legacy           # Run legacy desktop tests only  
    python run_pytest.py --launcher         # Run launcher tests only
    python run_pytest.py --domain           # Run domain tests only (fast)
    python run_pytest.py --help             # Show help
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path


def get_project_root():
    """Get the TKA monorepo root directory."""
    return Path(__file__).parent.absolute()


def run_modern_tests(test_filter=None, extra_args=None):
    """Run modern desktop tests."""
    modern_dir = get_project_root() / "src" / "desktop" / "modern"
    
    cmd = [
        sys.executable, "-m", "pytest",
        "-v",
        "--tb=short"
    ]
    
    if test_filter:
        cmd.append(test_filter)
    else:
        cmd.append("tests/")
    
    if extra_args:
        cmd.extend(extra_args)
    
    env = os.environ.copy()
    env["PYTHONPATH"] = str(modern_dir / "src")
    
    print(f"🧪 Running modern desktop tests...")
    print(f"📁 Working directory: {modern_dir}")
    print(f"🐍 PYTHONPATH: {env['PYTHONPATH']}")
    print(f"⚡ Command: {' '.join(cmd)}")
    print("=" * 60)
    
    result = subprocess.run(
        cmd,
        cwd=modern_dir,
        env=env
    )
    
    return result.returncode


def run_launcher_tests(extra_args=None):
    """Run launcher tests."""
    launcher_dir = get_project_root() / "launcher"
    
    cmd = [
        sys.executable, "-m", "pytest",
        "-v",
        "--tb=short",
        "tests/"
    ]
    
    if extra_args:
        cmd.extend(extra_args)
    
    env = os.environ.copy()
    env["PYTHONPATH"] = str(get_project_root())
    
    print(f"🚀 Running launcher tests...")
    print(f"📁 Working directory: {launcher_dir}")
    print(f"🐍 PYTHONPATH: {env['PYTHONPATH']}")
    print(f"⚡ Command: {' '.join(cmd)}")
    print("=" * 60)
    
    result = subprocess.run(
        cmd,
        cwd=launcher_dir,
        env=env
    )
    
    return result.returncode


def run_legacy_tests(extra_args=None):
    """Run legacy desktop tests."""
    legacy_dir = get_project_root() / "src" / "desktop" / "legacy"
    
    cmd = [
        sys.executable, "-m", "pytest",
        "-v",
        "--tb=short",
        "tests/"
    ]
    
    if extra_args:
        cmd.extend(extra_args)
    
    env = os.environ.copy()
    env["PYTHONPATH"] = str(legacy_dir / "src")
    
    print(f"🏛️ Running legacy desktop tests...")
    print(f"📁 Working directory: {legacy_dir}")
    print(f"🐍 PYTHONPATH: {env['PYTHONPATH']}")
    print(f"⚡ Command: {' '.join(cmd)}")
    print("=" * 60)
    
    result = subprocess.run(
        cmd,
        cwd=legacy_dir,
        env=env
    )
    
    return result.returncode


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="TKA Monorepo Pytest Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_pytest.py --modern --domain     # Run modern domain tests
  python run_pytest.py --launcher            # Run launcher tests
  python run_pytest.py --modern -k "test_beat"  # Run modern tests matching "test_beat"
        """
    )
    
    parser.add_argument(
        "--modern", 
        action="store_true", 
        help="Run modern desktop tests"
    )
    parser.add_argument(
        "--legacy", 
        action="store_true", 
        help="Run legacy desktop tests"
    )
    parser.add_argument(
        "--launcher", 
        action="store_true", 
        help="Run launcher tests"
    )
    parser.add_argument(
        "--domain", 
        action="store_true", 
        help="Run domain tests only (fast)"
    )
    parser.add_argument(
        "--all", 
        action="store_true", 
        help="Run all tests (default)"
    )
    
    # Parse known args to allow passing through pytest arguments
    args, extra_args = parser.parse_known_args()
    
    # If no specific test suite is selected, run modern by default
    if not any([args.modern, args.legacy, args.launcher, args.all]):
        args.modern = True
    
    exit_codes = []
    
    if args.modern or args.all:
        if args.domain:
            # Run only domain tests (fast)
            exit_code = run_modern_tests("tests/specification/domain/", extra_args)
        else:
            # Run all modern tests
            exit_code = run_modern_tests(None, extra_args)
        exit_codes.append(exit_code)
    
    if args.launcher or args.all:
        exit_code = run_launcher_tests(extra_args)
        exit_codes.append(exit_code)
    
    if args.legacy or args.all:
        exit_code = run_legacy_tests(extra_args)
        exit_codes.append(exit_code)
    
    # Return non-zero if any test suite failed
    final_exit_code = max(exit_codes) if exit_codes else 0
    
    if final_exit_code == 0:
        print("\n🎉 All tests passed!")
    else:
        print(f"\n❌ Some tests failed (exit code: {final_exit_code})")
    
    return final_exit_code


if __name__ == "__main__":
    sys.exit(main())
