/**
 * Arrow Debug Data Service
 *
 * Handles sample data loading and management for debugging
 * Extracted from arrow-debug-state.svelte.ts
 */

import type { PictographData } from "$lib/domain";

export class ArrowDebugDataService {
  /**
   * Load sample pictographs for testing
   */
  async loadSamplePictographs(): Promise<PictographData[]> {
    // For now, return minimal sample data
    // This would be expanded with proper enum values and data structures
    return [];
  }
}
