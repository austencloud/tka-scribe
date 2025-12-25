<!--
  CompositeControls.svelte

  Controls for Composite mode layout and piece selection.
  Allows user to toggle orientation and select formats for each piece.

  Features:
  - Orientation toggle (horizontal/vertical)
  - Piece 1 format selector (animation/static)
  - Piece 2 format selector (grid/performance)
  - Compact, inline layout
  - Theme-based styling

  Domain: Share Hub - Composite Mode - Controls
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';

  // FIX: Use 'hubState' instead of 'state' to avoid collision with $state rune
  const hubState = getShareHubState();

  function toggleOrientation() {
    const newOrientation =
      hubState.compositeLayout.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    hubState.compositeLayout.orientation = newOrientation;
  }

  function handlePiece1Change(format: 'animation' | 'static') {
    hubState.compositeLayout.piece1 = format;
  }

  function handlePiece2Change(format: 'grid' | 'performance') {
    hubState.compositeLayout.piece2 = format;
  }
</script>

<div class="composite-controls">
  <!-- Orientation Toggle -->
  <div class="control-group">
    <label class="control-label">
      <i class="fas fa-arrows-alt"></i>
      Layout
    </label>
    <button class="orientation-toggle" onclick={toggleOrientation} aria-label="Toggle orientation">
      {#if hubState.compositeLayout.orientation === 'horizontal'}
        <i class="fas fa-grip-horizontal"></i>
        <span>Horizontal</span>
      {:else}
        <i class="fas fa-grip-vertical"></i>
        <span>Vertical</span>
      {/if}
    </button>
  </div>

  <!-- Piece 1 Selector -->
  <div class="control-group">
    <label class="control-label">
      <i class="fas fa-play-circle"></i>
      Piece 1
    </label>
    <div class="piece-selector">
      <button
        class="piece-option"
        class:active={hubState.compositeLayout.piece1 === 'animation'}
        onclick={() => handlePiece1Change('animation')}
      >
        <i class="fas fa-play-circle"></i>
        <span>Animation</span>
      </button>
      <button
        class="piece-option"
        class:active={hubState.compositeLayout.piece1 === 'static'}
        onclick={() => handlePiece1Change('static')}
      >
        <i class="fas fa-image"></i>
        <span>Static</span>
      </button>
    </div>
  </div>

  <!-- Piece 2 Selector -->
  <div class="control-group">
    <label class="control-label">
      <i class="fas fa-th"></i>
      Piece 2
    </label>
    <div class="piece-selector">
      <button
        class="piece-option"
        class:active={hubState.compositeLayout.piece2 === 'grid'}
        onclick={() => handlePiece2Change('grid')}
      >
        <i class="fas fa-th"></i>
        <span>Grid</span>
      </button>
      <button
        class="piece-option"
        class:active={hubState.compositeLayout.piece2 === 'performance'}
        onclick={() => handlePiece2Change('performance')}
      >
        <i class="fas fa-video"></i>
        <span>Performance</span>
      </button>
    </div>
  </div>
</div>

<style>
  .composite-controls {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: space-between;
  }

  .control-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
    min-width: 80px;
  }

  .control-label i {
    font-size: 14px;
    opacity: 0.7;
  }

  .orientation-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--theme-accent, #4a9eff);
    border: 1px solid var(--theme-accent, #4a9eff);
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .orientation-toggle i {
    font-size: 16px;
  }

  .orientation-toggle:hover {
    background: var(--theme-accent-hover, #3d8de6);
    transform: translateY(-1px);
  }

  .orientation-toggle:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .piece-selector {
    display: flex;
    gap: 8px;
  }

  .piece-option {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: var(--font-size-compact, 12px);
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .piece-option i {
    font-size: 14px;
  }

  .piece-option:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
    color: var(--theme-text, white);
    transform: translateY(-1px);
  }

  .piece-option:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .piece-option.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
  }

  /* Mobile optimization */
  @media (max-width: 768px) {
    .composite-controls {
      padding: 14px;
      gap: 14px;
    }

    .control-group {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .control-label {
      min-width: 0;
    }

    .piece-selector {
      width: 100%;
    }

    .piece-option {
      flex: 1;
      justify-content: center;
    }

    .orientation-toggle {
      width: 100%;
      justify-content: center;
    }
  }

  /* Tablet */
  @media (min-width: 769px) and (max-width: 1024px) {
    .piece-option span {
      display: none;
    }

    .piece-option {
      padding: 8px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .orientation-toggle,
    .piece-option {
      transition: none;
    }

    .orientation-toggle:hover,
    .piece-option:hover {
      transform: none;
    }
  }
</style>
