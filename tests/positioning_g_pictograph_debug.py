"""
G Pictograph Arrow Positioning Debug Test

This test specifically investigates the arrow positioning system for G pictographs
to identify why calculated positions aren't being applied to the UI arrows.

The test will:
1. Create G pictograph data (no turns variation)
2. Test the complete positioning pipeline
3. Verify calculations vs actual UI positioning
4. Identify where the disconnect occurs
"""

import logging
import os
import sys
import traceback
from typing import Any, Dict, Tuple

# Add src to path for imports
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), "..", "src", "desktop", "modern", "src")
)

from application.services.positioning.arrows.calculation.arrow_location_calculator import (
    ArrowLocationCalculatorService,
)
from application.services.positioning.arrows.calculation.arrow_rotation_calculator import (
    ArrowRotationCalculatorService,
)
from application.services.positioning.arrows.coordinate_system.arrow_coordinate_system_service import (
    ArrowCoordinateSystemService,
)
from application.services.positioning.arrows.orchestration.arrow_adjustment_calculator import (
    ArrowAdjustmentCalculator,
)

# Import positioning services directly
from application.services.positioning.arrows.orchestration.arrow_positioning_orchestrator import (
    ArrowPositioningOrchestrator,
)
from core.types.geometry import Point
from domain.models.arrow_data import ArrowData
from domain.models.enums import Location, MotionType, RotationDirection
from domain.models.motion_data import MotionData
from domain.models.pictograph_data import PictographData

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GPictographPositioningDebugger:
    """Debug tool for investigating G pictograph arrow positioning issues."""

    def __init__(self):
        """Initialize the debugger with necessary services."""
        # Create positioning services directly
        try:
            self.location_calculator = ArrowLocationCalculatorService()
            self.rotation_calculator = ArrowRotationCalculatorService()
            self.coordinate_system = ArrowCoordinateSystemService()

            # Create adjustment calculator (this might fail due to dependencies)
            try:
                self.adjustment_calculator = ArrowAdjustmentCalculator()
                logger.info("✅ Adjustment calculator loaded")
            except Exception as e:
                logger.warning(f"⚠️ Adjustment calculator failed, using fallback: {e}")
                self.adjustment_calculator = None

            # Create orchestrator
            if self.adjustment_calculator:
                self.orchestrator = ArrowPositioningOrchestrator(
                    location_calculator=self.location_calculator,
                    rotation_calculator=self.rotation_calculator,
                    adjustment_calculator=self.adjustment_calculator,
                    coordinate_system=self.coordinate_system,
                )
                logger.info("✅ Arrow positioning orchestrator created")
            else:
                self.orchestrator = None
                logger.warning("⚠️ Orchestrator not created due to missing dependencies")

        except Exception as e:
            logger.error(f"❌ Failed to create positioning services: {e}")
            self.orchestrator = None

    def get_g_pictograph_data(self) -> PictographData:
        """Get G pictograph data for testing."""
        # Create synthetic G data for testing
        logger.info("Creating synthetic G pictograph data for testing")
        return self._create_synthetic_g_data()

    def _create_synthetic_g_data(self) -> PictographData:
        """Create synthetic G pictograph data for testing."""
        # Create typical G motions (static arrows)
        blue_motion = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=0,
        )

        red_motion = MotionData(
            motion_type=MotionType.PRO,
            start_loc=Location.NORTH,
            end_loc=Location.EAST,
            prop_rot_dir=RotationDirection.CLOCKWISE,
            turns=0,
        )

        # Create arrow data
        blue_arrow = ArrowData(
            color="blue",
            turns=0,
            position_x=475.0,  # Default center
            position_y=475.0,  # Default center
            rotation_angle=0.0,
            is_visible=True,
        )

        red_arrow = ArrowData(
            color="red",
            turns=0,
            position_x=475.0,  # Default center
            position_y=475.0,  # Default center
            rotation_angle=0.0,
            is_visible=True,
        )

        return PictographData(
            letter="G",
            arrows={"blue": blue_arrow, "red": red_arrow},
            motions={"blue": blue_motion, "red": red_motion},
            props={},  # Empty for now
            glyph_data={},
        )

    def test_positioning_pipeline(
        self, pictograph_data: PictographData
    ) -> Dict[str, Any]:
        """Test the complete positioning pipeline for G pictograph."""
        results = {
            "success": False,
            "calculations": {},
            "errors": [],
            "pipeline_steps": {},
        }

        if not self.orchestrator:
            results["errors"].append("Arrow positioning orchestrator not available")
            return results

        try:
            logger.info("🧪 Testing positioning pipeline for G pictograph")

            # Test each arrow
            for color in ["blue", "red"]:
                if (
                    color not in pictograph_data.arrows
                    or color not in pictograph_data.motions
                ):
                    continue

                arrow_data = pictograph_data.arrows[color]
                motion_data = pictograph_data.motions[color]

                logger.info(f"Testing {color} arrow positioning...")

                # Step 1: Calculate position using orchestrator
                try:
                    x, y, rotation = self.orchestrator.calculate_arrow_position(
                        arrow_data, pictograph_data, motion_data
                    )

                    results["calculations"][color] = {
                        "calculated_x": x,
                        "calculated_y": y,
                        "calculated_rotation": rotation,
                        "original_x": arrow_data.position_x,
                        "original_y": arrow_data.position_y,
                        "original_rotation": arrow_data.rotation_angle,
                    }

                    logger.info(
                        f"✅ {color} arrow calculated position: ({x:.1f}, {y:.1f}, {rotation:.1f}°)"
                    )

                except Exception as e:
                    error_msg = f"Failed to calculate {color} arrow position: {e}"
                    results["errors"].append(error_msg)
                    logger.error(f"❌ {error_msg}")
                    traceback.print_exc()

            results["success"] = len(results["errors"]) == 0

        except Exception as e:
            error_msg = f"Pipeline test failed: {e}"
            results["errors"].append(error_msg)
            logger.error(f"❌ {error_msg}")
            traceback.print_exc()

        return results

    def debug_positioning_components(
        self, pictograph_data: PictographData
    ) -> Dict[str, Any]:
        """Debug individual positioning components."""
        debug_info = {
            "coordinate_system": {},
            "location_calculator": {},
            "rotation_calculator": {},
            "adjustment_calculator": {},
            "errors": [],
        }

        if not self.orchestrator:
            debug_info["errors"].append("Orchestrator not available")
            return debug_info

        try:
            # Get individual services from orchestrator
            coord_system = self.orchestrator.coordinate_system
            location_calc = self.orchestrator.location_calculator
            rotation_calc = self.orchestrator.rotation_calculator
            adjustment_calc = self.orchestrator.adjustment_calculator

            # Test each arrow's components
            for color in ["blue", "red"]:
                if color not in pictograph_data.motions:
                    continue

                motion_data = pictograph_data.motions[color]
                logger.info(f"🔍 Debugging {color} arrow components...")

                # Test location calculation
                try:
                    location = location_calc.calculate_location(
                        motion_data, pictograph_data
                    )
                    debug_info["location_calculator"][color] = {
                        "calculated_location": location.value,
                        "motion_type": motion_data.motion_type.value,
                        "start_location": motion_data.start_loc.value,
                        "end_location": motion_data.end_loc.value,
                    }
                    logger.info(f"  Location: {location.value}")
                except Exception as e:
                    debug_info["errors"].append(
                        f"Location calculation failed for {color}: {e}"
                    )

                # Test coordinate system
                try:
                    initial_pos = coord_system.get_initial_position(
                        motion_data, location
                    )
                    debug_info["coordinate_system"][color] = {
                        "initial_x": initial_pos.x,
                        "initial_y": initial_pos.y,
                        "motion_type": motion_data.motion_type.value,
                        "location": location.value,
                    }
                    logger.info(
                        f"  Initial position: ({initial_pos.x:.1f}, {initial_pos.y:.1f})"
                    )
                except Exception as e:
                    debug_info["errors"].append(
                        f"Coordinate system failed for {color}: {e}"
                    )

                # Test rotation calculation
                try:
                    rotation = rotation_calc.calculate_rotation(motion_data, location)
                    debug_info["rotation_calculator"][color] = {
                        "calculated_rotation": rotation,
                        "motion_type": motion_data.motion_type.value,
                        "location": location.value,
                    }
                    logger.info(f"  Rotation: {rotation:.1f}°")
                except Exception as e:
                    debug_info["errors"].append(
                        f"Rotation calculation failed for {color}: {e}"
                    )

                # Test adjustment calculation
                try:
                    adjustment = adjustment_calc.calculate_adjustment(
                        pictograph_data, motion_data, pictograph_data.letter, location
                    )
                    debug_info["adjustment_calculator"][color] = {
                        "adjustment_x": adjustment.x,
                        "adjustment_y": adjustment.y,
                        "letter": pictograph_data.letter,
                        "location": location.value,
                    }
                    logger.info(
                        f"  Adjustment: ({adjustment.x:.1f}, {adjustment.y:.1f})"
                    )
                except Exception as e:
                    debug_info["errors"].append(
                        f"Adjustment calculation failed for {color}: {e}"
                    )

        except Exception as e:
            debug_info["errors"].append(f"Component debugging failed: {e}")
            logger.error(f"❌ Component debugging failed: {e}")
            traceback.print_exc()

        return debug_info


