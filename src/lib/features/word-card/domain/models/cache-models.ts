import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { WordCardExportOptions } from "./word-card-export";

export interface CacheEntry {
  data: Blob | SequenceData;
  timestamp: Date;
  size: number;
  accessCount: number;
  lastAccessed: Date;
  options?: WordCardExportOptions;
}

export interface CacheStats {
  entryCount: number;
  totalSize: number;
  hitRate: number;
  lastCleanup: Date;
}
