/**
 * Gallery Cache Service
 *
 * Simple in-memory cache for gallery sequences.
 * Prevents redundant loading and metadata extraction operations.
 */

import { injectable } from "inversify";
import type { SequenceData } from "$shared";
import type { IGalleryCacheService } from "../contracts/IGalleryCacheService";

@injectable()
export class GalleryCacheService implements IGalleryCacheService {
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
