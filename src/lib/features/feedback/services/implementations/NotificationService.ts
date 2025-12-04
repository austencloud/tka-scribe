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
import type { TesterNotification } from "../../domain/models/notification-models";

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
  ): Promise<TesterNotification[]> {
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

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data["userId"] as string,
        feedbackId: data["feedbackId"] as string,
        feedbackTitle: data["feedbackTitle"] as string,
        type: data["type"] as TesterNotification["type"],
        message: data["message"] as string,
        createdAt: (data["createdAt"] as Timestamp)?.toDate() || new Date(),
        read: data["read"] as boolean,
        readAt: (data["readAt"] as Timestamp)?.toDate(),
        fromUserId: data["fromUserId"] as string,
        fromUserName: data["fromUserName"] as string,
      };
    });
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
    callback: (notifications: TesterNotification[]) => void
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
      const notifications: TesterNotification[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data["userId"] as string,
          feedbackId: data["feedbackId"] as string,
          feedbackTitle: data["feedbackTitle"] as string,
          type: data["type"] as TesterNotification["type"],
          message: data["message"] as string,
          createdAt: (data["createdAt"] as Timestamp)?.toDate() || new Date(),
          read: data["read"] as boolean,
          readAt: (data["readAt"] as Timestamp)?.toDate(),
          fromUserId: data["fromUserId"] as string,
          fromUserName: data["fromUserName"] as string,
        };
      });
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
