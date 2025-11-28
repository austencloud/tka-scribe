/**
 * Factory function for creating StartPositionData
 *
 * Creates a start position with proper type discriminator.
 * Start positions represent initial prop configurations before sequence begins.
 */
import type { StartPositionData } from "../models/StartPositionData";
import { GridPosition } from "$shared/pictograph/grid/domain/enums/grid-enums";
import type { Letter } from "$shared/foundation/domain/models/Letter";
import { MotionColor } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
import type { MotionData } from "$shared/pictograph/shared/domain/models/MotionData";

export function createStartPositionData(
  data: Partial<StartPositionData> = {}
): StartPositionData {
  return {
    // Type discriminator
    isStartPosition: true as const,

    // PictographData properties
    id: data.id ?? crypto.randomUUID(),
    letter: data.letter ?? null,
    startPosition: data.startPosition ?? null,
    endPosition: data.endPosition ?? null,
    motions: data.motions ?? {},

    // StartPosition-specific properties
    gridPosition: data.gridPosition ?? null,

    // Selection state
    ...(data.isSelected !== undefined && { isSelected: data.isSelected }),
  };
}
