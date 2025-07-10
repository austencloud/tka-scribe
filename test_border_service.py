#!/usr/bin/env python3
"""
Simple test for border service extraction functionality.
"""

import os
import sys

sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)


def test_border_service():
    """Test border service functionality."""
    print("Testing Border Service Extraction...")

    try:
        from application.services.pictographs.border_service import (
            PictographBorderService,
        )
        from domain.models import LetterType

        # Test 1: Service creation
        service = PictographBorderService()
        print("✅ Border service created successfully")

        # Test 2: Border calculations
        width = service.calculate_border_width(100)
        print(f"✅ Border width calculation: {width}")
        assert width > 0, "Border width should be positive"

        # Test 3: Color management
        config = service.apply_letter_type_colors(LetterType.TYPE1)
        print(
            f"✅ Letter type colors: {config.primary_color}, {config.secondary_color}"
        )
        assert config.primary_color == "#36c3ff", "TYPE1 primary color should be cyan"
        assert (
            config.secondary_color == "#6F2DA8"
        ), "TYPE1 secondary color should be purple"

        # Test 4: Size adjustments
        adjusted = service.get_border_adjusted_size(100)
        print(f"✅ Size adjustment: {adjusted}")
        assert adjusted >= 50, "Adjusted size should be at least 50"

        # Test 5: Configuration validation
        valid = service.validate_configuration()
        print(f"✅ Configuration valid: {valid}")
        assert valid, "Configuration should be valid"

        # Test 6: Gold colors
        config = service.apply_gold_colors()
        print(f"✅ Gold colors: {config.primary_color}")
        assert config.primary_color == "#FFD700", "Gold color should be correct"

        print("🎉 All border service tests passed!")
        return True

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_border_manager():
    """Test border manager integration."""
    print("\nTesting Border Manager Integration...")

    try:
        from application.services.pictographs.border_service import (
            PictographBorderService,
        )
        from domain.models import LetterType
        from presentation.components.pictograph.border_manager import (
            PictographBorderManager,
        )

        # Test manager with service
        service = PictographBorderService()
        manager = PictographBorderManager(service)
        print("✅ Border manager created with service")

        # Test delegation
        width = manager.calculate_border_width(100)
        print(f"✅ Manager border calculation: {width}")
        assert width > 0, "Manager should delegate calculations correctly"

        # Test color management
        manager.update_border_colors_for_letter_type(LetterType.TYPE1)
        colors = manager.get_current_colors()
        print(f"✅ Manager color management: {colors}")
        assert colors[0] == "#36c3ff", "Manager should delegate color management"

        print("🎉 Border manager integration tests passed!")
        return True

    except Exception as e:
        print(f"❌ Manager test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_factory_function():
    """Test pictograph component factory."""
    print("\nTesting Factory Function...")

    try:
        from presentation.components.pictograph.pictograph_component import (
            create_pictograph_component,
        )

        # Test factory function (should use fallback)
        component = create_pictograph_component()
        print("✅ Factory function works with fallback")

        # Test that component has border methods
        assert hasattr(
            component, "set_gold_border"
        ), "Component should have border methods"
        assert hasattr(
            component, "reset_border_colors"
        ), "Component should have border methods"
        assert hasattr(
            component, "calculate_border_width"
        ), "Component should have border methods"
        print("✅ Component has all border methods")

        print("🎉 Factory function tests passed!")
        return True

    except Exception as e:
        print(f"❌ Factory test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("BORDER SERVICE EXTRACTION VALIDATION")
    print("=" * 60)

    results = []
    results.append(test_border_service())
    results.append(test_border_manager())
    results.append(test_factory_function())

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    passed = sum(results)
    total = len(results)

    if passed == total:
        print(f"🎉 ALL TESTS PASSED ({passed}/{total})")
        print("✅ Border service extraction is working correctly!")
        sys.exit(0)
    else:
        print(f"❌ SOME TESTS FAILED ({passed}/{total})")
        sys.exit(1)
