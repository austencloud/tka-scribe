"""
Debug Test for Special Placement Color Detection

This test specifically investigates why color-specific special placement
is not working for letters G and H, focusing on the color detection logic
in the SpecialPlacementService.
"""

import logging
import sys
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from base_e2e_test import BaseE2ETest

logger = logging.getLogger(__name__)


class SpecialPlacementColorDebugTest(BaseE2ETest):
    """Debug test for special placement color detection."""

    def __init__(self):
        super().__init__("Special Placement Color Debug")

    def execute_test_logic(self) -> bool:
        """Execute the debug test logic."""
        try:
            logger.info("DEBUG: Starting special placement color debug test...")

            # Setup application
            if not self.setup_application():
                return False

            if not self.find_construct_tab():
                return False

            # Debug color detection for G pictographs
            return self._debug_color_detection()

        except Exception as e:
            logger.error(f"DEBUG: Test failed: {e}")
            import traceback

            traceback.print_exc()
            return False

        finally:
            self.cleanup()

    def _debug_color_detection(self) -> bool:
        """Debug the color detection logic for special placement."""
        try:
            logger.info("DEBUG: Investigating color detection for letter G...")

            # Get DI container
            from desktop.modern.core.dependency_injection.di_container import (
                get_container,
            )

            container = get_container()

            # Get real G pictograph
            from shared.application.services.data.dataset_query import IDatasetQuery

            dataset_query = container.resolve(IDatasetQuery)

            beat_data_list = dataset_query.find_pictographs_by_letter("G")
            if not beat_data_list:
                logger.error("ERROR: No G pictographs found in dataset")
                return False

            # Use first G pictograph
            beat_data = beat_data_list[0]
            pictograph_data = beat_data.pictograph_data

            logger.info(
                f"DEBUG: Testing G pictograph with letter: {pictograph_data.letter}"
            )

            # Get the special placement service
            from desktop.modern.application.services.positioning.arrows.orchestration.arrow_adjustment_lookup import (
                ArrowAdjustmentLookup,
            )

            adjustment_lookup = container.resolve(ArrowAdjustmentLookup)
            special_service = adjustment_lookup.special_placement_service

            # Test the full positioning pipeline for each arrow
            for color in ["blue", "red"]:
                if color in pictograph_data.motions:
                    motion_data = pictograph_data.motions[color]
                    logger.info(
                        f"DEBUG: Testing {color} arrow full positioning pipeline"
                    )

                    # Log motion details
                    logger.info(
                        f"DEBUG: {color} motion: {motion_data.motion_type.value} {motion_data.start_loc.value}→{motion_data.end_loc.value}"
                    )

                    # Test the full positioning pipeline
                    self._debug_full_positioning_pipeline(
                        adjustment_lookup, motion_data, pictograph_data, color
                    )

            return True

        except Exception as e:
            logger.error(f"ERROR: Color detection debug failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _debug_color_detection_logic(
        self, special_service, motion_data, pictograph_data, expected_color
    ):
        """Debug the color detection logic step by step."""
        try:
            logger.info(f"DEBUG: === Color Detection for {expected_color} ===")

            # Step 1: Check if arrow_color is provided (it should be)
            logger.info(f"DEBUG: Expected color: {expected_color}")

            # Step 2: Test the motion comparison logic
            logger.info(f"DEBUG: Testing motion comparison logic...")

            # Check if motions exist
            if pictograph_data.motions:
                logger.info(
                    f"DEBUG: Pictograph has motions: {list(pictograph_data.motions.keys())}"
                )

                # Test blue motion comparison
                if "blue" in pictograph_data.motions:
                    blue_motion = pictograph_data.motions["blue"]
                    is_blue_match = blue_motion == motion_data
                    logger.info(f"DEBUG: Blue motion match: {is_blue_match}")
                    logger.info(f"DEBUG: Blue motion object id: {id(blue_motion)}")
                    logger.info(f"DEBUG: Current motion object id: {id(motion_data)}")

                # Test red motion comparison
                if "red" in pictograph_data.motions:
                    red_motion = pictograph_data.motions["red"]
                    is_red_match = red_motion == motion_data
                    logger.info(f"DEBUG: Red motion match: {is_red_match}")
                    logger.info(f"DEBUG: Red motion object id: {id(red_motion)}")
                    logger.info(f"DEBUG: Current motion object id: {id(motion_data)}")
            else:
                logger.warning("DEBUG: No motions in pictograph data")

            # Step 3: Test the actual special placement call
            logger.info(
                f"DEBUG: Testing special placement call with color={expected_color}"
            )

            adjustment = special_service.get_special_adjustment(
                motion_data, pictograph_data, expected_color
            )

            if adjustment:
                logger.info(
                    f"SUCCESS: {expected_color} arrow has special adjustment: ({adjustment.x():.1f}, {adjustment.y():.1f})"
                )
            else:
                logger.warning(
                    f"WARNING: {expected_color} arrow has NO special adjustment"
                )

                # Debug why it failed
                self._debug_special_placement_failure(
                    special_service, motion_data, pictograph_data, expected_color
                )

        except Exception as e:
            logger.error(f"ERROR: Color detection logic debug failed: {e}")
            import traceback

            traceback.print_exc()

    def _debug_special_placement_failure(
        self, special_service, motion_data, pictograph_data, arrow_color
    ):
        """Debug why special placement lookup failed."""
        try:
            logger.info(
                f"DEBUG: === Debugging Special Placement Failure for {arrow_color} ==="
            )

            # Check orientation key generation
            ori_key = special_service._generate_orientation_key(
                motion_data, pictograph_data
            )
            logger.info(f"DEBUG: Generated orientation key: '{ori_key}'")

            # Check grid mode
            grid_mode = getattr(pictograph_data, "grid_mode", "diamond")
            logger.info(f"DEBUG: Grid mode: '{grid_mode}'")

            # Check turns tuple
            turns_tuple = special_service._generate_turns_tuple(pictograph_data)
            logger.info(f"DEBUG: Generated turns tuple: {turns_tuple}")

            # Check if data exists at each level
            letter = pictograph_data.letter

            # Level 1: Grid mode
            if grid_mode in special_service.special_placements:
                logger.info(
                    f"DEBUG: Grid mode '{grid_mode}' found in special placements"
                )

                # Level 2: Orientation key
                if ori_key in special_service.special_placements[grid_mode]:
                    logger.info(f"DEBUG: Orientation key '{ori_key}' found")

                    # Level 3: Letter
                    if letter in special_service.special_placements[grid_mode][ori_key]:
                        logger.info(f"DEBUG: Letter '{letter}' found")

                        letter_data = special_service.special_placements[grid_mode][
                            ori_key
                        ][letter]

                        # Level 4: Turns tuple
                        if turns_tuple in letter_data:
                            logger.info(f"DEBUG: Turns tuple {turns_tuple} found")

                            turn_data = letter_data[turns_tuple]
                            logger.info(
                                f"DEBUG: Turn data keys: {list(turn_data.keys())}"
                            )

                            # Level 5: Color key
                            if arrow_color in turn_data:
                                logger.info(
                                    f"SUCCESS: Color '{arrow_color}' found in turn data!"
                                )
                                logger.info(
                                    f"DEBUG: Color data: {turn_data[arrow_color]}"
                                )
                            else:
                                logger.warning(
                                    f"WARNING: Color '{arrow_color}' NOT found in turn data"
                                )
                                logger.info(
                                    f"DEBUG: Available keys: {list(turn_data.keys())}"
                                )
                        else:
                            logger.warning(
                                f"WARNING: Turns tuple {turns_tuple} NOT found"
                            )
                            logger.info(
                                f"DEBUG: Available turns: {list(letter_data.keys())}"
                            )
                    else:
                        logger.warning(f"WARNING: Letter '{letter}' NOT found")
                        logger.info(
                            f"DEBUG: Available letters: {list(special_service.special_placements[grid_mode][ori_key].keys())}"
                        )
                else:
                    logger.warning(f"WARNING: Orientation key '{ori_key}' NOT found")
                    logger.info(
                        f"DEBUG: Available ori keys: {list(special_service.special_placements[grid_mode].keys())}"
                    )
            else:
                logger.warning(f"WARNING: Grid mode '{grid_mode}' NOT found")
                logger.info(
                    f"DEBUG: Available grid modes: {list(special_service.special_placements.keys())}"
                )

        except Exception as e:
            logger.error(f"ERROR: Special placement failure debug failed: {e}")
            import traceback

            traceback.print_exc()

    def _debug_full_positioning_pipeline(
        self, adjustment_lookup, motion_data, pictograph_data, color
    ):
        """Debug the full positioning pipeline step by step."""
        try:
            logger.info(f"DEBUG: === Full Positioning Pipeline for {color} ===")

            # Step 1: Test special placement lookup
            special_service = adjustment_lookup.special_placement_service
            special_adjustment = special_service.get_special_adjustment(
                motion_data, pictograph_data, color
            )

            if special_adjustment:
                logger.info(
                    f"DEBUG: Step 1 - Special placement: ({special_adjustment.x():.1f}, {special_adjustment.y():.1f})"
                )
            else:
                logger.warning(f"DEBUG: Step 1 - No special placement found")
                return

            # Step 2: Test base adjustment lookup
            letter = pictograph_data.letter
            location = motion_data.end_loc  # Use end location as arrow location

            base_adjustment = adjustment_lookup.get_base_adjustment(
                pictograph_data, motion_data, letter, color
            )
            logger.info(
                f"DEBUG: Step 2 - Base adjustment: ({base_adjustment.x:.1f}, {base_adjustment.y:.1f})"
            )

            # Step 3: Test full arrow positioning orchestrator
            from desktop.modern.core.dependency_injection.di_container import (
                get_container,
            )

            container = get_container()

            from desktop.modern.core.interfaces.positioning_services import (
                IArrowPositioningOrchestrator,
            )

            orchestrator = container.resolve(IArrowPositioningOrchestrator)

            # Create arrow data for the test
            from desktop.modern.domain.models.arrow_data import ArrowData

            arrow_data = ArrowData(color=color, is_visible=True)

            final_x, final_y, rotation = orchestrator.calculate_arrow_position(
                arrow_data, pictograph_data, motion_data
            )
            logger.info(
                f"DEBUG: Step 3 - Final position from orchestrator: ({final_x:.1f}, {final_y:.1f}) rotation {rotation:.1f}°"
            )

        except Exception as e:
            logger.error(f"ERROR: Full positioning pipeline debug failed: {e}")
            import traceback

            traceback.print_exc()


def run_special_placement_color_debug_test() -> bool:
    """Run the special placement color debug test."""
    test = SpecialPlacementColorDebugTest()
    return test.execute_test_logic()


if __name__ == "__main__":
    success = run_special_placement_color_debug_test()
    if not success:
        print("\nFAILED: SPECIAL PLACEMENT COLOR DEBUG TEST FAILED!")
        sys.exit(1)
    else:
        print("\nSUCCESS: SPECIAL PLACEMENT COLOR DEBUG TEST PASSED!")
        sys.exit(0)
