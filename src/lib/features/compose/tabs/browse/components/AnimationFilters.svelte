<!--
AnimationFilters.svelte

Filter and sort controls for the browse tab.

Features:
- Mode filter chips (All, Single, Mirror, Tunnel, Grid)
- Favorites toggle
- Sort dropdown (Date, Name, Popularity)
- Sort direction toggle
-->
<script lang="ts">
  import type { ComposeMode } from "../../../shared/state/compose-module-state.svelte";
  import type {
    AnimationFilter,
    SortMethod,
    SortDirection,
  } from "../state/browse-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  let hapticService: IHapticFeedbackService | null = null;

  const {
    currentFilter = {},
    sortMethod = "date",
    sortDirection = "desc",
    onFilterChange = () => {},
    onSortChange = () => {},
  } = $props<{
    currentFilter?: AnimationFilter;
    sortMethod?: SortMethod;
    sortDirection?: SortDirection;
    onFilterChange?: (filter: AnimationFilter) => void;
    onSortChange?: (method: SortMethod, direction: SortDirection) => void;
  }>();

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Mode options
  const modeOptions: {
    value: ComposeMode | "all";
    label: string;
    icon: string;
  }[] = [
    { value: "all", label: "All", icon: "fa-layer-group" },
    { value: "single", label: "Single", icon: "fa-play" },
    { value: "mirror", label: "Mirror", icon: "fa-clone" },
    { value: "tunnel", label: "Tunnel", icon: "fa-layer-group" },
    { value: "grid", label: "Grid", icon: "fa-th" },
  ];

  // Sort options
  const sortOptions: { value: SortMethod; label: string }[] = [
    { value: "date", label: "Date Modified" },
    { value: "name", label: "Name" },
    { value: "popularity", label: "Popularity" },
  ];

  // Handlers
  function handleModeChange(mode: ComposeMode | "all") {
    hapticService?.trigger("selection");
    if (mode === "all") {
      onFilterChange({ ...currentFilter, mode: undefined });
    } else {
      onFilterChange({ ...currentFilter, mode });
    }
  }

  function handleFavoritesToggle() {
    hapticService?.trigger("selection");
    onFilterChange({
      ...currentFilter,
      favorites: !currentFilter.favorites,
    });
  }

  function handleSortMethodChange(method: SortMethod) {
    hapticService?.trigger("selection");
    onSortChange(method, sortDirection);
  }

  function handleSortDirectionToggle() {
    hapticService?.trigger("selection");
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    onSortChange(sortMethod, newDirection);
  }
</script>

<div class="filters-container">
  <!-- Mode Filters -->
  <div class="filter-section">
    <span class="filter-label" id="mode-filter-label">Mode</span>
    <div class="mode-chips" role="group" aria-labelledby="mode-filter-label">
      {#each modeOptions as option}
        <button
          class="mode-chip"
          class:active={option.value === "all"
            ? !currentFilter.mode
            : currentFilter.mode === option.value}
          onclick={() => handleModeChange(option.value)}
        >
          <i class="fas {option.icon}"></i>
          <span>{option.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Favorites and Sort -->
  <div class="controls-row">
    <!-- Favorites Toggle -->
    <button
      class="favorites-toggle"
      class:active={currentFilter.favorites}
      onclick={handleFavoritesToggle}
      aria-label="Filter favorites"
      title={currentFilter.favorites ? "Show all" : "Show favorites only"}
    >
      <i class="fas fa-heart"></i>
      <span>Favorites</span>
    </button>

    <!-- Sort Controls -->
    <div class="sort-controls">
      <!-- Sort Method -->
      <select
        class="sort-select"
        value={sortMethod}
        onchange={(e) =>
          handleSortMethodChange(e.currentTarget.value as SortMethod)}
      >
        {#each sortOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>

      <!-- Sort Direction -->
      <button
        class="sort-direction-btn"
        onclick={handleSortDirectionToggle}
        aria-label={sortDirection === "asc"
          ? "Sort descending"
          : "Sort ascending"}
        title={sortDirection === "asc" ? "Sort descending" : "Sort ascending"}
      >
        <i
          class="fas {sortDirection === 'asc'
            ? 'fa-arrow-up'
            : 'fa-arrow-down'}"
        ></i>
      </button>
    </div>
  </div>
</div>

<style>
  .filters-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border-radius: 8px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
  }

  /* Filter Section */
  .filter-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .filter-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Mode Chips */
  .mode-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mode-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mode-chip:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .mode-chip.active {
    background: color-mix(in srgb, var(--theme-accent) 20%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent) 40%, transparent);
    color: var(--theme-accent, #3b82f6);
  }

  .mode-chip i {
    font-size: 12px;
  }

  /* Controls Row */
  .controls-row {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  /* Favorites Toggle */
  .favorites-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .favorites-toggle:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .favorites-toggle.active {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
  }

  /* Sort Controls */
  .sort-controls {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }

  .sort-select {
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sort-select:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.2);
  }

  .sort-select:focus {
    outline: 2px solid color-mix(in srgb, var(--theme-accent) 50%, transparent);
    outline-offset: 2px;
  }

  .sort-select option {
    background: #1a1a2e;
    color: white;
  }

  .sort-direction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sort-direction-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .filters-container {
      padding: var(--spacing-sm);
    }

    .mode-chips {
      gap: 6px;
    }

    .mode-chip {
      padding: 6px 10px;
      font-size: 12px;
    }

    .controls-row {
      flex-direction: column;
      align-items: stretch;
    }

    .sort-controls {
      margin-left: 0;
      width: 100%;
    }

    .sort-select {
      flex: 1;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mode-chip,
    .favorites-toggle,
    .sort-select,
    .sort-direction-btn {
      transition: none;
    }
  }
</style>
