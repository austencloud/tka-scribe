<script lang="ts" module>
  import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";

  export interface FilterState {
    readStatus: "all" | "unread" | "read";
    type: UserNotification["type"] | "all";
    searchQuery: string;
  }
</script>

<script lang="ts">
  /**
   * NotificationFilter - Modern chip-based filter controls
   */

  import { slide } from "svelte/transition";
  // Note: UserNotification type is imported in the module script above

  interface Props {
    onFilterChange: (filters: FilterState) => void;
  }

  let { onFilterChange }: Props = $props();

  let filters = $state<FilterState>({
    readStatus: "all", // Always "all" now - no read/unread filtering
    type: "all",
    searchQuery: "",
  });

  let isTypeSheetOpen = $state(false);
  let showTypeFilters = $state(false);

  // Notify parent when filters change
  $effect(() => {
    onFilterChange(filters);
  });

  const notificationTypes: Array<{
    value: UserNotification["type"] | "all";
    label: string;
  }> = [
    { value: "all", label: "All Types" },
    { value: "feedback-resolved", label: "Resolved" },
    { value: "feedback-in-progress", label: "In Progress" },
    { value: "feedback-needs-info", label: "Needs Info" },
    { value: "feedback-response", label: "Response" },
    { value: "sequence-liked", label: "Likes" },
    { value: "user-followed", label: "Follows" },
    { value: "achievement-unlocked", label: "Achievements" },
    { value: "message-received", label: "Messages" },
    { value: "system-announcement", label: "Announcements" },
  ];

  function getTypeLabel(value: UserNotification["type"] | "all"): string {
    return (
      notificationTypes.find((t) => t.value === value)?.label || "All Types"
    );
  }
</script>

