<!--
Gallery Top Bar Controls - 2026 Modern Design (Compact)
- Navigation buttons (back/forward) on left
- Sort chips centered
- Filter button opens drawer with scope toggle + drill-down filters
- Active filter shown as dismissible chip
-->
<script lang="ts">
  import { galleryControlsManager } from "../state/gallery-controls-state.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { getContext, onMount } from "svelte";
  import { ExploreSortMethod } from "../domain/enums/discover-enums";
  import DiscoverNavButtons from "./DiscoverNavButtons.svelte";

  // Get navigation handler from context (provided by DiscoverModule)
  const navContext = getContext<{
    onNavigate: (location: {
      tab: string;
      view?: string;
      contextId?: string;
    }) => void;
  }>("discoverNavigation");

  const onNavigate = navContext?.onNavigate ?? (() => {});

  // Get gallery controls from global reactive state
  const galleryControls = $derived(galleryControlsManager.current);

  // Check if filter panel is already open (hide button to avoid redundant UI)
  const isFilterPanelOpen = $derived(galleryPanelManager.isFiltersOpen);

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  // Check if there's an active filter
  const hasActiveFilter = $derived(
    galleryControls?.currentFilter?.type !== "all"
  );

  // Get active filter label for display
  const activeFilterLabel = $derived.by(() => {
    if (!galleryControls?.currentFilter) return null;
    const filter = galleryControls.currentFilter;
    if (filter.type === "all") return null;
    if (filter.type === "favorites") return "Favorites";
    if (filter.type === "difficulty") return `Level ${filter.value}`;
    if (filter.type === "startingLetter") return `Letter ${filter.value}`;
    if (filter.type === "length") return `${filter.value} beats`;
    if (filter.type === "startingPosition") return filter.value;
    return filter.type;
  });

  // Sort options
  const sortOptions = [
    { id: ExploreSortMethod.ALPHABETICAL, label: "A-Z", icon: "fa-font" },
    { id: ExploreSortMethod.DATE_ADDED, label: "New", icon: "fa-clock" },
    {
      id: ExploreSortMethod.DIFFICULTY_LEVEL,
      label: "Level",
      icon: "fa-signal",
    },
    {
      id: ExploreSortMethod.SEQUENCE_LENGTH,
      label: "Length",
      icon: "fa-ruler",
    },
  ];

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleSortChange(method: ExploreSortMethod) {
    hapticService?.trigger("selection");
    if (galleryControls) {
      galleryControls.onSortMethodChange(method);
    }
  }

  function handleOpenFilters() {
    hapticService?.trigger("selection");
    galleryPanelManager.openFilters();
  }

  function handleClearFilter() {
    hapticService?.trigger("selection");
    if (galleryControls) {
      galleryControls.onFilterChange({ type: "all", value: null });
    }
  }
</script>

{#if galleryControls}
  <div class="gallery-topbar-controls">
    <div class="controls-row">
      <!-- Left: Navigation buttons -->
      <div class="nav-section">
        <DiscoverNavButtons {onNavigate} />
      </div>

      <!-- Center: Sort Chips (truly centered) -->
      <div class="center-section">
        <div class="sort-chips">
          {#each sortOptions as opt}
            <button
              class="sort-chip"
              class:active={galleryControls.currentSortMethod === opt.id}
              onclick={() => handleSortChange(opt.id)}
            >
              <i class="fas {opt.icon}"></i>
              <span class="chip-label">{opt.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Right: Filter controls -->
      <div class="filter-section">
        <!-- Active Filter (if any) -->
        {#if hasActiveFilter && activeFilterLabel}
          <button class="active-filter-chip" onclick={handleClearFilter}>
            <span>{activeFilterLabel}</span>
            <i class="fas fa-times"></i>
          </button>
        {/if}

        <!-- Filter Button - Hidden when filter panel is already open -->
        {#if !isFilterPanelOpen}
          <button
            class="filter-button"
            class:has-active={hasActiveFilter}
            onclick={handleOpenFilters}
            type="button"
            aria-label="Open filters"
          >
            <i class="fas fa-sliders-h"></i>
            {#if hasActiveFilter}
              <span class="filter-badge">1</span>
            {/if}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .gallery-topbar-controls {
    --control-height: var(--min-touch-target);
    --padding-vertical: 10px;

    display: flex;
    align-items: center;
    padding: var(--padding-vertical) 16px;
    background: var(--theme-panel-bg, #12121a);
    width: 100%;
    /* Prevent collapse when filter panel is open and sections are empty */
    min-height: calc(var(--control-height) + var(--padding-vertical) * 2);
  }

  /* Three-section layout: left (nav) - center (chips) - right (filter) */
  .controls-row {
    display: flex;
    align-items: center;
    width: 100%;
    position: relative;
  }

  /* Left section - nav buttons */
  .nav-section {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    min-width: 104px; /* Space for 2 nav buttons (48+8+48) */
  }

  /* Center section - absolutely centered chips */
  .center-section {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    justify-content: center;
  }

  /* Right section - filter controls */
  .filter-section {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }

  /* Sort Chips */
  .sort-chips {
    display: flex;
    gap: 6px;
  }

  .sort-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 14px;
    min-height: var(--control-height);
    background: var(--theme-card-bg, #252532);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 100px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .sort-chip:hover {
    background: var(--theme-card-hover-bg, #2d2d3d);
    color: var(--theme-text, #fff);
  }

  .sort-chip.active {
    background: var(--semantic-info, #3b82f6);
    border-color: var(--semantic-info, #3b82f6);
    color: var(--theme-text, #fff);
  }

  .sort-chip i {
    font-size: 12px;
  }

  /* Active Filter Chip */
  .active-filter-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px 0 16px;
    min-height: var(--control-height);
    background: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 15%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--semantic-info, #3b82f6) 30%, transparent);
    border-radius: 100px;
    color: var(--semantic-info, #3b82f6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .active-filter-chip:hover {
    background: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 25%,
      transparent
    );
  }

  .active-filter-chip i {
    font-size: 10px;
    opacity: 0.8;
  }

  /* Filter Button */
  .filter-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--control-height);
    height: var(--control-height);
    background: var(--theme-card-bg, #252532);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .filter-button:hover {
    background: var(--theme-card-hover-bg, #2d2d3d);
    color: var(--theme-text, #fff);
  }

  .filter-button.has-active {
    background: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 30%,
      transparent
    );
    color: var(--semantic-info, #3b82f6);
  }

  .filter-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--semantic-info, #3b82f6);
    border-radius: 50%;
    color: var(--theme-text, #fff);
    font-size: 10px;
    font-weight: 700;
  }

  /* Mobile responsive - hide labels on small screens */
  @media (max-width: 480px) {
    .gallery-topbar-controls {
      padding: 8px 12px;
    }

    .sort-chip {
      padding: 0 12px;
    }

    .chip-label {
      display: none;
    }

    .sort-chip i {
      font-size: 16px;
    }
  }
</style>
