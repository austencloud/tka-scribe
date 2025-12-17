/**
 * Beat Generation Orchestrator Implementation
 *
 * Orchestrates the core beat-by-beat generation loop.
 * Extracted from SequenceGenerationService for single responsibility.
 */

import type { ILetterQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
import { TYPES } from "$lib/shared/inversify/types";
import { inject, injectable } from "inversify";
import { PropContinuity } from "../../domain/models/generate-models";
import type { IBeatConverterService } from "../contracts/IBeatConverterService";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService";
import type { IPictographFilterService } from "../contracts/IPictographFilterService";
import type { ITurnManagementService } from "../contracts/ITurnManagementService";

import type {
  BeatGenerationOptions,
  IBeatGenerationOrchestrator,
} from "../contracts/IBeatGenerationOrchestrator";
import type { IArrowPositioningOrchestrator } from "../../../../../../shared/pictograph/arrow/positioning/services/contracts/IArrowPositioningOrchestrator";

@injectable()
export class BeatGenerationOrchestrator implements IBeatGenerationOrchestrator {
  constructor(
    @inject(TYPES.ILetterQueryHandler)
    private letterQueryHandler: ILetterQueryHandler,
    @inject(TYPES.IPictographFilterService)
    private pictographFilterService: IPictographFilterService,
    @inject(TYPES.IBeatConverterService)
    private beatConverterService: IBeatConverterService,
    @inject(TYPES.ITurnManagementService)
    private turnManagementService: ITurnManagementService,
    @inject(TYPES.IOrientationCalculator)
    private orientationCalculationService: IOrientationCalculator,
    @inject(TYPES.IArrowPositioningOrchestrator)
    private arrowPositioningOrchestrator: IArrowPositioningOrchestrator
  ) {}

  /**
   * Generate multiple beats for a sequence
   */
  async generateBeats(
    sequence: (BeatData | StartPositionData)[],
    count: number,
    options: BeatGenerationOptions
  ): Promise<BeatData[]> {
    const generatedBeats: BeatData[] = [];

    for (let i = 0; i < count; i++) {
      const nextBeat = await this.generateNextBeat(
        sequence,
        options,
        options.turnAllocation.blue[i]!,
        options.turnAllocation.red[i]!
      );

      sequence.push(nextBeat);
      generatedBeats.push(nextBeat);
    }

    return generatedBeats;
  }

  /**
   * Generate next beat - orchestrates filtering and conversion
   */
  async generateNextBeat(
    sequence: (BeatData | StartPositionData)[],
    options: BeatGenerationOptions,
    turnBlue: number | "fl",
    turnRed: number | "fl"
  ): Promise<BeatData> {
    // Get all options
    let allOptions = await this.letterQueryHandler.getAllPictographVariations(
      options.gridMode
    );

    // Filter by prop type to ensure consistency with selected prop
    allOptions = this.pictographFilterService.filterByPropType(
      allOptions,
      options.propType
    );

    // Apply filters
    let filteredOptions = allOptions;
    const lastBeat = sequence.length > 0 ? sequence[sequence.length - 1] : null;

    filteredOptions = this.pictographFilterService.filterByContinuity(
      filteredOptions,
      lastBeat ?? null
    );

    // Filter out static Type 6 pictographs based on level
    // Level 1: No Type 6 allowed (no turns), Level 2+: Only Type 6 with turns
    filteredOptions = this.pictographFilterService.filterStaticType6(
      filteredOptions,
      options.level
    );

    if (options.propContinuity === PropContinuity.CONTINUOUS) {
      filteredOptions = this.pictographFilterService.filterByRotation(
        filteredOptions,
        options.blueRotationDirection,
        options.redRotationDirection
      );
    }

    // Apply end position constraint if specified (for last beat in freeform mode)
    if (options.requiredEndPosition) {
      filteredOptions = this.pictographFilterService.filterByEndPosition(
        filteredOptions,
        options.requiredEndPosition
      );
    }

    if (filteredOptions.length === 0) {
      throw new Error("No valid options available after filtering");
    }

    // Random selection
    const selectedOption =
      this.pictographFilterService.selectRandom(filteredOptions);

    // Convert to beat
    let nextBeat = this.beatConverterService.convertToBeat(
      selectedOption,
      sequence.length,
      options.gridMode
    );

    // Set turns if level 2 or 3
    if (options.level === 2 || options.level === 3) {
      this.turnManagementService.setTurns(nextBeat, turnBlue, turnRed);
    }

    // Update orientations
    if (sequence.length > 0) {
      nextBeat = this.orientationCalculationService.updateStartOrientations(
        nextBeat,
        sequence[sequence.length - 1]!
      );
    }

    this.turnManagementService.updateDashStaticRotationDirections(
      nextBeat,
      options.propContinuity,
      options.blueRotationDirection,
      options.redRotationDirection
    );

    nextBeat =
      this.orientationCalculationService.updateEndOrientations(nextBeat);

    // 🎯 CRITICAL FIX: Calculate arrow placements BEFORE returning the beat
    // This ensures arrows have correct positions instead of default (0, 0)
    const updatedPictographData =
      await this.arrowPositioningOrchestrator.calculateAllArrowPoints(nextBeat);
    nextBeat = { ...nextBeat, ...updatedPictographData };

    return nextBeat;
  }
}
