/**
 * TKA Image Export Utility Domain Types
 *
 * Domain models for utility functions in the TKA image export system.
 * Includes memory estimation, validation, and configuration types.
 */

// ============================================================================
// MEMORY AND PERFORMANCE TYPES
// ============================================================================

export interface MemoryEstimate {
  estimatedMB: number;
  width: number;
  height: number;
  pixelCount: number;
  colorDepth: number;
  compressionFactor: number;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ExportValidationResult {
  valid: boolean;
  errors: string[];
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
