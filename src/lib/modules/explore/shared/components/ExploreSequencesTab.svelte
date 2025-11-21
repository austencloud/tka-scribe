<script lang="ts">
  import type { SequenceData } from "$shared";
  import ExploreLayout from "./ExploreLayout.svelte";
  import SequenceDrawers from "./SequenceDrawers.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import { SequenceDisplayPanel } from "../../gallery";

  interface Props {
    isMobile: boolean;
    isUIVisible: boolean;
    showDesktopSidebar: boolean;
    drawerWidth: string;
    galleryState: any;
    error: string | null;
    onSequenceAction: (value: string, value2: SequenceData) => Promise<void>;
    onDetailPanelAction: (
      value: string,
      value2: SequenceData
    ) => Promise<void>;
    onCloseDetailPanel: () => void;
    onContainerScroll: (value: CustomEvent<{ scrollTop: number }>) => void;
  }

  let {
    isMobile,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isUIVisible: _isUIVisible,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showDesktopSidebar: _showDesktopSidebar,
    drawerWidth,
    galleryState,
    error,
    onSequenceAction,
    onDetailPanelAction,
    onCloseDetailPanel,
    onContainerScroll,
  }: Props = $props();

  // Debug logging for panel-open class
  $effect(() => {
    const isPanelOpen = galleryPanelManager.isOpen && !isMobile;
    console.log(
      `🎨 GRID: panel-open class=${isPanelOpen}, isOpen=${galleryPanelManager.isOpen}, isMobile=${isMobile}`
    );
  });
</script>

<ExploreLayout>
  {#snippet centerPanel()}
    <div class="sequences-with-detail">
      <div
        class="sequences-main"
        class:panel-open={galleryPanelManager.isOpen && !isMobile}
        style:--drawer-width={drawerWidth}
      >
        <SequenceDisplayPanel
          sequences={galleryState.displayedSequences}
          sections={galleryState.sequenceSections}
          isLoading={galleryState.isLoading}
          {error}
          showSections={galleryState.showSections}
          onAction={onSequenceAction}
          onScroll={onContainerScroll}
        />
      </div>
    </div>
  {/snippet}
</ExploreLayout>

<!-- Drawers -->
<SequenceDrawers
  {isMobile}
  {drawerWidth}
  currentFilter={galleryState.currentFilter}
  currentSortMethod={galleryState.currentSortMethod}
  availableSections={galleryState.availableNavigationSections}
  availableSequenceLengths={galleryState.availableSequenceLengths}
  onFilterChange={galleryState.handleFilterChange}
  onSortMethodChange={(method) => galleryState.handleSortChange(method, "asc")}
  onSectionClick={(sectionId) => {
    galleryState.scrollToSection(sectionId);
    galleryPanelManager.close();
  }}
  {onDetailPanelAction}
  {onCloseDetailPanel}
/>

<style>
  /* Container for sequences grid + detail panel */
  .sequences-with-detail {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: 100%;
    transition: all 0.3s ease;
  }

  /* Main sequences area (grid) */
  .sequences-main {
    flex: 1;
    overflow-y: auto; /* Allow scrolling */
    overflow-x: hidden;
    min-width: 0; /* Allow flexbox shrinking */
    --drawer-width: min(
      600px,
      90vw
    ); /* Default width, overridden by inline style */
    /* No transition on padding - let animate-css-grid handle the smoothness */
  }

  /* Add padding when panel is open (desktop only) - simple, standard approach */
  .sequences-main.panel-open {
    padding-right: var(--drawer-width);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .sequences-with-detail,
    .sequences-main {
      transition: none;
    }
  }
</style>
