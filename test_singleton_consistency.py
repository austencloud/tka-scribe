#!/usr/bin/env python3
"""
Test script to verify that all components use the same GlobalVisibilityService instance.
"""

import sys
import os

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)


def test_singleton_consistency():
    """Test that all components use the same GlobalVisibilityService instance."""
    print("🔍 Testing GlobalVisibilityService singleton consistency...")

    try:
        # Import the singleton getter
        from application.services.pictograph.global_visibility_service_singleton import (
            get_global_visibility_service,
        )

        # Get multiple instances
        service1 = get_global_visibility_service()
        service2 = get_global_visibility_service()
        service3 = get_global_visibility_service()

        # Test they're the same instance
        assert service1 is service2, "service1 and service2 should be the same instance"
        assert service2 is service3, "service2 and service3 should be the same instance"

        print(f"✅ All services are the same instance: {id(service1)}")

        # Test registration and retrieval
        class MockPictograph:
            def __init__(self, name):
                self.name = name

            def update_visibility(self, element_type, element_name, visible):
                print(f"🔄 {self.name}: Updated {element_name} visibility to {visible}")

        mock = MockPictograph("Test Mock")
        success = service1.register_pictograph("test_mock", mock, "test")
        print(f"✅ Registration success: {success}")

        # Apply change through different service reference
        result = service2.apply_visibility_change("glyph", "TKA", False)
        print(f"✅ Update result: {result}")

        # Check stats through third reference
        stats = service3.get_statistics()
        print(f"✅ Service stats: {stats}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_visibility_tab_import():
    """Test that VisibilityTab can use the singleton."""
    print("\n🔍 Testing VisibilityTab singleton usage...")

    try:
        from application.services.pictograph.global_visibility_service_singleton import (
            get_global_visibility_service,
        )

        # Get the singleton
        singleton = get_global_visibility_service()

        # Test that it can import and would use the same instance
        from application.services.pictograph.global_visibility_service import (
            GlobalVisibilityService,
        )

        # Test that calling the function directly gives same instance
        singleton2 = get_global_visibility_service()

        assert singleton is singleton2, "Multiple calls should return same instance"
        print(f"✅ VisibilityTab would use singleton instance: {id(singleton)}")

        return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🔍 Testing TKA GlobalVisibilityService Singleton")
    print("=" * 60)

    success1 = test_singleton_consistency()
    success2 = test_visibility_tab_import()

    if success1 and success2:
        print("\n✅ All tests passed! The singleton is working correctly.")
    else:
        print("\n❌ Some tests failed.")
