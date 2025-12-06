<!--
  FloatingControlGroup.svelte - Floating controls for Practice tab

  Minimal glassmorphism buttons positioned at bottom-right:
  - Sequence: Opens sequence browser
  - View: Cycles display views (camera+canvas, camera+grid, all three)
  - Mode: Shows/changes practice mode (adaptive, step, timed)
  - Settings: Opens mode settings sheet
-->
<script lang="ts">
  import { PracticeMode } from "../../domain/enums/TrainEnums";
  import type { DisplayView } from "../../state/train-practice-state.svelte";
  import { tryResolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";

  interface Props {
    displayView: DisplayView;
    practiceMode: PracticeMode;
    hasSequence?: boolean;
    onSequenceClick?: () => void;
    onViewCycle?: () => void;
    onModeClick?: () => void;
    onSettingsClick?: () => void;
  }

  let {
    displayView,
    practiceMode,
    hasSequence = false,
    onSequenceClick,
    onViewCycle,
    onModeClick,
    onSettingsClick,
  }: Props = $props();

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Get icon for current display view
  const viewIcon = $derived(() => {
    switch (displayView) {
      case "camera-canvas":
        return "fa-film";
      case "camera-grid":
        return "fa-th";
      case "camera-canvas-grid":
        return "fa-columns";
      default:
        return "fa-th";
    }
  });

  // Get label for current display view
  const viewLabel = $derived(() => {
    switch (displayView) {
      case "camera-canvas":
        return "Canvas";
      case "camera-grid":
        return "Grid";
      case "camera-canvas-grid":
        return "Both";
      default:
        return "View";
    }
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

  function handleSequence() {
    hapticService?.trigger("selection");
    onSequenceClick?.();
  }

  function handleView() {
    hapticService?.trigger("selection");
    onViewCycle?.();
  }

  function handleMode() {
    hapticService?.trigger("selection");
    onModeClick?.();
  }

  function handleSettings() {
    hapticService?.trigger("selection");
    onSettingsClick?.();
  }
</script>

<div class="floating-control-group">
  <!-- Settings Button -->
  <button
    class="floating-btn"
    onclick={handleSettings}
    aria-label="Mode settings"
  >
    <i class="fas fa-cog"></i>
  </button>

  <!-- Mode Button -->
  <button
    class="floating-btn mode-btn"
    onclick={handleMode}
    aria-label="Change practice mode: {modeLabel()}"
  >
    <i class="fas {modeIcon()}"></i>
    <span class="btn-label">{modeLabel()}</span>
  </button>

  <!-- View Toggle Button -->
  <button
    class="floating-btn view-btn"
    onclick={handleView}
    aria-label="Change view: {viewLabel()}"
  >
    <i class="fas {viewIcon()}"></i>
    <span class="btn-label">{viewLabel()}</span>
  </button>

  <!-- Sequence Button -->
  <button
    class="floating-btn sequence-btn"
    class:has-sequence={hasSequence}
    onclick={handleSequence}
    aria-label={hasSequence ? "Change sequence" : "Select sequence"}
  >
    <i class="fas {hasSequence ? 'fa-exchange-alt' : 'fa-folder-open'}"></i>
  </button>
</div>

<style>
  .floating-control-group {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 100;
  }

  .floating-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-width: 52px;
    min-height: 52px;
    padding: 0.75rem;
    background: #252532;
    border: 1px solid var(--border-2026, rgba(255, 255, 255, 0.06));
    border-radius: var(--radius-2026-md, 14px);
    box-shadow: var(--shadow-2026-md, 0 2px 8px rgba(0, 0, 0, 0.08));
    color: rgba(255, 255, 255, 0.85);
    font-size: 1rem;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  /* Hover effects */
  @media (hover: hover) {
    .floating-btn:hover {
      background: #2d2d3a;
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
      transform: translateY(-2px);
      color: rgba(147, 197, 253, 1);
    }
  }

  /* Active/pressed state */
  .floating-btn:active {
    transform: translateY(0) scale(0.95);
    transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Sequence button with sequence loaded */
  .sequence-btn.has-sequence {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.3);
    color: rgba(134, 239, 172, 0.9);
  }

  .sequence-btn.has-sequence:hover {
    background: rgba(34, 197, 94, 0.25);
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
  }

  /* Mode button accent colors based on mode */
  .mode-btn {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* View button accent */
  .view-btn {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  /* Responsive: hide labels on very small screens */
  @media (max-width: 400px) {
    .btn-label {
      display: none;
    }

    .mode-btn,
    .view-btn {
      padding: 0.75rem;
    }
  }
</style>
