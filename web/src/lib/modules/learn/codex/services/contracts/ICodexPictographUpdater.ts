import type { PictographData } from "$shared";
import type { CodexTransformationOperation } from "$shared";

export interface ICodexPictographUpdater {
  rotateAllPictographs(
    pictographs: PictographData[]
  ): Promise<PictographData[]>;
  mirrorAllPictographs(
    pictographs: PictographData[]
  ): Promise<PictographData[]>;
  colorSwapAllPictographs(
    pictographs: PictographData[]
  ): Promise<PictographData[]>;
  applyOperation(
    pictographs: PictographData[],
    operation: CodexTransformationOperation
  ): Promise<PictographData[]>;
}
