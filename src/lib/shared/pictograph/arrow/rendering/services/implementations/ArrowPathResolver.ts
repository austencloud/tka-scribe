/**
 * Arrow Path Resolution Service
 *
 * Responsible for determining the correct SVG file path based on motion data.
 * Extracted from ArrowRenderer to improve modularity and reusability.
 */

import { injectable } from "inversify";

import type {
  ArrowPlacementData,
  IArrowPathResolver,
  MotionData,
} from "$shared";
import { MotionType, Orientation } from "$shared";

@injectable()
export class ArrowPathResolver implements IArrowPathResolver {
  /**
   * Get arrow SVG path based on motion type and properties (extracted from Arrow.svelte)
   */
  getArrowPath(
    _arrowData: ArrowPlacementData,
    motionData: MotionData
  ): string | null {
    const { motionType, turns } = motionData;
    const baseDir = `/images/arrows/${motionType}`;

    // For motion types that have turn-based subdirectories (pro, anti, static, dash)
    if (
      motionType === MotionType.PRO ||
      motionType === MotionType.ANTI ||
      motionType === MotionType.STATIC ||
      motionType === MotionType.DASH
    ) {
      // Determine if we should use radial vs non-radial arrows based on START orientation only
      // "from_radial" = arrow starts from radial orientation (in/out)
      // "from_nonradial" = arrow starts from non-radial orientation (clock/counter)
      const isNonRadial =
        motionData.startOrientation === Orientation.CLOCK ||
        motionData.startOrientation === Orientation.COUNTER;

      const subDir = isNonRadial ? "from_nonradial" : "from_radial";
      const turnValue = typeof turns === "number" ? turns.toFixed(1) : "0.0";
      const path = `${baseDir}/${subDir}/${motionType}_${turnValue}.svg`;

      return path;
    }

    // For float (truly turn-agnostic) - use base directory
    const path = `${baseDir}.svg`;
    return path;
  }

  /**
   * Get the correct arrow SVG path based on motion data (optimized version)
   */
  getArrowSvgPath(motionData: MotionData | undefined): string {
    if (!motionData) {
      return "/images/arrows/static/from_radial/static_0.svg";
    }

    const motionType = motionData.motionType;
    const turnsVal = motionData.turns;
    const startOrientation = motionData.startOrientation;

    if (motionType === MotionType.FLOAT) {
      return "/images/arrows/float.svg";
    }

    // Folder is based on START orientation only ("from_radial" = starts from radial)
    const radialPath =
      startOrientation === Orientation.IN ||
      startOrientation === Orientation.OUT
        ? "from_radial"
        : "from_nonradial";

    let turnsStr: string;
    if (turnsVal === "fl") {
      turnsStr = "fl";
    } else if (typeof turnsVal === "number") {
      turnsStr = turnsVal % 1 === 0 ? `${turnsVal}.0` : turnsVal.toString();
    } else {
      turnsStr = "0.0";
    }

    return `/images/arrows/${motionType}/${radialPath}/${motionType}_${turnsStr}.svg`;
  }
}
