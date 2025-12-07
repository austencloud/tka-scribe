import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
import type { MotionColor, Orientation } from "../../../shared/domain/enums/pictograph-enums";
import type { MotionData } from "../../../shared/domain/models/MotionData";

export interface IOrientationCalculator {
  calculateEndOrientation(motion: MotionData, color: MotionColor): Orientation;
  updateStartOrientations(nextBeat: BeatData, lastBeat: BeatData | StartPositionData): BeatData;
  updateEndOrientations(beat: BeatData): BeatData;
}
