/**
 * IFeedbackService
 *
 * Contract for feedback submission and management operations.
 */

import type {
  FeedbackItem,
  FeedbackFormData,
  FeedbackFilterOptions,
  FeedbackStatus,
} from "../../domain/models/feedback-models";

export interface IFeedbackService {
  /**
   * Submit new feedback
   */
  submitFeedback(
    formData: FeedbackFormData,
    capturedModule: string,
    capturedTab: string
  ): Promise<string>;

  /**
   * Load feedback items with pagination and filtering (admin)
   */
  loadFeedback(
    filters: FeedbackFilterOptions,
    pageSize: number,
    lastDocId?: string
  ): Promise<{
    items: FeedbackItem[];
    lastDocId: string | null;
    hasMore: boolean;
  }>;

  /**
   * Get a single feedback item by ID
   */
  getFeedback(feedbackId: string): Promise<FeedbackItem | null>;

  /**
   * Update feedback status (admin)
   */
  updateStatus(feedbackId: string, status: FeedbackStatus): Promise<void>;

  /**
   * Update admin notes (admin)
   */
  updateAdminNotes(feedbackId: string, notes: string): Promise<void>;

  /**
   * Delete feedback item (admin)
   */
  deleteFeedback(feedbackId: string): Promise<void>;

  /**
   * Update editable feedback fields (admin)
   * Used for correcting context, type, priority, title, description
   */
  updateFeedback(
    feedbackId: string,
    updates: Partial<Pick<FeedbackItem,
      | "type"
      | "title"
      | "description"
      | "priority"
      | "reportedModule"
      | "reportedTab"
    >>
  ): Promise<void>;
}
