/**
 * Service for loading gallery sequences from various sources
 */

import type { SequenceData } from "$shared";

export interface IGalleryLoader {
  /**
   * Load all sequence metadata from the sequence index
   */
  loadSequenceMetadata(): Promise<SequenceData[]>;
}
