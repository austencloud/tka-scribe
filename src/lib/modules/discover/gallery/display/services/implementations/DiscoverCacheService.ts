/**
 * Explore Cache Service
 *
 * Simple in-memory cache for gallery sequences.
 * Prevents redundant loading and metadata extraction operations.
 */

import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
import { injectable } from "inversify";
import type { IDiscoverCacheService } from "../contracts/IDiscoverCacheService";

@injectable()
export class DiscoverCacheService implements IDiscoverCacheService {
  private cachedSequences: SequenceData[] | null = null;

  getCached(): SequenceData[] | null {
    return this.cachedSequences;
  }

  setCached(sequences: SequenceData[]): void {
    this.cachedSequences = sequences;
  }

  clearCache(): void {
    this.cachedSequences = null;
  }
}
