/**
 * Partial Sequence Generator Implementation
 *
 * Generates partial sequences for circular mode (CAP preparation).
 * Extracted from SequenceGenerationService - EXACT original logic preserved.
 */
import type { IGridPositionDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridPositionDeriver";
import type { ILetterQueryHandler } from "$lib/shared/foundation/services/contracts/data/data-contracts";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import type { GridPosition, GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { TYPES } from "$lib/shared/inversify/types";
import { inject, injectable } from "inversify";
import type { GenerationOptions } from "$lib/modules/create/generate/shared/domain/models/generate-models";
import { PropContinuity } from "$lib/modules/create/generate/shared/domain/models/generate-models";
import type { IOrientationCalculator } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService";
import type { IBeatConverterService } from "$lib/modules/create/generate/shared/services/contracts/IBeatConverterService";
import type { ICAPParameterProvider } from "$lib/modules/create/generate/shared/services/contracts/ICAPParameterProvider";
import type { IPictographFilterService } from "$lib/modules/create/generate/shared/services/contracts/IPictographFilterService";
import type { ISequenceMetadataService } from "$lib/modules/create/generate/shared/services/contracts/ISequenceMetadataService";
import type { ITurnManagementService } from "$lib/modules/create/generate/shared/services/contracts/ITurnManagementService";
import type { SliceSize } from "../../domain/models/circular-models";
import { CAPType } from "../../domain/models/circular-models";
import type { IPartialSequenceGenerator } from "../contracts/IPartialSequenceGenerator";
import type { IArrowPositioningOrchestrator } from "../../../../../../shared/pictograph/arrow/positioning/services/contracts/IArrowPositioningOrchestrator";

@injectable()
export class PartialSequenceGenerator implements IPartialSequenceGenerator {
  constructor(
    @inject(TYPES.ILetterQueryHandler)
    private letterQueryHandler: ILetterQueryHandler,
    @inject(TYPES.IPictographFilterService)
    private pictographFilterService: IPictographFilterService,
    @inject(TYPES.IBeatConverterService)
    private beatConverterService: IBeatConverterService,
    @inject(TYPES.ITurnManagementService)
    private turnManagementService: ITurnManagementService,
    @inject(TYPES.ISequenceMetadataService)
    private metadataService: ISequenceMetadataService,
    @inject(TYPES.IGridPositionDeriver)
    private gridPositionDeriver: IGridPositionDeriver,
    @inject(TYPES.IOrientationCalculator)
    private orientationCalculationService: IOrientationCalculator,
    @inject(TYPES.IArrowPositioningOrchestrator)
    private arrowPositioningOrchestrator: IArrowPositioningOrchestrator,
    @inject(TYPES.ICAPParameterProvider)
    private capParams: ICAPParameterProvider
  ) {}

  /**
   * Generate a partial sequence ending at a specific position
   * Implements WordLengthCalculator logic from legacy system
   *
   * EXACT ORIGINAL LOGIC FROM SequenceGenerationService._generatePartialSequenceToPosition
   */
  async generatePartialSequence(
    startPos: GridPosition,
    endPos: GridPosition,
    sliceSize: SliceSize,
    options: GenerationOptions
  ): Promise<BeatData[]> {
    // Step 1: Create Type 6 static start position beat (beat 0)
    // Use the same approach as StartPositionService to create a proper Type 6 motion
    const {
      MotionType,
      MotionColor,
      Orientation,
      RotationDirection,
    } = await import("$lib/shared/pictograph/shared/domain/enums/pictograph-enums");
    const { PropType } = await import("$lib/shared/pictograph/prop/domain/enums/PropType");
    const { Letter } = await import("$lib/shared/foundation/domain/models/Letter");
    const { GridPosition } = await import("$lib/shared/pictograph/grid/domain/enums/grid-enums");
    const { createMotionData } = await import("$lib/shared/pictograph/shared/domain/models/MotionData");
    const { createPictographData } = await import("$lib/shared/pictograph/shared/domain/factories/createPictographData");
    const { SliceSize } = await import("../../domain/models/circular-models");

    // Get hand locations for this start position
    const [blueLocation, redLocation] =
      this.gridPositionDeriver.getGridLocationsFromPosition(startPos);

    // Determine the letter based on the position
    let letter: typeof Letter[keyof typeof Letter];
    if (startPos === GridPosition.ALPHA1 || startPos === GridPosition.ALPHA2) {
      letter = Letter.ALPHA;
    } else if (
      startPos === GridPosition.BETA5 ||
      startPos === GridPosition.BETA4
    ) {
      letter = Letter.BETA;
    } else {
      letter = Letter.GAMMA;
    }

    // Create Type 6 static motions (both hands stay in place)
    const blueMotion = createMotionData({
      motionType: MotionType.STATIC,
      startLocation: blueLocation,
      endLocation: blueLocation,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      rotationDirection: RotationDirection.NO_ROTATION,
      turns: 0,
      color: MotionColor.BLUE,
      isVisible: true,
      propType: PropType.STAFF,
      arrowLocation: blueLocation,
      gridMode: options.gridMode, // Pass grid mode from options
    });

    const redMotion = createMotionData({
      motionType: MotionType.STATIC,
      startLocation: redLocation,
      endLocation: redLocation,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      rotationDirection: RotationDirection.NO_ROTATION,
      turns: 0,
      color: MotionColor.RED,
      isVisible: true,
      propType: PropType.STAFF,
      arrowLocation: redLocation,
      gridMode: options.gridMode, // Pass grid mode from options
    });

    // Create the start position pictograph
    const startPictograph = createPictographData({
      id: `start-${startPos}`,
      letter,
      startPosition: startPos,
      endPosition: startPos,
      motions: {
        [MotionColor.BLUE]: blueMotion,
        [MotionColor.RED]: redMotion,
      },
    });

    let startBeat = this.beatConverterService.convertToBeat(
      startPictograph,
      0,
      options.gridMode
    );

    // 🎯 CRITICAL FIX: Calculate arrow placements for start beat
    const startPictographData =
      await this.arrowPositioningOrchestrator.calculateAllArrowPoints(
        startBeat
      );
    startBeat = { ...startBeat, ...startPictographData };

    const sequence: BeatData[] = [startBeat];

    // Now get all options for generating the rest of the sequence
    const allOptions = await this.letterQueryHandler.getAllPictographVariations(
      options.gridMode
    );

    // Step 2: Calculate word length (legacy formula)
    // This is the total REAL BEATS we need in the partial sequence (excluding start position)
    // The start position (beatNumber 0) is not counted toward the user's requested length
    //
    // SPECIAL CASE: MIRRORED_ROTATED applies TWO doubling steps sequentially:
    // 1. Rotation step: ×2 (halved) or ×4 (quartered)
    // 2. Mirroring step: ×2 (always)
    // Total multiplier: halved = ×4, quartered = ×8
    let wordLength: number;

    if (
      options.capType === CAPType.MIRRORED_ROTATED ||
      options.capType === CAPType.MIRRORED_INVERTED_ROTATED ||
      options.capType === CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED
    ) {
      // MIRRORED_ROTATED, MIRRORED_INVERTED_ROTATED, or MIRRORED_ROTATED_INVERTED_SWAPPED:
      // Account for both rotation AND mirroring (or mirrored+swapped+inverted)
      wordLength =
        sliceSize === SliceSize.HALVED
          ? Math.floor(options.length / 4) // 16 → 4 (rotation ×2, then mirror ×2)
          : Math.floor(options.length / 8); // 16 → 2 (rotation ×4, then mirror ×2)
    } else {
      // Regular CAP types: Only account for rotation/mirroring (not both)
      wordLength =
        sliceSize === SliceSize.HALVED
          ? Math.floor(options.length / 2) // Standard halved
          : Math.floor(options.length / 4); // Standard quartered
    }

    // Step 3: Generate beats to fill the partial sequence
    // Total REAL BEATS needed: wordLength
    // We already have the start position (beatNumber 0) which is NOT counted
    // We need to generate: wordLength total beats
    // But the last beat must end at the required position, so:
    // - Generate (wordLength - 1) intermediate beats freely
    // - Generate 1 final beat that ends at required position
    const intermediateBeatsCount = Math.max(0, wordLength - 1); // Can be 0 if wordLength is 1
    const beatsToGenerate = intermediateBeatsCount;
    const level = this.metadataService.mapDifficultyToLevel(options.difficulty);
    const turnIntensity = options.turnIntensity ?? 1;

    // Calculate turn allocation for the beats we're generating
    const turnAllocation = await this._allocateTurns(
      beatsToGenerate,
      level,
      turnIntensity
    );

    // Determine rotation directions
    const { blueRotationDirection, redRotationDirection } =
      this._determineRotationDirections(options.propContinuity);

    // Generate intermediate beats (not constrained to end position)
    for (let i = 0; i < beatsToGenerate; i++) {
      const blueRotation = turnAllocation.blue[i];
      const redRotation = turnAllocation.red[i];

      // Add null checks for array access
      if (blueRotation === undefined || redRotation === undefined) {
        throw new Error(`Missing rotation direction at index ${i}`);
      }

      const nextBeat = await this._generateNextBeat(
        sequence,
        level,
        blueRotation,
        redRotation,
        options.propContinuity ?? PropContinuity.CONTINUOUS,
        blueRotationDirection,
        redRotationDirection,
        options.gridMode
      );
      sequence.push(nextBeat);
    }

    // Step 4: Add final beat that must end at required endPos
    const lastBeat = sequence[sequence.length - 1];
    if (!lastBeat) {
      throw new Error("No beats in sequence to generate final beat from");
    }

    let finalMoves = allOptions.filter(
      (p) =>
        p.startPosition === lastBeat.endPosition && p.endPosition === endPos
    );

    // Apply the same filters as intermediate beats to respect continuity setting
    finalMoves = this.pictographFilterService.filterByContinuity(
      finalMoves,
      lastBeat
    );

    if (options.propContinuity === PropContinuity.CONTINUOUS) {
      finalMoves = this.pictographFilterService.filterByRotation(
        finalMoves,
        blueRotationDirection,
        redRotationDirection
      );
    }

    if (finalMoves.length === 0) {
      throw new Error(
        `No valid move from ${lastBeat.endPosition} to required end position ${endPos} ` +
          `that respects continuity=${options.propContinuity}. ` +
          `This combination may not be possible with the current settings.`
      );
    }

    const finalPictograph =
      this.pictographFilterService.selectRandom(finalMoves);
    let finalBeat = this.beatConverterService.convertToBeat(
      finalPictograph,
      sequence.length,
      options.gridMode
    );

    // Set turns if level 2 or 3
    const finalTurnIndex = Math.min(
      sequence.length - 1,
      turnAllocation.blue.length - 1
    );
    if (level === 2 || level === 3) {
      const blueTurn = turnAllocation.blue[finalTurnIndex];
      const redTurn = turnAllocation.red[finalTurnIndex];

      if (blueTurn === undefined || redTurn === undefined) {
        throw new Error(
          `Missing turn allocation at final index ${finalTurnIndex}`
        );
      }

      this.turnManagementService.setTurns(finalBeat, blueTurn, redTurn);
    }

    // Update orientations
    finalBeat = this.orientationCalculationService.updateStartOrientations(
      finalBeat,
      lastBeat
    );
    this.turnManagementService.updateDashStaticRotationDirections(
      finalBeat,
      options.propContinuity ?? PropContinuity.CONTINUOUS,
      blueRotationDirection,
      redRotationDirection
    );
    finalBeat =
      this.orientationCalculationService.updateEndOrientations(finalBeat);

    // 🎯 CRITICAL FIX: Calculate arrow placements for final beat
    const finalPictographData =
      await this.arrowPositioningOrchestrator.calculateAllArrowPoints(
        finalBeat
      );
    finalBeat = { ...finalBeat, ...finalPictographData };

    sequence.push(finalBeat);

    return sequence;
  }

  /**
   * Allocate turns for the sequence
   * EXACT ORIGINAL LOGIC FROM SequenceGenerationService._allocateTurns
   */
  private _allocateTurns(
    beatsToGenerate: number,
    level: number,
    turnIntensity: number
  ): { blue: (number | "fl")[]; red: (number | "fl")[] } {
    return this.capParams.allocateTurns(beatsToGenerate, level, turnIntensity);
  }

  /**
   * Determine rotation directions based on prop continuity
   * EXACT ORIGINAL LOGIC FROM SequenceGenerationService._determineRotationDirections
   */
  private _determineRotationDirections(propContinuity?: PropContinuity): {
    blueRotationDirection: string;
    redRotationDirection: string;
  } {
    return this.capParams.determineRotationDirections(propContinuity);
  }

  /**
   * Generate next beat - orchestrates filtering and conversion
   * EXACT ORIGINAL LOGIC FROM SequenceGenerationService._generateNextBeat
   */
  private async _generateNextBeat(
    sequence: BeatData[],
    level: number,
    turnBlue: number | "fl",
    turnRed: number | "fl",
    propContinuity: PropContinuity,
    blueRotationDirection: string,
    redRotationDirection: string,
    gridMode: GridMode
  ): Promise<BeatData> {
    // Get all options
    const allOptions =
      await this.letterQueryHandler.getAllPictographVariations(gridMode);

    // Apply filters
    let filteredOptions = allOptions;
    const lastBeat = sequence.length > 0 ? sequence[sequence.length - 1] : null;

    // Handle undefined case from array access
    const lastBeatSafe = lastBeat ?? null;
    filteredOptions = this.pictographFilterService.filterByContinuity(
      filteredOptions,
      lastBeatSafe
    );

    if (propContinuity === PropContinuity.CONTINUOUS) {
      filteredOptions = this.pictographFilterService.filterByRotation(
        filteredOptions,
        blueRotationDirection,
        redRotationDirection
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
      gridMode
    );

    // Set turns if level 2 or 3
    if (level === 2 || level === 3) {
      this.turnManagementService.setTurns(nextBeat, turnBlue, turnRed);
    }

    // Update orientations
    if (sequence.length > 0) {
      const previousBeat = sequence[sequence.length - 1];
      if (!previousBeat) {
        throw new Error("Expected previous beat but found undefined");
      }

      nextBeat = this.orientationCalculationService.updateStartOrientations(
        nextBeat,
        previousBeat
      );
    }

    this.turnManagementService.updateDashStaticRotationDirections(
      nextBeat,
      propContinuity,
      blueRotationDirection,
      redRotationDirection
    );

    nextBeat =
      this.orientationCalculationService.updateEndOrientations(nextBeat);

    // 🎯 CRITICAL FIX: Calculate arrow placements before returning
    const nextPictographData =
      await this.arrowPositioningOrchestrator.calculateAllArrowPoints(nextBeat);
    nextBeat = { ...nextBeat, ...nextPictographData };

    return nextBeat;
  }
}
