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
    isMobileHidden?: boolean;
  }

  let {
    addWord,
    addBeatNumbers,
    addDifficultyLevel,
    includeStartPosition,
    addUserInfo,
    onToggle,
    isMobileHidden = false,
  }: Props = $props();
</script>

<section class="settings-panel image-panel" class:mobile-hidden={isMobileHidden}>
  <header class="panel-header">
    <span class="panel-icon image-icon">
      <i class="fas fa-download" aria-hidden="true"></i>
    </span>
    <h3 class="panel-title">Image Export</h3>
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
    container-type: inline-size;
    container-name: image-panel;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(12px, 2cqi, 16px);
    padding: clamp(12px, 2cqi, 20px);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 20px;
    /* Take equal width but don't stretch height */
    flex: 1 1 0;
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
    gap: clamp(6px, 1.5cqi, 10px);
    width: 100%;
  }

  .panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(26px, 8cqi, 32px);
    height: clamp(26px, 8cqi, 32px);
    border-radius: clamp(6px, 2cqi, 8px);
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

  .preview-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--theme-panel-bg) 80%, transparent);
    border-radius: clamp(10px, 2cqi, 14px);
    border: 1px solid var(--theme-stroke);
    overflow: hidden;
    /* Fixed size preview - don't grow */
    width: 100%;
    aspect-ratio: 1;
    max-width: 280px;
    box-shadow: inset 0 2px 8px var(--theme-shadow);
  }

  .panel-controls {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 2cqi, 12px);
    width: 100%;
    /* Push controls to bottom when panel is stretched */
    margin-top: auto;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1cqi, 6px);
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
    line-height: 1.2;
  }

  .toggle-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(4px, 1cqi, 8px);
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px; /* WCAG touch target */
    padding: clamp(8px, 1.5cqi, 12px) clamp(8px, 1.5cqi, 10px);
    background: color-mix(in srgb, var(--theme-card-bg) 70%, transparent);
    border: 1px solid var(--theme-stroke);
    border-radius: clamp(8px, 1.5cqi, 12px);
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

  .toggle-btn:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent) 50%, transparent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .settings-panel,
    .toggle-btn {
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

  /* Compact width adjustments */
  @container image-panel (max-width: 280px) {
    .panel-header {
      gap: 6px;
    }

    .panel-icon {
      width: 24px;
      height: 24px;
    }

    .group-label {
      font-size: 10px;
      letter-spacing: 0.3px;
    }
  }
</style>
