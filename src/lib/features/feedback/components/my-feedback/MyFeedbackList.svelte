<!-- MyFeedbackList - List of tester's own feedback items -->
<script lang="ts">
  import type {
    FeedbackItem,
    FeedbackStatus,
  } from "../../domain/models/feedback-models";
  import {
    STATUS_CONFIG,
    TYPE_CONFIG,
    CONFIRMATION_STATUS_CONFIG,
  } from "../../domain/models/feedback-models";
  import MyFeedbackCard from "./MyFeedbackCard.svelte";

  const { items, selectedItem, onSelect, hasMore, isLoading, onLoadMore } =
    $props<{
      items: FeedbackItem[];
      selectedItem: FeedbackItem | null;
      onSelect: (item: FeedbackItem) => void;
      hasMore: boolean;
      isLoading: boolean;
      onLoadMore: () => void;
    }>();

  // Filter state
  let selectedStatus = $state<FeedbackStatus | "all">("all");

  // Filtered items based on status
  const filteredItems = $derived(
    selectedStatus === "all"
      ? items
      : items.filter((item: FeedbackItem) => item.status === selectedStatus)
  );

  // Status order for sorting
  const statusOrder: FeedbackStatus[] = [
    "new",
    "in-progress",
    "in-review",
    "completed",
    "archived",
  ];

  // Scroll handler for infinite loading
  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    const nearBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 100;

    if (nearBottom && hasMore && !isLoading) {
      onLoadMore();
    }
  }
</script>

<div class="feedback-list" onscroll={handleScroll}>
  <!-- Filter controls -->
  <div class="filter-bar">
    <button
      class="filter-chip"
      class:active={selectedStatus === "all"}
      onclick={() => (selectedStatus = "all")}
    >
      <span>All</span>
      <span class="count">{items.length}</span>
    </button>
    {#each statusOrder as status}
      {@const count = items.filter(
        (item: FeedbackItem) => item.status === status
      ).length}
      {#if count > 0}
        <button
          class="filter-chip"
          class:active={selectedStatus === status}
          onclick={() => (selectedStatus = status)}
          style="--status-color: {STATUS_CONFIG[status].color}"
        >
          <i class="fas {STATUS_CONFIG[status].icon}"></i>
          <span>{STATUS_CONFIG[status].label}</span>
          <span class="count">{count}</span>
        </button>
      {/if}
    {/each}
  </div>

  <section class="all-section">
    <header class="section-header">
      <i class="fas fa-list"></i>
      <span>
        {selectedStatus === "all"
          ? "Your Feedback"
          : STATUS_CONFIG[selectedStatus].label}
      </span>
      <span class="count">{filteredItems.length}</span>
    </header>

    <div class="section-items">
      {#each filteredItems as item (item.id)}
        <MyFeedbackCard
          {item}
          isSelected={selectedItem?.id === item.id}
          onClick={() => onSelect(item)}
        />
      {/each}
    </div>

    {#if filteredItems.length === 0 && !isLoading}
      <div class="empty-filter">
        <i class="fas fa-filter"></i>
        <span
          >No {selectedStatus === "all"
            ? ""
            : STATUS_CONFIG[selectedStatus].label.toLowerCase()} feedback</span
        >
      </div>
    {/if}

    {#if isLoading}
      <div class="loading-more">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading more...</span>
      </div>
    {/if}
  </section>
</div>

<style>
  .feedback-list {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Filter bar */
  .filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: linear-gradient(
      135deg,
      var(--theme-card-bg, rgba(30, 30, 40, 0.95)) 0%,
      var(--theme-card-hover-bg, rgba(35, 35, 45, 0.95)) 100%
    );
    border: 1.5px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    border-radius: 20px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .filter-chip:hover {
    background: linear-gradient(
      135deg,
      var(--theme-card-hover-bg, rgba(40, 40, 50, 0.98)) 0%,
      color-mix(in srgb, var(--theme-card-hover-bg, rgba(40, 40, 50, 0.98)) 90%, white) 100%
    );
    border-color: color-mix(in srgb, var(--theme-text, rgba(255, 255, 255, 0.95)) 30%, transparent);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    transform: translateY(-1px);
  }

  .filter-chip.active {
    background: linear-gradient(
      135deg,
      var(--status-color, #3b82f6) 0%,
      color-mix(in srgb, var(--status-color, #3b82f6) 80%, black) 100%
    );
    border: 1.5px solid
      color-mix(in srgb, var(--status-color, #3b82f6) 120%, white);
    color: #ffffff;
    box-shadow:
      0 6px 16px color-mix(in srgb, var(--status-color, #3b82f6) 40%, black),
      0 0 0 1px
        color-mix(in srgb, var(--status-color, #3b82f6) 50%, transparent);
    transform: translateY(-2px);
  }

  .filter-chip i {
    font-size: 0.75rem;
  }

  .filter-chip .count {
    padding: 1px 6px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    font-size: 0.6875rem;
    font-weight: 600;
  }

  /* Section styling */
  section {
    margin-bottom: 24px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .section-header i {
    font-size: 0.875rem;
  }

  .section-header .count {
    margin-left: auto;
    padding: 2px 8px;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    font-size: 0.75rem;
  }

  /* Items container */
  .section-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Loading more */
  .loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.875rem;
  }

  /* Empty filter state */
  .empty-filter {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px;
    color: color-mix(in srgb, var(--theme-text-dim, rgba(255, 255, 255, 0.5)) 80%, transparent);
    text-align: center;
  }

  .empty-filter i {
    font-size: 32px;
    opacity: 0.5;
  }

  /* Scrollbar */
  .feedback-list::-webkit-scrollbar {
    width: 6px;
  }

  .feedback-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .feedback-list::-webkit-scrollbar-thumb {
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 3px;
  }

  .feedback-list::-webkit-scrollbar-thumb:hover {
    background: var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
  }

  /* Container query for responsive layout */
  @container my-feedback (max-width: 600px) {
    .feedback-list {
      padding: 12px;
    }
  }
</style>
