<!--
Resource Filters Component

Handles search and category filtering for the resources list.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import { categories, levels, resources } from "./resourcesData";

  // Bindable props
  let {
    searchTerm = $bindable(""),
    selectedCategory = $bindable("all"),
    selectedLevel = $bindable("all"),
    resultsCount = 0,
  } = $props<{
    searchTerm?: string;
    selectedCategory?: string;
    selectedLevel?: string;
    resultsCount?: number;
  }>();

  let hapticService: IHapticFeedbackService;
  let searchInput: HTMLInputElement;
  let isSearchFocused = $state(false);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function getResourceCountForCategory(categoryValue: string): number {
    if (categoryValue === "all") {
      return resources.length;
    }
    return resources.filter((resource) => resource.category === categoryValue)
      .length;
  }

  function handleCategorySelect(categoryValue: string) {
    hapticService?.trigger("selection");
    selectedCategory = categoryValue;
  }

  function handleLevelSelect(levelValue: string) {
    hapticService?.trigger("selection");
    selectedLevel = levelValue;
  }

  function clearSearch() {
    hapticService?.trigger("selection");
    searchTerm = "";
    searchInput?.focus();
  }

  function handleSearchFocus() {
    isSearchFocused = true;
  }

  function handleSearchBlur() {
    isSearchFocused = false;
  }

  // Check if any filters are active
  let hasActiveFilters = $derived(
    selectedCategory !== "all" || selectedLevel !== "all" || searchTerm !== ""
  );

  function clearAllFilters() {
    hapticService?.trigger("selection");
    selectedCategory = "all";
    selectedLevel = "all";
    searchTerm = "";
  }
</script>

<div class="filters-section">
  <!-- Search -->
  <div class="search-section">
    <div class="search-container" class:focused={isSearchFocused}>
      <span class="search-icon" aria-hidden="true">🔍</span>
      <input
        bind:this={searchInput}
        type="search"
        placeholder="Search resources by name, description, or specialty..."
        bind:value={searchTerm}
        class="search-input"
        onfocus={handleSearchFocus}
        onblur={handleSearchBlur}
        aria-label="Search resources"
        aria-describedby="search-hint"
      />
      {#if searchTerm}
        <button
          type="button"
          class="clear-search-btn"
          onclick={clearSearch}
          aria-label="Clear search"
          title="Clear search"
        >
          ✕
        </button>
      {/if}
    </div>
    <span id="search-hint" class="sr-only"
      >Search by resource name, description, or specialty</span
    >
  </div>

  <!-- Results Counter & Clear Filters -->
  <div class="filter-summary">
    <div class="results-counter" role="status" aria-live="polite">
      <span class="results-number">{resultsCount}</span>
      <span class="results-label"
        >{resultsCount === 1 ? "resource" : "resources"} found</span
      >
    </div>
    {#if hasActiveFilters}
      <button
        type="button"
        class="clear-filters-btn"
        onclick={clearAllFilters}
        aria-label="Clear all filters"
      >
        Clear all filters
      </button>
    {/if}
  </div>

  <!-- Level Filter Pills -->
  <div class="level-filter" role="group" aria-label="Filter by skill level">
    <span class="filter-label">Level:</span>
    <div class="level-pills">
      {#each levels as level}
        <button
          type="button"
          class="level-pill"
          class:active={selectedLevel === level.value}
          onclick={() => handleLevelSelect(level.value)}
          aria-pressed={selectedLevel === level.value}
          aria-label={`Filter by ${level.label}`}
        >
          {level.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Category Tabs -->
  <nav class="categories-nav" aria-label="Filter by resource category">
    {#each categories as category}
      <button
        type="button"
        class="category-tab"
        class:active={selectedCategory === category.value}
        onclick={() => handleCategorySelect(category.value)}
        aria-pressed={selectedCategory === category.value}
        aria-label={`Show ${category.label} (${getResourceCountForCategory(category.value)} resources)`}
      >
        <span class="tab-label">{category.label}</span>
        <span class="tab-count" aria-hidden="true"
          >({getResourceCountForCategory(category.value)})</span
        >
      </button>
    {/each}
  </nav>
</div>

<style>
  .filters-section {
    margin-bottom: var(--spacing-xl);
  }

  /* Screen reader only */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Search - Admin Style */
  .search-section {
    margin-bottom: 16px;
  }

  .search-container {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 10px 14px;
    transition: all 0.2s ease;
  }

  .search-container.focused {
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 14px;
    color: #ffffff;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .search-icon {
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    flex-shrink: 0;
  }

  .search-container.focused .search-icon {
    color: #667eea;
  }

  .clear-search-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .clear-search-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .clear-search-btn:active {
    transform: scale(0.95);
  }

  /* Results Counter & Clear Filters - Admin Style */
  .filter-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .results-counter {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 14px;
  }

  .results-number {
    font-size: 20px;
    font-weight: 700;
    color: #667eea;
  }

  .results-label {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  .clear-filters-btn {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    color: #fca5a5;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .clear-filters-btn:hover {
    border-color: rgba(239, 68, 68, 0.4);
    background: rgba(239, 68, 68, 0.2);
  }

  /* Level Filter Pills - Admin Time Range Style */
  .level-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .filter-label {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
  }

  .level-pills {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 8px;
  }

  .level-pill {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .level-pill:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .level-pill.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  /* Categories Navigation - Admin Style */
  .categories-nav {
    display: flex;
    justify-content: center;
    gap: 4px;
    flex-wrap: wrap;
    background: rgba(255, 255, 255, 0.03);
    padding: 4px;
    border-radius: 8px;
  }

  .category-tab {
    background: transparent;
    border: none;
    padding: 10px 14px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    border-radius: 6px;
    font-size: 13px;
  }

  .category-tab:hover {
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.05);
  }

  .category-tab.active {
    color: #ffffff;
    background: rgba(102, 126, 234, 0.2);
  }

  .category-tab:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  .tab-label {
    font-size: 13px;
  }

  .tab-count {
    font-size: 11px;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 8px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  }

  .category-tab.active .tab-count {
    background: rgba(102, 126, 234, 0.4);
    color: #ffffff;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .search-container {
      max-width: 100%;
    }

    .search-input {
      padding: var(--spacing-sm) var(--spacing-2xl) var(--spacing-sm)
        var(--spacing-2xl);
      font-size: var(--font-size-sm);
    }

    .filter-summary {
      gap: var(--spacing-sm);
    }

    .results-counter {
      font-size: var(--font-size-sm);
    }

    .results-number {
      font-size: var(--font-size-lg);
    }

    .level-filter {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .level-pills {
      justify-content: center;
    }

    .level-pill {
      padding: var(--spacing-xs) var(--spacing-md);
      font-size: var(--font-size-xs);
    }

    .categories-nav {
      overflow-x: auto;
      justify-content: flex-start;
      padding-bottom: var(--spacing-xs);
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }

    .categories-nav::-webkit-scrollbar {
      height: 4px;
    }

    .categories-nav::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: var(--radius-sm);
    }

    .category-tab {
      padding: var(--spacing-sm) var(--spacing-md);
      font-size: var(--font-size-xs);
    }
  }

  /* Touch device optimizations */
  @media (hover: none) and (pointer: coarse) {
    .level-pill,
    .category-tab,
    .clear-search-btn,
    .clear-filters-btn {
      min-height: 44px;
      min-width: 44px;
    }
  }
</style>
