import type { BeatData, PictographData, GridMode } from "$shared";
import type { StartPositionData } from "$create/shared";

export interface IBeatConverterService {
  /**
   * Convert PictographData to BeatData - creates proper domain object for beats
   */
  convertToBeat(
    pictograph: PictographData,
    beatNumber: number,
    gridMode: GridMode
  ): BeatData;

  /**
   * Convert PictographData to StartPositionData - creates proper domain object for start positions
   */
  convertToStartPosition(
    pictograph: PictographData,
    gridMode: GridMode
  ): StartPositionData;
}
