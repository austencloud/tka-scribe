/**
 * Turn Allocation Calculator Implementation
 *
 * Calculates turn distribution across beats.
 * Extracted from SequenceGenerationService for single responsibility.
 */
import { inject, injectable } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type {
  ITurnAllocator,
  TurnAllocation,
} from "../contracts/ITurnAllocator";
import type { ILOOPParameterProvider } from "../contracts/ILOOPParameterProvider";

@injectable()
export class TurnAllocator implements ITurnAllocator {
  constructor(
    @inject(TYPES.ILOOPParameterProvider)
    private loopParams: ILOOPParameterProvider
  ) {}

  /**
   * Allocate turns for the sequence
   */
  async allocateTurns(
    beatsToGenerate: number,
    level: number,
    turnIntensity: number
  ): Promise<TurnAllocation> {
    return this.loopParams.allocateTurns(beatsToGenerate, level, turnIntensity);
  }
}
