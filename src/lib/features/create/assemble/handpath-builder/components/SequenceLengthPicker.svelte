<!--
 SequenceLengthPicker.svelte - Inline controls for path builder configuration

Compact inline panel for configuring sequence length and grid mode.
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

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
  <div class="setting-card">
    <span class="setting-label">BEATS</span>
    <div class="controls-row">
      <button
        class="adjust-btn"
        onclick={() => (sequenceLength = Math.max(1, sequenceLength - 1))}
        aria-label="Decrease beats"
      >
        <i class="fas fa-minus" aria-hidden="true"></i>
      </button>
      <div class="value-display">{sequenceLength}</div>
      <button
        class="adjust-btn"
        onclick={() => (sequenceLength = Math.min(64, sequenceLength + 1))}
        aria-label="Increase beats"
      >
        <i class="fas fa-plus" aria-hidden="true"></i>
      </button>
    </div>
  </div>

  <!-- Grid mode toggle -->
  <div class="setting-card">
    <span class="setting-label">GRID</span>
    <div class="controls-row">
      <button
        class="grid-btn"
        class:active={gridMode === GridMode.DIAMOND}
        onclick={() => (gridMode = GridMode.DIAMOND)}
        aria-label="Diamond mode"
        title="Diamond (N, E, S, W)"
      >
        <i class="fas fa-gem" aria-hidden="true"></i>
        <span class="grid-label">Diamond</span>
      </button>
      <button
        class="grid-btn"
        class:active={gridMode === GridMode.BOX}
        onclick={() => (gridMode = GridMode.BOX)}
        aria-label="Box mode"
        title="Box (NE, SE, SW, NW)"
      >
        <i class="fas fa-square" aria-hidden="true"></i>
        <span class="grid-label">Box</span>
      </button>
    </div>
  </div>
</div>

<style>
  .sequence-settings {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  .setting-card {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
    padding: 1.25rem;
    background: var(
      --theme-panel-bg,
      linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.6))
    );
    border: 1px solid var(--theme-stroke);
    border-radius: 16px;
    box-shadow: 0 4px 12px var(--theme-shadow);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .setting-card:hover {
    border-color: var(--theme-stroke-strong);
    box-shadow: 0 6px 20px var(--theme-shadow);
  }

  .setting-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--theme-text-dim, var(--theme-text-dim));
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-align: center;
  }

  .controls-row {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
  }

  .value-display {
    min-width: 70px;
    padding: 0.75rem 1rem;
    background: var(--theme-card-bg);
    border: 2px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 14px;
    color: var(--theme-text, white);
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.02em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) inset;
  }

  .adjust-btn {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    padding: 0;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2),
      rgba(37, 99, 235, 0.15)
    );
    border: 2px solid rgba(59, 130, 246, 0.4);
    border-radius: 14px;
    color: var(--semantic-info);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
  }

  .adjust-btn:hover {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.35),
      rgba(37, 99, 235, 0.25)
    );
    border-color: var(--semantic-info);
    color: #93c5fd;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  }

  .adjust-btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  }

  .adjust-btn i {
    font-size: 1rem;
  }

  .grid-btn {
    min-width: 85px;
    padding: 0.875rem 1rem;
    background: var(--theme-card-bg);
    border: 2px solid var(--theme-stroke, var(--theme-stroke-strong));
    border-radius: 14px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .grid-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .grid-btn:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    color: var(--theme-text);
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  .grid-btn:hover::before {
    opacity: 1;
  }

  .grid-btn.active {
    background: linear-gradient(135deg, var(--semantic-info), #2563eb);
    border-color: var(--semantic-info);
    color: white;
    box-shadow:
      0 6px 20px rgba(59, 130, 246, 0.4),
      0 0 0 1px var(--theme-stroke) inset;
  }

  .grid-btn.active::before {
    opacity: 1;
  }

  .grid-btn:active {
    transform: translateY(-1px);
  }

  .grid-btn i {
    font-size: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .grid-label {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    position: relative;
    z-index: 1;
    transition: color 0.25s ease;
  }

  /* Responsive adjustments */
  @media (max-width: 400px) {
    .setting-card {
      padding: 1rem;
    }

    .adjust-btn {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
    }

    .grid-btn {
      min-width: 75px;
      padding: 0.75rem 0.875rem;
      gap: 0.375rem;
    }

    .grid-btn i {
      font-size: 1.25rem;
    }

    .grid-label {
      font-size: 0.75rem;
    }

    .value-display {
      min-width: 60px;
      font-size: 1.25rem;
    }
  }
</style>
