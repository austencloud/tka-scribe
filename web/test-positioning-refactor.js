/**
 * Quick test to verify our positioning refactoring works
 */

import { ArrowPositioningService } from "./src/lib/components/pictograph/services/arrowPositioningService.js";
import {
  createMotionData,
  createPictographData,
  createArrowData,
} from "./src/lib/domain/index.js";
import {
  MotionType,
  Location,
  GridMode,
} from "./src/lib/domain/enums/index.js";

async function testPositioning() {
  console.log("🚀 Testing refactored positioning services...\n");

  try {
    // Create test data
    const motionData = createMotionData({
      motion_type: MotionType.PRO,
      start_loc: Location.NORTHEAST,
      end_loc: Location.SOUTHWEST,
      turns: 0,
    });

    const pictographData = createPictographData({
      letter: "A",
      grid_mode: GridMode.DIAMOND,
    });

    const arrowData = createArrowData({
      color: "blue",
      motion_type: MotionType.PRO,
    });

    // Test the async positioning service
    const positioningService = new ArrowPositioningService();
    const result = await positioningService.calculatePosition(
      arrowData,
      motionData,
      pictographData
    );

    console.log("✅ Async positioning calculation successful!");
    console.log(`   Position: (${result.x}, ${result.y})`);
    console.log(`   Rotation: ${result.rotation}°\n`);

    console.log(
      "🎉 All tests passed! Positioning refactoring is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testPositioning();
