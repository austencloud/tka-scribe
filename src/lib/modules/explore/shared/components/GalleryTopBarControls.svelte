<!--
Gallery Top Bar Controls
Renders the Gallery controls in the TopBar (mobile & desktop)
Uses shared gallery controls state from ExploreModule (Svelte 5 runes pattern)
-->
<script lang="ts">
  import { galleryControlsManager } from "../state/gallery-controls-state.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import { resolve, TYPES, type IDeviceDetector } from "$shared";
  import type { ResponsiveSettings } from "$shared/device/domain/models/device-models";
  import { onMount } from "svelte";
  import { ViewPresetsDropdown } from "../../gallery/filtering/components";
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
</script>

{#if galleryControls}
  <div class="gallery-topbar-controls">
    <div class="controls-group">
      <!-- 1. View Presets Dropdown -->
      <div class="control-item">
        {#if isMobile}
          <!-- Mobile: Button to trigger bottom sheet -->
          <button
            class="mobile-control-button"
            onclick={() => galleryPanelManager.openViewPresets()}
            type="button"
            aria-label="View presets"
          >
            <i class="fas fa-th"></i>
            <span>View</span>
          </button>
        {:else}
          <!-- Desktop: Modern dropdown -->
          <ViewPresetsDropdown
            currentFilter={galleryControls.currentFilter}
            onFilterChange={galleryControls.onFilterChange}
          />
        {/if}
      </div>

      <!-- 2. Sort Method Control -->
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

      <!-- 3. Advanced Filters (Icon only on desktop) -->
      <div class="control-item">
        <button
          class="filters-button"
          onclick={() => galleryPanelManager.openFilters()}
          type="button"
          aria-label="Advanced filters"
          title="Advanced filters"
        >
          <i class="fas fa-sliders-h"></i>
          {#if isMobile}
            <span>Filters</span>
          {/if}
        </button>
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
    flex-wrap: nowrap;
  }

  .control-item {
    flex-shrink: 0;
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
    border-radius: 100px; /* Full pill */
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

  /* Advanced Filters Button - Modern icon-only style for desktop */
  .filters-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 9px;
    min-width: 38px;
    min-height: 38px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 100px; /* Circular for icon-only */
    color: rgba(255, 255, 255, 0.85);
    font-size: 15px;
    font-weight: 590;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
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
    background: rgba(255, 255, 255, 0.18);
  }

  .filters-button i {
    font-size: 15px;
  }

  /* Mobile: Show label and make pill-shaped */
  @media (max-width: 768px) {
    .filters-button {
      padding: 7px 14px;
      border-radius: 100px;
      gap: 5px;
      min-width: auto;
      background: rgba(120, 120, 128, 0.24);
    }

    .filters-button:active {
      background: rgba(120, 120, 128, 0.32);
    }
  }

  /* Compact styling for smaller screens */
  @media (max-width: 480px) {
    .controls-group {
      gap: 8px;
    }

    .mobile-control-button,
    .filters-button {
      padding: 6px 11px;
      font-size: 14px;
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

    .mobile-control-button {
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid white;
    }
  }
</style>
