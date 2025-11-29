/**
 * Start Position Selector Implementation
 *
 * Selects random start positions for sequence generation.
 * Extracted from SequenceGenerationService for single responsibility.
 *
 * MIGRATION NOTE: Now returns StartPositionData instead of BeatData with beatNumber===0
 */
import type {
  ILetterQueryHandler,
  IArrowPositioningOrchestrator,
  GridMode,
} from "$lib/shared/index";
import type { StartPositionData } from "$lib/modules/create/shared/domain/models/StartPositionData";
import { TYPES } from "$lib/shared/inversify/types";
import { inject, injectable } from "inversify";
import type {
  IBeatConverterService,
  IPictographFilterService,
} from "../contracts";
import type { IStartPositionSelector } from "../contracts/IStartPositionSelector";

@injectable()
export class StartPositionSelector implements IStartPositionSelector {
  constructor(
    @inject(TYPES.ILetterQueryHandler)
    private letterQueryHandler: ILetterQueryHandler,
    @inject(TYPES.IPictographFilterService)
    private pictographFilterService: IPictographFilterService,
    @inject(TYPES.IBeatConverterService)
    private beatConverterService: IBeatConverterService,
    @inject(TYPES.IArrowPositioningOrchestrator)
    private arrowPositioningOrchestrator: IArrowPositioningOrchestrator
  ) {}

  /**
   * Select a random start position
   * Now returns proper StartPositionData with type discriminator
   */
  async selectStartPosition(gridMode: GridMode): Promise<StartPositionData> {
    const allOptions =
      await this.letterQueryHandler.getAllPictographVariations(gridMode);
    const startPositions =
      this.pictographFilterService.filterStartPositions(allOptions);
    const startPictograph =
      this.pictographFilterService.selectRandom(startPositions);

    // Use the new convertToStartPosition method instead of convertToBeat(pictograph, 0, gridMode)
    let startPosition = this.beatConverterService.convertToStartPosition(
      startPictograph,
      gridMode
    );

    // 🎯 CRITICAL FIX: Calculate arrow placements for start position
    // This ensures start position arrows have correct positions instead of default (0, 0)
    const updatedPictographData =
      await this.arrowPositioningOrchestrator.calculateAllArrowPoints(
        startPosition
      );
    startPosition = { ...startPosition, ...updatedPictographData };

    return startPosition;
  }
}
