#!/usr/bin/env python3
"""
Verify the complete flow from start position selection to option picker display.
"""

import os
import sys

# Add the src directory to the path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "src", "desktop", "modern", "src")
)


def test_option_flow():
    """Test each step of the start position to option picker flow."""
    print("🚀 Testing Start Position → Option Picker Flow")
    print("=" * 60)

    try:
        # Create QApplication first
        from PyQt6.QtWidgets import QApplication

        app = QApplication(sys.argv)
        print("✅ QApplication created")

        # Import required components
        from core.application.application_factory import ApplicationFactory
        from domain.models.pictograph_models import PictographData

        # Create test application
        container = ApplicationFactory.create_test_app()
        print("✅ Test application created")

        # Step 1: Test OptionPickerOrchestrator initialization
        print("\n🔍 Step 1: Testing OptionPickerOrchestrator...")
        from application.services.option_picker.orchestrator import (
            OptionPickerOrchestrator,
        )

        orchestrator = OptionPickerOrchestrator(container=container)
        orchestrator.initialize()
        print("   ✅ Orchestrator initialized")

        # Verify components are available
        if orchestrator.option_service:
            print("   ✅ OptionService available")
        else:
            print("   ❌ OptionService missing")
            return False

        if orchestrator.display_service:
            print("   ✅ DisplayService available")
        else:
            print("   ❌ DisplayService missing")
            return False

        if orchestrator.pool_manager:
            print("   ✅ PoolManager available")
        else:
            print("   ❌ PoolManager missing")
            return False

        # Step 2: Test sequence data creation (what OptionPickerManager should create)
        print("\n🔍 Step 2: Testing sequence data creation...")
        test_sequence_data = [
            {"metadata": "sequence_info"},
            {"letter": "α", "start_pos": "alpha1_alpha1", "end_pos": "alpha1"},
        ]
        print(f"   ✅ Created sequence_data: {test_sequence_data}")

        # Step 3: Test OptionService.load_options_from_sequence
        print("\n🔍 Step 3: Testing OptionService.load_options_from_sequence...")
        try:
            options = orchestrator.option_service.load_options_from_sequence(
                test_sequence_data
            )
            print(f"   ✅ Loaded {len(options)} options from sequence")

            if len(options) > 0:
                print(
                    f"   📊 First option: {options[0].letter} ({options[0].start_position} → {options[0].end_position})"
                )
                if len(options) >= 36:
                    print("   ✅ Expected number of options (36+) loaded")
                else:
                    print(f"   ⚠️ Only {len(options)} options loaded (expected 36)")
            else:
                print("   ❌ No options loaded")
                return False

        except Exception as e:
            print(f"   ❌ OptionService failed: {e}")
            import traceback

            traceback.print_exc()
            return False

        # Step 4: Test DisplayManager.update_pictograph_display
        print("\n🔍 Step 4: Testing DisplayManager.update_pictograph_display...")
        try:
            display_result = orchestrator.display_service.update_pictograph_display(
                options
            )
            print(
                f"   ✅ DisplayManager returned: {display_result.get('success', False)}"
            )

            if display_result.get("success", False):
                strategy = display_result.get("display_strategy", {})
                organized = strategy.get("organized_pictographs", {})
                assignments = strategy.get("pictograph_assignments", {})

                print(f"   📊 Organized pictographs: {len(organized)} letter types")
                print(f"   📊 Pictograph assignments: {len(assignments)} sections")

                # Show details of organized pictographs
                for letter_type, pictographs in organized.items():
                    print(f"      {letter_type}: {len(pictographs)} pictographs")

            else:
                print(
                    f"   ❌ DisplayManager failed: {display_result.get('error', 'Unknown error')}"
                )
                return False

        except Exception as e:
            print(f"   ❌ DisplayManager failed: {e}")
            import traceback

            traceback.print_exc()
            return False

        # Step 5: Test _apply_display_strategy (the new method I added)
        print("\n🔍 Step 5: Testing _apply_display_strategy...")
        try:
            # Check if pool manager has frames
            total_frames = 0
            visible_before = 0

            for i in range(50):  # Check first 50 frames
                frame = orchestrator.pool_manager.get_pictograph_from_pool(i)
                if frame:
                    total_frames += 1
                    if frame.isVisible():
                        visible_before += 1

            print(
                f"   📊 Before apply: {total_frames} frames, {visible_before} visible"
            )

            # Apply the display strategy
            if display_result.get("success", False):
                orchestrator._apply_display_strategy(display_result["display_strategy"])
                print("   ✅ _apply_display_strategy called")

                # Check frames after applying strategy
                visible_after = 0
                updated_frames = 0

                for i in range(50):
                    frame = orchestrator.pool_manager.get_pictograph_from_pool(i)
                    if frame:
                        if frame.isVisible():
                            visible_after += 1
                        # Check if frame has been updated with real data
                        if hasattr(frame, "pictograph_data") and frame.pictograph_data:
                            if (
                                frame.pictograph_data.letter
                                and frame.pictograph_data.letter != ""
                            ):
                                updated_frames += 1

                print(
                    f"   📊 After apply: {visible_after} visible, {updated_frames} updated"
                )

                if visible_after > visible_before:
                    print("   ✅ More frames became visible after applying strategy")
                else:
                    print("   ⚠️ No change in frame visibility")

                if updated_frames > 0:
                    print("   ✅ Frames were updated with pictograph data")
                else:
                    print("   ❌ No frames were updated with pictograph data")

            else:
                print("   ❌ Cannot apply strategy - display result failed")
                return False

        except Exception as e:
            print(f"   ❌ _apply_display_strategy failed: {e}")
            import traceback

            traceback.print_exc()
            return False

        # Step 6: Test complete load_motion_combinations flow
        print("\n🔍 Step 6: Testing complete load_motion_combinations flow...")
        try:
            # Reset frames to hidden first
            for i in range(50):
                frame = orchestrator.pool_manager.get_pictograph_from_pool(i)
                if frame:
                    frame.setVisible(False)

            # Call the complete flow
            orchestrator.load_motion_combinations(test_sequence_data)
            print("   ✅ load_motion_combinations completed")

            # Check final result
            final_visible = 0
            final_updated = 0

            for i in range(50):
                frame = orchestrator.pool_manager.get_pictograph_from_pool(i)
                if frame:
                    if frame.isVisible():
                        final_visible += 1
                    if hasattr(frame, "pictograph_data") and frame.pictograph_data:
                        if (
                            frame.pictograph_data.letter
                            and frame.pictograph_data.letter != ""
                        ):
                            final_updated += 1

            print(
                f"   📊 Final result: {final_visible} visible, {final_updated} updated"
            )

            # Additional debugging: Check section visibility
            print("\n🔍 Step 7: Checking section and widget visibility...")
            if orchestrator.sections:
                for letter_type, section in orchestrator.sections.items():
                    section_visible = (
                        section.isVisible()
                        if hasattr(section, "isVisible")
                        else "unknown"
                    )
                    container_visible = (
                        section.section_pictograph_container.isVisible()
                        if hasattr(section.section_pictograph_container, "isVisible")
                        else "unknown"
                    )
                    frame_count = (
                        len(section.section_pictograph_container.pictographs)
                        if hasattr(section.section_pictograph_container, "pictographs")
                        else 0
                    )
                    print(
                        f"   📊 {letter_type}: section_visible={section_visible}, container_visible={container_visible}, frames={frame_count}"
                    )
            else:
                print("   ❌ No sections found")

            # Check main widget visibility
            if orchestrator.option_picker_widget:
                main_visible = (
                    orchestrator.option_picker_widget.isVisible()
                    if hasattr(orchestrator.option_picker_widget, "isVisible")
                    else "unknown"
                )
                print(f"   📊 Main widget visible: {main_visible}")

            if final_visible > 0 and final_updated > 0:
                print("   🎉 SUCCESS: Options are visible and updated!")
                return True
            else:
                print("   ❌ FAILURE: Options are not properly displayed")
                return False

        except Exception as e:
            print(f"   ❌ Complete flow failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    except Exception as e:
        print(f"❌ Test setup failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_option_flow()

    print(f"\n{'='*60}")
    if success:
        print("🎉 FLOW VERIFICATION: SUCCESS")
        print("   All steps in the start position → option picker flow are working!")
    else:
        print("❌ FLOW VERIFICATION: FAILED")
        print("   One or more steps in the flow are not working correctly.")

    sys.exit(0 if success else 1)
