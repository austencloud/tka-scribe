/**
 * Announcement Service Implementation
 *
 * Handles CRUD operations for system announcements.
 */

import { injectable } from "inversify";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import type { IAnnouncementService } from "../contracts/IAnnouncementService";
import type { Announcement } from "../../domain/models/announcement-models";

@injectable()
export class AnnouncementService implements IAnnouncementService {
  private readonly ANNOUNCEMENTS_COLLECTION = "announcements";

  /**
   * Convert Firestore timestamp to Date
   */
  private firestoreToDate(timestamp: unknown): Date {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date();
  }

  /**
   * Convert announcement from Firestore format
   */
  private fromFirestore(data: unknown, id: string): Announcement {
    const doc = data as Record<string, unknown>;
    return {
      id,
      title: doc.title as string,
      message: doc.message as string,
      severity: doc.severity as Announcement["severity"],
      targetAudience: doc.targetAudience as Announcement["targetAudience"],
      showAsModal: doc.showAsModal as boolean,
      createdAt: this.firestoreToDate(doc.createdAt),
      createdBy: doc.createdBy as string,
      expiresAt: doc.expiresAt ? this.firestoreToDate(doc.expiresAt) : undefined,
      actionUrl: doc.actionUrl as string | undefined,
      actionLabel: doc.actionLabel as string | undefined,
    };
  }

  /**
   * Create a new announcement
   */
  async createAnnouncement(
    announcement: Omit<Announcement, "id" | "createdAt">
  ): Promise<string> {
    const announcementsRef = collection(firestore, this.ANNOUNCEMENTS_COLLECTION);
    const newDoc = doc(announcementsRef);

    const announcementData = {
      ...announcement,
      createdAt: Timestamp.now(),
      expiresAt: announcement.expiresAt
        ? Timestamp.fromDate(announcement.expiresAt)
        : null,
    };

    await setDoc(newDoc, announcementData);
    return newDoc.id;
  }

  /**
   * Update an existing announcement
   */
  async updateAnnouncement(
    id: string,
    updates: Partial<Announcement>
  ): Promise<void> {
    const docRef = doc(firestore, this.ANNOUNCEMENTS_COLLECTION, id);

    const updateData: Record<string, unknown> = { ...updates };
    delete updateData.id;
    delete updateData.createdAt;

    if (updates.expiresAt) {
      updateData.expiresAt = Timestamp.fromDate(updates.expiresAt);
    }

    await updateDoc(docRef, updateData);
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id: string): Promise<void> {
    const docRef = doc(firestore, this.ANNOUNCEMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  }

  /**
   * Get all announcements (admin view)
   */
  async getAllAnnouncements(): Promise<Announcement[]> {
    const announcementsRef = collection(firestore, this.ANNOUNCEMENTS_COLLECTION);
    const q = query(announcementsRef, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => this.fromFirestore(doc.data(), doc.id));
  }

  /**
   * Get active announcements for a user (excludes expired, applies targeting)
   */
  async getActiveAnnouncementsForUser(userId: string): Promise<Announcement[]> {
    const now = Timestamp.now();
    const announcementsRef = collection(firestore, this.ANNOUNCEMENTS_COLLECTION);

    // Get all announcements (we'll filter targeting client-side)
    const snapshot = await getDocs(
      query(announcementsRef, orderBy("createdAt", "desc"))
    );

    const announcements = snapshot.docs
      .map((doc) => this.fromFirestore(doc.data(), doc.id))
      .filter((announcement) => {
        // Filter out expired announcements
        if (announcement.expiresAt && announcement.expiresAt < new Date()) {
          return false;
        }

        // TODO: Implement user targeting logic when user metadata is available
        // For now, show all non-expired announcements
        return true;
      });

    return announcements;
  }

  /**
   * Check if user has dismissed an announcement
   */
  async hasUserDismissed(
    userId: string,
    announcementId: string
  ): Promise<boolean> {
    const dismissalRef = doc(
      firestore,
      `users/${userId}/dismissedAnnouncements/${announcementId}`
    );
    const dismissalDoc = await getDoc(dismissalRef);
    return dismissalDoc.exists();
  }

  /**
   * Mark announcement as dismissed for a user
   */
  async dismissAnnouncement(
    userId: string,
    announcementId: string
  ): Promise<void> {
    const dismissalRef = doc(
      firestore,
      `users/${userId}/dismissedAnnouncements/${announcementId}`
    );

    await setDoc(dismissalRef, {
      announcementId,
      dismissedAt: Timestamp.now(),
    });
  }

  /**
   * Get undismissed modal announcements for a user
   */
  async getUndismissedModalAnnouncements(
    userId: string
  ): Promise<Announcement[]> {
    const activeAnnouncements = await this.getActiveAnnouncementsForUser(userId);

    // Filter for modal-only and check dismissal status
    const modalAnnouncements = activeAnnouncements.filter((a) => a.showAsModal);

    const undismissed: Announcement[] = [];
    for (const announcement of modalAnnouncements) {
      const dismissed = await this.hasUserDismissed(userId, announcement.id);
      if (!dismissed) {
        undismissed.push(announcement);
      }
    }

    return undismissed;
  }
}
