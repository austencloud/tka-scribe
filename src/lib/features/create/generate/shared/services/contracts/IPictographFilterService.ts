import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";

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
