/**
 * Workbench Service Interface
 *
 * Interface for managing workbench operations.
 */

import type { SequenceData, WorkbenchConfig, WorkbenchMode } from "$shared";

export interface IWorkbenchService {
  /**
   * Get the current workbench configuration
   * @returns Current workbench configuration
   */
  getConfig(): WorkbenchConfig;

  /**
   * Check if the workbench is initialized
   * @param config - Workbench configuration
   * @returns True if initialized
   */
  isInitialized(config: WorkbenchConfig): boolean;

  /**
   * Check if editing is allowed in the current mode
   * @param mode - Workbench mode
   * @returns True if editing is allowed
   */
  canEditInMode(mode: WorkbenchMode): boolean;

  /**
   * Initialize the workbench
   * @returns Initialized workbench configuration
   */
  initialize(): WorkbenchConfig;

  /**
   * Set the workbench mode
   * @param config - Current configuration
   * @param mode - New mode to set
   * @returns Updated configuration
   */
  setMode(config: WorkbenchConfig, mode: WorkbenchMode): WorkbenchConfig;

  /**
   * Check if a beat can be edited
   * @param sequence - Current sequence
   * @param index - Beat index
   * @returns True if beat can be edited
   */
  canEditBeat(sequence: SequenceData | null, index: number): boolean;

  /**
   * Check if a beat can be cleared
   * @param sequence - Current sequence
   * @param index - Beat index
   * @returns True if beat can be cleared
   */
  canClearBeat(sequence: SequenceData | null, index: number): boolean;

  /**
   * Check if beat should be selected on click
   * @param mode - Current workbench mode
   * @param beatIndex - Beat index
   * @returns True if beat should be selected
   */
  shouldSelectBeatOnClick(mode: WorkbenchMode, beatIndex: number): boolean;

  /**
   * Create default pictograph data
   * @returns Default pictograph data
   */
  createDefaultPictographData(): any;

  /**
   * Create edited beat data
   * @param beat - Original beat
   * @param pictographData - New pictograph data
   * @returns Updated beat data
   */
  createEditedBeatData(beat: any, pictographData: any): any;

  /**
   * Create cleared beat data
   * @param beat - Original beat
   * @returns Cleared beat data
   */
  createClearedBeatData(beat: any): any;

  /**
   * Create sequence creation parameters
   * @param name - Sequence name
   * @param length - Sequence length
   * @returns Creation parameters
   */
  createSequenceCreationParams(name?: string, length?: number): any;

  /**
   * Validate sequence creation
   * @param name - Sequence name
   * @param length - Sequence length
   * @returns Validation result
   */
  validateSequenceCreation(name: string, length: number): any;

  /**
   * Validate beat size change
   * @param currentSize - Current size
   * @param newSize - New size
   * @returns True if valid
   */
  validateBeatSizeChange(currentSize: number, newSize: number): boolean;
}
