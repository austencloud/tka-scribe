/**
 * Word Card Export Orchestrator
 *
 * Main orchestrator for word card export operations.
 * Single responsibility: Coordinate focused services for export workflow.
 */

// Domain types
import type {
  BatchExportProgress,
  BatchOperationConfig,
  WordCardDimensions,
  WordCardExportResult,
  WordCardMetadata,
} from "../../domain/models/word-card-export";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

// Behavioral contracts
import { TYPES } from "$lib/shared/inversify/types";
import { inject, injectable } from "inversify";
import type {
  IWordCardBatchProcessor,
  IWordCardCache,
  IWordCardExportProgressTracker,
  IWordCardImageConverter,
  IWordCardImageGenerator,
} from "../contracts/word-card-contracts";
import {} from "../contracts/word-card-contracts";
import {} from "../contracts/word-card-contracts";
import type { IWordCardExportOrchestrator } from "../contracts/word-card-contracts";

@injectable()
export class WordCardExportOrchestrator implements IWordCardExportOrchestrator {
  private currentOperationId: string | null = null;

  constructor(
    @inject(TYPES.IWordCardImageGenerator)
    private readonly imageGenerationService: IWordCardImageGenerator,
    @inject(TYPES.IWordCardImageConverter)
    private readonly imageConversionService: IWordCardImageConverter,
    @inject(TYPES.IWordCardBatchProcessor)
    private readonly batchProcessingService: IWordCardBatchProcessor,
    @inject(TYPES.IWordCardExportProgressTracker)
    private readonly progressTracker: IWordCardExportProgressTracker,
    @inject(TYPES.IWordCardCache)
    private readonly cacheService: IWordCardCache
  ) {}

  /**
   * Export multiple word cards (interface requirement)
   */
  async exportWordCards(
    sequences: SequenceData[],
    options: unknown
  ): Promise<WordCardExportResult[]> {
    const opts = options as Record<string, unknown>;
    const dimensions: WordCardDimensions = {
      width: (opts["width"] as number) || 800,
      height: (opts["height"] as number) || 600,
      scale: (opts["scale"] as number) || 1.0,
    };

    const config: BatchOperationConfig = {
      batchSize: (opts["batchSize"] as number) || 10,
      memoryThreshold: 100,
      enableProgressReporting: true,
      enableCancellation: true,
      maxConcurrency: 3,
      retryAttempts: 2,
      timeoutMs: 30000,
    };

    return await this.exportBatch(sequences, dimensions, config);
  }

  /**
   * Get export progress (interface requirement)
   */
  getExportProgress(operationId: string): BatchExportProgress {
    const progress = this.progressTracker.getProgress(operationId);
    if (!progress) {
      // Return default progress if not found
      return {
        current: 0,
        total: 0,
        percentage: 0,
        message: "No operation found",
        stage: "error",
        startTime: new Date(),
        errorCount: 0,
        warningCount: 0,
        completed: 0,
      };
    }
    return progress;
  }

  /**
   * Export single word card
   */
  async exportWordCard(
    sequence: SequenceData,
    dimensions: WordCardDimensions,
    _metadata?: WordCardMetadata
  ): Promise<WordCardExportResult> {
    const startTime = performance.now();
    const sequenceId = sequence.id || sequence.name || "unknown";

    try {

      // Check cache first
      const cachedBlob = this.cacheService.retrieveImage(sequenceId);
      if (cachedBlob) {
        return {
          sequenceId,
          success: true,
          blob: cachedBlob,
          metrics: {
            processingTime: performance.now() - startTime,
            fileSize: cachedBlob.size,
            resolution: dimensions,
          },
        };
      }

      // Generate image
      const canvas = await this.imageGenerationService.generateWordCardImage(
        sequence,
        dimensions
      );

      // Convert to blob
      const blob = await this.imageConversionService.convertCanvasToBlob(
        canvas,
        "PNG",
        0.95
      );

      // Cache the result
      this.cacheService.storeImage(sequenceId, blob);

      const result: WordCardExportResult = {
        sequenceId,
        success: true,
        blob,
        metrics: {
          processingTime: performance.now() - startTime,
          fileSize: blob.size,
          resolution: dimensions,
        },
      };

      return result;
    } catch (error) {
      console.error(`❌ Failed to export sequence ${sequenceId}:`, error);

      return {
        sequenceId,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Export multiple word cards in batch
   */
  async exportBatch(
    sequences: SequenceData[],
    dimensions: WordCardDimensions,
    config: BatchOperationConfig,
    onProgress?: (progress: BatchExportProgress) => void
  ): Promise<WordCardExportResult[]> {
    const operationId = this.generateOperationId();
    this.currentOperationId = operationId;

    try {

      // Start progress tracking
      this.progressTracker.startTracking(operationId, sequences.length);

      // Note: Progress updates will be handled through the batch processor callback

      // Process batch using batch service
      const results = await this.batchProcessingService.processBatch(
        sequences,
        config,
        async (sequence, _index) => {
          return await this.exportWordCard(sequence, dimensions);
        },
        (progress) => {
          // Update progress tracker
          this.progressTracker.updateProgress(
            operationId,
            progress.current,
            progress.message
          );

          // Call external progress callback
          if (onProgress) {
            onProgress(progress);
          }
        }
      );

      // Complete operation
      this.progressTracker.completeTracking(operationId);

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      console.log(
        `✅ Batch export complete: ${successCount} success, ${failureCount} failures`
      );
      return results;
    } catch (error) {
      console.error("❌ Batch export failed:", error);

      // Log error and complete tracking
      console.error(`❌ Batch export failed:`, error);
      this.progressTracker.completeTracking(operationId);

      throw error;
    } finally {
      this.currentOperationId = null;
    }
  }

  /**
   * Cancel current batch operation
   */
  async cancelBatch(): Promise<void> {
    if (this.currentOperationId) {
      await this.batchProcessingService.cancelBatch(this.currentOperationId);
    } else {
      console.warn("⚠️ No active batch operation to cancel");
    }
  }

  /**
   * Get current operation status
   */
  getOperationStatus(): {
    isActive: boolean;
    currentOperation?: string;
    progress?: BatchExportProgress;
  } {
    if (!this.currentOperationId) {
      return { isActive: false };
    }

    const progress = this.progressTracker.getProgress(this.currentOperationId);

    return {
      isActive: true,
      ...(this.currentOperationId && {
        currentOperation: this.currentOperationId,
      }),
      ...(progress && { progress }),
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private generateOperationId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `export-${timestamp}-${random}`;
  }
}
