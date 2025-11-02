/**
 * Beat Domain Model - Shared
 *
 * Unified beat data structure that combines pictograph data with beat context.
 * Used across build and animator modules for all beat-related operations.
 */
import type { PictographData } from "../../../../../shared/pictograph/shared/domain/models/PictographData";

export interface BeatData extends PictographData {
  // Beat context properties
  readonly beatNumber: number;
  readonly duration: number;
  readonly blueReversal: boolean;
  readonly redReversal: boolean;
  readonly isBlank: boolean;
  readonly isSelected?: boolean;
}
