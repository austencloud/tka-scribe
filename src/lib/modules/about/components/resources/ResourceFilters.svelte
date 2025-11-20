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
    padding: var(--spacing-md) var(--spacing-3xl) var(--spacing-md)
      var(--spacing-3xl);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-md);
    background: var(--color-bg-secondary);
    color: var(--color-text-primary);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow:
      0 0 0 3px var(--color-accent-alpha),
      0 4px 12px rgba(0, 0, 0, 0.1);
    background: var(--color-bg-primary);
  }

  .search-input::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.6;
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
    pointer-events: none;
    font-size: var(--font-size-lg);
    transition: color 0.2s ease;
  }

  .search-container.focused .search-icon {
    color: var(--color-accent);
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
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-accent);
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
    color: var(--color-text-secondary);
    font-weight: 500;
  }

  .clear-filters-btn {
    background: transparent;
    border: 2px solid var(--color-border);
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .clear-filters-btn:hover {
    border-color: var(--color-error);
    color: var(--color-error);
    background: var(--color-error-alpha);
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
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
  }

  .level-pills {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }

  .level-pill {
    background: var(--color-bg-secondary);
    border: 2px solid var(--color-border);
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-full);
    cursor: pointer;
    color: var(--color-text-secondary);
    font-weight: 600;
    font-size: var(--font-size-sm);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  .level-pill:hover {
    border-color: var(--color-accent);
    color: var(--color-text-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .level-pill.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
    box-shadow: 0 4px 12px var(--color-accent-alpha);
  }

  .level-pill:active {
    transform: translateY(0);
  }

  /* Categories Navigation */
  .categories-nav {
    display: flex;
    justify-content: center;
    gap: var(--spacing-xs);
    border-bottom: 2px solid var(--color-border);
    flex-wrap: wrap;
  }

  .category-tab {
    background: none;
    border: none;
    padding: var(--spacing-md) var(--spacing-lg);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    color: var(--color-text-secondary);
    font-weight: 600;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    white-space: nowrap;
    position: relative;
  }

  .category-tab::before {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--color-accent);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .category-tab:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-secondary);
  }

  .category-tab.active {
    color: var(--color-accent);
    background: var(--color-accent-alpha);
  }

  .category-tab.active::before {
    transform: scaleX(1);
  }

  .category-tab:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .tab-label {
    font-size: var(--font-size-sm);
  }

  .tab-count {
    font-size: var(--font-size-xs);
    opacity: 0.7;
    background: var(--color-bg-tertiary);
    padding: 3px 8px;
    border-radius: var(--radius-full);
    font-weight: 700;
  }

  .category-tab.active .tab-count {
    background: var(--color-accent);
    color: white;
    opacity: 1;
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
