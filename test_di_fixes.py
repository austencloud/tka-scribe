#!/usr/bin/env python3
"""
Quick test to verify DI container fixes work.
"""

import sys
from pathlib import Path

# Add paths
root = Path(__file__).parent
sys.path.insert(0, str(root / "src" / "desktop" / "modern" / "src"))

def test_di_container_basic():
    """Test basic DI container functionality."""
    print("Testing DI container fixes...")
    
    try:
        from core.dependency_injection.di_container import DIContainer, reset_container
        print("✅ Import successful")
        
        # Reset and create container
        reset_container()
        container = DIContainer()
        print("✅ Container creation successful")
        
        # Test required properties exist
        assert hasattr(container, '_is_primitive_type'), "Missing _is_primitive_type"
        assert hasattr(container, '_cleanup_handlers'), "Missing _cleanup_handlers" 
        assert hasattr(container, '_validation_engine'), "Missing _validation_engine"
        print("✅ Required properties exist")
        
        # Test primitive type detection
        assert container._is_primitive_type(str) == True
        assert container._is_primitive_type(int) == True
        print("✅ Primitive type detection works")
        
        # Test basic registration and resolution
        class TestInterface:
            pass
            
        class TestImpl:
            def __init__(self):
                self.value = "test"
        
        container.register_singleton(TestInterface, TestImpl)
        instance = container.resolve(TestInterface)
        assert isinstance(instance, TestImpl)
        assert instance.value == "test"
        print("✅ Basic registration and resolution works")
        
        print("\n🎉 All tests passed! DI container fixes are working.")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_di_container_basic()
    sys.exit(0 if success else 1)
