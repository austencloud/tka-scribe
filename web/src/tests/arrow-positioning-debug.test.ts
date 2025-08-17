/**
 * Focused test for debugging arrow positioning issues
 * Tests both positioning systems to identify rotation calculation problems
 */

import { describe, it } from "vitest";
import { resolve } from "$lib/services/bootstrap";

import {
  createPictographData,
  createGridData,
  createArrowData,
  createPropData,
  createMotionData,
} from "$lib/domain";
import {
  GridMode,
  MotionType,
  Location,
  Orientation,
  ArrowType,
} from "$lib/domain/enums";

describe("Arrow Positioning Debug Tests", () => {
  it("should test pro arrow rotation calculation - N to E motion", async () => {
    // Resolve services for this test
    const orchestrator = resolve("IArrowPositioningOrchestrator");
    const arrowService = resolve("IArrowPositioningService");

    console.log(
      "\n🧪 Testing Pro Arrow: N → E (should be clockwise, expect ~90° rotation)"
    );

    // Create test data for pro motion: N → E
    const blueArrowData = createArrowData({
      color: "blue",
      arrow_type: ArrowType.BLUE,
      motion_type: MotionType.PRO,
      start_orientation: Orientation.IN,
      end_orientation: Orientation.IN,
      turns: 0,
      position_x: 0,
      position_y: 0,
    });

    const blueMotionData = createMotionData({
      motion_type: MotionType.PRO,
      start_loc: Location.NORTH,
      end_loc: Location.EAST,
      turns: 0,
    });

    const redArrowData = createArrowData({
      color: "red",
      arrow_type: ArrowType.RED,
      motion_type: MotionType.STATIC,
      start_orientation: Orientation.IN,
      end_orientation: Orientation.IN,
      turns: 0,
      position_x: 0,
      position_y: 0,
    });

    const redMotionData = createMotionData({
      motion_type: MotionType.STATIC,
      start_loc: Location.SOUTH,
      end_loc: Location.SOUTH,
      turns: 0,
    });

    const pictographData = createPictographData({
      letter: "TEST",
      grid_data: createGridData({ mode: GridMode.DIAMOND }),
      arrows: {
        blue: blueArrowData,
        red: redArrowData,
      },
      props: {
        blue: createPropData({ color: "blue" }),
        red: createPropData({ color: "red" }),
      },
      motions: {
        blue: blueMotionData,
        red: redMotionData,
      },
    });

    console.log("📊 Input Data:");
    console.log("  Blue Motion:", {
      motion_type: blueMotionData.motion_type,
      start_loc: blueMotionData.start_loc,
      end_loc: blueMotionData.end_loc,
      turns: blueMotionData.turns,
    });

    // Test 1: ArrowPositioningOrchestrator.calculateAllArrowPositions
    console.log(
      "\n🎯 Test 1: ArrowPositioningOrchestrator.calculateAllArrowPositions"
    );
    const orchestratorResult =
      orchestrator.calculateAllArrowPositions(pictographData);
    const orchestratorBlueArrow = orchestratorResult.arrows?.blue;

    console.log("  Orchestrator Result:");
    console.log(
      "    Position:",
      `(${orchestratorBlueArrow?.position_x}, ${orchestratorBlueArrow?.position_y})`
    );
    console.log("    Rotation:", `${orchestratorBlueArrow?.rotation}°`);

    // Test 2: Individual ArrowPositioningService.calculateArrowPosition
    console.log("\n🎯 Test 2: ArrowPositioningService.calculateArrowPosition");
    const serviceResult = await arrowService.calculateArrowPosition(
      blueArrowData,
      pictographData,
      pictographData.grid_data
    );

    console.log("  Service Result:");
    console.log("    Position:", `(${serviceResult.x}, ${serviceResult.y})`);
    console.log("    Rotation:", `${serviceResult.rotation}°`);

    // Test 3: Direct orchestrator.calculateArrowPosition call
    console.log("\n🎯 Test 3: Direct orchestrator.calculateArrowPosition");
    const [x, y, rotation] = orchestrator.calculateArrowPosition(
      blueArrowData,
      pictographData,
      blueMotionData
    );

    console.log("  Direct Result:");
    console.log("    Position:", `(${x}, ${y})`);
    console.log("    Rotation:", `${rotation}°`);

    // Analysis
    console.log("\n📋 Analysis:");
    console.log("  Expected: Pro motion N→E should be ~90° (pointing east)");
    console.log("  User Report: Pro arrows are 90° too far clockwise");
    console.log(
      "  If correct rotation should be 90°, but we see 180°, then calculation is +90° off"
    );

    // Compare results
    const orchestratorRotation = orchestratorBlueArrow?.rotation || 0;
    const serviceRotation = serviceResult.rotation;
    const directRotation = rotation;

    console.log("\n🔍 Rotation Comparison:");
    console.log(
      `  Orchestrator (calculateAllArrowPositions): ${orchestratorRotation}°`
    );
    console.log(`  Service (calculatePosition): ${serviceRotation}°`);
    console.log(`  Direct (calculateArrowPosition): ${directRotation}°`);

    if (
      orchestratorRotation === serviceRotation &&
      serviceRotation === directRotation
    ) {
      console.log(
        "  ✅ All methods return same rotation - issue is in core calculation"
      );
    } else {
      console.log(
        "  ❌ Methods return different rotations - architectural inconsistency"
      );
    }

    // Expected vs Actual
    const expectedRotation = 90; // N→E should point east (90°)
    const actualRotation = serviceRotation;
    const rotationDiff = actualRotation - expectedRotation;

    console.log("\n🎯 Rotation Analysis:");
    console.log(`  Expected rotation: ${expectedRotation}° (pointing east)`);
    console.log(`  Actual rotation: ${actualRotation}°`);
    console.log(
      `  Difference: ${rotationDiff}° ${rotationDiff > 0 ? "(too far clockwise)" : "(too far counter-clockwise)"}`
    );

    if (Math.abs(rotationDiff) === 90) {
      console.log("  🚨 CONFIRMED: Rotation is exactly 90° off!");
    }
  });

  it("should test multiple pro arrow directions", async () => {
    // Resolve services for this test
    const arrowService = resolve("IArrowPositioningService");

    console.log("\n🧪 Testing Multiple Pro Arrow Directions");

    const testCases = [
      { start: Location.NORTH, end: Location.EAST, expected: 90, name: "N→E" },
      { start: Location.EAST, end: Location.SOUTH, expected: 180, name: "E→S" },
      { start: Location.SOUTH, end: Location.WEST, expected: 270, name: "S→W" },
      { start: Location.WEST, end: Location.NORTH, expected: 0, name: "W→N" },
    ];

    for (const testCase of testCases) {
      console.log(`\n📐 Testing ${testCase.name}:`);

      const motionData = createMotionData({
        motion_type: MotionType.PRO,
        start_loc: testCase.start,
        end_loc: testCase.end,
        turns: 0,
      });

      const arrowData = createArrowData({
        color: "blue",
        arrow_type: ArrowType.BLUE,
        motion_type: MotionType.PRO,
        start_orientation: Orientation.IN,
        end_orientation: Orientation.IN,
        turns: 0,
      });

      const pictographData = createPictographData({
        letter: "TEST",
        grid_data: createGridData({ mode: GridMode.DIAMOND }),
        arrows: { blue: arrowData },
        motions: { blue: motionData },
      });

      const result = await arrowService.calculateArrowPosition(
        arrowData,
        pictographData,
        pictographData.grid_data
      );

      console.log(`  Motion: ${testCase.start} → ${testCase.end}`);
      console.log(`  Expected rotation: ${testCase.expected}°`);
      console.log(`  Actual rotation: ${result.rotation}°`);
      console.log(`  Difference: ${result.rotation - testCase.expected}°`);
    }
  });
});
