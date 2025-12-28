<!--
AssemblyPhaseHeader.svelte - Phase indicator and instructions for Assembly mode

Shows current phase (Blue Hand, Red Hand, Rotation), progress, and contextual instructions.
-->
<script lang="ts">
  import type { HandPathPhase } from "../state/handpath-assemble-state.svelte";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  const { phase, bluePathLength, redPathLength, onBack } = $props<{
    phase: HandPathPhase;
    bluePathLength: number;
    redPathLength: number;
    onBack?: () => void;
  }>();

  // Resolve haptic feedback service
  const hapticService = resolve<IHapticFeedback>(
    TYPES.IHapticFeedback
  );

  function handleBack() {
    hapticService?.trigger("selection");
    onBack?.();
  }

  // Phase display info
  const phaseInfo = $derived.by(() => {
    switch (phase) {
      case "blue":
        return {
          title: "Blue Hand",
          subtitle:
            bluePathLength === 0
              ? "Tap your starting position"
              : `${bluePathLength} position${bluePathLength !== 1 ? "s" : ""} • Tap to add more`,
          color: "var(--semantic-info)",
          step: 1,
        };
      case "red":
        return {
          title: "Red Hand",
          subtitle:
            redPathLength === 0
              ? "Tap your starting position"
              : `${redPathLength} of ${bluePathLength} positions`,
          color: "var(--semantic-error)",
          step: 2,
        };
      case "rotation-selection":
        return {
          title: "Choose Rotation",
          subtitle: "Select how props should rotate during shifts",
          color: "var(--semantic-success)",
          step: 3,
        };
      case "complete":
        return {
          title: "Complete!",
          subtitle: "Your sequence is ready",
          color: "var(--semantic-success)",
          step: 3,
        };
      default:
        return {
          title: "Assembly",
          subtitle: "",
          color: "#8b5cf6",
          step: 0,
        };
    }
  });

  // Progress percentage
  const progressPercent = $derived.by(() => {
    if (phase === "blue") {
      return bluePathLength > 0 ? 25 : 0;
    } else if (phase === "red") {
      const redProgress =
        bluePathLength > 0 ? (redPathLength / bluePathLength) * 50 : 0;
      return 25 + redProgress;
    } else if (phase === "rotation-selection") {
      return 85;
    } else if (phase === "complete") {
      return 100;
    }
    return 0;
  });
</script>

<div class="phase-header" style:--phase-color={phaseInfo.color}>
  <!-- Back button -->
  {#if onBack && phase !== "blue"}
    <button class="back-button" onclick={handleBack} aria-label="Go back">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M12 4L6 10L12 16"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  {:else}
    <div class="back-placeholder"></div>
  {/if}

  <!-- Phase info -->
  <div class="phase-info">
    <div class="phase-badge">
      <span class="phase-dot"></span>
      <span class="phase-title">{phaseInfo.title}</span>
    </div>
    <p class="phase-subtitle">{phaseInfo.subtitle}</p>
  </div>

  <!-- Step indicator -->
  <div class="step-indicator">
    <span class="step-current">{phaseInfo.step}</span>
    <span class="step-divider">/</span>
    <span class="step-total">3</span>
  </div>
</div>

<!-- Progress bar -->
<div class="progress-bar-container">
  <div class="progress-bar" style:width="{progressPercent}%"></div>
</div>

<style>
  .phase-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--theme-panel-bg);
    border-bottom: 1px solid var(--theme-stroke);
    gap: 12px;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    border: none;
    background: var(--theme-card-bg);
    border-radius: 8px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .back-button:hover {
    background: var(--theme-card-hover-bg);
    color: var(--theme-text);
  }

  .back-placeholder {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
  }

  .phase-info {
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  .phase-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .phase-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--phase-color);
    box-shadow: 0 0 8px var(--phase-color);
  }

  .phase-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--theme-text);
  }

  .phase-subtitle {
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim, var(--theme-text-dim));
    margin: 4px 0 0 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .step-indicator {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-size: var(--font-size-sm);
    flex-shrink: 0;
    padding: 6px 12px;
    background: var(--theme-card-bg);
    border-radius: 8px;
  }

  .step-current {
    font-weight: 700;
    color: var(--phase-color);
    font-size: var(--font-size-base);
  }

  .step-divider {
    color: var(--theme-stroke);
  }

  .step-total {
    color: var(--theme-text-dim, var(--theme-text-dim));
  }

  /* Progress bar */
  .progress-bar-container {
    height: 3px;
    background: var(--theme-stroke);
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--phase-color), var(--phase-color));
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .phase-header {
      padding: 10px 12px;
    }

    .phase-title {
      font-size: var(--font-size-sm);
    }

    .phase-subtitle {
      font-size: var(--font-size-compact);
    }

    .back-button,
    .back-placeholder {
      width: 48px; /* WCAG AAA touch target - maintain on mobile */
      height: 48px;
    }
  }
</style>
