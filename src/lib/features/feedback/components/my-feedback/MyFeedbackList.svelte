<!-- MyFeedbackList - List of tester's own feedback items -->
<script lang="ts">
  import type { FeedbackItem } from "../../domain/models/feedback-models";
  import { STATUS_CONFIG, TYPE_CONFIG, CONFIRMATION_STATUS_CONFIG } from "../../domain/models/feedback-models";
  import MyFeedbackCard from "./MyFeedbackCard.svelte";

  const {
    items,
    selectedItem,
    onSelect,
    hasMore,
    isLoading,
    onLoadMore,
  } = $props<{
    items: FeedbackItem[];
    selectedItem: FeedbackItem | null;
    onSelect: (item: FeedbackItem) => void;
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
  }>();

  // Scroll handler for infinite loading
  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    const nearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 100;

    if (nearBottom && hasMore && !isLoading) {
      onLoadMore();
    }
  }
</script>

<div class="feedback-list" onscroll={handleScroll}>
  <section class="all-section">
    <header class="section-header">
      <i class="fas fa-list"></i>
      <span>Your Feedback</span>
      <span class="count">{items.length}</span>
    </header>

    <div class="section-items">
      {#each items as item (item.id)}
        <MyFeedbackCard
          {item}
          isSelected={selectedItem?.id === item.id}
          onClick={() => onSelect(item)}
        />
      {/each}
    </div>

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
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .section-header i {
    font-size: 0.875rem;
  }

  .section-header .count {
    margin-left: auto;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
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
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.875rem;
  }

  /* Scrollbar */
  .feedback-list::-webkit-scrollbar {
    width: 6px;
  }

  .feedback-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .feedback-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .feedback-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Container query for responsive layout */
  @container my-feedback (max-width: 600px) {
    .feedback-list {
      padding: 12px;
    }
  }
</style>
