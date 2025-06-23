"""
TKA Desktop Global Pytest Configuration
=======================================

This file ensures that pytest works seamlessly from any directory and with any
execution method. It automatically sets up the TKA Desktop import environment
before any tests run.
"""

import pytest
import sys
from pathlib import Path

# Add the TKA monorepo root to the path so we can import project_root
tka_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(tka_root))

# Import our universal project setup
try:
    from project_root import ensure_project_setup

    ensure_project_setup()
    SETUP_SUCCESS = True
except Exception as e:
    SETUP_SUCCESS = False
    SETUP_ERROR = str(e)


def pytest_configure(config):
    """Configure pytest with TKA Desktop setup."""
    if not SETUP_SUCCESS:
        pytest.exit(
            f"TKA Desktop test setup failed: {SETUP_ERROR}\n"
            f"Make sure you're running pytest from within the TKA Desktop project.",
            returncode=1,
        )

    # Register custom markers
    config.addinivalue_line("markers", "modern: Tests for the modern codebase")
    config.addinivalue_line("markers", "unit: Fast unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")


def pytest_sessionstart(session):
    """Called after the Session object has been created."""
    if session.config.option.verbose >= 1:
        print("\n🚀 TKA Desktop test environment initialized successfully!")


@pytest.fixture(scope="session")
def tka_project_root():
    """Provide the TKA Desktop project root path."""
    from project_root import get_project_root

    return get_project_root()
