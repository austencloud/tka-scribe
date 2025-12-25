import { injectable, inject, optional } from 'inversify';
import type { SequenceEntry } from '../../domain/models/sequence-models';
import type {
	ICAPDetectionService,
	CAPDetectionResult,
	CompoundPattern,
	ModularPattern
} from '../contracts/ICAPDetectionService';
import type { TransformationIntervals } from '../../domain/models/label-models';
import type { IBeatComparisonOrchestrator } from '../contracts/IBeatComparisonOrchestrator';
import type { ITransformationAnalysisService } from '../contracts/ITransformationAnalysisService';
import type { ICandidateFormattingService } from '../contracts/ICandidateFormattingService';
import type {
	IPolyrhythmicDetectionService,
	PolyrhythmicCAPResult
} from '../contracts/IPolyrhythmicDetectionService';
import type { InternalBeatPair, CandidateInfo } from '../../domain/models/internal-beat-models';
import type { ComponentId } from '../../domain/constants/cap-components';
import { CAPLabelerTypes } from '$lib/shared/inversify/types/cap-labeler.types';

/**
 * Service for detecting Circular Alternating Patterns (CAPs) in sequences.
 * Orchestrates the detection process using specialized services.
 */
@injectable()
export class CAPDetectionService implements ICAPDetectionService {
	constructor(
		@inject(CAPLabelerTypes.IBeatComparisonOrchestrator)
		private comparisonOrchestrator: IBeatComparisonOrchestrator,
		@inject(CAPLabelerTypes.ITransformationAnalysisService)
		private analysisService: ITransformationAnalysisService,
		@inject(CAPLabelerTypes.ICandidateFormattingService)
		private formattingService: ICandidateFormattingService,
		@inject(CAPLabelerTypes.IPolyrhythmicDetectionService)
		@optional()
		private polyrhythmicService?: IPolyrhythmicDetectionService
	) {
		console.log(
			'[CAPDetectionService] Constructed with polyrhythmic service:',
			!!polyrhythmicService
		);
	}

	isCircular(sequence: SequenceEntry): boolean {
		const beats = sequence.fullMetadata?.sequence?.filter(
			(b) => typeof b.beat === 'number' && b.beat >= 1
		);
		if (!beats || beats.length < 2) return false;

		const startPosition = sequence.fullMetadata?.sequence?.find((b) => b.beat === 0);
		const lastBeat = beats[beats.length - 1];
		if (!startPosition || !lastBeat) return false;

		const startPos = startPosition.endPos || startPosition.sequenceStartPosition;
		const endPos = lastBeat.endPos;
		return startPos === endPos;
	}

	detectCAP(sequence: SequenceEntry): CAPDetectionResult {
		console.log('[CAPDetectionService] detectCAP called for:', sequence.word);

		const circular = this.isCircular(sequence);
		const beats = this.comparisonOrchestrator.extractBeats(sequence);

		// Run polyrhythmic detection
		const rawSequence = (sequence.fullMetadata?.sequence || []) as Record<string, unknown>[];
		const polyrhythmic: PolyrhythmicCAPResult = this.polyrhythmicService?.detectPolyrhythmic(
			rawSequence
		) ?? {
			isPolyrhythmic: false,
			polyrhythm: null,
			periods: [],
			motionPeriod: null,
			spatialPeriod: null,
			description: 'Polyrhythmic detection not available',
			confidence: 0
		};

		console.log('[CAPDetectionService] Initial analysis:', {
			word: sequence.word,
			isCircular: circular,
			beatCount: beats.length,
			polyrhythmic: polyrhythmic.isPolyrhythmic ? polyrhythmic.polyrhythm : 'none'
		});

		// Non-circular or too short
		if (!circular || beats.length < 2) {
			return this.buildEmptyResult(circular, polyrhythmic);
		}

		// Must have even number of beats
		if (beats.length % 2 !== 0) {
			return this.buildFreeformResult(polyrhythmic);
		}

		// Generate halved beat pairs (always needed)
		const halvedBeatPairs = this.comparisonOrchestrator.generateHalvedBeatPairs(beats);
		this.analysisService.reprioritizeBeatPairs(halvedBeatPairs);
		const halvedBeatPairGroups = this.analysisService.groupBeatPairsByPattern(halvedBeatPairs);

		// Detect rotation direction for quartered sequences
		let rotationDirection: 'cw' | 'ccw' | null = null;
		if (beats.length >= 4 && beats.length % 4 === 0) {
			rotationDirection = this.comparisonOrchestrator.detectRotationDirection(beats);
		}

		// Try quartered detection first (90° rotations)
		if (beats.length >= 4 && beats.length % 4 === 0) {
			const quarteredResult = this.detectQuarteredPattern(
				beats,
				halvedBeatPairs,
				rotationDirection,
				polyrhythmic
			);
			if (quarteredResult) {
				return quarteredResult;
			}
		}

		// Try halved detection (180° transformations)
		const halvedResult = this.detectHalvedPattern(
			halvedBeatPairs,
			halvedBeatPairGroups,
			rotationDirection,
			polyrhythmic
		);
		if (halvedResult) {
			return halvedResult;
		}

		// Fallback: modular or freeform
		return this.buildFallbackResult(halvedBeatPairs, halvedBeatPairGroups, polyrhythmic);
	}

