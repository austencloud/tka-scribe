import type { MotionData, PictographData } from "$lib/domain";
import { MotionType } from "$lib/domain/enums";
import { ArrowPlacementKeyService } from "../../../implementations/ArrowPlacementKeyService";
import type { IPlacementKeyGenerator } from "../../data-services";

/**
 * PlacementKeyGenerator
 * Adapter around ArrowPlacementKeyService to implement IPlacementKeyGenerator.
 */
export class PlacementKeyGenerator implements IPlacementKeyGenerator {
  private service = new ArrowPlacementKeyService();

  private stringToMotionType(motionTypeStr: string): MotionType {
    switch (motionTypeStr.toLowerCase()) {
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
      default:
        return MotionType.PRO;
    }
  }

  generatePlacementKey(
    motionData: MotionData,
    pictographData: PictographData,
    defaultPlacements: Record<string, unknown>,
    _gridMode?: string
  ): string {
    // Interpret defaultPlacements as a set of available keys
    const availableKeys = Object.keys(defaultPlacements || {});
    if (availableKeys.length === 0) {
      // Fall back: pick the first candidate from service
      const candidates = this.service.debugCandidateKeys(
        motionData,
        pictographData
      );
      return (
        candidates[0] ??
        this.service.generateBasicKey(
          this.stringToMotionType(
            (motionData as { motion_type?: string }).motion_type || "pro"
          )
        )
      );
    }

    const candidates = this.service.debugCandidateKeys(
      motionData,
      pictographData
    );
    for (const key of candidates) {
      if (availableKeys.includes(key)) return key;
    }
    // Fallback to basic
    return this.service.generateBasicKey(
      this.stringToMotionType(
        (motionData as { motion_type?: string }).motion_type || "pro"
      )
    );
  }
}
