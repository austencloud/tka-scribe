<!--
  AnimationControlsV2.svelte

  Main orchestrator for the new tiered animation controls.
  Adapts layout based on mode (fullscreen, inline, compact).

  Tier 1: FloatingControlBar (BPM, Play, Export) - Always visible
  Tier 2: QuickTogglesRow (Visibility, Presets, Settings) - Always visible

  Note: AdvancedSettingsDrawer should be rendered at a higher level (e.g., SingleModePanel)
  to ensure proper overlay behavior. Use onOpenAdvancedSettings callback.
-->
<script lang="ts">
  import FloatingControlBar from "../controls/FloatingControlBar.svelte";
  import QuickTogglesRow from "../trail/QuickTogglesRow.svelte";
  import { animationSettings } from "../../../../shared/animation-engine/state/animation-settings-state.svelte";
  import { getAnimationVisibilityManager } from "../../../../shared/animation-engine/state/animation-visibility-state.svelte";
  import { onMount } from "svelte";

  type ControlsMode = "fullscreen" | "inline" | "compact";

  let {
    mode = "fullscreen",
    isPlaying = $bindable(false),
    showExport = true,
    onPlayToggle,
    onExport,
    onOpenTrailPanel,
    onOpenAdvancedSettings,
  }: {
    mode?: ControlsMode;
    isPlaying: boolean;
    showExport?: boolean;
    onPlayToggle?: (playing: boolean) => void;
    onExport?: () => void;
    onOpenTrailPanel?: () => void;
    onOpenAdvancedSettings?: () => void;
  } = $props();

  // Get visibility manager
  const visibilityManager = getAnimationVisibilityManager();

  // Visibility state - reactive to manager changes
  let blueVisible = $state(true);
  let redVisible = $state(true);

  // Load visibility settings on mount
  onMount(() => {
    blueVisible = visibilityManager.getVisibility("blueMotion");
    redVisible = visibilityManager.getVisibility("redMotion");

    // Register observer for visibility changes
    const observer = () => {
      blueVisible = visibilityManager.getVisibility("blueMotion");
      redVisible = visibilityManager.getVisibility("redMotion");
    };

    visibilityManager.registerObserver(observer);

    return () => {
      visibilityManager.unregisterObserver(observer);
    };
  });

  // Get other state from animation settings singleton
  let bpm = $derived(animationSettings.bpm);
  let trailSettings = $derived(animationSettings.trail);

  // Handlers - BPM
  function handleBpmChange(newBpm: number) {
    animationSettings.setBpm(newBpm);
  }

  // Handlers - Playback
  function handlePlayToggle(playing: boolean) {
    isPlaying = playing;
    onPlayToggle?.(playing);
  }

  // Handlers - Visibility (now uses AnimationVisibilityManager)
  function handleBlueToggle(visible: boolean) {
    visibilityManager.setVisibility("blueMotion", visible);
  }

  function handleRedToggle(visible: boolean) {
    visibilityManager.setVisibility("redMotion", visible);
  }

  // Handlers - Advanced Settings
  function handleOpenSettings() {
    onOpenAdvancedSettings?.();
  }
</script>

<div class="animation-controls-v2" data-mode={mode}>
  {#if mode === "fullscreen"}
    <!-- Fullscreen layout: Stacked tiers -->
    <div class="fullscreen-layout">
      <div class="tier-2">
        <QuickTogglesRow
          {blueVisible}
          {redVisible}
          {trailSettings}
          onBlueToggle={handleBlueToggle}
          onRedToggle={handleRedToggle}
          {onOpenTrailPanel}
          onOpenSettings={handleOpenSettings}
        />
      </div>

      <div class="tier-1">
        <FloatingControlBar
          {bpm}
          {isPlaying}
          {showExport}
          onBpmChange={handleBpmChange}
          onPlayToggle={handlePlayToggle}
          {onExport}
        />
      </div>
    </div>
  {:else if mode === "inline"}
    <!-- Inline layout: Single row, more compact -->
    <div class="inline-layout">
      <FloatingControlBar
        {bpm}
        {isPlaying}
        showExport={false}
        onBpmChange={handleBpmChange}
        onPlayToggle={handlePlayToggle}
      />

      <QuickTogglesRow
        {blueVisible}
        {redVisible}
        {trailSettings}
        onBlueToggle={handleBlueToggle}
        onRedToggle={handleRedToggle}
        {onOpenTrailPanel}
        onOpenSettings={handleOpenSettings}
      />
    </div>
  {:else}
    <!-- Compact layout: Minimal for very small screens -->
    <div class="compact-layout">
      <FloatingControlBar
        {bpm}
        {isPlaying}
        showExport={false}
        onBpmChange={handleBpmChange}
        onPlayToggle={handlePlayToggle}
      />
      <!-- Mini settings button for compact mode -->
      {#if onOpenAdvancedSettings || onOpenTrailPanel}
        <button
          class="compact-settings-btn"
          onclick={() => onOpenAdvancedSettings?.() ?? onOpenTrailPanel?.()}
          aria-label="Settings"
        >
          <i class="fas fa-sliders"></i>
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .animation-controls-v2 {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  /* Fullscreen Layout */
  .fullscreen-layout {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 12px;
    padding: 16px;
  }

  .fullscreen-layout .tier-1 {
    display: flex;
    justify-content: center;
  }

  .fullscreen-layout .tier-2 {
    display: flex;
    justify-content: center;
  }

  /* Inline Layout */
  .inline-layout {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
  }

  /* Compact Layout */
  .compact-layout {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px;
  }

  .compact-settings-btn {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    background: rgba(20, 25, 35, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .compact-settings-btn:active {
    transform: scale(0.95);
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .fullscreen-layout {
      padding: 12px;
      gap: 10px;
    }

    .inline-layout {
      padding: 8px;
      gap: 6px;
    }

    .compact-layout {
      padding: 6px;
      gap: 6px;
    }

    .compact-settings-btn {
      width: 52px;
      height: 52px;
      min-width: 52px;
      min-height: 52px;
      font-size: 0.8rem;
    }
  }

  /* Very small screens */
  @media (max-width: 375px) {
    .inline-layout {
      padding: 6px;
      gap: 4px;
    }

    .compact-layout {
      padding: 4px;
      gap: 4px;
    }

    /* Keep 52px minimum for accessibility */
    .compact-settings-btn {
      width: 52px;
      height: 52px;
      min-width: 52px;
      min-height: 52px;
      font-size: 0.75rem;
      border-radius: 8px;
    }
  }
</style>
