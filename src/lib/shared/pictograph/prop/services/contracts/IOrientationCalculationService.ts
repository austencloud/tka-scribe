import type { BeatData, StartPositionData } from "$create/shared";
import type { MotionColor, MotionData, Orientation } from "../../../shared";

export interface IOrientationCalculator {
  calculateEndOrientation(motion: MotionData, color: MotionColor): Orientation;
  updateStartOrientations(nextBeat: BeatData, lastBeat: BeatData | StartPositionData): BeatData;
  updateEndOrientations(beat: BeatData): BeatData;
}
