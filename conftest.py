"""
TKA Monorepo Global Pytest Configuration
========================================

This file ensures that pytest works seamlessly from any directory and with any
execution method. It automatically sets up the TKA monorepo import environment
before any tests run.
"""

import pytest

# Import our universal project setup
try:
    from project_root import ensure_project_setup

    ensure_project_setup()
    SETUP_SUCCESS = True
except Exception as e:
    SETUP_SUCCESS = False
    SETUP_ERROR = str(e)


def pytest_configure(config):
    """Configure pytest with TKA Monorepo setup."""
    if not SETUP_SUCCESS:
        pytest.exit(
            f"TKA Monorepo test setup failed: {SETUP_ERROR}\n"
            f"Make sure you're running pytest from within the TKA Monorepo.",
            returncode=1,
        )

    # Register custom markers
    config.addinivalue_line("markers", "modern: Tests for the modern codebase")
    config.addinivalue_line("markers", "unit: Fast unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")


def pytest_sessionstart(session):
    """Called after the Session object has been created."""
    if session.config.option.verbose >= 1:
        print("\n🚀 TKA Monorepo test environment initialized successfully!")


@pytest.fixture(scope="session")
def tka_project_root():
    """Provide the TKA Monorepo project root path."""
    from project_root import get_project_root

    return get_project_root()


@pytest.fixture(scope="session")
def tka_desktop_root():
    """Provide the TKA Desktop project root path."""
    from project_root import get_tka_desktop_root

    return get_tka_desktop_root()