def test_ui_position_application():
    """Test if calculated positions are actually applied to UI arrow items."""
    logger.info("🎯 Testing UI Position Application")

    try:
        # Import Qt components for UI testing
        from presentation.components.pictograph.graphics_items.arrow_item import (
            ArrowItem,
        )
        from PyQt6.QtWidgets import QApplication

        # Create QApplication if needed
        app = QApplication.instance()
        if not app:
            app = QApplication([])

        debugger = GPictographPositioningDebugger()
        pictograph_data = debugger.get_g_pictograph_data()

        # Test if arrow items get the correct positions
        logger.info("🔧 Testing arrow item positioning...")

        for color in ["blue", "red"]:
            if (
                color not in pictograph_data.arrows
                or color not in pictograph_data.motions
            ):
                continue

            arrow_data = pictograph_data.arrows[color]
            motion_data = pictograph_data.motions[color]

            # Calculate expected position
            expected_x, expected_y, expected_rotation = (
                debugger.orchestrator.calculate_arrow_position(
                    arrow_data, pictograph_data, motion_data
                )
            )

            # Create arrow item and test positioning
            try:
                arrow_item = ArrowItem(
                    arrow_color=color,
                    pictograph_data=pictograph_data,
                    positioning_orchestrator=debugger.orchestrator,
                )

                # Update arrow with motion data
                arrow_item.motion_data = motion_data
                arrow_item.update_arrow_position()

                # Get actual position from arrow item
                actual_transform = arrow_item.transform()
                actual_x = actual_transform.dx()
                actual_y = actual_transform.dy()

                logger.info(f"  {color.upper()} ARROW:")
                logger.info(
                    f"    Expected: ({expected_x:.1f}, {expected_y:.1f}, {expected_rotation:.1f}°)"
                )
                logger.info(f"    Actual UI: ({actual_x:.1f}, {actual_y:.1f})")

                # Check if positions match (within tolerance)
                tolerance = 1.0
                x_match = abs(actual_x - expected_x) <= tolerance
                y_match = abs(actual_y - expected_y) <= tolerance

                if x_match and y_match:
                    logger.info(f"    ✅ UI position MATCHES calculation")
                else:
                    logger.warning(f"    ⚠️  UI position DIFFERS from calculation")
                    logger.warning(
                        f"    Difference: ({actual_x - expected_x:.1f}, {actual_y - expected_y:.1f})"
                    )

            except Exception as e:
                logger.error(f"❌ Failed to test {color} arrow UI positioning: {e}")
                traceback.print_exc()

        return True

    except Exception as e:
        logger.error(f"❌ UI position test failed: {e}")
        traceback.print_exc()
        return False


