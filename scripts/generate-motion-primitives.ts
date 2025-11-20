/**
 * Motion Primitive Generator
 *
 * Pre-computes all possible motion paths as high-density point arrays.
 * These primitives provide perfect, gap-free trail rendering regardless of device performance.
 *
 * Run with: npx tsx scripts/generate-motion-primitives.ts
 */

import { writeFile } from "fs/promises";
import { resolve } from "path";
import {
  GridLocation,
  GridMode,
} from "../src/lib/shared/pictograph/grid/domain/enums/grid-enums";
import {
  MotionColor,
  MotionType,
  Orientation,
  RotationDirection,
} from "../src/lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { PropType } from "../src/lib/shared/pictograph/prop/domain/enums/PropType";
import { AngleCalculator } from "../src/lib/modules/animate/services/implementations/AngleCalculator";
import { EndpointCalculator } from "../src/lib/modules/animate/services/implementations/EndpointCalculator";
import { MotionCalculator } from "../src/lib/modules/animate/services/implementations/MotionCalculator";
import type { IEndpointCalculator } from "../src/lib/modules/animate/services/contracts/IEndpointCalculator";
import type { IAngleCalculator } from "../src/lib/modules/animate/services/contracts/IAngleCalculator";
import type { MotionData } from "../src/lib/shared/pictograph/shared/domain/models/MotionData";

// Constants
const VIEWBOX_SIZE = 950;
const GRID_HALFWAY_POINT_OFFSET = 150;
const INWARD_FACTOR = 0.95;
const POINTS_PER_BEAT = 2000; // Ultra-dense for perfect smoothness
const PROP_WIDTH = 120; // Standard staff width
const PROP_HEIGHT = 15; // Standard staff height

interface Point2D {
  x: number;
  y: number;
}

interface MotionPrimitive {
  key: string;
  motionType: MotionType;
  turns: number;
  rotationDirection: RotationDirection;
  startLocation: GridLocation;
  endLocation: GridLocation;
  points: Point2D[];
  metadata: {
    pointCount: number;
    samplingRate: number;
  };
}

/**
 * Calculate prop endpoint position in standard 950x950 coordinate space
 */
function calculatePropEndpoint(
  centerAngle: number,
  staffAngle: number,
  endType: 0 | 1, // 0 = left, 1 = right
  x?: number, // For DASH motions
  y?: number
): Point2D {
  const centerX = VIEWBOX_SIZE / 2;
  const centerY = VIEWBOX_SIZE / 2;
  const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET;

  let propCenterX: number;
  let propCenterY: number;

  if (x !== undefined && y !== undefined) {
    // Cartesian coordinates (DASH motions)
    propCenterX = centerX + x * scaledHalfwayRadius * INWARD_FACTOR;
    propCenterY = centerY + y * scaledHalfwayRadius * INWARD_FACTOR;
  } else {
    // Polar coordinates (circular motions)
    propCenterX =
      centerX + Math.cos(centerAngle) * scaledHalfwayRadius * INWARD_FACTOR;
    propCenterY =
      centerY + Math.sin(centerAngle) * scaledHalfwayRadius * INWARD_FACTOR;
  }

  // Calculate endpoint based on staff rotation
  const staffHalfWidth = PROP_WIDTH / 2;
  const staffEndOffset = endType === 1 ? staffHalfWidth : -staffHalfWidth;

  const endpointX = propCenterX + Math.cos(staffAngle) * staffEndOffset;
  const endpointY = propCenterY + Math.sin(staffAngle) * staffEndOffset;

  return { x: endpointX, y: endpointY };
}

/**
 * Generate motion primitive for a specific configuration
 */
async function generateMotionPrimitive(
  motionType: MotionType,
  turns: number,
  rotationDirection: RotationDirection,
  startLocation: GridLocation,
  endLocation: GridLocation,
  endpointCalculator: IEndpointCalculator,
  angleCalculator: IAngleCalculator
): Promise<MotionPrimitive> {
  // Create motion data manually (avoiding factory that imports Svelte components)
  const motionData: MotionData = {
    motionType,
    turns,
    rotationDirection,
    startLocation,
    endLocation,
    startOrientation: Orientation.IN,
    endOrientation: Orientation.IN, // Will be calculated
    color: MotionColor.BLUE,
    gridMode: GridMode.DIAMOND,
    isVisible: true,
    propType: PropType.STAFF,
    arrowLocation: GridLocation.NORTH,
    arrowPlacementData: {} as any, // Not needed for endpoint calculation
    propPlacementData: {} as any, // Not needed for endpoint calculation
    prefloatMotionType: null,
    prefloatRotationDirection: null,
  };

  // Calculate endpoints
  const endpoints = endpointCalculator.calculateMotionEndpoints(motionData);

  // Generate ultra-dense points
  const points: Point2D[] = [];

  for (let i = 0; i <= POINTS_PER_BEAT; i++) {
    const progress = i / POINTS_PER_BEAT; // 0.0 to 1.0

    // Interpolate prop state (matching PropInterpolator logic)
    let centerAngle: number;
    let staffAngle: number;
    let cartesianX: number | undefined;
    let cartesianY: number | undefined;

    if (motionType === MotionType.DASH) {
      // DASH: Cartesian interpolation (straight line through center)
      const startX = Math.cos(endpoints.startCenterAngle);
      const startY = Math.sin(endpoints.startCenterAngle);
      const endX = Math.cos(endpoints.targetCenterAngle);
      const endY = Math.sin(endpoints.targetCenterAngle);

      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;

      centerAngle = Math.atan2(currentY, currentX);
      staffAngle = angleCalculator.normalizeAnglePositive(
        endpoints.startStaffAngle + endpoints.staffRotationDelta * progress
      );
      cartesianX = currentX;
      cartesianY = currentY;
    } else {
      // PRO/ANTI/FLOAT/STATIC: Circular interpolation
      centerAngle = angleCalculator.lerpAngle(
        endpoints.startCenterAngle,
        endpoints.targetCenterAngle,
        progress
      );
      staffAngle = angleCalculator.normalizeAnglePositive(
        endpoints.startStaffAngle + endpoints.staffRotationDelta * progress
      );
    }

    // Calculate endpoint position (right end / tip by default)
    const endpoint = calculatePropEndpoint(
      centerAngle,
      staffAngle,
      1, // right end (tip)
      cartesianX,
      cartesianY
    );

    points.push(endpoint);
  }

  // Generate unique key
  const key = `${motionType}-${startLocation}-${endLocation}-${turns}-${rotationDirection}`;

  return {
    key,
    motionType,
    turns,
    rotationDirection,
    startLocation,
    endLocation,
    points,
    metadata: {
      pointCount: points.length,
      samplingRate: POINTS_PER_BEAT,
    },
  };
}

