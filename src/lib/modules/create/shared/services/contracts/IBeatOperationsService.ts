/**
 * Beat Operations Service Contract
 *
 * Handles all beat manipulation business logic for CreateModule sequence construction.
 * Manages beat removal, batch editing, individual beat mutations, undo snapshots, and beat selection logic.
 *
 * Domain: Create module - Beat Manipulation within Sequence Construction
 * Extracted from CreateModule.svelte to achieve Single Responsibility Principle.
 */

export interface IBeatOperationsService {
  /**
   * Remove a beat and all subsequent beats from the sequence
   * Handles special case of removing start position (clears entire sequence)
   * Creates undo snapshot and manages beat selection after removal
   *
   * @param beatIndex Index of beat to remove (0 = start position)
   * @param CreateModuleState Create Module State for sequence and undo operations
   */
  removeBeat(beatIndex: number, CreateModuleState: any): void;

  /**
   * Apply batch changes to multiple selected beats
   * Creates undo snapshot before applying changes
   *
   * @param changes Partial beat data to apply to all selected beats
   * @param CreateModuleState Create Module State for sequence operations
   */
  applyBatchChanges(changes: any, CreateModuleState: any): void;

  /**
   * Update orientation for a specific prop color in a beat
   * Handles both start position (beat 0) and sequence beats
   *
   * @param beatNumber Beat number (0 = start position, 1+ = sequence beats)
   * @param color Prop color ('blue' or 'red')
   * @param orientation New orientation value
   * @param CreateModuleState Create Module State for sequence operations
   * @param panelState Panel state for current beat data
   */
  updateBeatOrientation(
    beatNumber: number,
    color: string,
    orientation: string,
    CreateModuleState: any,
    panelState: any
  ): void;

  /**
   * Update turn amount for a specific prop color in a beat
   * Handles both start position (beat 0) and sequence beats
   *
   * @param beatNumber Beat number (0 = start position, 1+ = sequence beats)
   * @param color Prop color ('blue' or 'red')
   * @param turnAmount New turn amount value (number or "fl" for float)
   * @param CreateModuleState Create Module State for sequence operations
   * @param panelState Panel state for current beat data
   */
  updateBeatTurns(
    beatNumber: number,
    color: string,
    turnAmount: number | "fl",
    CreateModuleState: any,
    panelState: any
  ): void;

  /**
   * Update prop type for a specific prop color in a beat
   * Handles both start position (beat 0) and sequence beats
   * Enables per-motion prop type selection (e.g., red hand + blue staff)
   *
   * @param beatNumber Beat number (0 = start position, 1+ = sequence beats)
   * @param color Prop color ('blue' or 'red')
   * @param propType New prop type value (from PropType enum)
   * @param CreateModuleState Create Module State for sequence operations
   * @param panelState Panel state for current beat data
   */
  updateBeatPropType(
    beatNumber: number,
    color: string,
    propType: any,
    CreateModuleState: any,
    panelState: any
  ): void;

  /**
   * Bulk update prop type for all motions of a specific color
   * Updates start position and all beats in the current sequence
   * Called when user changes prop type in settings
   *
   * @param color Prop color ('blue' or 'red')
   * @param propType New prop type value (from PropType enum)
   * @param CreateModuleState Create Module State for sequence operations
   */
  bulkUpdatePropType(
    color: string,
    propType: any,
    CreateModuleState: any
  ): void;
}
