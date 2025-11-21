<script lang="ts">
  import type { ExploreSortMethod, SequenceData } from "$shared";
  import Drawer from "../../../../shared/foundation/ui/Drawer.svelte";
  import { FilterModal, SequenceDetailContent } from "../../gallery";
  import ViewPresetsSheet from "../../gallery/filtering/components/ViewPresetsSheet.svelte";
  import SortJumpSheet from "../../gallery/navigation/components/SortJumpSheet.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";

  interface Props {
    isMobile: boolean;
    drawerWidth: string;
    currentFilter: any;
    currentSortMethod: ExploreSortMethod;
    availableSections: any[];
    availableSequenceLengths: number[];
    onFilterChange: (value: any) => void;
    onSortMethodChange: (value: ExploreSortMethod) => void;
    onSectionClick: (value: string) => void;
    onDetailPanelAction: (value: string, value2: SequenceData) => void;
    onCloseDetailPanel: () => void;
  }

  let {
    isMobile,
    drawerWidth,
    currentFilter,
    currentSortMethod,
    availableSections,
    availableSequenceLengths,
    onFilterChange,
    onSortMethodChange,
    onSectionClick,
    onDetailPanelAction,
    onCloseDetailPanel,
  }: Props = $props();
</script>

<!-- View Presets Sheet (Mobile) -->
{#if isMobile}
  <Drawer
    isOpen={galleryPanelManager.isViewPresetsOpen}
    placement="bottom"
    onOpenChange={(open) => {
      if (!open) galleryPanelManager.close();
    }}
  >
    <div class="drawer-header">
      <h2>View Presets</h2>
      <button
        class="drawer-close-btn"
        onclick={() => galleryPanelManager.close()}
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <ViewPresetsSheet
      {currentFilter}
      onFilterChange={(preset) => {
        onFilterChange(preset);
        galleryPanelManager.close();
      }}
    />
  </Drawer>
{/if}

<!-- Sort & Jump Sheet (Mobile) -->
{#if isMobile}
  <Drawer
    isOpen={galleryPanelManager.isSortJumpOpen}
    placement="bottom"
    onOpenChange={(open) => {
      if (!open) galleryPanelManager.close();
    }}
  >
    <div class="drawer-header">
      <h2>Sort & Navigate</h2>
      <button
        class="drawer-close-btn"
        onclick={() => galleryPanelManager.close()}
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <SortJumpSheet
      {currentSortMethod}
      {availableSections}
      onSortMethodChange={(method) => {
        onSortMethodChange(method);
        galleryPanelManager.close();
      }}
      {onSectionClick}
    />
  </Drawer>
{/if}

<!-- Filters Panel (Both Mobile & Desktop) -->
<div style:--drawer-width={drawerWidth}>
  <Drawer
    isOpen={galleryPanelManager.isFiltersOpen}
    placement={isMobile ? "bottom" : "right"}
    class="filters-drawer"
    showHandle={false}
    closeOnBackdrop={false}
    backdropClass={!isMobile ? "transparent-backdrop" : ""}
    onOpenChange={(open) => {
      // Only close if drawer is actually closing AND we're not in a panel transition
      if (!open && galleryPanelManager.isFiltersOpen) {
        galleryPanelManager.close();
      }
    }}
  >
    <div class="drawer-header">
      <h2>Advanced Filters</h2>
      <button
        class="drawer-close-btn"
        onclick={() => galleryPanelManager.close()}
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <FilterModal
      {currentFilter}
      {availableSequenceLengths}
      {onFilterChange}
      onClose={() => galleryPanelManager.close()}
    />
  </Drawer>
</div>

<!-- Detail Panel (Unified for Both Mobile & Desktop) -->
<div style:--drawer-width={drawerWidth}>
  <Drawer
    isOpen={galleryPanelManager.isDetailOpen}
    placement={isMobile ? "bottom" : "right"}
    class="detail-drawer"
    showHandle={false}
    closeOnBackdrop={false}
    backdropClass={!isMobile ? "transparent-backdrop" : ""}
    onOpenChange={(open) => {
      // Only close if drawer is actually closing AND we're not in a panel transition
      if (!open && galleryPanelManager.isDetailOpen) {
        onCloseDetailPanel();
      }
    }}
  >
    {#if galleryPanelManager.activeSequence}
      <div class="detail-content-wrapper">
        <SequenceDetailContent
          sequence={galleryPanelManager.activeSequence}
          onClose={onCloseDetailPanel}
          onAction={onDetailPanelAction}
        />
      </div>
    {/if}
  </Drawer>
</div>

<style>
  /* Style the detail drawer with dynamic width and integrated appearance */
  :global(.detail-drawer.drawer-content[data-placement="right"]) {
    width: var(--drawer-width, min(600px, 90vw));
    /* Animate both transform (slide) and width changes for cohesive motion */
    transition:
      transform 350ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 350ms cubic-bezier(0.32, 0.72, 0, 1),
      width 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    /* Respect top bar - start below it */
    top: 64px !important;
    height: calc(100vh - 64px) !important;
    /* Integrated, native feel - transparent background, no hard edges */
    background: rgba(20, 20, 30, 0.7) !important;
    backdrop-filter: blur(20px) !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: -2px 0 16px rgba(0, 0, 0, 0.15) !important;
  }

  /* Subtle vertical grip indicator on left edge for swipe affordance */
  :global(.detail-drawer.drawer-content[data-placement="right"]::before) {
    content: "";
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 48px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 10%,
      rgba(255, 255, 255, 0.2) 90%,
      transparent 100%
    );
    border-radius: 2px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  :global(.detail-drawer.drawer-content[data-placement="right"]:hover::before) {
    opacity: 1;
  }

  /* Position close button more prominently in top right corner */
  :global(.detail-drawer .close-button) {
    top: 20px !important;
    right: 20px !important;
    width: 36px !important;
    height: 36px !important;
    background: rgba(255, 255, 255, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    z-index: 100 !important;
  }

  :global(.detail-drawer .close-button:hover) {
    background: rgba(255, 255, 255, 0.25) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }

  /* Transparent backdrop for desktop - allows clicking through to grid */
  :global(.drawer-overlay.transparent-backdrop) {
    background: transparent !important;
    backdrop-filter: none !important;
    pointer-events: none !important;
  }

  /* Detail content wrapper - absolute positioning for true crossfade */
  .detail-content-wrapper {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Drawer Headers */
  :global(.drawer-content) .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  :global(.drawer-content) .drawer-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  :global(.drawer-content) .drawer-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :global(.drawer-content) .drawer-close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 1);
  }

  :global(.drawer-content) .drawer-close-btn:active {
    transform: scale(0.95);
  }

  /* Mobile drawer header adjustments */
  @media (max-width: 768px) {
    :global(.drawer-content) .drawer-header {
      padding: 16px 20px;
    }

    :global(.drawer-content) .drawer-header h2 {
      font-size: 18px;
    }
  }

  /* Style the filters drawer with same integrated appearance as detail drawer */
  :global(.filters-drawer.drawer-content[data-placement="right"]) {
    width: var(--drawer-width, min(600px, 90vw));
    /* Animate both transform (slide) and width changes for cohesive motion */
    transition:
      transform 350ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 350ms cubic-bezier(0.32, 0.72, 0, 1),
      width 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    /* Respect top bar - start below it */
    top: 64px !important;
    height: calc(100vh - 64px) !important;
    /* Integrated, native feel - transparent background, no hard edges */
    background: rgba(20, 20, 30, 0.7) !important;
    backdrop-filter: blur(20px) !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: -2px 0 16px rgba(0, 0, 0, 0.15) !important;
  }

  /* Subtle vertical grip indicator on left edge for swipe affordance */
  :global(.filters-drawer.drawer-content[data-placement="right"]::before) {
    content: "";
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 48px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 10%,
      rgba(255, 255, 255, 0.2) 90%,
      transparent 100%
    );
    border-radius: 2px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  :global(
    .filters-drawer.drawer-content[data-placement="right"]:hover::before
  ) {
    opacity: 1;
  }

  /* Position close button in filters drawer */
  :global(.filters-drawer .close-button) {
    top: 20px !important;
    right: 20px !important;
    width: 36px !important;
    height: 36px !important;
    background: rgba(255, 255, 255, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    z-index: 100 !important;
  }

  :global(.filters-drawer .close-button:hover) {
    background: rgba(255, 255, 255, 0.25) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }

  /* Mobile: Make detail drawer full-height bottom sheet */
  :global(.detail-drawer.drawer-content[data-placement="bottom"]) {
    max-height: 100vh !important;
    height: 100vh !important;
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
  }

  /* Mobile: Make filters drawer full-height bottom sheet */
  :global(.filters-drawer.drawer-content[data-placement="bottom"]) {
    max-height: 100vh !important;
    height: 100vh !important;
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
  }
</style>
