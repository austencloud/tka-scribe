"""
TKA Monorepo Global Pytest Configuration
========================================

This is the ONLY conftest.py file for the entire TKA monorepo.
It ensures that pytest works seamlessly when you just type 'pytest'.
It automatically sets up the TKA monorepo import environment before any tests run.
"""

import sys
import os
from pathlib import Path
import pytest

def setup_tka_environment():
    """Set up TKA environment before any imports."""
    # Find TKA root (this conftest.py should be in TKA root)
    tka_root = Path(__file__).parent.absolute()
    
    # Essential paths for TKA monorepo - comprehensive list
    essential_paths = [
        str(tka_root),  # TKA root
        str(tka_root / 'src'),  # src
        str(tka_root / 'src' / 'desktop' / 'modern' / 'src'),  # modern src
        str(tka_root / 'src' / 'desktop' / 'modern'),  # modern root
        str(tka_root / 'src' / 'desktop' / 'modern' / 'tests'),  # modern tests
        str(tka_root / 'src' / 'desktop' / 'legacy' / 'src'),  # legacy src
        str(tka_root / 'src' / 'desktop' / 'legacy'),  # legacy root
        str(tka_root / 'src' / 'desktop' / 'legacy' / 'tests'),  # legacy tests
        str(tka_root / 'src' / 'desktop'),  # desktop root
        str(tka_root / 'launcher'),  # launcher
        str(tka_root / 'launcher' / 'tests'),  # launcher tests
        str(tka_root / 'packages'),  # packages
    ]
    
    # Add to sys.path (avoid duplicates)
    for path in essential_paths:
        if path not in sys.path:
            sys.path.insert(0, path)
    
    # Set PYTHONPATH environment variable
    current_pythonpath = os.environ.get('PYTHONPATH', '')
    if current_pythonpath:
        all_paths = essential_paths + [current_pythonpath]
    else:
        all_paths = essential_paths
    os.environ['PYTHONPATH'] = os.pathsep.join(all_paths)
    
    print(f"🔧 TKA environment setup complete. Added {len(essential_paths)} paths.")

# Set up environment IMMEDIATELY when this file is imported
setup_tka_environment()

# Now try to set up project_root
SETUP_SUCCESS = False
SETUP_ERROR = None

try:
    from project_root import ensure_project_setup
    ensure_project_setup()
    SETUP_SUCCESS = True
    print("✅ Project root setup successful")
except Exception as e:
    SETUP_ERROR = str(e)
    print(f"⚠️  Project root setup warning: {e}")

def pytest_configure(config):
    """Configure pytest - this runs when pytest starts."""
    if not SETUP_SUCCESS:
        print(f"⚠️  Warning: TKA setup issue: {SETUP_ERROR}")
        print("Continuing with basic path setup...")

    # Register comprehensive markers
    markers = [
        "unit: Unit tests (fast, isolated)",
        "integration: Integration tests", 
        "specification: Specification tests",
        "regression: Regression tests",
        "modern: Modern codebase tests",
        "legacy: Legacy codebase tests",
        "launcher: Launcher tests",
        "slow: Tests that take >5 seconds",
        "broken: Tests with known issues",
        "skip_if_no_pyqt6: Skip if PyQt6 not available",
        "scaffolding: Temporary development tests",
        "critical: Critical tests that must always pass",
        "delete_after: Tests scheduled for deletion",
        "expired: Tests past their deletion date", 
        "review: Tests needing lifecycle review",
        "debug: Debug scaffolding tests",
        "exploration: Exploration scaffolding tests",
        "spike: Spike/proof-of-concept tests",
        "parity: Legacy functionality equivalence tests",
        "performance: Performance-related tests",
        "ui: User interface tests (with pytest-qt)",
        "imports: Import validation tests",
        "desktop: Desktop application tests",
        "web: Web application tests",
    ]
    
    for marker in markers:
        config.addinivalue_line("markers", marker)

