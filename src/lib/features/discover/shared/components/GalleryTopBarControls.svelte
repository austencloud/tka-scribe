<!--
Gallery Top Bar Controls - 2026 Modern Design (Compact)
- Sort chips (always visible)
- Filter button opens drawer with scope toggle + drill-down filters
- Active filter shown as dismissible chip
-->
<script lang="ts">
  import { galleryControlsManager } from "../state/gallery-controls-state.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { ExploreSortMethod } from "../domain/enums/discover-enums";

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
    { id: ExploreSortMethod.DIFFICULTY_LEVEL, label: "Level", icon: "fa-signal" },
    { id: ExploreSortMethod.SEQUENCE_LENGTH, label: "Length", icon: "fa-ruler" },
  ];

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
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
    <!-- Sort Chips + Filter Button Row -->
    <div class="controls-row">
      <!-- Sort Chips -->
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
{/if}

<style>
  .gallery-topbar-controls {
    display: flex;
    align-items: center;
    padding: 10px 16px;
    background: #12121a;
    width: 100%;
  }

  /* Controls Row */
  .controls-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    flex-wrap: wrap;
  }

  /* Sort Chips */
  .sort-chips {
    display: flex;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .sort-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 14px;
    min-height: 48px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .sort-chip:hover {
    background: #2d2d3d;
    color: #fff;
  }

  .sort-chip.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
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
    min-height: 48px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 100px;
    color: #3b82f6;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .active-filter-chip:hover {
    background: rgba(59, 130, 246, 0.25);
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
    width: 48px;
    height: 48px;
    background: #252532;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .filter-button:hover {
    background: #2d2d3d;
    color: #fff;
  }

  .filter-button.has-active {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
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
    background: #3b82f6;
    border-radius: 50%;
    color: #fff;
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
