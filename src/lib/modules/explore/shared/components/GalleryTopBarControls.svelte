<!--
Gallery Top Bar Controls
Renders the Gallery controls in the TopBar (mobile & desktop)
Uses shared gallery controls state from ExploreModule (Svelte 5 runes pattern)

Modern Filter UX Pattern:
- Filter chips show active filters (dismissible)
- "Filters" button opens comprehensive filter modal
- Sort control (segmented on desktop, button on mobile)
- Consistent behavior across all breakpoints
-->
<script lang="ts">
  import { galleryControlsManager } from "../state/gallery-controls-state.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import { resolve, TYPES, type IDeviceDetector } from "$shared";
  import type { ResponsiveSettings } from "$shared/device/domain/models/device-models";
  import { onMount } from "svelte";
  import { FilterChips } from "../../gallery/filtering/components";
  import SegmentedControl from "./SegmentedControl.svelte";
  import { ExploreSortMethod } from "../domain/enums/explore-enums";

  // Get gallery controls from global reactive state (provided by ExploreModule)
  const galleryControls = $derived(galleryControlsManager.current);

  // Services
  let deviceDetector: IDeviceDetector | null = null;

  // Reactive responsive settings from DeviceDetector
  let responsiveSettings = $state<ResponsiveSettings | null>(null);

  // Device detection for UI adaptation
  const isMobile = $derived(
    responsiveSettings?.isMobile || responsiveSettings?.isTablet || false
  );

  // Check if there's an active filter
  const hasActiveFilter = $derived(
    galleryControls?.currentFilter?.type !== "all"
  );

  // Get filter count for badge (1 if any filter is active)
  const filterCount = $derived(hasActiveFilter ? 1 : 0);

  onMount(() => {
    // Resolve DeviceDetector service
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);

      // Get initial responsive settings
      responsiveSettings = deviceDetector.getResponsiveSettings();

      // Return cleanup function from onCapabilitiesChanged
      return (
        deviceDetector.onCapabilitiesChanged(() => {
          responsiveSettings = deviceDetector!.getResponsiveSettings();
        }) || undefined
      );
    } catch (error) {
      console.warn(
        "GalleryTopBarControls: Failed to resolve DeviceDetector",
        error
      );
    }

    return undefined;
  });

  // Handle removing filter (clear to "all")
  function handleRemoveFilter() {
    if (galleryControls) {
      galleryControls.onFilterChange("all");
    }
  }
</script>

{#if galleryControls}
  <div class="gallery-topbar-controls">
    <div class="controls-group">
      <!-- Filter Chips (if active) -->
      {#if hasActiveFilter}
        <div class="filter-chips-container">
          <FilterChips
            currentFilter={galleryControls.currentFilter}
            onRemoveFilter={handleRemoveFilter}
          />
        </div>
      {/if}

      <!-- Filters Button (with badge if active) -->
      <div class="control-item">
        <button
          class="filters-button"
          class:has-active={hasActiveFilter}
          onclick={() => galleryPanelManager.openFilters()}
          type="button"
          aria-label="Filters{filterCount > 0 ? ` (${filterCount} active)` : ''}"
          title="Filters"
        >
          <i class="fas fa-sliders-h"></i>
          <span class="button-label">Filters</span>
          {#if filterCount > 0}
            <span class="badge" aria-hidden="true">{filterCount}</span>
          {/if}
        </button>
      </div>

      <!-- Sort Method Control -->
      <div class="control-item">
        {#if isMobile}
          <!-- Mobile: Button to trigger bottom sheet -->
          <button
            class="mobile-control-button"
            onclick={() => galleryPanelManager.openSortJump()}
            type="button"
            aria-label="Sort and navigate"
          >
            <i class="fas fa-sort"></i>
            <span>Sort</span>
          </button>
        {:else}
          <!-- Desktop: Segmented control for sort -->
          <SegmentedControl
            segments={[
              {
                value: ExploreSortMethod.ALPHABETICAL,
                label: "Letter",
                icon: "fa-font",
              },
              {
                value: ExploreSortMethod.SEQUENCE_LENGTH,
                label: "Length",
                icon: "fa-ruler-horizontal",
              },
              {
                value: ExploreSortMethod.DATE_ADDED,
                label: "Date",
                icon: "fa-calendar",
              },
            ]}
            value={galleryControls.currentSortMethod}
            onChange={galleryControls.onSortMethodChange}
            ariaLabel="Sort method"
          />
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .gallery-topbar-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    padding: 0;
  }

  .controls-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .control-item {
    flex-shrink: 0;
  }

  .filter-chips-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Filters Button - Modern pill style with badge */
  .filters-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    font-weight: 590;
    letter-spacing: -0.2px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    backdrop-filter: blur(12px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .filters-button:hover {
    background: rgba(255, 255, 255, 0.14);
    color: rgba(255, 255, 255, 0.98);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .filters-button:active {
    transform: translateY(0) scale(0.97);
  }

  .filters-button.has-active {
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: rgba(59, 130, 246, 1);
  }

  .filters-button.has-active:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
  }

  .filters-button i {
    font-size: 14px;
  }

  .button-label {
    font-size: 14px;
  }

  /* Badge */
  .badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: rgba(59, 130, 246, 0.9);
    color: white;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .filters-button.has-active .badge {
    background: rgba(255, 255, 255, 0.95);
    color: rgb(59, 130, 246);
  }

  /* Mobile Control Buttons - iOS Native Style */
  .mobile-control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 14px;
    background: rgba(120, 120, 128, 0.24);
    border: none;
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    font-weight: 590;
    letter-spacing: -0.24px;
    cursor: pointer;
    transition: background 0.15s ease-out;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }

  .mobile-control-button:active {
    background: rgba(120, 120, 128, 0.32);
    transition: background 0s;
  }

  .mobile-control-button i {
    font-size: 16px;
    opacity: 0.95;
  }

  /* Mobile: Hide button label on very small screens */
  @media (max-width: 480px) {
    .controls-group {
      gap: 8px;
    }

    .filters-button,
    .mobile-control-button {
      padding: 6px 11px;
      font-size: 13px;
    }

    .button-label {
      font-size: 13px;
    }

    .badge {
      min-width: 16px;
      height: 16px;
      font-size: 10px;
    }
  }

  /* Very small screens - icon only for filters button */
  @media (max-width: 380px) {
    .button-label {
      display: none;
    }

    .filters-button {
      padding: 8px 12px;
      gap: 0;
    }

    .filters-button.has-active {
      gap: 7px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .filters-button,
    .mobile-control-button {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .filters-button {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid white;
    }

    .filters-button.has-active {
      background: rgba(59, 130, 246, 0.8);
      border: 2px solid white;
    }

    .mobile-control-button {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid white;
    }

    .badge {
      border: 1px solid white;
    }
  }
</style>
