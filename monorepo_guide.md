# TKA Monorepo Professional Setup - Complete Implementation Guide

## Project Context

You are transforming the TKA (The Kinetic Constructor) project from a multi-directory structure into a professional monorepo that houses both desktop (PyQt) and web (SvelteKit) applications sharing a unified backend API. The workspace root is `F:\CODE\TKA` and should become a single, cohesive development environment.

## Current State Analysis

```
F:\CODE\TKA\
├── .pytest_cache/
├── data/                 # Shared data files
├── images/               # Shared assets
├── tka-desktop/          # PyQt desktop app with modern/legacy structure
│   ├── legacy/           # Legacy PyQt code (keep static)
│   ├── modern/           # Modern architecture with DI, services, API
│   └── launcher/         # App launcher
└── tka-web/              # Web applications
    ├── tka-web-app/      # Main SvelteKit application
    ├── tka-landing-page/ # Marketing site
    └── pictograph-animator/ # Animation tool
```

## Target Professional Monorepo Structure

Transform the current structure into this enterprise-grade monorepo:

```
F:\CODE\TKA\                          # Single Git repository
├── .vscode/                          # Workspace configuration
│   ├── settings.json                 # Unified IDE settings
│   ├── tasks.json                    # Development tasks
│   └── extensions.json               # Recommended extensions
├── .github/                          # CI/CD and automation
│   ├── workflows/                    # GitHub Actions
│   └── ISSUE_TEMPLATE/               # Issue templates
├── apps/                             # Application packages
│   ├── desktop/                      # PyQt desktop application
│   ├── web/                          # Main SvelteKit web app
│   ├── landing/                      # Marketing website
│   └── animator/                     # Pictograph animator tool
├── packages/                         # Shared packages
│   ├── shared-types/                 # TypeScript/Python type definitions
│   ├── constants/                    # Shared constants and enums
│   ├── utils/                        # Shared utility functions
│   └── assets/                       # Shared assets and icons
├── data/                             # Shared data files
├── docs/                             # Documentation
├── scripts/                          # Development and build scripts
├── tests/                            # Integration and E2E tests
├── package.json                      # Workspace package management
├── pyproject.toml                    # Python workspace configuration
├── README.md                         # Comprehensive project documentation
└── .gitignore                        # Unified ignore patterns
```

## Implementation Tasks

### Task 1: Workspace Configuration

#### 1.1 VSCode Workspace Setup
```json
// .vscode/settings.json
{
  "python.defaultInterpreterPath": "./apps/desktop/venv/bin/python",
  "python.analysis.extraPaths": [
    "./apps/desktop/modern/src",
    "./apps/desktop/legacy/src",
    "./packages/shared-types/python"
  ],
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "eslint.workingDirectories": [
    "./apps/web",
    "./apps/landing", 
    "./apps/animator"
  ],
  "files.exclude": {
    "**/__pycache__": true,
    "**/node_modules": true,
    "**/.pytest_cache": true,
    "**/.svelte-kit": true,
    "**/dist": true,
    "**/build": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/__pycache__": true,
    "**/venv": true
  },
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["./apps/desktop/modern/tests"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

#### 1.2 Development Tasks
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Desktop App",
      "type": "shell",
      "command": "python",
      "args": ["main.py"],
      "options": {
        "cwd": "${workspaceFolder}/apps/desktop/modern"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Start Web App",
      "type": "shell", 
      "command": "npm",
      "args": ["run", "dev"],
      "options": {
        "cwd": "${workspaceFolder}/apps/web"
      },
      "group": "build"
    },
    {
      "label": "Start API Server",
      "type": "shell",
      "command": "python", 
      "args": ["start_production_api.py"],
      "options": {
        "cwd": "${workspaceFolder}/apps/desktop/modern"
      },
      "group": "build"
    },
    {
      "label": "Run All Tests",
      "type": "shell",
      "command": "python",
      "args": ["-m", "pytest", "apps/desktop/modern/tests/", "-v"],
      "group": "test"
    },
    {
      "label": "Full Stack Development",
      "dependsOrder": "parallel",
      "dependsOn": ["Start API Server", "Start Web App"],
      "group": "build"
    }
  ]
}
```

#### 1.3 Recommended Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.isort",
    "ms-python.pylint",
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.test-adapter-converter"
  ]
}
```

### Task 2: Repository Structure Migration

#### 2.1 Directory Restructuring Script
```python
# scripts/restructure_monorepo.py
import os
import shutil
from pathlib import Path

def restructure_to_monorepo():
    """Restructure current directory layout to professional monorepo."""
    
    root = Path(".")
    
    # Create new directory structure
    directories = [
        "apps", "packages", "docs", "scripts", "tests",
        "packages/shared-types", "packages/constants", 
        "packages/utils", "packages/assets"
    ]
    
    for dir_path in directories:
        os.makedirs(dir_path, exist_ok=True)
        print(f"✅ Created directory: {dir_path}")
    
    # Move existing directories
    moves = [
        ("tka-desktop", "apps/desktop"),
        ("tka-web/tka-web-app", "apps/web"),
        ("tka-web/tka-landing-page", "apps/landing"),
        ("tka-web/pictograph-animator", "apps/animator"),
        ("images", "packages/assets/images")
    ]
    
    for src, dst in moves:
        if os.path.exists(src):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.move(src, dst)
            print(f"✅ Moved {src} → {dst}")
    
    # Clean up empty directories
    cleanup_dirs = ["tka-web"]
    for dir_path in cleanup_dirs:
        if os.path.exists(dir_path) and not os.listdir(dir_path):
            os.rmdir(dir_path)
            print(f"🗑️  Removed empty directory: {dir_path}")
    
    print("\n🎉 Monorepo restructuring complete!")

