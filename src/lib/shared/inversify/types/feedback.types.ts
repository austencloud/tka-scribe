/**
 * Feedback Service Type Identifiers
 *
 * Services for managing user feedback and issue tracking.
 */

export const FeedbackTypes = {
  IFeedbackSorter: Symbol.for("IFeedbackSorter"),
  IFeedbackEditor: Symbol.for("IFeedbackEditor"),
  IFeedbackSubtaskManager: Symbol.for("IFeedbackSubtaskManager"),
  IFeedbackFormatter: Symbol.for("IFeedbackFormatter"),
  IVoiceTranscriptCoordinator: Symbol.for("IVoiceTranscriptCoordinator"),
  IFormDraftPersister: Symbol.for("IFormDraftPersister"),
  IFeedbackTypeResolver: Symbol.for("IFeedbackTypeResolver"),
} as const;
