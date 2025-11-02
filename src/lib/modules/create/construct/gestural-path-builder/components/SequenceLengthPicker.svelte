<!--
SequenceLengthPicker.svelte - Setup wizard for sequence configuration

Allows user to select sequence length, grid mode, and starting position.
-->
<script lang="ts">
  import { GridLocation, GridMode } from "$shared";

  // Props
  let {
    onComplete,
  }: {
    onComplete: (length: number, gridMode: GridMode, startLocation: GridLocation) => void;
  } = $props();

  // State
  let sequenceLength = $state(16);
  let selectedGridMode = $state<GridMode>(GridMode.DIAMOND);
  let selectedStartLocation = $state<GridLocation>(GridLocation.NORTH);

  // Common sequence lengths
  const commonLengths = [8, 16, 24, 32];

  // Handle complete
  function handleComplete(): void {
    onComplete(sequenceLength, selectedGridMode, selectedStartLocation);
  }
</script>

<div class="sequence-length-picker">
  <!-- Sequence Length -->
  <div class="config-section">
    <label for="length-input" class="section-label">Sequence Length (beats)</label>
    <div class="length-controls">
      {#each commonLengths as length}
        <button
          class="length-btn"
          class:selected={sequenceLength === length}
          onclick={() => (sequenceLength = length)}
          aria-label="{length} beats"
        >
          {length}
        </button>
      {/each}
      <input
        id="length-input"
        type="number"
        bind:value={sequenceLength}
        min="1"
        max="64"
        class="length-input"
        aria-label="Custom sequence length"
      />
    </div>
  </div>

  <!-- Grid Mode -->
  <div class="config-section">
    <div class="section-label">Grid Mode</div>
    <div class="grid-mode-buttons">
      <button
        class="grid-mode-btn"
        class:selected={selectedGridMode === GridMode.DIAMOND}
        onclick={() => (selectedGridMode = GridMode.DIAMOND)}
        aria-label="Diamond mode"
      >
        <i class="fas fa-gem"></i>
        <span>Diamond</span>
        <span class="mode-desc">N, E, S, W</span>
      </button>
      <button
        class="grid-mode-btn"
        class:selected={selectedGridMode === GridMode.BOX}
        onclick={() => (selectedGridMode = GridMode.BOX)}
        aria-label="Box mode"
      >
        <i class="fas fa-square"></i>
        <span>Box</span>
        <span class="mode-desc">NE, SE, SW, NW</span>
      </button>
    </div>
  </div>

  <!-- Starting Location -->
  <div class="config-section">
    <div class="section-label">Starting Location</div>
    <div class="location-buttons">
      {#if selectedGridMode === GridMode.DIAMOND}
        {#each [GridLocation.NORTH, GridLocation.EAST, GridLocation.SOUTH, GridLocation.WEST] as location}
          <button
            class="location-btn"
            class:selected={selectedStartLocation === location}
            onclick={() => (selectedStartLocation = location)}
            aria-label="{location}"
          >
            {location.toUpperCase()}
          </button>
        {/each}
      {:else}
        {#each [GridLocation.NORTHEAST, GridLocation.SOUTHEAST, GridLocation.SOUTHWEST, GridLocation.NORTHWEST] as location}
          <button
            class="location-btn"
            class:selected={selectedStartLocation === location}
            onclick={() => (selectedStartLocation = location)}
            aria-label="{location}"
          >
            {location.toUpperCase()}
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Start Button -->
  <button class="start-btn" onclick={handleComplete}>
    <i class="fas fa-play"></i>
    Start Drawing
  </button>
</div>

<style>
  .sequence-length-picker {
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 2vh, 1.5rem);
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
    padding: clamp(0.75rem, 2vw, 1.5rem);
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
  }

  .config-section {
    display: flex;
    flex-direction: column;
    gap: clamp(0.5rem, 1.5vh, 0.75rem);
  }

  .section-label {
    font-size: clamp(0.7rem, 1.8vw, 0.85rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .length-controls {
    display: grid;
    /* Mobile: 2 buttons per row, custom input on new row */
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  /* Tablet and up: 4 buttons + custom input in one row */
  @media (min-width: 500px) {
    .length-controls {
      grid-template-columns: repeat(4, 1fr) minmax(80px, 120px);
    }
  }

  .length-btn {
    padding: clamp(0.5rem, 1.5vh, 0.75rem);
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(0.85rem, 1.8vw, 0.95rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .length-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .length-btn.selected {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
    color: white;
  }

  .length-input {
    padding: clamp(0.5rem, 1.5vh, 0.75rem);
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: white;
    font-size: clamp(0.85rem, 1.8vw, 0.95rem);
    font-weight: 600;
    text-align: center;
    min-height: 40px;
    /* Mobile: Full width on new row */
    grid-column: 1 / -1;
  }

  /* Tablet and up: Custom input only takes last column */
  @media (min-width: 500px) {
    .length-input {
      grid-column: auto;
    }
  }

  .length-input:focus {
    outline: none;
    border-color: #3b82f6;
    background: rgba(255, 255, 255, 0.1);
  }

  .grid-mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(0.75rem, 2vw, 1rem);
  }

  .grid-mode-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(0.2rem, 0.8vh, 0.4rem);
    padding: clamp(0.625rem, 1.5vh, 1rem);
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 40px;
  }

  .grid-mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .grid-mode-btn.selected {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
    color: white;
  }

  .grid-mode-btn i {
    font-size: clamp(1.25rem, 3.5vw, 1.75rem);
  }

  .grid-mode-btn span {
    font-weight: 600;
    font-size: clamp(0.8rem, 1.8vw, 0.95rem);
  }

  .mode-desc {
    font-size: clamp(0.65rem, 1.4vw, 0.8rem);
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }

  .location-buttons {
    display: grid;
    /* Mobile: 2 columns for better touch targets */
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  /* Wider screens: 4 columns */
  @media (min-width: 500px) {
    .location-buttons {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .location-btn {
    padding: clamp(0.5rem, 1.5vh, 0.75rem);
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(0.7rem, 1.6vw, 0.8rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .location-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .location-btn.selected {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
    color: white;
  }

  .start-btn {
    padding: clamp(0.75rem, 2vh, 1rem);
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 6px;
    color: white;
    font-size: clamp(0.95rem, 2vw, 1.05rem);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: clamp(0.375rem, 1.5vh, 0.75rem);
    min-height: 44px;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  .start-btn i {
    font-size: clamp(1rem, 2.2vw, 1.2rem);
  }

  /* Landscape mobile optimization */
  @media (max-height: 500px) and (orientation: landscape) {
    .sequence-length-picker {
      padding: 0.75rem;
      gap: 0.75rem;
    }

    .config-section {
      gap: 0.5rem;
    }

    .grid-mode-btn {
      padding: 0.75rem;
    }

    .start-btn {
      padding: 0.75rem;
      min-height: 40px;
    }
  }
</style>
