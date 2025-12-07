<!--
  ControlBar.svelte - Bottom control bar for Practice tab

  Horizontal button bar with 4 buttons: Play/Stop, Mode, Sequence, Settings.
  Icon-only mode on small screens, labels shown on larger screens.
-->
<script lang="ts">
  import { TrainMode, PracticeMode } from "../../domain/enums/TrainEnums";
  import { tryResolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
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

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
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

  <!-- Mode Button -->
  <button
    class="control-btn"
    onclick={handleMode}
    aria-label="Change practice mode: {modeLabel()}"
  >
    <i class="fas {modeIcon()}"></i>
    <span class="btn-label">{modeLabel()}</span>
  </button>

  <!-- Sequence Button -->
  <button
    class="control-btn"
    class:has-sequence={hasSequence}
    onclick={handleSequence}
    aria-label={hasSequence ? "Change sequence" : "Select sequence"}
  >
    <i class="fas {hasSequence ? 'fa-exchange-alt' : 'fa-folder-open'}"></i>
    <span class="btn-label">Seq</span>
  </button>

  <!-- Settings Button -->
  <button
    class="control-btn"
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
    min-height: 52px;
    padding: var(--space-2026-xs, 6px);
    background: #252532;
    border: 1px solid var(--border-2026, rgba(255, 255, 255, 0.06));
    border-radius: var(--radius-2026-md, 14px);
    box-shadow: var(--shadow-2026-sm, 0 1px 3px rgba(0, 0, 0, 0.06));
    color: rgba(255, 255, 255, 0.7);
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
    background: #2d2d3a;
    border-color: var(--border-2026-hover, rgba(255, 255, 255, 0.12));
    color: rgba(255, 255, 255, 0.9);
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
      rgba(34, 197, 94, 0.15) 0%,
      rgba(22, 163, 74, 0.15) 100%
    );
    border-color: rgba(34, 197, 94, 0.3);
    color: rgba(134, 239, 172, 0.95);
  }

  .primary-btn:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.25) 0%,
      rgba(22, 163, 74, 0.25) 100%
    );
    border-color: rgba(34, 197, 94, 0.5);
    color: rgba(134, 239, 172, 1);
  }

  .primary-btn:disabled {
    background: #2d2d3a;
    border-color: var(--border-2026, rgba(255, 255, 255, 0.06));
    color: rgba(255, 255, 255, 0.4);
  }

  /* Stop button (Red) */
  .primary-btn.playing {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.15) 0%,
      rgba(220, 38, 38, 0.15) 100%
    );
    border-color: rgba(239, 68, 68, 0.3);
    color: rgba(248, 113, 113, 0.95);
  }

  .primary-btn.playing:hover {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.25) 0%,
      rgba(220, 38, 38, 0.25) 100%
    );
    border-color: rgba(239, 68, 68, 0.5);
    color: rgba(248, 113, 113, 1);
  }

  /* Sequence button with sequence loaded */
  .control-btn.has-sequence {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.12) 0%,
      rgba(34, 197, 94, 0.08) 100%
    );
    border-color: rgba(34, 197, 94, 0.25);
    color: rgba(134, 239, 172, 0.9);
  }

  .control-btn.has-sequence:hover {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.2) 0%,
      rgba(34, 197, 94, 0.15) 100%
    );
    border-color: rgba(34, 197, 94, 0.4);
  }

  /* ============================================
	   MOBILE (< 400px)
	   ============================================ */
  @media (max-width: 400px) {
    .btn-label {
      display: none;
    }

    .control-btn {
      min-width: 52px;
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
      min-height: 52px;
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
