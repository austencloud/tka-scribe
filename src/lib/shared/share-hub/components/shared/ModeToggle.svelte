<!--
  ModeToggle.svelte

  Segmented control for switching between Single Media and Composite export modes.
  Top-level control in Share Hub panel.

  Design:
  - iOS-style segmented control
  - Smooth sliding indicator animation
  - Theme-based colors
  - Keyboard accessible (Tab, Arrow keys, Enter/Space)

  Domain: Share Hub - Mode Selection Control
-->
<script lang="ts">
  import type { ShareMode } from '../../domain/models/ShareMode';

  let {
    mode = 'single',
    onModeChange,
  }: {
    mode?: ShareMode;
    onModeChange?: (mode: ShareMode) => void;
  } = $props();

  function handleModeChange(newMode: ShareMode) {
    onModeChange?.(newMode);
  }

  function handleKeydown(event: KeyboardEvent, targetMode: ShareMode) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleModeChange(targetMode);
    }
  }
</script>

<div class="mode-toggle" role="tablist" aria-label="Export mode selection">
  <button
    id="tab-single-media"
    class="mode-option"
    class:active={mode === 'single'}
    role="tab"
    aria-selected={mode === 'single'}
    aria-controls="single-media-panel"
    tabindex={mode === 'single' ? 0 : -1}
    onclick={() => handleModeChange('single')}
    onkeydown={(e) => handleKeydown(e, 'single')}
  >
    <i class="fas fa-image" aria-hidden="true"></i>
    <span>Single Media</span>
  </button>

  <button
    id="tab-composite"
    class="mode-option"
    class:active={mode === 'composite'}
    role="tab"
    aria-selected={mode === 'composite'}
    aria-controls="composite-panel"
    tabindex={mode === 'composite' ? 0 : -1}
    onclick={() => handleModeChange('composite')}
    onkeydown={(e) => handleKeydown(e, 'composite')}
  >
    <i class="fas fa-th" aria-hidden="true"></i>
    <span>Composite</span>
  </button>

  <!-- Sliding indicator -->
  <div
    class="indicator"
    style:transform={mode === 'single' ? 'translateX(0%)' : 'translateX(100%)'}
  ></div>
</div>

<style>
  .mode-toggle {
    position: relative;
    display: flex;
    gap: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    padding: 4px;
    width: fit-content;
    margin: 0 auto;
    isolation: isolate;
  }

  .mode-option {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 20px;
    background: transparent;
    border: none;
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: color 0.2s ease;
    z-index: 1;
    white-space: nowrap;
    min-width: 140px;
  }

  .mode-option i {
    font-size: 16px;
  }

  .mode-option:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .mode-option:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .mode-option.active {
    color: var(--theme-text, white);
  }

  /* Sliding indicator background */
  .indicator {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: var(--theme-accent, #4a9eff);
    border-radius: 8px;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.2),
      0 0 0 1px var(--theme-accent-glow, rgba(74, 158, 255, 0.3));
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .mode-toggle {
      width: 100%;
    }

    .mode-option {
      flex: 1;
      min-width: 0;
    }

    .mode-option span {
      font-size: var(--font-size-compact, 12px);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .indicator {
      transition: none;
    }

    .mode-option {
      transition: none;
    }
  }
</style>
