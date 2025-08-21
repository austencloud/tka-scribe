/**
 * IStartPositionSelectionService.ts
 * 
 * Interface for start position selection service.
 * Defines the contract for handling start position selection business logic.
 */

import type { PictographData } from "$domain/PictographData";
import type { IStartPositionService } from "$services/interfaces/application-interfaces";

/**
 * Service interface for start position selection operations
 */
export interface IStartPositionSelectionService {
  /**
   * Handle the selection of a start position
   * @param startPosPictograph The selected start position pictograph
   * @param startPositionService The start position service for persistence
   */
  selectStartPosition(
    startPosPictograph: PictographData,
    startPositionService: IStartPositionService
  ): Promise<void>;

  /**
   * Preload options for the selected start position
   * @param endPosition The end position to preload options for
   */
  preloadOptionsForPosition(endPosition: string): Promise<void>;
}

/**
 * Service interface symbol for DI container registration
 */
export const IStartPositionSelectionServiceInterface = Symbol('IStartPositionSelectionService');
