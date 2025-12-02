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
      placeholder="Search feedback..."
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

  <!-- Type filter chips -->
  <div class="chip-group">
    <button
      type="button"
      class="filter-chip"
      class:active={manageState.filters.type === "all"}
      onclick={() => manageState.setFilter("type", "all")}
    >
      All Types
    </button>
    {#each Object.entries(TYPE_CONFIG) as [type, config]}
      <button
        type="button"
        class="filter-chip"
        class:active={manageState.filters.type === type}
        style="--chip-color: {config.color}"
        onclick={() => manageState.setFilter("type", type as FeedbackType)}
      >
        <i class="fas {config.icon}"></i>
        <span class="chip-label">{config.label.replace(" Report", "").replace(" Request", "").replace(" Feedback", "")}</span>
      </button>
    {/each}
  </div>

  <!-- Priority filter chips -->
  <div class="chip-group priority-group">
    <button
      type="button"
      class="filter-chip small"
      class:active={manageState.filters.priority === "all"}
      onclick={() => manageState.setFilter("priority", "all")}
    >
      Any Priority
    </button>
    {#each Object.entries(PRIORITY_CONFIG) as [priority, config]}
      <button
        type="button"
        class="filter-chip small"
        class:active={manageState.filters.priority === priority}
        style="--chip-color: {config.color}"
        onclick={() => manageState.setFilter("priority", priority as FeedbackPriority)}
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
      aria-label="Clear all filters"
    >
      <i class="fas fa-times"></i>
      Clear
    </button>
  {/if}
</div>

<style>
  .filter-bar {
    --fb-space-2xs: 6px;
    --fb-space-xs: 8px;
    --fb-space-sm: 13px;
    --fb-space-md: 21px;

    --fb-text-xs: 0.75rem;
    --fb-text-sm: 0.875rem;

    --fb-radius-sm: 8px;
    --fb-radius-md: 12px;
    --fb-radius-full: 999px;

    --fb-primary: #10b981;
    --fb-surface: rgba(255, 255, 255, 0.05);
    --fb-surface-hover: rgba(255, 255, 255, 0.08);
    --fb-border: rgba(255, 255, 255, 0.1);
    --fb-border-focus: rgba(255, 255, 255, 0.2);
    --fb-text: rgba(255, 255, 255, 0.95);
    --fb-text-muted: rgba(255, 255, 255, 0.6);
    --fb-text-subtle: rgba(255, 255, 255, 0.4);

    --spring-smooth: cubic-bezier(0.4, 0, 0.2, 1);

    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--fb-space-sm);
    padding: var(--fb-space-sm);
    background: var(--fb-surface);
    border-bottom: 1px solid var(--fb-border);
  }

  /* Search */
  .search-wrapper {
    position: relative;
    min-width: 200px;
    max-width: 280px;
  }

  .search-icon {
    position: absolute;
    left: var(--fb-space-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--fb-text-subtle);
    font-size: var(--fb-text-sm);
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    height: 44px;
    padding: 0 var(--fb-space-md) 0 calc(var(--fb-space-sm) + 24px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
  }

  .search-input::placeholder {
    color: var(--fb-text-subtle);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--fb-primary);
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
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    color: var(--fb-text-subtle);
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.15s ease;
  }

  .search-clear:hover {
    background: var(--fb-surface-hover);
    color: var(--fb-text-muted);
  }

  /* Chip groups */
  .chip-group {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
  }

  .priority-group {
    margin-left: auto;
  }

  .filter-chip {
    display: flex;
    align-items: center;
    gap: var(--fb-space-2xs);
    height: 40px;
    padding: 0 var(--fb-space-sm);
    background: transparent;
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-full);
    color: var(--fb-text-muted);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s var(--spring-smooth);
    white-space: nowrap;
  }

  .filter-chip.small {
    width: 40px;
    padding: 0;
    justify-content: center;
  }

  .filter-chip i {
    font-size: 0.85em;
  }

  .filter-chip:hover {
    background: var(--fb-surface-hover);
    border-color: var(--fb-border-focus);
    color: var(--fb-text);
  }

  .filter-chip:active {
    transform: scale(0.97);
  }

  .filter-chip.active {
    background: color-mix(in srgb, var(--chip-color, var(--fb-primary)) 15%, transparent);
    border-color: var(--chip-color, var(--fb-primary));
    color: var(--fb-text);
  }

  .filter-chip.active i {
    color: var(--chip-color, var(--fb-primary));
  }

  /* Clear button */
  .clear-btn {
    display: flex;
    align-items: center;
    gap: var(--fb-space-xs);
    height: 40px;
    padding: 0 var(--fb-space-sm);
    background: none;
    border: none;
    color: var(--fb-text-subtle);
    font-size: var(--fb-text-sm);
    font-weight: 500;
    cursor: pointer;
    border-radius: var(--fb-radius-md);
    transition: all 0.15s ease;
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .filter-bar {
      flex-wrap: nowrap;
      overflow-x: auto;
      padding: var(--fb-space-xs);
      gap: var(--fb-space-xs);
    }

    .search-wrapper {
      min-width: 150px;
      max-width: 180px;
    }

    .chip-label {
      display: none;
    }

    .filter-chip:not(.small) {
      width: 40px;
      padding: 0;
      justify-content: center;
    }

    .priority-group {
      margin-left: 0;
    }
  }
</style>
