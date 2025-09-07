import type { SequenceData } from "$shared";
import type { ExportOptions } from "./word-card-export";

export interface CacheEntry {
  data: Blob | SequenceData;
  timestamp: Date;
  size: number;
  accessCount: number;
  lastAccessed: Date;
  options?: ExportOptions;
}

export interface CacheStats {
  entryCount: number;
  totalSize: number;
  hitRate: number;
  lastCleanup: Date;
}
