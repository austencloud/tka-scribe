import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { Codex } from "../../../features/learn/codex/services/implementations/Codex";
import { CodexLetterMappingRepo } from "../../../features/learn/codex/services/implementations/CodexLetterMappingRepo";
import { CodexPictographUpdater } from "../../../features/learn/codex/services/implementations/CodexPictographUpdater";
import { QuizRepoManager } from "../../../features/learn/quiz/services/implementations/QuizRepoManager";
import { QuizSessionManager } from "../../../features/learn/quiz/services/implementations/QuizSessionManager";
import { QuizResultsAnalyzer } from "../../../features/learn/quiz/QuizResultsAnalyzer";
import { ConceptProgressTracker } from "../../../features/learn/services/implementations/ConceptProgressTracker";
import { TYPES } from "../types";

export const learnModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === CODEX SERVICES ===
    // CodexLetterMappingRepo is Codex-specific (Learn module)
    // LetterQueryHandler (Tier 2) makes it optional so Generate doesn't need Learn module
    options.bind(TYPES.ICodexLetterMappingRepo).to(CodexLetterMappingRepo);
    options.bind(TYPES.ICodexPictographUpdater).to(CodexPictographUpdater);
    options.bind(TYPES.ICodex).to(Codex);

    // === QUIZ SERVICES ===
    options.bind(TYPES.IQuizRepoManager).to(QuizRepoManager);
    options
      .bind(TYPES.IQuizSessionManager)
      .to(QuizSessionManager)
      .inSingletonScope();
    options.bind(TYPES.IQuizResultsAnalyzer).to(QuizResultsAnalyzer);

    // === CONCEPT PROGRESS ===
    options
      .bind(TYPES.IConceptProgressTracker)
      .to(ConceptProgressTracker)
      .inSingletonScope();
  }
);
