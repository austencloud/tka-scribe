<!--
  StepModeSettings.svelte

  Inline settings row for step playback mode.
  Shows step size toggle (Beat/Half).
  Only rendered when playbackMode === "step".
-->
<script lang="ts">
  import type { StepPlaybackStepSize } from "../../state/animation-panel-state.svelte";

  let {
    stepPlaybackStepSize = 1,
    onStepPlaybackStepSizeChange = () => {},
  }: {
    stepPlaybackStepSize?: StepPlaybackStepSize;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
  } = $props();
</script>

<div class="step-settings-row">
  <span class="step-label">Step size:</span>
  <div class="step-size-group">
    <button
      class="step-chip"
      class:active={stepPlaybackStepSize === 1}
      onclick={() => onStepPlaybackStepSizeChange(1)}
      type="button"
      aria-label="Step by full beats"
    >
      Beat
    </button>
    <button
      class="step-chip"
      class:active={stepPlaybackStepSize === 0.5}
      onclick={() => onStepPlaybackStepSizeChange(0.5)}
      type="button"
      aria-label="Step by half beats"
    >
      Half
    </button>
  </div>
</div>

<style>
  .step-settings-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1.5px solid rgba(251, 191, 36, 0.15);
    border-radius: 12px;
  }

  .step-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .step-size-group {
    display: flex;
    gap: 4px;
  }

  .step-chip {
    min-height: 36px;
    padding: 6px 14px;
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

  .step-chip.active {
    background: rgba(251, 191, 36, 0.15);
    border-color: rgba(251, 191, 36, 0.35);
    color: rgba(252, 211, 77, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .step-chip:hover:not(.active) {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.9));
    }
  }

  .step-chip:active {
    transform: scale(0.95);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .step-settings-row {
      padding: 6px 10px;
      gap: 8px;
    }

    .step-chip {
      min-height: 32px;
      padding: 4px 12px;
      font-size: 0.75rem;
    }
  }
</style>
