#!/usr/bin/env python3
"""
Restructure TKA project to professional monorepo structure.
This script transforms the current directory layout to the target monorepo structure.
"""

import os
import shutil
import sys
from pathlib import Path


def restructure_to_monorepo():
    """Restructure current directory layout to professional monorepo."""

    root = Path(".")
    print("🚀 Starting TKA monorepo restructuring...")
    print(f"Working directory: {root.absolute()}")

    # Create new directory structure
    directories = [
        "apps",
        "packages",
        "docs",
        "scripts",
        "tests",
        "packages/shared-types",
        "packages/constants",
        "packages/utils",
        "packages/assets",
        "packages/shared-types/python",
        "packages/shared-types/typescript",
        "packages/constants/python",
        "packages/constants/typescript",
    ]

    print("\n📁 Creating directory structure...")
    for dir_path in directories:
        os.makedirs(dir_path, exist_ok=True)
        print(f"✅ Created directory: {dir_path}")

    # Move existing directories
    moves = [
        ("tka-desktop", "apps/desktop"),
        ("tka-web/tka-web-app", "apps/web"),
        ("tka-web/tka-landing-page", "apps/landing"),
        ("tka-web/pictograph-animator", "apps/animator"),
        ("images", "packages/assets/images"),
    ]

    print("\n📦 Moving existing directories...")
    for src, dst in moves:
        if os.path.exists(src):
            try:
                if os.path.exists(dst):
                    print(f"⚠️  Destination {dst} exists, removing...")
                    shutil.rmtree(dst)

                # Use copytree instead of move to avoid permission issues
                shutil.copytree(src, dst, dirs_exist_ok=True)
                print(f"✅ Copied {src} → {dst}")

                # Try to remove source after successful copy
                try:
                    shutil.rmtree(src)
                    print(f"🗑️  Removed original {src}")
                except PermissionError:
                    print(
                        f"⚠️  Could not remove original {src} (permission denied), keeping both"
                    )
                except Exception as e:
                    print(f"⚠️  Could not remove original {src}: {e}")

            except Exception as e:
                print(f"❌ Failed to move {src} → {dst}: {e}")
        else:
            print(f"⚠️  Source {src} not found, skipping...")

    # Clean up empty directories
    cleanup_dirs = ["tka-web"]
    print("\n🗑️  Cleaning up empty directories...")
    for dir_path in cleanup_dirs:
        if os.path.exists(dir_path):
            try:
                if not os.listdir(dir_path):
                    os.rmdir(dir_path)
                    print(f"🗑️  Removed empty directory: {dir_path}")
                else:
                    print(f"⚠️  Directory {dir_path} not empty, keeping...")
            except OSError as e:
                print(f"⚠️  Could not remove {dir_path}: {e}")

    # Create __init__.py files for Python packages
    init_files = [
        "packages/__init__.py",
        "packages/shared-types/__init__.py",
        "packages/shared-types/python/__init__.py",
        "packages/constants/__init__.py",
        "packages/constants/python/__init__.py",
        "packages/utils/__init__.py",
        "packages/assets/__init__.py",
    ]

    print("\n🐍 Creating Python package __init__.py files...")
    for init_file in init_files:
        Path(init_file).touch()
        print(f"✅ Created: {init_file}")

    print("\n🎉 Monorepo restructuring complete!")
    print("\nNext steps:")
    print("1. Update import paths in Python code")
    print("2. Update package.json workspace configurations")
    print("3. Run tests to verify everything works")


if __name__ == "__main__":
    try:
        restructure_to_monorepo()
    except Exception as e:
        print(f"❌ Error during restructuring: {e}")
        sys.exit(1)
