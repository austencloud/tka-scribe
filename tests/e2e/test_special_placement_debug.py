"""
Debug Test for Special Placement System

This test specifically investigates why special placement is not working
for letters G and H, focusing on the special placement lookup pipeline.
"""

import logging
import sys
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from base_e2e_test import BaseE2ETest

logger = logging.getLogger(__name__)


class SpecialPlacementDebugTest(BaseE2ETest):
    """Debug test for special placement system."""

    def __init__(self):
        super().__init__("Special Placement Debug")

    def execute_test_logic(self) -> bool:
        """Execute the debug test logic."""
        try:
            logger.info("DEBUG: Starting special placement debug test...")

            # Setup application
            if not self.setup_application():
                return False

            if not self.find_construct_tab():
                return False

            # Debug special placement system
            return self._debug_special_placement_system()

        except Exception as e:
            logger.error(f"DEBUG: Test failed: {e}")
            import traceback

            traceback.print_exc()
            return False

        finally:
            self.cleanup()

    def _debug_special_placement_system(self) -> bool:
        """Debug the special placement system components."""
        try:
            logger.info("DEBUG: Investigating special placement system...")

            # Get DI container
            from desktop.modern.core.dependency_injection.di_container import (
                get_container,
            )

            container = get_container()

            # Test 1: Check if special placement service exists
            if not self._test_special_placement_service_exists(container):
                return False

            # Test 2: Check special placement data loading
            if not self._test_special_placement_data_loading():
                return False

            # Test 3: Test specific G pictograph lookup
            if not self._test_letter_g_special_placement_lookup(container):
                return False

            # Test 4: Test orientation key generation
            if not self._test_orientation_key_generation(container):
                return False

            logger.info("DEBUG: All special placement debug tests completed")
            return True

        except Exception as e:
            logger.error(f"DEBUG: Special placement debug failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _test_special_placement_service_exists(self, container) -> bool:
        """Test if special placement service is properly registered."""
        try:
            logger.info("DEBUG: Testing special placement service registration...")

            # Try to resolve the special placement service through arrow adjustment lookup
            from desktop.modern.application.services.positioning.arrows.orchestration.arrow_adjustment_lookup import (
                ArrowAdjustmentLookup,
            )

            try:
                adjustment_lookup = container.resolve(ArrowAdjustmentLookup)
                logger.info("SUCCESS: Arrow adjustment lookup found in container")

                # Get the special placement service from the lookup
                special_service = adjustment_lookup.special_placement_service
                logger.info(
                    "SUCCESS: Special placement service found through adjustment lookup"
                )

                # Check if it has loaded data
                if hasattr(special_service, "special_placements"):
                    placement_count = len(special_service.special_placements)
                    logger.info(
                        f"DEBUG: Special placement service has {placement_count} placement modes loaded"
                    )

                    # Log what modes are available
                    for mode, data in special_service.special_placements.items():
                        subfolder_count = len(data)
                        logger.info(
                            f"DEBUG: Mode '{mode}' has {subfolder_count} subfolders"
                        )

                        for subfolder, letters in data.items():
                            letter_count = len(letters)
                            logger.info(
                                f"DEBUG: Subfolder '{subfolder}' has {letter_count} letters"
                            )

                            if "G" in letters:
                                g_data = letters["G"]
                                turn_count = len(g_data)
                                logger.info(
                                    f"DEBUG: Letter G in {mode}/{subfolder} has {turn_count} turn configurations"
                                )

                                # Log first few turn configurations
                                for i, (turn_key, turn_data) in enumerate(
                                    g_data.items()
                                ):
                                    if i < 3:  # Only log first 3
                                        logger.info(
                                            f"DEBUG: G turn '{turn_key}': {turn_data}"
                                        )

                return True

            except Exception as e:
                logger.error(f"ERROR: Could not resolve special placement service: {e}")
                return False

        except Exception as e:
            logger.error(f"ERROR: Special placement service test failed: {e}")
            return False

    def _test_special_placement_data_loading(self) -> bool:
        """Test if special placement data files are being loaded correctly."""
        try:
            logger.info("DEBUG: Testing special placement data file loading...")

            # Check if data files exist
            from pathlib import Path

            # Find project root
            current_path = Path(__file__).parent
            while current_path.parent != current_path:
                if (current_path / "src").exists():
                    project_root = current_path
                    break
                current_path = current_path.parent
            else:
                logger.error("ERROR: Could not find project root")
                return False

            # Check G placement files
            placement_dirs = [
                project_root
                / "src"
                / "desktop"
                / "data"
                / "arrow_placement"
                / "diamond"
                / "special"
                / "from_layer1",
                project_root
                / "src"
                / "desktop"
                / "data"
                / "arrow_placement"
                / "box"
                / "special"
                / "from_layer1",
            ]

            for placement_dir in placement_dirs:
                g_file = placement_dir / "G_placements.json"
                if g_file.exists():
                    logger.info(f"SUCCESS: Found G placement file: {g_file}")

                    # Load and check content
                    import json

                    with open(g_file, "r") as f:
                        g_data = json.load(f)

                    if "G" in g_data:
                        g_letter_data = g_data["G"]
                        logger.info(
                            f"DEBUG: G file has {len(g_letter_data)} turn configurations"
                        )

                        # Check for specific turn configurations
                        sample_turns = list(g_letter_data.keys())[:3]
                        for turn_key in sample_turns:
                            turn_data = g_letter_data[turn_key]
                            logger.info(f"DEBUG: Turn '{turn_key}': {turn_data}")

                else:
                    logger.warning(f"WARNING: G placement file not found: {g_file}")

            return True

        except Exception as e:
            logger.error(f"ERROR: Special placement data loading test failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _test_letter_g_special_placement_lookup(self, container) -> bool:
        """Test special placement lookup specifically for letter G."""
        try:
            logger.info("DEBUG: Testing letter G special placement lookup...")

            # Get a real G pictograph
            from shared.application.services.data.dataset_query import IDatasetQuery

            dataset_query = container.resolve(IDatasetQuery)

            beat_data_list = dataset_query.find_pictographs_by_letter("G")
            if not beat_data_list:
                logger.error("ERROR: No G pictographs found in dataset")
                return False

            # Use first G pictograph
            beat_data = beat_data_list[0]
            if not beat_data.has_pictograph:
                logger.error("ERROR: First G beat data has no pictograph")
                return False

            pictograph_data = beat_data.pictograph_data
            logger.info(
                f"DEBUG: Testing G pictograph with letter: {pictograph_data.letter}"
            )

            # Get the special placement service
            from shared.application.services.positioning.arrows.placement.special_placement_service import (
                SpecialPlacementService,
            )

            special_service = container.resolve(SpecialPlacementService)

            # Test special placement lookup for each arrow
            for color in ["blue", "red"]:
                if color in pictograph_data.motions:
                    motion_data = pictograph_data.motions[color]
                    logger.info(
                        f"DEBUG: Testing {color} arrow special placement lookup"
                    )
                    logger.info(
                        f"DEBUG: Motion: {motion_data.motion_type.value} {motion_data.start_loc.value}→{motion_data.end_loc.value}"
                    )

                    # Try to get special adjustment
                    adjustment = special_service.get_special_adjustment(
                        motion_data, pictograph_data, color
                    )

                    if adjustment:
                        logger.info(
                            f"SUCCESS: {color} arrow has special adjustment: ({adjustment.x():.1f}, {adjustment.y():.1f})"
                        )
                    else:
                        logger.warning(
                            f"WARNING: {color} arrow has NO special adjustment - will use default"
                        )

            return True

        except Exception as e:
            logger.error(f"ERROR: Letter G special placement lookup test failed: {e}")
            import traceback

            traceback.print_exc()
            return False

    def _test_orientation_key_generation(self, container) -> bool:
        """Test orientation key generation for special placement."""
        try:
            logger.info("DEBUG: Testing orientation key generation...")

            # Get a real G pictograph
            from shared.application.services.data.dataset_query import IDatasetQuery

            dataset_query = container.resolve(IDatasetQuery)

            beat_data_list = dataset_query.find_pictographs_by_letter("G")
            if not beat_data_list:
                return False

            pictograph_data = beat_data_list[0].pictograph_data

            # Test orientation key generation
            from shared.application.services.positioning.arrows.placement.special_placement_ori_key_generator import (
                SpecialPlacementOriKeyGenerator,
            )

            try:
                ori_generator = container.resolve(SpecialPlacementOriKeyGenerator)
                logger.info("SUCCESS: Orientation key generator found in container")
            except:
                # Create manually if not in container
                ori_generator = SpecialPlacementOriKeyGenerator()
                logger.info("DEBUG: Created orientation key generator manually")

            # Generate orientation key for this pictograph
            for color in ["blue", "red"]:
                if color in pictograph_data.motions:
                    motion_data = pictograph_data.motions[color]

                    ori_key = ori_generator.generate_orientation_key(
                        motion_data, pictograph_data
                    )
                    logger.info(f"DEBUG: {color} motion orientation key: '{ori_key}'")

            return True

        except Exception as e:
            logger.error(f"ERROR: Orientation key generation test failed: {e}")
            import traceback

            traceback.print_exc()
            return False


def run_special_placement_debug_test() -> bool:
    """Run the special placement debug test."""
    test = SpecialPlacementDebugTest()
    return test.execute_test_logic()


if __name__ == "__main__":
    success = run_special_placement_debug_test()
    if not success:
        print("\nFAILED: SPECIAL PLACEMENT DEBUG TEST FAILED!")
        sys.exit(1)
    else:
        print("\nSUCCESS: SPECIAL PLACEMENT DEBUG TEST PASSED!")
        sys.exit(0)
