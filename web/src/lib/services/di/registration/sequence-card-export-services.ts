/**
 * Sequence Card Export Services Registration
 * Registers all services related to sequence card image export functionality
 */

import type { ServiceContainer } from "../ServiceContainer";
import type { ServiceInterface } from "../types";

// Import all service interfaces
import {
  ISequenceCardBatchProcessingServiceInterface,
  ISequenceCardCacheServiceInterface,
  ISequenceCardExportOrchestratorInterface,
  ISequenceCardExportProgressTrackerInterface,
  ISequenceCardImageConversionServiceInterface,
  ISequenceCardImageGenerationServiceInterface,
  ISequenceCardMetadataOverlayServiceInterface,
  ISequenceCardSVGCompositionServiceInterface,
} from "../interfaces/sequence-card-export-interfaces";

/**
 * Registers all sequence card export services with the DI container
 *
 * Registration Order is important for dependency resolution:
 * 1. Base services with no dependencies (Cache, ProgressTracker, ImageConversion)
 * 2. Services that depend on base services (SVGComposition, MetadataOverlay, BatchProcessing)
 * 3. Image generation service that orchestrates multiple services
 * 4. Main orchestrator that coordinates the entire pipeline
 */
export function registerSequenceCardExportServices(
  container: ServiceContainer
): void {
  console.log("🎨 Registering Sequence Card Export Services...");

  // === LEVEL 1: BASE SERVICES (No dependencies) ===

  // Cache service - No dependencies
  container.registerSingletonClass(ISequenceCardCacheServiceInterface);
  console.log("✅ SequenceCardCacheService registered");

  // Progress tracker - No dependencies
  container.registerSingletonClass(ISequenceCardExportProgressTrackerInterface);
  console.log("✅ SequenceCardExportProgressTracker registered");

  // Image conversion service - No dependencies
  container.registerSingletonClass(
    ISequenceCardImageConversionServiceInterface
  );
  console.log("✅ SequenceCardImageConversionService registered");

  // === LEVEL 2: SERVICES WITH DEPENDENCIES ===

  // SVG composition service - Depends on pictograph rendering
  container.registerSingletonClass(ISequenceCardSVGCompositionServiceInterface);
  console.log("✅ SequenceCardSVGCompositionService registered");

  // Metadata overlay service - No external dependencies
  container.registerSingletonClass(
    ISequenceCardMetadataOverlayServiceInterface
  );
  console.log("✅ SequenceCardMetadataOverlayService registered");

  // Batch processing service - Depends on progress tracker
  container.registerSingletonClass(
    ISequenceCardBatchProcessingServiceInterface
  );
  console.log("✅ SequenceCardBatchProcessingService registered");

  // === LEVEL 3: IMAGE GENERATION SERVICE (Multiple dependencies) ===

  // Image generation service - Orchestrates SVG composition, metadata, and conversion
  container.registerSingletonClass(
    ISequenceCardImageGenerationServiceInterface
  );
  console.log("✅ SequenceCardImageGenerationService registered");

  // === LEVEL 4: MAIN ORCHESTRATOR (Top-level coordinator) ===

  // Export orchestrator - Coordinates all services
  container.registerSingletonClass(ISequenceCardExportOrchestratorInterface);
  console.log("✅ SequenceCardExportOrchestrator registered");

  console.log("🎉 All Sequence Card Export Services registered successfully!");
}

/**
 * Service tokens for string-based resolution
 * Returns array of service token entries for adding to the main service registry
 */
export function getSequenceCardExportServiceTokens(): Array<
  [string, ServiceInterface<unknown>]
> {
  return [
    [
      "ISequenceCardExportOrchestrator",
      ISequenceCardExportOrchestratorInterface,
    ],
    [
      "ISequenceCardImageGenerationService",
      ISequenceCardImageGenerationServiceInterface,
    ],
    [
      "ISequenceCardSVGCompositionService",
      ISequenceCardSVGCompositionServiceInterface,
    ],
    [
      "ISequenceCardMetadataOverlayService",
      ISequenceCardMetadataOverlayServiceInterface,
    ],
    [
      "ISequenceCardBatchProcessingService",
      ISequenceCardBatchProcessingServiceInterface,
    ],
    [
      "ISequenceCardImageConversionService",
      ISequenceCardImageConversionServiceInterface,
    ],
    [
      "ISequenceCardExportProgressTracker",
      ISequenceCardExportProgressTrackerInterface,
    ],
    ["ISequenceCardCacheService", ISequenceCardCacheServiceInterface],
  ];
}