/**
 * Generate all motion primitives
 */
async function generateAllPrimitives(): Promise<void> {
  console.log("🚀 Generating motion primitives...\n");

  // Initialize services manually (avoiding DI container with Svelte imports)
  const angleCalculator = new AngleCalculator();
  const motionCalculator = new MotionCalculator(angleCalculator);
  const endpointCalculator = new EndpointCalculator(
    angleCalculator,
    motionCalculator
  );

  const primitives: MotionPrimitive[] = [];

  // All grid locations
  const locations = [
    GridLocation.NORTH,
    GridLocation.EAST,
    GridLocation.SOUTH,
    GridLocation.WEST,
    GridLocation.NORTHEAST,
    GridLocation.SOUTHEAST,
    GridLocation.SOUTHWEST,
    GridLocation.NORTHWEST,
  ];

  // Common turn values (including fractional turns)
  const turnValues = [
    -4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4,
  ];

  // Motion types to process
  const motionTypes = [
    MotionType.PRO,
    MotionType.ANTI,
    MotionType.FLOAT,
    MotionType.DASH,
    MotionType.STATIC,
  ];

  let totalGenerated = 0;

  for (const motionType of motionTypes) {
    console.log(`📊 Processing ${motionType.toUpperCase()}...`);

    for (const startLoc of locations) {
      for (const endLoc of locations) {
        // Skip same start/end for non-STATIC motions
        if (motionType !== MotionType.STATIC && startLoc === endLoc) continue;

        if (motionType === MotionType.STATIC) {
          // STATIC: Only one primitive per location (no turns/rotation)
          if (startLoc !== endLoc) continue; // Only process when start === end

          const primitive = await generateMotionPrimitive(
            motionType,
            0,
            RotationDirection.NO_ROTATION,
            startLoc,
            endLoc,
            endpointCalculator,
            angleCalculator
          );
          primitives.push(primitive);
          totalGenerated++;
        } else if (motionType === MotionType.DASH) {
          // DASH: Various turns, but rotation direction doesn't affect path shape
          for (const turns of turnValues) {
            const primitive = await generateMotionPrimitive(
              motionType,
              turns,
              RotationDirection.CLOCKWISE, // Arbitrary (doesn't affect DASH path)
              startLoc,
              endLoc,
              endpointCalculator,
              angleCalculator
            );
            primitives.push(primitive);
            totalGenerated++;
          }
        } else if (motionType === MotionType.FLOAT) {
          // FLOAT: Typically uses 'fl' for turns, but we'll generate with 0
          const primitive = await generateMotionPrimitive(
            motionType,
            0,
            RotationDirection.NO_ROTATION,
            startLoc,
            endLoc,
            endpointCalculator,
            angleCalculator
          );
          primitives.push(primitive);
          totalGenerated++;
        } else {
          // PRO/ANTI: All turn values and both rotation directions
          for (const turns of turnValues) {
            for (const rotDir of [
              RotationDirection.CLOCKWISE,
              RotationDirection.COUNTER_CLOCKWISE,
            ]) {
              const primitive = await generateMotionPrimitive(
                motionType,
                turns,
                rotDir,
                startLoc,
                endLoc,
                endpointCalculator,
                angleCalculator
              );
              primitives.push(primitive);
              totalGenerated++;
            }
          }
        }
      }
    }

    console.log(
      `   ✅ Generated ${totalGenerated} primitives for ${motionType}`
    );
  }

  console.log(`\n✨ Total primitives generated: ${primitives.length}`);
  console.log(
    `📦 Estimated size: ${((primitives.length * POINTS_PER_BEAT * 16) / 1024 / 1024).toFixed(2)} MB\n`
  );

  // Save to JSON file
  const outputPath = resolve(
    __dirname,
    "../src/lib/data/motion-primitives.json"
  );
  const data = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    config: {
      pointsPerBeat: POINTS_PER_BEAT,
      viewboxSize: VIEWBOX_SIZE,
      propWidth: PROP_WIDTH,
      propHeight: PROP_HEIGHT,
    },
    primitives: primitives.map((p) => ({
      key: p.key,
      motionType: p.motionType,
      turns: p.turns,
      rotationDirection: p.rotationDirection,
      startLocation: p.startLocation,
      endLocation: p.endLocation,
      points: p.points,
      metadata: p.metadata,
    })),
  };

  await writeFile(outputPath, JSON.stringify(data, null, 2), "utf-8");

  console.log(`💾 Saved to: ${outputPath}`);
  console.log(`\n🎉 Motion primitive generation complete!`);
}

// Run the generator
generateAllPrimitives().catch((error) => {
  console.error("❌ Error generating primitives:", error);
  process.exit(1);
});
