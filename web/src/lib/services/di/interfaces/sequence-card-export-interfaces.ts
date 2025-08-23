/**
 * Sequence Card Export Service Interface Definitions
 *
 * Proper ServiceInterface definitions for the sequence card export system,
 * following the established DI container patterns used by core services.
 */

import type {
  ISequenceCardBatchProcessingService,
  ISequenceCardCacheService,
  ISequenceCardExportOrchestrator,
  ISequenceCardExportProgressTracker,
  ISequenceCardImageConversionService,
  ISequenceCardImageGenerationService,
  ISequenceCardMetadataOverlayService,
  ISequenceCardSVGCompositionService,
} from "../../interfaces/sequence-card-export-interfaces";

// Import service implementations
import { SequenceCardBatchProcessingService } from "../../implementations/export/sequence-card/SequenceCardBatchProcessingService";
import { SequenceCardCacheService } from "../../implementations/export/sequence-card/SequenceCardCacheService";
import { SequenceCardExportOrchestrator } from "../../implementations/export/sequence-card/SequenceCardExportOrchestrator";
import { SequenceCardExportProgressTracker } from "../../implementations/export/sequence-card/SequenceCardExportProgressTracker";
import { SequenceCardImageConversionService } from "../../implementations/export/sequence-card/SequenceCardImageConversionService";
import { SequenceCardImageGenerationService } from "../../implementations/export/sequence-card/SequenceCardImageGenerationService";
import { SequenceCardMetadataOverlayService } from "../../implementations/export/sequence-card/SequenceCardMetadataOverlayService";
import { SequenceCardSVGCompositionService } from "../../implementations/export/sequence-card/SequenceCardSVGCompositionService";

import type { IPictographRenderingService } from "../../interfaces/pictograph-interfaces";
import { createServiceInterface } from "../types";

// Foundation services (minimal dependencies)
export const ISequenceCardImageConversionServiceInterface =
  createServiceInterface<ISequenceCardImageConversionService>(
    "ISequenceCardImageConversionService",
    SequenceCardImageConversionService
  );

export const ISequenceCardExportProgressTrackerInterface =
  createServiceInterface<ISequenceCardExportProgressTracker>(
    "ISequenceCardExportProgressTracker",
    SequenceCardExportProgressTracker
  );

export const ISequenceCardCacheServiceInterface =
  createServiceInterface<ISequenceCardCacheService>(
    "ISequenceCardCacheService",
    SequenceCardCacheService
  );

export const ISequenceCardBatchProcessingServiceInterface =
  createServiceInterface<ISequenceCardBatchProcessingService>(
    "ISequenceCardBatchProcessingService",
    SequenceCardBatchProcessingService
  );

// Composition services (depend on pictograph rendering)
export const ISequenceCardSVGCompositionServiceInterface =
  createServiceInterface<ISequenceCardSVGCompositionService>(
    "ISequenceCardSVGCompositionService",
    SequenceCardSVGCompositionService
  );

export const ISequenceCardMetadataOverlayServiceInterface =
  createServiceInterface<ISequenceCardMetadataOverlayService>(
    "ISequenceCardMetadataOverlayService",
    SequenceCardMetadataOverlayService
  );

// Core generation service (depends on rendering and composition services)
export const ISequenceCardImageGenerationServiceInterface =
  createServiceInterface<ISequenceCardImageGenerationService>(
    "ISequenceCardImageGenerationService",
    class extends SequenceCardImageGenerationService {
      constructor(...args: unknown[]) {
        const [pictographService, svgCompositionService, metadataService] =
          args;
        super(
          pictographService as IPictographRenderingService,
          svgCompositionService as ISequenceCardSVGCompositionService,
          metadataService as ISequenceCardMetadataOverlayService
        );
      }
    }
  );

// Main orchestrator (depends on all services)
export const ISequenceCardExportOrchestratorInterface =
  createServiceInterface<ISequenceCardExportOrchestrator>(
    "ISequenceCardExportOrchestrator",
    class extends SequenceCardExportOrchestrator {
      constructor(...args: unknown[]) {
        const [
          imageGenService,
          conversionService,
          batchService,
          progressTracker,
          cacheService,
        ] = args;
        super(
          imageGenService as ISequenceCardImageGenerationService,
          conversionService as ISequenceCardImageConversionService,
          batchService as ISequenceCardBatchProcessingService,
          progressTracker as ISequenceCardExportProgressTracker,
          cacheService as ISequenceCardCacheService
        );
      }
    }
  );
