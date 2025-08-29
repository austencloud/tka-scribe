/**
 * TKA Image Export Utility Interfaces
 *
 * Service contracts for configuration management, memory calculation,
 * validation, and utility functions in the TKA image export system.
 */
// ============================================================================
// UTILITY AND HELPER SERVICES
// ============================================================================

/**
 * Export settings management service
 */

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface MemoryEstimate {
  estimatedMB: number;
  width: number;
  height: number;
  pixelCount: number;
  colorDepth: number;
  compressionFactor: number;
}

export interface ExportValidationResult {
  valid: boolean;
  errors: string[];
}

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
