/**
 * Options Service
 *
 * Provides functionality for filtering, sorting, and grouping pictograph options
 */

import { inferPositionFromLocations } from "$legacyLib/components/SequenceWorkbench/share/utils/SequenceDecoder";
import type { PictographData } from "$legacyLib/types/PictographData";
import type { ReversalFilter, SortMethod } from "../config";

/**
 * Get next available options based on the current sequence
 * Filters options where the start position matches the end position of the last beat
 */
export function getNextOptions(
  allPictographs: PictographData[],
  currentSequence: PictographData[]
): PictographData[] {
  // If sequence is empty, return all pictographs
  if (currentSequence.length === 0) {
    return allPictographs;
  }

  // Get the last pictograph in the sequence
  const lastPictograph = currentSequence[currentSequence.length - 1];

  // Get the end position of the last pictograph
  const endPosition = getEndPosition(lastPictograph);

  if (!endPosition) {
    // If we can't determine end position, return all pictographs
    return allPictographs;
  }

  // Filter options where their start position matches the end position of the last beat
  return allPictographs.filter(pictograph => {
    if (!pictograph || !pictograph.letter) {
      return false;
    }

    // Get the start position of this option
    const optionStartPosition = getStartPosition(pictograph);

    if (!optionStartPosition) {
      return false;
    }

    // Compare positions (case-insensitive)
    return optionStartPosition.toLowerCase() === endPosition.toLowerCase();
  });
}

/**
 * Calculate end position from pictograph motion data
 */
function getEndPosition(pictographData: PictographData): string | null {
  if (!pictographData?.blueMotionData || !pictographData?.redMotionData) {
    return null;
  }

  try {
    const blueEndLoc = pictographData.blueMotionData.endLoc;
    const redEndLoc = pictographData.redMotionData.endLoc;

    if (!blueEndLoc || !redEndLoc) {
      return null;
    }

    // Use the legacy position inference utility
    return inferPositionFromLocations(blueEndLoc, redEndLoc);
  } catch (error) {
    console.error("Error calculating end position:", error);
    return null;
  }
}

/**
 * Calculate start position from pictograph motion data
 */
function getStartPosition(pictographData: PictographData): string | null {
  if (!pictographData?.blueMotionData || !pictographData?.redMotionData) {
    return null;
  }

  try {
    const blueStartLoc = pictographData.blueMotionData.startLoc;
    const redStartLoc = pictographData.redMotionData.startLoc;

    if (!blueStartLoc || !redStartLoc) {
      return null;
    }

    // Use the legacy position inference utility
    return inferPositionFromLocations(blueStartLoc, redStartLoc);
  } catch (error) {
    console.error("Error calculating start position:", error);
    return null;
  }
}

/**
 * Determine reversal category for a pictograph
 */
export function determineReversalCategory(pictograph: PictographData): ReversalFilter {
  if (!pictograph) return "all";

  const redMotion = pictograph.redMotionData?.motionType;
  const blueMotion = pictograph.blueMotionData?.motionType;

  let reversalCount = 0;
  if (redMotion === "anti") reversalCount++;
  if (blueMotion === "anti") reversalCount++;

  switch (reversalCount) {
    case 0:
      return "continuous";
    case 1:
      return "oneReversal";
    case 2:
      return "twoReversals";
    default:
      return "all";
  }
}

/**
 * Determine group key for a pictograph based on sort method
 */
export function determineGroupKey(
  pictograph: PictographData,
  sortMethod: SortMethod,
  sequence?: PictographData[]
): string {
  if (!pictograph) return "unknown";

  switch (sortMethod) {
    case "type":
      return pictograph.letter || "unknown";
    
    case "endPosition":
      return pictograph.endPos || "unknown";
    
    case "reversals":
      const category = determineReversalCategory(pictograph);
      switch (category) {
        case "continuous":
          return "Continuous";
        case "oneReversal":
          return "One Reversal";
        case "twoReversals":
          return "Two Reversals";
        default:
          return "All";
      }
    
    default:
      return "all";
  }
}

/**
 * Get sorted group keys based on sort method
 */
export function getSortedGroupKeys(
  groupKeys: string[],
  sortMethod: SortMethod
): string[] {
  switch (sortMethod) {
    case "type":
      // Sort alphabetically for letter types
      return groupKeys.sort();
    
    case "endPosition":
      // Sort by position order (you may want to customize this)
      const positionOrder = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
      return groupKeys.sort((a, b) => {
        const aIndex = positionOrder.indexOf(a.toLowerCase());
        const bIndex = positionOrder.indexOf(b.toLowerCase());
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    
    case "reversals":
      // Sort by reversal category order
      const reversalOrder = ["Continuous", "One Reversal", "Two Reversals", "All"];
      return groupKeys.sort((a, b) => {
        const aIndex = reversalOrder.indexOf(a);
        const bIndex = reversalOrder.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    
    default:
      return groupKeys.sort();
  }
}

/**
 * Get sorter function for pictographs based on sort method
 */
export function getSorter(sortMethod: SortMethod): (a: PictographData, b: PictographData) => number {
  switch (sortMethod) {
    case "type":
      return (a, b) => {
        const letterA = a.letter || "";
        const letterB = b.letter || "";
        return letterA.localeCompare(letterB);
      };
    
    case "endPosition":
      return (a, b) => {
        const posA = a.endPos || "";
        const posB = b.endPos || "";
        return posA.localeCompare(posB);
      };
    
    case "reversals":
      return (a, b) => {
        const categoryA = determineReversalCategory(a);
        const categoryB = determineReversalCategory(b);
        return categoryA.localeCompare(categoryB);
      };
    
    default:
      return (a, b) => {
        const letterA = a.letter || "";
        const letterB = b.letter || "";
        return letterA.localeCompare(letterB);
      };
  }
}