/**
 * PictographPreparerService - Batch prepares pictographs with positions
 *
 * Single responsibility: Calculate arrow/prop positions for multiple pictographs.
 * Used before rendering to eliminate cascade effects.
 */

import { injectable, inject } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
import type { IArrowLifecycleManager } from "$lib/shared/pictograph/arrow/orchestration/services/contracts/IArrowLifecycleManager";
import type { IPropSvgLoader } from "$lib/shared/pictograph/prop/services/contracts/IPropSvgLoader";
import type { IPropPlacementService } from "$lib/shared/pictograph/prop/services/contracts/IPropPlacementService";
import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
import type { PropPosition } from "$lib/shared/pictograph/prop/domain/models/PropPosition";
import type { PropAssets } from "$lib/shared/pictograph/prop/domain/models/PropAssets";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { getSettings } from "$lib/shared/application/state/app-state.svelte";
import type {
  IPictographPreparer,
  PreparedPictographData,
} from "../contracts/IPictographPreparer";

@injectable()
export class PictographPreparerService implements IPictographPreparer {
  constructor(
    @inject(TYPES.IArrowLifecycleManager)
    private arrowManager: IArrowLifecycleManager,
    @inject(TYPES.IPropSvgLoader) private propLoader: IPropSvgLoader,
    @inject(TYPES.IPropPlacementService)
    private propPlacement: IPropPlacementService,
    @inject(TYPES.IGridModeDeriver) private gridModeDeriver: IGridModeDeriver
  ) {}

  async prepareBatch(
    pictographs: PictographData[]
  ): Promise<PreparedPictographData[]> {
    return Promise.all(
      pictographs.map(async (p) => {
        try {
          return await this.prepareSingle(p);
        } catch (error) {
          console.error("Failed to prepare pictograph:", p.id, error);
          return p as PreparedPictographData;
        }
      })
    );
  }

  private async prepareSingle(
    pictograph: PictographData
  ): Promise<PreparedPictographData> {
    const gridMode = this.deriveGridMode(pictograph);
    const arrowResult =
      await this.arrowManager.coordinateArrowLifecycle(pictograph);
    const { propPositions, propAssets } = await this.calculateProps(pictograph);

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

  private deriveGridMode(pictograph: PictographData): GridMode {
    if (!pictograph.motions?.blue || !pictograph.motions?.red) {
      return GridMode.DIAMOND;
    }
    try {
      return this.gridModeDeriver.deriveGridMode(
        pictograph.motions.blue,
        pictograph.motions.red
      );
    } catch {
      return GridMode.DIAMOND;
    }
  }

  private async calculateProps(pictograph: PictographData): Promise<{
    propPositions: Record<string, PropPosition>;
    propAssets: Record<string, PropAssets>;
  }> {
    if (!pictograph.motions) {
      return { propPositions: {}, propAssets: {} };
    }

    const positions: Record<string, PropPosition> = {};
    const assets: Record<string, PropAssets> = {};
    const settings = getSettings();

    const motions = this.getMotionsWithOverrides(pictograph, settings);

    await Promise.all(
      motions.map(async ([color, motion]) => {
        try {
          if (!motion.propPlacementData) return;

          const [renderData, placementData] = await Promise.all([
            this.propLoader.loadPropSvg(motion.propPlacementData, motion),
            this.propPlacement.calculatePlacement(pictograph, motion),
          ]);

          if (!renderData.svgData) return;

          assets[color] = {
            imageSrc: renderData.svgData.svgContent,
            viewBox: `${renderData.svgData.viewBox.width} ${renderData.svgData.viewBox.height}`,
            center: renderData.svgData.center,
          };

          positions[color] = {
            x: placementData.positionX,
            y: placementData.positionY,
            rotation: placementData.rotationAngle,
          };
        } catch (error) {
          console.warn(`Failed to calculate ${color} prop:`, error);
        }
      })
    );

    return { propPositions: positions, propAssets: assets };
  }

  private getMotionsWithOverrides(
    pictograph: PictographData,
    settings: ReturnType<typeof getSettings>
  ): [string, MotionData][] {
    return Object.entries(pictograph.motions || {})
      .filter((entry): entry is [string, MotionData] => entry[1] !== undefined)
      .map(([color, motion]) => {
        const override =
          color === "blue" ? settings.bluePropType : settings.redPropType;
        if (override) {
          return [color, { ...motion, propType: override }] as [
            string,
            MotionData,
          ];
        }
        return [color, motion] as [string, MotionData];
      });
  }
}
