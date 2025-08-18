/**
 * Image Export Services Registration
 *
 * Registers all TKA image export services with the DI container.
 * This module sets up the complete image export pipeline with proper
 * dependency injection following the established patterns.
 */

import type { ServiceContainer } from "../ServiceContainer";
import type { ServiceInterface } from "../types";

// Import service interfaces (proper ServiceInterface objects)
import {
  ITKAImageExportServiceInterface,
  ILayoutCalculationServiceInterface,
  IDimensionCalculationServiceInterface,
  IFileExportServiceInterface,
  IBeatRenderingServiceInterface,
  ITextRenderingServiceInterface,
  IImageCompositionServiceInterface,
  IGridOverlayServiceInterface,
  ICanvasManagementServiceInterface,
} from "../interfaces/image-export-interfaces";

import { IPictographServiceInterface } from "../interfaces/core-interfaces";

// Import service implementations
import { TKAImageExportService } from "../../implementations/image-export/TKAImageExportService";
import { LayoutCalculationService } from "../../implementations/image-export/LayoutCalculationService";
import { DimensionCalculationService } from "../../implementations/image-export/DimensionCalculationService";
import { FileExportService } from "../../implementations/image-export/FileExportService";
import { BeatRenderingService } from "../../implementations/image-export/BeatRenderingService";
import { TextRenderingService } from "../../implementations/image-export/TextRenderingService";
import { ImageCompositionService } from "../../implementations/image-export/ImageCompositionService";
import { GridOverlayService } from "../../implementations/image-export/GridOverlayService";
import { CanvasManagementService } from "../../implementations/image-export/CanvasManagementService";

/**
 * Register all TKA image export services with the DI container
 * Services are registered in dependency order to ensure proper resolution
 */
