import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { PrintablePageLayoutService } from "../../../features/word-card/services/implementations/PrintablePageLayoutService";
import { WordCardBatchProcessingService } from "../../../features/word-card/services/implementations/WordCardBatchProcessingService";
import { WordCardCacheService } from "../../../features/word-card/services/implementations/WordCardCacheService";
import { WordCardExportOrchestrator } from "../../../features/word-card/services/implementations/WordCardExportOrchestrator";
import { WordCardExportProgressTracker } from "../../../features/word-card/services/implementations/WordCardExportProgressTracker";
import { WordCardImageConversionService } from "../../../features/word-card/services/implementations/WordCardImageConversionService";
import { WordCardImageGenerationService } from "../../../features/word-card/services/implementations/WordCardImageGenerationService";
import { WordCardMetadataOverlayService } from "../../../features/word-card/services/implementations/WordCardMetadataOverlayService";
import { WordCardSVGCompositionService } from "../../../features/word-card/services/implementations/WordCardSVGCompositionService";
import { TYPES } from "../types";

export const wordCardModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === WORD CARD SERVICES ===
    options
      .bind(TYPES.IPrintablePageLayoutService)
      .to(PrintablePageLayoutService);
    options
      .bind(TYPES.IWordCardImageGenerationService)
      .to(WordCardImageGenerationService);
    options
      .bind(TYPES.IWordCardImageConversionService)
      .to(WordCardImageConversionService);
    options
      .bind(TYPES.IWordCardBatchProcessingService)
      .to(WordCardBatchProcessingService);
    options
      .bind(TYPES.IWordCardExportProgressTracker)
      .to(WordCardExportProgressTracker);
    options.bind(TYPES.IWordCardCacheService).to(WordCardCacheService);
    options
      .bind(TYPES.IWordCardExportOrchestrator)
      .to(WordCardExportOrchestrator);
    options
      .bind(TYPES.IWordCardSVGCompositionService)
      .to(WordCardSVGCompositionService);
    options
      .bind(TYPES.IWordCardMetadataOverlayService)
      .to(WordCardMetadataOverlayService);
  }
);
