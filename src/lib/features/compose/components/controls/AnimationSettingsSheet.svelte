<!--
  AnimationSettingsSheet.svelte

  Settings drawer/sheet wrapper with header and close button.
  Contains the AnimationSettingsContent component.
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import AnimationSettingsContent from "./AnimationSettingsContent.svelte";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import type {
    PlaybackMode,
    StepPlaybackStepSize,
  } from "../../state/animation-panel-state.svelte";

  let {
    isOpen = $bindable(false),
    bpm = $bindable(60),
    blueMotionVisible = true,
    redMotionVisible = true,
    currentPropType = null,
    playbackMode = "continuous",
    stepPlaybackPauseMs = 250,
    stepPlaybackStepSize = 1,
    isPlaying = false,
    onBpmChange = () => {},
    onToggleBlue = () => {},
    onToggleRed = () => {},
    onPlaybackModeChange = () => {},
    onStepPlaybackPauseMsChange = () => {},
    onStepPlaybackStepSizeChange = () => {},
    onPlaybackToggle = () => {},
  }: {
    isOpen: boolean;
    bpm: number;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    currentPropType?: PropType | string | null;
    playbackMode?: PlaybackMode;
    stepPlaybackPauseMs?: number;
    stepPlaybackStepSize?: StepPlaybackStepSize;
    isPlaying?: boolean;
    onBpmChange?: (bpm: number) => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onStepPlaybackPauseMsChange?: (pauseMs: number) => void;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
    onPlaybackToggle?: () => void;
  } = $props();
</script>

<Drawer
  bind:isOpen
  placement="right"
  respectLayoutMode={true}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Animation Settings"
  showHandle={true}
  class="settings-sheet"
>
  <div class="sheet-content">
    <header class="sheet-header">
      <h3 class="sheet-title">Animation Settings</h3>
      <button
        class="sheet-close-btn"
        onclick={() => (isOpen = false)}
        aria-label="Close"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="sheet-body">
      <AnimationSettingsContent
        bind:bpm
        {blueMotionVisible}
        {redMotionVisible}
        {currentPropType}
        {playbackMode}
        {stepPlaybackPauseMs}
        {stepPlaybackStepSize}
        {isPlaying}
        {onBpmChange}
        {onToggleBlue}
        {onToggleRed}
        {onPlaybackModeChange}
        {onStepPlaybackPauseMsChange}
        {onStepPlaybackStepSizeChange}
        {onPlaybackToggle}
      />
    </div>
  </div>
</Drawer>

<style>
  /* Sheet Styles */
  :global(.settings-sheet) {
    --sheet-width: min(320px, 85vw);
  }

  /*
   * Settings sheet opens on top of animation panel (which is already above bottom nav),
   * so no bottom offset needed - it can extend to the full height
   */
  :global(.drawer-content.settings-sheet) {
    bottom: 0 !important;
    max-height: 100dvh !important;
    border-radius: 16px 0 0 16px !important;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    min-width: 280px;
    height: 100%;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.65));
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    margin-bottom: 20px;
    flex-shrink: 0;
  }

  .sheet-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
  }

  .sheet-close-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sheet-close-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .sheet-body {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
</style>
