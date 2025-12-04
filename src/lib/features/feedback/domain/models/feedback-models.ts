/**
 * Feedback Domain Models
 *
 * Type definitions for feedback submission and management.
 */

/**
 * Feedback type classification
 */
export type FeedbackType = "bug" | "feature" | "general";

/**
 * Feedback priority levels
 */
export type FeedbackPriority = "low" | "medium" | "high" | "critical";

/**
 * Feedback status for admin management
 * Simplified to 4 states that map to Kanban columns
 */
export type FeedbackStatus =
  | "new"
  | "in-progress"
  | "in-review"
  | "resolved"
  | "archived";

/**
 * Tester confirmation status after admin resolves feedback
 */
export type TesterConfirmationStatus =
  | "pending"      // Waiting for tester to confirm
  | "confirmed"    // Tester confirms fix works
  | "needs-work"   // Tester says it needs more work
  | "no-response"; // Tester hasn't responded after timeout

/**
 * Core feedback item stored in Firestore
 */
export interface FeedbackItem {
  id: string;
  createdAt: Date;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoURL?: string; // Profile avatar

  // Feedback content
  type: FeedbackType;
  title: string;
  description: string;
  priority?: FeedbackPriority;

  // Context (auto-captured)
  capturedModule: string;
  capturedTab: string;

  // User-specified context (may differ from captured)
  reportedModule?: string;
  reportedTab?: string;

  // Admin management
  status: FeedbackStatus;
  adminNotes?: string;
  updatedAt?: Date;

  // Admin response to tester (visible to tester)
  adminResponse?: AdminResponse;

  // Tester confirmation (after admin marks as resolved)
  testerConfirmation?: TesterConfirmation;

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

/**
 * Admin response to tester - visible in tester's "My Feedback" view
 */
export interface AdminResponse {
  message: string;
  respondedAt: Date;
  respondedBy: string; // admin userId
}

/**
 * Tester's confirmation after fix is implemented
 */
export interface TesterConfirmation {
  status: TesterConfirmationStatus;
  comment?: string;
  respondedAt?: Date;
}

/**
 * Form data for feedback submission
 */
export interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
  priority: FeedbackPriority | "";
  reportedModule: string;
  reportedTab: string;
}

/**
 * Form validation errors
 */
export interface FeedbackFormErrors {
  type?: string;
  title?: string;
  description?: string;
}

/**
 * Form submission status
 */
export type FeedbackSubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * Filter options for manage tab
 */
export interface FeedbackFilterOptions {
  type: FeedbackType | "all";
  status: FeedbackStatus | "all";
  priority: FeedbackPriority | "all";
}

/**
 * Status display configuration - 5 columns for Kanban
 */
export const STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; color: string; icon: string }
> = {
  new: { label: "New", color: "#3b82f6", icon: "fa-inbox" },
  "in-progress": { label: "In Progress", color: "#f59e0b", icon: "fa-spinner" },
  "in-review": { label: "In Review", color: "#8b5cf6", icon: "fa-eye" },
  resolved: { label: "Resolved", color: "#10b981", icon: "fa-check-circle" },
  archived: { label: "Archived", color: "#6b7280", icon: "fa-archive" },
};

/**
 * Tester confirmation status display configuration
 */
export const CONFIRMATION_STATUS_CONFIG: Record<
  TesterConfirmationStatus,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "Awaiting Confirmation", color: "#f59e0b", icon: "fa-clock" },
  confirmed: { label: "Confirmed Working", color: "#10b981", icon: "fa-check" },
  "needs-work": { label: "Needs More Work", color: "#ef4444", icon: "fa-redo" },
  "no-response": { label: "No Response", color: "#6b7280", icon: "fa-question" },
};

/**
 * Priority display configuration
 */
export const PRIORITY_CONFIG: Record<
  FeedbackPriority,
  { label: string; color: string; icon: string }
> = {
  low: { label: "Low", color: "#6b7280", icon: "fa-arrow-down" },
  medium: { label: "Medium", color: "#f59e0b", icon: "fa-minus" },
  high: { label: "High", color: "#f97316", icon: "fa-arrow-up" },
  critical: { label: "Critical", color: "#ef4444", icon: "fa-exclamation" },
};

/**
 * Feedback type display configuration
 */
export const TYPE_CONFIG: Record<
  FeedbackType,
  { label: string; color: string; icon: string }
> = {
  bug: { label: "Bug Report", color: "#ef4444", icon: "fa-bug" },
  feature: { label: "Feature Request", color: "#8b5cf6", icon: "fa-lightbulb" },
  general: { label: "General Feedback", color: "#3b82f6", icon: "fa-comment" },
};
