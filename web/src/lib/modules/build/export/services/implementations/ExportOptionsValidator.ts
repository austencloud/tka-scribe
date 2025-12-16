/**
 * Export Options Validator Service
 *
 * Validates export options and provides validation feedback.
 */

import { injectable } from "inversify";
import type { SequenceExportOptions } from "../../domain/models";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface IExportOptionsValidator {
  validateOptions(options: SequenceExportOptions): ValidationResult;
  validateFormat(format: string): boolean;
  validateQuality(quality: number, format: string): boolean;
  validateDimensions(width?: number, height?: number): boolean;
  validateScale(scale: number): boolean;
}

@injectable()
export class ExportOptionsValidator implements IExportOptionsValidator {
  validateOptions(options: SequenceExportOptions): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate format
    if (!this.validateFormat(options.format)) {
      errors.push(`Invalid format: ${options.format}. Must be PNG, JPEG, or WebP.`);
    }

    // Validate quality
    if (!this.validateQuality(options.quality, options.format)) {
      errors.push(`Invalid quality: ${options.quality}. Must be between 0 and 1.`);
    }

    // Validate scale
    if (!this.validateScale(options.scale)) {
      errors.push(`Invalid scale: ${options.scale}. Must be greater than 0.`);
    }

    // Validate beat scale
    if (!this.validateScale(options.beatScale)) {
      errors.push(`Invalid beat scale: ${options.beatScale}. Must be greater than 0.`);
    }

    // Validate dimensions if provided
    if (!this.validateDimensions(options.width, options.height)) {
      errors.push('Invalid dimensions. Width and height must be positive numbers if provided.');
    }

    // Validate beat size
    if (options.beatSize <= 0) {
      errors.push(`Invalid beat size: ${options.beatSize}. Must be greater than 0.`);
    }

    // Validate margin
    if (options.margin < 0) {
      errors.push(`Invalid margin: ${options.margin}. Must be non-negative.`);
    }

    // Performance warnings
    if (options.beatScale > 2) {
      warnings.push('High beat scale may result in large file sizes and slow processing.');
    }

    if (options.scale > 3) {
      warnings.push('High scale factor may result in very large images.');
    }

    if (options.beatSize > 300) {
      warnings.push('Large beat size may result in memory issues.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  validateFormat(format: string): boolean {
    return ["PNG", "JPEG", "WebP"].includes(format);
  }

  validateQuality(quality: number, format: string): boolean {
    if (typeof quality !== 'number') return false;
    if (quality < 0 || quality > 1) return false;
    
    // PNG doesn't use quality, but we allow it for consistency
    return true;
  }

  validateDimensions(width?: number, height?: number): boolean {
    if (width !== undefined && (typeof width !== 'number' || width <= 0)) {
      return false;
    }
    if (height !== undefined && (typeof height !== 'number' || height <= 0)) {
      return false;
    }
    return true;
  }

  validateScale(scale: number): boolean {
    return typeof scale === 'number' && scale > 0 && scale <= 10;
  }
}