	private detectQuarteredPattern(
		beats: ReturnType<IBeatComparisonOrchestrator['extractBeats']>,
		halvedBeatPairs: InternalBeatPair[],
		rotationDirection: 'cw' | 'ccw' | null,
		polyrhythmic: PolyrhythmicCAPResult
	): CAPDetectionResult | null {
		const quarteredBeatPairs = this.comparisonOrchestrator.generateQuarteredBeatPairs(beats);
		this.analysisService.reprioritizeBeatPairs(quarteredBeatPairs);
		const allQuarteredCommon =
			this.analysisService.findAllCommonTransformations(quarteredBeatPairs);

		// Filter to only 90° rotation patterns
		let rotation90Patterns = allQuarteredCommon.filter(
			(t) => t.includes('rotated_90') || t.includes('90_ccw') || t.includes('90_cw')
		);

		// Check for compound patterns if no common 90° pattern found
		let compoundPattern: CompoundPattern | undefined;
		const halvedOnlyTransformations: string[] = [];

		if (rotation90Patterns.length === 0) {
			const compoundResult = this.detectCompoundPattern(
				quarteredBeatPairs,
				halvedBeatPairs,
				rotationDirection
			);
			if (compoundResult) {
				rotation90Patterns = compoundResult.rotation90Patterns;
				compoundPattern = compoundResult.compoundPattern;
				halvedOnlyTransformations.push(...compoundResult.halvedOnlyTransformations);
			}
		}

		// Try modular detection if no uniform pattern found
		if (rotation90Patterns.length === 0) {
			const modularResult = this.detectModularQuarteredPattern(
				quarteredBeatPairs,
				rotationDirection,
				polyrhythmic
			);
			if (modularResult) {
				return modularResult;
			}
			return null;
		}

		// Build candidates
		const allCandidates = compoundPattern
			? this.buildCompoundCandidates(compoundPattern, halvedOnlyTransformations, rotationDirection)
			: this.formattingService.buildCandidateDesignations(
					rotation90Patterns,
					'quartered',
					rotationDirection
				);

		const primaryPattern = rotation90Patterns[0] ?? '';
		const derivedComponents = this.formattingService.deriveComponentsFromPattern(primaryPattern);

		// Add halved-only components for compound patterns
		if (compoundPattern) {
			halvedOnlyTransformations.forEach((c) => {
				if (!derivedComponents.includes(c as ComponentId)) {
					derivedComponents.push(c as ComponentId);
				}
			});
		}

		if (derivedComponents.length === 0) {
			return null;
		}

		const derivedDirection =
			this.formattingService.extractRotationDirection(primaryPattern) || rotationDirection;
		const derivedIntervals = this.buildQuarteredIntervals(
			derivedComponents,
			compoundPattern?.halvedTransformations
		);

		// Build capType
		const capType = compoundPattern
			? this.buildCompoundCapType(derivedDirection, compoundPattern.halvedTransformations)
			: derivedComponents.sort().join('_') + '_90';

		// Combine beat pairs for compound patterns
		const combinedBeatPairs = compoundPattern
			? [
					...this.formattingService.toPublicBeatPairs(quarteredBeatPairs),
					...this.formattingService.toPublicBeatPairs(halvedBeatPairs)
				]
			: this.formattingService.toPublicBeatPairs(quarteredBeatPairs);

		const combinedGroups = compoundPattern
			? {
					...this.analysisService.groupBeatPairsByPattern(quarteredBeatPairs),
					'HALVED (180°)': halvedBeatPairs.map((p) => p.keyBeat)
				}
			: this.analysisService.groupBeatPairsByPattern(quarteredBeatPairs);

		return {
			capType,
			components: derivedComponents,
			transformationIntervals: derivedIntervals,
			rotationDirection: derivedDirection,
			candidateDesignations: allCandidates.map((c) =>
				this.formattingService.toCandidateDesignation(c)
			),
			beatPairs: combinedBeatPairs,
			beatPairGroups: combinedGroups,
			isCircular: true,
			isFreeform: false,
			isModular: false,
			polyrhythmic,
			isPolyrhythmic: polyrhythmic.isPolyrhythmic,
			compoundPattern,
			isAxisAlternating: false
		};
	}

