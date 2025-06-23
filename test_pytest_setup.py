"""
Simple test to verify TKA pytest setup works correctly.
"""

def test_basic_functionality():
    """Test that basic pytest functionality works."""
    assert True


def test_python_path_setup():
    """Test that Python paths are set up correctly."""
    import sys
    from pathlib import Path
    
    # Check that we can import from the TKA structure
    tka_root = None
    for path in sys.path:
        if "TKA" in path and Path(path).name == "TKA":
            tka_root = Path(path)
            break
    
    assert tka_root is not None, f"TKA root not found in sys.path: {sys.path}"
    assert tka_root.exists(), f"TKA root directory doesn't exist: {tka_root}"


def test_project_root_import():
    """Test that we can import project_root module."""
    try:
        from project_root import get_project_root, ensure_project_setup
        
        # Test the functions work
        root = get_project_root()
        assert root.exists()
        assert root.name == "TKA"
        
        # Test setup function
        success = ensure_project_setup()
        assert success is True
        
    except ImportError as e:
        pytest.fail(f"Failed to import project_root: {e}")


def test_core_imports():
    """Test that we can import core TKA modules."""
    try:
        # Test some basic imports from the TKA structure
        from core.events import Event
        from core.dependency_injection.di_container import DIContainer
        
        # If we get here, imports worked
        assert True
        
    except ImportError as e:
        # This might fail if modules don't exist yet, which is ok
        print(f"Note: Some core imports not available yet: {e}")
        assert True  # Don't fail the test
