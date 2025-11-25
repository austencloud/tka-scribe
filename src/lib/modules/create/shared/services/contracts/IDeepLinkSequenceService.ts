/**
 * Deep Link Sequence Service Contract
 *
 * Handles loading sequences from:
 * - Deep link URLs (shareable links)
 * - Pending edit transfers from Explorer module
 *
 * Encapsulates the complex sequence enrichment logic
 * (position derivation, letter derivation, merging).
 *
 * Domain: Create module - Sequence Loading
 */

import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";

export interface DeepLinkLoadResult {
  /** Whether a sequence was loaded */
  loaded: boolean;
  /** The tab to navigate to (if specified in deep link) */
  targetTab?: string;
  /** Source of the loaded sequence */
  source?: "deepLink" | "pendingEdit";
}

export interface IDeepLinkSequenceService {
  /**
   * Check if there's a deep link sequence waiting to be loaded
   */
  hasDeepLink(): boolean;

  /**
   * Check if there's a pending edit sequence from Explorer
   */
  hasPendingEdit(): boolean;

  /**
   * Load sequence from deep link store and enrich with derived data.
   * Handles position derivation, letter derivation, and merging.
   *
   * @param setSequence Callback to set the sequence in state
   * @returns Result indicating if sequence was loaded and target tab
   */
  loadFromDeepLink(
    setSequence: (sequence: SequenceData) => void
  ): Promise<DeepLinkLoadResult>;

  /**
   * Load sequence from localStorage pending edit transfer.
   * Used when user clicks "Edit" on a sequence in Explorer.
   *
   * @param setSequence Callback to set the sequence in state
   * @returns Result indicating if sequence was loaded
   */
  loadFromPendingEdit(
    setSequence: (sequence: SequenceData) => void
  ): Promise<DeepLinkLoadResult>;

  /**
   * Attempt to load from any available source (deep link first, then pending edit).
   * Returns immediately after first successful load.
   *
   * @param setSequence Callback to set the sequence in state
   * @returns Result indicating source and target tab
   */
  loadFromAnySource(
    setSequence: (sequence: SequenceData) => void
  ): Promise<DeepLinkLoadResult>;

  /**
   * Clear any pending edit data from localStorage
   */
  clearPendingEdit(): void;
}
