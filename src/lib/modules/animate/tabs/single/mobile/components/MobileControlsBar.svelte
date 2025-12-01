<!--
  MobileControlsBar.svelte
  
  Unified controls bar for mobile animation view.
  Contains BPM control, play/pause, visibility toggles, and settings button.
-->
<script lang="ts">
  import BpmControl from "../../../../components/controls/BpmControl.svelte";
  import PlayPauseButton from "../../../../components/controls/PlayPauseButton.svelte";
  import { animationSettings } from "$lib/shared/animate/state/animation-settings-state.svelte";

  let {
    isPlaying = $bindable(false),
    onPlayToggle,
    onStop,
    onOpenAdvancedSettings,
  }: {
    isPlaying: boolean;
    onPlayToggle: (playing: boolean) => void;
    onStop: () => void;
    onOpenAdvancedSettings: () => void;
  } = $props();
</script>

<div class="mobile-controls-unified">
  <div class="controls-row">
    <!-- BPM Control -->
    <div class="control-item">
      <BpmControl
        bpm={animationSettings.bpm}
        min={30}
        max={180}
        step={5}
        onBpmChange={(newBpm) => animationSettings.setBpm(newBpm)}
      />
    </div>

    <!-- Play/Pause -->
    <div class="control-item">
      <PlayPauseButton
        bind:isPlaying
        onToggle={(playing) => {
          onPlayToggle(playing);
          if (!playing) onStop();
        }}
      />
    </div>

    <!-- Visibility Toggles -->
    <div class="control-item visibility-mini">
      <button
        class="visibility-toggle"
        class:active={animationSettings.motionVisibility.blue}
        onclick={() =>
          animationSettings.setBlueVisible(
            !animationSettings.motionVisibility.blue
          )}
        aria-label="Toggle blue motion"
      >
        <i class="fas fa-circle" style="color: #6366f1;"></i>
      </button>
      <button
        class="visibility-toggle"
        class:active={animationSettings.motionVisibility.red}
        onclick={() =>
          animationSettings.setRedVisible(
            !animationSettings.motionVisibility.red
          )}
        aria-label="Toggle red motion"
      >
        <i class="fas fa-circle" style="color: #ef4444;"></i>
      </button>
    </div>

    <!-- Settings Button -->
    <button
      class="settings-btn-mini"
      onclick={onOpenAdvancedSettings}
      aria-label="Settings"
    >
      <i class="fas fa-sliders"></i>
    </button>
  </div>
</div>

<style>
  .mobile-controls-unified {
    flex-shrink: 0;
    background: rgba(10, 15, 25, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 8px;
  }

  .controls-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    max-width: 100%;
  }

  .control-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Visibility Mini Toggles */
  .visibility-mini {
    display: flex;
    gap: 4px;
  }

  .visibility-toggle {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .visibility-toggle.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .visibility-toggle:active {
    transform: scale(0.9);
  }

  .visibility-toggle i {
    font-size: 0.9rem;
    opacity: 0.4;
  }

  .visibility-toggle.active i {
    opacity: 1;
  }

  /* Settings Button Mini */
  .settings-btn-mini {
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    border-radius: 8px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .settings-btn-mini:active {
    transform: scale(0.9);
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
  }

  /* Container query responsive styles */
  @container mobile-layout (max-width: 360px) {
    /* Keep 48px minimum for accessibility - only reduce padding/gap */
    .controls-row {
      gap: 4px;
    }

    .mobile-controls-unified {
      padding: 5px 6px;
    }
  }

  @container mobile-layout (max-height: 600px) {
    .mobile-controls-unified {
      padding: 5px 6px;
    }
  }

  @container mobile-layout (max-height: 500px) {
    .mobile-controls-unified {
      padding: 4px 5px;
    }
  }

  /* Landscape orientation */
  @media (orientation: landscape) and (max-width: 768px) {
    .mobile-controls-unified {
      flex-shrink: 0;
      width: auto;
      border-top: none;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
</style>
