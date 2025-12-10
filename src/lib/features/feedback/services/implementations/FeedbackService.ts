/**
 * FeedbackService
 *
 * Firestore operations for feedback submission and management.
 */

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getDocsFromServer,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  startAfter,
  getDoc,
  where,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore, getStorageInstance } from "$lib/shared/auth/firebase";
import { trackXP } from "$lib/shared/gamification/init/gamification-initializer";
import type { FirebaseStorage } from "firebase/storage";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
import type { IFeedbackService } from "../contracts/IFeedbackService";
import type {
  FeedbackItem,
  FeedbackFormData,
  FeedbackFilterOptions,
  FeedbackStatus,
  TesterConfirmationStatus,
  AdminResponse,
  TesterConfirmation,
} from "../../domain/models/feedback-models";
import type { NotificationType } from "../../domain/models/notification-models";
import { notificationTriggerService } from "./NotificationTriggerService";

const COLLECTION_NAME = "feedback";

export class FeedbackService implements IFeedbackService {
  /**
   * Generate a title from description if none provided
   */
  private generateTitleFromDescription(description: string): string {
    const trimmed = description.trim();

    // Try to get first sentence (up to . ! or ?)
    const sentenceMatch = trimmed.match(/^[^.!?]+[.!?]?/);
    if (sentenceMatch && sentenceMatch[0].length >= 10 && sentenceMatch[0].length <= 80) {
      return sentenceMatch[0].trim();
    }

    // Otherwise take first ~60 chars at word boundary
    if (trimmed.length <= 60) {
      return trimmed;
    }

    const truncated = trimmed.substring(0, 60);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 30) {
      return truncated.substring(0, lastSpace) + "...";
    }
    return truncated + "...";
  }

  /**
   * Upload an image to Firebase Storage
   * Returns the public download URL
   */
  private async uploadImage(file: File, feedbackId: string): Promise<string> {
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const storage = await getStorageInstance();

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `feedback/${feedbackId}/${timestamp}_${sanitizedFilename}`;

    // Upload file
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);

    // Get download URL
    return getDownloadURL(storageRef);
  }

  async submitFeedback(
    formData: FeedbackFormData,
    capturedModule: string,
    capturedTab: string,
    images?: File[]
  ): Promise<string> {
    const user = authStore.user;
    if (!user) {
      throw new Error("User must be authenticated to submit feedback");
    }

    // Generate title from description if not provided
    const title = formData.title?.trim() || this.generateTitleFromDescription(formData.description);

    const feedbackData = {
      // User info
      userId: user.uid,
      userEmail: user.email || "",
      userDisplayName: user.displayName || user.email || "Anonymous",
      userPhotoURL: user.photoURL || null,

      // Feedback content
      type: formData.type,
      title,
      description: formData.description,
      // priority is admin-assigned, not user-provided
      priority: null,

      // Context (auto-captured, not user-reported)
      capturedModule,
      capturedTab,

      // Admin management
      status: "new" as FeedbackStatus,
      adminNotes: null,

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: null,
    };

    // Create document first to get ID
    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), feedbackData);

    // Upload images if provided
    if (images && images.length > 0) {
      const imageUrls = await Promise.all(
        images.map(file => this.uploadImage(file, docRef.id))
      );

      // Update document with image URLs
      await updateDoc(docRef, {
        imageUrls,
      });
    }

    // Award XP for submitting feedback (don't await - non-blocking)
    trackXP("feedback_submitted", {
      feedbackId: docRef.id,
      feedbackType: formData.type,
    }).catch((err) => console.warn("Failed to track feedback XP:", err));

    return docRef.id;
  }

  async loadFeedback(
    filters: FeedbackFilterOptions,
    pageSize: number,
    lastDocId?: string
  ): Promise<{
    items: FeedbackItem[];
    lastDocId: string | null;
    hasMore: boolean;
  }> {
    // Build query with filters
    const constraints: Parameters<typeof query>[1][] = [];

    // Add filters
    if (filters.type !== "all") {
      constraints.push(where("type", "==", filters.type));
    }
    if (filters.status !== "all") {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.priority !== "all") {
      constraints.push(where("priority", "==", filters.priority));
    }

    // Order by createdAt descending
    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageSize));

    // Handle pagination
    if (lastDocId) {
      const lastDocRef = doc(firestore, COLLECTION_NAME, lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        constraints.push(startAfter(lastDocSnap));
      }
    }

    const q = query(collection(firestore, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    const items: FeedbackItem[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return this.mapDocToFeedbackItem(docSnap.id, data);
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      items,
      lastDocId: lastDoc?.id || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  }

  async getFeedback(feedbackId: string): Promise<FeedbackItem | null> {
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.mapDocToFeedbackItem(docSnap.id, docSnap.data());
  }

  async updateStatus(feedbackId: string, status: FeedbackStatus): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };

    // Set archivedAt when moving to archived status
    if (status === "archived") {
      updateData["archivedAt"] = serverTimestamp();
    }

    await updateDoc(docRef, updateData);
  }

  async updateAdminNotes(feedbackId: string, notes: string): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await updateDoc(docRef, {
      adminNotes: notes,
      updatedAt: serverTimestamp(),
    });
  }

  async deferFeedback(feedbackId: string, deferredUntil: Date, notes: string): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await updateDoc(docRef, {
      status: "archived",
      deferredUntil: Timestamp.fromDate(deferredUntil),
      adminNotes: notes,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await deleteDoc(docRef);
  }

  async updateFeedback(
    feedbackId: string,
    updates: Partial<Pick<FeedbackItem,
      | "type"
      | "title"
      | "description"
      | "priority"
    >>
  ): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);

    // Build update object, converting undefined to null for Firestore
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (updates.type !== undefined) updateData["type"] = updates.type;
    if (updates.title !== undefined) updateData["title"] = updates.title;
    if (updates.description !== undefined) updateData["description"] = updates.description;
    if (updates.priority !== undefined) updateData["priority"] = updates.priority || null;

    await updateDoc(docRef, updateData);
  }

  async loadUserFeedback(
    userId: string,
    pageSize: number,
    lastDocId?: string
  ): Promise<{
    items: FeedbackItem[];
    lastDocId: string | null;
    hasMore: boolean;
  }> {
    const constraints: Parameters<typeof query>[1][] = [];

    // Filter by user
    constraints.push(where("userId", "==", userId));

    // Order by createdAt descending
    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageSize));

    // Handle pagination
    if (lastDocId) {
      const lastDocRef = doc(firestore, COLLECTION_NAME, lastDocId);
      const lastDocSnap = await getDoc(lastDocRef);
      if (lastDocSnap.exists()) {
        constraints.push(startAfter(lastDocSnap));
      }
    }

    const q = query(collection(firestore, COLLECTION_NAME), ...constraints);
    const snapshot = await getDocs(q);

    const items: FeedbackItem[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return this.mapDocToFeedbackItem(docSnap.id, data);
    });

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      items,
      lastDocId: lastDoc?.id || null,
      hasMore: snapshot.docs.length === pageSize,
    };
  }

  async sendAdminResponse(
    feedbackId: string,
    message: string,
    notifyTester: boolean = true
  ): Promise<void> {
    const user = authStore.user;
    if (!user) {
      throw new Error("User must be authenticated");
    }

    // Get the feedback item to get tester info
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    const adminResponse: AdminResponse = {
      message,
      respondedAt: new Date(),
      respondedBy: user.uid,
    };

    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await updateDoc(docRef, {
      adminResponse,
      updatedAt: serverTimestamp(),
    });

    // Create notification for tester
    if (notifyTester) {
      await this.createNotification(
        feedback.userId,
        feedbackId,
        feedback.title,
        "feedback-response",
        message
      );
    }
  }

  async submitTesterConfirmation(
    feedbackId: string,
    status: TesterConfirmationStatus,
    comment?: string
  ): Promise<void> {
    const testerConfirmation: TesterConfirmation = {
      status,
      respondedAt: new Date(),
      ...(comment && { comment }),
    };

    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);

    // If tester confirms, move to archived. If needs work, back to in-progress
    const newStatus: FeedbackStatus =
      status === "confirmed" ? "archived" :
      status === "needs-work" ? "in-progress" :
      "in-review"; // Keep in review if no-response

    await updateDoc(docRef, {
      testerConfirmation,
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  }

  async countPendingConfirmations(userId: string): Promise<number> {
    const q = query(
      collection(firestore, COLLECTION_NAME),
      where("userId", "==", userId),
      where("status", "==", "in-review"),
      where("testerConfirmation.status", "==", "pending")
    );

    // Firestore doesn't support querying nested fields well,
    // so we'll do a simpler approach: get in-review items and filter client-side
    const inReviewQuery = query(
      collection(firestore, COLLECTION_NAME),
      where("userId", "==", userId),
      where("status", "==", "in-review")
    );

    const snapshot = await getDocs(inReviewQuery);

    // Count items where testerConfirmation is pending or doesn't exist yet
    let count = 0;
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const confirmation = data["testerConfirmation"] as TesterConfirmation | undefined;
      if (!confirmation || confirmation.status === "pending") {
        count++;
      }
    });

    return count;
  }

  /**
   * Create a notification for a tester
   * Uses NotificationTriggerService to respect user preferences
   */
  private async createNotification(
    userId: string,
    feedbackId: string,
    feedbackTitle: string,
    type: NotificationType,
    message: string
  ): Promise<void> {
    const admin = authStore.user;
    if (!admin) return;

    // Use NotificationTriggerService which checks user preferences
    await notificationTriggerService.createFeedbackNotification(
      userId,
      type as any, // Type assertion needed due to NotificationType union
      feedbackId,
      feedbackTitle,
      message,
      admin.uid,
      admin.displayName || admin.email || "Admin"
    );
  }

  /**
   * Notify tester when status changes to resolved
   */
  async notifyTesterResolved(
    feedbackId: string,
    message?: string
  ): Promise<void> {
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) return;

    await this.createNotification(
      feedback.userId,
      feedbackId,
      feedback.title,
      "feedback-resolved",
      message || "Your feedback has been addressed! Please confirm if it works for you."
    );

    // Initialize tester confirmation as pending
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await updateDoc(docRef, {
      "testerConfirmation.status": "pending",
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Subscribe to real-time feedback updates
   * Returns an unsubscribe function
   *
   * This method ensures fresh data by:
   * 1. First fetching directly from the server (bypassing cache)
   * 2. Then setting up a real-time listener for ongoing updates
   */
  subscribeToFeedback(
    onUpdate: (items: FeedbackItem[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    // Query all non-archived feedback ordered by createdAt
    // We fetch all to support the kanban view
    const q = query(
      collection(firestore, COLLECTION_NAME),
      orderBy("createdAt", "desc"),
      limit(200) // Reasonable limit for admin dashboard
    );

    let unsubscribed = false;

    // First, do an initial server fetch to ensure fresh data
    // getDocsFromServer bypasses the local cache entirely
    getDocsFromServer(q)
      .then((snapshot) => {
        if (unsubscribed) return;

        const items: FeedbackItem[] = [];
        snapshot.docs.forEach((docSnap) => {
          try {
            const item = this.mapDocToFeedbackItem(docSnap.id, docSnap.data());
            items.push(item);
          } catch (err) {
            console.error(`Failed to map feedback item ${docSnap.id}:`, err);
          }
        });
        onUpdate(items);
      })
      .catch((error) => {
        console.error("Initial feedback fetch error:", error);
        // Continue to set up the listener even if initial fetch fails
        // The listener will provide cached data and retry server connection
      });

    // Then set up the real-time listener for ongoing updates
    // includeMetadataChanges: false means we only get notified of actual data changes
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: false },
      (snapshot) => {
        if (unsubscribed) return;

        const items: FeedbackItem[] = [];
        snapshot.docs.forEach((docSnap) => {
          try {
            const item = this.mapDocToFeedbackItem(docSnap.id, docSnap.data());
            items.push(item);
          } catch (err) {
            console.error(`Failed to map feedback item ${docSnap.id}:`, err);
          }
        });
        onUpdate(items);
      },
      (error) => {
        console.error("Feedback subscription error:", error);
        onError?.(error);
      }
    );

    // Return combined unsubscribe function
    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }

  async updateUserFeedback(
    feedbackId: string,
    updates: Partial<Pick<FeedbackItem, "type" | "description">>,
    appendMode: boolean = false
  ): Promise<FeedbackItem> {
    const user = authStore.user;
    if (!user) {
      throw new Error("User must be authenticated to update feedback");
    }

    // Get the feedback item to verify ownership
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Verify the user owns this feedback
    if (feedback.userId !== user.uid) {
      throw new Error("You can only edit your own feedback");
    }

    // Only allow editing for certain statuses
    const editableStatuses = ["new", "in-progress", "in-review"];
    if (!editableStatuses.includes(feedback.status)) {
      throw new Error("Cannot edit feedback that has been completed or archived");
    }

    // If not "new", only allow appending (not full replacement)
    if (feedback.status !== "new" && !appendMode) {
      throw new Error("Can only add notes to feedback that is already being processed");
    }

    // Build update object
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (feedback.status === "new") {
      // Full edit mode - can change type and replace description
      if (updates.type !== undefined) {
        updateData["type"] = updates.type;
      }
      if (updates.description !== undefined) {
        updateData["description"] = updates.description;
        // Also regenerate title from description
        updateData["title"] = this.generateTitleFromDescription(updates.description);
      }
    } else {
      // Append mode - can only add notes to the end
      if (updates.description !== undefined && updates.description.trim()) {
        const timestamp = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const appendedNote = `\n\n---\n**User update (${timestamp}):**\n${updates.description.trim()}`;
        updateData["description"] = feedback.description + appendedNote;
      }
      // Type changes not allowed in append mode
    }

    await updateDoc(docRef, updateData);

    // Return the updated item
    const updatedDoc = await getDoc(docRef);
    return this.mapDocToFeedbackItem(updatedDoc.id, updatedDoc.data()!);
  }

  private mapDocToFeedbackItem(
    id: string,
    data: Record<string, unknown>
  ): FeedbackItem {
    // Map admin response if present
    const adminResponseData = data["adminResponse"] as Record<string, unknown> | undefined;
    const adminResponse: AdminResponse | undefined = adminResponseData
      ? {
          message: adminResponseData["message"] as string,
          respondedAt: (adminResponseData["respondedAt"] as Timestamp)?.toDate() || new Date(),
          respondedBy: adminResponseData["respondedBy"] as string,
        }
      : undefined;

    // Map tester confirmation if present
    const confirmationData = data["testerConfirmation"] as Record<string, unknown> | undefined;
    const testerConfirmation: TesterConfirmation | undefined = confirmationData
      ? {
          status: confirmationData["status"] as TesterConfirmationStatus,
          comment: confirmationData["comment"] as string | undefined,
          respondedAt: (confirmationData["respondedAt"] as Timestamp)?.toDate(),
        }
      : undefined;

    return {
      id,
      userId: data["userId"] as string,
      userEmail: data["userEmail"] as string,
      userDisplayName: data["userDisplayName"] as string,
      userPhotoURL: data["userPhotoURL"] as string | undefined,
      type: data["type"] as FeedbackItem["type"],
      title: data["title"] as string,
      description: data["description"] as string,
      priority: data["priority"] as FeedbackItem["priority"],
      imageUrls: data["imageUrls"] as string[] | undefined,
      capturedModule: data["capturedModule"] as string,
      capturedTab: data["capturedTab"] as string,
      status: (data["status"] as FeedbackStatus) || "new",
      adminNotes: data["adminNotes"] as string | undefined,
      adminResponse,
      testerConfirmation,
      createdAt: (data["createdAt"] as Timestamp)?.toDate() || new Date(),
      updatedAt: (data["updatedAt"] as Timestamp)?.toDate() || undefined,
      fixedInVersion: data["fixedInVersion"] as string | undefined,
      archivedAt: (data["archivedAt"] as Timestamp)?.toDate() || undefined,
      deferredUntil: (data["deferredUntil"] as Timestamp)?.toDate() || undefined,
      reactivatedAt: (data["reactivatedAt"] as Timestamp)?.toDate() || undefined,
      reactivatedFrom: (data["reactivatedFrom"] as Timestamp)?.toDate() || undefined,
      isDeleted: data["isDeleted"] as boolean | undefined,
      deletedAt: (data["deletedAt"] as Timestamp)?.toDate() || undefined,
      deletedBy: data["deletedBy"] as string | undefined,
    };
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();
