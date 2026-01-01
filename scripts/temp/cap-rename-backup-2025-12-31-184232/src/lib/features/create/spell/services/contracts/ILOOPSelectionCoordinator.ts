/**
 * LOOP Selection Coordinator Interface
 *
 * Coordinates the two-phase LOOP selection flow:
 * Phase 1: Pictograph/Bridge Selection (user picks a visual extension)
 * Phase 2: LOOP Selection (user picks how to apply the extension)
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type {
  CircularizationOption,
  LOOPOption,
} from "$lib/features/create/shared/services/contracts/ISequenceExtender";
import type { LOOPType } from "$lib/features/create/generate/circular/domain/models/circular-models";
import type { SpellPreferences } from "../../domain/models/spell-models";

/**
 * Phases of the LOOP selection flow
 */
export type LOOPPhase = "bridge-selection" | "loop-selection";

/**
 * Result of applying a bridge letter to the sequence
 */
export interface BridgeApplicationResult {
  /** Whether the bridge was successfully applied */
  success: boolean;
  /** The updated sequence with bridge beat added */
  sequence?: SequenceData;
  /** Available LOOP options for the selected bridge */
  availableLOOPs?: LOOPOption[];
  /** Error message if application failed */
  error?: string;
}

/**
 * Result of applying a LOOP to complete the sequence
 */
export interface LOOPApplicationResult {
  /** Whether the LOOP was successfully applied */
  success: boolean;
  /** The completed circular sequence */
  sequence?: SequenceData;
  /** The expanded word after LOOP application */
  expandedWord?: string;
  /** Error message if application failed */
  error?: string;
}

export interface ILOOPSelectionCoordinator {
  /**
   * Apply a bridge pictograph to the sequence (Phase 1 → Phase 2 transition)
   * @param sequence Current sequence
   * @param option The circularization option selected
   * @returns Result with updated sequence and available LOOPs
   */
  applyBridge(
    sequence: SequenceData,
    option: CircularizationOption
  ): Promise<BridgeApplicationResult>;

  /**
   * Apply a LOOP to complete the sequence
   * @param word The input word
   * @param preferences User preferences
   * @param bridgeLetter Optional bridge letter to add first
   * @param loopType The LOOP type to apply
   * @returns Result with completed circular sequence
   */
  applyLOOP(
    word: string,
    preferences: SpellPreferences,
    bridgeLetter: Letter | null,
    loopType: LOOPType
  ): Promise<LOOPApplicationResult>;
}
