import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import {
  CodexService,
  CodexLetterMappingRepo,
  CodexPictographUpdater,
} from "../../../features/learn/codex/services/implementations";
import {
  QuizRepoManager,
  QuizSessionService,
} from "../../../features/learn/quiz/services/implementations";
import { QuizResultsAnalyzer } from "../../../features/learn/quiz/QuizResultsAnalyzer";
import { TYPES } from "../types";

export const learnModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === CODEX SERVICES ===
    // CodexLetterMappingRepo is Codex-specific (Learn module)
    // LetterQueryHandler (Tier 2) makes it optional so Generate doesn't need Learn module
    options.bind(TYPES.ICodexLetterMappingRepo).to(CodexLetterMappingRepo);
    options.bind(TYPES.ICodexPictographUpdater).to(CodexPictographUpdater);
    options.bind(TYPES.ICodexService).to(CodexService);

    // === QUIZ SERVICES ===
    options.bind(TYPES.IQuizRepoManager).to(QuizRepoManager);
    options.bind(TYPES.IQuizSessionService).to(QuizSessionService);
    options.bind(TYPES.IQuizResultsAnalyzer).to(QuizResultsAnalyzer);
  }
);
