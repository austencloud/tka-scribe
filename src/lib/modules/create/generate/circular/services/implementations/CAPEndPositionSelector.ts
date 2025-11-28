import { GridPosition } from "$shared/index";
import { inject, injectable } from "inversify";
import { TYPES } from "$shared/inversify/types";

import {
  SWAPPED_POSITION_MAP,
  VERTICAL_MIRROR_POSITION_MAP,
} from "../../domain/constants/strict-cap-position-maps";
import { CAPType, SliceSize } from "../../domain/models/circular-models";
import type { ICAPEndPositionSelector } from "../contracts/ICAPEndPositionSelector";
import type { IRotatedEndPositionSelector } from "../contracts/IRotatedEndPositionSelector";

/**
 * Service for determining required end positions for different CAP types
 *
 * Routes to the appropriate position calculation based on CAP type:
 * - Rotated (with or without Inverted/Swapped): Uses rotation maps (depends on slice size)
 * - Mirrored (with or without Inverted/Swapped): Uses vertical mirror map
 * - Swapped + Inverted (no Rotated/Mirrored): Returns to start position
 * - Inverted alone: Returns to start position (no transformation)
 * - Swapped alone: Uses swap position map
 *
 * Precedence order when combined:
 * 1. ROTATED (rotation takes precedence)
 * 2. MIRRORED (mirror takes precedence over inverted/swapped)
 * 3. INVERTED (return to start takes precedence over swapped)
 * 4. SWAPPED (only for strict swapped)
 */
@injectable()
export class CAPEndPositionSelector implements ICAPEndPositionSelector {
  constructor(
    @inject(TYPES.IRotatedEndPositionSelector)
    private readonly rotatedEndPositionSelector: IRotatedEndPositionSelector
  ) {}

  /**
   * Determine the required end position based on CAP type
   */
  determineEndPosition(
    capType: CAPType,
    startPosition: GridPosition,
    sliceSize: SliceSize
  ): GridPosition {
    switch (capType) {
      // Strict CAP types
      case CAPType.STRICT_ROTATED:
        // Rotated CAP uses rotation maps (halved or quartered)
        return this.rotatedEndPositionSelector.determineRotatedEndPosition(
          sliceSize,
          startPosition
        );

      case CAPType.STRICT_MIRRORED: {
        // Mirrored CAP uses vertical mirror map
        const mirroredEnd = VERTICAL_MIRROR_POSITION_MAP[startPosition];
        return mirroredEnd;
      }

      case CAPType.STRICT_SWAPPED: {
        // Swapped CAP uses swap position map
        const swappedEnd = SWAPPED_POSITION_MAP[startPosition];
        return swappedEnd;
      }

      case CAPType.STRICT_INVERTED:
        // Inverted CAP returns to start position (same position)
        return startPosition;

      // Combined CAP types with ROTATED (rotation takes precedence)
      case CAPType.ROTATED_INVERTED:
      case CAPType.ROTATED_SWAPPED:
        // Any rotation-based CAP uses rotation maps
        return this.rotatedEndPositionSelector.determineRotatedEndPosition(
          sliceSize,
          startPosition
        );

      // MIRRORED_ROTATED: Two-step composition
      // First applies rotation (halved or quartered), then mirroring
      // End position must satisfy the rotation requirement for the chosen slice size
      case CAPType.MIRRORED_ROTATED:
        // Use the user-selected slice size for rotation (rotation returns to home)
        return this.rotatedEndPositionSelector.determineRotatedEndPosition(
          sliceSize,
          startPosition
        );

      // MIRRORED_INVERTED_ROTATED: Three-step composition
      // First applies rotation (halved or quartered), then inverted mirroring
      // End position must satisfy the rotation requirement for the chosen slice size
      case CAPType.MIRRORED_INVERTED_ROTATED:
        // Use the user-selected slice size for rotation (rotation returns to home)
        return this.rotatedEndPositionSelector.determineRotatedEndPosition(
          sliceSize,
          startPosition
        );

      // MIRRORED_ROTATED_INVERTED_SWAPPED: Four-step composition
      // First applies rotation (halved or quartered), then mirrored+swapped+inverted
      // End position must satisfy the rotation requirement for the chosen slice size
      case CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED:
        // Use the user-selected slice size for rotation (rotation returns to home)
        return this.rotatedEndPositionSelector.determineRotatedEndPosition(
          sliceSize,
          startPosition
        );

      // Combined CAP types with MIRRORED (mirror takes precedence)
      case CAPType.MIRRORED_INVERTED:
      case CAPType.MIRRORED_SWAPPED:
        // Any mirrored CAP uses vertical mirror map
        return VERTICAL_MIRROR_POSITION_MAP[startPosition];

      // Combined CAP types with SWAPPED + INVERTED
      case CAPType.SWAPPED_INVERTED:
        // Inverted takes precedence - return to start position
        return startPosition;

      default:
        throw new Error(
          `CAP type "${capType}" is not yet implemented. ` +
            `Currently supported: STRICT_ROTATED, STRICT_MIRRORED, STRICT_SWAPPED, ` +
            `STRICT_INVERTED, MIRRORED_INVERTED, MIRRORED_SWAPPED, ` +
            `ROTATED_INVERTED, ROTATED_SWAPPED, SWAPPED_INVERTED, MIRRORED_ROTATED, ` +
            `MIRRORED_INVERTED_ROTATED, MIRRORED_ROTATED_INVERTED_SWAPPED`
        );
    }
  }
}
