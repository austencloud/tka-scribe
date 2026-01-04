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
import type { ISequenceTransformer } from "../../contracts/ISequenceTransformer";
import type { IMotionQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculator";
import type { IGridPositionDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridPositionDeriver";
import type { IReversalDetector } from "../../contracts/IReversalDetector";

import {
  clearSequence,
  duplicateSequence,
  mirrorSequence,
  flipSequence,
  rotateSequence,
  colorSwapSequence,
  invertSequence,
  rewindSequence,
  shiftStartPosition,
} from "./sequence-transforms";

@injectable()
export class SequenceTransformer implements ISequenceTransformer {
  constructor(
    @inject(TYPES.IMotionQueryHandler)
    private readonly motionQueryHandler: IMotionQueryHandler,
    @inject(TYPES.IOrientationCalculator)
    private readonly orientationCalculator: IOrientationCalculator,
    @inject(TYPES.IReversalDetector)
    private readonly reversalDetector: IReversalDetector
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
    const positionDeriver = resolve<IGridPositionDeriver>(
      TYPES.IGridPositionDeriver
    );
    return rotateSequence(sequence, rotationAmount, positionDeriver);
  }

  async invertSequence(sequence: SequenceData): Promise<SequenceData> {
    return invertSequence(
      sequence,
      this.motionQueryHandler,
      this.orientationCalculator
    );
  }

  async rewindSequence(sequence: SequenceData): Promise<SequenceData> {
    // First, apply the rewind transformation (reverses beat order, swaps start/end positions)
    const rewoundSequence = await rewindSequence(
      sequence,
      this.motionQueryHandler
    );

    // Then recalculate reversals based on the new beat order
    // This is critical because reversals depend on comparing consecutive beats
    // and beat 1 should never have reversals (nothing before it to compare)
    return this.reversalDetector.processReversals(rewoundSequence);
  }

  shiftStartPosition(
    sequence: SequenceData,
    targetBeatNumber: number
  ): SequenceData {
    return shiftStartPosition(sequence, targetBeatNumber);
  }
}
