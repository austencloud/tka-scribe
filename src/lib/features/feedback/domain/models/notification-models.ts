/**
 * Notification Domain Models
 *
 * Types for tester notifications when their feedback is addressed.
 */

/**
 * Notification type classification
 */
export type NotificationType =
  // Feedback-related notifications
  | "feedback-resolved"      // Admin marked feedback as resolved
  | "feedback-in-progress"   // Admin started working on feedback
  | "feedback-needs-info"    // Admin needs more info from tester
  | "feedback-response"      // Admin sent a message
  // Sequence engagement notifications
  | "sequence-saved"         // Someone saved your sequence
  | "sequence-video-submitted" // Someone submitted a video of your sequence
  | "sequence-liked"         // Someone liked your sequence
  | "sequence-commented"     // Someone commented on your sequence
  // Social notifications
  | "user-followed"          // Someone followed you
  | "achievement-unlocked"   // User unlocked an achievement
  // System notifications
  | "system-announcement";   // Important system announcements

/**
 * Base notification interface
 * Stored per-user in users/{userId}/notifications/{notificationId}
 */
export interface BaseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  createdAt: Date;
  read: boolean;
  readAt?: Date;

  // Who triggered the notification (optional for system notifications)
  fromUserId?: string;
  fromUserName?: string;
}

/**
 * Feedback-related notification
 */
export interface FeedbackNotification extends BaseNotification {
  type: "feedback-resolved" | "feedback-in-progress" | "feedback-needs-info" | "feedback-response";
  feedbackId: string;
  feedbackTitle: string;
  fromUserId: string;
  fromUserName: string;
}

/**
 * Sequence-related notification
 */
export interface SequenceNotification extends BaseNotification {
  type: "sequence-saved" | "sequence-video-submitted" | "sequence-liked" | "sequence-commented";
  sequenceId: string;
  sequenceTitle: string;
  fromUserId: string;
  fromUserName: string;
  // Optional fields for specific types
  videoUrl?: string; // For sequence-video-submitted
  commentText?: string; // For sequence-commented
}

/**
 * Social notification
 */
export interface SocialNotification extends BaseNotification {
  type: "user-followed" | "achievement-unlocked";
  fromUserId?: string;
  fromUserName?: string;
  // Achievement-specific
  achievementId?: string;
  achievementName?: string;
}

/**
 * System notification
 */
export interface SystemNotification extends BaseNotification {
  type: "system-announcement";
  title: string;
  actionUrl?: string;
}

/**
 * Union type for all notifications
 */
export type UserNotification =
  | FeedbackNotification
  | SequenceNotification
  | SocialNotification
  | SystemNotification;

/**
 * Legacy alias for backward compatibility
 * @deprecated Use FeedbackNotification instead
 */
export type TesterNotification = FeedbackNotification;

/**
 * Notification preferences - stored per user
 * Controls which notification types the user wants to receive
 */
export interface NotificationPreferences {
  // Feedback notifications
  feedbackResolved: boolean;
  feedbackInProgress: boolean;
  feedbackNeedsInfo: boolean;
  feedbackResponse: boolean;

  // Sequence engagement notifications
  sequenceSaved: boolean;
  sequenceVideoSubmitted: boolean;
  sequenceLiked: boolean;
  sequenceCommented: boolean;

  // Social notifications
  userFollowed: boolean;
  achievementUnlocked: boolean;

  // System notifications (cannot be disabled)
  // systemAnnouncement is always enabled
}

/**
 * Default notification preferences (all enabled by default)
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  feedbackResolved: true,
  feedbackInProgress: true,
  feedbackNeedsInfo: true,
  feedbackResponse: true,
  sequenceSaved: true,
  sequenceVideoSubmitted: true,
  sequenceLiked: true,
  sequenceCommented: true,
  userFollowed: true,
  achievementUnlocked: true,
};

/**
 * Map notification type to preference key
 */
export function getPreferenceKeyForType(type: NotificationType): keyof NotificationPreferences | null {
  const typeToKey: Record<string, keyof NotificationPreferences> = {
    "feedback-resolved": "feedbackResolved",
    "feedback-in-progress": "feedbackInProgress",
    "feedback-needs-info": "feedbackNeedsInfo",
    "feedback-response": "feedbackResponse",
    "sequence-saved": "sequenceSaved",
    "sequence-video-submitted": "sequenceVideoSubmitted",
    "sequence-liked": "sequenceLiked",
    "sequence-commented": "sequenceCommented",
    "user-followed": "userFollowed",
    "achievement-unlocked": "achievementUnlocked",
  };

  return typeToKey[type] || null;
}

/**
 * Notification display configuration
 */
export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { label: string; color: string; icon: string; actionLabel: string }
> = {
  // Feedback notifications
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
  // Sequence notifications
  "sequence-saved": {
    label: "Sequence Saved",
    color: "#10b981",
    icon: "fa-bookmark",
    actionLabel: "View Sequence",
  },
  "sequence-video-submitted": {
    label: "Video Submitted",
    color: "#8b5cf6",
    icon: "fa-video",
    actionLabel: "Watch Video",
  },
  "sequence-liked": {
    label: "Sequence Liked",
    color: "#ec4899",
    icon: "fa-heart",
    actionLabel: "View Sequence",
  },
  "sequence-commented": {
    label: "New Comment",
    color: "#3b82f6",
    icon: "fa-comment-dots",
    actionLabel: "View Comment",
  },
  // Social notifications
  "user-followed": {
    label: "New Follower",
    color: "#06b6d4",
    icon: "fa-user-plus",
    actionLabel: "View Profile",
  },
  "achievement-unlocked": {
    label: "Achievement Unlocked",
    color: "#f59e0b",
    icon: "fa-trophy",
    actionLabel: "View Achievement",
  },
  // System notifications
  "system-announcement": {
    label: "System Announcement",
    color: "#6366f1",
    icon: "fa-bell",
    actionLabel: "Learn More",
  },
};
