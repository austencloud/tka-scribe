#!/usr/bin/env python3
"""
Debug script to test the visibility system and see if pictographs are being registered.
"""

import sys
import os

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)

import logging

logging.basicConfig(level=logging.DEBUG)


def test_global_visibility_service():
    """Test if the global visibility service is working."""
    try:
        from application.services.pictograph.global_visibility_service import (
            GlobalVisibilityService,
        )

        # Create a global service instance
        service = GlobalVisibilityService()

        print(f"✅ Global visibility service created successfully")
        print(f"📊 Service stats: {service.get_statistics()}")

        # Test registration
        class MockPictograph:
            def __init__(self, name):
                self.name = name

            def update_visibility(self, element_type, element_name, visible):
                print(f"🔄 {self.name}: Updated {element_name} visibility to {visible}")

        # Register test pictographs
        mock1 = MockPictograph("Test Pictograph 1")
        mock2 = MockPictograph("Test Pictograph 2")

        success1 = service.register_pictograph("test1", mock1, "test_component")
        success2 = service.register_pictograph("test2", mock2, "test_component")

        print(f"✅ Registration 1: {success1}")
        print(f"✅ Registration 2: {success2}")
        print(f"📊 Service stats after registration: {service.get_statistics()}")

        # Test visibility change
        result = service.apply_visibility_change("glyph", "TKA", False)
        print(f"🔄 Visibility change result: {result}")

        return service

    except Exception as e:
        print(f"❌ Error testing global visibility service: {e}")
        import traceback

        traceback.print_exc()
        return None


def test_pictograph_scene_registration():
    """Test if PictographScene registers itself properly."""
    try:
        from presentation.components.pictograph.pictograph_scene import PictographScene
        from application.services.pictograph.global_visibility_service import (
            GlobalVisibilityService,
        )

        # Create global service instance
        global_service = GlobalVisibilityService()

        print(
            f"📊 Service stats before scene creation: {global_service.get_statistics()}"
        )

        # Create pictograph scene (should auto-register)
        scene = PictographScene()

        print(f"✅ PictographScene created with ID: {scene.scene_id}")
        print(
            f"📊 Service stats after scene creation: {global_service.get_statistics()}"
        )

        # Test updating visibility
        scene.update_visibility("glyph", "TKA", False)
        print(f"🔄 Called update_visibility on scene")

        return scene

    except Exception as e:
        print(f"❌ Error testing pictograph scene registration: {e}")
        import traceback

        traceback.print_exc()
        return None


if __name__ == "__main__":
    print("🔍 Testing TKA Visibility System")
    print("=" * 50)

    print("\n1. Testing Global Visibility Service...")
    service = test_global_visibility_service()

    print("\n2. Testing PictographScene Registration...")
    scene = test_pictograph_scene_registration()

    print("\n✅ Debug test complete!")
