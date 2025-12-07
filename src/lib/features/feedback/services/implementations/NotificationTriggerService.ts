/**
 * NotificationTriggerService
 *
 * Central service for creating notifications with user preference checking.
 * All notification creation should go through this service to respect user preferences.
 *
 * IMPLEMENTATION GUIDE FOR FUTURE FEATURES:
 *
 * When implementing new features that trigger notifications, follow this pattern:
 *
 * 1. FEEDBACK NOTIFICATIONS (feedback-response, feedback-status-changed, feedback-needs-info, feedback-resolved)
 *    - Already implemented in FeedbackService.ts
 *    - Triggered when admin interacts with user feedback
 *    - Example: notificationTriggerService.createFeedbackNotification(userId, 'feedback-response', feedbackId, feedbackTitle, message, adminId, adminName)
 *
 * 2. SEQUENCE NOTIFICATIONS (sequence-saved, sequence-video-submitted, sequence-liked, sequence-commented)
 *    - TODO: Implement in SequenceService when save/like/comment features are added
 *    - sequence-saved: When user saves another user's sequence
 *    - sequence-video-submitted: When user submits video for another user's sequence
 *    - sequence-liked: When user likes another user's sequence
 *    - sequence-commented: When user comments on another user's sequence
 *    - Example: notificationTriggerService.createSequenceNotification(sequenceOwnerId, 'sequence-liked', sequenceId, sequenceTitle, `${userName} liked your sequence`, userId, userName)
 *
 * 3. SOCIAL NOTIFICATIONS (user-followed, achievement-unlocked)
 *    - user-followed: TODO: Implement in UserService when follow feature is added
 *    - achievement-unlocked: TODO: Implement in GamificationService when achievement system triggers
 *    - Example: notificationTriggerService.createSocialNotification(userId, 'achievement-unlocked', `You unlocked ${achievementName}!`, undefined, undefined, achievementId, achievementName)
 *
 * 4. SYSTEM NOTIFICATIONS (system-announcement)
 *    - TODO: Create admin panel for broadcasting announcements
 *    - Bypasses user preferences (always shown)
 *    - Use for critical app updates, maintenance notices, etc.
 *    - Example: notificationTriggerService.createSystemNotification(userId, 'New Feature Released', 'Check out the new animation tools!', '/animate')
 *
 * IMPORTANT:
 * - Never create notifications directly in Firestore - always use this service
 * - The service automatically checks user preferences before creating notifications
 * - Returns null if user has disabled that notification type
 * - System announcements always bypass preferences
 */

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import type {
  NotificationType,
  FeedbackNotification,
  SequenceNotification,
  SocialNotification,
  SystemNotification,
} from "../../domain/models/notification-models";
import { getPreferenceKeyForType } from "../../domain/models/notification-models";
import { notificationPreferencesService } from "./NotificationPreferencesService";

const USERS_COLLECTION = "users";
const NOTIFICATIONS_SUBCOLLECTION = "notifications";

export class NotificationTriggerService {
  /**
   * Create a feedback notification
   */
  async createFeedbackNotification(
    userId: string,
    type: FeedbackNotification["type"],
    feedbackId: string,
    feedbackTitle: string,
    message: string,
    fromUserId: string,
    fromUserName: string
  ): Promise<string | null> {
    // Check user preferences
    const shouldNotify = await this.shouldNotify(userId, type);
    if (!shouldNotify) {
      return null; // User has disabled this notification type
    }

    const notification: Omit<FeedbackNotification, "id"> = {
      userId,
      type,
      feedbackId,
      feedbackTitle,
      message,
      createdAt: new Date(),
      read: false,
      fromUserId,
      fromUserName,
    };

    return await this.createNotification(userId, notification);
  }

  /**
   * Create a sequence engagement notification
   */
  async createSequenceNotification(
    userId: string,
    type: SequenceNotification["type"],
    sequenceId: string,
    sequenceTitle: string,
    message: string,
    fromUserId: string,
    fromUserName: string,
    videoUrl?: string,
    commentText?: string
  ): Promise<string | null> {
    // Check user preferences
    const shouldNotify = await this.shouldNotify(userId, type);
    if (!shouldNotify) {
      return null;
    }

    const notification: Omit<SequenceNotification, "id"> = {
      userId,
      type,
      sequenceId,
      sequenceTitle,
      message,
      createdAt: new Date(),
      read: false,
      fromUserId,
      fromUserName,
      ...(videoUrl && { videoUrl }),
      ...(commentText && { commentText }),
    };

    return await this.createNotification(userId, notification);
  }

  /**
   * Create a social notification
   */
  async createSocialNotification(
    userId: string,
    type: SocialNotification["type"],
    message: string,
    fromUserId?: string,
    fromUserName?: string,
    achievementId?: string,
    achievementName?: string
  ): Promise<string | null> {
    // Check user preferences
    const shouldNotify = await this.shouldNotify(userId, type);
    if (!shouldNotify) {
      return null;
    }

    const notification: Omit<SocialNotification, "id"> = {
      userId,
      type,
      message,
      createdAt: new Date(),
      read: false,
      ...(fromUserId && { fromUserId }),
      ...(fromUserName && { fromUserName }),
      ...(achievementId && { achievementId }),
      ...(achievementName && { achievementName }),
    };

    return await this.createNotification(userId, notification);
  }

  /**
   * Create a system announcement notification
   * System announcements always bypass user preferences
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<string> {
    const notification: Omit<SystemNotification, "id"> = {
      userId,
      type: "system-announcement",
      title,
      message,
      createdAt: new Date(),
      read: false,
      ...(actionUrl && { actionUrl }),
    };

    // System notifications bypass preference checking
    return await this.createNotification(userId, notification);
  }

  /**
   * Check if user should receive this notification type
   */
  private async shouldNotify(
    userId: string,
    type: NotificationType
  ): Promise<boolean> {
    // System announcements always notify
    if (type === "system-announcement") {
      return true;
    }

    try {
      const preferences = await notificationPreferencesService.getPreferences(userId);
      const prefKey = getPreferenceKeyForType(type);

      if (!prefKey) {
        // Unknown notification type, default to notify
        return true;
      }

      return preferences[prefKey];
    } catch (error) {
      console.error("Error checking notification preferences:", error);
      // On error, default to notifying (fail open)
      return true;
    }
  }

  /**
   * Create notification in Firestore
   */
  private async createNotification(
    userId: string,
    notification: Omit<FeedbackNotification | SequenceNotification | SocialNotification | SystemNotification, "id">
  ): Promise<string> {
    const userNotificationsRef = collection(
      firestore,
      USERS_COLLECTION,
      userId,
      NOTIFICATIONS_SUBCOLLECTION
    );

    const docRef = await addDoc(userNotificationsRef, {
      ...notification,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  }
}

// Export singleton instance
export const notificationTriggerService = new NotificationTriggerService();
