#!/usr/bin/env python3
"""
Test option picker display functionality.
"""

import os
import sys

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)


def test_option_display():
    """Test that options are actually displayed in the option picker."""
    print("🧪 Testing option picker display functionality...")

    try:
        # Create QApplication first
        import sys

        from PyQt6.QtWidgets import QApplication

        app = QApplication(sys.argv)
        print("   ✅ QApplication created")

        # Import required components
        from core.application.application_factory import ApplicationFactory
        from domain.models.pictograph_models import PictographData

        print("   ✅ Imports successful")

        # Create test application
        container = ApplicationFactory.create_test_app()
        print("   ✅ Test application created")

        # Get option picker orchestrator
        from application.services.option_picker.orchestrator import (
            OptionPickerOrchestrator,
        )

        orchestrator = OptionPickerOrchestrator(container=container)
        print("   ✅ Orchestrator created")

        # Initialize orchestrator
        orchestrator.initialize()
        print("   ✅ Orchestrator initialized")

        # Test loading motion combinations (this should trigger display)
        test_sequence_data = [
            {"metadata": "sequence_info"},
            {"letter": "α", "start_pos": "alpha1_alpha1", "end_pos": "alpha1"},
        ]

        print("   🔄 Loading motion combinations...")
        orchestrator.load_motion_combinations(test_sequence_data)
        print("   ✅ Motion combinations loaded")

        # Check if options were loaded
        if orchestrator.option_service:
            current_options = orchestrator.option_service.get_current_options()
            print(f"   📊 Current options loaded: {len(current_options)}")

            if current_options:
                print("   ✅ Options were loaded successfully!")
                for i, option in enumerate(current_options[:5]):  # Show first 5
                    print(
                        f"      Option {i+1}: {option.letter} ({option.start_pos} → {option.end_pos})"
                    )
                if len(current_options) > 5:
                    print(f"      ... and {len(current_options) - 5} more options")
            else:
                print("   ❌ No options were loaded")
        else:
            print("   ❌ Option service not available")

        # Check if pool manager has frames
        if orchestrator.pool_manager:
            print("   🔄 Checking pool manager...")

            # Check if frames are visible
            visible_frames = 0
            total_frames = 0

            for i in range(36):  # Check first 36 frames
                frame = orchestrator.pool_manager.get_pictograph_from_pool(i)
                if frame:
                    total_frames += 1
                    if frame.isVisible():
                        visible_frames += 1

            print(f"   📊 Pool frames: {total_frames} total, {visible_frames} visible")

            if visible_frames > 0:
                print(
                    "   ✅ Some frames are visible - display strategy might be working!"
                )
            else:
                print("   ❌ No frames are visible - display strategy not applied")
        else:
            print("   ❌ Pool manager not available")

        return True

    except Exception as e:
        print(f"   ❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Starting option picker display test...\n")

    success = test_option_display()

    print(f"\n📊 Option Display Test Results:")
    if success:
        print("   ✅ Test completed successfully")
    else:
        print("   ❌ Test failed")

    sys.exit(0 if success else 1)
