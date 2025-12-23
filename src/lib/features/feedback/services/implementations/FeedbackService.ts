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
import {
  getFirestoreInstance,
  getStorageInstance,
} from "$lib/shared/auth/firebase";
import { trackXP } from "$lib/shared/gamification/init/gamification-initializer";
import type { FirebaseStorage } from "firebase/storage";
import { authState } from "$lib/shared/auth/state/authState.svelte";
import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
import type { IFeedbackService } from "../contracts/IFeedbackService";
import type {
  FeedbackItem,
  FeedbackFormData,
  FeedbackFilterOptions,
  FeedbackStatus,
  TesterConfirmationStatus,
  AdminResponse,
  TesterConfirmation,
  DeviceContext,
  StatusHistoryEntry,
} from "../../domain/models/feedback-models";
import {
  isFeedbackStatus,
  isFeedbackType,
} from "../../domain/models/feedback-models";
import type { NotificationType } from "../../domain/models/notification-models";
import { notificationTriggerService } from "./NotificationTriggerService";
import { conversationService } from "$lib/shared/messaging/services/implementations/ConversationService";
import { messagingService } from "$lib/shared/messaging/services/implementations/MessagingService";
import type { MessageAttachment } from "$lib/shared/messaging/domain/models/message-models";
import { captureDeviceContext } from "../../utils/device-context-capturer";

// Admin user ID for feedback conversations (austencloud)
const ADMIN_USER_ID = "PBp3GSBO6igCKPwJyLZNmVEmamI3";

const COLLECTION_NAME = "feedback";

