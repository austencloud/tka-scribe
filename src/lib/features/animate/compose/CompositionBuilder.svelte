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
   */

  import { onMount } from "svelte";
  import { getCompositionState } from "./state/composition-state.svelte";
  import CompositionCanvas from "./components/canvas/CompositionCanvas.svelte";
  import CanvasControls from "./components/controls/CanvasControls.svelte";
  import TemplatesSheet from "./components/sheets/TemplatesSheet.svelte";
  import CellConfigSheet from "./components/sheets/CellConfigSheet.svelte";

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

    // Open cell configuration
    compState.openCellConfig(cellId);
  }

  onMount(() => {
    console.log("🎨 CompositionBuilder mounted");
  });
</script>

<div
  class="composition-builder"
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

  <!-- Templates Sheet (Drawer) -->
  <TemplatesSheet
    isOpen={isTemplatesOpen}
    onClose={() => compState.closeTemplates()}
    onSelectTemplate={(id: string) => compState.applyTemplate(id)}
  />

  <!-- Cell Configuration Sheet (Drawer) -->
  <CellConfigSheet
    isOpen={isCellConfigOpen}
    cellId={selectedCellId}
    onClose={() => compState.closeCellConfig()}
  />
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
  }

  .canvas-area {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md, 16px);
    min-height: 0;
  }

  /* Overlay Controls */
  .overlay-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: var(--spacing-md, 16px);
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
