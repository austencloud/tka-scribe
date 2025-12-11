<!--
AssemblyControls.svelte - Action buttons for Assembly mode

Shows contextual action buttons based on current phase:
- Blue phase: Undo, Next Hand (when ready)
- Red phase: Undo, Complete (when ready)
- Rotation: handled by RotationSelector
- Complete: Build Another
-->
<script lang="ts">
  import type { HandPathPhase } from "../state/handpath-assemble-state.svelte";

  const {
    phase,
    bluePathLength,
    redPathLength,
    canProceedToRed,
    canComplete,
    onUndo,
    onNextHand,
    onComplete,
    onReset,
  } = $props<{
    phase: HandPathPhase;
    bluePathLength: number;
    redPathLength: number;
    canProceedToRed: boolean;
    canComplete: boolean;
    onUndo: () => void;
    onNextHand: () => void;
    onComplete: () => void;
    onReset: () => void;
  }>();

  // Show undo only when there's something to undo
  const canUndo = $derived(
    (phase === "blue" && bluePathLength > 0) ||
    (phase === "red" && redPathLength > 0)
  );
</script>

<div class="assembly-controls">
  {#if phase === "blue"}
    <!-- Blue hand phase controls -->
    <div class="controls-row">
      <button
        class="control-button secondary"
        onclick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last position"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 8L8 4M4 8L8 12M4 8H14C15.1046 8 16 8.89543 16 10V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Undo</span>
      </button>

      <button
        class="control-button primary blue"
        onclick={onNextHand}
        disabled={!canProceedToRed}
      >
        <span>Next: Red Hand</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 4L14 10L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    {#if bluePathLength > 0 && bluePathLength < 2}
      <p class="hint-text">Add at least 2 positions to continue</p>
    {/if}

  {:else if phase === "red"}
    <!-- Red hand phase controls -->
    <div class="controls-row">
      <button
        class="control-button secondary"
        onclick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last position"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 8L8 4M4 8L8 12M4 8H14C15.1046 8 16 8.89543 16 10V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Undo</span>
      </button>

      <button
        class="control-button primary red"
        onclick={onComplete}
        disabled={!canComplete}
      >
        <span>Choose Rotation</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M8 4L14 10L8 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    {#if redPathLength < bluePathLength}
      <p class="hint-text">Match blue hand length ({redPathLength}/{bluePathLength} positions)</p>
    {/if}

  {:else if phase === "complete"}
    <!-- Completion phase controls -->
    <div class="controls-row centered">
      <button
        class="control-button primary green"
        onclick={onReset}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 10C4 6.68629 6.68629 4 10 4C12.2208 4 14.1599 5.21171 15.1973 7M16 10C16 13.3137 13.3137 16 10 16C7.77915 16 5.84008 14.7883 4.80269 13M15 4V7H12M5 16V13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Build Another</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .assembly-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
  }

  .controls-row {
    display: flex;
    gap: 12px;
    width: 100%;
    max-width: 400px;
  }

  .controls-row.centered {
    justify-content: center;
  }

  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .control-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Secondary button (Undo) */
  .control-button.secondary {
    flex: 0 0 auto;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.8);
  }

  .control-button.secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.95);
  }

  /* Primary button variants */
  .control-button.primary {
    flex: 1;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .control-button.primary:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .control-button.primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .control-button.primary.blue {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .control-button.primary.blue:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .control-button.primary.red {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }

  .control-button.primary.red:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }

  .control-button.primary.green {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .control-button.primary.green:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  /* Hint text */
  .hint-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    text-align: center;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .assembly-controls {
      padding: 12px;
    }

    .control-button {
      padding: 12px 16px;
      font-size: 14px;
    }

    .controls-row {
      gap: 8px;
    }
  }
</style>
