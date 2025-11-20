/**
 * Data Transformation Service Interface
 */

import type { BeatData, GridData, GridMode, PictographData } from "$shared";
import type { GridPointData as RawGridData } from "$shared";

export interface IDataTransformer {
  beatToPictographData(beat: BeatData): PictographData;
  adaptGridData(rawGridData: RawGridData, mode: GridMode): GridData;
}
