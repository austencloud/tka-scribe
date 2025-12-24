/**
 * Sequence Feature Extractor Service Implementation
 *
 * Extracts analyzable features from sequences for rule-based tagging.
 */

import { inject, injectable } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { ISequenceAnalysisService } from "$lib/features/create/shared/services/contracts/ISequenceAnalysisService";
import type { ISequenceFeatureExtractor } from "../contracts/ISequenceFeatureExtractor";
import type {
	SequenceFeatures,
	MotionComplexity,
	PositionDominance,
	ReversalAnalysis,
} from "../../domain/models/sequence-features";
import { createDefaultSequenceFeatures } from "../../domain/models/sequence-features";
import {
	GridPositionGroup,
	type GridPosition,
} from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import {
	MotionType,
	MotionColor,
} from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

@injectable()
export class SequenceFeatureExtractor implements ISequenceFeatureExtractor {
	constructor(
		@inject(TYPES.ISequenceAnalysisService)
		private readonly sequenceAnalysisService: ISequenceAnalysisService
	) {}

	/**
	 * Extract all analyzable features from a sequence
	 */
	extractFeatures(sequence: SequenceData): SequenceFeatures {
		if (!sequence.beats || sequence.beats.length === 0) {
			return createDefaultSequenceFeatures();
		}

		const validBeats = this.getValidBeats(sequence);
		if (validBeats.length === 0) {
			return createDefaultSequenceFeatures();
		}

		// Use existing SequenceAnalysisService for circularity
		const circularity =
			this.sequenceAnalysisService.analyzeCircularity(sequence);
		const detectedCapTypes =
			this.sequenceAnalysisService.detectCompletedCapTypes(sequence);

		return {
			beatCount: validBeats.length,
			propType: sequence.propType ?? null,
			gridMode: sequence.gridMode ?? null,
			circularity,
			detectedCapTypes,
			reversals: this.analyzeReversals(sequence),
			positionDominance: this.calculatePositionDominance(sequence),
			motionComplexity: this.assessMotionComplexity(sequence),
			usesBothHands: this.usesBothHands(sequence),
			hasConsistentMotions: this.hasConsistentMotions(sequence),
		};
	}

	/**
	 * Analyze reversals in a sequence
	 */
	analyzeReversals(sequence: SequenceData): ReversalAnalysis {
		const validBeats = this.getValidBeats(sequence);

		const blueReversalBeats: number[] = [];
		const redReversalBeats: number[] = [];

		for (const beat of validBeats) {
			if (beat.blueReversal) {
				blueReversalBeats.push(beat.beatNumber);
			}
			if (beat.redReversal) {
				redReversalBeats.push(beat.beatNumber);
			}
		}

		const blueReversalCount = blueReversalBeats.length;
		const redReversalCount = redReversalBeats.length;
		const totalReversals = blueReversalCount + redReversalCount;

		// Check if reversals are synchronized (occur at same beats)
		const synchronizedReversals =
			blueReversalCount > 0 &&
			blueReversalCount === redReversalCount &&
			blueReversalBeats.every((beat) => redReversalBeats.includes(beat));

		return {
			blueReversalCount,
			redReversalCount,
			totalReversals,
			hasReversals: totalReversals > 0,
			synchronizedReversals,
			blueReversalBeats,
			redReversalBeats,
		};
	}

	/**
	 * Calculate position group dominance
	 */
	calculatePositionDominance(sequence: SequenceData): PositionDominance {
		const validBeats = this.getValidBeats(sequence);

		if (validBeats.length === 0) {
			return {
				primaryGroup: null,
				alphaPercent: 0,
				betaPercent: 0,
				gammaPercent: 0,
				isAlphaHeavy: false,
				isBetaHeavy: false,
				isGammaHeavy: false,
				isBalanced: true,
			};
		}

		let alphaCount = 0;
		let betaCount = 0;
		let gammaCount = 0;
		let totalPositions = 0;

		for (const beat of validBeats) {
			// Count start positions
			if (beat.startPosition) {
				const group = this.getPositionGroup(beat.startPosition);
				this.incrementGroupCount(group, () => alphaCount++, () => betaCount++, () => gammaCount++);
				totalPositions++;
			}

			// Count end positions
			if (beat.endPosition) {
				const group = this.getPositionGroup(beat.endPosition);
				this.incrementGroupCount(group, () => alphaCount++, () => betaCount++, () => gammaCount++);
				totalPositions++;
			}
		}

		if (totalPositions === 0) {
			return {
				primaryGroup: null,
				alphaPercent: 0,
				betaPercent: 0,
				gammaPercent: 0,
				isAlphaHeavy: false,
				isBetaHeavy: false,
				isGammaHeavy: false,
				isBalanced: true,
			};
		}

		const alphaPercent = Math.round((alphaCount / totalPositions) * 100);
		const betaPercent = Math.round((betaCount / totalPositions) * 100);
		const gammaPercent = Math.round((gammaCount / totalPositions) * 100);

		const isAlphaHeavy = alphaPercent > 50;
		const isBetaHeavy = betaPercent > 50;
		const isGammaHeavy = gammaPercent > 50;

		// Balanced if no single group exceeds 40%
		const isBalanced = alphaPercent <= 40 && betaPercent <= 40 && gammaPercent <= 40;

		// Determine primary group
		let primaryGroup: GridPositionGroup | null = null;
		if (alphaCount >= betaCount && alphaCount >= gammaCount && alphaCount > 0) {
			primaryGroup = GridPositionGroup.ALPHA;
		} else if (betaCount >= alphaCount && betaCount >= gammaCount && betaCount > 0) {
			primaryGroup = GridPositionGroup.BETA;
		} else if (gammaCount > 0) {
			primaryGroup = GridPositionGroup.GAMMA;
		}

		return {
			primaryGroup,
			alphaPercent,
			betaPercent,
			gammaPercent,
			isAlphaHeavy,
			isBetaHeavy,
			isGammaHeavy,
			isBalanced,
		};
	}

