<!--
  StaticPreview.svelte

  Static image format preview with inline controls.
  Displays static image canvas and settings gear icon.

  Features:
  - Static image preview canvas
  - Dimension display
  - Quality indicator
  - Settings button (opens StaticSettings panel)
  - Background preview

  Domain: Share Hub - Single Media - Static Image Format
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';

  const state = getShareHubState();

  const dimensionText = $derived(
    `${state.staticSettings.width} × ${state.staticSettings.height}`
  );

  const qualityText = $derived(`${state.staticSettings.quality}%`);

  function handleSettingsClick() {
    state.settingsPanelOpen = true;
    state.settingsContext = { format: 'static' };
  }
</script>

<div class="static-preview">
  <!-- Preview Canvas -->
  <div class="preview-canvas">
    <!-- TODO: Integrate ImageCompositionService for static rendering -->
    <div class="placeholder-canvas">
      <i class="fas fa-image"></i>
      <p>Static Image Preview</p>
      <span class="background-indicator">
        Background: {state.staticSettings.background}
      </span>
    </div>
  </div>

  <!-- Inline Controls -->
  <div class="inline-controls">
    <div class="control-group">
      <i class="fas fa-expand-arrows-alt"></i>
      <span>{dimensionText}</span>
    </div>

    <div class="control-group">
      <i class="fas fa-sliders-h"></i>
      <span>Quality: {qualityText}</span>
    </div>

    <div class="control-group">
      <i class="fas fa-palette"></i>
      <span class="background-chip" data-background={state.staticSettings.background}>
        {state.staticSettings.background}
      </span>
    </div>

    <button
      class="control-button settings-button"
      onclick={handleSettingsClick}
      aria-label="Static image settings"
    >
      <i class="fas fa-cog"></i>
    </button>
  </div>
</div>

<style>
  .static-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
  }

  .preview-canvas {
    flex: 1;
    min-height: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .placeholder-canvas i {
    font-size: 48px;
    opacity: 0.3;
  }

  .placeholder-canvas p {
    font-size: var(--font-size-min, 14px);
    margin: 0;
  }

  .background-indicator {
    font-size: var(--font-size-compact, 12px);
    padding: 4px 12px;
    background: var(--theme-accent, rgba(74, 158, 255, 0.2));
    border-radius: 12px;
    text-transform: capitalize;
  }

  .inline-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .control-group i {
    font-size: 14px;
    opacity: 0.7;
  }

  .background-chip {
    text-transform: capitalize;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: var(--font-size-compact, 12px);
    font-weight: 500;
  }

  .background-chip[data-background='transparent'] {
    background: repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.1) 10px,
      rgba(0, 0, 0, 0.1) 10px,
      rgba(0, 0, 0, 0.1) 20px
    );
    color: var(--theme-text, white);
  }

  .background-chip[data-background='white'] {
    background: white;
    color: black;
  }

  .background-chip[data-background='black'] {
    background: black;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    color: var(--theme-text, white);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-button i {
    font-size: 16px;
  }

  .control-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .control-button:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .settings-button {
    margin-left: auto;
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .inline-controls {
      gap: 8px;
    }

    .control-group {
      font-size: var(--font-size-compact, 12px);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-button {
      transition: none;
    }
  }
</style>
