/**
 * Arrow Placement Key Service
 *
 * Generates placement keys for arrow positioning lookups.
 * Simplified version of the desktop PlacementKeyGenerator logic.
 */

import { MotionType, type MotionData, type PictographData } from "$shared";
import { injectable } from "inversify";
import type { IArrowPlacementKeyService } from "../contracts";

@injectable()
export class ArrowPlacementKeyService implements IArrowPlacementKeyService {
  // Letter condition mappings from desktop
  private readonly dashLetterConditions = {
    TYPE3: ["W-", "X-", "Y-", "Z-", "Σ-", "Δ-", "θ-", "Ω-"],
    TYPE5: ["Φ-", "Ψ-", "Λ-"],
  };

  /**
   * Generate placement key based on motion data and pictograph context
   */
  private getRawMotionType(motionData: MotionData): MotionType {
    return motionData.motionType;
  }

  generatePlacementKey(
    motionData: MotionData,
    pictographData: PictographData,
    availableKeys: string[]
  ): string {
    const rawMotionType = this.getRawMotionType(motionData);
    const motionType = this.normalizeMotionType(rawMotionType);

    // Generate candidate keys in order of preference
    const candidateKeys = this.generateCandidateKeys(
      motionData,
      pictographData
    );

    // Select the first available key from candidates
    for (const key of candidateKeys) {
      if (availableKeys.includes(key)) {
        return key;
      }
    }

    // Fallback to motion type
    return motionType;
  }

  /**
   * Generate basic key for motion type (fallback)
   */
  generateBasicKey(motionType: MotionType): string {
    return motionType;
  }

  /**
   * Generate candidate keys in order of preference
   */
  private generateCandidateKeys(
    motionData: MotionData,
    pictographData: PictographData
  ): string[] {
    const rawMotionType = this.getRawMotionType(motionData);
    const motionType = this.normalizeMotionType(rawMotionType).toLowerCase();
    const letter = pictographData.letter;

    const candidates: string[] = [];

    // Use legacy-style layer detection logic
    const layerInfo = this.detectLayerInfo(pictographData);

    if (letter) {
      // Generate letter-specific key using legacy logic FIRST
      const letterSuffix = this.getLetterSuffix(letter);
      const legacyKey = this.generateLegacyStyleKey(
        motionType,
        layerInfo,
        letterSuffix
      );
      if (legacyKey) {
        candidates.push(legacyKey);
      }
    }

    // Generate key without letter using legacy logic
    const legacyKeyNoLetter = this.generateLegacyStyleKey(
      motionType,
      layerInfo,
      ""
    );
    if (legacyKeyNoLetter) {
      candidates.push(legacyKeyNoLetter);
    }

    if (letter) {
      // Fallback: Generate letter-specific keys (original logic)
      const letterSuffix = this.getLetterSuffix(letter);

      // Try different layer combinations with letter
      candidates.push(`${motionType}_to_layer1_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_layer2_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_layer1_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_layer2_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_layer1_gamma${letterSuffix}`);
      candidates.push(`${motionType}_to_layer2_gamma${letterSuffix}`);

      // Try radial layer3 combinations
      candidates.push(`${motionType}_to_radial_layer3_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_radial_layer3_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_radial_layer3_gamma${letterSuffix}`);

      // Try nonradial layer3 combinations
      candidates.push(`${motionType}_to_nonradial_layer3_alpha${letterSuffix}`);
      candidates.push(`${motionType}_to_nonradial_layer3_beta${letterSuffix}`);
      candidates.push(`${motionType}_to_nonradial_layer3_gamma${letterSuffix}`);
    }

    // Try basic layer combinations without letter
    candidates.push(`${motionType}_to_layer1_alpha`);
    candidates.push(`${motionType}_to_layer2_alpha`);
    candidates.push(`${motionType}_to_layer1_beta`);
    candidates.push(`${motionType}_to_layer2_beta`);
    candidates.push(`${motionType}_to_layer1_gamma`);
    candidates.push(`${motionType}_to_layer2_gamma`);

    // Try radial layer3 without letter
    candidates.push(`${motionType}_to_radial_layer3_alpha`);
    candidates.push(`${motionType}_to_radial_layer3_beta`);
    candidates.push(`${motionType}_to_radial_layer3_gamma`);

    // Try nonradial layer3 without letter
    candidates.push(`${motionType}_to_nonradial_layer3_alpha`);
    candidates.push(`${motionType}_to_nonradial_layer3_beta`);
    candidates.push(`${motionType}_to_nonradial_layer3_gamma`);

    // Finally, just motion type
    candidates.push(motionType);

    return candidates;
  }

