import type { BeatData, PictographData } from "$shared";
import type { StartPositionData } from "$create/shared";

export interface IPictographFilterService {
  filterByContinuity(
    options: PictographData[],
    lastBeat: BeatData | StartPositionData | null
  ): PictographData[];
  filterByRotation(
    options: PictographData[],
    blueRotationDirection: string,
    redRotationDirection: string
  ): PictographData[];
  filterStartPositions(options: PictographData[]): PictographData[];
  selectRandom<T>(array: T[]): T;
}