if __name__ == "__main__":
    restructure_to_monorepo()
```

#### 2.2 Workspace Package Configuration
```json
// package.json - Root workspace configuration
{
  "name": "tka-monorepo",
  "version": "1.0.0",
  "description": "The Kinetic Constructor - Desktop and Web Applications",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:desktop": "cd apps/desktop/modern && python main.py",
    "dev:web": "cd apps/web && npm run dev",
    "dev:landing": "cd apps/landing && npm run dev", 
    "dev:animator": "cd apps/animator && npm run dev",
    "dev:api": "cd apps/desktop/modern && python start_production_api.py",
    "dev:fullstack": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "build:web": "cd apps/web && npm run build",
    "build:landing": "cd apps/landing && npm run build",
    "build:animator": "cd apps/animator && npm run build",
    "build:desktop": "cd apps/desktop && python scripts/build.py",
    "build:all": "npm run build:web && npm run build:landing && npm run build:animator && npm run build:desktop",
    "test:desktop": "cd apps/desktop && python -m pytest modern/tests/ -v",
    "test:web": "cd apps/web && npm test",
    "test:integration": "python scripts/test_integration.py",
    "test:all": "npm run test:desktop && npm run test:web && npm run test:integration",
    "lint:python": "cd apps/desktop && black . && isort . && pylint modern/src/",
    "lint:js": "cd apps/web && npm run lint && cd ../landing && npm run lint && cd ../animator && npm run lint",
    "lint:all": "npm run lint:python && npm run lint:js",
    "clean": "python scripts/clean.py",
    "setup": "python scripts/setup.py",
    "docs:serve": "cd docs && python -m http.server 8080"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "cross-env": "^7.0.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "python": ">=3.9.0"
  }
}
```

#### 2.3 Python Workspace Configuration
```toml
# pyproject.toml - Python workspace configuration
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "tka-monorepo"
version = "1.0.0"
description = "The Kinetic Constructor - Python components"
authors = [
    {name = "TKA Team", email = "team@tka.dev"}
]
dependencies = [
    "PyQt6>=6.4.0",
    "fastapi>=0.100.0",
    "uvicorn>=0.23.0",
    "requests>=2.31.0",
    "pydantic>=2.0.0",
    "sqlalchemy>=2.0.0"
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0", 
    "isort>=5.12.0",
    "pylint>=2.17.0",
    "mypy>=1.5.0",
    "pytest-cov>=4.1.0",
    "pytest-asyncio>=0.21.0"
]

[tool.black]
line-length = 88
target-version = ['py39']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.venv
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88

[tool.pylint.messages_control]
disable = "C0330, C0326"

