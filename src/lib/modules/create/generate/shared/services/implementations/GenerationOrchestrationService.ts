import type { IReversalDetectionService } from "$create/shared/services/contracts";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { StartPositionData } from "$lib/modules/create/shared/domain/models/StartPositionData";
import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import { inject, injectable } from "inversify";
// Import TYPES directly from inversify/types to avoid HMR issues with re-exports
import { TYPES } from "$lib/shared/inversify/types";
import type { ICAPEndPositionSelector } from "../../../circular/services/contracts/ICAPEndPositionSelector";
import type { ICAPExecutorSelector } from "../../../circular/services/contracts/ICAPExecutorSelector";
import type { IPartialSequenceGenerator } from "../../../circular/services/contracts/IPartialSequenceGenerator";
import type { ICAPParameterProvider } from "../contracts/ICAPParameterProvider";
import type { GenerationOptions } from "../../domain";
import { GenerationMode, PropContinuity } from "../../domain";
import type { IBeatGenerationOrchestrator } from "../contracts/IBeatGenerationOrchestrator";
import type { BeatGenerationOptions } from "../contracts/IBeatGenerationOrchestrator";
import type { IGenerationOrchestrationService } from "../contracts/IGenerationOrchestrationService";
import type { ISequenceMetadataService } from "../contracts/ISequenceMetadataService";
import type { IStartPositionSelector } from "../contracts/IStartPositionSelector";
import type { ITurnAllocator } from "../contracts/ITurnAllocator";
/**
 * Service orchestrating the complete sequence generation pipeline
 *
 * Extracted from generate-actions.svelte.ts to separate orchestration logic
 * from state management. This service composes multiple focused services to
 * build complete sequences for both freeform and circular modes.
 */