export class FeedbackService implements IFeedbackService {
  /**
   * Generate a title from description if none provided
   */
  private generateTitleFromDescription(description: string): string {
    const trimmed = description.trim();

    // Try to get first sentence (up to . ! or ?)
    const sentenceMatch = trimmed.match(/^[^.!?]+[.!?]?/);
    if (
      sentenceMatch &&
      sentenceMatch[0].length >= 10 &&
      sentenceMatch[0].length <= 80
    ) {
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
    const { ref, uploadBytes, getDownloadURL } = await import(
      "firebase/storage"
    );
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
    const firestore = await getFirestoreInstance();
    const user = authState.user;
    if (!user) {
      throw new Error("User must be authenticated to submit feedback");
    }

    // Use effective user (respects preview mode for proper attribution)
    const effectiveUser =
      userPreviewState.isActive && userPreviewState.data.profile
        ? {
            uid: userPreviewState.data.profile.uid,
            email: userPreviewState.data.profile.email || "",
            displayName:
              userPreviewState.data.profile.displayName || "Unknown User",
            photoURL: userPreviewState.data.profile.photoURL || null,
          }
        : {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || user.email || "Anonymous",
            photoURL: user.photoURL || null,
          };

    // Generate title from description if not provided
    const title =
      formData.title?.trim() ||
      this.generateTitleFromDescription(formData.description);

    // Capture device context
    const deviceContext = captureDeviceContext(capturedModule, capturedTab);

    const feedbackData = {
      // User info (use effective user for proper attribution in preview mode)
      userId: effectiveUser.uid,
      userEmail: effectiveUser.email,
      userDisplayName: effectiveUser.displayName,
      userPhotoURL: effectiveUser.photoURL,

      // Feedback content
      type: formData.type,
      title,
      description: formData.description,
      // priority is admin-assigned, not user-provided
      priority: null,

      // Context (auto-captured, not user-reported)
      capturedModule,
      capturedTab,
      deviceContext,

      // Admin management
      status: "new" as FeedbackStatus,
      adminNotes: null,

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: null,
    };

    // Create document first to get ID
    const docRef = await addDoc(
      collection(firestore, COLLECTION_NAME),
      feedbackData
    );

    // Upload images if provided
    if (images && images.length > 0) {
      const imageUrls = await Promise.all(
        images.map((file) => this.uploadImage(file, docRef.id))
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

    // Send message to admin with feedback attachment (don't await - non-blocking)
    // Use effective user ID (respects preview mode)
    const effectiveUserId =
      userPreviewState.isActive && userPreviewState.data.profile
        ? userPreviewState.data.profile.uid
        : user.uid;

    // Only send if the effective user is not the admin themselves
    if (effectiveUserId !== ADMIN_USER_ID) {
      console.log(
        "[FeedbackService] User is not admin, sending feedback message...",
        {
          effectiveUserId,
          authUserId: user.uid,
          adminId: ADMIN_USER_ID,
          isPreviewMode: userPreviewState.isActive,
          feedbackId: docRef.id,
        }
      );
      this.sendFeedbackMessage(
        docRef.id,
        title,
        formData.type,
        formData.description
      )
        .then(() =>
          console.log("[FeedbackService] ✓ Feedback message sent successfully")
        )
        .catch((err) =>
          console.error(
            "[FeedbackService] ✗ Failed to send feedback message:",
            err
          )
        );
    } else {
      console.log(
        "[FeedbackService] User is admin, skipping feedback message",
        {
          effectiveUserId,
          isPreviewMode: userPreviewState.isActive,
        }
      );
    }

    return docRef.id;
  }

  /**
   * Send a message to admin with the feedback as an attachment
   * Creates or uses existing conversation with admin
   */
  private async sendFeedbackMessage(
    feedbackId: string,
    title: string,
    type: FeedbackFormData["type"],
    description: string
  ): Promise<void> {
    try {
      console.log(
        "[FeedbackService] Getting/creating conversation with admin..."
      );

      // Get or create conversation with admin
      const { conversation, isNew } =
        await conversationService.getOrCreateConversation(ADMIN_USER_ID);

      console.log("[FeedbackService] Conversation ready:", {
        conversationId: conversation.id,
        isNew,
        participants: conversation.participants,
      });

      // Create feedback attachment
      const feedbackAttachment: MessageAttachment = {
        type: "feedback",
        url: `/feedback/${feedbackId}`, // Internal link
        metadata: {
          feedbackId,
          feedbackTitle: title,
          feedbackType: type,
          feedbackStatus: "new",
          feedbackDescription: description.slice(0, 200), // Preview only
        },
      };

      console.log(
        "[FeedbackService] Sending message with feedback attachment..."
      );

      // Send message with attachment
      await messagingService.sendMessage({
        conversationId: conversation.id,
        content: "[Feedback submitted]",
        attachments: [feedbackAttachment],
      });

      console.log(
        "[FeedbackService] ✓ Message sent to conversation:",
        conversation.id
      );
    } catch (error) {
      console.error(
        "[FeedbackService] ✗ Failed to send feedback message:",
        error
      );
      throw error;
    }
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
    const firestore = await getFirestoreInstance();
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
    const firestore = await getFirestoreInstance();
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.mapDocToFeedbackItem(docSnap.id, docSnap.data());
  }

  async updateStatus(
    feedbackId: string,
    status: FeedbackStatus
  ): Promise<void> {
    const firestore = await getFirestoreInstance();
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);

    // Get current feedback to check existing status and history
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
    };

    // Set archivedAt when moving to archived status
    if (status === "archived") {
      updateData["archivedAt"] = serverTimestamp();
    }

    // Track status change in history (with 60s debounce)
    const shouldRecordStatusChange = this.shouldRecordStatusChange(
      feedback.statusHistory || [],
      feedback.status,
      status
    );

    if (shouldRecordStatusChange) {
      const newEntry = {
        status,
        timestamp: new Date(),
        fromStatus: feedback.status,
      };

      const updatedHistory = [...(feedback.statusHistory || []), newEntry];
      updateData["statusHistory"] = updatedHistory;
    }

    await updateDoc(docRef, updateData);
  }

  /**
   * Check if status change should be recorded in history
   * Skip if same transition happened within last 60 seconds
   */
  private shouldRecordStatusChange(
    history: FeedbackItem["statusHistory"] = [],
    fromStatus: FeedbackStatus,
    toStatus: FeedbackStatus
  ): boolean {
    // Always record if there's no history
    if (history.length === 0) return true;

    // Get the most recent entry
    const lastEntry = history[history.length - 1];
    if (!lastEntry) return true;

    // Check if this is the same transition
    const isSameTransition =
      lastEntry.fromStatus === fromStatus && lastEntry.status === toStatus;

    if (!isSameTransition) return true;

    // Check if last entry was within 60 seconds
    const now = new Date();
    const timeSinceLastEntry = now.getTime() - lastEntry.timestamp.getTime();
    const DEBOUNCE_MS = 60 * 1000; // 60 seconds

    // Skip if same transition happened within debounce window
    return timeSinceLastEntry >= DEBOUNCE_MS;
  }

  async updateAdminNotes(feedbackId: string, notes: string): Promise<void> {
    const firestore = await getFirestoreInstance();
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await updateDoc(docRef, {
      adminNotes: notes,
      updatedAt: serverTimestamp(),
    });
  }

  async deferFeedback(
    feedbackId: string,
    deferredUntil: Date,
    notes: string
  ): Promise<void> {
    const firestore = await getFirestoreInstance();
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
    const firestore = await getFirestoreInstance();
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await deleteDoc(docRef);
  }

  async updateFeedback(
    feedbackId: string,
    updates: Partial<
      Pick<FeedbackItem, "type" | "title" | "description" | "priority">
    >
  ): Promise<void> {
    const firestore = await getFirestoreInstance();
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);

    // Build update object, converting undefined to null for Firestore
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (updates.type !== undefined) updateData["type"] = updates.type;
    if (updates.title !== undefined) updateData["title"] = updates.title;
    if (updates.description !== undefined)
      updateData["description"] = updates.description;
    if (updates.priority !== undefined)
      updateData["priority"] = updates.priority || null;

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
    const firestore = await getFirestoreInstance();
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
    const firestore = await getFirestoreInstance();
    const user = authState.user;
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
    const firestore = await getFirestoreInstance();
    const testerConfirmation: TesterConfirmation = {
      status,
      respondedAt: new Date(),
      ...(comment && { comment }),
    };

    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);

