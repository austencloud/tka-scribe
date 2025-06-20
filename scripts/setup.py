#!/usr/bin/env python3
"""
Setup script for TKA monorepo development environment.
This script sets up the entire development environment from scratch.
"""

import subprocess
import sys
import os
from pathlib import Path


def run_command(command, cwd=None, check=True):
    """Run a command and handle errors."""
    try:
        print(f"🔧 Running: {' '.join(command)}")
        result = subprocess.run(command, cwd=cwd, check=check)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print(f"❌ Command not found: {command[0]}")
        return False


def check_prerequisites():
    """Check if required tools are installed."""
    print("🔍 Checking prerequisites...")
    
    # Check Python
    try:
        python_version = subprocess.check_output([sys.executable, "--version"], text=True).strip()
        print(f"✅ {python_version}")
    except Exception:
        print("❌ Python not found")
        return False
    
    # Check Node.js
    try:
        node_version = subprocess.check_output(["node", "--version"], text=True).strip()
        print(f"✅ Node.js {node_version}")
    except Exception:
        print("❌ Node.js not found")
        print("   Please install Node.js 18+ from https://nodejs.org/")
        return False
    
    # Check npm
    try:
        npm_version = subprocess.check_output(["npm", "--version"], text=True).strip()
        print(f"✅ npm {npm_version}")
    except Exception:
        print("❌ npm not found")
        return False
    
    # Check Git
    try:
        git_version = subprocess.check_output(["git", "--version"], text=True).strip()
        print(f"✅ {git_version}")
    except Exception:
        print("❌ Git not found")
        print("   Please install Git from https://git-scm.com/")
        return False
    
    return True


def setup_monorepo():
    """Set up the monorepo development environment."""
    root = Path(__file__).parent.parent
    print(f"📁 Setting up TKA monorepo at: {root.absolute()}")
    
    if not check_prerequisites():
        print("❌ Prerequisites not met. Please install required tools.")
        return False
    
    # Install root dependencies
    print("\n📦 Installing root workspace dependencies...")
    if not run_command(["npm", "install"], cwd=root):
        print("❌ Failed to install root dependencies")
        return False
    
    # Set up Python environment for desktop app
    desktop_path = root / "apps" / "desktop"
    if desktop_path.exists():
        print("\n🐍 Setting up Python environment...")
        
        # Check if virtual environment exists
        venv_path = desktop_path / "venv"
        if not venv_path.exists():
            print("🔧 Creating Python virtual environment...")
            if not run_command([sys.executable, "-m", "venv", "venv"], cwd=desktop_path):
                print("❌ Failed to create virtual environment")
                return False
        
        # Activate virtual environment and install dependencies
        if sys.platform == "win32":
            python_exe = venv_path / "Scripts" / "python.exe"
            pip_exe = venv_path / "Scripts" / "pip.exe"
        else:
            python_exe = venv_path / "bin" / "python"
            pip_exe = venv_path / "bin" / "pip"
        
        # Upgrade pip
        if not run_command([str(python_exe), "-m", "pip", "install", "--upgrade", "pip"], cwd=desktop_path):
            print("⚠️  Failed to upgrade pip, continuing...")
        
        # Install Python dependencies
        requirements_file = desktop_path / "requirements.txt"
        pyproject_file = desktop_path / "pyproject.toml"
        
        if requirements_file.exists():
            print("📦 Installing Python dependencies from requirements.txt...")
            if not run_command([str(pip_exe), "install", "-r", "requirements.txt"], cwd=desktop_path):
                print("❌ Failed to install Python dependencies")
                return False
        elif pyproject_file.exists():
            print("📦 Installing Python dependencies from pyproject.toml...")
            if not run_command([str(pip_exe), "install", "-e", ".[dev]"], cwd=desktop_path):
                print("❌ Failed to install Python dependencies")
                return False
        else:
            print("⚠️  No Python requirements file found")
    
    # Set up Node.js dependencies for web apps
    web_apps = ["web", "landing", "animator"]
    for app in web_apps:
        app_path = root / "apps" / app
        if app_path.exists():
            print(f"\n📦 Setting up {app} dependencies...")
            if not run_command(["npm", "install"], cwd=app_path):
                print(f"❌ Failed to install {app} dependencies")
                return False
        else:
            print(f"⚠️  {app} not found, skipping")
    
    # Set up shared packages
    shared_packages = ["shared-types", "constants"]
    for package in shared_packages:
        package_path = root / "packages" / package
        if package_path.exists() and (package_path / "package.json").exists():
            print(f"\n📦 Setting up {package} package...")
            if not run_command(["npm", "install"], cwd=package_path):
                print(f"❌ Failed to install {package} dependencies")
                return False
    
    print("\n🎉 Setup complete!")
    print("\n🚀 Next steps:")
    print("   python scripts/dev.py fullstack  # Start full-stack development")
    print("   python scripts/dev.py desktop    # Start desktop app only")
    print("   python scripts/dev.py test       # Run all tests")
    print("   python scripts/dev.py build      # Build all applications")
    
    return True


if __name__ == "__main__":
    try:
        success = setup_monorepo()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n🛑 Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)
