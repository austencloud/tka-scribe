/**
 * Word Card Export Progress Tracker
 *
 * Tracks progress for word card export operations.
 * Single responsibility: Progress tracking and event emission.
 */

import type { BatchExportProgress } from "$shared/index";
import { injectable } from "inversify";
import type { IWordCardExportProgressTracker } from "../contracts";

interface ProgressOperation {
  id: string;
  totalSteps: number;
  current: number;
  startTime: Date;
  errors: Error[];
  warnings: string[];
  callbacks: Set<(progress: BatchExportProgress) => void>;
  completed: boolean;
}

@injectable()
export class WordCardExportProgressTracker
  implements IWordCardExportProgressTracker
{
  private operations = new Map<string, ProgressOperation>();

  /**
   * Start tracking new operation
   */
  startTracking(operationId: string, totalSteps: number): void {
    const operation: ProgressOperation = {
      id: operationId,
      totalSteps,
      current: 0,
      startTime: new Date(),
      errors: [],
      warnings: [],
      callbacks: new Set(),
      completed: false,
    };

    this.operations.set(operationId, operation);
    console.log(
      `🎯 Started tracking operation: ${operationId} (${totalSteps} steps)`
    );
  }

  /**
   * Update progress for current operation (interface method)
   */
  updateProgress(
    operationId: string,
    completed: number,
    currentItem?: string
  ): void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`Operation ${operationId} not found`);
      return;
    }

    operation.current = completed;

    const progress: BatchExportProgress = {
      current: completed,
      total: operation.totalSteps,
      percentage: (completed / operation.totalSteps) * 100,
      message: currentItem || "Processing...",
      stage: "processing",
      errorCount: operation.errors.length,
      warningCount: operation.warnings.length,
      startTime: operation.startTime,
      completed: completed,
      ...(currentItem && { currentItem }),
    };

    // Notify all callbacks
    operation.callbacks.forEach((callback) => {
      try {
        callback(progress);
      } catch (error) {
        console.error("Progress callback error:", error);
      }
    });

    console.log(
      `📊 Progress ${operationId}: ${completed}/${operation.totalSteps} (${progress.percentage.toFixed(1)}%) - ${currentItem || "Processing..."}`
    );
  }

  /**
   * Add error to current operation
   */
  addError(operationId: string, error: Error): void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`Operation ${operationId} not found`);
      return;
    }

    operation.errors.push(error);
    console.error(`❌ Error in operation ${operationId}:`, error.message);
  }

  /**
   * Add warning to current operation
   */
  addWarning(operationId: string, warning: string): void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`Operation ${operationId} not found`);
      return;
    }

    operation.warnings.push(warning);
    console.warn(`⚠️ Warning in operation ${operationId}: ${warning}`);
  }

  /**
   * Complete operation
   */
  completeTracking(operationId: string): void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(`Operation ${operationId} not found`);
      return;
    }

    operation.completed = true;
    operation.current = operation.totalSteps;

    const finalProgress: BatchExportProgress = {
      current: operation.totalSteps,
      total: operation.totalSteps,
      percentage: 100,
      message: "Operation completed",
      stage: "finalizing",
      errorCount: operation.errors.length,
      warningCount: operation.warnings.length,
      startTime: operation.startTime,
      completed: operation.totalSteps,
    };

    // Final notification to all callbacks
    operation.callbacks.forEach((callback) => {
      try {
        callback(finalProgress);
      } catch (error) {
        console.error("Progress callback error:", error);
      }
    });

    const duration = Date.now() - operation.startTime.getTime();
    console.log(
      `✅ Completed operation ${operationId} in ${duration}ms. Errors: ${operation.errors.length}, Warnings: ${operation.warnings.length}`
    );

    // Clean up after a delay to allow final callbacks
    setTimeout(() => {
      this.operations.delete(operationId);
    }, 1000);
  }

  /**
   * Get current progress
   */
  getProgress(operationId: string): BatchExportProgress | null {
    const operation = this.operations.get(operationId);
    if (!operation) {
      return null;
    }

    return {
      current: operation.current,
      total: operation.totalSteps,
      percentage: (operation.current / operation.totalSteps) * 100,
      message: operation.completed ? "Completed" : "In progress",
      stage: operation.completed ? "finalizing" : "processing",
      errorCount: operation.errors.length,
      warningCount: operation.warnings.length,
      startTime: operation.startTime,
      completed: operation.current,
    };
  }

  /**
   * Clear progress for operation (interface method)
   */
  clearProgress(operationId: string): void {
    const operation = this.operations.get(operationId);
    if (operation) {
      this.operations.delete(operationId);
      console.log(`🧹 Cleared progress for operation: ${operationId}`);
    }
  }

  /**
   * Subscribe to progress updates (internal method)
   */
  onProgress(
    operationId: string,
    callback: (progress: BatchExportProgress) => void
  ): () => void {
    const operation = this.operations.get(operationId);
    if (!operation) {
      console.warn(
        `Operation ${operationId} not found for progress subscription`
      );
      return () => {}; // Return no-op unsubscribe function
    }

    operation.callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      operation.callbacks.delete(callback);
    };
  }
}