export async function registerImageExportServices(
  container: ServiceContainer
): Promise<void> {
  try {
    // Register foundation services (no dependencies)
    container.registerFactory(ILayoutCalculationServiceInterface, () => {
      return new LayoutCalculationService();
    });

    container.registerFactory(IDimensionCalculationServiceInterface, () => {
      return new DimensionCalculationService();
    });

    container.registerFactory(IFileExportServiceInterface, () => {
      return new FileExportService();
    });

    container.registerFactory(ICanvasManagementServiceInterface, () => {
      return new CanvasManagementService();
    });

    container.registerFactory(IGridOverlayServiceInterface, () => {
      return new GridOverlayService();
    });

    container.registerFactory(IBeatRenderingServiceInterface, () => {
      const pictographService = container.resolve(IPictographServiceInterface);
      return new BeatRenderingService(pictographService);
    });

    container.registerFactory(ITextRenderingServiceInterface, () => {
      return new TextRenderingService();
    });

    // Register composition service (depends on layout, dimension, beat rendering, and text rendering)
    container.registerFactory(IImageCompositionServiceInterface, () => {
      const layoutService = container.resolve(
        ILayoutCalculationServiceInterface
      );
      const dimensionService = container.resolve(
        IDimensionCalculationServiceInterface
      );
      const beatRenderer = container.resolve(IBeatRenderingServiceInterface);
      const textRenderer = container.resolve(ITextRenderingServiceInterface);

      return new ImageCompositionService(
        layoutService,
        dimensionService,
        beatRenderer,
        textRenderer
      );
    });

    // Register main TKA image export service (depends on composition and file services)
    container.registerFactory(ITKAImageExportServiceInterface, () => {
      const compositionService = container.resolve(
        IImageCompositionServiceInterface
      );
      const fileService = container.resolve(IFileExportServiceInterface);
      const layoutService = container.resolve(
        ILayoutCalculationServiceInterface
      );
      const dimensionService = container.resolve(
        IDimensionCalculationServiceInterface
      );

      return new TKAImageExportService(
        compositionService,
        fileService,
        layoutService,
        dimensionService
      );
    });

    // Validate registrations
    await validateImageExportServices(container);
  } catch (error) {
    console.error("❌ Failed to register TKA image export services:", error);
    throw new Error(
      `Image export service registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate that all image export services can be resolved
 */
async function validateImageExportServices(
  container: ServiceContainer
): Promise<void> {
  const servicesToValidate = [
    {
      interface: ILayoutCalculationServiceInterface,
      name: "LayoutCalculationService",
    },
    {
      interface: IDimensionCalculationServiceInterface,
      name: "DimensionCalculationService",
    },
    { interface: IFileExportServiceInterface, name: "FileExportService" },
    { interface: IBeatRenderingServiceInterface, name: "BeatRenderingService" },
    { interface: ITextRenderingServiceInterface, name: "TextRenderingService" },
    {
      interface: IImageCompositionServiceInterface,
      name: "ImageCompositionService",
    },
    { interface: IGridOverlayServiceInterface, name: "GridOverlayService" },
    {
      interface: ICanvasManagementServiceInterface,
      name: "CanvasManagementService",
    },
    {
      interface: ITKAImageExportServiceInterface,
      name: "TKAImageExportService",
    },
  ];

  const validationErrors: string[] = [];

  for (const { interface: serviceInterface, name } of servicesToValidate) {
    try {
      const service = container.resolve(
        serviceInterface as ServiceInterface<unknown>
      );
      if (!service) {
        validationErrors.push(`${name} resolved to null/undefined`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      validationErrors.push(`${name} resolution failed: ${errorMessage}`);
    }
  }

  if (validationErrors.length > 0) {
    console.error("❌ Service validation failed:");
    validationErrors.forEach((error) => console.error(`  - ${error}`));
    throw new Error(
      `Service validation failed: ${validationErrors.join(", ")}`
    );
  }
}

/**
 * Test image export service pipeline
 * Quick smoke test to ensure the services work together
 */
export async function testImageExportPipeline(
  container: ServiceContainer
): Promise<boolean> {
  try {
    // Test layout calculation
    const layoutService = container.resolve(ILayoutCalculationServiceInterface);
    const layout = layoutService.calculateLayout(4, true);
    if (!layout || layout.length !== 2) {
      throw new Error("Layout calculation test failed");
    }

    // Test dimension calculation
    const dimensionService = container.resolve(
      IDimensionCalculationServiceInterface
    );
    const testOptions = {
      addWord: true,
      addUserInfo: true,
      includeStartPosition: true,
      addBeatNumbers: true,
      addReversalSymbols: true,
      combinedGrids: false,
      addDifficultyLevel: true,
      beatScale: 1,
      beatSize: 144,
      margin: 50,
      redVisible: true,
      blueVisible: true,
      userName: "Test",
      exportDate: "1-1-2024",
      notes: "Test",
      format: "PNG" as const,
      quality: 1.0,
    };
    const dimensions = dimensionService.determineAdditionalHeights(
      testOptions,
      4,
      1
    );
    if (!dimensions || dimensions.length !== 2) {
      throw new Error("Dimension calculation test failed");
    }

    // Test file export service
    const fileService = container.resolve(IFileExportServiceInterface);
    const formats = fileService.getSupportedFormats();
    if (!formats.includes("PNG") || !formats.includes("JPEG")) {
      throw new Error("File export service test failed");
    }

    // Test text rendering service
    const textService = container.resolve(ITextRenderingServiceInterface);
    if (!textService) {
      throw new Error("Text rendering service test failed");
    }

    // Test main export service
    const exportService = container.resolve(ITKAImageExportServiceInterface);
    if (!exportService) {
      throw new Error("Main export service test failed");
    }

    return true;
  } catch (error) {
    console.error("❌ Image export pipeline test failed:", error);
    return false;
  }
}

/**
 * Get image export service metrics
 * TODO: Fix service interface compatibility issues
 */
export function getImageExportServiceMetrics(_container: ServiceContainer): {
  servicesRegistered: number;
  memoryUsage?: number;
  cacheStats?: unknown;
} {
  // Temporarily disabled due to service interface compatibility issues
  console.warn(
    "getImageExportServiceMetrics temporarily disabled - service interface compatibility issues"
  );
  return {
    servicesRegistered: 9, // Static count for now
    memoryUsage: undefined,
    cacheStats: undefined,
  };
}

/**
 * Cleanup image export services
 * Should be called when shutting down the application
 */
export function cleanupImageExportServices(_container: ServiceContainer): void {
  try {
    // Note: Service cleanup would be implemented here if needed
  } catch (error) {
    console.warn("⚠️ Some cleanup operations failed:", error);
  }
}
