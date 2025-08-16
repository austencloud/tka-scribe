/**
 * Endpoint Calculation Service
 *
 * Handles calculation of motion endpoints and staff angles
 * for different motion types.
 */

import { MotionType, Orientation, RotationDirection } from "$lib/domain/enums";
import type { MotionData } from "$lib/domain";
import { mapPositionToAngle } from "./AngleCalculationService.js";
import {
  calculateProTargetAngle,
  calculateProIsolationStaffAngle,
  calculateAntispinTargetAngle,
  calculateStaticStaffAngle,
  calculateDashTargetAngle,
  calculateFloatStaffAngle,
} from "./MotionCalculationService.js";
import { mapOrientationToAngle } from "./AngleCalculationService.js";

// ✅ ELIMINATED: StepEndpoints and StepDefinition - pointless reshuffling!
// Work directly with MotionData and return simple objects

export interface MotionEndpoints {
  startCenterAngle: number;
  startStaffAngle: number;
  targetCenterAngle: number;
  targetStaffAngle: number;
}

/**
 * Calculate motion endpoints directly from MotionData (NATIVE!)
 */
export function calculateMotionEndpoints(
  motionData: MotionData
): MotionEndpoints {
  const {
    start_loc,
    end_loc,
    start_ori,
    end_ori,
    motion_type,
    prop_rot_dir,
    turns = 0,
  } = motionData;

  const startCenterAngle = mapPositionToAngle(start_loc);
  const startStaffAngle = mapOrientationToAngle(
    start_ori || Orientation.IN,
    startCenterAngle
  );
  const targetCenterAngle = mapPositionToAngle(end_loc);

  let calculatedTargetStaffAngle: number;

  // Calculate target staff angle based on motion type
  switch (motion_type) {
    case MotionType.PRO: {
      const numericTurns = typeof turns === "number" ? turns : 0;
      if (numericTurns > 0) {
        calculatedTargetStaffAngle = calculateProTargetAngle(
          startCenterAngle,
          targetCenterAngle,
          startStaffAngle,
          numericTurns,
          prop_rot_dir || RotationDirection.CLOCKWISE
        );
      } else {
        calculatedTargetStaffAngle = calculateProIsolationStaffAngle(
          targetCenterAngle,
          prop_rot_dir || RotationDirection.CLOCKWISE
        );
      }
      break;
    }
    case MotionType.ANTI: {
      const numericTurns = typeof turns === "number" ? turns : 0;
      calculatedTargetStaffAngle = calculateAntispinTargetAngle(
        startCenterAngle,
        targetCenterAngle,
        startStaffAngle,
        numericTurns,
        prop_rot_dir || RotationDirection.CLOCKWISE
      );
      break;
    }
    case MotionType.STATIC: {
      calculatedTargetStaffAngle = calculateStaticStaffAngle(
        startStaffAngle,
        end_ori || Orientation.IN,
        targetCenterAngle
      );
      break;
    }
    case MotionType.DASH: {
      calculatedTargetStaffAngle = calculateDashTargetAngle(
        startStaffAngle,
        end_ori || Orientation.IN,
        targetCenterAngle
      );
      break;
    }
    case MotionType.FLOAT: {
      calculatedTargetStaffAngle = calculateFloatStaffAngle(startStaffAngle);
      break;
    }
    default:
      console.warn(`Unknown motion type '${motion_type}'. Treating as static.`);
      calculatedTargetStaffAngle = startStaffAngle;
      break;
  }

  // Handle explicit end orientation override (except for pro)
  if (motion_type !== MotionType.PRO) {
    const endOriAngleOverride = mapOrientationToAngle(
      end_ori || Orientation.IN,
      targetCenterAngle
    );
    // Check against enum values instead of string array
    const explicitEndOri =
      end_ori && Object.values(Orientation).includes(end_ori);
    if (explicitEndOri) {
      calculatedTargetStaffAngle = endOriAngleOverride;
    }
  }

  return {
    startCenterAngle,
    startStaffAngle,
    targetCenterAngle,
    targetStaffAngle: calculatedTargetStaffAngle,
  };
}

/**
 * Calculate endpoint staff angle for a motion (NATIVE MotionData!)
 */
export function calculateEndpointStaffAngle(motionData: MotionData): number {
  const endpoints = calculateMotionEndpoints(motionData);
  return endpoints.targetStaffAngle;
}
