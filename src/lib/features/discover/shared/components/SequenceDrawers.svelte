<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { BentoFilterPanel, LetterSelectionSheet, PositionOptionsSheet } from "../../gallery/filtering/components/bento-filter";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import SequenceDetailContent from "../../gallery/display/components/SequenceDetailContent.svelte";
  import ViewPresetsSheet from "../../gallery/filtering/components/ViewPresetsSheet.svelte";
  import SortJumpSheet from "../../gallery/navigation/components/SortJumpSheet.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import { ExploreSortMethod } from "../domain/enums/discover-enums";
  import type { ExploreFilterValue } from "$lib/shared/persistence/domain/types/FilteringTypes";

  interface Props {
    isMobile: boolean;
    drawerWidth: string;
    currentFilter: any;
    currentSortMethod: ExploreSortMethod;
    availableSections: any[];
    scope?: "community" | "library";
    onFilterChange: (type: string, value?: any) => void;
    onSortMethodChange: (method: ExploreSortMethod) => void;
    onScopeChange?: (scope: "community" | "library") => void;
    onSectionClick: (sectionId: string) => void;
    onDetailPanelAction: (action: string, sequence: SequenceData) => void;
    onCloseDetailPanel: () => void;
  }

  let {
    isMobile,
    drawerWidth,
    currentFilter,
    currentSortMethod,
    availableSections,
    scope = "community",
    onFilterChange,
    onSortMethodChange,
    onScopeChange = () => {},
    onSectionClick,
    onDetailPanelAction,
    onCloseDetailPanel,
  }: Props = $props();

  // State for sub-sheets
  let isLetterSheetOpen = $state(false);
  let isOptionsSheetOpen = $state(false);

  // Position filter state
  let startPosition = $state<PictographData | null>(null);
  let endPosition = $state<PictographData | null>(null);

  // Derived values for sheets
  const currentLetter = $derived(
    currentFilter.type === "startingLetter" ? (currentFilter.value as string) : null
  );

  // Handler functions
  function handleBentoFilterChange(type: string, value?: ExploreFilterValue) {
    onFilterChange(type, value);
  }

  function handleOpenLetterSheet() {
    isLetterSheetOpen = true;
  }

  function handleLetterSelect(letter: string) {
    onFilterChange("startingLetter", letter);
    isLetterSheetOpen = false;
  }

  function handleLetterClear() {
    onFilterChange("all");
    isLetterSheetOpen = false;
  }

  function handleOpenOptionsSheet() {
    isOptionsSheetOpen = true;
  }

  function handleStartPositionChange(position: PictographData | null) {
    startPosition = position;
    // Apply position filter
    if (position) {
      onFilterChange("startPosition", position);
    } else if (!endPosition) {
      // Only clear if no end position either
      onFilterChange("all");
    }
  }

  function handleEndPositionChange(position: PictographData | null) {
    endPosition = position;
    // Apply position filter
    if (position) {
      onFilterChange("endPosition", position);
    } else if (!startPosition) {
      // Only clear if no start position either
      onFilterChange("all");
    }
  }

  function handleClearAllPositions() {
    startPosition = null;
    endPosition = null;
    onFilterChange("all");
  }
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

<!-- Filters Panel (Both Mobile & Desktop) - Using BentoFilterPanel -->
<div style:--drawer-width={drawerWidth}>
  <Drawer
    isOpen={galleryPanelManager.isFiltersOpen}
    placement={isMobile ? "bottom" : "right"}
    class="filters-drawer"
    showHandle={false}
    closeOnBackdrop={false}
    backdropClass={!isMobile ? "transparent-backdrop" : ""}
    trapFocus={isMobile}
    setInertOnSiblings={isMobile}
    onOpenChange={(open) => {
      // Only close if drawer is actually closing AND we're not in a panel transition
      if (!open && galleryPanelManager.isFiltersOpen) {
        galleryPanelManager.close();
      }
    }}
  >
    <div class="drawer-header">
      <h2>Browse & Filter</h2>
      <button
        class="drawer-close-btn"
        onclick={() => galleryPanelManager.close()}
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="bento-filter-wrapper">
      <BentoFilterPanel
        {currentFilter}
        {scope}
        {startPosition}
        {endPosition}
        onFilterChange={handleBentoFilterChange}
        {onScopeChange}
        onOpenLetterSheet={handleOpenLetterSheet}
        onOpenOptionsSheet={handleOpenOptionsSheet}
      />
    </div>
  </Drawer>
</div>

<!-- Letter Selection Sheet -->
<div style:--drawer-width={isMobile ? "min(600px, 90vw)" : "min(400px, 40vw)"}>
  <Drawer
    isOpen={isLetterSheetOpen}
    placement={isMobile ? "bottom" : "right"}
    class="letter-sheet-drawer"
    showHandle={false}
    onOpenChange={(open) => {
      if (!open) isLetterSheetOpen = false;
    }}
  >
    <div class="drawer-header">
      <h2>Select Letter</h2>
      <button
        class="drawer-close-btn"
        onclick={() => (isLetterSheetOpen = false)}
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="sheet-content">
      <LetterSelectionSheet
        {currentLetter}
        onLetterSelect={handleLetterSelect}
        onClear={handleLetterClear}
      />
    </div>
  </Drawer>