[tool.pytest.ini_options]
testpaths = ["apps/desktop/modern/tests", "tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
addopts = "-v --tb=short"
```

### Task 3: Shared Packages Implementation

#### 3.1 Shared TypeScript/Python Types
```python
# packages/shared-types/python/tka_types.py
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from enum import Enum

class MotionType(Enum):
    PRO = "pro"
    ANTI = "anti"
    FLOAT = "float"
    DASH = "dash"
    STATIC = "static"

class RotationDirection(Enum):
    CLOCKWISE = "cw"
    COUNTER_CLOCKWISE = "ccw"
    NO_ROTATION = "no_rot"

class Location(Enum):
    NORTH = "n"
    EAST = "e" 
    SOUTH = "s"
    WEST = "w"
    NORTHEAST = "ne"
    SOUTHEAST = "se"
    SOUTHWEST = "sw"
    NORTHWEST = "nw"

@dataclass
class SharedSequenceType:
    """Shared sequence type definition for API consistency."""
    id: str
    name: str
    word: str
    beats: List[Dict[str, Any]]
    length: int
    total_duration: float
    start_position: Optional[str] = None
    metadata: Dict[str, Any] = None

@dataclass  
class SharedBeatType:
    """Shared beat type definition."""
    id: str
    beat_number: int
    letter: Optional[str]
    duration: float
    blue_motion: Optional[Dict[str, Any]] = None
    red_motion: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = None

# Export for code generation
__all__ = [
    "MotionType", "RotationDirection", "Location",
    "SharedSequenceType", "SharedBeatType"
]
```

```typescript
// packages/shared-types/typescript/tka-types.ts
export enum MotionType {
  PRO = "pro",
  ANTI = "anti", 
  FLOAT = "float",
  DASH = "dash",
  STATIC = "static"
}

export enum RotationDirection {
  CLOCKWISE = "cw",
  COUNTER_CLOCKWISE = "ccw", 
  NO_ROTATION = "no_rot"
}

export enum Location {
  NORTH = "n",
  EAST = "e",
  SOUTH = "s", 
  WEST = "w",
  NORTHEAST = "ne",
  SOUTHEAST = "se",
  SOUTHWEST = "sw",
  NORTHWEST = "nw"
}

export interface SharedSequenceType {
  id: string;
  name: string;
  word: string;
  beats: any[];
  length: number;
  total_duration: number;
  start_position?: string;
  metadata?: Record<string, any>;
}

export interface SharedBeatType {
  id: string;
  beat_number: number;
  letter?: string;
  duration: number;
  blue_motion?: any;
  red_motion?: any;
  metadata?: Record<string, any>;
}
```

#### 3.2 Shared Constants
```python
# packages/constants/python/api_constants.py
"""Shared API constants across desktop and web applications."""

API_BASE_URL = "http://localhost:8000"
API_TIMEOUT = 30

# Endpoints
ENDPOINTS = {
    "health": "/api/health",
    "sequences": "/api/sequences", 
    "settings": "/api/settings",
    "backgrounds": "/api/settings/backgrounds/available"
}

# Error messages
ERROR_MESSAGES = {
    "api_unavailable": "API server is not available",
    "sequence_not_found": "Sequence not found",
    "invalid_data": "Invalid data provided",
    "save_failed": "Failed to save sequence",
    "load_failed": "Failed to load sequence"
}

# Settings keys
SETTING_KEYS = {
    "background_type": "ui.background_type",
    "theme": "ui.theme",
    "window_geometry": "ui.window_geometry",
    "last_sequence": "app.last_sequence_id"
}
```

```typescript
// packages/constants/typescript/api-constants.ts
export const API_BASE_URL = "http://localhost:8000";
export const API_TIMEOUT = 30000;

export const ENDPOINTS = {
  health: "/api/health",
  sequences: "/api/sequences",
  settings: "/api/settings", 
  backgrounds: "/api/settings/backgrounds/available"
} as const;

export const ERROR_MESSAGES = {
  apiUnavailable: "API server is not available",
  sequenceNotFound: "Sequence not found", 
  invalidData: "Invalid data provided",
  saveFailed: "Failed to save sequence",
  loadFailed: "Failed to load sequence"
} as const;

export const SETTING_KEYS = {
  backgroundType: "ui.background_type",
  theme: "ui.theme",
  windowGeometry: "ui.window_geometry",
  lastSequence: "app.last_sequence_id"
} as const;
```

### Task 4: Development Scripts

#### 4.1 Main Development Script
```python
# scripts/dev.py
"""Unified development script for TKA monorepo."""
import subprocess
import sys
import os
import argparse
import threading
import time
from pathlib import Path

class TKADeveloper:
    def __init__(self):
        self.root = Path(__file__).parent.parent
        self.processes = []
    
    def start_desktop(self):
        """Start PyQt desktop application."""
        print("🖥️  Starting desktop application...")
        os.chdir(self.root / "apps" / "desktop" / "modern")
        process = subprocess.Popen([sys.executable, "main.py"])
        self.processes.append(process)
        return process
    
    def start_web(self):
        """Start SvelteKit web application."""
        print("🌐 Starting web application...")
        os.chdir(self.root / "apps" / "web")
        process = subprocess.Popen(["npm", "run", "dev"])
        self.processes.append(process)
        return process
    
    def start_api(self):
        """Start FastAPI server."""
        print("🚀 Starting API server...")
        os.chdir(self.root / "apps" / "desktop" / "modern")
        process = subprocess.Popen([sys.executable, "start_production_api.py"])
        self.processes.append(process)
        return process
    
    def start_fullstack(self):
        """Start API + Web for full-stack development."""
        print("🔄 Starting full-stack development environment...")
        
        # Start API server
        api_thread = threading.Thread(target=self.start_api)
        api_thread.daemon = True
        api_thread.start()
        
        # Wait for API to start
        time.sleep(3)
        
        # Start web app
        web_thread = threading.Thread(target=self.start_web)
        web_thread.daemon = True 
        web_thread.start()
        
        print("✅ Full-stack environment running!")
        print("   API: http://localhost:8000")
        print("   Web: http://localhost:5173")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.cleanup()
    
    def run_tests(self):
        """Run all tests."""
        print("🧪 Running all tests...")
        
        # Python tests
        os.chdir(self.root / "apps" / "desktop")
        result = subprocess.run([sys.executable, "-m", "pytest", "modern/tests/", "-v"])
        
        if result.returncode != 0:
            print("❌ Python tests failed")
            return False
        
        # Web tests
        os.chdir(self.root / "apps" / "web")
        result = subprocess.run(["npm", "test"])
        
        if result.returncode != 0:
            print("❌ Web tests failed")
            return False
        
        print("✅ All tests passed!")
        return True
    
    def build_all(self):
        """Build all applications."""
        print("🔨 Building all applications...")
        
        # Build web apps
        for app in ["web", "landing", "animator"]:
            print(f"Building {app}...")
            os.chdir(self.root / "apps" / app)
            result = subprocess.run(["npm", "run", "build"])
            if result.returncode != 0:
                print(f"❌ Failed to build {app}")
                return False
        
        # Build desktop
        print("Building desktop...")
        os.chdir(self.root / "apps" / "desktop")
        result = subprocess.run([sys.executable, "scripts/build.py"])
        if result.returncode != 0:
            print("❌ Failed to build desktop")
            return False
        
        print("✅ All applications built successfully!")
        return True
    
    def setup_environment(self):
        """Set up development environment."""
        print("⚙️  Setting up development environment...")
        
        # Install Python dependencies
        os.chdir(self.root / "apps" / "desktop")
        subprocess.run([sys.executable, "-m", "pip", "install", "-e", ".[dev]"])
        
        # Install Node dependencies for all web apps
        for app in ["web", "landing", "animator"]:
            print(f"Installing dependencies for {app}...")
            os.chdir(self.root / "apps" / app)
            subprocess.run(["npm", "install"])
        
        print("✅ Development environment setup complete!")
    
    def cleanup(self):
        """Clean up running processes."""
        print("🧹 Cleaning up processes...")
        for process in self.processes:
            if process.poll() is None:
                process.terminate()
        self.processes.clear()

def main():
    parser = argparse.ArgumentParser(description="TKA Development Helper")
    parser.add_argument("command", choices=[
        "desktop", "web", "api", "fullstack", "test", "build", "setup", "clean"
    ], help="Command to execute")
    
    args = parser.parse_args()
    dev = TKADeveloper()
    
    try:
        if args.command == "desktop":
            dev.start_desktop()
        elif args.command == "web":
            dev.start_web()
        elif args.command == "api":
            dev.start_api()
        elif args.command == "fullstack":
            dev.start_fullstack()
        elif args.command == "test":
            dev.run_tests()
        elif args.command == "build":
            dev.build_all()
        elif args.command == "setup":
            dev.setup_environment()
        elif args.command == "clean":
            dev.cleanup()
    except KeyboardInterrupt:
        dev.cleanup()
        print("\n👋 Development session ended")

if __name__ == "__main__":
    main()
```

### Task 5: CI/CD Pipeline

#### 5.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: TKA Monorepo CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: '3.9'
  NODE_VERSION: '18'

jobs:
  test-desktop:
    name: Test Desktop Application
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install Python dependencies
        run: |
          cd apps/desktop
          python -m pip install --upgrade pip
          pip install -e .[dev]
      
      - name: Run Python tests
        run: |
          cd apps/desktop
          python -m pytest modern/tests/ -v --cov=modern/src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/desktop/coverage.xml
          flags: desktop

  test-web:
    name: Test Web Applications
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [web, landing, animator]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: apps/${{ matrix.app }}/package-lock.json
      
      - name: Install dependencies
        run: |
          cd apps/${{ matrix.app }}
          npm ci
      
      - name: Run tests
        run: |
          cd apps/${{ matrix.app }}
          npm test
      
      - name: Run build
        run: |
          cd apps/${{ matrix.app }}
          npm run build

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [test-desktop, test-web]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install all dependencies
        run: |
          python scripts/setup.py
      
      - name: Run integration tests
        run: |
          python scripts/test_integration.py

  build-and-release:
    name: Build and Release
    runs-on: ubuntu-latest
    needs: [test-desktop, test-web, integration-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Build all applications
        run: |
          python scripts/dev.py build
      
      - name: Create release artifacts
        run: |
          python scripts/create_release.py
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: tka-release
          path: dist/
```

### Task 6: Documentation

#### 6.1 Comprehensive README
```markdown
# TKA Monorepo
# The Kinetic Constructor - Desktop and Web Applications

A professional monorepo containing desktop (PyQt) and web (SvelteKit) applications for kinetic sequence construction and animation.

## 🏗️ Architecture
```
TKA Monorepo
├── 🖥️  Desktop App (PyQt + FastAPI)
├── 🌐 Web App (SvelteKit + TypeScript)  
├── 🎨 Landing Page (SvelteKit)
├── 🎬 Animator Tool (SvelteKit)
└── 📦 Shared Packages (Types, Constants, Utils)
```
## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Setup
```bash
git clone <repository-url>
cd TKA
python scripts/dev.py setup
```
### Development
```bash
# Start desktop application
python scripts/dev.py desktop

# Start web application  
python scripts/dev.py web

# Start API server only
python scripts/dev.py api

# Start full-stack (API + Web)
python scripts/dev.py fullstack

# Run all tests
python scripts/dev.py test

# Build all applications
python scripts/dev.py build
```
## 📦 Applications

### Desktop Application (`apps/desktop/`)
PyQt6-based desktop application with modern architecture:
- **Modern**: Clean architecture with DI, services, events
- **Legacy**: Existing codebase (maintenance mode)
- **API**: FastAPI server for web integration

### Web Application (`apps/web/`)
SvelteKit web application providing browser-based access:
- Real-time synchronization with desktop
- Responsive design
- Progressive Web App features

### Landing Page (`apps/landing/`)
Marketing website built with SvelteKit

### Animator Tool (`apps/animator/`)
Specialized tool for pictograph animation

## 🔧 Development

### Commands
```bash
npm run dev:desktop     # Start desktop app
npm run dev:web         # Start web app
npm run dev:fullstack   # Start API + web
npm run test:all        # Run all tests
npm run build:all       # Build everything
npm run lint:all        # Lint all code
```
### VSCode Integration
- Install recommended extensions
- Use `Ctrl+Shift+P` → "Tasks: Run Task" for quick actions
- Configured for Python and TypeScript debugging

## 🧪 Testing
```bash
# Desktop tests
cd apps/desktop && python -m pytest modern/tests/

# Web tests  
cd apps/web && npm test

# Integration tests
python scripts/test_integration.py
```
## 🏗️ Building
```bash
# Build web applications
npm run build:web
npm run build:landing  
npm run build:animator

# Build desktop application
cd apps/desktop && python scripts/build.py

# Build everything
npm run build:all
```
## 📚 Documentation

- [API Documentation](docs/api.md)
- [Desktop Development](docs/desktop.md)
- [Web Development](docs/web.md)
- [Contributing](docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

[License information]
```

## Success Criteria

### Immediate Validation
1. **Workspace Setup**: VSCode recognizes Python/TypeScript across all apps
2. **Development Scripts**: `python scripts/dev.py fullstack` starts everything
3. **Shared Types**: Both desktop and web use consistent data models
4. **CI/CD**: GitHub Actions runs tests for all applications
5. **Documentation**: Clear setup and development instructions

### Long-term Benefits
1. **Unified Development**: Single repository, single clone, single setup
2. **Shared Resources**: No duplication of types, constants, or assets
3. **Coordinated Releases**: Desktop v1.2 + Web v1.2 ship together
4. **Professional Structure**: Enterprise-grade monorepo organization
5. **Developer Experience**: Fast setup, clear commands, excellent tooling

## Implementation Order

1. **Run restructure script** to organize directories
2. **Set up workspace configuration** for VSCode
3. **Implement shared packages** for types and constants  
4. **Configure development scripts** for unified workflow
5. **Set up CI/CD pipeline** for automated testing
6. **Update documentation** for new structure
7. **Test everything** to ensure it works end-to-end

Execute this transformation and you'll have a professional, enterprise-grade monorepo that supports rapid development of both desktop and web applications while maintaining consistency and reducing duplication.# TKA Monorepo Professional Setup - Complete Implementation Guide

## Project Context

You are transforming the TKA (The Kinetic Constructor) project from a multi-directory structure into a professional monorepo that houses both desktop (PyQt) and web (SvelteKit) applications sharing a unified backend API. The workspace root is `F:\CODE\TKA` and should become a single, cohesive development environment.

## Current State Analysis

```
F:\CODE\TKA\
├── .pytest_cache/
├── data/                 # Shared data files
├── images/               # Shared assets
├── tka-desktop/          # PyQt desktop app with modern/legacy structure
│   ├── legacy/           # Legacy PyQt code (keep static)
│   ├── modern/           # Modern architecture with DI, services, API
│   └── launcher/         # App launcher
└── tka-web/              # Web applications
    ├── tka-web-app/      # Main SvelteKit application
    ├── tka-landing-page/ # Marketing site
    └── pictograph-animator/ # Animation tool
```

## Target Professional Monorepo Structure

Transform the current structure into this enterprise-grade monorepo:

```
F:\CODE\TKA\                          # Single Git repository
├── .vscode/                          # Workspace configuration
│   ├── settings.json                 # Unified IDE settings
│   ├── tasks.json                    # Development tasks
│   └── extensions.json               # Recommended extensions
├── .github/                          # CI/CD and automation
│   ├── workflows/                    # GitHub Actions
│   └── ISSUE_TEMPLATE/               # Issue templates
├── apps/                             # Application packages
│   ├── desktop/                      # PyQt desktop application
│   ├── web/                          # Main SvelteKit web app
│   ├── landing/                      # Marketing website
│   └── animator/                     # Pictograph animator tool
├── packages/                         # Shared packages
│   ├── shared-types/                 # TypeScript/Python type definitions
│   ├── constants/                    # Shared constants and enums
│   ├── utils/                        # Shared utility functions
│   └── assets/                       # Shared assets and icons
├── data/                             # Shared data files
├── docs/                             # Documentation
├── scripts/                          # Development and build scripts
├── tests/                            # Integration and E2E tests
├── package.json                      # Workspace package management
├── pyproject.toml                    # Python workspace configuration
├── README.md                         # Comprehensive project documentation
└── .gitignore                        # Unified ignore patterns
```

## Implementation Tasks

### Task 1: Workspace Configuration

#### 1.1 VSCode Workspace Setup
```json
// .vscode/settings.json
{
  "python.defaultInterpreterPath": "./apps/desktop/venv/bin/python",
  "python.analysis.extraPaths": [
    "./apps/desktop/modern/src",
    "./apps/desktop/legacy/src",
    "./packages/shared-types/python"
  ],
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "eslint.workingDirectories": [
    "./apps/web",
    "./apps/landing", 
    "./apps/animator"
  ],
  "files.exclude": {
    "**/__pycache__": true,
    "**/node_modules": true,
    "**/.pytest_cache": true,
    "**/.svelte-kit": true,
    "**/dist": true,
    "**/build": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/__pycache__": true,
    "**/venv": true
  },
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["./apps/desktop/modern/tests"],
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

#### 1.2 Development Tasks
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Desktop App",
      "type": "shell",
      "command": "python",
      "args": ["main.py"],
      "options": {
        "cwd": "${workspaceFolder}/apps/desktop/modern"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Start Web App",
      "type": "shell", 
      "command": "npm",
      "args": ["run", "dev"],
      "options": {
        "cwd": "${workspaceFolder}/apps/web"
      },
      "group": "build"
    },
    {
      "label": "Start API Server",
      "type": "shell",
      "command": "python", 
      "args": ["start_production_api.py"],
      "options": {
        "cwd": "${workspaceFolder}/apps/desktop/modern"
      },
      "group": "build"
    },
    {
      "label": "Run All Tests",
      "type": "shell",
      "command": "python",
      "args": ["-m", "pytest", "apps/desktop/modern/tests/", "-v"],
      "group": "test"
    },
    {
      "label": "Full Stack Development",
      "dependsOrder": "parallel",
      "dependsOn": ["Start API Server", "Start Web App"],
      "group": "build"
    }
  ]
}
```

#### 1.3 Recommended Extensions
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "ms-python.isort",
    "ms-python.pylint",
    "svelte.svelte-vscode",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.test-adapter-converter"
  ]
}
```

### Task 2: Repository Structure Migration

#### 2.1 Directory Restructuring Script
```python
# scripts/restructure_monorepo.py
import os
import shutil
from pathlib import Path

