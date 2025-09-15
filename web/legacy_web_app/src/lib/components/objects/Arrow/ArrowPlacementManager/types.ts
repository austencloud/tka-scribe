// src/lib/components/PlacementManagers/ArrowPlacementManager/types.ts
import type { PictographData } from "$legacyLib/types/PictographData";
import type { GridData } from "$legacyLib/components/objects/Grid/GridData";
import type { PictographChecker } from "$legacyLib/components/Pictograph/services/PictographChecker";
import type {
  GridMode,
  PropRotDir,
  ShiftHandRotDir,
  MotionType,
} from "$legacyLib/types/Types";
import type { Motion } from "$legacyLib/components/objects/Motion/Motion";

export type ArrowPlacementConfig = {
  pictographData: PictographData;
  gridData: GridData;
  checker: PictographChecker;
};
export type Coordinates = {
  x: number;
  y: number;
};
export type DirectionTuple = [number, number];
export type DirectionTupleSet = DirectionTuple[];
export type PlacementFunction = (pointName: string) => Coordinates | null;
export type TupleMapDefinition = Record<PropRotDir, DirectionTupleSet>;