@injectable()
export class GenerationOrchestrationService
  implements IGenerationOrchestrationService
{
  constructor(
    @inject(TYPES.IStartPositionSelector)
    private readonly startPositionSelector: IStartPositionSelector,

    @inject(TYPES.ICAPParameterProvider)
    private readonly capParams: ICAPParameterProvider,

    @inject(TYPES.ITurnAllocationCalculator)
    private readonly turnAllocationCalculator: ITurnAllocator,

    @inject(TYPES.IBeatGenerationOrchestrator)
    private readonly beatGenerationOrchestrator: IBeatGenerationOrchestrator,

    @inject(TYPES.ISequenceMetadataService)
    private readonly metadataService: ISequenceMetadataService,

    @inject(TYPES.IReversalDetectionService)
    private readonly reversalDetectionService: IReversalDetectionService,

    @inject(TYPES.IPartialSequenceGenerator)
    private readonly partialSequenceGenerator: IPartialSequenceGenerator,

    @inject(TYPES.ICAPEndPositionSelector)
    private readonly capEndPositionSelector: ICAPEndPositionSelector,

    @inject(TYPES.ICAPExecutorSelector)
    private readonly capExecutorSelector: ICAPExecutorSelector
  ) {}

  /**
   * Generate complete sequence - routes to appropriate mode
   */
  async generateSequence(options: GenerationOptions): Promise<SequenceData> {
    // Route to appropriate generation mode
    if (options.mode === GenerationMode.CIRCULAR) {
      return this.generateCircularSequence(options);
    }

    return this.generateFreeformSequence(options);
  }

  /**
   * Generate freeform sequence using focused service composition
   * EXACT ORIGINAL LOGIC from SequenceGenerationService.generateSequence
   */
  private async generateFreeformSequence(
    options: GenerationOptions
  ): Promise<SequenceData> {
    // Step 1: Get random start position
    const startPosition = await this.startPositionSelector.selectStartPosition(
      options.gridMode
    );
    const sequence: (BeatData | StartPositionData)[] = [startPosition];

    // Step 2: Determine rotation directions
    const rotationDirections =
      this.capParams.determineRotationDirections(
        options.propContinuity
      );

    // Step 3: Calculate turn allocation
    const level = this.metadataService.mapDifficultyToLevel(options.difficulty);
    const turnIntensity = options.turnIntensity || 1;
    const turnAllocation = await this.turnAllocationCalculator.allocateTurns(
      options.length,
      level,
      turnIntensity
    );

    // Step 4: Generate beats
    const beatGenOptions: BeatGenerationOptions = {
      level,
      turnAllocation,
      propContinuity: options.propContinuity || PropContinuity.CONTINUOUS,
      blueRotationDirection: rotationDirections.blueRotationDirection,
      redRotationDirection: rotationDirections.redRotationDirection,
      gridMode: options.gridMode,
    };

    const generatedBeats = await this.beatGenerationOrchestrator.generateBeats(
      sequence,
      options.length,
      beatGenOptions
    );

    // Step 5: Build sequence data structure
    const word = this.metadataService.calculateWordFromBeats(generatedBeats);
    const metadata = this.metadataService.createGenerationMetadata({
      beatsGenerated: generatedBeats.length,
      propContinuity: options.propContinuity || PropContinuity.CONTINUOUS,
      blueRotationDirection: rotationDirections.blueRotationDirection,
      redRotationDirection: rotationDirections.redRotationDirection,
      turnIntensity,
      level,
    });

    // Import shared utilities dynamically to avoid circular dependencies
    const { createSequenceData } = await import("$shared");

    const sequenceData = createSequenceData({
      name: word || `Sequence ${Date.now()}`,
      word,
      beats: generatedBeats,
      startingPositionBeat: startPosition,
      startPosition,
      gridMode: options.gridMode,
      propType: options.propType,
      difficultyLevel: options.difficulty,
      isFavorite: false,
      isCircular: false,
      tags: ["generated", "freeform"],
      metadata,
    });

    // Step 6: Apply reversal detection
    const finalSequence =
      this.reversalDetectionService.processReversals(sequenceData);

    return finalSequence;
  }

  /**
   * Generate circular sequence using CAP executor
   * EXACT ORIGINAL LOGIC from SequenceGenerationService.generatePatternSequence
   */
  private async generateCircularSequence(
    options: GenerationOptions
  ): Promise<SequenceData> {
    // Import circular-specific models
    const { CAPType, SliceSize } = await import(
      "../../../circular/domain/models/circular-models"
    );

    // Use constructor-injected services to avoid HMR issues
    // Determine which CAP executor to use based on capType option
    const capType = options.capType || CAPType.STRICT_ROTATED;
    const capExecutor = this.capExecutorSelector.getExecutor(capType);

    // Get slice size
    const sliceSize = options.sliceSize || SliceSize.HALVED;

    // Determine start and required end positions
    const { GridPosition } = await import("$shared");
    const basicStartPositions =
      options.gridMode === "diamond"
        ? [GridPosition.ALPHA1, GridPosition.BETA5, GridPosition.GAMMA11]
        : [GridPosition.ALPHA2, GridPosition.BETA4, GridPosition.GAMMA12];

    const startPos =
      basicStartPositions[
        Math.floor(Math.random() * basicStartPositions.length)
      ];

    if (!startPos) {
      throw new Error("Failed to determine a starting grid position");
    }
    // Use CAP-specific end position selector (different end positions for rotated/mirrored/swapped/inverted)
    const requiredEndPos = this.capEndPositionSelector.determineEndPosition(
      capType,
      startPos!,
      sliceSize
    );

    // Generate partial sequence ending at required position
    const partialSequence =
      await this.partialSequenceGenerator.generatePartialSequence(
        startPos,
        requiredEndPos,
        sliceSize,
        options
      );

    // Execute CAP to complete the circle
    const circularBeats = capExecutor.executeCAP(partialSequence, sliceSize);

    // Build sequence data
    const word = this.metadataService.calculateWordFromBeats(
      circularBeats.slice(1)
    ); // Exclude start position
    const metadata = this.metadataService.createGenerationMetadata({
      beatsGenerated: circularBeats.length - 1,
      propContinuity: options.propContinuity || PropContinuity.CONTINUOUS,
      blueRotationDirection: "",
      redRotationDirection: "",
      turnIntensity: options.turnIntensity || 1,
      level: this.metadataService.mapDifficultyToLevel(options.difficulty),
    });

    const { createSequenceData } = await import("$shared");
    const sequence = createSequenceData({
      name: `Circular ${word}`,
      word,
      beats: circularBeats.slice(1), // Exclude start position beat
      ...(circularBeats[0] && { startingPositionBeat: circularBeats[0] }),
      ...(circularBeats[0] && { startPosition: circularBeats[0] }),
      gridMode: options.gridMode,
      propType: options.propType,
      difficultyLevel: options.difficulty,
      isFavorite: false,
      isCircular: true,
      tags: ["circular", "cap", capType.replace("_", "-")],
      metadata,
    });

    return this.reversalDetectionService.processReversals(sequence);
  }
}
