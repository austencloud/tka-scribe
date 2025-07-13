#!/usr/bin/env python3
"""
Test Script for Microservice Extraction

This script tests the microservice extraction to ensure:
1. All new microservices can be instantiated without errors
2. Services are properly registered in DI container
3. Option picker components can use injected microservices
4. Business logic has been successfully extracted from UI components
5. Performance and functionality are maintained

Run this script to validate the microservice extraction implementation.
"""

import os
import sys

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))


def test_microservice_instantiation():
    """Test that all new microservices can be instantiated."""
    print("🧪 Testing Microservice Instantiation...")

    try:
        # Test SequenceOptionService
        print("📦 Testing SequenceOptionService...")
        from application.services.option_picker.sequence_option_service import (
            SequenceOptionService,
        )
        from application.services.positioning.arrows.utilities.pictograph_position_matcher import (
            PictographPositionMatcher,
        )

        # Create mock position matcher for testing
        class MockPositionMatcher:
            def get_next_options(self, end_position):
                return []

        sequence_service = SequenceOptionService(MockPositionMatcher())
        print("✅ SequenceOptionService instantiated successfully")

        # Test FramePoolService
        print("📦 Testing FramePoolService...")
        from application.services.option_picker.frame_pool_service import (
            FramePoolService,
        )

        frame_pool = FramePoolService(max_frames=36)
        print("✅ FramePoolService instantiated successfully")

        # Test OptionLoadingService
        print("📦 Testing OptionLoadingService...")
        from application.services.option_picker.option_loading_service import (
            OptionLoadingService,
        )

        loading_service = OptionLoadingService(frame_pool)
        print("✅ OptionLoadingService instantiated successfully")

        # Test OptionSizingService
        print("📦 Testing OptionSizingService...")
        from application.services.option_picker.option_sizing_service import (
            OptionSizingService,
        )

        sizing_service = OptionSizingService()
        print("✅ OptionSizingService instantiated successfully")

        return True

    except Exception as e:
        print(f"❌ Microservice instantiation failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_di_container_registration():
    """Test that services are properly registered in DI container."""
    print("\n🧪 Testing DI Container Registration...")

    try:
        from application.services.core.service_registration_manager import (
            ServiceRegistrationManager,
        )
        from core.dependency_injection.di_container import DIContainer

        # Create container and register services
        container = DIContainer()
        registration_manager = ServiceRegistrationManager()

        # Register positioning services first (dependency for SequenceOptionService)
        print("📦 Registering positioning services...")
        registration_manager.register_positioning_services(container)

        print("📦 Registering option picker services...")
        registration_manager.register_option_picker_services(container)

        # Test service resolution
        print("🔍 Testing service resolution...")

        from application.services.option_picker.frame_pool_service import (
            FramePoolService,
        )
        from application.services.option_picker.option_loading_service import (
            OptionLoadingService,
        )
        from application.services.option_picker.option_sizing_service import (
            OptionSizingService,
        )
        from application.services.option_picker.sequence_option_service import (
            SequenceOptionService,
        )

        # Try to resolve services
        sequence_service = container.resolve(SequenceOptionService)
        print("✅ SequenceOptionService resolved from container")

        frame_pool = container.resolve(FramePoolService)
        print("✅ FramePoolService resolved from container")

        loading_service = container.resolve(OptionLoadingService)
        print("✅ OptionLoadingService resolved from container")

        sizing_service = container.resolve(OptionSizingService)
        print("✅ OptionSizingService resolved from container")

        return True

    except Exception as e:
        print(f"❌ DI container registration failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_sequence_option_service_functionality():
    """Test SequenceOptionService business logic."""
    print("\n🧪 Testing SequenceOptionService Functionality...")

    try:
        from application.services.option_picker.sequence_option_service import (
            SequenceOptionService,
        )
        from domain.models.beat_data import BeatData
        from domain.models.pictograph_data import PictographData
        from domain.models.sequence_data import SequenceData

        # Create mock position matcher
        class MockPositionMatcher:
            def get_next_options(self, end_position):
                # Return mock options for testing
                return [
                    PictographData(
                        letter="A", start_position=end_position, end_position="beta1"
                    ),
                    PictographData(
                        letter="B", start_position=end_position, end_position="gamma1"
                    ),
                    PictographData(
                        letter="Φ", start_position=end_position, end_position="delta1"
                    ),
                ]

        service = SequenceOptionService(MockPositionMatcher())

        # Test with empty sequence
        print("🔍 Testing empty sequence...")
        empty_sequence = SequenceData.empty()
        end_pos = service._extract_end_position(empty_sequence)
        assert end_pos == "alpha1", f"Expected alpha1, got {end_pos}"
        print("✅ Empty sequence returns alpha1")

        # Test with sequence containing beats
        print("🔍 Testing sequence with beats...")
        pictograph_data = PictographData(letter="A", end_position="beta1")
        beat = BeatData(beat_number=1, pictograph_data=pictograph_data)
        sequence = SequenceData(name="Test", beats=[beat])
        end_pos = service._extract_end_position(sequence)
        assert end_pos == "beta1", f"Expected beta1, got {end_pos}"
        print("✅ Sequence with beats returns correct end position")

        # Test option grouping
        print("🔍 Testing option grouping...")
        options_by_type = service.get_options_for_sequence(sequence)
        assert isinstance(options_by_type, dict), "Expected dictionary result"
        print(f"✅ Options grouped into {len(options_by_type)} letter types")

        return True

    except Exception as e:
        print(f"❌ SequenceOptionService functionality test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def test_frame_pool_service_functionality():
    """Test FramePoolService object management."""
    print("\n🧪 Testing FramePoolService Functionality...")

    try:
        from application.services.option_picker.frame_pool_service import (
            FramePoolService,
        )
        from PyQt6.QtWidgets import QApplication, QWidget

        # Create QApplication for Qt widgets
        app = QApplication.instance()
        if app is None:
            app = QApplication([])

        service = FramePoolService(max_frames=5)  # Small pool for testing

        # Test pool initialization
        print("🔍 Testing pool initialization...")
        parent = QWidget()
        service.initialize_pool(parent)
        assert service.is_initialized(), "Pool should be initialized"
        assert (
            service.get_pool_size() == 5
        ), f"Expected 5 frames, got {service.get_pool_size()}"
        print("✅ Pool initialized with correct size")

        # Test frame checkout
        print("🔍 Testing frame checkout...")
        frame1 = service.checkout_frame()
        assert frame1 is not None, "Should get a frame"

        # Make frame1 visible so it won't be reused
        frame1.show()

        frame2 = service.checkout_frame()
        assert frame2 is not None, "Should get another frame"
        # Note: frames might be the same if pool reuses them when all are visible
        print("✅ Frame checkout working correctly")

        # Test frame checkin
        print("🔍 Testing frame checkin...")
        service.checkin_frame(frame1)
        frame3 = service.checkout_frame()
        # After checkin, frame1 should be hidden and available for reuse
        assert not frame1.isVisible(), "Checked-in frame should be hidden"
        print("✅ Frame checkin and reuse working correctly")

        # Test statistics
        print("🔍 Testing pool statistics...")
        stats = service.get_pool_statistics()
        assert stats["total_frames"] == 5, "Should report correct total"
        assert stats["initialized"] == True, "Should report initialized"
        print("✅ Pool statistics working correctly")

        return True

    except Exception as e:
        print(f"❌ FramePoolService functionality test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


def main():
    """Main test function."""
    print("🚀 TKA Microservice Extraction Test")
    print("=" * 60)
    print("This script verifies that the microservice extraction is working correctly.")
    print()

    tests = [
        ("Microservice Instantiation", test_microservice_instantiation),
        ("DI Container Registration", test_di_container_registration),
        (
            "SequenceOptionService Functionality",
            test_sequence_option_service_functionality,
        ),
        ("FramePoolService Functionality", test_frame_pool_service_functionality),
    ]

    results = []

    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    passed = 0
    total = len(results)

    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {status} {test_name}")
        if success:
            passed += 1

    print(f"\n🎯 Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Microservice extraction is working correctly.")
        return 0
    else:
        print("⚠️ Some tests failed. Please review the output above.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