	private detectCompoundPattern(
		quarteredBeatPairs: InternalBeatPair[],
		halvedBeatPairs: InternalBeatPair[],
		rotationDirection: 'cw' | 'ccw' | null
	): {
		rotation90Patterns: string[];
		compoundPattern: CompoundPattern;
		halvedOnlyTransformations: string[];
	} | null {
		// Check if ALL quartered pairs have some form of 90° rotation
		const pairsWithRotation = quarteredBeatPairs.filter((pair) =>
			pair.rawTransformations.some(
				(t) => t.includes('rotated_90') || t.includes('90_ccw') || t.includes('90_cw')
			)
		);

		if (pairsWithRotation.length !== quarteredBeatPairs.length) {
			return null;
		}

		// CRITICAL: Check if ALL pairs have the SAME primary transformation
		// If different pairs have different patterns (e.g., some swapped, some not),
		// this is NOT a compound pattern - it's a MODULAR pattern
		const primaryPatterns = quarteredBeatPairs.map((pair) => pair.detectedTransformations[0] || '');
		const uniquePrimaries = [...new Set(primaryPatterns)];

		// If we have more than 2 distinct patterns among quartered pairs, it's modular, not compound
		// (Allow 2 for cases where some pairs are ambiguous between base and inverted)
		if (uniquePrimaries.length > 2) {
			return null;
		}

		// Check if the patterns differ by swap status - if so, it's modular
		const hasSwappedPairs = primaryPatterns.some((p) => p.toLowerCase().includes('swapped'));
		const hasNonSwappedPairs = primaryPatterns.some((p) =>
			p.toLowerCase().includes('rotated') && !p.toLowerCase().includes('swapped')
		);

		if (hasSwappedPairs && hasNonSwappedPairs) {
			// Different swap status among quartered pairs = MODULAR, not compound
			return null;
		}

		// Check if halved pairs have swap
		const halvedHasSwap =
			halvedBeatPairs.length > 0 &&
			halvedBeatPairs.every((pair) => pair.rawTransformations.some((t) => t.includes('swapped')));

		if (!halvedHasSwap) {
			return null;
		}

		// Extract rotation patterns
		const anyPair = quarteredBeatPairs[0];
		if (!anyPair) return null;

		const rotationTransforms = anyPair.rawTransformations.filter(
			(t) => t.includes('rotated_90') || t.includes('90_ccw') || t.includes('90_cw')
		);

		const rotation90Patterns = [
			...new Set(
				rotationTransforms.map((t) =>
					t.replace(/_swapped$/, '').replace(/_swapped_inverted$/, '_inverted')
				)
			)
		];

		const halvedOnlyTransformations = ['swapped'];
		const rotationDesc =
			rotationDirection === 'ccw'
				? '90° CCW Rotated'
				: rotationDirection === 'cw'
					? '90° CW Rotated'
					: '90° Rotated';

		const compoundPattern: CompoundPattern = {
			isCompound: true,
			quarteredTransformations: ['rotated'],
			halvedTransformations: halvedOnlyTransformations,
			description: `${rotationDesc} + Swapped (180°)`
		};

		return { rotation90Patterns, compoundPattern, halvedOnlyTransformations };
	}

	private detectHalvedPattern(
		halvedBeatPairs: InternalBeatPair[],
		halvedBeatPairGroups: Record<string, number[]>,
		rotationDirection: 'cw' | 'ccw' | null,
		polyrhythmic: PolyrhythmicCAPResult
	): CAPDetectionResult | null {
		const allHalvedCommon = this.analysisService.findAllCommonTransformations(halvedBeatPairs);

		if (allHalvedCommon.length === 0) {
			return null;
		}

		const candidateInfos = this.formattingService.buildCandidateDesignations(
			allHalvedCommon,
			'halved',
			rotationDirection
		);
		const commonTransformation = allHalvedCommon[0]!;
		const derivedComponents =
			this.formattingService.deriveComponentsFromPattern(commonTransformation);

		if (derivedComponents.length === 0) {
			return null;
		}

		const derivedIntervals: TransformationIntervals = {};
		if (derivedComponents.includes('inverted')) derivedIntervals.invert = 'halved';
		if (derivedComponents.includes('rotated')) derivedIntervals.rotation = 'halved';
		if (derivedComponents.includes('swapped')) derivedIntervals.swap = 'halved';
		if (derivedComponents.includes('mirrored')) derivedIntervals.mirror = 'halved';
		if (derivedComponents.includes('flipped')) derivedIntervals.flip = 'halved';

		return {
			capType: derivedComponents.sort().join('_'),
			components: derivedComponents,
			transformationIntervals: derivedIntervals,
			rotationDirection,
			candidateDesignations: candidateInfos.map((c) =>
				this.formattingService.toCandidateDesignation(c)
			),
			beatPairs: this.formattingService.toPublicBeatPairs(halvedBeatPairs),
			beatPairGroups: halvedBeatPairGroups,
			isCircular: true,
			isFreeform: false,
			isModular: false,
			polyrhythmic,
			isPolyrhythmic: polyrhythmic.isPolyrhythmic,
			isAxisAlternating: false
		};
	}

