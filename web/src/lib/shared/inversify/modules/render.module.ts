import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import {
    BeatRenderingService,
    CanvasManagementService,
    DifficultyBadgeRenderer,
    DimensionCalculationService,
    FilenameGeneratorService,
    ImageCompositionService,
    ImageFormatConverterService,
    LayoutCalculationService,
    SequenceRenderService,
    SVGToCanvasConverterService,
    UserInfoRenderer,
    WordTextRenderer,
} from "../../render/services/implementations";
import { TYPES } from "../types";

export const renderModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    // === MAIN RENDER SERVICE ===
    options.bind(TYPES.ISequenceRenderService).to(SequenceRenderService);

    // === PURE RENDERING SERVICES ===
    options.bind(TYPES.IBeatRenderingService).to(BeatRenderingService);
    options.bind(TYPES.ICanvasManagementService).to(CanvasManagementService);
    options.bind(TYPES.IImageCompositionService).to(ImageCompositionService);
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

    // === TEXT RENDERING SERVICES ===
    options.bind(TYPES.IWordTextRenderer).to(WordTextRenderer);
    options.bind(TYPES.IUserInfoRenderer).to(UserInfoRenderer);
    options.bind(TYPES.IDifficultyBadgeRenderer).to(DifficultyBadgeRenderer);

    // === UTILITY SERVICES ===
    options.bind(TYPES.IFilenameGeneratorService).to(FilenameGeneratorService);
  }
);
