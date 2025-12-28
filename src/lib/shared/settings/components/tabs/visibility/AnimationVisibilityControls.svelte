<!--
  AnimationVisibilityControls.svelte - Animation-specific visibility controls

  Controls for animation playback visibility settings.
-->
<script lang="ts">
  let {
    gridVisible = true,
    beatNumbersVisible = true,
    propsVisible = true,
    trailsVisible = true,
    tkaGlyphVisible = true,
    reversalIndicatorsVisible = false,
    turnNumbersVisible = true,
    blueMotionVisible = true,
    redMotionVisible = true,
    onToggleGrid,
    onToggleBeatNumbers,
    onToggleProps,
    onToggleTrails,
    onToggleTKA,
    onToggleReversals,
    onToggleTurnNumbers,
    onToggleBlueMotion,
    onToggleRedMotion,
  }: {
    gridVisible: boolean;
    beatNumbersVisible: boolean;
    propsVisible: boolean;
    trailsVisible: boolean;
    tkaGlyphVisible: boolean;
    reversalIndicatorsVisible: boolean;
    turnNumbersVisible: boolean;
    blueMotionVisible: boolean;
    redMotionVisible: boolean;
    onToggleGrid: () => void;
    onToggleBeatNumbers: () => void;
    onToggleProps: () => void;
    onToggleTrails: () => void;
    onToggleTKA: () => void;
    onToggleReversals: () => void;
    onToggleTurnNumbers: () => void;
    onToggleBlueMotion: () => void;
    onToggleRedMotion: () => void;
  } = $props();
</script>

<div class="animation-controls">
  <!-- Animation-Specific Section -->
  <section class="control-section">
    <h4 class="section-title">Animation Elements</h4>
    <div class="controls-grid">
      <button
        class="control-btn"
        class:active={gridVisible}
        onclick={onToggleGrid}
      >
        <i class="fas fa-th" aria-hidden="true"></i>
        <span>Grid</span>
      </button>

      <button
        class="control-btn"
        class:active={beatNumbersVisible}
        onclick={onToggleBeatNumbers}
      >
        <i class="fas fa-hashtag" aria-hidden="true"></i>
        <span>Beat #s</span>
      </button>

      <button
        class="control-btn"
        class:active={propsVisible}
        onclick={onToggleProps}
      >
        <i class="fas fa-circle" aria-hidden="true"></i>
        <span>Props</span>
      </button>

      <button
        class="control-btn"
        class:active={trailsVisible}
        onclick={onToggleTrails}
      >
        <i class="fas fa-route" aria-hidden="true"></i>
        <span>Trails</span>
      </button>
    </div>
  </section>

  <!-- Shared Elements Section -->
  <section class="control-section">
    <h4 class="section-title">Glyphs & Motion</h4>
    <div class="controls-grid">
      <button
        class="control-btn"
        class:active={tkaGlyphVisible}
        onclick={onToggleTKA}
      >
        <span class="icon-letter">A</span>
        <span>TKA</span>
      </button>

      <button
        class="control-btn"
        class:active={turnNumbersVisible}
        onclick={onToggleTurnNumbers}
      >
        <i class="fas fa-sort-numeric-down" aria-hidden="true"></i>
        <span>Turns</span>
      </button>

      <button
        class="control-btn"
        class:active={reversalIndicatorsVisible}
        onclick={onToggleReversals}
      >
        <span class="icon-letter">R</span>
        <span>Reversals</span>
      </button>

      <button
        class="control-btn motion-blue"
        class:active={blueMotionVisible}
        onclick={onToggleBlueMotion}
      >
        <i class="fas fa-circle" aria-hidden="true"></i>
        <span>Blue</span>
      </button>

      <button
        class="control-btn motion-red"
        class:active={redMotionVisible}
        onclick={onToggleRedMotion}
      >
        <i class="fas fa-circle" aria-hidden="true"></i>
        <span>Red</span>
      </button>
    </div>
  </section>
</div>

<style>
  .animation-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .control-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    font-size: var(--font-size-compact);
    font-weight: 600;
    color: var(--theme-text-dim, var(--theme-text-dim));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
    padding: 0 4px;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .controls-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 8px;
  }

  /* Bento Box Glass Card Style */
  .control-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 8px;
    min-height: 70px;
    /* Bento box frosted glass background */
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 12px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-size: var(--font-size-compact);
    font-weight: 500;
    cursor: pointer;
    /* Smooth Bento box transition */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    /* Subtle inset glow */
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .control-btn i {
    font-size: var(--font-size-xl);
  }

  .control-btn .icon-letter {
    font-size: var(--font-size-2xl);
    font-weight: bold;
    font-family: Georgia, serif;
  }

  .control-btn:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong, var(--theme-stroke-strong));
    color: var(--theme-text, var(--theme-text));
    /* Subtle lift effect */
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  /* Active State - Uses theme accent */
  .control-btn.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 40%,
      transparent
    );
    color: var(--theme-accent, var(--semantic-info));
    box-shadow:
      inset 0 1px 0 var(--theme-stroke),
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, var(--semantic-info)) 20%, transparent);
  }

  .control-btn.active:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 20%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 50%,
      transparent
    );
    color: var(--theme-accent);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, var(--semantic-info)) 30%, transparent),
      0 4px 12px
        color-mix(in srgb, var(--theme-accent, var(--semantic-info)) 20%, transparent);
  }

  /* Motion Color Variants - Use prop colors for motion icons */
  .control-btn.motion-blue.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 40%,
      transparent
    );
    color: var(--theme-accent, var(--semantic-info));
    box-shadow:
      inset 0 1px 0 var(--theme-stroke),
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, var(--semantic-info)) 20%, transparent);
  }

  .control-btn.motion-blue.active i {
    color: var(--prop-blue);
  }

  .control-btn.motion-blue.active:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 20%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 50%,
      transparent
    );
    color: var(--theme-accent);
  }

  .control-btn.motion-red.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 40%,
      transparent
    );
    color: var(--theme-accent, var(--semantic-info));
    box-shadow:
      inset 0 1px 0 var(--theme-stroke),
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, var(--semantic-info)) 20%, transparent);
  }

  .control-btn.motion-red.active i {
    color: var(--prop-red);
  }

  .control-btn.motion-red.active:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 20%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--semantic-info)) 50%,
      transparent
    );
    color: var(--theme-accent);
  }

  .control-btn:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  /* Compact for small containers */
  @container settings-panel-body (max-height: 552px) {
    .controls-grid {
      gap: 6px;
    }

    .control-btn {
      min-height: 64px;
      padding: 10px 6px;
    }

    .section-title {
      font-size: var(--font-size-compact);
    }
  }

  @media (max-width: 400px) {
    .controls-grid {
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      gap: 6px;
    }

    .control-btn {
      min-height: 60px;
      padding: 10px 6px;
      font-size: var(--font-size-compact);
      border-radius: 10px;
    }

    .control-btn i {
      font-size: var(--font-size-lg);
    }

    .control-btn .icon-letter {
      font-size: var(--font-size-xl);
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .control-btn {
      transition: none;
    }

    .control-btn:hover {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .control-btn {
      border-width: 2px;
    }

    .control-btn.active {
      border-color: color-mix(
        in srgb,
        var(--theme-accent, var(--semantic-info)) 80%,
        transparent
      );
    }
  }
</style>
