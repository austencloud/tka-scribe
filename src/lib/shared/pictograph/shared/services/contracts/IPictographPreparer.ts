/**
 * IPictographPreparer - Contract for pictograph preparation
 *
 * Prepares pictographs with pre-calculated positions for efficient rendering.
 * Used before rendering to eliminate per-component async calculations.
 */

import type { PictographData } from "../../domain/models/PictographData";
import type { PreparedPictographData } from "../../domain/models/PreparedPictographData";

// Re-export for convenience
export type { PreparedPictographData };

export interface IPictographPreparer {
  /**
   * Prepare a batch of pictographs with pre-calculated positions
   * Processes all pictographs in parallel for performance
   */
  prepareBatch(pictographs: PictographData[]): Promise<PreparedPictographData[]>;

  /**
   * Prepare a single pictograph with pre-calculated positions
   */
  prepareSingle(pictograph: PictographData): Promise<PreparedPictographData>;
}
