<!--
  StepModeSettings.svelte

  Inline settings row for step playback mode.
  Shows step size (Beat/Half) and pause duration presets.
  Only rendered when playbackMode === "step".
-->
<script lang="ts">
  import type { StepPlaybackStepSize } from "../../state/animation-panel-state.svelte";

  const PAUSE_PRESETS = [
    { label: "None", ms: 0 },
    { label: "Short", ms: 150 },
    { label: "Med", ms: 300 },
    { label: "Long", ms: 600 },
  ] as const;

  let {
    stepPlaybackStepSize = 1,
    stepPlaybackPauseMs = 250,
    isPlaying = false,
    onStepPlaybackStepSizeChange = () => {},
    onStepPlaybackPauseMsChange = () => {},
  }: {
    stepPlaybackStepSize?: StepPlaybackStepSize;
    stepPlaybackPauseMs?: number;
    isPlaying?: boolean;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
    onStepPlaybackPauseMsChange?: (pauseMs: number) => void;
  } = $props();
</script>

<div class="step-settings-row" class:disabled={isPlaying}>
  <!-- Step Size -->
  <div class="step-size-group">
    <button
      class="step-chip"
      class:active={stepPlaybackStepSize === 1}
      onclick={() => onStepPlaybackStepSizeChange(1)}
      disabled={isPlaying}
      type="button"
      aria-label="Step by full beats"
    >
      Beat
    </button>
    <button
      class="step-chip"
      class:active={stepPlaybackStepSize === 0.5}
      onclick={() => onStepPlaybackStepSizeChange(0.5)}
      disabled={isPlaying}
      type="button"
      aria-label="Step by half beats"
    >
      Half
    </button>
  </div>

  <span class="divider"></span>

  <!-- Pause Presets -->
  <div class="pause-group">
    {#each PAUSE_PRESETS as preset}
      <button
        class="pause-chip"
        class:active={stepPlaybackPauseMs === preset.ms}
        onclick={() => onStepPlaybackPauseMsChange(preset.ms)}
        disabled={isPlaying}
        type="button"
        aria-label="Pause {preset.label}"
      >
        {preset.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .step-settings-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1.5px solid rgba(251, 191, 36, 0.15);
    border-radius: 12px;
    transition: opacity 0.2s ease;
  }

  .step-settings-row.disabled {
    opacity: 0.5;
  }

  .step-size-group,
  .pause-group {
    display: flex;
    gap: 4px;
  }

  .pause-group {
    flex: 1;
    justify-content: flex-end;
  }

  .divider {
    width: 1px;
    height: 24px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .step-chip,
  .pause-chip {
    min-height: 36px;
    padding: 6px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
  }

  .step-chip.active,
  .pause-chip.active {
    background: rgba(251, 191, 36, 0.15);
    border-color: rgba(251, 191, 36, 0.35);
    color: rgba(252, 211, 77, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .step-chip:hover:not(:disabled):not(.active),
    .pause-chip:hover:not(:disabled):not(.active) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.9));
    }
  }

  .step-chip:active:not(:disabled),
  .pause-chip:active:not(:disabled) {
    transform: scale(0.95);
  }

  .step-chip:disabled,
  .pause-chip:disabled {
    cursor: not-allowed;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .step-settings-row {
      padding: 6px 8px;
      gap: 6px;
    }

    .step-chip,
    .pause-chip {
      min-height: 32px;
      padding: 4px 10px;
      font-size: 0.75rem;
    }
  }

  @media (max-width: 375px) {
    .pause-chip {
      padding: 4px 8px;
      font-size: 0.7rem;
    }
  }
</style>
