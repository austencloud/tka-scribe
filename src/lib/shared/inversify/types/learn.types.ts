/**
 * Learn Module Service Type Identifiers
 *
 * Services for the codex, quizzes, and educational features.
 */

export const LearnTypes = {
  // Codex
  ICodex: Symbol.for("ICodex"),
  ICodexPictographUpdater: Symbol.for("ICodexPictographUpdater"),
  ILetterQueryHandler: Symbol.for("ILetterQueryHandler"),
  IPictographTransformationService: Symbol.for(
    "IPictographTransformationService"
  ),
  ICodexLetterMappingRepo: Symbol.for("ICodexLetterMappingRepo"),

  // Quiz
  IQuizSessionManager: Symbol.for("IQuizSessionManager"),
  IQuizResultsAnalyzer: Symbol.for("IQuizResultsAnalyzer"),
  IQuizRepoManager: Symbol.for("IQuizRepoManager"),

  // Concept Progress
  IConceptProgressTracker: Symbol.for("IConceptProgressTracker"),

  // Motion & Letter
  IMotionQueryHandler: Symbol.for("IMotionQueryHandler"),
  ILetterDeriver: Symbol.for("ILetterDeriver"),
  IMotionLetterIdentificationService: Symbol.for(
    "IMotionLetterIdentificationService"
  ),
} as const;