def run_g_pictograph_debug():
    """Main function to run G pictograph positioning debug."""
    logger.info("🚀 Starting G Pictograph Arrow Positioning Debug")

    try:
        debugger = GPictographPositioningDebugger()

        # Get G pictograph data
        logger.info("📊 Loading G pictograph data...")
        pictograph_data = debugger.get_g_pictograph_data()

        logger.info(f"✅ Loaded pictograph: {pictograph_data.letter}")
        logger.info(f"  Arrows: {list(pictograph_data.arrows.keys())}")
        logger.info(f"  Motions: {list(pictograph_data.motions.keys())}")

        # Test positioning pipeline
        logger.info("\n🧪 Testing positioning pipeline...")
        pipeline_results = debugger.test_positioning_pipeline(pictograph_data)

        # Debug individual components
        logger.info("\n🔍 Debugging positioning components...")
        component_debug = debugger.debug_positioning_components(pictograph_data)

        # Test UI position application
        logger.info("\n🎯 Testing UI position application...")
        ui_test_success = test_ui_position_application()

        # Print comprehensive results
        logger.info("\n📋 COMPREHENSIVE RESULTS:")
        logger.info("=" * 50)

        logger.info("\n🎯 PIPELINE RESULTS:")
        if pipeline_results["success"]:
            logger.info("✅ Pipeline test PASSED")
            for color, calc in pipeline_results["calculations"].items():
                logger.info(f"  {color.upper()} ARROW:")
                logger.info(
                    f"    Original: ({calc['original_x']:.1f}, {calc['original_y']:.1f}, {calc['original_rotation']:.1f}°)"
                )
                logger.info(
                    f"    Calculated: ({calc['calculated_x']:.1f}, {calc['calculated_y']:.1f}, {calc['calculated_rotation']:.1f}°)"
                )

                # Check if positions changed
                pos_changed = (
                    abs(calc["calculated_x"] - calc["original_x"]) > 0.1
                    or abs(calc["calculated_y"] - calc["original_y"]) > 0.1
                    or abs(calc["calculated_rotation"] - calc["original_rotation"])
                    > 0.1
                )

                if pos_changed:
                    logger.info(f"    🔄 Position CHANGED (calculation working)")
                else:
                    logger.warning(f"    ⚠️  Position UNCHANGED (potential issue)")
        else:
            logger.error("❌ Pipeline test FAILED")
            for error in pipeline_results["errors"]:
                logger.error(f"  - {error}")

        logger.info("\n🔧 COMPONENT DEBUG:")
        if component_debug["errors"]:
            logger.error("❌ Component errors found:")
            for error in component_debug["errors"]:
                logger.error(f"  - {error}")
        else:
            logger.info("✅ All components working")

        # Print detailed component info
        for component, data in component_debug.items():
            if component != "errors" and data:
                logger.info(f"\n  {component.upper()}:")
                for color, info in data.items():
                    logger.info(f"    {color}: {info}")

        return {
            "success": pipeline_results["success"]
            and len(component_debug["errors"]) == 0,
            "pipeline_results": pipeline_results,
            "component_debug": component_debug,
        }

    except Exception as e:
        logger.error(f"❌ Debug test failed: {e}")
        traceback.print_exc()
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    results = run_g_pictograph_debug()

    if results["success"]:
        print("\n🎉 G Pictograph positioning debug completed successfully!")
    else:
        print("\n💥 G Pictograph positioning debug found issues!")
        if "error" in results:
            print(f"Error: {results['error']}")
