/**
 * Feedback Domain Models
 *
 * Type definitions for feedback submission and management.
 */

/**
 * Device context data captured on feedback submission
 */
export interface DeviceContext {
  // Device & Browser
  userAgent: string;
  platform: string;
  isTouchDevice: boolean;

  // Viewport & Screen
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;

  // App Context
  appVersion: string;
  currentModule?: string;
  currentTab?: string;

  // Timestamp
  capturedAt: Date;
}

/**
 * Feedback type classification
 */
export type FeedbackType = "bug" | "feature" | "general";
export const FEEDBACK_TYPES = ["bug", "feature", "general"] as const;
export function isFeedbackType(value: unknown): value is FeedbackType {
  return (
    typeof value === "string" &&
    (FEEDBACK_TYPES as readonly string[]).includes(value)
  );
}

/**
 * Feedback priority levels
 */
export type FeedbackPriority = "low" | "medium" | "high" | "critical";

/**
 * Feedback status for admin management
 * 4 Kanban columns + archived (hidden, versioned)
 */
export type FeedbackStatus =
  | "new"          // Unclaimed, ready to be picked up
  | "in-progress"  // Agent is working on it
  | "in-review"    // Done, waiting for tester confirmation
  | "completed"    // Confirmed working, ready for next release
  | "archived";    // Tagged with version, historical record
export const FEEDBACK_STATUSES = [
  "new",
  "in-progress",
  "in-review",
  "completed",
  "archived",
] as const;
export function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return (
    typeof value === "string" &&
    (FEEDBACK_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Tester confirmation status after admin resolves feedback
 */
export type TesterConfirmationStatus =
  | "pending"      // Waiting for tester to confirm
  | "confirmed"    // Tester confirms fix works
  | "needs-work"   // Tester says it needs more work
  | "no-response"; // Tester hasn't responded after timeout

/**
 * Subtask status for prerequisite tracking
 */
export type SubtaskStatus = "pending" | "in-progress" | "completed";

/**
 * Subtask for breaking down complex feedback into prerequisites
 * Created by agents when feedback is too large to implement directly
 */
export interface FeedbackSubtask {
  id: string; // Unique within parent (e.g., "1", "2", or short slug)
  title: string; // Short title (2-5 words)
  description: string; // What needs to be done
  status: SubtaskStatus;
  completedAt?: Date;
  dependsOn?: string[]; // IDs of subtasks this depends on
}

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
  imageUrls?: string[]; // Screenshots attached to feedback

  // Context (auto-captured)
  capturedModule: string;
  capturedTab: string;
  deviceContext?: DeviceContext; // Browser/device info for debugging

  // Admin management
  status: FeedbackStatus;
  adminNotes?: string;
  resolutionNotes?: string; // Agent's summary of how feedback was resolved
  updatedAt?: Date;

  // Subtasks (optional - for complex feedback requiring prerequisites)
  subtasks?: FeedbackSubtask[];

  // Admin response to tester (visible to tester)
  adminResponse?: AdminResponse;

  // Tester confirmation (after admin marks as resolved)
  testerConfirmation?: TesterConfirmation;

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;

  // Version tracking (set when archived)
  fixedInVersion?: string; // e.g., "0.2.0"
  archivedAt?: Date; // When moved to archive

  // Deferment (archived items scheduled for reactivation)
  deferredUntil?: Date; // When to reactivate this item
  reactivatedAt?: Date; // When this was reactivated from deferment
  reactivatedFrom?: Date; // Original deferredUntil date when reactivated

  // Status change history
  statusHistory?: StatusHistoryEntry[];
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
 * Status change history entry
 */
export interface StatusHistoryEntry {
  status: FeedbackStatus;
  timestamp: Date;
  fromStatus?: FeedbackStatus;
}

/**
 * Form data for feedback submission
 * Simplified: just type and description. Title is auto-generated.
 * Priority and context are handled separately (admin-assigned and auto-captured).
 */
export interface FeedbackFormData {
  type: FeedbackType;
  title: string;
  description: string;
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
 * Status display configuration - 4 Kanban columns + archived
 */
export const STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; color: string; icon: string }
> = {
  new: { label: "New", color: "#3b82f6", icon: "fa-inbox" },
  "in-progress": { label: "In Progress", color: "#f59e0b", icon: "fa-spinner" },
  "in-review": { label: "In Review", color: "#8b5cf6", icon: "fa-eye" },
  completed: { label: "Completed", color: "#10b981", icon: "fa-check-circle" },
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
  { label: string; color: string; icon: string; placeholder: string }
> = {
  bug: {
    label: "Bug Report",
    color: "#ef4444",
    icon: "fa-bug",
    placeholder: "What went wrong? Describe the issue in detail..."
  },
  feature: {
    label: "Feature Request",
    color: "#8b5cf6",
    icon: "fa-lightbulb",
    placeholder: "Describe the feature and how it would help you..."
  },
  general: {
    label: "General Feedback",
    color: "#3b82f6",
    icon: "fa-comment",
    placeholder: "Share your thoughts, suggestions, or observations..."
  },
};
