import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { PrintablePageLayoutManager } from "../../../features/word-card/services/implementations/PrintablePageLayoutManager";
import { WordCardBatchProcessor } from "../../../features/word-card/services/implementations/WordCardBatchProcessor";
import { WordCardCache } from "../../../features/word-card/services/implementations/WordCardCache";
import { WordCardExportOrchestrator } from "../../../features/word-card/services/implementations/WordCardExportOrchestrator";
import { WordCardExportProgressTracker } from "../../../features/word-card/services/implementations/WordCardExportProgressTracker";
import { WordCardImageConverter } from "../../../features/word-card/services/implementations/WordCardImageConverter";
import { WordCardImageGenerator } from "../../../features/word-card/services/implementations/WordCardImageGenerator";
import { WordCardMetadataOverlay } from "../../../features/word-card/services/implementations/WordCardMetadataOverlay";
import { WordCardSVGComposer } from "../../../features/word-card/services/implementations/WordCardSVGComposer";
import { TYPES } from "../types";

export const wordCardModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === WORD CARD SERVICES ===
    options
      .bind(TYPES.IPrintablePageLayoutService)
      .to(PrintablePageLayoutManager);
    options
      .bind(TYPES.IWordCardImageGenerator)
      .to(WordCardImageGenerator);
    options
      .bind(TYPES.IWordCardImageConverter)
      .to(WordCardImageConverter);
    options
      .bind(TYPES.IWordCardBatchProcessor)
      .to(WordCardBatchProcessor);
    options
      .bind(TYPES.IWordCardExportProgressTracker)
      .to(WordCardExportProgressTracker);
    options.bind(TYPES.IWordCardCache).to(WordCardCache);
    options
      .bind(TYPES.IWordCardExportOrchestrator)
      .to(WordCardExportOrchestrator);
    options
      .bind(TYPES.IWordCardSVGComposer)
      .to(WordCardSVGComposer);
    options
      .bind(TYPES.IWordCardMetadataOverlay)
      .to(WordCardMetadataOverlay);
  }
);
