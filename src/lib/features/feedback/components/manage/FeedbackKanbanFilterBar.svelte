<!-- FeedbackKanbanFilterBar - Simplified filter bar for Kanban view (no status filter) -->
<script lang="ts">
  import type { FeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import {
    TYPE_CONFIG,
    PRIORITY_CONFIG,
  } from "../../domain/models/feedback-models";
  import type {
    FeedbackType,
    FeedbackPriority,
  } from "../../domain/models/feedback-models";

  const { manageState } = $props<{
    manageState: FeedbackManageState;
  }>();

  // Count active filters (excluding status since it's shown visually)
  const activeFilterCount = $derived(
    [
      manageState.filters.type !== "all",
      manageState.filters.priority !== "all",
    ].filter(Boolean).length
  );

  function clearFilters() {
    manageState.setFilter("type", "all");
    manageState.setFilter("priority", "all");
  }
</script>

<div class="filter-bar">
  <!-- Search input -->
  <div class="search-wrapper">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      class="search-input"
      placeholder="Search..."
      value={manageState.searchQuery}
      oninput={(e) => manageState.setSearchQuery(e.currentTarget.value)}
    />
    {#if manageState.searchQuery}
      <button
        type="button"
        class="search-clear"
        onclick={() => manageState.setSearchQuery("")}
        aria-label="Clear search"
      >
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  <!-- Desktop: Type + Priority filter chips -->
  <div class="filters-row">
    {#each Object.entries(TYPE_CONFIG) as [type, config]}
      <button
        type="button"
        class="filter-chip"
        class:active={manageState.filters.type === type}
        style="--chip-color: {config.color}"
        onclick={() => manageState.setFilter("type", manageState.filters.type === type ? "all" : type as FeedbackType)}
        title="{config.label}"
        aria-label="Filter by {config.label}"
      >
        <i class="fas {config.icon}"></i>
      </button>
    {/each}

    <span class="filter-divider"></span>

    {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
      <button
        type="button"
        class="filter-chip"
        class:active={manageState.filters.priority === priority}
        style="--chip-color: {config.color}"
        onclick={() => manageState.setFilter("priority", manageState.filters.priority === priority ? "all" : priority as FeedbackPriority)}
        title="{config.label} priority"
        aria-label="Filter by {config.label} priority"
      >
        <i class="fas {config.icon}"></i>
      </button>
    {/each}
  </div>

  {#if activeFilterCount > 0}
    <button
      type="button"
      class="clear-btn"
      onclick={clearFilters}
      aria-label="Clear filters"
    >
      <i class="fas fa-filter-circle-xmark"></i>
    </button>
  {/if}
</div>

<style>
  .filter-bar {
    /* ===== FLUID SPACING ===== */
    --fb-space-xs: clamp(6px, 1.5cqi, 10px);
    --fb-space-sm: clamp(10px, 2.5cqi, 16px);
    --fb-space-md: clamp(14px, 3.5cqi, 20px);

    /* ===== FLUID TYPOGRAPHY ===== */
    --fb-text-sm: clamp(0.875rem, 2.5cqi, 1rem);

    /* ===== FLUID SIZING ===== */
    --fb-touch-target: clamp(44px, 11cqi, 52px);
    --fb-icon-btn: clamp(40px, 10cqi, 48px);

    display: flex;
    align-items: center;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: transparent;
    container-type: inline-size;
    container-name: filterbar;
  }

  /* ===== SEARCH ===== */
  .search-wrapper {
    position: relative;
    flex: 1;
    max-width: clamp(200px, 50cqi, 300px);
  }

  .search-icon {
    position: absolute;
    left: var(--fb-space-sm);
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
    font-size: var(--fb-text-sm);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: var(--fb-touch-target);
    padding: 0 var(--fb-touch-target) 0 clamp(36px, 9cqi, 44px);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--fb-touch-target);
    color: rgba(255, 255, 255, 0.95);
    font-size: var(--fb-text-sm);
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.12);
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }

  .search-clear {
    position: absolute;
    right: var(--fb-space-xs);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(32px, 8cqi, 40px);
    height: clamp(32px, 8cqi, 40px);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.15s ease;
  }

  .search-clear:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }

  /* ===== FILTER ROW ===== */
  .filters-row {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
  }

  .filter-divider {
    width: 1px;
    height: clamp(20px, 5cqi, 28px);
    background: rgba(255, 255, 255, 0.15);
    margin: 0 var(--fb-space-xs);
  }

  .filter-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--fb-icon-btn);
    height: var(--fb-icon-btn);
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.5);
    font-size: var(--fb-text-sm);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-chip:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
  }

  .filter-chip:active {
    transform: scale(0.92);
  }

  .filter-chip.active {
    background: color-mix(in srgb, var(--chip-color) 25%, transparent);
    color: var(--chip-color);
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--chip-color) 35%, transparent),
      0 4px 12px color-mix(in srgb, var(--chip-color) 20%, transparent);
  }

  /* ===== CLEAR BUTTON ===== */
  .clear-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--fb-icon-btn);
    height: var(--fb-icon-btn);
    background: rgba(239, 68, 68, 0.12);
    border: none;
    border-radius: 50%;
    color: #ef4444;
    font-size: var(--fb-text-sm);
    cursor: pointer;
    transition: all 0.15s ease;
    margin-left: auto;
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  /* ===== CONTAINER QUERY: Hide filters on mobile (tabs serve as filter) ===== */
  @container filterbar (max-width: 500px) {
    .filters-row {
      display: none;
    }

    .search-wrapper {
      max-width: none;
    }

    .clear-btn {
      display: none;
    }
  }

  /* ===== REDUCED MOTION ===== */
  @media (prefers-reduced-motion: reduce) {
    .filter-chip,
    .search-input,
    .search-clear,
    .clear-btn {
      transition: none;
    }
  }
</style>
