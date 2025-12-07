import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { CanvasManagementService } from "../../render/services/implementations/CanvasManagementService";
import { DimensionCalculationService } from "../../render/services/implementations/DimensionCalculationService";
import { FilenameGeneratorService } from "../../render/services/implementations/FilenameGeneratorService";
import { GlyphCacheService } from "../../render/services/implementations/GlyphCacheService";
import { ImageCompositionService } from "../../render/services/implementations/ImageCompositionService";
import { ImageFormatConverterService } from "../../render/services/implementations/ImageFormatConverterService";
import { LayoutCalculationService } from "../../render/services/implementations/LayoutCalculationService";
import { SequenceRenderService } from "../../render/services/implementations/SequenceRenderService";
import { SVGToCanvasConverterService } from "../../render/services/implementations/SVGToCanvasConverterService";
import { TextRenderingService } from "../../render/services/implementations/TextRenderingService";
import { TYPES } from "../types";

export const renderModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === MAIN RENDER SERVICE ===
    options.bind(TYPES.ISequenceRenderService).to(SequenceRenderService);

    // === PURE RENDERING SERVICES ===
    options.bind(TYPES.ICanvasManagementService).to(CanvasManagementService);
    options
      .bind(TYPES.IImageCompositionService)
      .to(ImageCompositionService)
      .inSingletonScope(); // PERF: Cache persists across all renders
    options.bind(TYPES.ILayoutCalculationService).to(LayoutCalculationService);
    options
      .bind(TYPES.IDimensionCalculationService)
      .to(DimensionCalculationService);
    options
      .bind(TYPES.IImageFormatConverterService)
      .to(ImageFormatConverterService);
    options
      .bind(TYPES.ISVGToCanvasConverterService)
      .to(SVGToCanvasConverterService);
    options.bind(TYPES.ITextRenderingService).to(TextRenderingService);
    options
      .bind(TYPES.IGlyphCacheService)
      .to(GlyphCacheService)
      .inSingletonScope();

    // === UTILITY SERVICES ===
    options.bind(TYPES.IFilenameGeneratorService).to(FilenameGeneratorService);
  }
);