def restructure_to_monorepo():
    """Restructure current directory layout to professional monorepo."""
    
    root = Path(".")
    
    # Create new directory structure
    directories = [
        "apps", "packages", "docs", "scripts", "tests",
        "packages/shared-types", "packages/constants", 
        "packages/utils", "packages/assets"
    ]
    
    for dir_path in directories:
        os.makedirs(dir_path, exist_ok=True)
        print(f"✅ Created directory: {dir_path}")
    
    # Move existing directories
    moves = [
        ("tka-desktop", "apps/desktop"),
        ("tka-web/tka-web-app", "apps/web"),
        ("tka-web/tka-landing-page", "apps/landing"),
        ("tka-web/pictograph-animator", "apps/animator"),
        ("images", "packages/assets/images")
    ]
    
    for src, dst in moves:
        if os.path.exists(src):
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.move(src, dst)
            print(f"✅ Moved {src} → {dst}")
    
    # Clean up empty directories
    cleanup_dirs = ["tka-web"]
    for dir_path in cleanup_dirs:
        if os.path.exists(dir_path) and not os.listdir(dir_path):
            os.rmdir(dir_path)
            print(f"🗑️  Removed empty directory: {dir_path}")
    
    print("\n🎉 Monorepo restructuring complete!")

if __name__ == "__main__":
    restructure_to_monorepo()
