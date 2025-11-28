<script lang="ts">
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import { ExploreSortMethod } from "../domain";
  import { ViewPresetsDropdown, NavigationDropdown } from "../../gallery";

  interface Props {
    isMobile: boolean;
    currentFilter: any;
    currentSortMethod: ExploreSortMethod;
    availableSections: any[];
    onFilterChange: (filter: any) => void;
    onSortMethodChange: (method: ExploreSortMethod) => void;
    onSectionClick: (sectionId: string) => void;
  }

  let {
    isMobile,
    currentFilter,
    currentSortMethod,
    availableSections,
    onFilterChange,
    onSortMethodChange,
    onSectionClick,
  }: Props = $props();
</script>

<div class="explore-controls">
  <!-- View Presets Control -->
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
      <ViewPresetsDropdown {currentFilter} {onFilterChange} />
    {/if}
  </div>

  <!-- Sort and Jump Control -->
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
        {currentSortMethod}
        {availableSections}
        {onSectionClick}
        {onSortMethodChange}
      />
    {/if}
  </div>

  <!-- Advanced Filter Button -->
  <div class="control-item">
    <button
      class="advanced-filter-button"
      onclick={() => galleryPanelManager.openFilters()}
      type="button"
      aria-label="Advanced filters"
    >
      <i class="fas fa-sliders-h"></i>
      <span>Filters</span>
    </button>
  </div>
</div>

<style>
  .explore-controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .control-item {
    display: flex;
  }

  /* Mobile Control Buttons */
  .mobile-control-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .mobile-control-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .mobile-control-button:active {
    transform: scale(0.98);
  }

  /* Advanced Filter Button */
  .advanced-filter-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .advanced-filter-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .advanced-filter-button:active {
    transform: scale(0.98);
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .mobile-control-button,
    .advanced-filter-button {
      padding: 8px 12px;
      font-size: 0.875rem;
    }

    .mobile-control-button span,
    .advanced-filter-button span {
      display: none;
    }

    .mobile-control-button i,
    .advanced-filter-button i {
      font-size: 1rem;
    }
  }

  /* Small mobile adjustments */
  @media (max-width: 380px) {
    .explore-controls {
      gap: 8px;
    }

    .mobile-control-button,
    .advanced-filter-button {
      padding: 6px 10px;
    }
  }
</style>
