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
  import AnimationControlsPanel from "../../../shared/components/AnimationControlsPanel.svelte";

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
      <button
        class="control-btn play-btn"
        class:playing={isPlaying}
        aria-label={isPlaying ? "Pause" : "Play"}
        onclick={handlePlaybackToggle}
      >
        <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
      </button>

      <button class="control-btn" aria-label="Stop" onclick={onStop}>
        <i class="fas fa-stop"></i>
      </button>

      <button
        class="control-btn"
        class:active={shouldLoop}
        aria-label="Loop"
        onclick={() => (shouldLoop = !shouldLoop)}
      >
        <i class="fas fa-repeat"></i>
      </button>
    </div>

    <!-- Export Button -->
    <button class="export-btn">
      <i class="fas fa-download"></i>
      <span>Export</span>
    </button>
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

  .control-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.06);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .control-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
  }

  .control-btn:active {
    transform: scale(0.95);
  }

  .control-btn.active {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.3) 0%,
      rgba(124, 58, 237, 0.3) 100%
    );
    border-color: rgba(139, 92, 246, 0.6);
    color: #c4b5fd;
    box-shadow: 0 2px 12px rgba(139, 92, 246, 0.3);
  }

  /* Play Button - Larger and with gradient (Golden ratio: 48px → 78px ≈ 48 × φ) */
  .control-btn.play-btn {
    width: 56px;
    height: 56px;
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.35) 0%,
      rgba(22, 163, 74, 0.35) 100%
    );
    border-color: rgba(34, 197, 94, 0.5);
    font-size: 1.1rem;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
  }

  @media (hover: hover) and (pointer: fine) {
    .control-btn.play-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(34, 197, 94, 0.45) 0%,
        rgba(22, 163, 74, 0.45) 100%
      );
      box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
      border-color: rgba(34, 197, 94, 0.7);
    }
  }

  .control-btn.play-btn.playing {
    background: linear-gradient(
      135deg,
      rgba(251, 191, 36, 0.35) 0%,
      rgba(245, 158, 11, 0.35) 100%
    );
    border-color: rgba(251, 191, 36, 0.5);
    box-shadow: 0 2px 8px rgba(251, 191, 36, 0.2);
  }

  @media (hover: hover) and (pointer: fine) {
    .control-btn.play-btn.playing:hover {
      background: linear-gradient(
        135deg,
        rgba(251, 191, 36, 0.45) 0%,
        rgba(245, 158, 11, 0.45) 100%
      );
      box-shadow: 0 4px 16px rgba(251, 191, 36, 0.4);
    }
  }

  /* Export Button */
  .export-btn {
    display: flex;
    align-items: center;
    gap: 8px; /* Fibonacci spacing */
    padding: 13px 21px; /* Fibonacci spacing */
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.9) 0%,
      rgba(5, 150, 105, 0.9) 100%
    );
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .export-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 1) 0%,
        rgba(5, 150, 105, 1) 100%
      );
    }
  }

  .export-btn:active {
    transform: translateY(0) scale(0.98);
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

    .export-btn {
      padding: 13px;
    }

    .export-btn span {
      display: none; /* Icon only on mobile */
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

  @media (prefers-reduced-motion: reduce) {
    .control-btn,
    .export-btn {
      transition: none;
    }

    .control-btn:hover,
    .export-btn:hover {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .control-btn {
      border-width: 2px;
    }

    .unified-controls-panel {
      border-top-width: 2px;
    }
  }
</style>
