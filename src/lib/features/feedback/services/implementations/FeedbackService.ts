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
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  startAfter,
  getDoc,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "$lib/shared/auth/firebase";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
import type { IFeedbackService } from "../contracts/IFeedbackService";
import type {
  FeedbackItem,
  FeedbackFormData,
  FeedbackFilterOptions,
  FeedbackStatus,
} from "../../domain/models/feedback-models";

const COLLECTION_NAME = "feedback";

export class FeedbackService implements IFeedbackService {
  async submitFeedback(
    formData: FeedbackFormData,
    capturedModule: string,
    capturedTab: string
  ): Promise<string> {
    const user = authStore.user;
    if (!user) {
      throw new Error("User must be authenticated to submit feedback");
    }

    const feedbackData = {
      // User info
      userId: user.uid,
      userEmail: user.email || "",
      userDisplayName: user.displayName || user.email || "Anonymous",

      // Feedback content
      type: formData.type,
      title: formData.title,
      description: formData.description,
      priority: formData.priority || null,

      // Context
      capturedModule,
      capturedTab,
      reportedModule: formData.reportedModule || null,
      reportedTab: formData.reportedTab || null,

      // Admin management
      status: "new" as FeedbackStatus,
      adminNotes: null,

      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: null,
    };

    const docRef = await addDoc(collection(firestore, COLLECTION_NAME), feedbackData);
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
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  }

  async updateAdminNotes(feedbackId: string, notes: string): Promise<void> {
    const docRef = doc(firestore, COLLECTION_NAME, feedbackId);
    await updateDoc(docRef, {
      adminNotes: notes,
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
      | "reportedModule"
      | "reportedTab"
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
    if (updates.reportedModule !== undefined) updateData["reportedModule"] = updates.reportedModule || null;
    if (updates.reportedTab !== undefined) updateData["reportedTab"] = updates.reportedTab || null;

    await updateDoc(docRef, updateData);
  }

  private mapDocToFeedbackItem(
    id: string,
    data: Record<string, unknown>
  ): FeedbackItem {
    return {
      id,
      userId: data["userId"] as string,
      userEmail: data["userEmail"] as string,
      userDisplayName: data["userDisplayName"] as string,
      type: data["type"] as FeedbackItem["type"],
      title: data["title"] as string,
      description: data["description"] as string,
      priority: data["priority"] as FeedbackItem["priority"],
      capturedModule: data["capturedModule"] as string,
      capturedTab: data["capturedTab"] as string,
      reportedModule: data["reportedModule"] as string | undefined,
      reportedTab: data["reportedTab"] as string | undefined,
      status: (data["status"] as FeedbackStatus) || "new",
      adminNotes: data["adminNotes"] as string | undefined,
      createdAt: (data["createdAt"] as Timestamp)?.toDate() || new Date(),
      updatedAt: (data["updatedAt"] as Timestamp)?.toDate() || undefined,
    };
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();
