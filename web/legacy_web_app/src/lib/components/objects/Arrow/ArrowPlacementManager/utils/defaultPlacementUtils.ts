// src/lib/components/PlacementManagers/ArrowPlacementManager/utils/defaultPlacementUtils.ts
import type { ArrowData } from "$legacyLib/components/objects/Arrow/ArrowData";
import {
  CLOCK,
  COUNTER,
  DIAMOND,
  IN,
  NONRADIAL,
  OUT,
  RADIAL,
} from "$legacyLib/types/Constants";
import { LetterType } from "$legacyLib/types/LetterType";
import { LetterUtils } from "$legacyLib/utils/LetterUtils";
import type { ArrowPlacementConfig } from "../types";

// Import default placement data
import { LetterConditions } from "$legacyLib/components/Pictograph/constants/LetterConditions";
import type { PictographChecker } from "$legacyLib/components/Pictograph/services/PictographChecker";
import boxAntiData from "$legacyLib/data/arrow_placement/box/default/default_box_anti_placements.json";
import boxDashData from "$legacyLib/data/arrow_placement/box/default/default_box_dash_placements.json";
import boxFloatData from "$legacyLib/data/arrow_placement/box/default/default_box_float_placements.json";
import boxProData from "$legacyLib/data/arrow_placement/box/default/default_box_pro_placements.json";
import boxStaticData from "$legacyLib/data/arrow_placement/box/default/default_box_static_placements.json";
import diamondAntiData from "$legacyLib/data/arrow_placement/diamond/default/default_diamond_anti_placements.json";
import diamondDashData from "$legacyLib/data/arrow_placement/diamond/default/default_diamond_dash_placements.json";
import diamondFloatData from "$legacyLib/data/arrow_placement/diamond/default/default_diamond_float_placements.json";
import diamondProData from "$legacyLib/data/arrow_placement/diamond/default/default_diamond_pro_placements.json";
import diamondStaticData from "$legacyLib/data/arrow_placement/diamond/default/default_diamond_static_placements.json";
import type { PictographData } from "$legacyLib/types/PictographData";

// Define type for the actual JSON structure
// This better matches what we get from the JSON files
interface TurnAdjustment {
  [turn: string]: [number, number];
}

interface PlacementData {
  [key: string]: TurnAdjustment;
}

// Consolidated default placement data with proper typing
const DEFAULT_PLACEMENTS: Record<string, Record<string, PlacementData>> = {
  diamond: {
    pro: diamondProData as any,
    anti: diamondAntiData as any,
    float: diamondFloatData as any,
    dash: diamondDashData as any,
    static: diamondStaticData as any,
  },
  box: {
    pro: boxProData as any,
    anti: boxAntiData as any,
    float: boxFloatData as any,
    dash: boxDashData as any,
    static: boxStaticData as any,
  },
};

/**
 * Gets the default adjustment values for an arrow
 */
export function getDefaultAdjustment(
  arrow: ArrowData,
  config: ArrowPlacementConfig
): [number, number] {
  const { pictographData, checker } = config;
  const motionType = arrow.motionType as string;
  const gridMode = (pictographData.gridMode || DIAMOND) as string;

  // Get default placements for this grid mode and motion type
  const defaultPlacements = DEFAULT_PLACEMENTS[gridMode]?.[motionType] || {};

  // Get the appropriate adjustment key
  const key = getAdjustmentKey(
    arrow,
    defaultPlacements,
    pictographData,
    checker
  );
  const turnsString = String(arrow.turns || 0);

  // Find the adjustment based on the key and turns
  if (key in defaultPlacements && turnsString in defaultPlacements[key]) {
    return defaultPlacements[key][turnsString];
  } else if (
    motionType in defaultPlacements &&
    turnsString in defaultPlacements[motionType]
  ) {
    return defaultPlacements[motionType][turnsString];
  }

  return [0, 0];
}

/**
 * Generates the lookup key for default adjustments
 */
function getAdjustmentKey(
  arrow: ArrowData,
  defaultPlacements: PlacementData,
  pictographData: PictographData,
  checker: PictographChecker
): string {
  const motionType = arrow.motionType as string;
  const motionEndOri = arrow.endOri as string;

  // Check for different orientation types
  const hasBetaProps = checker.checkLetterCondition(
    LetterConditions.BETA_ENDING
  );
  const hasAlphaProps = checker.checkLetterCondition(
    LetterConditions.ALPHA_ENDING
  );
  const hasGammaProps = checker.checkLetterCondition(
    LetterConditions.GAMMA_ENDING
  );
  const hasHybridOrientation = checker.endsWithLayer3();
  const hasRadialProps = checker.endsWithRadialOri();
  const hasNonRadialProps = checker.endsWithNonRadialOri();

  const keySuffix = "_to_";
  let motionEndOriKey = "";

  // Handle hybrid orientation
  if (hasHybridOrientation) {
    if (motionEndOri === IN || motionEndOri === OUT) {
      motionEndOriKey = `${RADIAL}_`;
    } else if (motionEndOri === CLOCK || motionEndOri === COUNTER) {
      motionEndOriKey = `${NONRADIAL}_`;
    }
  }

  // Handle letter-specific adjustments
  let letterSuffix = "";
  if (pictographData.letter) {
    const letterVal = pictographData.letter as string;
    const letter = LetterUtils.getLetter(letterVal);
    const letterType = LetterType.getLetterType(letter);

    if (
      letterType &&
      (letterType === LetterType.Type3 || letterType === LetterType.Type5)
    ) {
      const char = letterVal.slice(0, -1);
      letterSuffix = `_${char}_dash`;
    } else {
      letterSuffix = `_${letterVal}`;
    }
  }

  // Build the key middle part
  let keyMiddle = "";
  if (hasRadialProps) {
    keyMiddle = "layer1";
  } else if (hasNonRadialProps) {
    keyMiddle = "layer2";
  } else if (hasHybridOrientation) {
    keyMiddle = "layer3";
  }

  // Add prop type
  if (hasAlphaProps) {
    keyMiddle += "_alpha";
  } else if (hasBetaProps) {
    keyMiddle += "_beta";
  } else if (hasGammaProps) {
    keyMiddle += "_gamma";
  }

  // Construct the final key
  let key = motionType;
  if (keyMiddle) {
    key += keySuffix + motionEndOriKey + keyMiddle;
  }
  const keyWithLetter = key + letterSuffix;

  // Return the most specific key available
  if (keyWithLetter in defaultPlacements) {
    return keyWithLetter;
  } else if (key in defaultPlacements) {
    return key;
  } else {
    return motionType;
  }
}
