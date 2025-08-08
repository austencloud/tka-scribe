// src/lib/components/objects/Arrow/ArrowPlacementManager/utils/adjustmentCalculator.ts
import type { ArrowData } from '$lib/components/objects/Arrow/ArrowData';
import type { ArrowPlacementConfig, Coordinates } from '../types';
import type { Motion } from '$lib/components/objects/Motion/Motion';
import { getDefaultAdjustment } from './defaultPlacementUtils';
import { getDirectionTuples, getQuadrantIndex } from './directionUtils';
import { getSpecialAdjustment } from './specialPlacementUtils';
import type { ShiftHandRotDir } from '$lib/types/Types';

/**
 * Calculates position adjustments for an arrow based on its properties
 * and the pictograph configuration.
 * This function precisely matches the Python ArrowAdjustmentCalculator's behavior.
 */
export function calculateAdjustment(arrow: ArrowData, config: ArrowPlacementConfig): Coordinates {
  const { pictographData } = config;

  console.log(`🔧 calculateAdjustment: ${arrow.color} arrow, letter: ${pictographData.letter}`);

  // No adjustments needed if no letter is set (matches Python's check)
  if (!pictographData.letter) {
    console.log(`   No letter set, returning (0, 0)`);
    return { x: 0, y: 0 };
  }

  // Ensure prop data exists for orientation detection
  ensurePropDataExists(pictographData);

  // 1. Try to get special adjustment first (matches Python's flow)
  const specialAdjustment = getSpecialAdjustment(arrow, config);
  console.log(`   Special adjustment: ${specialAdjustment ? `[${specialAdjustment[0]}, ${specialAdjustment[1]}]` : 'none'}`);

  // 2. Get base adjustment values - either from special placement or default
  let x: number, y: number;
  if (specialAdjustment) {
    [x, y] = specialAdjustment;

  } else {
    // Fall back to default adjustment (matches Python behavior)
    [x, y] = getDefaultAdjustment(arrow, config);
    console.log(`   Default adjustment: [${x}, ${y}]`);
  }

  // 3. Get the motion object (matches Python behavior)
  const motion = getMotionForArrow(arrow, pictographData);
  if (!motion) {
    return { x, y }; // Return base adjustment if no motion found
  }

  // 4. Generate directional tuples (matches Python's DirectionalTupleGenerator)
  const directionalAdjustments = getDirectionTuples(
    x,
    y,
    motion.motionType,
    motion.propRotDir,
    motion.gridMode || 'diamond',
    {
      startOri: motion.startOri,
      handRotDir:
        (motion.handRotDirCalculator?.getHandRotDir(
          motion.startLoc,
          motion.endLoc
        ) as ShiftHandRotDir) || undefined
    }
  );
  console.log(`   Directional adjustments: ${JSON.stringify(directionalAdjustments)}`);

  if (!directionalAdjustments || directionalAdjustments.length === 0) {
    return { x, y }; // Return base adjustment if no directional adjustments
  }

  // 5. Get the quadrant index (matches Python's QuadrantIndexHandler)
  const quadrantIndex = getQuadrantIndex(arrow, pictographData.gridMode || 'diamond');
  console.log(`   Quadrant index: ${quadrantIndex}`);

  if (quadrantIndex < 0 || quadrantIndex >= directionalAdjustments.length) {
    console.log(`   Invalid quadrant index, returning (0, 0)`);
    return { x: 0, y: 0 }; // Return zero adjustment for invalid indices
  }

  // 6. Apply the selected adjustment (matches Python's _get_final_adjustment)
  const [adjX, adjY] = directionalAdjustments[quadrantIndex];
  console.log(`   Final adjustment: [${adjX}, ${adjY}] (from quadrant ${quadrantIndex})`);

  // Return the final adjustment - EXACTLY like Python does
  return { x: adjX, y: adjY };
}

/**
 * Gets the motion object for an arrow based on its color.
 * Matches Python's behavior.
 */
function getMotionForArrow(arrow: ArrowData, pictographData: any): Motion | null {
  if (arrow.color === 'red' && pictographData.redMotion) {
    return pictographData.redMotion;
  } else if (arrow.color === 'blue' && pictographData.blueMotion) {
    return pictographData.blueMotion;
  }
  return null;
}

/**
 * Ensures that prop data exists in the pictograph data for orientation detection.
 * Creates prop data from motion data if it doesn't exist.
 */
function ensurePropDataExists(pictographData: any): void {
  // Create red prop data if missing
  if (!pictographData.redPropData && pictographData.redMotionData) {
    const redMotion = pictographData.redMotionData;
    pictographData.redPropData = {
      id: crypto.randomUUID(),
      motionId: redMotion.id,
      color: 'red',
      propType: 'staff',
      ori: redMotion.endOri,
      radialMode: ['in', 'out'].includes(redMotion.endOri) ? 'radial' : 'nonradial',
      coords: { x: 0, y: 0 },
      loc: redMotion.endLoc,
      rotAngle: 0
    };
    console.log(`   Created missing red prop data: ori=${redMotion.endOri}, radialMode=${pictographData.redPropData.radialMode}`);
  }

  // Create blue prop data if missing
  if (!pictographData.bluePropData && pictographData.blueMotionData) {
    const blueMotion = pictographData.blueMotionData;
    pictographData.bluePropData = {
      id: crypto.randomUUID(),
      motionId: blueMotion.id,
      color: 'blue',
      propType: 'staff',
      ori: blueMotion.endOri,
      radialMode: ['in', 'out'].includes(blueMotion.endOri) ? 'radial' : 'nonradial',
      coords: { x: 0, y: 0 },
      loc: blueMotion.endLoc,
      rotAngle: 0
    };
    console.log(`   Created missing blue prop data: ori=${blueMotion.endOri}, radialMode=${pictographData.bluePropData.radialMode}`);
  }
}
