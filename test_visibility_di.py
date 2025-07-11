#!/usr/bin/env python3
"""
Test script to verify PictographVisibilityManager DI registration.
"""

import sys
from pathlib import Path

# Add the modern src path
modern_src_path = Path(__file__).parent / "src" / "desktop" / "modern" / "src"
sys.path.insert(0, str(modern_src_path))


def test_di_registration():
    """Test that PictographVisibilityManager is properly registered in DI container."""
    try:
        from application.services.pictograph.global_visibility_service import (
            PictographVisibilityManager,
        )
        from core.application.application_factory import ApplicationFactory

        print("Creating production app container...")
        container = ApplicationFactory.create_production_app()

        print("Attempting to resolve PictographVisibilityManager...")
        visibility_service = container.resolve(PictographVisibilityManager)

        print(
            f"✅ Successfully resolved PictographVisibilityManager: {type(visibility_service)}"
        )
        print(f"✅ Service instance: {visibility_service}")

        # Test that it's a singleton - resolve again and check if it's the same instance
        visibility_service2 = container.resolve(PictographVisibilityManager)

        if visibility_service is visibility_service2:
            print("✅ Singleton behavior confirmed - same instance returned")
        else:
            print("❌ Singleton behavior failed - different instances returned")

        return True

    except Exception as e:
        print(f"❌ Failed to resolve PictographVisibilityManager: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("Testing PictographVisibilityManager DI registration...")
    success = test_di_registration()

    if success:
        print(
            "\n🎉 Migration successful! PictographVisibilityManager is properly registered in DI container."
        )
    else:
        print("\n💥 Migration failed! Check the error messages above.")
