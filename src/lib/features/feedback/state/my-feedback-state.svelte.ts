/**
 * My Feedback State
 *
 * State management for the tester's personal feedback view.
 * Shows their submitted feedback and pending confirmations.
 * Supports preview mode for admin user viewing.
 */

import type { FeedbackItem, FeedbackType } from "../domain/models/feedback-models";
import { feedbackService } from "../services/implementations/FeedbackService";
import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
import { toast } from "$lib/shared/toast";

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
    // Use previewed user ID when preview mode is active, otherwise use actual user
    const effectiveUserId = userPreviewState.isActive && userPreviewState.data.profile
      ? userPreviewState.data.profile.uid
      : authStore.user?.uid;

    if (!effectiveUserId) return;
    if (isLoading) return;
    if (!reset && !hasMore) return;

    isLoading = true;
    error = null;

    try {
      const result = await feedbackService.loadUserFeedback(
        effectiveUserId,
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
    } catch (err) {
      console.error("Failed to load my feedback:", err);
      error = "Failed to load your feedback";
    } finally {
      isLoading = false;
    }
  }

  function selectItem(item: FeedbackItem | null) {
    selectedItem = item;
  }

  // Update an item (user editing their own feedback)
  async function updateItem(
    feedbackId: string,
    updates: { type?: FeedbackType; description?: string },
    appendMode: boolean = false
  ): Promise<FeedbackItem> {
    // Block writes in preview mode
    if (userPreviewState.isActive) {
      toast.warning("Cannot edit feedback in preview mode");
      throw new Error("Cannot edit in preview mode");
    }

    const updatedItem = await feedbackService.updateUserFeedback(feedbackId, updates, appendMode);

    // Update in local state
    const index = items.findIndex((i) => i.id === feedbackId);
    if (index !== -1) {
      items = [...items.slice(0, index), updatedItem, ...items.slice(index + 1)];
    }

    // Update selected item if it's the one being edited
    if (selectedItem?.id === feedbackId) {
      selectedItem = updatedItem;
    }

    return updatedItem;
  }

  // Cleanup function
  function cleanup() {
    items = [];
    selectedItem = null;
    lastDocId = null;
    hasMore = true;
  }

  return {
    // State (getters)
    get items() { return items; },
    get isLoading() { return isLoading; },
    get hasMore() { return hasMore; },
    get error() { return error; },
    get selectedItem() { return selectedItem; },

    // Derived
    get inProgress() { return inProgress; },
    get completed() { return completed; },
    get pending() { return pending; },

    // Actions
    loadMyFeedback,
    selectItem,
    updateItem,
    cleanup,
  };
}

export type MyFeedbackState = ReturnType<typeof createMyFeedbackState>;
