/**
 * Standalone Motion Primitive Generator
 *
 * Pre-computes all possible motion paths with ZERO dependencies.
 * Reimplements core motion math to avoid Svelte/DI import issues.
 *
 * Run with: npx tsx scripts/generate-motion-primitives-standalone.ts
 */

import { writeFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// TYPE DEFINITIONS (copied from source, no imports!)
// ============================================================================

enum MotionType {
  PRO = "pro",
  ANTI = "anti",
  FLOAT = "float",
  DASH = "dash",
  STATIC = "static",
}

enum GridLocation {
  NORTH = "n",
  EAST = "e",
  SOUTH = "s",
  WEST = "w",
  NORTHEAST = "ne",
  SOUTHEAST = "se",
  SOUTHWEST = "sw",
  NORTHWEST = "nw",
}

enum RotationDirection {
  CLOCKWISE = "cw",
  COUNTER_CLOCKWISE = "ccw",
  NO_ROTATION = "noRotation",
}

enum Orientation {
  IN = "in",
  OUT = "out",
  CLOCK = "clock",
  COUNTER = "counter",
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PI = Math.PI;
const TWO_PI = 2 * PI;
const HALF_PI = PI / 2;

const VIEWBOX_SIZE = 950;
const GRID_HALFWAY_POINT_OFFSET = 150;
const INWARD_FACTOR = 0.95;
const POINTS_PER_BEAT = 500; // Dense enough for perfect smoothness, small enough to save!
const PROP_WIDTH = 120;

// Grid location angles (matching LOCATION_ANGLES from source)
const LOCATION_ANGLES: Record<GridLocation, number> = {
  [GridLocation.NORTH]: 0,
  [GridLocation.NORTHEAST]: HALF_PI / 2,
  [GridLocation.EAST]: HALF_PI,
  [GridLocation.SOUTHEAST]: HALF_PI + HALF_PI / 2,
  [GridLocation.SOUTH]: PI,
  [GridLocation.SOUTHWEST]: PI + HALF_PI / 2,
  [GridLocation.WEST]: PI + HALF_PI,
  [GridLocation.NORTHWEST]: TWO_PI - HALF_PI / 2,
};

// ============================================================================
// INTERFACES
// ============================================================================

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

// ============================================================================
// MATH UTILITIES
// ============================================================================

function normalizeAnglePositive(angle: number): number {
  const norm = angle % TWO_PI;
  return norm < 0 ? norm + TWO_PI : norm;
}

function normalizeAngleSigned(angle: number): number {
  const norm = normalizeAnglePositive(angle);
  return norm > PI ? norm - TWO_PI : norm;
}

function lerpAngle(start: number, end: number, progress: number): number {
  const delta = normalizeAngleSigned(end - start);
  return normalizeAnglePositive(start + delta * progress);
}

function mapPositionToAngle(location: GridLocation): number {
  return LOCATION_ANGLES[location] || 0;
}

function mapOrientationToAngle(orientation: Orientation, centerAngle: number): number {
  switch (orientation) {
    case Orientation.IN:
      return normalizeAnglePositive(centerAngle + PI);
    case Orientation.OUT:
      return normalizeAnglePositive(centerAngle);
    case Orientation.CLOCK:
      return normalizeAnglePositive(centerAngle + HALF_PI);
    case Orientation.COUNTER:
      return normalizeAnglePositive(centerAngle - HALF_PI);
    default:
      return centerAngle;
  }
}

// ============================================================================
// MOTION ENDPOINT CALCULATION
// ============================================================================

function calculateMotionEndpoints(
  motionType: MotionType,
  startLocation: GridLocation,
  endLocation: GridLocation,
  turns: number,
  rotationDirection: RotationDirection
): {
  startCenterAngle: number;
  targetCenterAngle: number;
  startStaffAngle: number;
  staffRotationDelta: number;
} {
  const startCenterAngle = mapPositionToAngle(startLocation);
  const startStaffAngle = mapOrientationToAngle(Orientation.IN, startCenterAngle);
  const targetCenterAngle = mapPositionToAngle(endLocation);

  let staffRotationDelta: number;

  switch (motionType) {
    case MotionType.PRO: {
      const centerMovement = normalizeAngleSigned(targetCenterAngle - startCenterAngle);
      const dir = rotationDirection === RotationDirection.COUNTER_CLOCKWISE ? -1 : 1;
      const propRotation = dir * turns * PI;
      const staffMovement = centerMovement; // PRO: same direction
      staffRotationDelta = staffMovement + propRotation;
      break;
    }
    case MotionType.ANTI: {
      const centerMovement = normalizeAngleSigned(targetCenterAngle - startCenterAngle);
      const dir = rotationDirection === RotationDirection.COUNTER_CLOCKWISE ? -1 : 1;
      const propRotation = dir * turns * PI;
      const staffMovement = -centerMovement; // ANTI: opposite direction
      staffRotationDelta = staffMovement + propRotation;
      break;
    }
    case MotionType.FLOAT:
    case MotionType.DASH:
    case MotionType.STATIC:
    default: {
      // FLOAT/DASH/STATIC: Calculate based on turns only
      const dir = rotationDirection === RotationDirection.COUNTER_CLOCKWISE ? -1 : 1;
      staffRotationDelta = dir * turns * PI;
      break;
    }
  }

  return { startCenterAngle, targetCenterAngle, startStaffAngle, staffRotationDelta };
}

// ============================================================================
// PRIMITIVE GENERATION
// ============================================================================

function calculatePropEndpoint(
  centerAngle: number,
  staffAngle: number,
  endType: 0 | 1,
  x?: number,
  y?: number
): Point2D {
  const centerX = VIEWBOX_SIZE / 2;
  const centerY = VIEWBOX_SIZE / 2;
  const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET;

  let propCenterX: number;
  let propCenterY: number;

  if (x !== undefined && y !== undefined) {
    // Cartesian (DASH)
    propCenterX = centerX + x * scaledHalfwayRadius * INWARD_FACTOR;
    propCenterY = centerY + y * scaledHalfwayRadius * INWARD_FACTOR;
  } else {
    // Polar (circular motions)
    propCenterX = centerX + Math.cos(centerAngle) * scaledHalfwayRadius * INWARD_FACTOR;
    propCenterY = centerY + Math.sin(centerAngle) * scaledHalfwayRadius * INWARD_FACTOR;
  }

  const staffHalfWidth = PROP_WIDTH / 2;
  const staffEndOffset = endType === 1 ? staffHalfWidth : -staffHalfWidth;

  return {
    x: propCenterX + Math.cos(staffAngle) * staffEndOffset,
    y: propCenterY + Math.sin(staffAngle) * staffEndOffset,
  };
}

function generateMotionPrimitive(
  motionType: MotionType,
  startLocation: GridLocation,
  endLocation: GridLocation,
  turns: number,
  rotationDirection: RotationDirection
): MotionPrimitive {
  const endpoints = calculateMotionEndpoints(
    motionType,
    startLocation,
    endLocation,
    turns,
    rotationDirection
  );

  const points: Point2D[] = [];

  for (let i = 0; i <= POINTS_PER_BEAT; i++) {
    const progress = i / POINTS_PER_BEAT;

    let centerAngle: number;
    let staffAngle: number;
    let cartesianX: number | undefined;
    let cartesianY: number | undefined;

    if (motionType === MotionType.DASH) {
      // DASH: Straight line through center
      const startX = Math.cos(endpoints.startCenterAngle);
      const startY = Math.sin(endpoints.startCenterAngle);
      const endX = Math.cos(endpoints.targetCenterAngle);
      const endY = Math.sin(endpoints.targetCenterAngle);

      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;

      centerAngle = Math.atan2(currentY, currentX);
      staffAngle = normalizeAnglePositive(
        endpoints.startStaffAngle + endpoints.staffRotationDelta * progress
      );
      cartesianX = currentX;
      cartesianY = currentY;
    } else {
      // Circular motions
      centerAngle = lerpAngle(
        endpoints.startCenterAngle,
        endpoints.targetCenterAngle,
        progress
      );
      staffAngle = normalizeAnglePositive(
        endpoints.startStaffAngle + endpoints.staffRotationDelta * progress
      );
    }

    const endpoint = calculatePropEndpoint(
      centerAngle,
      staffAngle,
      1, // right end (tip)
      cartesianX,
      cartesianY
    );

    points.push(endpoint);
  }

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

// ============================================================================
// MAIN GENERATOR
// ============================================================================

async function generateAllPrimitives(): Promise<void> {
  console.log("🚀 Generating motion primitives (standalone)...\n");

  const primitives: MotionPrimitive[] = [];

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

  const turnValues = [-4, -3.5, -3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const motionTypes = [MotionType.PRO, MotionType.ANTI, MotionType.FLOAT, MotionType.DASH, MotionType.STATIC];

  let totalGenerated = 0;

  for (const motionType of motionTypes) {
    console.log(`📊 Processing ${motionType.toUpperCase()}...`);
    const startCount = primitives.length;

    for (const startLoc of locations) {
      for (const endLoc of locations) {
        if (motionType !== MotionType.STATIC && startLoc === endLoc) continue;

        if (motionType === MotionType.STATIC) {
          if (startLoc !== endLoc) continue;

          const primitive = generateMotionPrimitive(
            motionType,
            startLoc,
            endLoc,
            0,
            RotationDirection.NO_ROTATION
          );
          primitives.push(primitive);
          totalGenerated++;
        } else if (motionType === MotionType.DASH) {
          for (const turns of turnValues) {
            const primitive = generateMotionPrimitive(
              motionType,
              startLoc,
              endLoc,
              turns,
              RotationDirection.CLOCKWISE
            );
            primitives.push(primitive);
            totalGenerated++;
          }
        } else if (motionType === MotionType.FLOAT) {
          const primitive = generateMotionPrimitive(
            motionType,
            startLoc,
            endLoc,
            0,
            RotationDirection.NO_ROTATION
          );
          primitives.push(primitive);
          totalGenerated++;
        } else {
          // PRO/ANTI: All turns + both rotation directions
          for (const turns of turnValues) {
            for (const rotDir of [RotationDirection.CLOCKWISE, RotationDirection.COUNTER_CLOCKWISE]) {
              const primitive = generateMotionPrimitive(
                motionType,
                startLoc,
                endLoc,
                turns,
                rotDir
              );
              primitives.push(primitive);
              totalGenerated++;
            }
          }
        }
      }
    }

    console.log(`   ✅ Generated ${primitives.length - startCount} primitives for ${motionType}`);
  }

  console.log(`\n✨ Total primitives generated: ${primitives.length}`);
  console.log(`📦 Estimated size: ${((primitives.length * POINTS_PER_BEAT * 16) / 1024 / 1024).toFixed(2)} MB\n`);

  // Save to JSON
  const outputPath = resolve(__dirname, "../src/lib/data/motion-primitives.json");
  const data = {
    version: "1.0.0",
    generated: new Date().toISOString(),
    config: {
      pointsPerBeat: POINTS_PER_BEAT,
      viewboxSize: VIEWBOX_SIZE,
      propWidth: PROP_WIDTH,
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

// Run it!
generateAllPrimitives().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
