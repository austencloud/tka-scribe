/**
 * Sequence State Factory - Component-Scoped State for Svelte 5 Runes
 *
 * Single, unified sequence state used across the app and the build/workbench.
 *
 * - Supports persistence-oriented operations via ISequenceService (async)
 * - Supports workbench editing operations via ISequenceStateService (pure sync)
 *
 * Pass one or both services depending on context.
 */

import type {
  ArrowPosition,
  BeatData,
  SequenceData,
  ValidationResult,
} from "$domain";
import { GridMode } from "$domain";
import type { ISequenceService } from "$services/build/contracts/workbench/sequence-interfaces";
import type { ISequenceStateService } from "$services/build/contracts/workbench/sequence-state-interfaces";

interface SequenceStateOptions {
  sequenceService?: ISequenceService;
  sequenceStateService?: ISequenceStateService;
  getAllSequences?: () => Promise<SequenceData[]>;
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createSequenceState(
  services:
    | {
        sequenceService?: ISequenceService;
        sequenceStateService?: ISequenceStateService;
      }
    | ISequenceService
    | ISequenceStateService
) {
  // Back-compat: allow passing a single service instance or an options object
  let sequenceService: ISequenceService | undefined;
  let sequenceStateService: ISequenceStateService | undefined;
  const arg = services as SequenceStateOptions;
  if (arg && ("sequenceService" in arg || "sequenceStateService" in arg)) {
    sequenceService = arg.sequenceService as ISequenceService | undefined;
    sequenceStateService = arg.sequenceStateService as
      | ISequenceStateService
      | undefined;
  } else if (arg && typeof arg === "object") {
    if ("getAllSequences" in arg) {
      sequenceService = arg as ISequenceService;
    }
    if ("addBeat" in arg) {
      sequenceStateService = arg as ISequenceStateService;
    }
  }
  // ============================================================================
  // COMPONENT-SCOPED STATE
  // ============================================================================

  const state = $state({
    // Sequence state
    currentSequence: null as SequenceData | null,
    sequences: [] as SequenceData[],
    isLoading: false,
    error: null as string | null,

    // Selection state
    selectedBeatIndex: null as number | null,
    selectedSequenceId: null as string | null,

    // UI state
    showBeatNumbers: true,
    gridMode: GridMode.DIAMOND as GridMode,

    // Arrow positioning state
    arrowPositions: new Map<string, ArrowPosition>(),
    arrowPositioningInProgress: false,
    arrowPositioningError: null as string | null,
  });

  // ============================================================================
  // GETTERS
  // ============================================================================

  function getCurrentSequence() {
    return state.currentSequence;
  }
  function getSequences() {
    return state.sequences;
  }
  function getIsLoading() {
    return state.isLoading;
  }
  function getError() {
    return state.error;
  }
  function getSelectedBeatIndex() {
    return state.selectedBeatIndex;
  }
  function getSelectedSequenceId() {
    return state.selectedSequenceId;
  }
  function getShowBeatNumbers() {
    return state.showBeatNumbers;
  }
  function getGridMode() {
    return state.gridMode;
  }
  function getArrowPositions() {
    return state.arrowPositions;
  }
  function getArrowPositioningInProgress() {
    return state.arrowPositioningInProgress;
  }
  function getArrowPositioningError() {
    return state.arrowPositioningError;
  }

  // ============================================================================
  // COMPUTED GETTERS
  // ============================================================================

  function getCurrentBeats(): BeatData[] {
    // Return a mutable copy to allow UI modifications without violating readonly domain model
    return state.currentSequence ? [...state.currentSequence.beats] : [];
  }

  function getSelectedBeatData(): BeatData | null {
    if (state.selectedBeatIndex === null || !state.currentSequence) {
      return null;
    }
    return state.currentSequence.beats[state.selectedBeatIndex] ?? null;
  }

  // getSelectedBeat and hasCurrentSequence are implemented later with
  // optional use of sequenceStateService for validation/derivation.

  function getSequenceCount(): number {
    return state.sequences.length;
  }

  function getHasUnsavedChanges(): boolean {
    // TODO: Implement change tracking
    return false;
  }

  function getHasArrowPositions(): boolean {
    return state.arrowPositions.size > 0;
  }

  function getArrowPositioningComplete(): boolean {
    return !state.arrowPositioningInProgress && state.arrowPositions.size > 0;
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Set the current sequence
   */
  function setCurrentSequence(sequence: SequenceData | null): void {
    state.currentSequence = sequence;
    state.selectedSequenceId = sequence?.id ?? null;
    state.selectedBeatIndex = null; // Reset beat selection
  }

  /**
   * Add sequence to the list
   */
  function addSequence(sequence: SequenceData): void {
    state.sequences.push(sequence);
    setCurrentSequence(sequence);
  }

  /**
   * Update sequence in the list
   */
  function updateSequence(updatedSequence: SequenceData): void {
    const index = state.sequences.findIndex((s) => s.id === updatedSequence.id);
    if (index >= 0) {
      state.sequences[index] = updatedSequence;
    }

    // Update current sequence if it's the same one
    if (state.currentSequence?.id === updatedSequence.id) {
      state.currentSequence = updatedSequence;
    }
  }

  /**
   * Remove sequence from the list
   */
  function removeSequence(sequenceId: string): void {
    state.sequences = state.sequences.filter((s) => s.id !== sequenceId);

    // Clear current sequence if it was deleted
    if (state.currentSequence?.id === sequenceId) {
      setCurrentSequence(null);
    }
  }

  /**
   * Set sequences list
   */
  function setSequences(newSequences: SequenceData[]): void {
    state.sequences = newSequences;
  }

  /**
   * Set loading state
   */
  function setLoading(loading: boolean): void {
    state.isLoading = loading;
  }

  /**
   * Set error state
   */
  function setError(error: string | null): void {
    state.error = error;
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    state.error = null;
  }

  /**
   * Update current beat in sequence
   */
  function updateCurrentBeat(beatIndex: number, beatData: BeatData): void {
    if (
      state.currentSequence &&
      beatIndex >= 0 &&
      beatIndex < state.currentSequence.beats.length
    ) {
      // Create a new beats array (respecting immutability of domain model) and assign
      const newBeats = [...state.currentSequence.beats];
      newBeats[beatIndex] = beatData;
      state.currentSequence = {
        ...state.currentSequence,
        beats: newBeats,
      } as SequenceData;
    }
  }

  /**
   * Select a beat
   */
  // selectBeat is implemented later to optionally use sequenceStateService.

  /**
   * Set grid mode
   */
  function setGridMode(mode: GridMode): void {
    state.gridMode = mode;
  }

  /**
   * Set show beat numbers
   */
  function setShowBeatNumbers(show: boolean): void {
    state.showBeatNumbers = show;
  }

  /**
   * Set arrow positions
   */
  function setArrowPositions(positions: Map<string, ArrowPosition>): void {
    state.arrowPositions = positions;
  }

  /**
   * Set arrow positioning in progress
   */
  function setArrowPositioningInProgress(inProgress: boolean): void {
    state.arrowPositioningInProgress = inProgress;
  }

  /**
   * Set arrow positioning error
   */
  function setArrowPositioningError(error: string | null): void {
    state.arrowPositioningError = error;
  }

  /**
   * Get arrow position for color
   */
  function getArrowPosition(color: string): ArrowPosition | null {
    return state.arrowPositions.get(color) || null;
  }

  /**
   * Clear all arrow positions
   */
  function clearArrowPositions(): void {
    state.arrowPositions.clear();
  }

  /**
   * Reset all state
   */
  function resetSequenceState(): void {
    state.currentSequence = null;
    state.sequences = [];
    state.isLoading = false;
    state.error = null;
    state.selectedBeatIndex = null;
    state.selectedSequenceId = null;
    state.gridMode = GridMode.DIAMOND;
    state.arrowPositions.clear();
    state.arrowPositioningInProgress = false;
    state.arrowPositioningError = null;
  }

  // ============================================================================
  // SERVICE INTEGRATION ACTIONS
  // ============================================================================

  /**
   * Load sequences using the injected service
   */
  async function loadSequences(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      if (!sequenceService) return; // Not available in some contexts
      const sequences = await sequenceService.getAllSequences();
      setSequences(sequences);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error loading sequences";
      setError(errorMessage);
      console.error("Failed to load sequences:", error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create sequence using the injected service
   */
  async function createSequence(request: {
    name: string;
    length: number;
  }): Promise<SequenceData | null> {
    setLoading(true);
    setError(null);
    try {
      if (!sequenceService) return null;
      const sequence = await sequenceService.createSequence(request);
      addSequence(sequence);
      return sequence;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error creating sequence";
      setError(errorMessage);
      console.error("Failed to create sequence:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update sequence using the injected service
   */
  async function updateSequenceBeats(
    sequenceId: string,
    beatIndex: number,
    beatData: BeatData
  ): Promise<void> {
    try {
      if (!sequenceService) return;
      await sequenceService.updateBeat(sequenceId, beatIndex, beatData);
      updateCurrentBeat(beatIndex, beatData);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error updating beat";
      setError(errorMessage);
      console.error("Failed to update beat:", error);
    }
  }

  // ============================================================================
  // WORKBENCH EDITING OPERATIONS (via ISequenceStateService if provided)
  // ============================================================================

  function getSelectedBeat(): BeatData | null {
    if (state.selectedBeatIndex === null || !state.currentSequence) return null;
    if (sequenceStateService) {
      return sequenceStateService.getSelectedBeat(
        state.currentSequence,
        state.selectedBeatIndex
      );
    }
    return (state.currentSequence.beats[state.selectedBeatIndex] ??
      null) as BeatData | null;
  }

  function hasCurrentSequence(): boolean {
    return state.currentSequence !== null;
  }

  function getBeatCount(): number {
    return state.currentSequence?.beats.length ?? 0;
  }

  function getSequenceStatistics() {
    if (!state.currentSequence || !sequenceStateService) return null;
    return sequenceStateService.getSequenceStatistics(state.currentSequence);
  }

  function getSequenceWord(): string {
    if (!state.currentSequence || !sequenceStateService) return "";
    return sequenceStateService.generateSequenceWord(state.currentSequence);
  }

  function getSequenceDuration(): number {
    if (!state.currentSequence || !sequenceStateService) return 0;
    return sequenceStateService.calculateSequenceDuration(
      state.currentSequence
    );
  }

  function selectBeat(index: number | null): void {
    if (index === null) {
      state.selectedBeatIndex = null;
      return;
    }
    if (!sequenceStateService) {
      state.selectedBeatIndex = index;
      return;
    }
    if (sequenceStateService.isValidBeatIndex(state.currentSequence, index)) {
      state.selectedBeatIndex = index;
    } else {
      state.selectedBeatIndex = null;
    }
  }

  function clearSelection(): void {
    state.selectedBeatIndex = null;
  }

  function addBeat(beatData?: Partial<BeatData>): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.addBeat(
        state.currentSequence,
        beatData
      );
      state.error = null;
    } catch (err) {
      state.error = err instanceof Error ? err.message : "Failed to add beat";
    }
  }

  function removeBeat(beatIndex: number): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.removeBeat(
        state.currentSequence,
        beatIndex
      );
      if (state.selectedBeatIndex === beatIndex) {
        state.selectedBeatIndex = null;
      } else if (
        state.selectedBeatIndex !== null &&
        state.selectedBeatIndex > beatIndex
      ) {
        state.selectedBeatIndex = state.selectedBeatIndex - 1;
      }
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to remove beat";
    }
  }

  function updateBeat(beatIndex: number, beatData: Partial<BeatData>): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.updateBeat(
        state.currentSequence,
        beatIndex,
        beatData
      );
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to update beat";
    }
  }

  function insertBeat(beatIndex: number, beatData?: Partial<BeatData>): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.insertBeat(
        state.currentSequence,
        beatIndex,
        beatData
      );
      if (
        state.selectedBeatIndex !== null &&
        state.selectedBeatIndex >= beatIndex
      ) {
        state.selectedBeatIndex = state.selectedBeatIndex + 1;
      }
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to insert beat";
    }
  }

  function clearSequenceBeats(): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.clearSequence(
        state.currentSequence
      );
      state.selectedBeatIndex = null;
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to clear sequence";
    }
  }

  function duplicateSequence(newName?: string): SequenceData | null {
    if (!state.currentSequence || !sequenceStateService) return null;
    try {
      const duplicated = sequenceStateService.duplicateSequence(
        state.currentSequence,
        newName
      );
      state.error = null;
      return duplicated;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to duplicate sequence";
      return null;
    }
  }

  function setStartPosition(startPosition: BeatData): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.setStartPosition(
        state.currentSequence,
        startPosition
      );
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to set start position";
    }
  }

  function mirrorSequence(): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.mirrorSequence(
        state.currentSequence
      );
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to mirror sequence";
    }
  }

  function swapColors(): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.swapColors(
        state.currentSequence
      );
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to swap colors";
    }
  }

  function rotateSequence(direction: "clockwise" | "counterclockwise"): void {
    if (!state.currentSequence || !sequenceStateService) return;
    try {
      state.currentSequence = sequenceStateService.rotateSequence(
        state.currentSequence,
        direction
      );
      state.error = null;
    } catch (err) {
      state.error =
        err instanceof Error ? err.message : "Failed to rotate sequence";
    }
  }

  function validateCurrentSequence(): ValidationResult | null {
    if (!state.currentSequence || !sequenceStateService) return null;
    return sequenceStateService.validateSequence(state.currentSequence);
  }

  function isBeatSelected(index: number): boolean {
    return state.selectedBeatIndex === index;
  }

  function getBeat(index: number): BeatData | null {
    if (sequenceStateService)
      return sequenceStateService.getSelectedBeat(state.currentSequence, index);
    if (!state.currentSequence) return null;
    return state.currentSequence.beats[index] ?? null;
  }

  function hasContent(): boolean {
    return state.currentSequence?.beats.some((b) => !b.isBlank) ?? false;
  }

  // ============================================================================
  // RETURN STATE OBJECT
  // ============================================================================

  return {
    // State access (reactive)
    get currentSequence() {
      return state.currentSequence;
    },
    get sequences() {
      return state.sequences;
    },
    get isLoading() {
      return state.isLoading;
    },
    get error() {
      return state.error;
    },
    get selectedBeatIndex() {
      return state.selectedBeatIndex;
    },
    get selectedSequenceId() {
      return state.selectedSequenceId;
    },
    get showBeatNumbers() {
      return state.showBeatNumbers;
    },
    get gridMode() {
      return state.gridMode;
    },
    get arrowPositions() {
      return state.arrowPositions;
    },
    get arrowPositioningInProgress() {
      return state.arrowPositioningInProgress;
    },
    get arrowPositioningError() {
      return state.arrowPositioningError;
    },

    // Getters
    getCurrentSequence,
    getSequences,
    getIsLoading,
    getError,
    getSelectedBeatIndex,
    getSelectedSequenceId,
    getShowBeatNumbers,
    getGridMode,
    getArrowPositions,
    getArrowPositioningInProgress,
    getArrowPositioningError,

    // Computed getters
    getCurrentBeats,
    getSelectedBeatData,
    getSelectedBeat: getSelectedBeat,
    getHasCurrentSequence: hasCurrentSequence,
    getSequenceCount,
    getHasUnsavedChanges,
    getHasArrowPositions,
    getArrowPositioningComplete,
    hasSequence: hasCurrentSequence,
    beatCount: getBeatCount,
    sequenceStatistics: getSequenceStatistics,
    sequenceWord: getSequenceWord,
    sequenceDuration: getSequenceDuration,

    // Actions
    setCurrentSequence,
    addSequence,
    updateSequence,
    removeSequence,
    setSequences,
    setLoading,
    setError,
    clearError,
    updateCurrentBeat,
    selectBeat,
    setGridMode,
    setShowBeatNumbers,
    setArrowPositions,
    setArrowPositioningInProgress,
    setArrowPositioningError,
    getArrowPosition,
    clearArrowPositions,
    resetSequenceState,
    clearSelection,
    addBeat,
    removeBeat,
    updateBeat,
    insertBeat,
    clearSequence: clearSequenceBeats,
    duplicateSequence,
    setStartPosition,
    mirrorSequence,
    swapColors,
    rotateSequence,
    validateCurrentSequence,
    isBeatSelected,
    getBeat,
    hasContent,

    // Service integration
    loadSequences,
    createSequence,
    updateSequenceBeats,
  };
}

// ============================================================================
// MODERN FACTORY EXPORT
// ============================================================================

// Export only the factory function - components should use createSequenceState()
// This eliminates legacy compatibility code and enforces proper component-scoped state

export type SequenceState = ReturnType<typeof createSequenceState>;
