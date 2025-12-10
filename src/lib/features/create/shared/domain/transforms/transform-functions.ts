/**
 * Transform Functions
 *
 * Pure functions that apply transforms to pictograph data.
 * These are simplified versions for the help examples -
 * the full transform logic lives in SequenceTransformationService.
 */

import { createMotionData, type MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import { MotionColor, RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

/** Mirror a grid location across the vertical center line */
function mirrorLocation(loc: GridLocation): GridLocation {
  const map: Record<GridLocation, GridLocation> = {
    [GridLocation.NORTH]: GridLocation.NORTH,
    [GridLocation.SOUTH]: GridLocation.SOUTH,
    [GridLocation.EAST]: GridLocation.WEST,
    [GridLocation.WEST]: GridLocation.EAST,
    [GridLocation.NORTHEAST]: GridLocation.NORTHWEST,
    [GridLocation.NORTHWEST]: GridLocation.NORTHEAST,
    [GridLocation.SOUTHEAST]: GridLocation.SOUTHWEST,
    [GridLocation.SOUTHWEST]: GridLocation.SOUTHEAST,
  };
  return map[loc];
}

/** Flip rotation direction */
function flipRotation(rot: RotationDirection): RotationDirection {
  if (rot === RotationDirection.CLOCKWISE) return RotationDirection.COUNTER_CLOCKWISE;
  if (rot === RotationDirection.COUNTER_CLOCKWISE) return RotationDirection.CLOCKWISE;
  return rot;
}

/** Rotate a location 45° clockwise or counter-clockwise */
function rotateLocation(loc: GridLocation, direction: "cw" | "ccw"): GridLocation {
  const order: GridLocation[] = [
    GridLocation.NORTH, GridLocation.NORTHEAST, GridLocation.EAST, GridLocation.SOUTHEAST,
    GridLocation.SOUTH, GridLocation.SOUTHWEST, GridLocation.WEST, GridLocation.NORTHWEST,
  ];
  const idx = order.indexOf(loc);
  if (idx === -1) return loc;
  const newIdx = direction === "cw" ? (idx + 1) % 8 : (idx + 7) % 8;
  return order[newIdx] ?? loc;
}

/** Apply mirror transform to pictograph */
export function applyMirror(data: PictographData): PictographData {
  const newMotions: Partial<Record<MotionColor, MotionData>> = {};
  for (const [color, motion] of Object.entries(data.motions)) {
    if (motion) {
      newMotions[color as MotionColor] = createMotionData({
        ...motion,
        startLocation: mirrorLocation(motion.startLocation),
        endLocation: mirrorLocation(motion.endLocation),
        arrowLocation: motion.arrowLocation ? mirrorLocation(motion.arrowLocation) : motion.startLocation,
        rotationDirection: flipRotation(motion.rotationDirection),
      });
    }
  }
  return { ...data, id: `${data.id}-mirrored`, motions: newMotions };
}

/** Apply rotate transform to pictograph */
export function applyRotate(data: PictographData, direction: "cw" | "ccw"): PictographData {
  const newMotions: Partial<Record<MotionColor, MotionData>> = {};
  for (const [color, motion] of Object.entries(data.motions)) {
    if (motion) {
      newMotions[color as MotionColor] = createMotionData({
        ...motion,
        startLocation: rotateLocation(motion.startLocation, direction),
        endLocation: rotateLocation(motion.endLocation, direction),
        arrowLocation: motion.arrowLocation ? rotateLocation(motion.arrowLocation, direction) : motion.startLocation,
      });
    }
  }
  return { ...data, id: `${data.id}-rotated-${direction}`, motions: newMotions };
}

/** Apply swap hands transform to pictograph */
export function applySwap(data: PictographData): PictographData {
  const blue = data.motions[MotionColor.BLUE];
  const red = data.motions[MotionColor.RED];
  const newMotions: Partial<Record<MotionColor, MotionData>> = {};
  if (blue) newMotions[MotionColor.RED] = createMotionData({ ...blue, color: MotionColor.RED });
  if (red) newMotions[MotionColor.BLUE] = createMotionData({ ...red, color: MotionColor.BLUE });
  return { ...data, id: `${data.id}-swapped`, motions: newMotions };
}

/** Apply rewind transform to pictograph */
export function applyRewind(data: PictographData): PictographData {
  const newMotions: Partial<Record<MotionColor, MotionData>> = {};
  for (const [color, motion] of Object.entries(data.motions)) {
    if (motion) {
      newMotions[color as MotionColor] = createMotionData({
        ...motion,
        startLocation: motion.endLocation,
        endLocation: motion.startLocation,
        startOrientation: motion.endOrientation,
        endOrientation: motion.startOrientation,
        rotationDirection: flipRotation(motion.rotationDirection),
      });
    }
  }
  return { ...data, id: `${data.id}-rewound`, motions: newMotions };
}