  /**
   * Get letter suffix for placement key
   */
  private getLetterSuffix(letter: string): string {
    if (!letter) {
      return "";
    }

    // Check if letter needs dash handling (TYPE3/TYPE5)
    const allDashLetters = [
      ...this.dashLetterConditions.TYPE3,
      ...this.dashLetterConditions.TYPE5,
    ];

    if (allDashLetters.includes(letter)) {
      // Remove dash and add "_dash" suffix: "W-" → "_W_dash"
      const baseString = letter.slice(0, -1);
      return `_${baseString}_dash`;
    }

    // Regular letter: "A" → "_A"
    return `_${letter}`;
  }

  /**
   * Detect layer information using legacy logic
   */
  private detectLayerInfo(pictographData: PictographData): {
    hasRadialProps: boolean;
    hasNonRadialProps: boolean;
    hasHybridOrientation: boolean;
    hasAlphaProps: boolean;
    hasBetaProps: boolean;
    hasGammaProps: boolean;
  } {
    // Implement legacy layer detection logic
    const redEndOri = pictographData.motions?.red?.endOrientation;
    const blueEndOri = pictographData.motions?.blue?.endOrientation;

    if (!redEndOri || !blueEndOri) {
      return {
        hasRadialProps: false,
        hasNonRadialProps: false,
        hasHybridOrientation: false,
        hasAlphaProps: false,
        hasBetaProps: false,
        hasGammaProps: false,
      };
    }

    const radialOrientations = ["in", "out"];
    const nonRadialOrientations = ["clock", "counter"];

    const redIsRadial = radialOrientations.includes(redEndOri);
    const redIsNonRadial = nonRadialOrientations.includes(redEndOri);
    const blueIsRadial = radialOrientations.includes(blueEndOri);
    const blueIsNonRadial = nonRadialOrientations.includes(blueEndOri);

    // Layer detection logic (matching legacy)
    const hasRadialProps = redIsRadial && blueIsRadial;
    const hasNonRadialProps = redIsNonRadial && blueIsNonRadial;
    const hasHybridOrientation =
      (redIsRadial && blueIsNonRadial) || (redIsNonRadial && blueIsRadial);

    // Letter type detection (simplified - should match legacy LetterUtils)
    const letter = pictographData.letter;
    const alphaLetters = ["A", "B", "C", "D", "E", "F", "W", "X", "W-", "X-"];
    const betaLetters = ["G", "H", "I", "J", "K", "L", "Y", "Z", "Y-", "Z-"];
    const gammaLetters = ["M", "N", "O", "P", "Q", "R", "S", "T", "U", "V"];

    const hasAlphaProps = letter ? alphaLetters.includes(letter) : false;
    const hasBetaProps = letter ? betaLetters.includes(letter) : false;
    const hasGammaProps = letter ? gammaLetters.includes(letter) : false;

    return {
      hasRadialProps,
      hasNonRadialProps,
      hasHybridOrientation,
      hasAlphaProps,
      hasBetaProps,
      hasGammaProps,
    };
  }

  /**
   * Generate legacy-style placement key
   */
  private generateLegacyStyleKey(
    motionType: string,
    layerInfo: {
      hasRadialProps: boolean;
      hasNonRadialProps: boolean;
      hasHybridOrientation: boolean;
      hasAlphaProps: boolean;
      hasBetaProps: boolean;
      hasGammaProps: boolean;
    },
    letterSuffix: string
  ): string | null {
    // Build the key middle part (matching legacy logic)
    let keyMiddle = "";
    if (layerInfo.hasRadialProps) {
      keyMiddle = "layer1";
    } else if (layerInfo.hasNonRadialProps) {
      keyMiddle = "layer2";
    } else if (layerInfo.hasHybridOrientation) {
      keyMiddle = "layer3";
    }

    // Add prop type
    if (layerInfo.hasAlphaProps) {
      keyMiddle += "_alpha";
    } else if (layerInfo.hasBetaProps) {
      keyMiddle += "_beta";
    } else if (layerInfo.hasGammaProps) {
      keyMiddle += "_gamma";
    }

    // Construct the final key
    if (keyMiddle) {
      return `${motionType}_to_${keyMiddle}${letterSuffix}`;
    }

    return null;
  }

  /**
   * Normalize motion type to standard format
   */
  private normalizeMotionType(motionType: unknown): MotionType {
    if (typeof motionType === "string") {
      const normalized = motionType.toLowerCase();
      switch (normalized) {
        case "pro":
          return MotionType.PRO;
        case "anti":
          return MotionType.ANTI;
        case "float":
          return MotionType.FLOAT;
        case "dash":
          return MotionType.DASH;
        case "static":
          return MotionType.STATIC;
      }
    }
    console.warn(
      `Invalid motion type: ${String(motionType)}, defaulting to 'pro'`
    );
    return MotionType.PRO;
  }
}
