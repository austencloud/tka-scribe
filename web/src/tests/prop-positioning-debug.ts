/**
 * Prop Positioning Debug Test
 *
 * This test verifies that:
 * 1. CSV data is correctly converted to PictographData with proper PropData
 * 2. Beta detection works correctly based on endPosition
 * 3. Props receive the correct positioning data
 */

import { PictographTransformationService } from "$lib/services/implementations/data/PictographTransformationService";
import { EnumMappingService } from "$lib/services/implementations/data/EnumMappingService";
import { endsWithBeta } from "$lib/utils/betaDetection";

// Create test CSV rows
const testRows = [
  // Non-beta test case
  {
    letter: "A",
    startPosition: "alpha1",
    endPosition: "alpha3", // NOT beta
    blueMotionType: "pro",
    redMotionType: "anti",
    blueRotationDirection: "cw",
    redRotationDirection: "ccw",
    blueStartLocation: "n",
    blueEndLocation: "s",
    redStartLocation: "e",
    redEndLocation: "w",
  },
  // Beta test case
  {
    letter: "B",
    startPosition: "alpha1",
    endPosition: "beta2", // IS beta
    blueMotionType: "pro",
    redMotionType: "anti",
    blueRotationDirection: "cw",
    redRotationDirection: "ccw",
    blueStartLocation: "n",
    blueEndLocation: "s",
    redStartLocation: "e",
    redEndLocation: "s", // Same as blue - should trigger beta positioning
  },
];

function runPropPositioningTest() {
  console.log("🧪 Starting Prop Positioning Debug Test");

  const enumMappingService = new EnumMappingService();
  const transformationService = new PictographTransformationService(
    enumMappingService
  );

  testRows.forEach((row, index) => {
    console.log(`\n📋 Test ${index + 1}: Letter ${row.letter}`);
    console.log("📥 Input CSV Row:", row);

    // Convert CSV to PictographData
    const pictographData = transformationService.convertCsvRowToPictographData(
      row,
      "diamond",
      index
    );

    if (!pictographData) {
      console.error("❌ Failed to create pictograph data");
      return;
    }

    // Check beta detection
    const isEndsWithBeta = endsWithBeta(pictographData);
    console.log(`🔍 Beta Detection:`, {
      endPosition: pictographData.endPosition,
      endsWithBeta: isEndsWithBeta,
      expectedBeta: row.endPosition.startsWith("beta"),
    });

    // Check motion data
    console.log("🎯 Motions:", {
      blue: {
        startLocation: pictographData.motions?.blue?.startLocation,
        endLocation: pictographData.motions?.blue?.endLocation,
        rotationDirection: pictographData.motions?.blue?.rotationDirection,
      },
      red: {
        startLocation: pictographData.motions?.red?.startLocation,
        endLocation: pictographData.motions?.red?.endLocation,
        rotationDirection: pictographData.motions?.red?.rotationDirection,
      },
    });

    // Check prop data
    console.log("🎭 Props:", {
      blue: {
        location: pictographData.props?.blue?.location,
        orientation: pictographData.props?.blue?.orientation,
        rotationDirection: pictographData.props?.blue?.rotationDirection,
        isVisible: pictographData.props?.blue?.isVisible,
      },
      red: {
        location: pictographData.props?.red?.location,
        orientation: pictographData.props?.red?.orientation,
        rotationDirection: pictographData.props?.red?.rotationDirection,
        isVisible: pictographData.props?.red?.isVisible,
      },
    });

    // Validate expected behavior
    if (row.endPosition.startsWith("beta") !== isEndsWithBeta) {
      console.error("❌ Beta detection mismatch!");
    } else {
      console.log("✅ Beta detection correct");
    }

    // Check if props have motion data
    const blueHasLocation = pictographData.props?.blue?.location !== null;
    const redHasLocation = pictographData.props?.red?.location !== null;

    if (!blueHasLocation || !redHasLocation) {
      console.error("❌ Props missing location data!");
    } else {
      console.log("✅ Props have location data");
    }

    console.log("─".repeat(50));
  });
}

// Run the test
if (typeof window === "undefined") {
  // Node.js environment
  runPropPositioningTest();
} else {
  // Browser environment - attach to window for manual testing
  interface WindowWithTest extends Window {
    runPropPositioningTest?: () => void;
  }
  (window as unknown as WindowWithTest).runPropPositioningTest =
    runPropPositioningTest;
  console.log(
    "🔧 Prop positioning test available as window.runPropPositioningTest()"
  );
}

export { runPropPositioningTest };
