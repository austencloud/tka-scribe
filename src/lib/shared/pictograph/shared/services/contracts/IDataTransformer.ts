/**
 * Data Transformation Service Interface
 */

import type { PictographData } from "../../domain/models/PictographData";
import type { GridPointData as RawGridData, GridData } from "../../../grid/domain/models/grid-models";
import { GridMode } from "../../../grid/domain/enums/grid-enums";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";

export interface IDataTransformer {
  beatToPictographData(beat: BeatData): PictographData;
  adaptGridData(rawGridData: RawGridData, mode: GridMode): GridData;
}
