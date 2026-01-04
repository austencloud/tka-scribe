import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { CanvasManager } from "../../render/services/implementations/CanvasManager";
import { DimensionCalculator } from "../../render/services/implementations/DimensionCalculator";
import { FilenameGenerator } from "../../render/services/implementations/FilenameGenerator";
import { GlyphCache } from "../../render/services/implementations/GlyphCache";
import { ImageComposer } from "../../render/services/implementations/ImageComposer";
import { ImageFormatConverter } from "../../render/services/implementations/ImageFormatConverter";
import { LayoutCalculator } from "../../render/services/implementations/LayoutCalculator";
import { SequenceRenderer } from "../../render/services/implementations/SequenceRenderer";
import { SVGToCanvasConverter } from "../../render/services/implementations/SVGToCanvasConverter";
import { TextRenderer } from "../../render/services/implementations/TextRenderer";
import { TYPES } from "../types";

export const renderModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === MAIN RENDER SERVICE ===
    options.bind(TYPES.ISequenceRenderer).to(SequenceRenderer);

    // === PURE RENDERING SERVICES ===
    options.bind(TYPES.ICanvasManager).to(CanvasManager);
    options.bind(TYPES.IImageComposer).to(ImageComposer).inSingletonScope(); // PERF: Cache persists across all renders
    options.bind(TYPES.ILayoutCalculator).to(LayoutCalculator);
    options.bind(TYPES.IDimensionCalculator).to(DimensionCalculator);
    options.bind(TYPES.IImageFormatConverter).to(ImageFormatConverter);
    options.bind(TYPES.ISVGToCanvasConverter).to(SVGToCanvasConverter);
    options.bind(TYPES.ITextRenderer).to(TextRenderer);
    options.bind(TYPES.IGlyphCache).to(GlyphCache).inSingletonScope();

    // === UTILITY SERVICES ===
    options.bind(TYPES.IFilenameGenerator).to(FilenameGenerator);
  }
);
