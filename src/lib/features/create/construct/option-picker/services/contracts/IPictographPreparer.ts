/**
 * IPictographPreparer - Contract for batch pictograph preparation
 *
 * Prepares pictographs with pre-calculated positions for efficient rendering.
 */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { PreparedPictographData } from "$lib/shared/pictograph/option/PreparedPictographData";

// Re-export for convenience
export type { PreparedPictographData };

export interface IPictographPreparer {
  /**
   * Prepare a batch of pictographs with pre-calculated positions
   * Processes all pictographs in parallel for performance
   */
  prepareBatch(
    pictographs: PictographData[]
  ): Promise<PreparedPictographData[]>;
}
