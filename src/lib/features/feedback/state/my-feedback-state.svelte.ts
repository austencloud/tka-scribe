/**
 * My Feedback State
 *
 * State management for the tester's personal feedback view.
 * Shows their submitted feedback and pending confirmations.
 */

import type {
  FeedbackItem,
  TesterConfirmationStatus,
} from "../domain/models/feedback-models";
import { feedbackService } from "../services/implementations/FeedbackService";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

const PAGE_SIZE = 20;

/**
 * Creates my feedback state for testers
 */
export function createMyFeedbackState() {
  // List state
  let items = $state<FeedbackItem[]>([]);
  let isLoading = $state(false);
  let hasMore = $state(true);
  let lastDocId = $state<string | null>(null);
  let error = $state<string | null>(null);

  // Selected item for detail view
  let selectedItem = $state<FeedbackItem | null>(null);

  // Confirmation in progress
  let isConfirming = $state(false);

  // Pending confirmation count
  let pendingCount = $state(0);

  // Derived: Items needing confirmation (resolved status, no confirmation yet)
  const needsConfirmation = $derived(
    items.filter(
      (item) =>
        item.status === "resolved" &&
        (!item.testerConfirmation || item.testerConfirmation.status === "pending")
    )
  );

  // Derived: Items in progress
  const inProgress = $derived(
    items.filter((item) => item.status === "in-progress" || item.status === "in-review")
  );

  // Derived: Completed items
  const completed = $derived(
    items.filter((item) => item.status === "archived")
  );

  // Derived: New/pending items
  const pending = $derived(
    items.filter((item) => item.status === "new")
  );

  // Actions
  async function loadMyFeedback(reset = false) {
    const user = authStore.user;
    if (!user) return;
    if (isLoading) return;
    if (!reset && !hasMore) return;

    isLoading = true;
    error = null;

    try {
      const result = await feedbackService.loadUserFeedback(
        user.uid,
        PAGE_SIZE,
        reset ? undefined : lastDocId ?? undefined
      );

      if (reset) {
        items = result.items;
      } else {
        items = [...items, ...result.items];
      }

      lastDocId = result.lastDocId;
      hasMore = result.hasMore;

      // Update pending count
      await refreshPendingCount();
    } catch (err) {
      console.error("Failed to load my feedback:", err);
      error = "Failed to load your feedback";
    } finally {
      isLoading = false;
    }
  }

  async function refreshPendingCount() {
    const user = authStore.user;
    if (!user) return;

    try {
      pendingCount = await feedbackService.countPendingConfirmations(user.uid);
    } catch (err) {
      console.error("Failed to count pending confirmations:", err);
    }
  }

  function selectItem(item: FeedbackItem | null) {
    selectedItem = item;
  }

  async function confirmFeedback(
    feedbackId: string,
    status: TesterConfirmationStatus,
    comment?: string
  ) {
    isConfirming = true;

    try {
      await feedbackService.submitTesterConfirmation(feedbackId, status, comment);

      // Refresh the item in the list
      const updatedItem = await feedbackService.getFeedback(feedbackId);
      if (updatedItem) {
        items = items.map((item) =>
          item.id === feedbackId ? updatedItem : item
        );

        // Update selected if it was the one confirmed
        if (selectedItem?.id === feedbackId) {
          selectedItem = updatedItem;
        }
      }

      // Refresh pending count
      await refreshPendingCount();
    } catch (err) {
      console.error("Failed to confirm feedback:", err);
      throw err;
    } finally {
      isConfirming = false;
    }
  }

  // Cleanup function
  function cleanup() {
    items = [];
    selectedItem = null;
    lastDocId = null;
    hasMore = true;
    pendingCount = 0;
  }

  return {
    // State (getters)
    get items() { return items; },
    get isLoading() { return isLoading; },
    get hasMore() { return hasMore; },
    get error() { return error; },
    get selectedItem() { return selectedItem; },
    get isConfirming() { return isConfirming; },
    get pendingCount() { return pendingCount; },

    // Derived
    get needsConfirmation() { return needsConfirmation; },
    get inProgress() { return inProgress; },
    get completed() { return completed; },
    get pending() { return pending; },

    // Actions
    loadMyFeedback,
    refreshPendingCount,
    selectItem,
    confirmFeedback,
    cleanup,
  };
}

export type MyFeedbackState = ReturnType<typeof createMyFeedbackState>;
