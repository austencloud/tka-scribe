/**
 * Export Configuration Service
 *
 * Manages export configuration settings and validation.
 */

import { injectable } from "inversify";
import type { SequenceExportOptions } from "../../domain/models";

export interface IExportConfigManager {
  getDefaultConfig(): SequenceExportOptions;
  validateConfig(config: Partial<SequenceExportOptions>): boolean;
  mergeConfig(base: SequenceExportOptions, overrides: Partial<SequenceExportOptions>): SequenceExportOptions;
  getConfigForFormat(format: "PNG" | "JPEG" | "WebP"): Partial<SequenceExportOptions>;
}

@injectable()
export class ExportConfig implements IExportConfigManager {
  getDefaultConfig(): SequenceExportOptions {
    return {
      // Core export settings (match desktop defaults)
      includeStartPosition: true,
      addBeatNumbers: true,
      addReversalSymbols: true,
      addUserInfo: true,
      addWord: true,
      combinedGrids: false,
      addDifficultyLevel: false,

      // Scaling and sizing
      beatScale: 1.0,
      beatSize: 144, // Match desktop base beat size
      margin: 50, // Match desktop base margin

      // Visibility settings
      redVisible: true,
      blueVisible: true,

      // User information
      userName: 'TKA User',
      exportDate: new Date()
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
        .replace(/\//g, '-'),
      notes: 'Created using The Kinetic Alphabet',

      // Output format
      format: "PNG",
      quality: 0.95,
      scale: 1.0,
      backgroundColor: 'white',
    };
  }

  validateConfig(config: Partial<SequenceExportOptions>): boolean {
    if (!config) return false;

    // Validate format if provided
    if (config.format && !["PNG", "JPEG", "WebP"].includes(config.format)) {
      return false;
    }

    // Validate quality if provided
    if (config.quality !== undefined && (config.quality < 0 || config.quality > 1)) {
      return false;
    }

    // Validate scale if provided
    if (config.scale !== undefined && config.scale <= 0) {
      return false;
    }

    // Validate beat scale if provided
    if (config.beatScale !== undefined && config.beatScale <= 0) {
      return false;
    }

    return true;
  }

  mergeConfig(base: SequenceExportOptions, overrides: Partial<SequenceExportOptions>): SequenceExportOptions {
    return { ...base, ...overrides };
  }

  getConfigForFormat(format: "PNG" | "JPEG" | "WebP"): Partial<SequenceExportOptions> {
    const baseConfig: Partial<SequenceExportOptions> = { format };

    switch (format) {
      case "PNG":
        return { ...baseConfig, quality: 1.0 };
      case "JPEG":
        return { ...baseConfig, quality: 0.9, backgroundColor: 'white' };
      case "WebP":
        return { ...baseConfig, quality: 0.95 };
      default:
        return baseConfig;
    }
  }
}
