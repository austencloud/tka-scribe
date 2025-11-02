<!--
 SequenceLengthPicker.svelte - Inline controls for path builder configuration

Compact inline panel for configuring sequence length and grid mode.
-->
<script lang="ts">
  import { GridMode } from "$shared";

  // Props
  let {
    sequenceLength = $bindable(16),
    gridMode = $bindable(GridMode.DIAMOND),
  }: {
    sequenceLength?: number;
    gridMode?: GridMode;
  } = $props();
</script>

<div class="sequence-settings">
  <!-- Beats input with increment/decrement -->
  <div class="setting-group">
    <span class="setting-label">Beats</span>
    <div class="number-input">
      <button
        class="adjust-btn"
        onclick={() => sequenceLength = Math.max(1, sequenceLength - 1)}
        aria-label="Decrease beats"
      >
        <i class="fas fa-minus"></i>
      </button>
      <input
        type="number"
        bind:value={sequenceLength}
        min="1"
        max="64"
        class="beats-input"
        aria-label="Sequence length in beats"
      />
      <button
        class="adjust-btn"
        onclick={() => sequenceLength = Math.min(64, sequenceLength + 1)}
        aria-label="Increase beats"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </div>

  <!-- Grid mode toggle -->
  <div class="setting-group">
    <span class="setting-label">Grid</span>
    <div class="grid-toggle">
      <button
        class="grid-btn"
        class:active={gridMode === GridMode.DIAMOND}
        onclick={() => gridMode = GridMode.DIAMOND}
        aria-label="Diamond mode"
        title="Diamond (N, E, S, W)"
      >
        <i class="fas fa-gem"></i>
      </button>
      <button
        class="grid-btn"
        class:active={gridMode === GridMode.BOX}
        onclick={() => gridMode = GridMode.BOX}
        aria-label="Box mode"
        title="Box (NE, SE, SW, NW)"
      >
        <i class="fas fa-square"></i>
      </button>
    </div>
  </div>
</div>

<style>
  .sequence-settings {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
  }

  .setting-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .setting-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .number-input {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .adjust-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .adjust-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .adjust-btn i {
    font-size: 0.875rem;
  }

  .beats-input {
    width: 60px;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    height: 44px;
    box-sizing: border-box;
  }

  .beats-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.1);
  }

  .grid-toggle {
    display: flex;
    gap: 0.5rem;
  }

  .grid-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .grid-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .grid-btn.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
    color: white;
  }

  .grid-btn i {
    font-size: 1.1rem;
  }

  /* Stack vertically on very small screens */
  @media (max-width: 320px) {
    .sequence-settings {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
  }
</style>
