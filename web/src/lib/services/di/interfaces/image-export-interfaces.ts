/**
 * Image Export Service Interface Definitions
 *
 * Proper ServiceInterface definitions for the TKA image export services,
 * following the established DI container patterns used by core services.
 */

import type {
  IBeatRenderingService,
  ICanvasManagementService,
  IDimensionCalculationService,
  IExportConfigurationManager,
  IExportMemoryCalculator,
  IExportOptionsValidator,
  IFileExportService,
  IFilenameGeneratorService,
  IGridOverlayService,
  IImageCompositionService,
  IImagePreviewGenerator,
  ILayoutCalculationService,
  ITKAImageExportService,
} from "../../interfaces/image-export-interfaces";

// Implementation imports
import { ExportConfigurationManager } from "../../implementations/image-export/ExportConfigurationManager";
import { ExportMemoryCalculator } from "../../implementations/image-export/ExportMemoryCalculator";
import { ExportOptionsValidator } from "../../implementations/image-export/ExportOptionsValidator";
import { FilenameGeneratorService } from "../../implementations/image-export/FilenameGeneratorService";
import { ImagePreviewGenerator } from "../../implementations/image-export/ImagePreviewGenerator";
import { TKAImageExportOrchestrator } from "../../implementations/image-export/TKAImageExportOrchestrator";

import type {
  IDifficultyBadgeRenderer,
  ITextRenderingUtils,
  IUserInfoRenderer,
  IWordTextRenderer,
} from "../../interfaces/text-rendering-interfaces";

import { createServiceInterface } from "../types";

// Import service implementations
import { BeatRenderingService } from "../../implementations/image-export/BeatRenderingService";
import { CanvasManagementService } from "../../implementations/image-export/CanvasManagementService";
import { DimensionCalculationService } from "../../implementations/image-export/DimensionCalculationService";
import { FileExportService } from "../../implementations/image-export/FileExportService";
import { GridOverlayService } from "../../implementations/image-export/GridOverlayService";
import { ImageCompositionService } from "../../implementations/image-export/ImageCompositionService";
import { LayoutCalculationService } from "../../implementations/image-export/LayoutCalculationService";
import { TKAImageExportService } from "../../implementations/image-export/TKAImageExportService";

// Import text rendering component implementations
import { DifficultyBadgeRenderer } from "../../implementations/image-export/text-rendering/internal/DifficultyBadgeRenderer";
import { TextRenderingUtils } from "../../implementations/image-export/text-rendering/internal/TextRenderingUtils";
import { UserInfoRenderer } from "../../implementations/image-export/text-rendering/internal/UserInfoRenderer";
import { WordTextRenderer } from "../../implementations/image-export/text-rendering/internal/WordTextRenderer";
import type { IBeatFallbackRenderingService } from "../../interfaces/beat-fallback-interfaces";
import type { IBeatGridService } from "../../interfaces/beat-grid-interfaces";
import type { IPictographService } from "../../interfaces/pictograph-interfaces";
import type { ISVGToCanvasConverterService } from "../../interfaces/svg-conversion-interfaces";

// Foundation services (no dependencies)
export const ILayoutCalculationServiceInterface =
  createServiceInterface<ILayoutCalculationService>(
    "ILayoutCalculationService",
    LayoutCalculationService
  );

export const IDimensionCalculationServiceInterface =
  createServiceInterface<IDimensionCalculationService>(
    "IDimensionCalculationService",
    DimensionCalculationService
  );

export const IFileExportServiceInterface =
  createServiceInterface<IFileExportService>(
    "IFileExportService",
    FileExportService
  );

export const ICanvasManagementServiceInterface =
  createServiceInterface<ICanvasManagementService>(
    "ICanvasManagementService",
    CanvasManagementService
  );

export const IGridOverlayServiceInterface =
  createServiceInterface<IGridOverlayService>(
    "IGridOverlayService",
    GridOverlayService
  );

export const IBeatRenderingServiceInterface =
  createServiceInterface<IBeatRenderingService>(
    "IBeatRenderingService",
    class extends BeatRenderingService {
      constructor(...args: unknown[]) {
        super(
          args[0] as IPictographService,
          args[1] as ISVGToCanvasConverterService,
          args[2] as IBeatGridService,
          args[3] as IBeatFallbackRenderingService,
          args[4] as ICanvasManagementService
        );
      }
    }
  );

