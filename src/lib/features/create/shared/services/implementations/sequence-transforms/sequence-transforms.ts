/**
 * Sequence Transforms
 *
 * Pure functions that transform entire SequenceData objects.
 * Composes beat and start position transforms.
 */

import type { BeatData } from "../../../domain/models/BeatData";
import type { StartPositionData } from "../../../domain/models/StartPositionData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { updateSequenceData, createSequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { createBeatData } from "../../../domain/factories/createBeatData";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { MotionColor, MotionType, RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import { Letter } from "$lib/shared/foundation/domain/models/Letter";
import { isBeat } from "../../../domain/type-guards/pictograph-type-guards";
import type { IMotionQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService";
import type { IGridPositionDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridPositionDeriver";

import { mirrorBeat, flipBeat, rotateBeat, colorSwapBeat, invertBeat, rewindBeat } from "./beat-transforms";
import {
	mirrorStartPosition,
	flipStartPosition,
	rotateStartPosition,
	colorSwapStartPosition,
	invertStartPosition
} from "./start-position-transforms";
import { recalculateAllOrientations } from "./orientation-propagation";
import { getToggledGridMode } from "./rotation-helpers";

/**
 * Clear all beats in a sequence (make them blank).
 */
export function clearSequence(sequence: SequenceData): SequenceData {
	const clearedBeats = sequence.beats.map((beat) => ({
		...beat,
		isBlank: true,
		pictographData: null,
		blueReversal: false,
		redReversal: false
	}));

	return updateSequenceData(sequence, { beats: clearedBeats });
}

/**
 * Duplicate a sequence with new IDs.
 */
export function duplicateSequence(sequence: SequenceData, newName?: string): SequenceData {
	return createSequenceData({
		...sequence,
		id: crypto.randomUUID(),
		name: newName || `${sequence.name} (Copy)`,
		beats: sequence.beats.map((beat) => ({
			...beat,
			id: crypto.randomUUID()
		}))
	});
}

/**
 * Mirror sequence across vertical axis (E ↔ W).
 */
export function mirrorSequence(sequence: SequenceData): SequenceData {
	const mirroredBeats = sequence.beats.map(mirrorBeat);

	const mirroredStartPosition =
		sequence.startPosition && !isBeat(sequence.startPosition)
			? mirrorStartPosition(sequence.startPosition)
			: sequence.startPosition;

	const mirroredStartingPositionBeat =
		sequence.startingPositionBeat && !isBeat(sequence.startingPositionBeat)
			? mirrorStartPosition(sequence.startingPositionBeat)
			: sequence.startingPositionBeat;

	return updateSequenceData(sequence, {
		beats: mirroredBeats,
		...(mirroredStartPosition && { startPosition: mirroredStartPosition }),
		...(mirroredStartingPositionBeat && { startingPositionBeat: mirroredStartingPositionBeat })
	});
}

/**
 * Flip sequence across horizontal axis (N ↔ S).
 */
export function flipSequence(sequence: SequenceData): SequenceData {
	const flippedBeats = sequence.beats.map(flipBeat);

	const flippedStartPosition =
		sequence.startPosition && !isBeat(sequence.startPosition)
			? flipStartPosition(sequence.startPosition)
			: sequence.startPosition;

	const flippedStartingPositionBeat =
		sequence.startingPositionBeat && !isBeat(sequence.startingPositionBeat)
			? flipStartPosition(sequence.startingPositionBeat)
			: sequence.startingPositionBeat;

	return updateSequenceData(sequence, {
		beats: flippedBeats,
		...(flippedStartPosition && { startPosition: flippedStartPosition }),
		...(flippedStartingPositionBeat && { startingPositionBeat: flippedStartingPositionBeat })
	});
}

/**
 * Rotate sequence by 45° steps.
 */
export function rotateSequence(
	sequence: SequenceData,
	rotationAmount: number,
	positionDeriver: IGridPositionDeriver
): SequenceData {
	const rotatedBeats = sequence.beats.map((beat) => rotateBeat(beat, rotationAmount, positionDeriver));

	const rotatedStartPosition =
		sequence.startPosition && !isBeat(sequence.startPosition)
			? rotateStartPosition(sequence.startPosition, rotationAmount)
			: sequence.startPosition;

	const rotatedStartingPositionBeat =
		sequence.startingPositionBeat && !isBeat(sequence.startingPositionBeat)
			? rotateStartPosition(sequence.startingPositionBeat, rotationAmount)
			: sequence.startingPositionBeat;

	const currentGridMode = sequence.gridMode ?? GridMode.DIAMOND;
	const newGridMode = getToggledGridMode(currentGridMode, rotationAmount);

	return updateSequenceData(sequence, {
		beats: rotatedBeats,
		...(rotatedStartPosition && { startPosition: rotatedStartPosition }),
		...(rotatedStartingPositionBeat && { startingPositionBeat: rotatedStartingPositionBeat }),
		gridMode: newGridMode
	});
}

/**
 * Swap colors in sequence (blue ↔ red).
 */
export function colorSwapSequence(sequence: SequenceData): SequenceData {
	const swappedBeats = sequence.beats.map(colorSwapBeat);

	const swappedStartPosition =
		sequence.startPosition && !isBeat(sequence.startPosition)
			? colorSwapStartPosition(sequence.startPosition)
			: sequence.startPosition;

	const swappedStartingPositionBeat =
		sequence.startingPositionBeat && !isBeat(sequence.startingPositionBeat)
			? colorSwapStartPosition(sequence.startingPositionBeat)
			: sequence.startingPositionBeat;

	return updateSequenceData(sequence, {
		beats: swappedBeats,
		...(swappedStartPosition && { startPosition: swappedStartPosition }),
		...(swappedStartingPositionBeat && { startingPositionBeat: swappedStartingPositionBeat })
	});
}

/**
 * Invert sequence motion types (PRO ↔ ANTI) and rotation directions (CW ↔ CCW).
 */
export async function invertSequence(
	sequence: SequenceData,
	motionQueryHandler: IMotionQueryHandler,
	orientationCalculator: IOrientationCalculator
): Promise<SequenceData> {
	if (sequence.beats.length === 0) return sequence;

	const gridMode = sequence.gridMode ?? GridMode.DIAMOND;
	const invertedBeats: BeatData[] = [];

	for (const beat of sequence.beats) {
		const invertedBeat = await invertBeat(beat, gridMode, motionQueryHandler);
		invertedBeats.push(invertedBeat);
	}

	const invertedStartPosition =
		sequence.startPosition && !isBeat(sequence.startPosition)
			? invertStartPosition(sequence.startPosition, orientationCalculator)
			: sequence.startPosition;

	const invertedStartingPositionBeat =
		sequence.startingPositionBeat && !isBeat(sequence.startingPositionBeat)
			? invertStartPosition(sequence.startingPositionBeat, orientationCalculator)
			: sequence.startingPositionBeat;

	const invertedSequence = updateSequenceData(sequence, {
		beats: invertedBeats,
		...(invertedStartPosition && { startPosition: invertedStartPosition }),
		...(invertedStartingPositionBeat && { startingPositionBeat: invertedStartingPositionBeat })
	});

	return recalculateAllOrientations(invertedSequence, orientationCalculator);
}

/**
 * Rewind sequence (play backwards).
 * Creates new start position from final beat, reverses and transforms beats.
 */
export async function rewindSequence(
	sequence: SequenceData,
	motionQueryHandler: IMotionQueryHandler
): Promise<SequenceData> {
	if (sequence.beats.length === 0) return sequence;

	const gridMode = sequence.gridMode ?? GridMode.DIAMOND;

	// Create new start position from final beat's end state
	const finalBeat = sequence.beats[sequence.beats.length - 1]!;
	const newStartPosition = createStartPositionFromBeatEnd(finalBeat);

	// Rewind and transform each beat
	const rewindBeats: BeatData[] = [];
	const reversedBeats = [...sequence.beats].reverse();

	for (let index = 0; index < reversedBeats.length; index++) {
		const beat = reversedBeats[index]!;
		const rewoundBeat = await rewindBeat(beat, index + 1, gridMode, motionQueryHandler);
		rewindBeats.push(rewoundBeat);
	}

	return updateSequenceData(sequence, {
		beats: rewindBeats,
		startPosition: newStartPosition,
		startingPositionBeat: newStartPosition,
		name: `${sequence.name} (Rewound)`
	});
}

/**
 * Create a start position from a beat's end state.
 */
function createStartPositionFromBeatEnd(beat: BeatData): BeatData {
	const blueMotion = beat.motions[MotionColor.BLUE];
	const redMotion = beat.motions[MotionColor.RED];

	return createBeatData({
		id: `beat-${Date.now()}`,
		letter: Letter.ALPHA,
		startPosition: beat.endPosition ?? null,
		endPosition: beat.endPosition ?? null,
		beatNumber: 0,
		duration: 1000,
		blueReversal: false,
		redReversal: false,
		isBlank: false,
		motions: {
			[MotionColor.BLUE]: blueMotion
				? {
						...blueMotion,
						motionType: MotionType.STATIC,
						rotationDirection: RotationDirection.NO_ROTATION,
						startLocation: blueMotion.endLocation,
						endLocation: blueMotion.endLocation,
						arrowLocation: blueMotion.endLocation,
						startOrientation: blueMotion.endOrientation,
						endOrientation: blueMotion.endOrientation,
						turns: 0
					}
				: undefined,
			[MotionColor.RED]: redMotion
				? {
						...redMotion,
						motionType: MotionType.STATIC,
						rotationDirection: RotationDirection.NO_ROTATION,
						startLocation: redMotion.endLocation,
						endLocation: redMotion.endLocation,
						arrowLocation: redMotion.endLocation,
						startOrientation: redMotion.endOrientation,
						endOrientation: redMotion.endOrientation,
						turns: 0
					}
				: undefined
		}
	});
}