```

#### 2.2 Workspace Package Configuration
```json
// package.json - Root workspace configuration
{
  "name": "tka-monorepo",
  "version": "1.0.0",
  "description": "The Kinetic Constructor - Desktop and Web Applications",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev:desktop": "cd apps/desktop/modern && python main.py",
    "dev:web": "cd apps/web && npm run dev",
    "dev:landing": "cd apps/landing && npm run dev", 
    "dev:animator": "cd apps/animator && npm run dev",
    "dev:api": "cd apps/desktop/modern && python start_production_api.py",
    "dev:fullstack": "concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "build:web": "cd apps/web && npm run build",
    "build:landing": "cd apps/landing && npm run build",
    "build:animator": "cd apps/animator && npm run build",
    "build:desktop": "cd apps/desktop && python scripts/build.py",
    "build:all": "npm run build:web && npm run build:landing && npm run build:animator && npm run build:desktop",
    "test:desktop": "cd apps/desktop && python -m pytest modern/tests/ -v",
    "test:web": "cd apps/web && npm test",
    "test:integration": "python scripts/test_integration.py",
    "test:all": "npm run test:desktop && npm run test:web && npm run test:integration",
    "lint:python": "cd apps/desktop && black . && isort . && pylint modern/src/",
    "lint:js": "cd apps/web && npm run lint && cd ../landing && npm run lint && cd ../animator && npm run lint",
    "lint:all": "npm run lint:python && npm run lint:js",
    "clean": "python scripts/clean.py",
    "setup": "python scripts/setup.py",
    "docs:serve": "cd docs && python -m http.server 8080"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "cross-env": "^7.0.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "python": ">=3.9.0"
  }
}
```

#### 2.3 Python Workspace Configuration
```toml
# pyproject.toml - Python workspace configuration
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "tka-monorepo"
version = "1.0.0"
description = "The Kinetic Constructor - Python components"
authors = [
    {name = "TKA Team", email = "team@tka.dev"}
]
dependencies = [
    "PyQt6>=6.4.0",
    "fastapi>=0.100.0",
    "uvicorn>=0.23.0",
    "requests>=2.31.0",
    "pydantic>=2.0.0",
    "sqlalchemy>=2.0.0"
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "black>=23.0.0", 
    "isort>=5.12.0",
    "pylint>=2.17.0",
    "mypy>=1.5.0",
    "pytest-cov>=4.1.0",
    "pytest-asyncio>=0.21.0"
]