    // If tester confirms, move to archived. If needs work, back to in-progress
    const newStatus: FeedbackStatus =
      status === "confirmed"
        ? "archived"
        : status === "needs-work"
          ? "in-progress"
          : "in-review"; // Keep in review if no-response

    await updateDoc(docRef, {
      testerConfirmation,
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  }

  async countPendingConfirmations(userId: string): Promise<number> {
    const firestore = await getFirestoreInstance();
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
      const confirmation = data["testerConfirmation"] as
        | TesterConfirmation
        | undefined;
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
    const admin = authState.user;
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
    const firestore = await getFirestoreInstance();
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) return;

    await this.createNotification(
      feedback.userId,
      feedbackId,
      feedback.title,
      "feedback-resolved",
      message ||
        "Your feedback has been addressed! Please confirm if it works for you."
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
    let unsubscribed = false;
    let firestoreUnsubscribe: Unsubscribe | null = null;

    // Initialize subscription asynchronously
    void (async () => {
      const firestore = await getFirestoreInstance();

      // Query all non-archived feedback ordered by createdAt
      // We fetch all to support the kanban view
      const q = query(
        collection(firestore, COLLECTION_NAME),
        orderBy("createdAt", "desc"),
        limit(200) // Reasonable limit for admin dashboard
      );

      // First, do an initial server fetch to ensure fresh data
      // getDocsFromServer bypasses the local cache entirely
      getDocsFromServer(q)
        .then((snapshot) => {
          if (unsubscribed) return;

          const items: FeedbackItem[] = [];
          snapshot.docs.forEach((docSnap) => {
            try {
              const item = this.mapDocToFeedbackItem(
                docSnap.id,
                docSnap.data()
              );
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
      firestoreUnsubscribe = onSnapshot(
        q,
        { includeMetadataChanges: false },
        (snapshot) => {
          if (unsubscribed) return;

          const items: FeedbackItem[] = [];
          snapshot.docs.forEach((docSnap) => {
            try {
              const item = this.mapDocToFeedbackItem(
                docSnap.id,
                docSnap.data()
              );
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
    })();

    // Return combined unsubscribe function
    return () => {
      unsubscribed = true;
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }

  async updateUserFeedback(
    feedbackId: string,
    updates: Partial<Pick<FeedbackItem, "type" | "description">>,
    appendMode: boolean = false
  ): Promise<FeedbackItem> {
    const firestore = await getFirestoreInstance();
    const user = authState.user;
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
      throw new Error(
        "Cannot edit feedback that has been completed or archived"
      );
    }

    // If not "new", only allow appending (not full replacement)
    if (feedback.status !== "new" && !appendMode) {
      throw new Error(
        "Can only add notes to feedback that is already being processed"
      );
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
        updateData["title"] = this.generateTitleFromDescription(
          updates.description
        );
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

  /**
   * Subscribe to real-time updates for a specific user's feedback
   * Returns an unsubscribe function
   */
  subscribeToUserFeedback(
    userId: string,
    onUpdate: (items: FeedbackItem[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    let unsubscribed = false;
    let firestoreUnsubscribe: Unsubscribe | null = null;

    // Initialize subscription asynchronously
    void (async () => {
      const firestore = await getFirestoreInstance();

      // Query all feedback for this user, ordered by createdAt
      const q = query(
        collection(firestore, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      // First, do an initial server fetch to ensure fresh data
      getDocsFromServer(q)
        .then((snapshot) => {
          if (unsubscribed) return;

          const items: FeedbackItem[] = [];
          snapshot.docs.forEach((docSnap) => {
            try {
              const item = this.mapDocToFeedbackItem(
                docSnap.id,
                docSnap.data()
              );
              items.push(item);
            } catch (err) {
              console.error(`Failed to map feedback item ${docSnap.id}:`, err);
            }
          });
          onUpdate(items);
        })
        .catch((error) => {
          console.error("Initial user feedback fetch error:", error);
          // Continue to set up the listener even if initial fetch fails
        });

      // Then set up the real-time listener for ongoing updates
      firestoreUnsubscribe = onSnapshot(
        q,
        { includeMetadataChanges: false },
        (snapshot) => {
          if (unsubscribed) return;

          const items: FeedbackItem[] = [];
          snapshot.docs.forEach((docSnap) => {
            try {
              const item = this.mapDocToFeedbackItem(
                docSnap.id,
                docSnap.data()
              );
              items.push(item);
            } catch (err) {
              console.error(`Failed to map feedback item ${docSnap.id}:`, err);
            }
          });
          onUpdate(items);
        },
        (error) => {
          console.error("User feedback subscription error:", error);
          onError?.(error);
        }
      );
    })();

    // Return combined unsubscribe function
    return () => {
      unsubscribed = true;
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }

  async deleteUserFeedback(feedbackId: string): Promise<void> {
    const firestore = await getFirestoreInstance();
    const user = authState.user;
    if (!user) {
      throw new Error("User must be authenticated to delete feedback");
    }

    // Get the feedback item to verify ownership
    const feedback = await this.getFeedback(feedbackId);
    if (!feedback) {
      throw new Error("Feedback not found");
    }

    // Verify the user owns this feedback
    if (feedback.userId !== user.uid) {
      throw new Error("You can only delete your own feedback");
    }

    // Only allow deletion when status is "new" (not yet picked up)
    if (feedback.status !== "new") {
      throw new Error("Cannot delete feedback that is already being processed");
    }

    // Delete the document
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await deleteDoc(docRef);
  }

  private mapDocToFeedbackItem(
    id: string,
    data: Record<string, unknown>
  ): FeedbackItem {
    // Map admin response if present
    const adminResponseData = data["adminResponse"] as
      | Record<string, unknown>
      | undefined;
    const adminResponse: AdminResponse | undefined = adminResponseData
      ? {
          message: adminResponseData["message"] as string,
          respondedAt:
            (adminResponseData["respondedAt"] as Timestamp)?.toDate() ||
            new Date(),
          respondedBy: adminResponseData["respondedBy"] as string,
        }
      : undefined;

    // Map tester confirmation if present
    const confirmationData = data["testerConfirmation"] as
      | Record<string, unknown>
      | undefined;
    const testerConfirmation: TesterConfirmation | undefined = confirmationData
      ? {
          status: confirmationData["status"] as TesterConfirmationStatus,
          comment: confirmationData["comment"] as string | undefined,
          respondedAt: (confirmationData["respondedAt"] as Timestamp)?.toDate(),
        }
      : undefined;

    // Map device context if present
    const deviceContextData = data["deviceContext"] as
      | Record<string, unknown>
      | undefined;
    const deviceContext: DeviceContext | undefined = deviceContextData
      ? {
          userAgent: deviceContextData["userAgent"] as string,
          platform: deviceContextData["platform"] as string,
          isTouchDevice: deviceContextData["isTouchDevice"] as boolean,
          viewportWidth: deviceContextData["viewportWidth"] as number,
          viewportHeight: deviceContextData["viewportHeight"] as number,
          screenWidth: deviceContextData["screenWidth"] as number,
          screenHeight: deviceContextData["screenHeight"] as number,
          devicePixelRatio: deviceContextData["devicePixelRatio"] as number,
          appVersion: deviceContextData["appVersion"] as string,
          currentModule: deviceContextData["currentModule"] as
            | string
            | undefined,
          currentTab: deviceContextData["currentTab"] as string | undefined,
          capturedAt:
            (deviceContextData["capturedAt"] as Timestamp)?.toDate() ||
            new Date(),
        }
      : undefined;

    // Map status history if present
    const statusHistoryData = data["statusHistory"] as
      | Array<Record<string, unknown>>
      | undefined;
    const statusHistory: StatusHistoryEntry[] | undefined =
      statusHistoryData?.map((entry) => ({
        status: isFeedbackStatus(entry["status"]) ? entry["status"] : "new",
        timestamp: (entry["timestamp"] as Timestamp)?.toDate() || new Date(),
        fromStatus: isFeedbackStatus(entry["fromStatus"])
          ? entry["fromStatus"]
          : undefined,
      }));

    const type = isFeedbackType(data["type"]) ? data["type"] : "general";
    const status = isFeedbackStatus(data["status"]) ? data["status"] : "new";

    return {
      id,
      userId: data["userId"] as string,
      userEmail: data["userEmail"] as string,
      userDisplayName: data["userDisplayName"] as string,
      userPhotoURL: data["userPhotoURL"] as string | undefined,
      type,
      title: data["title"] as string,
      description: data["description"] as string,
      priority: data["priority"] as FeedbackItem["priority"],
      imageUrls: data["imageUrls"] as string[] | undefined,
      capturedModule: data["capturedModule"] as string,
      capturedTab: data["capturedTab"] as string,
      deviceContext,
      status,
      adminNotes: data["adminNotes"] as string | undefined,
      resolutionNotes: data["resolutionNotes"] as string | undefined,
      adminResponse,
      testerConfirmation,
      createdAt: (data["createdAt"] as Timestamp)?.toDate() || new Date(),
      updatedAt: (data["updatedAt"] as Timestamp)?.toDate() || undefined,
      fixedInVersion: data["fixedInVersion"] as string | undefined,
      archivedAt: (data["archivedAt"] as Timestamp)?.toDate() || undefined,
      deferredUntil:
        (data["deferredUntil"] as Timestamp)?.toDate() || undefined,
      reactivatedAt:
        (data["reactivatedAt"] as Timestamp)?.toDate() || undefined,
      reactivatedFrom:
        (data["reactivatedFrom"] as Timestamp)?.toDate() || undefined,
      statusHistory,
      isDeleted: data["isDeleted"] as boolean | undefined,
      deletedAt: (data["deletedAt"] as Timestamp)?.toDate() || undefined,
      deletedBy: data["deletedBy"] as string | undefined,
    };
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();
