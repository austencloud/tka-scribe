import type { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { DetectionFrame } from "../../domain/models/DetectionFrame";
import type {
	BeatResult,
	PerformanceScore,
	PerformanceGrade
} from "../../domain/models/PerformanceData";

export interface ExpectedBeatPosition {
	beatNumber: number;
	blue: GridLocation;
	red: GridLocation;
	timestamp: number;
}

export interface IPerformanceScoringService {
	scoreBeat(
		detected: DetectionFrame,
		expected: ExpectedBeatPosition,
		currentCombo: number
	): BeatResult;

	calculateFinalScore(beatResults: BeatResult[]): PerformanceScore;

	getGradeForPercentage(percentage: number): PerformanceGrade;

	getComboMultiplier(combo: number): number;
}
