<!--
  SingleControlsPanel.svelte

  Unified controls panel containing:
  - Playback controls (play/pause, stop, loop)
  - Speed/BPM controls
  - Trail settings panel (expandable on mobile, always visible on desktop)
  - Export button

  Layout uses golden ratio (φ = 1.618) for harmonious proportions
-->
<script lang="ts">
  import {
    AnimationControlsPanel,
    ExportButton,
    LoopButton,
    PlayPauseButton,
    StopButton,
  } from "../../../shared/components";

  // Props
  let {
    isPlaying = $bindable(false),
    shouldLoop = $bindable(false),
    speed,
    onStop,
    onSpeedChange,
  }: {
    isPlaying: boolean;
    shouldLoop: boolean;
    speed: number;
    onStop: () => void;
    onSpeedChange: (speed: number) => void;
  } = $props();

  // Mobile detection and expand state
  let isMobile = $state(false);
  let isExpanded = $state(false);
  let scrollContainerRef = $state<HTMLDivElement | null>(null);

  // Initialize mobile detection
  $effect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  // Playback toggle handler
  function handlePlaybackToggle() {
    isPlaying = !isPlaying;
  }

  // Playback start handler
  function handlePlaybackStart() {
    if (!isPlaying) {
      isPlaying = true;
    }
  }

  // Motion visibility (delegated to AnimationControlsPanel via animationSettings)
  function handleToggleBlue() {
    // Handled by animationSettings singleton in AnimationControlsPanel
  }

  function handleToggleRed() {
    // Handled by animationSettings singleton in AnimationControlsPanel
  }

  function handleToggleExpanded() {
    isExpanded = !isExpanded;
  }

  // Prevent back navigation when scrolling (mobile only)
  function preventBackNavAction(
    node: HTMLElement,
    isSideBySideLayout: boolean
  ) {
    if (isSideBySideLayout) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0]?.clientX ?? 0;
      startY = e.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = (e.touches[0]?.clientX ?? 0) - startX;
      const deltaY = (e.touches[0]?.clientY ?? 0) - startY;

      // If horizontal swipe is larger than vertical, prevent default
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    };

    node.addEventListener("touchstart", handleTouchStart, { passive: true });
    node.addEventListener("touchmove", handleTouchMove, { passive: false });

    return {
      destroy() {
        node.removeEventListener("touchstart", handleTouchStart);
        node.removeEventListener("touchmove", handleTouchMove);
      },
    };
  }

  function handleScroll(_e: Event) {
    // Handle scroll events if needed
  }
</script>

<div class="unified-controls-panel">
  <!-- Primary Controls Row (Always Visible) -->
  <div class="primary-controls">
    <!-- Playback Controls -->
    <div class="playback-group">
      <PlayPauseButton bind:isPlaying onToggle={handlePlaybackToggle} />
      <StopButton onclick={onStop} />
      <LoopButton bind:isLooping={shouldLoop} activeColor="purple" />
    </div>

    <!-- Export Button -->
    <ExportButton label="Export" />
  </div>

  <!-- Animation Controls Panel (Speed + Trail Settings) -->
  <div class="animation-controls-container">
    <AnimationControlsPanel
      {speed}
      {isPlaying}
      blueMotionVisible={true}
      redMotionVisible={true}
      isSideBySideLayout={!isMobile}
      {isExpanded}
      bind:scrollContainerRef
      {onSpeedChange}
      onPlaybackStart={handlePlaybackStart}
      onPlaybackToggle={handlePlaybackToggle}
      onToggleBlue={handleToggleBlue}
      onToggleRed={handleToggleRed}
      onToggleExpanded={handleToggleExpanded}
      {preventBackNavAction}
      onScroll={handleScroll}
    />
  </div>
</div>

<style>
  /* ===========================
     UNIFIED CONTROLS PANEL
     Golden Ratio Layout: φ = 1.618
     Fibonacci spacing: 8, 13, 21, 34
     =========================== */

  .unified-controls-panel {
    display: flex;
    flex-direction: column;
    gap: 13px; /* Fibonacci spacing */
    padding: 21px; /* Fibonacci spacing */
    background: linear-gradient(
      145deg,
      rgba(15, 15, 25, 0.95) 0%,
      rgba(10, 10, 18, 0.98) 100%
    );
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    flex-shrink: 0;
  }

  /* ===========================
     PRIMARY CONTROLS
     Play/Pause/Stop/Loop + Export
     =========================== */

  .primary-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 21px; /* Fibonacci spacing */
  }

  .playback-group {
    display: flex;
    gap: 8px; /* Fibonacci spacing */
  }

  /* ===========================
     ANIMATION CONTROLS CONTAINER
     Contains speed controls + trail settings panel
     =========================== */

  .animation-controls-container {
    width: 100%;
  }

  /* ===========================
     RESPONSIVE DESIGN
     Mobile: Stack vertically, hide export text
     Desktop: Maintain horizontal layout
     =========================== */

  @media (max-width: 768px) {
    .unified-controls-panel {
      padding: 13px; /* Tighter on mobile */
      gap: 13px;
    }

    .primary-controls {
      flex-wrap: wrap;
      gap: 13px;
    }

    .playback-group {
      flex: 1;
      justify-content: center;
    }
  }

  /* Desktop: Side-by-side layout optimization */
  @media (min-width: 769px) {
    .unified-controls-panel {
      padding: 21px 34px; /* More horizontal padding on desktop */
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-contrast: high) {
    .unified-controls-panel {
      border-top-width: 2px;
    }
  }
</style>
