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
  import { NavigationDropdown } from "../../gallery";
  import { ViewPresetsDropdown } from "../../gallery/filtering/components";

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
      <!-- 1. View Presets Control -->
      <div class="control-item">
        {#if isMobile}
          <!-- Mobile: Button to trigger bottom sheet -->
          <button
            class="mobile-control-button"
            onclick={() => galleryPanelManager.openViewPresets()}
            type="button"
            aria-label="View presets"
          >
            <i class="fas fa-eye"></i>
            <span>View</span>
          </button>
        {:else}
          <!-- Desktop: Dropdown -->
          <ViewPresetsDropdown
            currentFilter={galleryControls.currentFilter}
            onFilterChange={galleryControls.onFilterChange}
          />
        {/if}
      </div>

      <!-- 2. Sort & Jump Control -->
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
          <!-- Desktop: Dropdown -->
          <NavigationDropdown
            currentSortMethod={galleryControls.currentSortMethod}
            availableSections={galleryControls.availableNavigationSections}
            onSectionClick={galleryControls.scrollToSection}
            onSortMethodChange={galleryControls.onSortMethodChange}
          />
        {/if}
      </div>

      <!-- 3. Advanced Filter Button -->
      <div class="control-item">
        <button
          class="advanced-filter-button"
          onclick={() => {
            if (isMobile) {
              galleryPanelManager.openFilters();
            } else {
              galleryControls.openFilterModal();
            }
          }}
          type="button"
          aria-label="Advanced filters"
        >
          <i class="fas fa-sliders-h"></i>
          <span>Filters</span>
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
    gap: 8px;
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
    background: rgba(120, 120, 128, 0.24); /* iOS quaternary fill */
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px; /* iOS standard font size */
    font-weight: 590; /* iOS semibold weight */
    letter-spacing: -0.24px; /* iOS tracking */
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

  /* Advanced Filter Button - iOS Native Style */
  .advanced-filter-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 14px;
    background: rgba(120, 120, 128, 0.24); /* iOS quaternary fill */
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px; /* iOS standard font size */
    font-weight: 590; /* iOS semibold weight */
    letter-spacing: -0.24px; /* iOS tracking */
    cursor: pointer;
    transition: background 0.15s ease-out;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }

  .advanced-filter-button:active {
    background: rgba(120, 120, 128, 0.32);
    transition: background 0s;
  }

  .advanced-filter-button i {
    font-size: 16px;
    opacity: 0.95;
  }

  /* Compact styling for TopBar */
  @media (max-width: 1200px) {
    .controls-group {
      gap: 8px;
    }

    .advanced-filter-button {
      padding: 8px 12px;
      font-size: 0.875rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .advanced-filter-button {
      transition: none;
    }
  }
</style>
