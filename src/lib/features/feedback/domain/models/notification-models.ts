/**
 * Notification Domain Models
 *
 * Types for tester notifications when their feedback is addressed.
 */

/**
 * Notification type classification
 */
export type NotificationType =
  | "feedback-resolved"      // Admin marked feedback as resolved
  | "feedback-in-progress"   // Admin started working on feedback
  | "feedback-needs-info"    // Admin needs more info from tester
  | "feedback-response";     // Admin sent a message

/**
 * Notification stored in Firestore
 * Stored per-user in users/{userId}/notifications/{notificationId}
 */
export interface TesterNotification {
  id: string;
  userId: string;
  feedbackId: string;
  feedbackTitle: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
  read: boolean;
  readAt?: Date;

  // Who triggered the notification
  fromUserId: string;
  fromUserName: string;
}

/**
 * Notification display configuration
 */
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { label: string; color: string; icon: string; actionLabel: string }
> = {
  "feedback-resolved": {
    label: "Feedback Resolved",
    color: "#10b981",
    icon: "fa-check-circle",
    actionLabel: "Review & Confirm",
  },
  "feedback-in-progress": {
    label: "Being Worked On",
    color: "#f59e0b",
    icon: "fa-spinner",
    actionLabel: "View Details",
  },
  "feedback-needs-info": {
    label: "More Info Needed",
    color: "#8b5cf6",
    icon: "fa-question-circle",
    actionLabel: "Respond",
  },
  "feedback-response": {
    label: "Admin Response",
    color: "#3b82f6",
    icon: "fa-comment",
    actionLabel: "View Message",
  },
};
