/**
 * PictographChecker for legacy app
 *
 * Implements the actual logic for checking pictograph conditions based on motion data.
 */

import { CLOCK, COUNTER, IN, OUT } from "$legacyLib/types/Constants";
import type { PictographData } from "$legacyLib/types/PictographData";
import { LetterUtils } from "$legacyLib/utils/LetterUtils";
import type { LetterConditions } from "../constants/LetterConditions";

export class PictographChecker {
  private data: PictographData;

  constructor(pictographData: PictographData) {
    this.data = pictographData;
  }

  /**
   * Check if a letter condition is met
   */
  checkLetterCondition(condition: LetterConditions): boolean {
    if (!this.data.letter) {
      return false;
    }

    const lettersForCondition = LetterUtils.getLettersByCondition(condition);
    return lettersForCondition.includes(this.data.letter);
  }

  /**
   * Check if the pictograph ends with layer 3 orientation (hybrid orientation)
   * Layer 3 means both radial and non-radial orientations are present
   */
  endsWithLayer3(): boolean {
    const redEndOri = this.data.redMotionData?.endOri;
    const blueEndOri = this.data.blueMotionData?.endOri;

    if (!redEndOri || !blueEndOri) {
      return false;
    }

    const radialOrientations = [IN, OUT];
    const nonRadialOrientations = [CLOCK, COUNTER];

    const redIsRadial = radialOrientations.includes(redEndOri);
    const redIsNonRadial = nonRadialOrientations.includes(redEndOri);
    const blueIsRadial = radialOrientations.includes(blueEndOri);
    const blueIsNonRadial = nonRadialOrientations.includes(blueEndOri);

    // Layer 3 (hybrid) means one prop is radial and the other is non-radial
    return (redIsRadial && blueIsNonRadial) || (redIsNonRadial && blueIsRadial);
  }

  /**
   * Check if the pictograph ends with radial orientation (both props end with in/out)
   * Layer 1 orientation
   */
  endsWithRadialOri(): boolean {
    const redEndOri = this.data.redMotionData?.endOri;
    const blueEndOri = this.data.blueMotionData?.endOri;

    if (!redEndOri || !blueEndOri) {
      return false;
    }

    const radialOrientations = [IN, OUT];
    return (
      radialOrientations.includes(redEndOri) &&
      radialOrientations.includes(blueEndOri)
    );
  }

  /**
   * Check if the pictograph ends with non-radial orientation (both props end with clock/counter)
   * Layer 2 orientation
   */
  endsWithNonRadialOri(): boolean {
    const redEndOri = this.data.redMotionData?.endOri;
    const blueEndOri = this.data.blueMotionData?.endOri;

    if (!redEndOri || !blueEndOri) {
      return false;
    }

    const nonRadialOrientations = [CLOCK, COUNTER];
    return (
      nonRadialOrientations.includes(redEndOri) &&
      nonRadialOrientations.includes(blueEndOri)
    );
  }

  /**
   * Update the pictograph data
   */
  updateData(newData: PictographData): void {
    this.data = newData;
  }
}
