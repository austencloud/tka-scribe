/**
 * NotificationTriggerService
 *
 * Central service for creating notifications with user preference checking.
 * All notification creation should go through this service to respect user preferences.
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
