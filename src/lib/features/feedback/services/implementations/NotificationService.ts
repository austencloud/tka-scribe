/**
 * NotificationService
 *
 * Manages tester notifications for feedback updates.
 */

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import type { UserNotification, TesterNotification } from "../../domain/models/notification-models";

const USERS_COLLECTION = "users";
const NOTIFICATIONS_SUBCOLLECTION = "notifications";

export class NotificationService {
  private unsubscribe: (() => void) | null = null;

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    const notificationsRef = collection(
      firestore,
      USERS_COLLECTION,
      userId,
      NOTIFICATIONS_SUBCOLLECTION
    );

    const q = query(notificationsRef, where("read", "==", false));
    const snapshot = await getDocs(q);

    return snapshot.size;
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    maxCount: number = 20
  ): Promise<UserNotification[]> {
    const notificationsRef = collection(
      firestore,
      USERS_COLLECTION,
      userId,
      NOTIFICATIONS_SUBCOLLECTION
    );

    const q = query(
      notificationsRef,
      orderBy("createdAt", "desc"),
      limit(maxCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => this.mapDocToNotification(docSnap.id, docSnap.data()));
  }

  /**
   * Map Firestore document to notification object
   */
  private mapDocToNotification(id: string, data: Record<string, unknown>): UserNotification {
    const baseNotification = {
      id,
      userId: data["userId"] as string,
      type: data["type"] as UserNotification["type"],
      message: data["message"] as string,
      createdAt: (data["createdAt"] as Timestamp)?.toDate() || new Date(),
      read: data["read"] as boolean,
      readAt: (data["readAt"] as Timestamp)?.toDate(),
      fromUserId: data["fromUserId"] as string | undefined,
      fromUserName: data["fromUserName"] as string | undefined,
    };

    const type = data["type"] as string;

    // Map to specific notification type based on type field
    if (type.startsWith("feedback-")) {
      return {
        ...baseNotification,
        type: type as UserNotification["type"],
        feedbackId: data["feedbackId"] as string,
        feedbackTitle: data["feedbackTitle"] as string,
        fromUserId: data["fromUserId"] as string,
        fromUserName: data["fromUserName"] as string,
      } as UserNotification;
    } else if (type.startsWith("sequence-")) {
      return {
        ...baseNotification,
        type: type as UserNotification["type"],
        sequenceId: data["sequenceId"] as string,
        sequenceTitle: data["sequenceTitle"] as string,
        fromUserId: data["fromUserId"] as string,
        fromUserName: data["fromUserName"] as string,
        videoUrl: data["videoUrl"] as string | undefined,
        commentText: data["commentText"] as string | undefined,
      } as UserNotification;
    } else if (type === "user-followed" || type === "achievement-unlocked") {
      return {
        ...baseNotification,
        type: type as UserNotification["type"],
        achievementId: data["achievementId"] as string | undefined,
        achievementName: data["achievementName"] as string | undefined,
      } as UserNotification;
    } else if (type === "system-announcement") {
      return {
        ...baseNotification,
        type: type as UserNotification["type"],
        title: data["title"] as string,
        actionUrl: data["actionUrl"] as string | undefined,
      } as UserNotification;
    } else if (type === "admin-new-user-signup") {
      return {
        ...baseNotification,
        type: type as UserNotification["type"],
        newUserId: data["newUserId"] as string,
        newUserEmail: data["newUserEmail"] as string | null,
        newUserDisplayName: data["newUserDisplayName"] as string,
      } as UserNotification;
    }

    // Fallback for unknown types - treat as base notification
    return baseNotification as UserNotification;
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notificationRef = doc(
      firestore,
      USERS_COLLECTION,
      userId,
      NOTIFICATIONS_SUBCOLLECTION,
      notificationId
    );

    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date(),
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const notificationsRef = collection(
      firestore,
      USERS_COLLECTION,
      userId,
      NOTIFICATIONS_SUBCOLLECTION
    );

    const q = query(notificationsRef, where("read", "==", false));
    const snapshot = await getDocs(q);

    const updates = snapshot.docs.map((docSnap) =>
      updateDoc(docSnap.ref, { read: true, readAt: new Date() })
    );

    await Promise.all(updates);
  }

  /**
   * Subscribe to real-time notification updates
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: UserNotification[]) => void
  ): () => void {
    // Clean up previous subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    const notificationsRef = collection(
      firestore,
      USERS_COLLECTION,
      userId,
      NOTIFICATIONS_SUBCOLLECTION
    );

    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(20));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: UserNotification[] = snapshot.docs.map((docSnap) =>
        this.mapDocToNotification(docSnap.id, docSnap.data())
      );
      callback(notifications);
    });

    return this.unsubscribe;
  }

  /**
   * Clean up subscriptions
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