	private buildFallbackResult(
		halvedBeatPairs: InternalBeatPair[],
		halvedBeatPairGroups: Record<string, number[]>,
		polyrhythmic: PolyrhythmicCAPResult
	): CAPDetectionResult {
		const patternGroups = Object.keys(halvedBeatPairGroups);
		const hasUnknown = patternGroups.some((p) => p === 'UNKNOWN');
		const recognizedPatterns = patternGroups.filter((p) => p !== 'UNKNOWN');

		const isModular = !hasUnknown && recognizedPatterns.length > 1;
		const isFreeform = hasUnknown || recognizedPatterns.length === 0;

		// Check for axis-alternating pattern when modular
		const axisAlternating = isModular
			? this.analysisService.detectAxisAlternatingPattern(halvedBeatPairs, halvedBeatPairGroups)
			: null;

		return {
			capType: null,
			components: [],
			transformationIntervals: {},
			rotationDirection: null,
			candidateDesignations: [],
			beatPairs: this.formattingService.toPublicBeatPairs(halvedBeatPairs),
			beatPairGroups: halvedBeatPairGroups,
			isCircular: true,
			isFreeform,
			isModular,
			polyrhythmic,
			isPolyrhythmic: polyrhythmic.isPolyrhythmic,
			isAxisAlternating: axisAlternating !== null,
			axisAlternatingPattern: axisAlternating
				? {
						isAxisAlternating: true,
						transformationFamily: axisAlternating.transformationFamily,
						metaPatternType: axisAlternating.metaPatternType,
						patternSequence: axisAlternating.patternSequence,
						description: axisAlternating.description
					}
				: undefined
		};
	}

	private buildEmptyResult(
		isCircular: boolean,
		polyrhythmic: PolyrhythmicCAPResult
	): CAPDetectionResult {
		return {
			capType: null,
			components: [],
			transformationIntervals: {},
			rotationDirection: null,
			candidateDesignations: [],
			beatPairs: [],
			beatPairGroups: {},
			isCircular,
			isFreeform: false,
			isModular: false,
			polyrhythmic,
			isPolyrhythmic: polyrhythmic.isPolyrhythmic,
			isAxisAlternating: false
		};
	}

	private buildFreeformResult(polyrhythmic: PolyrhythmicCAPResult): CAPDetectionResult {
		return {
			capType: null,
			components: [],
			transformationIntervals: {},
			rotationDirection: null,
			candidateDesignations: [],
			beatPairs: [],
			beatPairGroups: {},
			isCircular: true,
			isFreeform: true,
			isModular: false,
			polyrhythmic,
			isPolyrhythmic: polyrhythmic.isPolyrhythmic,
			isAxisAlternating: false
		};
	}

	private buildCompoundCandidates(
		compoundPattern: CompoundPattern,
		halvedOnlyTransformations: string[],
		rotationDirection: 'cw' | 'ccw' | null
	): CandidateInfo[] {
		const compoundIntervals: TransformationIntervals = {
			rotation: 'quartered'
		};
		if (halvedOnlyTransformations.includes('swapped')) compoundIntervals.swap = 'halved';
		if (halvedOnlyTransformations.includes('inverted')) compoundIntervals.invert = 'halved';

		const rotDir = rotationDirection === 'ccw' ? '_ccw' : rotationDirection === 'cw' ? '_cw' : '';
		const halvedPart = halvedOnlyTransformations.map((t) => `${t}_180`).join('_');
		const capTypeLabel = `rotated_90${rotDir}_${halvedPart}`.toUpperCase();

		return [
			{
				transformation: 'compound',
				description: compoundPattern.description,
				components: [
					...compoundPattern.quarteredTransformations,
					...halvedOnlyTransformations
				] as ComponentId[],
				intervals: compoundIntervals,
				rotationDirection,
				label: capTypeLabel
			}
		];
	}

