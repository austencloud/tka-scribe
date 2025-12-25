/**
 * Learn Module Service Type Identifiers
 *
 * Services for the codex, quizzes, and educational features.
 */

export const LearnTypes = {
  // Codex
  ICodexService: Symbol.for("ICodexService"),
  ICodexPictographUpdater: Symbol.for("ICodexPictographUpdater"),
  ILetterQueryHandler: Symbol.for("ILetterQueryHandler"),
  IPictographTransformationService: Symbol.for(
    "IPictographTransformationService"
  ),
  ICodexLetterMappingRepo: Symbol.for("ICodexLetterMappingRepo"),

  // Quiz
  IQuizSessionService: Symbol.for("IQuizSessionService"),
  IQuizResultsAnalyzer: Symbol.for("IQuizResultsAnalyzer"),
  IQuizRepoManager: Symbol.for("IQuizRepoManager"),

  // Concept Progress
  IConceptProgressService: Symbol.for("IConceptProgressService"),

  // Motion & Letter
  IMotionQueryHandler: Symbol.for("IMotionQueryHandler"),
  ILetterDeriver: Symbol.for("ILetterDeriver"),
  IMotionLetterIdentificationService: Symbol.for(
    "IMotionLetterIdentificationService"
  ),
} as const;
