<!--
  MobileToolViewToggle.svelte

  Toggle button for switching between Beat Grid and Controls view
  on mobile animation panel. Shows icon for non-active view.
-->
<script lang="ts">
  export type MobileToolView = "controls" | "beat-grid";

  let {
    activeView = "controls",
    onToggle = () => {},
  }: {
    activeView?: MobileToolView;
    onToggle?: () => void;
  } = $props();

  const isShowingGrid = $derived(activeView === "beat-grid");
</script>

<button
  class="tool-view-toggle"
  class:showing-grid={isShowingGrid}
  onclick={onToggle}
  aria-label={isShowingGrid ? "Show animation controls" : "Show beat grid"}
  title={isShowingGrid ? "Show Controls" : "Show Beat Grid"}
  type="button"
>
  {#if isShowingGrid}
    <!-- Show sliders icon to indicate "switch to controls" -->
    <i class="fas fa-sliders-h"></i>
  {:else}
    <!-- Show grid icon to indicate "switch to beat grid" -->
    <i class="fas fa-th"></i>
  {/if}
</button>

<style>
  .tool-view-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    font-size: 16px;
  }

  .tool-view-toggle.showing-grid {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.2) 0%,
      rgba(124, 58, 237, 0.15) 100%
    );
    border-color: rgba(139, 92, 246, 0.4);
    color: rgba(196, 181, 253, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .tool-view-toggle:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.9);
      transform: scale(1.05);
    }

    .tool-view-toggle.showing-grid:hover {
      background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.3) 0%,
        rgba(124, 58, 237, 0.25) 100%
      );
      border-color: rgba(139, 92, 246, 0.6);
    }
  }

  .tool-view-toggle:active {
    transform: scale(0.95);
  }
</style>
