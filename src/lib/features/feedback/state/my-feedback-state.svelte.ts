/**
 * My Feedback State
 *
 * State management for the tester's personal feedback view.
 * Shows their submitted feedback and pending confirmations.
 */

import type { FeedbackItem } from "../domain/models/feedback-models";
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
    cleanup,
  };
}

export type MyFeedbackState = ReturnType<typeof createMyFeedbackState>;
