/**
 * Sequence Card Export Domain Models
 * Types for sequence card generation and export functionality.
 */

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export interface ProgressInfo {
  current: number;
  total: number;
  percentage: number;
  message?: string;
  stage?: string;
  startTime?: number;
  errorCount?: number;
  warningCount?: number;
}

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface SequenceCardDimensions {
  width: number;
  height: number;
  scale?: number; // Device pixel ratio multiplier
}

export interface SequenceCardMetadata {
  title?: string;
  author?: string;
  beatNumbers?: boolean;
  timestamp?: boolean;
  backgroundColor?: string;
}

export interface BatchOperationConfig {
  batchSize: number;
  memoryThreshold: number; // MB
  enableProgressReporting: boolean;
  enableCancellation: boolean;
  // Additional properties for service compatibility
  maxConcurrency: number;
  retryAttempts: number;
  timeoutMs: number;
}

export interface ExportMetrics {
  processingTime: number;
  fileSize: number;
  resolution: { width: number; height: number };
  memoryUsage?: number;
}

export interface BatchExportProgress extends ProgressInfo {
  // ProgressInfo already includes all the properties we need:
  // current, total, percentage, message, stage, startTime, errorCount, warningCount
  // We can add additional properties specific to batch export if needed
  batchId?: string;
  itemsProcessed?: number;
  // Additional properties for compatibility
  completed: number; // Alias for current
  currentItem?: string; // Alias for message
}

export interface SequenceCardExportResult {
  sequenceId: string;
  success: boolean;
  blob?: Blob;
  error?: Error;
  metrics?: ExportMetrics;
}
