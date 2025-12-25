<!--
  AnimationPanel.svelte

  Settings panel for animation visibility options.
  Includes grid mode, trail style, and overlay toggles.
-->
<script lang="ts">
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import CyclingButton from "./CyclingButton.svelte";
  import { exampleSequenceData } from "./example-data";
  import type {
    TrailStyle,
    GridMode as AnimGridMode,
  } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";

  interface Props {
    gridMode: AnimGridMode;
    beatNumbersVisible: boolean;
    trailStyle: TrailStyle;
    tkaGlyphVisible: boolean;
    reversalIndicatorsVisible: boolean;
    turnNumbersVisible: boolean;
    onToggle: (key: string) => void;
    onGridModeChange: (mode: string) => void;
    onTrailStyleChange: (style: string) => void;
    onOpenHelp: () => void;
    isMobileHidden?: boolean;
  }

  let {
    gridMode,
    beatNumbersVisible,
    trailStyle,
    tkaGlyphVisible,
    reversalIndicatorsVisible,
    turnNumbersVisible,
    onToggle,
    onGridModeChange,
    onTrailStyleChange,
    onOpenHelp,
    isMobileHidden = false,
  }: Props = $props();
</script>

<section class="settings-panel animation-panel" class:mobile-hidden={isMobileHidden}>
  <header class="panel-header">
    <span class="panel-icon animation-icon">
      <i class="fas fa-film"></i>
    </span>
    <h3 class="panel-title">Animation</h3>
    <button
      class="help-btn"
      onclick={onOpenHelp}
      aria-label="Learn about animation options"
      type="button"
    >
      <i class="fas fa-info-circle"></i>
    </button>
  </header>

  <div class="preview-frame animation-preview">
    <AnimatorCanvas
      sequenceData={exampleSequenceData}
      isPlaying={true}
      blueProp={null}
      redProp={null}
    />
  </div>

  <div class="panel-controls">
    <div class="control-group">
      <span class="group-label">Canvas</span>
      <div class="toggle-grid">
        <CyclingButton
          value={gridMode}
          options={["none", "diamond", "box"]}
          onValueChange={onGridModeChange}
          ariaLabel="Grid mode"
        />
        <button
          class="toggle-btn"
          class:active={beatNumbersVisible}
          onclick={() => onToggle("beatNumbers")}>Beat #s</button
        >
        <CyclingButton
          value={trailStyle}
          options={["off", "subtle", "vivid"]}
          onValueChange={onTrailStyleChange}
          ariaLabel="Trail style"
        />
      </div>
    </div>

    <div class="control-group">
      <span class="group-label">Overlays</span>
      <div class="toggle-grid">
        <button
          class="toggle-btn"
          class:active={tkaGlyphVisible}
          onclick={() => onToggle("tka")}>TKA Glyph</button
        >
        <button
          class="toggle-btn"
          class:active={reversalIndicatorsVisible}
          onclick={() => onToggle("reversals")}>Reversals</button
        >
        <button
          class="toggle-btn"
          class:active={turnNumbersVisible}
          onclick={() => onToggle("turnNumbers")}>Turn #s</button
        >
      </div>
    </div>
  </div>
</section>

<style>
  .settings-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: clamp(14px, 2.5cqi, 20px);
    background: var(--theme-card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--theme-stroke);
    border-radius: 20px;
    flex: 1;
    min-width: 0;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  .settings-panel:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    transform: translateY(-1px);
  }

  .settings-panel.mobile-hidden {
    display: none;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    width: 100%;
  }

  .panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 14px;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .panel-icon.animation-icon {
    --icon-color: #f472b6;
    background: color-mix(in srgb, var(--icon-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--icon-color) 35%, transparent);
    color: var(--icon-color);
    box-shadow: 0 0 8px color-mix(in srgb, var(--icon-color) 15%, transparent);
  }

  .settings-panel:hover .panel-icon {
    box-shadow: 0 0 12px color-mix(in srgb, var(--icon-color) 25%, transparent);
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
    white-space: nowrap;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
      sans-serif;
    flex: 1;
  }

  .help-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    margin-left: auto;
    background: color-mix(in srgb, #f472b6 15%, transparent);
    border: 1px solid color-mix(in srgb, #f472b6 30%, transparent);
    border-radius: 50%;
    color: #f472b6;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .help-btn:hover {
    background: color-mix(in srgb, #f472b6 25%, transparent);
    border-color: color-mix(in srgb, #f472b6 45%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, #f472b6 25%, transparent);
  }

  .help-btn:active {
    transform: scale(0.92);
  }

  .preview-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--theme-panel-bg) 80%, transparent);
    border-radius: 14px;
    border: 1px solid var(--theme-stroke);
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1;
    flex-shrink: 0;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .panel-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
    width: 100%;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .group-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    padding-left: 2px;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
      sans-serif;
  }

  .toggle-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--min-touch-target);
    padding: 12px 10px;
    background: color-mix(in srgb, var(--theme-card-bg) 70%, transparent);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    color: var(--theme-text-dim);
    font-size: 13px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui,
      sans-serif;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-btn:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    color: var(--theme-text);
    transform: translateY(-1px);
  }

  .toggle-btn:active {
    transform: translateY(0) scale(0.97);
    transition-duration: 50ms;
  }

  .toggle-btn.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 25%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 45%,
      transparent
    );
    color: white;
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent),
      0 4px 12px
        color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent);
  }

  .toggle-btn.active:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 35%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 55%,
      transparent
    );
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent),
      0 4px 16px
        color-mix(in srgb, var(--theme-accent, #6366f1) 35%, transparent);
  }

  .toggle-btn:focus-visible,
  .help-btn:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .settings-panel,
    .toggle-btn,
    .help-btn {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .toggle-btn,
    .settings-panel {
      border-width: 2px;
    }

    .toggle-btn.active {
      border-color: var(--theme-accent, #6366f1);
    }

    .toggle-btn:focus-visible {
      outline-width: 3px;
    }
  }
</style>
