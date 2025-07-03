#!/usr/bin/env python3
"""
Comprehensive test for the visibility system end-to-end functionality.
"""

import sys
import os

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)

import logging

logging.basicConfig(level=logging.DEBUG)


def test_end_to_end_visibility():
    """Test the complete visibility system from UI changes to pictograph updates."""
    print("🔍 Testing End-to-End Visibility System...")

    try:
        from application.services.pictograph.global_visibility_service_singleton import (
            get_global_visibility_service,
        )

        # Get the global service
        service = get_global_visibility_service()
        print(f"✅ Got global service instance: {id(service)}")

        # Track updates for verification
        update_log = []

        class MockPictographScene:
            """Mock PictographScene to simulate real scenes."""

            def __init__(self, scene_id, component_type="graph_editor"):
                self.scene_id = scene_id
                self.component_type = component_type
                self.updates_received = []

                # Register with global service (like real PictographScene does)
                success = service.register_pictograph(
                    pictograph_id=self.scene_id,
                    pictograph_instance=self,
                    component_type=component_type,
                    update_method="update_visibility",
                )
                print(f"✅ Registered {scene_id}: {success}")

            def update_visibility(self, element_type, element_name, visible):
                """Simulate the PictographScene update_visibility method."""
                update_info = f"{self.scene_id}: {element_name}={visible}"
                self.updates_received.append(update_info)
                update_log.append(update_info)
                print(f"🔄 {update_info}")

        # Create mock pictograph scenes (simulating different parts of the app)
        graph_editor_scene = MockPictographScene("graph_editor_1", "graph_editor")
        preview_scene = MockPictographScene("preview_1", "preview")
        sequence_scene = MockPictographScene("sequence_1", "sequence_viewer")

        print(f"📊 Service stats after registration: {service.get_statistics()}")

        # Simulate visibility tab updates
        print("\n🔧 Simulating visibility tab updates...")

        # Test motion visibility changes
        print("Testing motion visibility changes...")
        motion_updates = [
            ("motion", "red_motion", False),
            ("motion", "blue_motion", True),
        ]

        for element_type, element_name, visible in motion_updates:
            result = service.apply_visibility_change(
                element_type, element_name, visible
            )
            print(
                f"📤 Sent {element_name}={visible}, result: {result['success_count']} updated"
            )

        # Test glyph visibility changes
        print("\nTesting glyph visibility changes...")
        glyph_updates = [
            ("glyph", "TKA", False),
            ("glyph", "VTG", True),
            ("glyph", "Elemental", False),
            ("glyph", "Positions", True),
            ("glyph", "Reversals", False),
        ]

        for element_type, element_name, visible in glyph_updates:
            result = service.apply_visibility_change(
                element_type, element_name, visible
            )
            print(
                f"📤 Sent {element_name}={visible}, result: {result['success_count']} updated"
            )

        # Test grid visibility changes
        print("\nTesting grid visibility changes...")
        result = service.apply_visibility_change("grid", "Non-radial_points", True)
        print(
            f"📤 Sent Non-radial_points=True, result: {result['success_count']} updated"
        )

        # Verify all scenes received all updates
        print("\n🔍 Verifying update propagation...")

        expected_updates = (
            len(motion_updates) + len(glyph_updates) + 1
        )  # +1 for non-radial

        for scene in [graph_editor_scene, preview_scene, sequence_scene]:
            received_count = len(scene.updates_received)
            print(
                f"📊 {scene.scene_id}: received {received_count}/{expected_updates} updates"
            )

            if received_count == expected_updates:
                print(f"✅ {scene.scene_id}: All updates received correctly!")
            else:
                print(f"❌ {scene.scene_id}: Missing updates!")
                print(f"   Expected: {expected_updates}, Received: {received_count}")

        print(f"\n📋 Complete update log ({len(update_log)} total updates):")
        for i, update in enumerate(update_log, 1):
            print(f"  {i:2d}. {update}")

        # Final stats
        final_stats = service.get_statistics()
        print(f"\n📊 Final service stats: {final_stats}")

        # Check if all expected updates were sent
        total_expected = expected_updates * 3  # 3 scenes
        total_received = len(update_log)

        if total_received == total_expected:
            print(f"✅ SUCCESS: All {total_expected} updates were properly propagated!")
            return True
        else:
            print(
                f"❌ FAILURE: Expected {total_expected} updates, but received {total_received}"
            )
            return False

    except Exception as e:
        print(f"❌ Error in end-to-end test: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🔍 Testing TKA Visibility System End-to-End")
    print("=" * 60)

    success = test_end_to_end_visibility()

    if success:
        print("\n🎉 All tests passed! The visibility system is working correctly.")
        print(
            "When you toggle visibility settings in the UI, all pictographs should update!"
        )
    else:
        print("\n💥 Tests failed. There may be issues with the visibility system.")
