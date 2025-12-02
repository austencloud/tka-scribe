/**
 * Feedback Manage State
 *
 * State management for the feedback management tab (admin view).
 */

import type {
  FeedbackItem,
  FeedbackFilterOptions,
  FeedbackStatus,
} from "../domain/models/feedback-models";
import { feedbackService } from "../services/implementations/FeedbackService";

const PAGE_SIZE = 20;

/**
 * Creates feedback manage state
 */
export function createFeedbackManageState() {
  // List state
  let items = $state<FeedbackItem[]>([]);
  let isLoading = $state(false);
  let hasMore = $state(true);
  let lastDocId = $state<string | null>(null);
  let error = $state<string | null>(null);

  // Filter state
  let filters = $state<FeedbackFilterOptions>({
    type: "all",
    status: "all",
    priority: "all",
  });

  // Search query
  let searchQuery = $state("");

  // Selected item for detail view
  let selectedItem = $state<FeedbackItem | null>(null);

  // Filtered items based on search query
  const filteredItems = $derived(
    searchQuery.trim()
      ? items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.userDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items
  );

  // Actions
  async function loadFeedback(reset = false) {
    if (isLoading) return;
    if (!reset && !hasMore) return;

    isLoading = true;
    error = null;

    try {
      const result = await feedbackService.loadFeedback(
        filters,
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
      console.error("Failed to load feedback:", err);
      error = "Failed to load feedback";
    } finally {
      isLoading = false;
    }
  }

  function setFilter<K extends keyof FeedbackFilterOptions>(
    key: K,
    value: FeedbackFilterOptions[K]
  ) {
    filters = { ...filters, [key]: value };
    // Reset and reload when filter changes
    items = [];
    lastDocId = null;
    hasMore = true;
    void loadFeedback(true);
  }

  function selectItem(item: FeedbackItem | null) {
    selectedItem = item;
  }

  async function updateStatus(feedbackId: string, status: FeedbackStatus) {
    try {
      await feedbackService.updateStatus(feedbackId, status);
      // Update local state
      items = items.map((item) =>
        item.id === feedbackId ? { ...item, status, updatedAt: new Date() } : item
      );
      if (selectedItem?.id === feedbackId) {
        selectedItem = { ...selectedItem, status, updatedAt: new Date() };
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      throw err;
    }
  }

  async function updateAdminNotes(feedbackId: string, notes: string) {
    try {
      await feedbackService.updateAdminNotes(feedbackId, notes);
      // Update local state
      items = items.map((item) =>
        item.id === feedbackId
          ? { ...item, adminNotes: notes, updatedAt: new Date() }
          : item
      );
      if (selectedItem?.id === feedbackId) {
        selectedItem = { ...selectedItem, adminNotes: notes, updatedAt: new Date() };
      }
    } catch (err) {
      console.error("Failed to update admin notes:", err);
      throw err;
    }
  }

  async function deleteFeedback(feedbackId: string) {
    try {
      await feedbackService.deleteFeedback(feedbackId);
      // Remove from local state
      items = items.filter((item) => item.id !== feedbackId);
      if (selectedItem?.id === feedbackId) {
        selectedItem = null;
      }
    } catch (err) {
      console.error("Failed to delete feedback:", err);
      throw err;
    }
  }

  function loadMore() {
    if (!isLoading && hasMore) {
      void loadFeedback(false);
    }
  }

  function setSearchQuery(query: string) {
    searchQuery = query;
  }

  return {
    // State
    get items() {
      return filteredItems;
    },
    get searchQuery() {
      return searchQuery;
    },
    get isLoading() {
      return isLoading;
    },
    get hasMore() {
      return hasMore;
    },
    get error() {
      return error;
    },
    get filters() {
      return filters;
    },
    get selectedItem() {
      return selectedItem;
    },

    // Actions
    loadFeedback,
    setFilter,
    setSearchQuery,
    selectItem,
    updateStatus,
    updateAdminNotes,
    deleteFeedback,
    loadMore,
  };
}

export type FeedbackManageState = ReturnType<typeof createFeedbackManageState>;
