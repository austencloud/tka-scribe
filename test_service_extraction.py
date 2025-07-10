"""
Test script to verify service extraction refactoring is working correctly.
"""

import os
import sys

# Add the project root to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)


def test_asset_manager_import():
    """Test that AssetManager can be imported and instantiated."""
    try:
        from application.services.assets.asset_manager import AssetManager

        asset_manager = AssetManager()
        print("✅ AssetManager imported and instantiated successfully")
        return True
    except Exception as e:
        print(f"❌ AssetManager import failed: {e}")
        return False


def test_component_sizer_import():
    """Test that ComponentSizer can be imported and instantiated."""
    try:
        from application.services.layout.component_sizer import ComponentSizer

        component_sizer = ComponentSizer()
        print("✅ ComponentSizer imported and instantiated successfully")
        return True
    except Exception as e:
        print(f"❌ ComponentSizer import failed: {e}")
        return False


def test_asset_manager_functionality():
    """Test basic AssetManager functionality."""
    try:
        from application.services.assets.asset_manager import AssetManager
        from domain.models import Location, MotionData, MotionType

        asset_manager = AssetManager()

        # Test asset path generation
        motion_data = MotionData(
            motion_type=MotionType.STATIC,
            turns=0.0,
            start_loc=Location.NORTH,
            end_loc=Location.SOUTH,
        )

        path = asset_manager.get_arrow_asset_path(motion_data, "blue")
        print(f"✅ Asset path generated: {path}")

        # Test color transformation
        svg_data = '<svg><rect fill="#000000"/></svg>'
        transformed = asset_manager.apply_color_transformation(svg_data, "blue")
        print(f"✅ Color transformation applied: {transformed}")

        return True
    except Exception as e:
        print(f"❌ AssetManager functionality test failed: {e}")
        return False


def test_component_sizer_functionality():
    """Test basic ComponentSizer functionality."""
    try:
        from application.services.layout.component_sizer import (
            ComponentSizer,
            SizeConstraints,
        )

        component_sizer = ComponentSizer()

        # Test pictograph frame size calculation
        constraints = SizeConstraints(min_size=60, max_size=200)
        size = component_sizer.calculate_pictograph_frame_size(800, constraints)
        print(f"✅ Pictograph frame size calculated: {size}")

        # Test constraint application
        constrained_size = component_sizer.apply_size_constraints(300, 60, 200)
        print(f"✅ Size constraints applied: {constrained_size}")

        return True
    except Exception as e:
        print(f"❌ ComponentSizer functionality test failed: {e}")
        return False


if __name__ == "__main__":
    print("🔍 Testing Service Extraction Refactoring...")
    print("=" * 50)

    tests = [
        test_asset_manager_import,
        test_component_sizer_import,
        test_asset_manager_functionality,
        test_component_sizer_functionality,
    ]

    passed = 0
    total = len(tests)

    for test in tests:
        if test():
            passed += 1
        print()

    print("=" * 50)
    print(f"🎯 Tests completed: {passed}/{total} passed")

    if passed == total:
        print("🎉 All service extraction refactoring tests passed!")
    else:
        print("⚠️  Some tests failed. Please review the issues above.")