[tool.black]
line-length = 88
target-version = ['py39']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.venv
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88

[tool.pylint.messages_control]
disable = "C0330, C0326"

[tool.pytest.ini_options]
testpaths = ["apps/desktop/modern/tests", "tests"]
python_files = "test_*.py"
python_classes = "Test*"
python_functions = "test_*"
addopts = "-v --tb=short"
```

### Task 3: Shared Packages Implementation

#### 3.1 Shared TypeScript/Python Types
```python
# packages/shared-types/python/tka_types.py
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from enum import Enum

class MotionType(Enum):
    PRO = "pro"
    ANTI = "anti"
    FLOAT = "float"
    DASH = "dash"
    STATIC = "static"

class RotationDirection(Enum):
    CLOCKWISE = "cw"
    COUNTER_CLOCKWISE = "ccw"
    NO_ROTATION = "no_rot"

class Location(Enum):
    NORTH = "n"
    EAST = "e" 
    SOUTH = "s"
    WEST = "w"
    NORTHEAST = "ne"
    SOUTHEAST = "se"
    SOUTHWEST = "sw"
    NORTHWEST = "nw"

@dataclass
class SharedSequenceType:
    """Shared sequence type definition for API consistency."""
    id: str
    name: str
    word: str
    beats: List[Dict[str, Any]]
    length: int
    total_duration: float
    start_position: Optional[str] = None
    metadata: Dict[str, Any] = None

@dataclass  
class SharedBeatType:
    """Shared beat type definition."""
    id: str
    beat_number: int
    letter: Optional[str]
    duration: float
    blue_motion: Optional[Dict[str, Any]] = None
    red_motion: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = None

# Export for code generation
__all__ = [
    "MotionType", "RotationDirection", "Location",
    "SharedSequenceType", "SharedBeatType"
]
```

```typescript
// packages/shared-types/typescript/tka-types.ts
export enum MotionType {
  PRO = "pro",
  ANTI = "anti", 
  FLOAT = "float",
  DASH = "dash",
  STATIC = "static"
}

export enum RotationDirection {
  CLOCKWISE = "cw",
  COUNTER_CLOCKWISE = "ccw", 
  NO_ROTATION = "no_rot"
}

export enum Location {
  NORTH = "n",
  EAST = "e",
  SOUTH = "s", 
  WEST = "w",
  NORTHEAST = "ne",
  SOUTHEAST = "se",
  SOUTHWEST = "sw",
  NORTHWEST = "nw"
}

export interface SharedSequenceType {
  id: string;
  name: string;
  word: string;
  beats: any[];
  length: number;
  total_duration: number;
  start_position?: string;
  metadata?: Record<string, any>;
}

export interface SharedBeatType {
  id: string;
  beat_number: number;
  letter?: string;
  duration: number;
  blue_motion?: any;
  red_motion?: any;
  metadata?: Record<string, any>;
}
```

#### 3.2 Shared Constants
```python
# packages/constants/python/api_constants.py
"""Shared API constants across desktop and web applications."""

API_BASE_URL = "http://localhost:8000"
API_TIMEOUT = 30

# Endpoints
ENDPOINTS = {
    "health": "/api/health",
    "sequences": "/api/sequences", 
    "settings": "/api/settings",
    "backgrounds": "/api/settings/backgrounds/available"
}

