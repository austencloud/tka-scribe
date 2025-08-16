/**
 * Prop Interpolation Service
 *
 * Focused service for angle interpolation and motion calculations.
 * Single responsibility: Motion interpolation between keyframes.
 */

import type { MotionData } from "$lib/domain";
import { getBlueMotion, getRedMotion, createMotionData } from "$lib/domain";
import type { BeatData } from "$lib/domain";
import {
  lerpAngle,
  calculateMotionEndpoints,
  type MotionEndpoints,
} from "../../utils/math/index.js";
import type {
  IPropInterpolationService,
  InterpolationResult,
} from "$lib/services/di/interfaces/animator-interfaces";

export class PropInterpolationService implements IPropInterpolationService {
  /**
   * Calculate interpolated prop angles for current beat progress
   * EXACT INTERPOLATION LOGIC FROM STANDALONE
   */
  interpolatePropAngles(
    currentBeatData: BeatData,
    beatProgress: number
  ): InterpolationResult {
    // Get motion data directly from domain beat (PURE DOMAIN!)
    const blueMotion = getBlueMotion(currentBeatData) || createMotionData();
    const redMotion = getRedMotion(currentBeatData) || createMotionData();

    // Calculate endpoints using native MotionData
    const blueEndpoints = calculateMotionEndpoints(blueMotion);
    const redEndpoints = calculateMotionEndpoints(redMotion);

    // EXACT INTERPOLATION LOGIC FROM STANDALONE
    const blueAngles = {
      centerPathAngle: lerpAngle(
        blueEndpoints.startCenterAngle,
        blueEndpoints.targetCenterAngle,
        beatProgress
      ),
      staffRotationAngle: lerpAngle(
        blueEndpoints.startStaffAngle,
        blueEndpoints.targetStaffAngle,
        beatProgress
      ),
    };

    const redAngles = {
      centerPathAngle: lerpAngle(
        redEndpoints.startCenterAngle,
        redEndpoints.targetCenterAngle,
        beatProgress
      ),
      staffRotationAngle: lerpAngle(
        redEndpoints.startStaffAngle,
        redEndpoints.targetStaffAngle,
        beatProgress
      ),
    };

    return {
      blueAngles,
      redAngles,
      isValid: true,
    };
  }

  /**
   * Calculate initial prop angles from first beat
   */
  calculateInitialAngles(firstBeat: BeatData): InterpolationResult {
    // Get motion data directly from domain beat (PURE DOMAIN!)
    const blueStartMotion = getBlueMotion(firstBeat) || createMotionData();
    const redStartMotion = getRedMotion(firstBeat) || createMotionData();

    const blueStartEndpoints = calculateMotionEndpoints(blueStartMotion);
    const redStartEndpoints = calculateMotionEndpoints(redStartMotion);

    return {
      blueAngles: {
        centerPathAngle: blueStartEndpoints.startCenterAngle,
        staffRotationAngle: blueStartEndpoints.startStaffAngle,
      },
      redAngles: {
        centerPathAngle: redStartEndpoints.startCenterAngle,
        staffRotationAngle: redStartEndpoints.startStaffAngle,
      },
      isValid: true,
    };
  }

  /**
   * Get motion data for debugging
   */
  getMotionData(beatData: BeatData): { blue: MotionData; red: MotionData } {
    return {
      blue: getBlueMotion(beatData) || createMotionData(),
      red: getRedMotion(beatData) || createMotionData(),
    };
  }

  /**
   * Calculate endpoints for debugging
   */
  getEndpoints(beatData: BeatData): {
    blue: MotionEndpoints;
    red: MotionEndpoints;
  } {
    const motionData = this.getMotionData(beatData);
    return {
      blue: calculateMotionEndpoints(motionData.blue),
      red: calculateMotionEndpoints(motionData.red),
    };
  }
}
