import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";
import type { CodexTransformationOperation } from "$shared/index";

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
