/**
 * Feedback Service Type Identifiers
 *
 * Services for managing user feedback and issue tracking.
 */

export const FeedbackTypes = {
  IFeedbackSortingService: Symbol.for("IFeedbackSortingService"),
  IFeedbackEditingService: Symbol.for("IFeedbackEditingService"),
  IFeedbackSubtaskService: Symbol.for("IFeedbackSubtaskService"),
  IFeedbackFormattingService: Symbol.for("IFeedbackFormattingService"),
} as const;
