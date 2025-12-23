/**
 * Utility functions for creating start position variations
 * Used as a fallback when IStartPositionService is not available
 */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import {
  GridMode,
  GridLocation,
  GridPosition,
} from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { Letter } from "$lib/shared/foundation/domain/models/Letter";
import {
  MotionType,
  MotionColor,
  Orientation,
  RotationDirection,
} from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import { createMotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import { createPictographData } from "$lib/shared/pictograph/shared/domain/factories/createPictographData";

// Position to hand location mapping
// Format: [GridPosition, blueLocation, redLocation]
const POSITION_LOCATIONS: Record<GridPosition, [GridLocation, GridLocation]> = {
  // Alpha positions - hands in opposite/inverted directions
  [GridPosition.ALPHA1]: [GridLocation.SOUTH, GridLocation.NORTH],
  [GridPosition.ALPHA2]: [GridLocation.SOUTHWEST, GridLocation.NORTHEAST],
  [GridPosition.ALPHA3]: [GridLocation.WEST, GridLocation.EAST],
  [GridPosition.ALPHA4]: [GridLocation.NORTHWEST, GridLocation.SOUTHEAST],
  [GridPosition.ALPHA5]: [GridLocation.NORTH, GridLocation.SOUTH],
  [GridPosition.ALPHA6]: [GridLocation.NORTHEAST, GridLocation.SOUTHWEST],
  [GridPosition.ALPHA7]: [GridLocation.EAST, GridLocation.WEST],
  [GridPosition.ALPHA8]: [GridLocation.SOUTHEAST, GridLocation.NORTHWEST],

  // Beta positions - both hands same direction
  [GridPosition.BETA1]: [GridLocation.NORTH, GridLocation.NORTH],
  [GridPosition.BETA2]: [GridLocation.NORTHEAST, GridLocation.NORTHEAST],
  [GridPosition.BETA3]: [GridLocation.EAST, GridLocation.EAST],
  [GridPosition.BETA4]: [GridLocation.SOUTHEAST, GridLocation.SOUTHEAST],
  [GridPosition.BETA5]: [GridLocation.SOUTH, GridLocation.SOUTH],
  [GridPosition.BETA6]: [GridLocation.SOUTHWEST, GridLocation.SOUTHWEST],
  [GridPosition.BETA7]: [GridLocation.WEST, GridLocation.WEST],
  [GridPosition.BETA8]: [GridLocation.NORTHWEST, GridLocation.NORTHWEST],

  // Gamma positions - mixed/varied combinations
  [GridPosition.GAMMA1]: [GridLocation.WEST, GridLocation.NORTH],
  [GridPosition.GAMMA2]: [GridLocation.NORTHWEST, GridLocation.NORTHEAST],
  [GridPosition.GAMMA3]: [GridLocation.NORTH, GridLocation.EAST],
  [GridPosition.GAMMA4]: [GridLocation.NORTHEAST, GridLocation.SOUTHEAST],
  [GridPosition.GAMMA5]: [GridLocation.EAST, GridLocation.SOUTH],
  [GridPosition.GAMMA6]: [GridLocation.SOUTHEAST, GridLocation.SOUTHWEST],
  [GridPosition.GAMMA7]: [GridLocation.SOUTH, GridLocation.WEST],
  [GridPosition.GAMMA8]: [GridLocation.SOUTHWEST, GridLocation.NORTHWEST],
  [GridPosition.GAMMA9]: [GridLocation.EAST, GridLocation.NORTH],
  [GridPosition.GAMMA10]: [GridLocation.SOUTHEAST, GridLocation.NORTHEAST],
  [GridPosition.GAMMA11]: [GridLocation.SOUTH, GridLocation.EAST],
  [GridPosition.GAMMA12]: [GridLocation.SOUTHWEST, GridLocation.SOUTHEAST],
  [GridPosition.GAMMA13]: [GridLocation.WEST, GridLocation.SOUTH],
  [GridPosition.GAMMA14]: [GridLocation.NORTHWEST, GridLocation.SOUTHWEST],
  [GridPosition.GAMMA15]: [GridLocation.NORTH, GridLocation.WEST],
  [GridPosition.GAMMA16]: [GridLocation.NORTHEAST, GridLocation.NORTHWEST],
};

// Diamond mode positions (odd numbers for alpha/beta, odd for gamma)
const DIAMOND_POSITIONS: Array<{ position: GridPosition; letter: Letter }> = [
  { position: GridPosition.ALPHA1, letter: Letter.ALPHA },
  { position: GridPosition.ALPHA3, letter: Letter.ALPHA },
  { position: GridPosition.ALPHA5, letter: Letter.ALPHA },
  { position: GridPosition.ALPHA7, letter: Letter.ALPHA },
  { position: GridPosition.BETA1, letter: Letter.BETA },
  { position: GridPosition.BETA3, letter: Letter.BETA },
  { position: GridPosition.BETA5, letter: Letter.BETA },
  { position: GridPosition.BETA7, letter: Letter.BETA },
  { position: GridPosition.GAMMA1, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA3, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA5, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA7, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA9, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA11, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA13, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA15, letter: Letter.GAMMA },
];

// Box mode positions (even numbers)
const BOX_POSITIONS: Array<{ position: GridPosition; letter: Letter }> = [
  { position: GridPosition.ALPHA2, letter: Letter.ALPHA },
  { position: GridPosition.ALPHA4, letter: Letter.ALPHA },
  { position: GridPosition.ALPHA6, letter: Letter.ALPHA },
  { position: GridPosition.ALPHA8, letter: Letter.ALPHA },
  { position: GridPosition.BETA2, letter: Letter.BETA },
  { position: GridPosition.BETA4, letter: Letter.BETA },
  { position: GridPosition.BETA6, letter: Letter.BETA },
  { position: GridPosition.BETA8, letter: Letter.BETA },
  { position: GridPosition.GAMMA2, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA4, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA6, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA8, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA10, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA12, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA14, letter: Letter.GAMMA },
  { position: GridPosition.GAMMA16, letter: Letter.GAMMA },
];

/**
 * Create all 16 start position variations for the given grid mode
 * Returns full PictographData objects with proper motion data
 */
export function createStartPositionVariations(
  gridMode: GridMode
): PictographData[] {
  const positions =
    gridMode === GridMode.DIAMOND ? DIAMOND_POSITIONS : BOX_POSITIONS;

  return positions.map((pos) => {
    const [blueLocation, redLocation] = POSITION_LOCATIONS[pos.position];

    // Create proper motion data for both hands
    const blueMotion = createMotionData({
      motionType: MotionType.STATIC,
      startLocation: blueLocation,
      endLocation: blueLocation,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      rotationDirection: RotationDirection.NO_ROTATION,
      turns: 0,
      color: MotionColor.BLUE,
      isVisible: true,
      propType: PropType.STAFF,
      arrowLocation: blueLocation,
      gridMode: gridMode,
    });

    const redMotion = createMotionData({
      motionType: MotionType.STATIC,
      startLocation: redLocation,
      endLocation: redLocation,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      rotationDirection: RotationDirection.NO_ROTATION,
      turns: 0,
      color: MotionColor.RED,
      isVisible: true,
      propType: PropType.STAFF,
      arrowLocation: redLocation,
      gridMode: gridMode,
    });

    return createPictographData({
      id: `start-${pos.position}`,
      letter: pos.letter,
      startPosition: pos.position,
      endPosition: pos.position,
      motions: {
        [MotionColor.BLUE]: blueMotion,
        [MotionColor.RED]: redMotion,
      },
    });
  });
}