// Text rendering component interfaces
export const IWordTextRendererInterface =
  createServiceInterface<IWordTextRenderer>(
    "IWordTextRenderer",
    WordTextRenderer
  );

export const IUserInfoRendererInterface =
  createServiceInterface<IUserInfoRenderer>(
    "IUserInfoRenderer",
    UserInfoRenderer
  );

export const IDifficultyBadgeRendererInterface =
  createServiceInterface<IDifficultyBadgeRenderer>(
    "IDifficultyBadgeRenderer",
    DifficultyBadgeRenderer
  );

export const ITextRenderingUtilsInterface =
  createServiceInterface<ITextRenderingUtils>(
    "ITextRenderingUtils",
    TextRenderingUtils
  );

// Composition service (depends on layout, dimension, beat rendering, and text rendering components)
export const IImageCompositionServiceInterface =
  createServiceInterface<IImageCompositionService>(
    "IImageCompositionService",
    class extends ImageCompositionService {
      constructor(...args: unknown[]) {
        super(
          args[0] as ILayoutCalculationService,
          args[1] as IDimensionCalculationService,
          args[2] as IBeatRenderingService,
          args[3] as IWordTextRenderer,
          args[4] as IUserInfoRenderer,
          args[5] as IDifficultyBadgeRenderer,
          args[6] as ITextRenderingUtils
        );
      }
    }
  );

// Main TKA image export service (depends on composition and file services)
export const ITKAImageExportServiceInterface =
  createServiceInterface<ITKAImageExportService>(
    "ITKAImageExportService",
    class extends TKAImageExportService {
      constructor(...args: unknown[]) {
        super(
          args[0] as IImageCompositionService,
          args[1] as IFileExportService,
          args[2] as ILayoutCalculationService,
          args[3] as IDimensionCalculationService
        );
      }
    }
  );

// New refactored service interfaces for DI registration
export const IExportConfigurationManagerInterface =
  createServiceInterface<IExportConfigurationManager>(
    "IExportConfigurationManager",
    ExportConfigurationManager
  );

export const IExportMemoryCalculatorInterface =
  createServiceInterface<IExportMemoryCalculator>(
    "IExportMemoryCalculator",
    ExportMemoryCalculator
  );

export const IExportOptionsValidatorInterface =
  createServiceInterface<IExportOptionsValidator>(
    "IExportOptionsValidator",
    class extends ExportOptionsValidator {
      constructor(...args: unknown[]) {
        super(args[0] as IExportMemoryCalculator);
      }
    }
  );

export const IFilenameGeneratorServiceInterface =
  createServiceInterface<IFilenameGeneratorService>(
    "IFilenameGeneratorService",
    FilenameGeneratorService
  );

export const IImagePreviewGeneratorInterface =
  createServiceInterface<IImagePreviewGenerator>(
    "IImagePreviewGenerator",
    class extends ImagePreviewGenerator {
      constructor(...args: unknown[]) {
        super(
          args[0] as IImageCompositionService,
          args[1] as IFileExportService,
          args[2] as IExportConfigurationManager
        );
      }
    }
  );

// Updated main TKA orchestrator interface
export const ITKAImageExportOrchestratorInterface =
  createServiceInterface<ITKAImageExportService>(
    "ITKAImageExportOrchestrator",
    class extends TKAImageExportOrchestrator {
      constructor(...args: unknown[]) {
        super(
          args[0] as IImageCompositionService,
          args[1] as IFileExportService,
          args[2] as ILayoutCalculationService,
          args[3] as IDimensionCalculationService,
          args[4] as IExportConfigurationManager,
          args[5] as IExportOptionsValidator,
          args[6] as IImagePreviewGenerator,
          args[7] as IFilenameGeneratorService
        );
      }
    }
  );

export interface IImageExportServices {
  gridOverlayService: IGridOverlayService;
  imageCompositionService: IImageCompositionService;
  layoutCalculationService: ILayoutCalculationService;
  tkaImageExportService: ITKAImageExportService;
}
