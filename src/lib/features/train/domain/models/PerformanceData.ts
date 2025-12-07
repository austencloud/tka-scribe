import type { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { DetectionFrame, DetectionSource } from "./DetectionFrame";

export interface BeatResult {
  beatNumber: number;
  expected: { blue: GridLocation; red: GridLocation };
  detected: { blue: GridLocation | null; red: GridLocation | null };
  timing: TimingGrade;
  timingDeltaMs: number;
  positionCorrect: { blue: boolean; red: boolean };
}

export type TimingGrade = "perfect" | "good" | "early" | "late" | "miss";

export interface PerformanceScore {
  percentage: number;
  grade: PerformanceGrade;
  perfectHits: number;
  goodHits: number;
  misses: number;
  maxCombo: number;
  xpEarned: number;
}

export type PerformanceGrade = "S" | "A" | "B" | "C" | "D" | "F";

export interface PerformanceData {
  id: string;
  sequenceId: string;
  sequenceName: string;
  performedAt: Date;
  detectionMethod: DetectionSource;
  bpm: number;
  frames: DetectionFrame[];
  beatResults: BeatResult[];
  score: PerformanceScore;
  videoBlob?: Blob;
}