</div>

<!-- Position Options Sheet -->
<div style:--drawer-width={isMobile ? "min(600px, 90vw)" : "min(500px, 50vw)"}>
  <Drawer
    isOpen={isOptionsSheetOpen}
    placement={isMobile ? "bottom" : "right"}
    class="options-sheet-drawer"
    showHandle={false}
    onOpenChange={(open) => {
      if (!open) isOptionsSheetOpen = false;
    }}
  >
    <div class="drawer-header">
      <h2>Position Options</h2>
      <button
        class="drawer-close-btn"
        onclick={() => (isOptionsSheetOpen = false)}
        aria-label="Close"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="sheet-content options-sheet-content">
      <PositionOptionsSheet
        {startPosition}
        {endPosition}
        onStartPositionChange={handleStartPositionChange}
        onEndPositionChange={handleEndPositionChange}
        onClearAll={handleClearAllPositions}
      />
    </div>
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
    trapFocus={isMobile}
    setInertOnSiblings={isMobile}
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
    /* Overlay full content area - covers the gallery controls header */
    top: 0 !important;
    height: 100vh !important;
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

  /* Detail drawer close button - let SequenceDetailContent handle styling */

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

  /* Bento filter wrapper - scrollable container for filter panel */
  .bento-filter-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 0;
    background: #1a1a24;
  }

  /* Modern scrollbar for bento filter panel */
  .bento-filter-wrapper::-webkit-scrollbar {
    width: 6px;
  }

  .bento-filter-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .bento-filter-wrapper::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }

  .bento-filter-wrapper::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Firefox scrollbar for bento filter */
  .bento-filter-wrapper {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }

  /* Sheet content padding */
  .sheet-content {
    padding: 16px 20px 24px;
    background: #1a1a24;
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
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  /* Expand touch target while maintaining visual size */
  :global(.drawer-content) .drawer-close-btn::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 48px;
    min-height: 48px;
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

  /* Style the filters drawer - 2026 solid color design */
  :global(.filters-drawer.drawer-content[data-placement="right"]) {
    width: var(--drawer-width, min(420px, 90vw));
    /* Animate both transform (slide) and width changes for cohesive motion */
    transition:
      transform 350ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 350ms cubic-bezier(0.32, 0.72, 0, 1),
      width 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    /* Overlay full content area - covers the gallery controls header */
    top: 0 !important;
    height: 100vh !important;
    /* 2026 solid color style - no glassmorphism */
    background: #1a1a24 !important;
    border: none !important;
    border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 0 !important;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3) !important;
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
    position: relative;
  }

  /* Expand touch target while maintaining visual size */
  :global(.filters-drawer .close-button::before) {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 48px !important;
    min-height: 48px !important;
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

  /* Mobile: Make filters drawer full-height bottom sheet with solid color */
  :global(.filters-drawer.drawer-content[data-placement="bottom"]) {
    max-height: 100vh !important;
    height: 100vh !important;
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
    background: #1a1a24 !important;
  }

  /* Letter/Length sheet drawer styles - desktop side panel */
  :global(.letter-sheet-drawer.drawer-content[data-placement="right"]),
  :global(.length-sheet-drawer.drawer-content[data-placement="right"]) {
    width: var(--drawer-width, min(400px, 40vw));
    transition:
      transform 350ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 350ms cubic-bezier(0.32, 0.72, 0, 1) !important;
    top: 0 !important;
    height: 100vh !important;
    background: #1a1a24 !important;
    border: none !important;
    border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 0 !important;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3) !important;
  }

  /* Mobile: Letter/Length sheets as bottom sheets */
  :global(.letter-sheet-drawer.drawer-content[data-placement="bottom"]),
  :global(.length-sheet-drawer.drawer-content[data-placement="bottom"]) {
    max-height: 80vh !important;
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
    background: #1a1a24 !important;
  }

  /* Options sheet drawer styles - desktop side panel */
  :global(.options-sheet-drawer.drawer-content[data-placement="right"]) {
    width: var(--drawer-width, min(500px, 50vw));
    transition:
      transform 350ms cubic-bezier(0.32, 0.72, 0, 1),
      opacity 350ms cubic-bezier(0.32, 0.72, 0, 1) !important;
    top: 0 !important;
    height: 100vh !important;
    background: #1a1a24 !important;
    border: none !important;
    border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 0 !important;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3) !important;
  }

  /* Mobile: Options sheet as bottom sheet */
  :global(.options-sheet-drawer.drawer-content[data-placement="bottom"]) {
    max-height: 85vh !important;
    border-top-left-radius: 16px !important;
    border-top-right-radius: 16px !important;
    background: #1a1a24 !important;
  }

  /* Options sheet content - scrollable */
  .options-sheet-content {
    padding: 0;
    overflow-y: auto;
    max-height: calc(100vh - 80px);
  }
</style>
