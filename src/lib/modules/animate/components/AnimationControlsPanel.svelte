<!--
  AnimationControlsPanel.svelte

  Unified controls panel containing:
  - Speed controls and play/pause
  - Motion visibility buttons
  - Expand/collapse toggle (mobile)
  - Trail settings (when expanded)

  Handles mobile compact/expanded states and scroll behavior.
-->
<script lang="ts">
  import AnimationControls from "./AnimationControls.svelte";
  import TrailSettings from "./TrailSettings.svelte";
  import MotionVisibilityButtons from "./MotionVisibilityButtons.svelte";
  import ExpandToggleButton from "./ExpandToggleButton.svelte";
  import type { TrailSettings as TrailSettingsType } from "../domain/types/TrailTypes";

  let {
    speed = 1,
    isPlaying = false,
    blueMotionVisible = true,
    redMotionVisible = true,
    trailSettings = $bindable(),
    isSideBySideLayout = false,
    isExpanded = false,
    scrollContainerRef = $bindable(null),
    onSpeedChange = () => {},
    onPlaybackStart = () => {},
    onPlaybackToggle = () => {},
    onToggleBlue = () => {},
    onToggleRed = () => {},
    onToggleExpanded = () => {},
    preventBackNavAction = () => {},
    onScroll = () => {},
  }: {
    speed?: number;
    isPlaying?: boolean;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    trailSettings?: TrailSettingsType;
    isSideBySideLayout?: boolean;
    isExpanded?: boolean;
    scrollContainerRef?: HTMLDivElement | null;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
    onPlaybackToggle?: () => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
    onToggleExpanded?: () => void;
    preventBackNavAction?: (node: HTMLElement, isSideBySideLayout: boolean) => any;
    onScroll?: (e: Event) => void;
  } = $props();
</script>

<div
  class="controls-panel"
  class:mobile-compact={!isExpanded && !isSideBySideLayout}
  class:mobile-expanded={isExpanded && !isSideBySideLayout}
  bind:this={scrollContainerRef}
  use:preventBackNavAction={isSideBySideLayout}
  onscroll={onScroll}
>
  <!-- Speed Control Row (Compact mode: play/pause + speed only) -->
  <div class="control-group speed-visibility-row">
    <AnimationControls
      {speed}
      {isPlaying}
      {onSpeedChange}
      {onPlaybackStart}
      {onPlaybackToggle}
    />

    <!-- Visibility Buttons (Desktop or Mobile Expanded only) -->
    {#if isSideBySideLayout || isExpanded}
      <MotionVisibilityButtons
        {blueMotionVisible}
        {redMotionVisible}
        {onToggleBlue}
        {onToggleRed}
      />
    {/if}

    <!-- Expand/Collapse Toggle Button (Mobile Only) -->
    {#if !isSideBySideLayout}
      <ExpandToggleButton {isExpanded} onToggle={onToggleExpanded} />
    {/if}
  </div>

  <!-- Trail Settings (Hidden in compact mode on mobile) -->
  {#if (isSideBySideLayout || isExpanded) && trailSettings}
    <div class="control-group trail-group">
      <TrailSettings
        bind:settings={trailSettings}
        compact={true}
        ultraCompact={!isSideBySideLayout}
        hideVisibilityButtons={true}
      />
    </div>
  {/if}
</div>

<style>
  .controls-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 0 0 auto;
    gap: clamp(10px, 2vw, 14px);
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(10px, 2vw, 16px);
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(12px, 2.4vw, 16px);
    backdrop-filter: blur(12px);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    -webkit-overflow-scrolling: touch;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Mobile Compact Mode - No scrolling, fixed controls only */
  .controls-panel.mobile-compact {
    overflow-y: hidden !important;
    overflow-x: hidden;
    flex: 0 0 auto;
    max-height: none;
    padding: 8px;
    gap: 8px;
  }

  /* Mobile Expanded Mode - Scrollable with all controls visible */
  .controls-panel.mobile-expanded {
    overflow-y: auto !important;
    overflow-x: hidden;
    overscroll-behavior: contain;
    flex: 1 1 0;
    min-height: 0;
    max-height: none;
  }

  /* Custom scrollbar */
  .controls-panel::-webkit-scrollbar {
    width: 6px;
  }

  .controls-panel::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .controls-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .controls-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* Control Groups */
  .control-group {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.2vw, 10px);
  }

  /* Speed + Visibility Row */
  .speed-visibility-row {
    flex-direction: row;
    align-items: center;
    gap: clamp(8px, 1.6vw, 12px);
    flex-wrap: wrap;
  }

  /* Mobile: Speed controls take full width on first row */
  .speed-visibility-row > :global(.controls-container) {
    flex: 0 0 100%;
    max-width: 100%;
  }

  /* Mobile: Visibility buttons - flexible sizing to fit available space */
  .speed-visibility-row > :global(.vis-btn) {
    flex: 1 1 0;
    min-width: 0;
    max-width: 120px;
  }

  /* Mobile: Expand toggle button - compact but accessible */
  .speed-visibility-row > :global(.expand-toggle-btn) {
    flex: 0 0 auto;
    width: 44px;
    min-width: 0;
    padding: 0;
  }

  /* Desktop Optimizations */
  @container animator-canvas (min-width: 400px) {
    .controls-panel {
      overflow-y: hidden !important;
      overflow-x: hidden;
      gap: 0.8cqh;
      padding: 1cqh 1.2cqw;
    }

    /* Landscape: panel on right */
    @container animator-canvas (min-aspect-ratio: 1.2/1) {
      .controls-panel {
        width: min(280px, 26cqw);
        height: 100%;
        max-height: 100%;
      }
    }

    /* Speed + Visibility Row - Desktop optimizations */
    .speed-visibility-row {
      flex-wrap: nowrap;
    }

    /* Desktop: All three children get equal width */
    .speed-visibility-row > :global(.controls-container) {
      flex: 1 1 0 !important;
      min-width: 0;
    }

    .speed-visibility-row > :global(.vis-btn) {
      flex: 1 1 0 !important;
      min-width: 0;
    }
  }

  /* Mobile Optimizations */
  @media (max-width: 480px) {
    .controls-panel {
      padding: 14px;
      gap: 18px;
    }
  }

  /* Landscape mobile - compact layout */
  @media (max-height: 500px) and (orientation: landscape) {
    .controls-panel {
      padding: 10px;
      gap: 12px;
    }
  }
</style>