	private buildQuarteredIntervals(
		components: ComponentId[],
		halvedTransformations?: string[]
	): TransformationIntervals {
		const intervals: TransformationIntervals = {};
		if (components.includes('rotated')) intervals.rotation = 'quartered';

		if (halvedTransformations?.includes('swapped')) {
			intervals.swap = 'halved';
		} else if (components.includes('swapped')) {
			intervals.swap = 'quartered';
		}

		if (halvedTransformations?.includes('inverted')) {
			intervals.invert = 'halved';
		} else if (components.includes('inverted')) {
			intervals.invert = 'quartered';
		}

		if (components.includes('mirrored')) intervals.mirror = 'quartered';
		return intervals;
	}

	private buildCompoundCapType(
		direction: 'cw' | 'ccw' | null,
		halvedTransformations: string[]
	): string {
		const rotDir = direction === 'ccw' ? '_ccw' : direction === 'cw' ? '_cw' : '';
		const halvedPart = halvedTransformations.map((t) => `${t}_180`).join('_');
		return `rotated_90${rotDir}_${halvedPart}`;
	}

	private detectModularQuarteredPattern(
		quarteredBeatPairs: InternalBeatPair[],
		rotationDirection: 'cw' | 'ccw' | null,
		polyrhythmic: PolyrhythmicCAPResult
	): CAPDetectionResult | null {
		// Use 4 columns for quartered patterns (positions 1,2,3,4 within each quarter)
		const modularAnalysis = this.analysisService.detectModularPattern(quarteredBeatPairs, 4);

		if (!modularAnalysis || !modularAnalysis.isModular) {
			return null;
		}

		// Build modular pattern description
		const modularPattern: ModularPattern = {
			isModular: true,
			baseTransformation: modularAnalysis.baseTransformation,
			swapRhythm: modularAnalysis.swapRhythm,
			swappedPositions: modularAnalysis.swappedPositions,
			description: modularAnalysis.description
		};

		// Derive components from the base transformation and swap info
		const components: ComponentId[] = [];
		if (modularAnalysis.baseTransformation) {
			const baseComponents = this.formattingService.deriveComponentsFromPattern(
				modularAnalysis.baseTransformation
			);
			components.push(...baseComponents);
		}
		if (modularAnalysis.swappedPositions.length > 0 && !components.includes('swapped')) {
			components.push('swapped');
		}

		// Build intervals - base is quartered, swap is positional
		const intervals: TransformationIntervals = {};
		if (components.includes('rotated')) intervals.rotation = 'quartered';
		if (components.includes('swapped')) {
			// Use the swap rhythm as the interval description
			intervals.swap = `positional:${modularAnalysis.swapRhythm}`;
		}

		// Build capType
		const rotDir = rotationDirection === 'ccw' ? '_ccw' : rotationDirection === 'cw' ? '_cw' : '';
		const capType = modularAnalysis.swapRhythm !== 'uniform'
			? `modular_rotated_90${rotDir}_swap_${modularAnalysis.swapRhythm}`
			: `modular_rotated_90${rotDir}`;

		// Build candidate designation with binary swap pattern
		const binarySwapPattern = modularAnalysis.columnBehaviors
			.map((c) => (c.isSwapped ? '1' : '0'))
			.join('');

		const candidateLabel = modularAnalysis.swappedPositions.length > 0
			? `MODULAR: Rotated 90° ${rotationDirection?.toUpperCase() || ''} + SWAPPED (${binarySwapPattern})`
			: `MODULAR: Rotated 90° ${rotationDirection?.toUpperCase() || ''}`;

		const quarteredGroups = this.analysisService.groupBeatPairsByPattern(quarteredBeatPairs);

		return {
			capType,
			components,
			transformationIntervals: intervals,
			rotationDirection,
			candidateDesignations: [{
				components,
				capType,
				transformationIntervals: intervals,
				label: candidateLabel,
				description: modularAnalysis.description,
				rotationDirection,
				confirmed: false,
				denied: false
			}],
			beatPairs: this.formattingService.toPublicBeatPairs(quarteredBeatPairs),
			beatPairGroups: quarteredGroups,
			isCircular: true,
			isFreeform: false,
			isModular: true,
			polyrhythmic,
			isPolyrhythmic: polyrhythmic.isPolyrhythmic,
			isAxisAlternating: false,
			modularPattern
		};
	}
}
