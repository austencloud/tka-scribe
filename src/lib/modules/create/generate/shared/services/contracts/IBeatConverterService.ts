import type { BeatData, PictographData } from "$shared";
import type { GridMode } from "$shared";

export interface IBeatConverterService {
  convertToBeat(
    pictograph: PictographData,
    beatNumber: number,
    gridMode: GridMode
  ): BeatData;
}
