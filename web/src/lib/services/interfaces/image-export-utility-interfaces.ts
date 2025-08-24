/**
 * TKA Image Export Utility Interfaces
 *
 * Service contracts for configuration management, memory calculation,
 * validation, and utility functions in the TKA image export system.
 */

import type { SequenceData } from "./domain-types";
import type { TKAImageExportOptions } from "./image-export-core-interfaces";

// ============================================================================
// UTILITY AND HELPER SERVICES
// ============================================================================

/**
 * Export settings management service
 */
export interface IExportSettingsService {
  /**
   * Get current export settings
   */
  getCurrentSettings(): TKAImageExportOptions;

  /**
   * Update export settings
   */
  updateSettings(settings: Partial<TKAImageExportOptions>): Promise<void>;

  /**
   * Reset to default settings
   */
  resetToDefaults(): Promise<void>;

  /**
   * Save settings preset
   */
  savePreset(name: string, settings: TKAImageExportOptions): Promise<void>;

  /**
   * Load settings preset
   */
  loadPreset(name: string): Promise<TKAImageExportOptions | null>;

  /**
   * Get available presets
   */
  getPresets(): Promise<string[]>;

  /**
   * Validate settings
   */
  validateSettings(settings: TKAImageExportOptions): boolean;
}

/**
 * Export Configuration Manager Interface
 * Handles default options, configuration management, and option merging
 */
export interface IExportConfigurationManager {
  getDefaultOptions(): TKAImageExportOptions;
  mergeWithDefaults(
    options: Partial<TKAImageExportOptions>
  ): TKAImageExportOptions;
  createPreviewOptions(
    options: Partial<TKAImageExportOptions>
  ): TKAImageExportOptions;
}

/**
 * Export Memory Calculator Interface
 * Handles memory estimation calculations for image exports
 */
export interface MemoryEstimate {
  estimatedMB: number;
  width: number;
  height: number;
  pixelCount: number;
  colorDepth: number;
  compressionFactor: number;
}

export interface IExportMemoryCalculator {
  estimateMemoryUsage(
    sequence: SequenceData,
    options: TKAImageExportOptions
  ): MemoryEstimate;
  isWithinMemoryLimits(
    sequence: SequenceData,
    options: TKAImageExportOptions,
    limitMB?: number
  ): boolean;
}

/**
 * Export Options Validator Interface
 * Handles validation of export options and sequence data
 */
export interface ExportValidationResult {
  valid: boolean;
  errors: string[];
}

export interface IExportOptionsValidator {
  validateExport(
    sequence: SequenceData,
    options: TKAImageExportOptions
  ): ExportValidationResult;
  validateOptions(options: TKAImageExportOptions): ExportValidationResult;
  validateSequence(sequence: SequenceData): ExportValidationResult;
}

/**
 * Filename Generator Service Interface
 * Handles filename generation for image exports
 */
export interface IFilenameGeneratorService {
  generateDefaultFilename(
    sequence: SequenceData,
    options: Partial<TKAImageExportOptions>
  ): string;
  generateVersionedFilename(word: string, format: string): string;
  sanitizeFilename(filename: string): string;
}

/**
 * Image Preview Generator Interface
 * Handles preview-specific image generation
 */
export interface IImagePreviewGenerator {
  generatePreview(
    sequence: SequenceData,
    options?: Partial<TKAImageExportOptions>
  ): Promise<string>;
  generateThumbnail(sequence: SequenceData, maxSize?: number): Promise<string>;
}

// ============================================================================
// SERVICE INTERFACE SYMBOLS
// ============================================================================

export const IExportSettingsServiceInterface = Symbol.for(
  "IExportSettingsService"
);
export const IExportConfigurationManagerInterface = Symbol.for(
  "IExportConfigurationManager"
);
export const IExportMemoryCalculatorInterface = Symbol.for(
  "IExportMemoryCalculator"
);
export const IExportOptionsValidatorInterface = Symbol.for(
  "IExportOptionsValidator"
);
export const IFilenameGeneratorServiceInterface = Symbol.for(
  "IFilenameGeneratorService"
);
export const IImagePreviewGeneratorInterface = Symbol.for(
  "IImagePreviewGenerator"
);
