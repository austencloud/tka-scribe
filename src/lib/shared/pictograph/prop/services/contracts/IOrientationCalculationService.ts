import type { BeatData } from "$build/shared";
import type { MotionColor, MotionData, Orientation } from "../../../shared";

export interface IOrientationCalculator {
  calculateEndOrientation(motion: MotionData, color: MotionColor): Orientation;
  updateStartOrientations(nextBeat: BeatData, lastBeat: BeatData): BeatData;
  updateEndOrientations(beat: BeatData): BeatData;
}
