/**
 * Deep Link Store
 *
 * Temporary storage for deep link data that needs to be loaded into modules.
 * Modules check this store on mount and consume the data if it matches their module ID.
 *
 * This decouples the URL parsing from module-specific loading logic.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

interface DeepLinkData {
  moduleId: string;
  tabId: string | undefined;
  sequence: SequenceData;
  timestamp: number; // Prevent stale data
}

class DeepLinkStore {
  private data = $state<DeepLinkData | null>(null);

  /**
   * Set deep link data to be consumed by a module
   */
  set(moduleId: string, sequence: SequenceData, tabId?: string): void {
    this.data = {
      moduleId,
      tabId,
      sequence,
      timestamp: Date.now(),
    };
  }

  /**
   * Get and consume deep link data for a specific module
   * Returns null if no data or data is for a different module
   */
  consume(
    moduleId: string
  ): { sequence: SequenceData; tabId: string | undefined } | null {
    if (this.data?.moduleId !== moduleId) {
      return null;
    }

    // Check if data is stale (older than 5 seconds)
    const isStale = Date.now() - this.data.timestamp > 5000;
    if (isStale) {
      this.data = null;
      return null;
    }

    // Consume the data (clear after reading)
    const result = {
      sequence: this.data.sequence,
      tabId: this.data.tabId,
    };
    this.data = null;
    return result;
  }

  /**
   * Check if there's pending deep link data for a module
   */
  has(moduleId: string): boolean {
    if (this.data?.moduleId !== moduleId) {
      return false;
    }

    const isStale = Date.now() - this.data.timestamp > 5000;
    return !isStale;
  }

  /**
   * Clear all deep link data
   */
  clear(): void {
    this.data = null;
  }
}

export const deepLinkStore = new DeepLinkStore();
