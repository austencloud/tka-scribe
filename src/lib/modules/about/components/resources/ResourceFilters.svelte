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
    searchTerm?: string,
    selectedCategory?: string,
    selectedLevel?: string,
    resultsCount?: number
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

  /* Search */
  .search-section {
    margin-bottom: var(--spacing-md);
  }

  .search-container {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
    transition: all 0.3s ease;
  }

  .search-container.focused {
    transform: translateY(-2px);
  }

  .search-input {
    width: 100%;
    padding: 14px 50px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    font-size: 15px;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    background: rgba(255, 255, 255, 0.12);
  }

  .search-input::placeholder {
    color: #9ca3af;
    opacity: 1;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
    font-size: 18px;
    transition: color 0.2s ease;
  }

  .search-container.focused .search-icon {
    color: #667eea;
  }

  .clear-search-btn {
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    background: var(--color-bg-tertiary);
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: var(--font-size-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0.7;
  }

  .clear-search-btn:hover {
    background: var(--color-error);
    color: white;
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }

  .clear-search-btn:active {
    transform: translateY(-50%) scale(0.95);
  }

  /* Results Counter & Clear Filters */
  .filter-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
  }

  .results-counter {
    display: flex;
    align-items: baseline;
    gap: var(--spacing-xs);
    font-size: var(--font-size-md);
  }

  .results-number {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
    animation: countUpdate 0.3s ease;
  }

  @keyframes countUpdate {
    0% {
      transform: scale(1.2);
      opacity: 0.7;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .results-label {
    color: #d1d5db;
    font-weight: 500;
  }

  .clear-filters-btn {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    color: #fca5a5;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .clear-filters-btn:hover {
    border-color: #ef4444;
    color: #ffffff;
    background: rgba(239, 68, 68, 0.2);
  }

  /* Level Filter Pills */
  .level-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
  }

  .filter-label {
    font-weight: 600;
    color: #f3f4f6;
    font-size: 14px;
  }

  .level-pills {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .level-pill {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    color: #d1d5db;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .level-pill:hover {
    border-color: #667eea;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
  }

  .level-pill.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .level-pill:active {
    transform: scale(0.98);
  }

  /* Categories Navigation */
  .categories-nav {
    display: flex;
    justify-content: center;
    gap: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
    padding-bottom: 4px;
  }

  .category-tab {
    background: none;
    border: none;
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    color: #9ca3af;
    font-weight: 600;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    position: relative;
  }

  .category-tab:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px 8px 0 0;
  }

  .category-tab.active {
    color: #ffffff;
    background: rgba(102, 126, 234, 0.15);
    border-bottom-color: #667eea;
    border-radius: 8px 8px 0 0;
  }

  .category-tab:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  .tab-label {
    font-size: 14px;
  }

  .tab-count {
    font-size: 12px;
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 700;
    color: #d1d5db;
  }

  .category-tab.active .tab-count {
    background: #667eea;
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
