<!--
StartPositionPicker.svelte - Ultra-simplified version
No over-engineering, just core functionality with inline states
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import { createSimplifiedStartPositionState } from "../state/start-position-state.svelte";
  import PictographGrid from "./PictographGrid.svelte";

  // Create simplified state
  const state = createSimplifiedStartPositionState();

  // Handle position selection
  async function handlePositionSelect(position: PictographData) {
    await state.selectPosition(position);
  }
</script>

<div class="start-pos-picker" data-testid="start-position-picker">
  {#if state.isLoading}
    <!-- Simple inline loading state -->
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading start positions...</p>
    </div>
  {:else if state.hasError}
    <!-- Simple inline error state -->
    <div class="error-state">
      <p class="error-message">{state.error || "An error occurred"}</p>
      <div class="error-actions">
        <button on:click={state.reload} class="retry-btn">Retry</button>
        <button on:click={state.clearError} class="dismiss-btn">Dismiss</button>
      </div>
    </div>
  {:else if state.positions.length === 0}
    <!-- Simple no positions state -->
    <div class="error-state">
      <p class="error-message">No valid start positions found.</p>
    </div>
  {:else}
    <!-- Main pictograph grid -->
    <PictographGrid
      pictographDataSet={state.positions}
      selectedPictograph={state.selectedPosition}
      onPictographSelect={handlePositionSelect}
    />
  {/if}
</div>

<style>
  .start-pos-picker {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    min-height: 300px;
    padding: 20px 0;
    position: relative;
  }

  /* Simple loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--text-secondary);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top: 3px solid var(--accent-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Simple error state */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    max-width: 400px;
    text-align: center;
  }

  .error-message {
    color: var(--error-color);
    margin: 0;
  }

  .error-actions {
    display: flex;
    gap: 12px;
  }

  .retry-btn, .dismiss-btn {
    padding: 8px 16px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--background-secondary);
    color: var(--text-primary);
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .retry-btn:hover, .dismiss-btn:hover {
    background: var(--background-tertiary);
  }

  .retry-btn {
    background: var(--accent-color);
    color: white;
    border-color: var(--accent-color);
  }

  .retry-btn:hover {
    background: var(--accent-color-hover);
  }
</style>
