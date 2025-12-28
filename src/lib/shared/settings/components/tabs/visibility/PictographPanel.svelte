<!--
  PictographPanel.svelte

  Settings panel for pictograph visibility options.
  Interactive preview where clicking elements toggles their visibility.
-->
<script lang="ts">
  import PictographWithVisibility from "$lib/shared/pictograph/shared/components/PictographWithVisibility.svelte";
  import { examplePictographData } from "./example-data";

  interface Props {
    tkaGlyphVisible: boolean;
    vtgGlyphVisible: boolean;
    elementalGlyphVisible: boolean;
    positionsGlyphVisible: boolean;
    reversalIndicatorsVisible: boolean;
    turnNumbersVisible: boolean;
    nonRadialVisible: boolean;
    onToggle: (key: string) => void;
    onOpenHelp: () => void;
    isMobileHidden?: boolean;
  }

  let {
    tkaGlyphVisible,
    vtgGlyphVisible,
    elementalGlyphVisible,
    positionsGlyphVisible,
    reversalIndicatorsVisible,
    turnNumbersVisible,
    nonRadialVisible,
    onToggle,
    onOpenHelp,
    isMobileHidden = false,
  }: Props = $props();
</script>

<section class="settings-panel pictograph-panel" class:mobile-hidden={isMobileHidden}>
  <header class="panel-header">
    <span class="panel-icon pictograph-icon">
      <i class="fas fa-image" aria-hidden="true"></i>
    </span>
    <h3 class="panel-title">Pictograph</h3>
    <button
      class="help-btn"
      onclick={onOpenHelp}
      aria-label="Learn about pictograph options"
      type="button"
    >
      <i class="fas fa-info-circle" aria-hidden="true"></i>
    </button>
  </header>

  <div class="preview-frame">
    <PictographWithVisibility
      pictographData={examplePictographData}
      forceShowAll={true}
      previewMode={true}
      onToggleTKA={() => onToggle("tka")}
      onToggleVTG={() => onToggle("vtg")}
      onToggleElemental={() => onToggle("elemental")}
      onTogglePositions={() => onToggle("positions")}
      onToggleReversals={() => onToggle("reversals")}
      onToggleNonRadial={() => onToggle("nonRadial")}
      onToggleTurnNumbers={() => onToggle("turnNumbers")}
    />
  </div>

  <div class="panel-controls">
    <div class="control-group">
      <span class="group-label">Glyphs</span>
      <div class="toggle-grid">
        <button
          class="toggle-btn"
          class:active={tkaGlyphVisible}
          onclick={() => onToggle("tka")}>TKA</button
        >
        <button
          class="toggle-btn"
          class:active={vtgGlyphVisible}
          onclick={() => onToggle("vtg")}>VTG</button
        >
        <button
          class="toggle-btn"
          class:active={elementalGlyphVisible}
          onclick={() => onToggle("elemental")}>Elemental</button
        >
        <button
          class="toggle-btn"
          class:active={positionsGlyphVisible}
          onclick={() => onToggle("positions")}>Positions</button
        >
      </div>
    </div>

    <div class="control-group">
      <span class="group-label">Details</span>
      <div class="toggle-grid">
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
        <button
          class="toggle-btn"
          class:active={nonRadialVisible}
          onclick={() => onToggle("nonRadial")}>Non-Radial</button
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

  .panel-icon.pictograph-icon {
    --icon-color: #818cf8;
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
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    padding: 0;
    margin-left: auto;
    background: color-mix(in srgb, #818cf8 15%, transparent);
    border: 1px solid color-mix(in srgb, #818cf8 30%, transparent);
    border-radius: 50%;
    color: #818cf8;
    font-size: var(--font-size-min, 14px);
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .help-btn:hover {
    background: color-mix(in srgb, #818cf8 25%, transparent);
    border-color: color-mix(in srgb, #818cf8 45%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, #818cf8 25%, transparent);
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

  .preview-frame :global(.pictograph-with-visibility),
  .preview-frame :global(.pictograph) {
    width: 100% !important;
    height: 100% !important;
  }

  .preview-frame :global(svg.pictograph) {
    width: 100% !important;
    height: 100% !important;
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
    font-size: 12px;
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
