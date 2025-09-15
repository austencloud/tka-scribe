import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { CodexService } from "../../../modules/learn/codex/services/implementations";
import { CodexLetterMappingRepo } from "../../../modules/learn/codex/services/implementations/CodexLetterMappingRepo";
import { CodexPictographUpdater } from "../../../modules/learn/codex/services/implementations/CodexPictographUpdater";
import { QuizRepoManager } from "../../../modules/learn/quiz/services/implementations/QuizRepoManager";
import { QuizSessionService } from "../../../modules/learn/quiz/services/implementations/QuizSessionService";
import { FlipBookService } from "../../../modules/learn/read/services/implementations/FlipBookService";
import { PDFService } from "../../../modules/learn/read/services/implementations/PDFService";
import { TYPES } from "../types";

export const learnModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    // === CODEX SERVICES ===
    options.bind(TYPES.ICodexLetterMappingRepo).to(CodexLetterMappingRepo);
    options.bind(TYPES.ICodexPictographUpdater).to(CodexPictographUpdater);
    options.bind(TYPES.ICodexService).to(CodexService);

    // === QUIZ SERVICES ===
    options.bind(TYPES.IQuizRepoManager).to(QuizRepoManager);
    options.bind(TYPES.IQuizSessionService).to(QuizSessionService);

    // === READ SERVICES ===
    options.bind(TYPES.IPDFService).to(PDFService);
    options.bind(TYPES.IFlipBookService).to(FlipBookService);
  }
);
