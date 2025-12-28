<!--
  ImagePanel.svelte

  Settings panel for image export visibility options.
  Controls what elements are included in exported images.
-->
<script lang="ts">
  import ImageExportPreview from "./ImageExportPreview.svelte";
  import { exampleBeatData } from "./example-data";

  interface Props {
    addWord: boolean;
    addBeatNumbers: boolean;
    addDifficultyLevel: boolean;
    includeStartPosition: boolean;
    addUserInfo: boolean;
    onToggle: (key: string) => void;
    onOpenHelp: () => void;
    isMobileHidden?: boolean;
  }

  let {
    addWord,
    addBeatNumbers,
    addDifficultyLevel,
    includeStartPosition,
    addUserInfo,
    onToggle,
    onOpenHelp,
    isMobileHidden = false,
  }: Props = $props();
</script>

<section class="settings-panel image-panel" class:mobile-hidden={isMobileHidden}>
  <header class="panel-header">
    <span class="panel-icon image-icon">
      <i class="fas fa-download" aria-hidden="true"></i>
    </span>
    <h3 class="panel-title">Image Export</h3>
    <button
      class="help-btn"
      onclick={onOpenHelp}
      aria-label="Learn about image export options"
      type="button"
    >
      <i class="fas fa-info-circle" aria-hidden="true"></i>
    </button>
  </header>

  <div class="preview-frame image-preview">
    <ImageExportPreview beatData={exampleBeatData} />
  </div>

  <div class="panel-controls">
    <div class="control-group">
      <span class="group-label">Include in Image</span>
      <div class="toggle-grid">
        <button
          class="toggle-btn"
          class:active={addWord}
          onclick={() => onToggle("word")}>Word</button
        >
        <button
          class="toggle-btn"
          class:active={addBeatNumbers}
          onclick={() => onToggle("beatNumbers")}>Beat #s</button
        >
        <button
          class="toggle-btn"
          class:active={includeStartPosition}
          onclick={() => onToggle("startPosition")}>Start Pos</button
        >
        <button
          class="toggle-btn"
          class:active={addDifficultyLevel}
          onclick={() => onToggle("difficulty")}>Difficulty</button
        >
        <button
          class="toggle-btn"
          class:active={addUserInfo}
          onclick={() => onToggle("userInfo")}>User Info</button
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
    font-size: var(--font-size-sm);
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .panel-icon.image-icon {
    --icon-color: #34d399;
    background: color-mix(in srgb, var(--icon-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--icon-color) 35%, transparent);
    color: var(--icon-color);
    box-shadow: 0 0 8px color-mix(in srgb, var(--icon-color) 15%, transparent);
  }

  .settings-panel:hover .panel-icon {
    box-shadow: 0 0 12px color-mix(in srgb, var(--icon-color) 25%, transparent);
  }

  .panel-title {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--theme-text);
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
    background: color-mix(in srgb, #34d399 15%, transparent);
    border: 1px solid color-mix(in srgb, #34d399 30%, transparent);
    border-radius: 50%;
    color: #34d399;
    font-size: var(--font-size-min);
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .help-btn:hover {
    background: color-mix(in srgb, #34d399 25%, transparent);
    border-color: color-mix(in srgb, #34d399 45%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, #34d399 25%, transparent);
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
    box-shadow: inset 0 2px 8px var(--theme-shadow);
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
    font-size: var(--font-size-compact);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--theme-text-dim, var(--theme-text-dim));
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
    font-size: var(--font-size-compact);
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
      var(--theme-accent, var(--theme-accent)) 25%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--theme-accent)) 45%,
      transparent
    );
    color: white;
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, var(--theme-accent)) 15%, transparent),
      0 4px 12px
        color-mix(in srgb, var(--theme-accent, var(--theme-accent)) 25%, transparent);
  }

  .toggle-btn.active:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent) 35%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, var(--theme-accent)) 55%,
      transparent
    );
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, var(--theme-accent)) 20%, transparent),
      0 4px 16px
        color-mix(in srgb, var(--theme-accent, var(--theme-accent)) 35%, transparent);
  }

  .toggle-btn:focus-visible,
  .help-btn:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent) 50%, transparent);
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
      border-color: var(--theme-accent, var(--theme-accent));
    }

    .toggle-btn:focus-visible {
      outline-width: 3px;
    }
  }
</style>