	/**
	 * Assess motion complexity
	 */
	assessMotionComplexity(sequence: SequenceData): MotionComplexity {
		const validBeats = this.getValidBeats(sequence);

		if (validBeats.length === 0) {
			return "static";
		}

		const reversals = this.analyzeReversals(sequence);
		const motionTypes = this.collectMotionTypes(validBeats);

		// Static: only static motion type or no motions
		if (motionTypes.size === 0 || (motionTypes.size === 1 && motionTypes.has(MotionType.STATIC))) {
			return "static";
		}

		// Complex: multiple motion types AND reversals, or many different motion types
		if (motionTypes.size >= 3 || (motionTypes.size >= 2 && reversals.totalReversals > 2)) {
			return "complex";
		}

		// Moderate: some reversals or multiple motion types
		if (reversals.hasReversals || motionTypes.size >= 2) {
			return "moderate";
		}

		// Simple: single non-static motion type, no reversals
		return "simple";
	}

	/**
	 * Check if sequence uses both hands consistently
	 */
	usesBothHands(sequence: SequenceData): boolean {
		const validBeats = this.getValidBeats(sequence);

		if (validBeats.length === 0) {
			return false;
		}

		let hasBlue = false;
		let hasRed = false;

		for (const beat of validBeats) {
			if (beat.motions) {
				if (beat.motions[MotionColor.BLUE]) {
					hasBlue = true;
				}
				if (beat.motions[MotionColor.RED]) {
					hasRed = true;
				}
			}

			if (hasBlue && hasRed) {
				return true;
			}
		}

		return hasBlue && hasRed;
	}

	/**
	 * Check if sequence has consistent motion types
	 */
	hasConsistentMotions(sequence: SequenceData): boolean {
		const validBeats = this.getValidBeats(sequence);

		if (validBeats.length === 0) {
			return true;
		}

		const motionTypes = this.collectMotionTypes(validBeats);

		// Consistent if only one motion type (excluding static)
		const nonStaticTypes = new Set(motionTypes);
		nonStaticTypes.delete(MotionType.STATIC);

		return nonStaticTypes.size <= 1;
	}

	// === Private Helpers ===

	private getValidBeats(sequence: SequenceData): BeatData[] {
		if (!sequence.beats) {
			return [];
		}
		return sequence.beats.filter((beat) => !beat.isBlank);
	}

	private getPositionGroup(position: GridPosition): GridPositionGroup | null {
		const posStr = position.toString().toLowerCase();

		if (posStr.startsWith("alpha")) {
			return GridPositionGroup.ALPHA;
		}
		if (posStr.startsWith("beta")) {
			return GridPositionGroup.BETA;
		}
		if (posStr.startsWith("gamma")) {
			return GridPositionGroup.GAMMA;
		}

		return null;
	}

	private incrementGroupCount(
		group: GridPositionGroup | null,
		incAlpha: () => void,
		incBeta: () => void,
		incGamma: () => void
	): void {
		switch (group) {
			case GridPositionGroup.ALPHA:
				incAlpha();
				break;
			case GridPositionGroup.BETA:
				incBeta();
				break;
			case GridPositionGroup.GAMMA:
				incGamma();
				break;
		}
	}

	private collectMotionTypes(beats: BeatData[]): Set<MotionType> {
		const types = new Set<MotionType>();

		for (const beat of beats) {
			if (beat.motions) {
				const blueMotion = beat.motions[MotionColor.BLUE];
				const redMotion = beat.motions[MotionColor.RED];

				if (blueMotion?.motionType) {
					types.add(blueMotion.motionType);
				}
				if (redMotion?.motionType) {
					types.add(redMotion.motionType);
				}
			}
		}

		return types;
	}
}
