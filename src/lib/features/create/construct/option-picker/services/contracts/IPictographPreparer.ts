/**
 * IPictographPreparer - Contract for batch pictograph preparation
 *
 * Prepares pictographs with pre-calculated positions for efficient rendering.
 */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { PropPosition } from "$lib/shared/pictograph/prop/domain/models/PropPosition";
import type { PropAssets } from "$lib/shared/pictograph/prop/domain/models/PropAssets";
import type { ArrowAssets } from "$lib/shared/pictograph/arrow/orchestration/domain/arrow-models";

/**
 * Extended pictograph data with pre-calculated positions
 */
export interface PreparedPictographData extends PictographData {
  _prepared?: {
    gridMode: GridMode;
    arrowPositions: Record<string, { x: number; y: number; rotation: number }>;
    arrowAssets: Record<string, ArrowAssets>;
    arrowMirroring: Record<string, boolean>;
    propPositions: Record<string, PropPosition>;
    propAssets: Record<string, PropAssets>;
  };
}

export interface IPictographPreparer {
  /**
   * Prepare a batch of pictographs with pre-calculated positions
   * Processes all pictographs in parallel for performance
   */
  prepareBatch(
    pictographs: PictographData[]
  ): Promise<PreparedPictographData[]>;
}
