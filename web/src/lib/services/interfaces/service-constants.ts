/**
 * Service Interface Constants
 *
 * Constants for service interface definitions used by the DI container.
 * These constants help avoid circular dependencies in the bootstrap process.
 */

import { defineService } from "./core-types";
import type {
  ISequenceCardImageService,
  ISequenceCardLayoutService,
  ISequenceCardPageService,
  ISequenceCardBatchService,
  ISequenceCardCacheService,
  IEnhancedExportService,
} from "./export-interfaces";

// ============================================================================
// SEQUENCE CARD SERVICE INTERFACE CONSTANTS
// ============================================================================

export const ISequenceCardImageServiceInterface =
  defineService<ISequenceCardImageService>("ISequenceCardImageService");

export const ISequenceCardLayoutServiceInterface =
  defineService<ISequenceCardLayoutService>("ISequenceCardLayoutService");

export const ISequenceCardPageServiceInterface =
  defineService<ISequenceCardPageService>("ISequenceCardPageService");

export const ISequenceCardBatchServiceInterface =
  defineService<ISequenceCardBatchService>("ISequenceCardBatchService");

export const ISequenceCardCacheServiceInterface =
  defineService<ISequenceCardCacheService>("ISequenceCardCacheService");

export const IEnhancedExportServiceInterface =
  defineService<IEnhancedExportService>("IEnhancedExportService");
