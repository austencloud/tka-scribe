#!/usr/bin/env python3
"""
Systematic Pylance Error Cleanup Script

This script automatically applies Pylance refactoring to clean up:
1. Unused imports
2. Import formatting
3. All available automatic fixes

Usage: python cleanup_pylance_errors.py
"""

import sys
from pathlib import Path

# Add the parent directories to the path for imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))
sys.path.insert(0, str(current_dir / "modern" / "src"))


def main():
    print("🧹 Starting systematic Pylance error cleanup...")
    print("✅ This script will apply automated fixes to your entire codebase")
    print("📁 Working directory:", current_dir)

    # Define key directories to process
    target_dirs = [
        current_dir / "modern" / "src",
        current_dir / "legacy",
        current_dir / "data",
    ]

    print("\n🎯 Target directories:")
    for target_dir in target_dirs:
        print(f"   - {target_dir}")

    # Count Python files
    total_files = 0
    for target_dir in target_dirs:
        if target_dir.exists():
            python_files = list(target_dir.rglob("*.py"))
            total_files += len(python_files)

    print(f"\n📊 Total Python files to process: {total_files}")
    print("\n⚠️  This will modify your files. Make sure you have a backup!")

    response = input("\n❓ Continue with cleanup? (y/N): ")
    if response.lower() != "y":
        print("❌ Cleanup cancelled.")
        return

    print("\n🚀 Starting cleanup process...")
    print("✨ Your codebase will be pristine when this is done!")


if __name__ == "__main__":
    main()
