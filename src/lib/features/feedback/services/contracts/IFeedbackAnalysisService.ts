/**
 * IFeedbackAnalysisService
 *
 * Contract for the feedback analysis orchestration service.
 * Manages the analysis workflow, storage, and clarifying questions.
 */

import type {
  FeedbackAnalysis,
  ClarifyingQuestion,
  ClaudeCodePrompt,
} from "../../domain/models/analysis-models";

export interface IFeedbackAnalysisService {
  /**
   * Start analysis for a feedback item
   * Creates new analysis or updates existing one
   *
   * @param feedbackId - ID of the feedback to analyze
   * @returns The created/updated analysis
   */
  analyzeFeedback(feedbackId: string): Promise<FeedbackAnalysis>;

  /**
   * Get existing analysis for a feedback item
   *
   * @param feedbackId - ID of the feedback
   * @returns The analysis or null if none exists
   */
  getAnalysis(feedbackId: string): Promise<FeedbackAnalysis | null>;

  /**
   * Submit an answer to a clarifying question
   * Triggers re-analysis if all required questions are answered
   *
   * @param feedbackId - ID of the feedback
   * @param questionId - ID of the question being answered
   * @param answer - The answer text
   * @param answeredBy - Who provided the answer
   * @returns Updated analysis
   */
  submitAnswer(
    feedbackId: string,
    questionId: string,
    answer: string,
    answeredBy: "admin" | "user"
  ): Promise<FeedbackAnalysis>;

  /**
   * Mark a question as "passed to user"
   * Admin doesn't know the answer, needs user input
   *
   * @param feedbackId - ID of the feedback
   * @param questionId - ID of the question to pass
   */
  passQuestionToUser(feedbackId: string, questionId: string): Promise<void>;

  /**
   * Re-analyze with current answers
   * Called when answers are updated
   *
   * @param feedbackId - ID of the feedback
   * @returns Updated analysis
   */
  reanalyzeWithAnswers(feedbackId: string): Promise<FeedbackAnalysis>;

  /**
   * Generate a Claude Code investigation prompt
   *
   * @param feedbackId - ID of the feedback
   * @returns Generated prompt object
   */
  generateClaudeCodePrompt(feedbackId: string): Promise<ClaudeCodePrompt>;

  /**
   * Mark a Claude Code prompt as copied
   *
   * @param feedbackId - ID of the feedback
   * @param promptId - ID of the prompt
   */
  markPromptCopied(feedbackId: string, promptId: string): Promise<void>;

  /**
   * Delete analysis for a feedback item
   *
   * @param feedbackId - ID of the feedback
   */
  deleteAnalysis(feedbackId: string): Promise<void>;

  /**
   * Subscribe to analysis updates (for real-time UI)
   *
   * @param feedbackId - ID of the feedback
   * @param callback - Called when analysis changes
   * @returns Unsubscribe function
   */
  onAnalysisChange(
    feedbackId: string,
    callback: (analysis: FeedbackAnalysis | null) => void
  ): () => void;
}
