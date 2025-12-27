<!--
  ControlBar.svelte - Bottom control bar for Practice tab

  Horizontal button bar with 4 buttons: Play/Stop, Mode, Sequence, Settings.
  Icon-only mode on small screens, labels shown on larger screens.
-->
<script lang="ts">
  import { TrainMode, PracticeMode } from "../../domain/enums/TrainEnums";
  import { tryResolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { onMount } from "svelte";

  interface Props {
    mode: TrainMode;
    practiceMode: PracticeMode;
    hasSequence?: boolean;
    canStartPerformance?: boolean;
    isCameraReady?: boolean;
    onPlayStop?: () => void;
    onModeClick?: () => void;
    onSequenceClick?: () => void;
    onSettingsClick?: () => void;
  }

  let {
    mode,
    practiceMode,
    hasSequence = false,
    canStartPerformance = false,
    isCameraReady = false,
    onPlayStop,
    onModeClick,
    onSequenceClick,
    onSettingsClick,
  }: Props = $props();

  let hapticService: IHapticFeedback | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  // Get icon for current practice mode
  const modeIcon = $derived(() => {
    switch (practiceMode) {
      case PracticeMode.ADAPTIVE:
        return "fa-brain";
      case PracticeMode.STEP_BY_STEP:
        return "fa-shoe-prints";
      case PracticeMode.TIMED:
        return "fa-stopwatch";
      default:
        return "fa-stopwatch";
    }
  });

  // Get label for current practice mode
  const modeLabel = $derived(() => {
    switch (practiceMode) {
      case PracticeMode.ADAPTIVE:
        return "Adaptive";
      case PracticeMode.STEP_BY_STEP:
        return "Step";
      case PracticeMode.TIMED:
        return "Timed";
      default:
        return "Mode";
    }
  });

  function handlePlayStop() {
    hapticService?.trigger("selection");
    onPlayStop?.();
  }

  function handleMode() {
    hapticService?.trigger("selection");
    onModeClick?.();
  }

  function handleSequence() {
    hapticService?.trigger("selection");
    onSequenceClick?.();
  }

  function handleSettings() {
    hapticService?.trigger("selection");
    onSettingsClick?.();
  }
</script>

<div class="control-bar">
  <!-- Play/Stop Button (Primary) -->
  <button
    class="control-btn primary-btn"
    class:playing={mode === TrainMode.PERFORMING}
    disabled={mode === TrainMode.SETUP && !canStartPerformance}
    onclick={handlePlayStop}
    aria-label={mode === TrainMode.PERFORMING ? "Stop" : "Start"}
  >
    {#if mode === TrainMode.SETUP}
      {#if !isCameraReady}
        <i class="fas fa-spinner fa-spin"></i>
      {:else}
        <i class="fas fa-play"></i>
      {/if}
      <span class="btn-label">Play</span>
    {:else if mode === TrainMode.PERFORMING}
      <i class="fas fa-stop"></i>
      <span class="btn-label">Stop</span>
    {/if}
  </button>

  <!-- Mode Button (Purple/Violet) -->
  <button
    class="control-btn mode-btn"
    onclick={handleMode}
    aria-label="Change practice mode: {modeLabel()}"
  >
    <i class="fas {modeIcon()}"></i>
    <span class="btn-label">{modeLabel()}</span>
  </button>

  <!-- Sequence Button (Blue) -->
  <button
    class="control-btn sequence-btn"
    class:has-sequence={hasSequence}
    onclick={handleSequence}
    aria-label={hasSequence ? "Change sequence" : "Select sequence"}
  >
    <i class="fas {hasSequence ? 'fa-exchange-alt' : 'fa-folder-open'}"></i>
    <span class="btn-label">Seq</span>
  </button>

  <!-- Settings Button (Orange/Amber) -->
  <button
    class="control-btn settings-btn"
    onclick={handleSettings}
    aria-label="Mode settings"
  >
    <i class="fas fa-cog"></i>
    <span class="btn-label">Set</span>
  </button>
</div>

<style>
  /* ============================================
	   CONTROL BAR - 2026 Design, No Glassmorphism
	   Mobile-first, then desktop responsive
	   ============================================ */
  .control-bar {
    display: flex;
    gap: var(--space-2026-xs, 6px);
    width: 100%;
    container-type: inline-size;
  }

  .control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    flex: 1;
    min-height: var(--min-touch-target);
    padding: var(--space-2026-xs, 6px);
    background: var(--theme-panel-bg, #252532);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: var(--radius-2026-md, 14px);
    box-shadow: var(
      --shadow-2026-sm,
      0 1px 3px var(--theme-shadow, rgba(0, 0, 0, 0.06))
    );
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 1rem;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      background var(--duration-2026-fast, 150ms)
        var(--ease-2026-out, cubic-bezier(0.33, 1, 0.68, 1)),
      border-color var(--duration-2026-fast, 150ms)
        var(--ease-2026-out, cubic-bezier(0.33, 1, 0.68, 1)),
      transform var(--duration-2026-instant, 100ms)
        var(--ease-2026-out, cubic-bezier(0.33, 1, 0.68, 1)),
      color var(--duration-2026-fast, 150ms)
        var(--ease-2026-out, cubic-bezier(0.33, 1, 0.68, 1));
  }

  .control-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, #2d2d3a);
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.12));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    transform: translateY(-1px);
  }

  .control-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    transition-duration: var(--duration-2026-instant, 100ms);
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-label {
    font-size: 0.625rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ============================================
	   BUTTON VARIANTS - Solid Backgrounds
	   ============================================ */

  /* Primary button (Play/Stop) - Green */
  .primary-btn {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-success, #22c55e) 15%, transparent) 0%,
      color-mix(in srgb, var(--semantic-success, #16a34a) 15%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 30%,
      transparent
    );
    color: color-mix(in srgb, var(--semantic-success, #86efac) 95%, white);
  }

  .primary-btn:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-success, #22c55e) 25%, transparent) 0%,
      color-mix(in srgb, var(--semantic-success, #16a34a) 25%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 50%,
      transparent
    );
    color: var(--semantic-success, #86efac);
  }

  .primary-btn:disabled {
    background: var(--theme-card-hover-bg, #2d2d3a);
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.06));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  /* Stop button (Red) */
  .primary-btn.playing {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-error, #ef4444) 15%, transparent) 0%,
      color-mix(in srgb, var(--semantic-error, #dc2626) 15%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 30%,
      transparent
    );
    color: color-mix(in srgb, var(--semantic-error, #f87171) 95%, white);
  }

  .primary-btn.playing:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-error, #ef4444) 25%, transparent) 0%,
      color-mix(in srgb, var(--semantic-error, #dc2626) 25%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 50%,
      transparent
    );
    color: var(--semantic-error, #f87171);
  }

  /* Mode button (Purple/Violet) - Brain/creativity vibe */
  .mode-btn {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 15%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent, #7c3aed) 15%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 30%,
      transparent
    );
    color: color-mix(in srgb, var(--theme-accent, #c4b5fd) 95%, white);
  }

  .mode-btn:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 25%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent, #7c3aed) 25%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 50%,
      transparent
    );
    color: var(--theme-accent, #c4b5fd);
  }

  /* Sequence button (Blue) - Browse/explore vibe */
  .sequence-btn {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-info, #3b82f6) 15%, transparent) 0%,
      color-mix(in srgb, var(--semantic-info, #2563eb) 15%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 30%,
      transparent
    );
    color: color-mix(in srgb, var(--semantic-info, #93c5fd) 95%, white);
  }

  .sequence-btn:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-info, #3b82f6) 25%, transparent) 0%,
      color-mix(in srgb, var(--semantic-info, #2563eb) 25%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-info, #3b82f6) 50%,
      transparent
    );
    color: var(--semantic-info, #93c5fd);
  }

  /* Sequence button with sequence loaded - Green checkmark vibe */
  .sequence-btn.has-sequence {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-success, #22c55e) 15%, transparent) 0%,
      color-mix(in srgb, var(--semantic-success, #16a34a) 15%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 30%,
      transparent
    );
    color: color-mix(in srgb, var(--semantic-success, #86efac) 95%, white);
  }

  .sequence-btn.has-sequence:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-success, #22c55e) 25%, transparent) 0%,
      color-mix(in srgb, var(--semantic-success, #16a34a) 25%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-success, #22c55e) 50%,
      transparent
    );
    color: var(--semantic-success, #86efac);
  }

  /* Settings button (Orange/Amber) - Configuration vibe */
  .settings-btn {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-warning, #fbbf24) 15%, transparent) 0%,
      color-mix(in srgb, var(--semantic-warning, #f59e0b) 15%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-warning, #fbbf24) 30%,
      transparent
    );
    color: color-mix(in srgb, var(--semantic-warning, #fde047) 95%, white);
  }

  .settings-btn:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-warning, #fbbf24) 25%, transparent) 0%,
      color-mix(in srgb, var(--semantic-warning, #f59e0b) 25%, transparent) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-warning, #fbbf24) 50%,
      transparent
    );
    color: var(--semantic-warning, #fde047);
  }

  /* ============================================
	   MOBILE (< 400px)
	   ============================================ */
  @media (max-width: 400px) {
    .btn-label {
      display: none;
    }

    .control-btn {
      min-width: var(--min-touch-target);
      padding: var(--space-2026-xs, 6px);
    }
  }

  /* ============================================
	   TABLET (768px - 1023px)
	   ============================================ */
  @media (min-width: 768px) and (max-width: 1023px) {
    .control-bar {
      gap: var(--space-2026-sm, 12px);
    }

    .control-btn {
      flex-direction: row;
      gap: 0.5rem;
      padding: var(--space-2026-sm, 12px);
    }

    .btn-label {
      font-size: 0.75rem;
    }
  }

  /* ============================================
	   DESKTOP (≥ 1024px) - BENTO BOX LAYOUT
	   ============================================ */
  @media (min-width: 1024px) {
    .control-bar {
      gap: var(--space-2026-sm, 12px);
      padding: 0; /* Remove padding, let buttons breathe */
    }

    .control-btn {
      flex-direction: row;
      gap: var(--space-2026-sm, 12px);
      min-height: var(--min-touch-target);
      padding: var(--space-2026-sm, 12px) var(--space-2026-md, 20px);
    }

    .btn-label {
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: none; /* Sentence case on desktop */
      letter-spacing: 0;
    }

    /* Play/Stop button grows to take available space */
    .primary-btn {
      flex-grow: 1;
      justify-content: flex-start;
      padding-left: var(--space-2026-lg, 28px);
    }

    .primary-btn i {
      font-size: 1.125rem;
    }

    .primary-btn .btn-label {
      font-size: 1rem;
      font-weight: 600;
    }
  }

  /* Container query for component-level adaptation */
  @container (min-width: 700px) {
    /* Show labels when control bar has enough space (even on smaller screens) */
    .control-btn {
      flex-direction: row;
      gap: 0.5rem;
    }

    .btn-label {
      display: inline;
    }
  }
</style>
