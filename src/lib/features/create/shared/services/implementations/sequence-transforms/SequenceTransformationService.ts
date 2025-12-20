/**
 * Sequence Transformation Service
 *
 * Injectable facade that composes pure transform functions.
 * Provides DI integration while delegating to pure functions.
 */

import { injectable, inject } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import { resolve } from "$lib/shared/inversify/di";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { ISequenceTransformationService } from "../../contracts/ISequenceTransformationService";
import type { IMotionQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService";
import type { IGridPositionDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridPositionDeriver";

import {
	clearSequence,
	duplicateSequence,
	mirrorSequence,
	flipSequence,
	rotateSequence,
	colorSwapSequence,
	invertSequence,
	rewindSequence,
	shiftStartPosition
} from "./sequence-transforms";

@injectable()
export class SequenceTransformationService implements ISequenceTransformationService {
	constructor(
		@inject(TYPES.IMotionQueryHandler)
		private readonly motionQueryHandler: IMotionQueryHandler,
		@inject(TYPES.IOrientationCalculator)
		private readonly orientationCalculator: IOrientationCalculator
	) {}

	clearSequence(sequence: SequenceData): SequenceData {
		return clearSequence(sequence);
	}

	duplicateSequence(sequence: SequenceData, newName?: string): SequenceData {
		return duplicateSequence(sequence, newName);
	}

	mirrorSequence(sequence: SequenceData): SequenceData {
		return mirrorSequence(sequence);
	}

	flipSequence(sequence: SequenceData): SequenceData {
		return flipSequence(sequence);
	}

	swapColors(sequence: SequenceData): SequenceData {
		return colorSwapSequence(sequence);
	}

	rotateSequence(sequence: SequenceData, rotationAmount: number): SequenceData {
		const positionDeriver = resolve<IGridPositionDeriver>(TYPES.IGridPositionDeriver);
		return rotateSequence(sequence, rotationAmount, positionDeriver);
	}

	async invertSequence(sequence: SequenceData): Promise<SequenceData> {
		return invertSequence(sequence, this.motionQueryHandler, this.orientationCalculator);
	}

	async rewindSequence(sequence: SequenceData): Promise<SequenceData> {
		return rewindSequence(sequence, this.motionQueryHandler);
	}

	shiftStartPosition(sequence: SequenceData, targetBeatNumber: number): SequenceData {
		return shiftStartPosition(sequence, targetBeatNumber);
	}
}
