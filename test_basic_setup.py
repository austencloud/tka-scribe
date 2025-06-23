"""
Basic TKA Test - Verify pytest setup works
"""

def test_basic():
    """Most basic test possible."""
    assert True

def test_python_imports():
    """Test that basic Python works."""
    import sys
    import os
    from pathlib import Path
    assert len(sys.path) > 0

def test_tka_structure():
    """Test that we can access TKA structure."""
    from pathlib import Path
    
    # We should be able to find key directories
    current = Path(__file__).parent
    tka_root = current
    
    # Check for expected structure
    expected_dirs = [
        "src",
        "src/desktop", 
        "src/desktop/modern",
        "src/desktop/modern/src"
    ]
    
    for dir_path in expected_dirs:
        full_path = tka_root / dir_path
        assert full_path.exists(), f"Expected directory not found: {full_path}"

def test_project_root_basic():
    """Test project_root import if possible."""
    try:
        from project_root import get_project_root
        root = get_project_root()
        assert root.exists()
        assert root.name == "TKA"
    except ImportError:
        # If import fails, that's ok for now
        assert True

if __name__ == "__main__":
    # Can be run directly too
    import pytest
    pytest.main([__file__, "-v"])
