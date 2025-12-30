/**
 * PreparedPictographData - Shared type for pre-calculated pictograph data
 *
 * Used by option picker components in both desktop and mobile hierarchies.
 * Contains pre-calculated positions for arrows, props, and grid mode.
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