<div class="notification-filter">
  <!-- Search input -->
  <div class="search-box">
    <i class="fas fa-search" aria-hidden="true"></i>
    <input
      type="text"
      placeholder="Search notifications..."
      bind:value={filters.searchQuery}
      aria-label="Search notifications"
    />
    {#if filters.searchQuery}
      <button
        class="clear-search"
        onclick={() => (filters.searchQuery = "")}
        aria-label="Clear search"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    {/if}
  </div>

  <!-- Optional type filter toggle (only shows if filter is active or explicitly opened) -->
  {#if filters.type !== "all" || showTypeFilters}
    <div class="filter-header">
      <button
        class="filter-toggle-btn"
        class:active={showTypeFilters}
        onclick={() => (showTypeFilters = !showTypeFilters)}
        aria-label="Toggle type filters"
        title={showTypeFilters ? "Hide filters" : "Filter by type"}
      >
        <i class="fas fa-filter" aria-hidden="true"></i>
        <span>Filter by type</span>
        {#if filters.type !== "all"}
          <span class="active-filter-badge"></span>
        {/if}
      </button>
    </div>
  {/if}

  <!-- Collapsible type filters -->
  {#if showTypeFilters}
    <div class="type-filter" transition:slide={{ duration: 200 }}>
      <!-- Desktop: Scrollable chip row -->
      <div
        class="chip-scroll desktop-only"
        role="group"
        aria-label="Filter by notification type"
      >
        {#each notificationTypes as type}
          <button
            class="chip type-chip"
            class:active={filters.type === type.value}
            onclick={() => (filters.type = type.value)}
            aria-pressed={filters.type === type.value}
          >
            {type.label}
          </button>
        {/each}
      </div>

      <!-- Mobile: Button to open type selector sheet -->
      <button
        class="type-selector-btn mobile-only"
        onclick={() => (isTypeSheetOpen = true)}
        aria-label="Select notification type"
      >
        <i class="fas fa-filter" aria-hidden="true"></i>
        <span>{getTypeLabel(filters.type)}</span>
        <i class="fas fa-chevron-down" aria-hidden="true"></i>
      </button>
    </div>
  {/if}
</div>

<!-- Mobile type selector sheet -->
{#if isTypeSheetOpen}
  <div
    class="sheet-overlay"
    onclick={() => (isTypeSheetOpen = false)}
    onkeydown={(e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        isTypeSheetOpen = false;
      }
    }}
    role="button"
    tabindex="0"
    aria-label="Close notification type selector"
  >
    <div
      class="sheet"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-label="Select notification type"
    >
      <div class="sheet-header">
        <h3>Notification Type</h3>
        <button
          class="close-btn"
          onclick={() => (isTypeSheetOpen = false)}
          aria-label="Close"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="sheet-content">
        {#each notificationTypes as type}
          <button
            class="type-option"
            class:active={filters.type === type.value}
            onclick={() => {
              filters.type = type.value;
              isTypeSheetOpen = false;
            }}
          >
            {type.label}
            {#if filters.type === type.value}
              <i class="fas fa-check" aria-hidden="true"></i>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .notification-filter {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
  }

  .search-box {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-box i.fa-search {
    position: absolute;
    left: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 14px;
    pointer-events: none;
  }

  .search-box input {
    flex: 1;
    padding: 10px 12px 10px 36px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, #ffffff);
    font-size: var(--font-size-min, 14px);
    transition: all 0.2s ease;
  }

  .search-box input::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .search-box input:focus {
    outline: none;
    border-color: var(--theme-accent, #3b82f6);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .clear-search {
    position: absolute;
    right: 8px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-search:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, #ffffff);
  }

  /* Filter header */
  .filter-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 20px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .chip:hover:not(.active) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.2));
    color: var(--theme-text, #ffffff);
  }

  .chip.active {
    background: var(--theme-accent, #3b82f6);
    border-color: var(--theme-accent, #3b82f6);
    color: white;
  }

  .chip:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-accent) 50%, transparent);
  }

  /* Filter toggle button */
  .filter-toggle-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: var(--font-size-min, 14px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-toggle-btn:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    color: var(--theme-text, #ffffff);
  }

  .filter-toggle-btn.active {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    color: var(--theme-accent, #3b82f6);
  }

  .filter-toggle-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-accent) 50%, transparent);
  }

  .filter-toggle-btn i:first-child {
    font-size: 12px;
  }

  /* Active filter indicator badge */
  .active-filter-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    background: var(--semantic-info, #3b82f6);
    border: 2px solid var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
    border-radius: 50%;
  }

  /* Type filter container */
  .type-filter {
    position: relative;
  }

  /* Desktop: Scrollable chip row */
  .chip-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
    scrollbar-width: thin;
    scrollbar-color: var(--theme-stroke, rgba(255, 255, 255, 0.2)) transparent;
  }

  .chip-scroll::-webkit-scrollbar {
    height: 6px;
  }

  .chip-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .chip-scroll::-webkit-scrollbar-thumb {
    background: var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-radius: 3px;
  }

  .chip-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--theme-stroke, rgba(255, 255, 255, 0.3));
  }

  .type-chip {
    flex-shrink: 0;
  }

  /* Mobile: Type selector button */
  .type-selector-btn {
    display: none;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, #ffffff);
    font-size: var(--font-size-min, 14px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .type-selector-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.2));
  }

  .type-selector-btn:focus-visible {
    outline: none;
    border-color: var(--theme-accent, #3b82f6);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .type-selector-btn span {
    flex: 1;
    text-align: left;
    margin: 0 8px;
  }

  /* Sheet overlay */
  .sheet-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 70vh;
    background: var(--theme-panel-bg, rgba(20, 20, 20, 0.95));
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .sheet-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .close-btn {
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
  }

  .sheet-content {
    overflow-y: auto;
    max-height: calc(70vh - 64px);
    padding: 8px;
  }

  .type-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--min-touch-target);
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text, #ffffff);
    font-size: var(--font-size-min, 14px);
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .type-option:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
  }

  .type-option.active {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-accent, #3b82f6);
    font-weight: 500;
  }

  .type-option i.fa-check {
    color: var(--theme-accent, #3b82f6);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .desktop-only {
      display: none !important;
    }

    .mobile-only {
      display: flex !important;
    }
  }

  @media (min-width: 769px) {
    .desktop-only {
      display: flex !important;
    }

    .mobile-only {
      display: none !important;
    }
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .search-box input,
    .clear-search,
    .chip,
    .filter-toggle-btn,
    .type-filter,
    .type-selector-btn,
    .close-btn,
    .type-option,
    .sheet-overlay,
    .sheet {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
