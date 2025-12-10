/**
 * Notification Action State
 *
 * Tracks which feedback item should be opened when navigating from a notification.
 * Used to coordinate between NotificationCenterWidget and MyFeedbackTab.
 */

let targetFeedbackId = $state<string | null>(null);

/**
 * Set which feedback should be opened
 */
export function setNotificationTargetFeedback(feedbackId: string | null) {
  targetFeedbackId = feedbackId;
}

/**
 * Get and clear the target feedback ID
 */
export function takeNotificationTargetFeedback(): string | null {
  const id = targetFeedbackId;
  targetFeedbackId = null;
  return id;
}

/**
 * Get the current target feedback ID without clearing
 */
export function getNotificationTargetFeedback(): string | null {
  return targetFeedbackId;
}