# Error messages
ERROR_MESSAGES = {
    "api_unavailable": "API server is not available",
    "sequence_not_found": "Sequence not found",
    "invalid_data": "Invalid data provided",
    "save_failed": "Failed to save sequence",
    "load_failed": "Failed to load sequence"
}

# Settings keys
SETTING_KEYS = {
    "background_type": "ui.background_type",
    "theme": "ui.theme",
    "window_geometry": "ui.window_geometry",
    "last_sequence": "app.last_sequence_id"
}
```

```typescript
// packages/constants/typescript/api-constants.ts
export const API_BASE_URL = "http://localhost:8000";
export const API_TIMEOUT = 30000;

export const ENDPOINTS = {
  health: "/api/health",
  sequences: "/api/sequences",
  settings: "/api/settings", 
  backgrounds: "/api/settings/backgrounds/available"
} as const;

export const ERROR_MESSAGES = {
  apiUnavailable: "API server is not available",
  sequenceNotFound: "Sequence not found", 
  invalidData: "Invalid data provided",
  saveFailed: "Failed to save sequence",
  loadFailed: "Failed to load sequence"
} as const;

export const SETTING_KEYS = {
  backgroundType: "ui.background_type",
  theme: "ui.theme",
  windowGeometry: "ui.window_geometry",
  lastSequence: "app.last_sequence_id"
} as const;
```

### Task 4: Development Scripts

#### 4.1 Main Development Script
```python
# scripts/dev.py
"""Unified development script for TKA monorepo."""
import subprocess
import sys
import os
import argparse
import threading
import time
from pathlib import Path

class TKADeveloper:
    def __init__(self):
        self.root = Path(__file__).parent.parent
        self.processes = []
    
    def start_desktop(self):
        """Start PyQt desktop application."""
        print("🖥️  Starting desktop application...")
        os.chdir(self.root / "apps" / "desktop" / "modern")
        process = subprocess.Popen([sys.executable, "main.py"])
        self.processes.append(process)
        return process
    
    def start_web(self):
        """Start SvelteKit web application."""
        print("🌐 Starting web application...")
        os.chdir(self.root / "apps" / "web")
        process = subprocess.Popen(["npm", "run", "dev"])
        self.processes.append(process)
        return process
    
    def start_api(self):
        """Start FastAPI server."""
        print("🚀 Starting API server...")
        os.chdir(self.root / "apps" / "desktop" / "modern")
        process = subprocess.Popen([sys.executable, "start_production_api.py"])
        self.processes.append(process)
        return process
    
    def start_fullstack(self):
        """Start API + Web for full-stack development."""
        print("🔄 Starting full-stack development environment...")
        
        # Start API server
        api_thread = threading.Thread(target=self.start_api)
        api_thread.daemon = True
        api_thread.start()
        
        # Wait for API to start
        time.sleep(3)
        
        # Start web app
        web_thread = threading.Thread(target=self.start_web)
        web_thread.daemon = True 
        web_thread.start()
        
        print("✅ Full-stack environment running!")
        print("   API: http://localhost:8000")
        print("   Web: http://localhost:5173")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.cleanup()
    
    def run_tests(self):
        """Run all tests."""
        print("🧪 Running all tests...")
        
        # Python tests
        os.chdir(self.root / "apps" / "desktop")
        result = subprocess.run([sys.executable, "-m", "pytest", "modern/tests/", "-v"])
        
        if result.returncode != 0:
            print("❌ Python tests failed")
            return False
        
        # Web tests
        os.chdir(self.root / "apps" / "web")
        result = subprocess.run(["npm", "test"])
        
        if result.returncode != 0:
            print("❌ Web tests failed")
            return False
        
        print("✅ All tests passed!")
        return True
    
    def build_all(self):
        """Build all applications."""
        print("🔨 Building all applications...")
        
        # Build web apps
        for app in ["web", "landing", "animator"]:
            print(f"Building {app}...")
            os.chdir(self.root / "apps" / app)
            result = subprocess.run(["npm", "run", "build"])
            if result.returncode != 0:
                print(f"❌ Failed to build {app}")
                return False
        
        # Build desktop
        print("Building desktop...")
        os.chdir(self.root / "apps" / "desktop")
        result = subprocess.run([sys.executable, "scripts/build.py"])
        if result.returncode != 0:
            print("❌ Failed to build desktop")
            return False
        
        print("✅ All applications built successfully!")
        return True
    
    def setup_environment(self):
        """Set up development environment."""
        print("⚙️  Setting up development environment...")
        
        # Install Python dependencies
        os.chdir(self.root / "apps" / "desktop")
        subprocess.run([sys.executable, "-m", "pip", "install", "-e", ".[dev]"])
        
        # Install Node dependencies for all web apps
        for app in ["web", "landing", "animator"]:
            print(f"Installing dependencies for {app}...")
            os.chdir(self.root / "apps" / app)
            subprocess.run(["npm", "install"])
        
        print("✅ Development environment setup complete!")
    
    def cleanup(self):
        """Clean up running processes."""
        print("🧹 Cleaning up processes...")
        for process in self.processes:
            if process.poll() is None:
                process.terminate()
        self.processes.clear()

def main():
    parser = argparse.ArgumentParser(description="TKA Development Helper")
    parser.add_argument("command", choices=[
        "desktop", "web", "api", "fullstack", "test", "build", "setup", "clean"
    ], help="Command to execute")
    
    args = parser.parse_args()
    dev = TKADeveloper()
    
    try:
        if args.command == "desktop":
            dev.start_desktop()
        elif args.command == "web":
            dev.start_web()
        elif args.command == "api":
            dev.start_api()
        elif args.command == "fullstack":
            dev.start_fullstack()
        elif args.command == "test":
            dev.run_tests()
        elif args.command == "build":
            dev.build_all()
        elif args.command == "setup":
            dev.setup_environment()
        elif args.command == "clean":
            dev.cleanup()
    except KeyboardInterrupt:
        dev.cleanup()
        print("\n👋 Development session ended")

