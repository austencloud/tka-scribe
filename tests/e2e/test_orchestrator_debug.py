"""
Debug Test for Arrow Positioning Orchestrator

This test specifically investigates why the orchestrator is producing
identical final positions despite receiving different adjustments.
"""

import logging
import sys
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from base_e2e_test import BaseE2ETest

logger = logging.getLogger(__name__)


class OrchestratorDebugTest(BaseE2ETest):
    """Debug test for arrow positioning orchestrator."""

    def __init__(self):
        super().__init__("Orchestrator Debug")

    def execute_test_logic(self) -> bool:
        """Execute the debug test logic."""
        try:
            logger.info("DEBUG: Starting orchestrator debug test...")

            # Setup application
            if not self.setup_application():
                return False

            if not self.find_construct_tab():
                return False

            # Debug orchestrator step by step
            return self._debug_orchestrator_step_by_step()

        except Exception as e:
            logger.error(f"DEBUG: Test failed: {e}")
            import traceback
            traceback.print_exc()
            return False

        finally:
            self.cleanup()

    def _debug_orchestrator_step_by_step(self) -> bool:
        """Debug the orchestrator calculation step by step."""
        try:
            logger.info("DEBUG: Investigating orchestrator step by step...")

            # Get DI container
            from desktop.modern.core.dependency_injection.di_container import get_container
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
            
            logger.info(f"DEBUG: Testing G pictograph with letter: {pictograph_data.letter}")

            # Get the orchestrator
            from desktop.modern.core.interfaces.positioning_services import IArrowPositioningOrchestrator
            orchestrator = container.resolve(IArrowPositioningOrchestrator)

            # Test each arrow separately
            for color in ['blue', 'red']:
                if color in pictograph_data.motions:
                    motion_data = pictograph_data.motions[color]
                    logger.info(f"DEBUG: === Testing {color} arrow ===")
                    
                    # Create arrow data
                    from desktop.modern.domain.models.arrow_data import ArrowData
                    arrow_data = ArrowData(color=color, is_visible=True)
                    
                    # Debug each step of the orchestrator
                    self._debug_orchestrator_calculation(orchestrator, arrow_data, pictograph_data, motion_data)

            return True

        except Exception as e:
            logger.error(f"ERROR: Orchestrator debug failed: {e}")
            import traceback
            traceback.print_exc()
            return False

    def _debug_orchestrator_calculation(self, orchestrator, arrow_data, pictograph_data, motion_data):
        """Debug the orchestrator calculation step by step."""
        try:
            color = arrow_data.color
            logger.info(f"DEBUG: === Orchestrator Calculation for {color} ===")
            
            # Step 1: Location calculation
            location = orchestrator.location_calculator.calculate_location(motion_data, pictograph_data)
            logger.info(f"DEBUG: Step 1 - Location: {location.value}")
            
            # Step 2: Initial position calculation
            initial_position = orchestrator.coordinate_system.get_initial_position(motion_data, location)
            logger.info(f"DEBUG: Step 2 - Initial position: ({initial_position.x:.1f}, {initial_position.y:.1f})")
            
            # Step 3: Rotation calculation
            rotation = orchestrator.rotation_calculator.calculate_rotation(motion_data, location)
            logger.info(f"DEBUG: Step 3 - Rotation: {rotation:.1f}°")
            
            # Step 4: Adjustment calculation
            letter = pictograph_data.letter
            adjustment = orchestrator.adjustment_calculator.calculate_adjustment(
                pictograph_data, motion_data, letter, location, arrow_data.color
            )
            logger.info(f"DEBUG: Step 4 - Adjustment: ({adjustment.x:.1f}, {adjustment.y:.1f})")
            
            # Step 5: Extract adjustment values
            adjustment_x, adjustment_y = orchestrator._extract_adjustment_values(adjustment)
            logger.info(f"DEBUG: Step 5 - Extracted adjustment: ({adjustment_x:.1f}, {adjustment_y:.1f})")
            
            # Step 6: Final position calculation
            final_x = initial_position.x + adjustment_x
            final_y = initial_position.y + adjustment_y
            logger.info(f"DEBUG: Step 6 - Final position: ({final_x:.1f}, {final_y:.1f})")
            
            # Step 7: Compare with orchestrator result
            orchestrator_x, orchestrator_y, orchestrator_rotation = orchestrator.calculate_arrow_position(
                arrow_data, pictograph_data, motion_data
            )
            logger.info(f"DEBUG: Step 7 - Orchestrator result: ({orchestrator_x:.1f}, {orchestrator_y:.1f}) rotation {orchestrator_rotation:.1f}°")
            
            # Check if they match
            if abs(final_x - orchestrator_x) < 0.1 and abs(final_y - orchestrator_y) < 0.1:
                logger.info(f"SUCCESS: Manual calculation matches orchestrator result for {color}")
            else:
                logger.warning(f"WARNING: Manual calculation differs from orchestrator result for {color}")
                logger.warning(f"  Manual: ({final_x:.1f}, {final_y:.1f})")
                logger.warning(f"  Orchestrator: ({orchestrator_x:.1f}, {orchestrator_y:.1f})")

        except Exception as e:
            logger.error(f"ERROR: Orchestrator calculation debug failed: {e}")
            import traceback
            traceback.print_exc()


def run_orchestrator_debug_test() -> bool:
    """Run the orchestrator debug test."""
    test = OrchestratorDebugTest()
    return test.execute_test_logic()


if __name__ == "__main__":
    success = run_orchestrator_debug_test()
    if not success:
        print("\nFAILED: ORCHESTRATOR DEBUG TEST FAILED!")
        sys.exit(1)
    else:
        print("\nSUCCESS: ORCHESTRATOR DEBUG TEST PASSED!")
        sys.exit(0)
