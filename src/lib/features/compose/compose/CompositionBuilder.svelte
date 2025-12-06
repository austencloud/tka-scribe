<script lang="ts">
  /**
   * CompositionBuilder - Unified composition canvas and playback
   *
   * This component replaces the old ArrangeTab + PlaybackTab architecture
   * with a single unified view where you build and play compositions
   * in the same interface.
   *
   * Features:
   * - Layout-first composition (choose grid, configure cells)
   * - Inline playback (no separate overlay)
   * - Toggle between live preview and static thumbnails
   * - Overlay controls on hover/tap
   * - Templates accessible via button (secondary)
   * - Inline inspector panel on desktop (no overlay drawers)
   */

  import { onMount } from "svelte";
  import { getCompositionState } from "./state/composition-state.svelte";
  import CompositionCanvas from "./components/canvas/CompositionCanvas.svelte";
  import CanvasControls from "./components/controls/CanvasControls.svelte";
  import TemplatesSheet from "./components/sheets/TemplatesSheet.svelte";
  import CellConfigSheet from "./components/sheets/CellConfigSheet.svelte";
  import CellInspector from "./components/panels/CellInspector.svelte";

  // Get singleton state (renamed to avoid conflict with $state rune)
  const compState = getCompositionState();

  // Reactive bindings
  const composition = $derived(compState.composition);
  const isPlaying = $derived(compState.isPlaying);
  const isPreviewing = $derived(compState.isPreviewing);
  const showOverlayControls = $derived(compState.showOverlayControls);
  const isTemplatesOpen = $derived(compState.isTemplatesOpen);
  const isCellConfigOpen = $derived(compState.isCellConfigOpen);
  const selectedCellId = $derived(compState.selectedCellId);

  // Detect desktop vs mobile for inspector placement
  let isDesktop = $state(false);

  // Interaction tracking for overlay visibility
  let lastInteraction = $state(Date.now());
  let hideControlsTimeout: number | null = null;

  // Auto-hide controls after inactivity during playback
  $effect(() => {
    if (isPlaying && !isPreviewing) {
      if (hideControlsTimeout) clearTimeout(hideControlsTimeout);

      hideControlsTimeout = window.setTimeout(() => {
        if (isPlaying) {
          compState.setShowOverlayControls(false);
        }
      }, 3000);
    } else {
      compState.setShowOverlayControls(true);
    }
  });

  function handleInteraction() {
    lastInteraction = Date.now();
    compState.setShowOverlayControls(true);
  }

  function handleCellClick(cellId: string) {
    handleInteraction();

    if (isPlaying) {
      // During playback, just show overlay briefly
      return;
    }

    // Select cell for configuration
    // On desktop, inline inspector shows automatically
    // On mobile, opens drawer
    compState.openCellConfig(cellId);
  }

  function updateDesktopState() {
    isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
  }

  onMount(() => {
    console.log("🎨 CompositionBuilder mounted");
    updateDesktopState();

    // Listen for resize to update desktop state
    window.addEventListener("resize", updateDesktopState);
    return () => window.removeEventListener("resize", updateDesktopState);
  });
</script>

<div
  class="composition-builder"
  class:with-inspector={isDesktop}
  onmousemove={handleInteraction}
  ontouchstart={handleInteraction}
  role="application"
  aria-label="Composition Builder"
>
  <!-- Main Canvas Area -->
  <div class="canvas-area">
    <CompositionCanvas
      {composition}
      {isPlaying}
      {isPreviewing}
      {selectedCellId}
      onCellClick={handleCellClick}
    />

    <!-- Overlay Controls -->
    {#if showOverlayControls}
      <div class="overlay-controls" class:playing={isPlaying}>
        <CanvasControls />
      </div>
    {/if}
  </div>

  <!-- Inline Inspector Panel (desktop only) -->
  {#if isDesktop}
    <CellInspector />
  {/if}

  <!-- Templates Sheet (Drawer) -->
  <TemplatesSheet
    isOpen={isTemplatesOpen}
    onClose={() => compState.closeTemplates()}
    onSelectTemplate={(id: string) => compState.applyTemplate(id)}
  />

  <!-- Cell Configuration Sheet (Drawer - mobile only) -->
  {#if !isDesktop}
    <CellConfigSheet
      isOpen={isCellConfigOpen}
      cellId={selectedCellId}
      onClose={() => compState.closeCellConfig()}
    />
  {/if}
</div>

<style>
  .composition-builder {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(
      135deg,
      rgba(15, 15, 25, 1) 0%,
      rgba(10, 10, 20, 1) 100%
    );
    overflow: hidden;
    container-type: size;
    container-name: builder;
  }

  /* Side-by-side layout when inspector is present */
  .composition-builder.with-inspector {
    flex-direction: row;
  }

  .canvas-area {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Fluid padding based on container size */
    /* Extra bottom padding to account for overlay controls bar */
    padding: clamp(8px, 2cqi, 24px);
    padding-bottom: clamp(80px, 12cqb, 120px);
    min-height: 0;
    min-width: 0;
    container-type: size;
    container-name: canvas;
  }

  /* Overlay Controls */
  .overlay-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: clamp(12px, 3cqi, 24px);
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      transparent 100%
    );
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: 10;
  }

  .overlay-controls.playing {
    opacity: 0.9;
  }

  /* Hide overlay on mobile when playing (tap to show) */
  @media (hover: none) and (pointer: coarse) {
    .overlay-controls.playing {
      opacity: 0.7;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .overlay-controls {
      transition: none;
    }
  }
</style>