if __name__ == "__main__":
    main()
```

### Task 5: CI/CD Pipeline

#### 5.1 GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: TKA Monorepo CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: '3.9'
  NODE_VERSION: '18'

jobs:
  test-desktop:
    name: Test Desktop Application
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install Python dependencies
        run: |
          cd apps/desktop
          python -m pip install --upgrade pip
          pip install -e .[dev]
      
      - name: Run Python tests
        run: |
          cd apps/desktop
          python -m pytest modern/tests/ -v --cov=modern/src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./apps/desktop/coverage.xml
          flags: desktop

  test-web:
    name: Test Web Applications
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [web, landing, animator]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: apps/${{ matrix.app }}/package-lock.json
      
      - name: Install dependencies
        run: |
          cd apps/${{ matrix.app }}
          npm ci
      
      - name: Run tests
        run: |
          cd apps/${{ matrix.app }}
          npm test
      
      - name: Run build
        run: |
          cd apps/${{ matrix.app }}
          npm run build

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: [test-desktop, test-web]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install all dependencies
        run: |
          python scripts/setup.py
      
      - name: Run integration tests
        run: |
          python scripts/test_integration.py

  build-and-release:
    name: Build and Release
    runs-on: ubuntu-latest
    needs: [test-desktop, test-web, integration-tests]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Build all applications
        run: |
          python scripts/dev.py build
      
      - name: Create release artifacts
        run: |
          python scripts/create_release.py
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: tka-release
          path: dist/
```

### Task 6: Documentation

#### 6.1 Comprehensive README
```markdown
# TKA Monorepo
# The Kinetic Constructor - Desktop and Web Applications

A professional monorepo containing desktop (PyQt) and web (SvelteKit) applications for kinetic sequence construction and animation.

## 🏗️ Architecture

```
TKA Monorepo
├── 🖥️  Desktop App (PyQt + FastAPI)
├── 🌐 Web App (SvelteKit + TypeScript)  
├── 🎨 Landing Page (SvelteKit)
├── 🎬 Animator Tool (SvelteKit)
└── 📦 Shared Packages (Types, Constants, Utils)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Setup
```bash
git clone <repository-url>
cd TKA
python scripts/dev.py setup
```

### Development
```bash
# Start desktop application
python scripts/dev.py desktop

# Start web application  
python scripts/dev.py web

# Start API server only
python scripts/dev.py api

# Start full-stack (API + Web)
python scripts/dev.py fullstack

# Run all tests
python scripts/dev.py test

# Build all applications
python scripts/dev.py build
```

## 📦 Applications

### Desktop Application (`apps/desktop/`)
PyQt6-based desktop application with modern architecture:
- **Modern**: Clean architecture with DI, services, events
- **Legacy**: Existing codebase (maintenance mode)
- **API**: FastAPI server for web integration

### Web Application (`apps/web/`)
SvelteKit web application providing browser-based access:
- Real-time synchronization with desktop
- Responsive design
- Progressive Web App features

### Landing Page (`apps/landing/`)
Marketing website built with SvelteKit

### Animator Tool (`apps/animator/`)
Specialized tool for pictograph animation

## 🔧 Development

### Commands
```bash
npm run dev:desktop     # Start desktop app
npm run dev:web         # Start web app
npm run dev:fullstack   # Start API + web
npm run test:all        # Run all tests
npm run build:all       # Build everything
npm run lint:all        # Lint all code
```

### VSCode Integration
- Install recommended extensions
- Use `Ctrl+Shift+P` → "Tasks: Run Task" for quick actions
- Configured for Python and TypeScript debugging

## 🧪 Testing

```bash
# Desktop tests
cd apps/desktop && python -m pytest modern/tests/

# Web tests  
cd apps/web && npm test

# Integration tests
python scripts/test_integration.py
```

## 🏗️ Building

```bash
# Build web applications
npm run build:web
npm run build:landing  
npm run build:animator

# Build desktop application
cd apps/desktop && python scripts/build.py

# Build everything
npm run build:all
```

## 📚 Documentation

- [API Documentation](docs/api.md)
- [Desktop Development](docs/desktop.md)
- [Web Development](docs/web.md)
- [Contributing](docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

[License information]
```

## Success Criteria

### Immediate Validation
1. **Workspace Setup**: VSCode recognizes Python/TypeScript across all apps
2. **Development Scripts**: `python scripts/dev.py fullstack` starts everything
3. **Shared Types**: Both desktop and web use consistent data models
4. **CI/CD**: GitHub Actions runs tests for all applications
5. **Documentation**: Clear setup and development instructions

### Long-term Benefits
1. **Unified Development**: Single repository, single clone, single setup
2. **Shared Resources**: No duplication of types, constants, or assets
3. **Coordinated Releases**: Desktop v1.2 + Web v1.2 ship together
4. **Professional Structure**: Enterprise-grade monorepo organization
5. **Developer Experience**: Fast setup, clear commands, excellent tooling

## Implementation Order

1. **Run restructure script** to organize directories
2. **Set up workspace configuration** for VSCode
3. **Implement shared packages** for types and constants  
4. **Configure development scripts** for unified workflow
5. **Set up CI/CD pipeline** for automated testing
6. **Update documentation** for new structure
7. **Test everything** to ensure it works end-to-end

Execute this transformation and you'll have a professional, enterprise-grade monorepo that supports rapid development of both desktop and web applications while maintaining consistency and reducing duplication.