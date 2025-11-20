import type { PictographData } from "$shared";
import type { CodexTransformationOperation } from "$shared";

export interface ICodexPictographUpdater {
  rotateAllPictographs(
    pictographs: PictographData[]
  ): PictographData[];
  mirrorAllPictographs(
    pictographs: PictographData[]
  ): PictographData[];
  colorSwapAllPictographs(
    pictographs: PictographData[]
  ): PictographData[];
  applyOperation(
    pictographs: PictographData[],
    operation: CodexTransformationOperation
  ): PictographData[];
}
