/**
 * FeedbackSubscriptionService
 *
 * Handles real-time feedback subscriptions via Firestore listeners.
 * Ensures fresh data by first fetching from server, then setting up listeners.
 */

import {
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  getDocsFromServer,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreInstance } from "$lib/shared/auth/firebase";
import type { IFeedbackSubscriptionService } from "../contracts/IFeedbackSubscriptionService";
import type { FeedbackItem } from "../../domain/models/feedback-models";
import type { IFeedbackDocumentMapper } from "../contracts/IFeedbackDocumentMapper";
import { feedbackDocumentMapper } from "./FeedbackDocumentMapper";

const COLLECTION_NAME = "feedback";

export class FeedbackSubscriptionService
  implements IFeedbackSubscriptionService
{
  constructor(
    private readonly mapper: IFeedbackDocumentMapper = feedbackDocumentMapper
  ) {}

  subscribeToFeedback(
    onUpdate: (items: FeedbackItem[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    let unsubscribed = false;
    let firestoreUnsubscribe: Unsubscribe | null = null;

    void (async () => {
      const firestore = await getFirestoreInstance();

      const q = query(
        collection(firestore, COLLECTION_NAME),
        orderBy("createdAt", "desc"),
        limit(200)
      );

      // First, do an initial server fetch to ensure fresh data
      getDocsFromServer(q)
        .then((snapshot) => {
          if (unsubscribed) return;

          const items = this.mapSnapshotToItems(snapshot);
          onUpdate(items);
        })
        .catch((error) => {
          console.error("Initial feedback fetch error:", error);
        });

      // Then set up the real-time listener
      firestoreUnsubscribe = onSnapshot(
        q,
        { includeMetadataChanges: false },
        (snapshot) => {
          if (unsubscribed) return;

          const items = this.mapSnapshotToItems(snapshot);
          onUpdate(items);
        },
        (error) => {
          console.error("Feedback subscription error:", error);
          onError?.(error);
        }
      );
    })();

    return () => {
      unsubscribed = true;
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }

  subscribeToUserFeedback(
    userId: string,
    onUpdate: (items: FeedbackItem[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    let unsubscribed = false;
    let firestoreUnsubscribe: Unsubscribe | null = null;

    void (async () => {
      const firestore = await getFirestoreInstance();

      const q = query(
        collection(firestore, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );

      // First, do an initial server fetch to ensure fresh data
      getDocsFromServer(q)
        .then((snapshot) => {
          if (unsubscribed) return;

          const items = this.mapSnapshotToItems(snapshot);
          onUpdate(items);
        })
        .catch((error) => {
          console.error("Initial user feedback fetch error:", error);
        });

      // Then set up the real-time listener
      firestoreUnsubscribe = onSnapshot(
        q,
        { includeMetadataChanges: false },
        (snapshot) => {
          if (unsubscribed) return;

          const items = this.mapSnapshotToItems(snapshot);
          onUpdate(items);
        },
        (error) => {
          console.error("User feedback subscription error:", error);
          onError?.(error);
        }
      );
    })();

    return () => {
      unsubscribed = true;
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
      }
    };
  }

  private mapSnapshotToItems(snapshot: { docs: any[] }): FeedbackItem[] {
    const items: FeedbackItem[] = [];
    snapshot.docs.forEach((docSnap) => {
      try {
        const item = this.mapper.mapDocToFeedbackItem(docSnap.id, docSnap.data());
        items.push(item);
      } catch (err) {
        console.error(`Failed to map feedback item ${docSnap.id}:`, err);
      }
    });
    return items;
  }
}

// Export singleton instance
export const feedbackSubscriptionService = new FeedbackSubscriptionService();
