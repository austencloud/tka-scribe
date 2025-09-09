import type { BeatData } from "../../../../../modules/build/workbench";
import type { MotionData, MotionColor, Orientation } from "../../../shared";

export interface IOrientationCalculationService {
  calculateEndOrientation(motion: MotionData, color: MotionColor): Orientation;
  updateStartOrientations(nextBeat: BeatData, lastBeat: BeatData): BeatData;
  updateEndOrientations(beat: BeatData): BeatData;
}
