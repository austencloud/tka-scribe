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
 */
export type FeedbackStatus =
  | "new"
  | "acknowledged"
  | "planned"
  | "in-progress"
  | "completed"
  | "wont-fix";

/**
 * Core feedback item stored in Firestore
 */
export interface FeedbackItem {
  id: string;
  createdAt: Date;
  userId: string;
  userEmail: string;
  userDisplayName: string;

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
 * Status display configuration
 */
export const STATUS_CONFIG: Record<
  FeedbackStatus,
  { label: string; color: string; icon: string }
> = {
  new: { label: "New", color: "#3b82f6", icon: "fa-circle" },
  acknowledged: { label: "Acknowledged", color: "#8b5cf6", icon: "fa-eye" },
  planned: { label: "Planned", color: "#f59e0b", icon: "fa-calendar" },
  "in-progress": { label: "In Progress", color: "#06b6d4", icon: "fa-spinner" },
  completed: { label: "Completed", color: "#10b981", icon: "fa-check" },
  "wont-fix": { label: "Won't Fix", color: "#6b7280", icon: "fa-ban" },
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