def pytest_sessionstart(session):
    """Called when pytest session starts."""
    print("\n🚀 TKA Monorepo test environment initialized")
    if session.config.option.verbose >= 1:
        print("🔍 Test discovery and execution starting...")

def pytest_collection_modifyitems(config, items):
    """Modify collected test items to handle various scenarios."""
    print(f"📊 Collected {len(items)} test items")
    
    # Check PyQt6 availability
    try:
        import PyQt6
        pyqt6_available = True
        print("✅ PyQt6 available")
    except ImportError:
        pyqt6_available = False
        print("⚠️  PyQt6 not available - will skip launcher tests")
    
    # Counters for statistics
    skipped_count = 0
    marked_count = 0
    
    # Process each collected test item
    for item in items:
        file_path = str(item.fspath)
        
        # Skip tests that require PyQt6 if it's not available
        if not pyqt6_available and ("launcher" in file_path.lower() or "pyqt" in file_path.lower()):
            skip_pyqt6 = pytest.mark.skip(reason="PyQt6 not available")
            item.add_marker(skip_pyqt6)
            skipped_count += 1
        
        # Mark tests by location for easier filtering
        if "legacy" in file_path:
            item.add_marker(pytest.mark.legacy)
            marked_count += 1
        elif "modern" in file_path:
            item.add_marker(pytest.mark.modern)
            marked_count += 1
        elif "launcher" in file_path:
            item.add_marker(pytest.mark.launcher)
            marked_count += 1
        
        # Mark by test type
        if "unit" in file_path:
            item.add_marker(pytest.mark.unit)
        elif "integration" in file_path:
            item.add_marker(pytest.mark.integration)
        elif "specification" in file_path:
            item.add_marker(pytest.mark.specification)
        elif "regression" in file_path:
            item.add_marker(pytest.mark.regression)
        elif "performance" in file_path:
            item.add_marker(pytest.mark.performance)
    
    if skipped_count > 0:
        print(f"⏭️  Will skip {skipped_count} tests (missing dependencies)")
    
    print(f"🏷️  Applied markers to {marked_count} tests")

def pytest_runtest_setup(item):
    """Called before each test runs."""
    # Skip broken tests gracefully
    if hasattr(item, 'get_closest_marker'):
        broken_marker = item.get_closest_marker("broken")
        if broken_marker:
            pytest.skip("Test marked as broken")

# Comprehensive fixtures for all parts of TKA
@pytest.fixture(scope="session")
def tka_root():
    """TKA root directory."""
    return Path(__file__).parent

@pytest.fixture(scope="session")
def modern_src_path():
    """Modern src path."""
    return Path(__file__).parent / "src" / "desktop" / "modern" / "src"

@pytest.fixture(scope="session") 
def modern_root_path():
    """Modern root path."""
    return Path(__file__).parent / "src" / "desktop" / "modern"

@pytest.fixture(scope="session")
def legacy_src_path():
    """Legacy src path."""
    return Path(__file__).parent / "src" / "desktop" / "legacy" / "src"

@pytest.fixture(scope="session") 
def legacy_root_path():
    """Legacy root path."""
    return Path(__file__).parent / "src" / "desktop" / "legacy"

@pytest.fixture(scope="session")
def launcher_root_path():
    """Launcher root path."""
    return Path(__file__).parent / "launcher"

@pytest.fixture
def mock_container():
    """Mock DI container."""
    from unittest.mock import Mock
    container = Mock()
    container.resolve = Mock()
    return container

@pytest.fixture
def mock_beat_data():
    """Mock beat data for testing."""
    try:
        from domain.models.core_models import BeatData
        return BeatData.empty()
    except ImportError:
        # Fallback mock
        from unittest.mock import Mock
        return Mock()

# Skip PyQt6 tests automatically if not available
@pytest.fixture(autouse=True)
def skip_if_no_pyqt6(request):
    """Skip tests if PyQt6 is not available and test needs it."""
    if request.node.get_closest_marker("skip_if_no_pyqt6"):
        try:
            import PyQt6
        except ImportError:
            pytest.skip("PyQt6 not available")
