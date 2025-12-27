/**
 * Pictograph Batch Preparer
 *
 * Utility for pre-calculating positions for multiple pictographs at once.
 * Used by option grids to prepare all pictographs before rendering,
 * eliminating the cascade effect and improving performance.
 *
 * DESIGN PHILOSOPHY:
 * - Batch calculation (all pictographs at once, not sequentially)
 * - Returns extended data with _prepared field
 * - Parallelizes work across pictographs
 * - Handles errors gracefully (returns partial data if some fail)
 */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { IArrowLifecycleManager } from "$lib/shared/pictograph/arrow/orchestration/services/contracts/IArrowLifecycleManager";
import type { IPropSvgLoader } from "$lib/shared/pictograph/prop/services/contracts/IPropSvgLoader";
import type { IPropPlacer } from "$lib/shared/pictograph/prop/services/contracts/IPropPlacer";
import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
import type { PropPosition } from "$lib/shared/pictograph/prop/domain/models/PropPosition";
import type { PropAssets } from "$lib/shared/pictograph/prop/domain/models/PropAssets";
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import type { ArrowAssets } from "$lib/shared/pictograph/arrow/orchestration/domain/arrow-models";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { getSettings } from "$lib/shared/application/state/app-state.svelte";

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

/**
 * Prepares a batch of pictographs with pre-calculated positions
 */
export async function preparePictographBatch(
  pictographs: PictographData[],
  arrowLifecycleManager: IArrowLifecycleManager,
  propSvgLoader: IPropSvgLoader,
  PropPlacer: IPropPlacer,
  gridModeDeriver: IGridModeDeriver
): Promise<PreparedPictographData[]> {
  // Process all pictographs in parallel for maximum performance
  const prepared = await Promise.all(
    pictographs.map(async (pictograph) => {
      try {
        return await prepareSinglePictograph(
          pictograph,
          arrowLifecycleManager,
          propSvgLoader,
          PropPlacer,
          gridModeDeriver
        );
      } catch (error) {
        console.error("Failed to prepare pictograph:", pictograph.id, error);
        // Return unprepared pictograph on error (graceful degradation)
        return pictograph as PreparedPictographData;
      }
    })
  );

  return prepared;
}

/**
 * Prepares a single pictograph with all positions calculated
 */
async function prepareSinglePictograph(
  pictograph: PictographData,
  arrowLifecycleManager: IArrowLifecycleManager,
  propSvgLoader: IPropSvgLoader,
  PropPlacer: IPropPlacer,
  gridModeDeriver: IGridModeDeriver
): Promise<PreparedPictographData> {
  // Derive grid mode
  let gridMode = GridMode.DIAMOND;
  if (pictograph.motions?.blue && pictograph.motions?.red) {
    try {
      gridMode = gridModeDeriver.deriveGridMode(
        pictograph.motions.blue,
        pictograph.motions.red
      );
    } catch {
      // Use default on error
    }
  }

  // Calculate arrow positions
  const arrowResult =
    await arrowLifecycleManager.coordinateArrowLifecycle(pictograph);

  // Calculate prop positions
  const { propPositions, propAssets } = await calculatePropPositions(
    pictograph,
    propSvgLoader,
    PropPlacer
  );

  // Return pictograph with prepared data attached
  return {
    ...pictograph,
    _prepared: {
      gridMode,
      arrowPositions: arrowResult.positions,
      arrowAssets: arrowResult.assets,
      arrowMirroring: arrowResult.mirroring,
      propPositions,
      propAssets,
    },
  };
}

/**
 * Calculate prop positions for a pictograph
 * (Similar logic to pictograph-state.svelte.ts)
 */
async function calculatePropPositions(
  pictograph: PictographData,
  propSvgLoader: IPropSvgLoader,
  PropPlacer: IPropPlacer
): Promise<{
  propPositions: Record<string, PropPosition>;
  propAssets: Record<string, PropAssets>;
}> {
  if (!pictograph.motions) {
    return { propPositions: {}, propAssets: {} };
  }

  const positions: Record<string, PropPosition> = {};
  const assets: Record<string, PropAssets> = {};

  // Apply prop type overrides from settings
  const settings = getSettings();
  const motionsWithOverrides = Object.entries(pictograph.motions)
    .filter((entry): entry is [string, MotionData] => entry[1] !== undefined)
    .map(([color, motionData]) => {
      const settingsPropType =
        color === "blue" ? settings.bluePropType : settings.redPropType;

      if (settingsPropType) {
        return [
          color,
          {
            ...motionData,
            propType: settingsPropType,
          } as MotionData,
        ] as [string, MotionData];
      }

      return [color, motionData] as [string, MotionData];
    });

  // Calculate all prop positions in parallel
  await Promise.all(
    motionsWithOverrides.map(async ([color, motionData]) => {
      try {
        if (!motionData.propPlacementData) {
          throw new Error("No prop placement data available");
        }

        // Load assets and calculate position in parallel
        const [renderData, placementData] = await Promise.all([
          propSvgLoader.loadPropSvg(motionData.propPlacementData, motionData),
          PropPlacer.calculatePlacement(pictograph, motionData),
        ]);

        if (!renderData.svgData) {
          throw new Error("Failed to load prop SVG data");
        }

        // Transform to expected format
        const propAssets = {
          imageSrc: renderData.svgData.svgContent,
          viewBox: `${renderData.svgData.viewBox.width} ${renderData.svgData.viewBox.height}`,
          center: renderData.svgData.center,
        };

        const position = {
          x: placementData.positionX,
          y: placementData.positionY,
          rotation: placementData.rotationAngle,
        };

        positions[color] = position;
        assets[color] = propAssets;
      } catch (error) {
        console.warn(`Failed to calculate ${color} prop:`, error);
        // Continue with other props on error
      }
    })
  );

  return { propPositions: positions, propAssets: assets };
}
