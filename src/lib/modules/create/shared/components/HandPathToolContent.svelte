<!--
HandPathToolContent.svelte - Hand Path Tool Panel Content

Tool panel content for configuring and controlling hand path drawing.
Contains sequence settings, hand indicator, and action buttons.
-->
<script lang="ts">
  import type { HandPathCoordinator } from "../state/hand-path-coordinator.svelte";
  import SequenceLengthPicker from "../../construct/gestural-path-builder/components/SequenceLengthPicker.svelte";
  import PathControlPanel from "../../construct/gestural-path-builder/components/PathControlPanel.svelte";

  // Props
  let {
    handPathCoordinator,
  }: {
    handPathCoordinator: HandPathCoordinator;
  } = $props();
</script>

<div class="hand-path-tool-content">
  <!-- Settings Section -->
  <div class="settings-section">
    <div class="section-header">
      <h3>
        <i class="fas fa-cog"></i>
        Settings
      </h3>
      {#if handPathCoordinator.isStarted}
        <button
          class="icon-btn"
          onclick={() => handPathCoordinator.handleRestart()}
          title="Reset settings"
        >
          <i class="fas fa-redo"></i>
        </button>
      {/if}
    </div>

    <SequenceLengthPicker
      bind:sequenceLength={handPathCoordinator.sequenceLength}
      bind:gridMode={handPathCoordinator.gridMode}
    />
  </div>

  {#if !handPathCoordinator.isStarted}
    <!-- Start Drawing Button -->
    <button
      class="start-drawing-btn"
      onclick={() => handPathCoordinator.startDrawing()}
    >
      <i class="fas fa-play"></i>
      Start Drawing
    </button>
  {:else}
    <!-- Path Control Panel -->
    <PathControlPanel
      pathState={handPathCoordinator.pathState}
      onComplete={() => handPathCoordinator.handleHandComplete()}
      onReset={() => handPathCoordinator.handleRestart()}
    />

    <!-- Finish Actions -->
    {#if handPathCoordinator.pathState.isSessionComplete}
      <div class="finish-actions">
        <button
          class="action-btn primary"
          onclick={() => handPathCoordinator.handleFinish((motions) => {
            console.log("Hand path sequence completed:", motions);
            // TODO: Convert motions to sequence beats
          })}
        >
          <i class="fas fa-check"></i>
          Finish & Import
        </button>
        <button
          class="action-btn secondary"
          onclick={() => handPathCoordinator.handleBackToBlue()}
        >
          <i class="fas fa-redo"></i>
          Redraw Blue Hand
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .hand-path-tool-content {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vh, 1.5rem);
    padding: clamp(0.75rem, 2vh, 1.25rem);
    height: 100%;
    overflow-y: auto;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h3 {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    font-weight: 600;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-header h3 i {
    color: #10b981;
    font-size: 0.9em;
  }

  .icon-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(168, 85, 247, 0.15);
    border: 2px solid rgba(168, 85, 247, 0.3);
    border-radius: 50%;
    color: #c084fc;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-btn:hover {
    background: rgba(168, 85, 247, 0.25);
    border-color: #a855f7;
    color: #e9d5ff;
    transform: scale(1.05);
  }

  .icon-btn:active {
    transform: scale(0.95);
  }

  .start-drawing-btn {
    padding: clamp(0.875rem, 2vh, 1.125rem);
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: clamp(0.95rem, 2.5vw, 1.1rem);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 48px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    flex-shrink: 0;
  }

  .start-drawing-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .start-drawing-btn:active {
    transform: translateY(0);
  }

  .start-drawing-btn i {
    font-size: 1.1em;
  }

  .finish-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    flex-shrink: 0;
    padding-top: 0.5rem;
  }

  .action-btn {
    padding: clamp(0.75rem, 1.5vh, 1rem);
    border-radius: 14px;
    font-weight: 600;
    font-size: clamp(0.875rem, 2vw, 1rem);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 48px;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }

  .action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }

  .action-btn.primary:active {
    transform: translateY(0);
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .action-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.35);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
  }

  .action-btn.secondary:active {
    transform: translateY(0);
  }
</style>
