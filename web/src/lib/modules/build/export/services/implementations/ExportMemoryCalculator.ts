/**
 * Export Memory Calculator Service
 *
 * Calculates memory usage estimates for export operations.
 */

import { injectable } from "inversify";
import type { SequenceData } from "$shared";
import type { SequenceExportOptions, MemoryEstimate } from "../../domain/models";

export interface IExportMemoryCalculator {
  estimateMemoryUsage(sequence: SequenceData, options: SequenceExportOptions): MemoryEstimate;
  checkMemoryAvailability(): { available: number; total: number };
  validateMemoryRequirements(estimate: MemoryEstimate): boolean;
  getMemoryLimits(): { warning: number; critical: number };
}

@injectable()
export class ExportMemoryCalculator implements IExportMemoryCalculator {
  private readonly WARNING_THRESHOLD_MB = 100;
  private readonly CRITICAL_THRESHOLD_MB = 200;

  estimateMemoryUsage(sequence: SequenceData, options: SequenceExportOptions): MemoryEstimate {
    const beatCount = sequence.beats.length;
    const beatSize = options.beatSize * options.beatScale;
    
    // Calculate canvas dimensions
    const columns = Math.ceil(Math.sqrt(beatCount));
    const rows = Math.ceil(beatCount / columns);
    
    // Estimate canvas size
    const canvasWidth = columns * beatSize + options.margin * 2;
    const canvasHeight = rows * beatSize + options.margin * 2;
    
    // Add space for text if enabled
    let additionalHeight = 0;
    if (options.addWord) additionalHeight += 60;
    if (options.addUserInfo) additionalHeight += 40;
    
    const totalHeight = canvasHeight + additionalHeight;
    
    // Calculate memory usage (RGBA = 4 bytes per pixel)
    const mainCanvasBytes = canvasWidth * totalHeight * 4;
    const beatCanvasBytes = beatCount * beatSize * beatSize * 4;
    const processingOverhead = (mainCanvasBytes + beatCanvasBytes) * 0.5; // 50% overhead
    
    const totalBytes = mainCanvasBytes + beatCanvasBytes + processingOverhead;
    const estimatedMB = totalBytes / (1024 * 1024);
    
    const safe = estimatedMB < this.WARNING_THRESHOLD_MB;
    
    return {
      estimatedMB: Math.round(estimatedMB * 100) / 100, // Round to 2 decimal places
      safe
    };
  }

  checkMemoryAvailability(): { available: number; total: number } {
    // Browser memory detection is limited, provide conservative estimates
    const totalMB = 1024; // Assume 1GB available for web app
    const usedMB = 100; // Assume 100MB already in use
    
    return {
      available: totalMB - usedMB,
      total: totalMB
    };
  }

  validateMemoryRequirements(estimate: MemoryEstimate): boolean {
    const { available } = this.checkMemoryAvailability();
    return estimate.estimatedMB <= available * 0.8; // Use max 80% of available memory
  }

  getMemoryLimits(): { warning: number; critical: number } {
    return {
      warning: this.WARNING_THRESHOLD_MB,
      critical: this.CRITICAL_THRESHOLD_MB
    };
  }
}
