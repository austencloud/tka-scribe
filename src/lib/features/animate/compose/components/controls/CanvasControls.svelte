<script lang="ts">
  /**
   * CanvasControls - Bottom control bar for composition canvas
   *
   * Provides:
   * - Play/Pause/Stop playback controls
   * - Preview mode toggle (static/live)
   * - Speed selector
   * - Layout picker
   * - Templates button
   */

  import { getCompositionState } from "../../state/composition-state.svelte";
  import { LAYOUT_PRESETS, type LayoutPresetKey } from "../../domain/types";
  import type { PlaybackSpeed } from "../../domain/types";

  // Renamed to avoid conflict with $state rune
  const compState = getCompositionState();

  // Reactive bindings
  const isPlaying = $derived(compState.isPlaying);
  const isPreviewing = $derived(compState.isPreviewing);
  const speed = $derived(compState.speed);
  const canPlay = $derived(compState.canPlay);
  const layout = $derived(compState.composition.layout);

  // Speed options
  const SPEED_OPTIONS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

  // Current layout key
  const currentLayoutKey = $derived(
    (Object.entries(LAYOUT_PRESETS).find(
      ([_, preset]) => preset.rows === layout.rows && preset.cols === layout.cols
    )?.[0] ?? "custom") as LayoutPresetKey | "custom"
  );

  // Layout dropdown state
  let showLayoutDropdown = $state(false);
  let showSpeedDropdown = $state(false);

  function handlePlayPause() {
    compState.togglePlayPause();
  }

  function handleStop() {
    compState.stop();
  }

  function handlePreviewToggle() {
    compState.togglePreview();
  }

  function handleSpeedChange(newSpeed: PlaybackSpeed) {
    compState.setSpeed(newSpeed);
    showSpeedDropdown = false;
  }

  function handleLayoutChange(key: LayoutPresetKey) {
    const preset = LAYOUT_PRESETS[key];
    compState.setLayout(preset);
    showLayoutDropdown = false;
  }

  function handleOpenTemplates() {
    compState.openTemplates();
  }

  // Close dropdowns on outside click
  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest(".layout-picker")) {
      showLayoutDropdown = false;
    }
    if (!target.closest(".speed-picker")) {
      showSpeedDropdown = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="canvas-controls">
  <!-- Left: Playback Controls -->
  <div class="control-group playback-controls">
    <button
      class="control-btn play-btn"
      class:playing={isPlaying}
      onclick={handlePlayPause}
      disabled={!canPlay}
      title={isPlaying ? "Pause" : "Play"}
      aria-label={isPlaying ? "Pause playback" : "Start playback"}
    >
      <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
    </button>

    <button
      class="control-btn stop-btn"
      onclick={handleStop}
      disabled={!isPlaying}
      title="Stop"
      aria-label="Stop playback"
    >
      <i class="fas fa-stop"></i>
    </button>

    <!-- Speed Picker -->
    <div class="speed-picker">
      <button
        class="control-btn speed-btn"
        onclick={() => (showSpeedDropdown = !showSpeedDropdown)}
        title="Playback speed"
        aria-label="Change playback speed"
        aria-expanded={showSpeedDropdown}
      >
        <span>{speed}x</span>
        <i class="fas fa-chevron-down"></i>
      </button>

      {#if showSpeedDropdown}
        <div class="dropdown speed-dropdown">
          {#each SPEED_OPTIONS as option}
            <button
              class="dropdown-item"
              class:active={speed === option}
              onclick={() => handleSpeedChange(option)}
            >
              {option}x
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Center: Preview Toggle -->
  <div class="control-group preview-group">
    <button
      class="control-btn preview-toggle"
      class:active={isPreviewing}
      onclick={handlePreviewToggle}
      title={isPreviewing ? "Switch to static" : "Switch to live preview"}
      aria-label="Toggle preview mode"
      aria-pressed={isPreviewing}
    >
      <i class="fas {isPreviewing ? 'fa-eye' : 'fa-eye-slash'}"></i>
      <span class="preview-label">{isPreviewing ? "Live" : "Static"}</span>
    </button>
  </div>

  <!-- Right: Layout & Templates -->
  <div class="control-group config-controls">
    <!-- Layout Picker -->
    <div class="layout-picker">
      <button
        class="control-btn layout-btn"
        onclick={() => (showLayoutDropdown = !showLayoutDropdown)}
        title="Change grid layout"
        aria-label="Change grid layout"
        aria-expanded={showLayoutDropdown}
      >
        <i class="fas fa-th"></i>
        <span>{layout.rows}×{layout.cols}</span>
        <i class="fas fa-chevron-down"></i>
      </button>

      {#if showLayoutDropdown}
        <div class="dropdown layout-dropdown">
          {#each Object.entries(LAYOUT_PRESETS) as [key, preset]}
            <button
              class="dropdown-item"
              class:active={currentLayoutKey === key}
              onclick={() => handleLayoutChange(key as LayoutPresetKey)}
            >
              <span class="layout-preview">
                {#each Array(preset.rows) as _, row}
                  <span class="layout-row">
                    {#each Array(preset.cols) as _, col}
                      <span class="layout-cell"></span>
                    {/each}
                  </span>
                {/each}
              </span>
              <span>{preset.rows}×{preset.cols}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Templates Button -->
    <button
      class="control-btn templates-btn"
      onclick={handleOpenTemplates}
      title="Browse templates"
      aria-label="Open templates"
    >
      <i class="fas fa-magic"></i>
      <span class="templates-label">Templates</span>
    </button>
  </div>
</div>

<style>
  .canvas-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md, 16px);
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    background: rgba(20, 20, 35, 0.95);
    border-radius: clamp(8px, 2vmin, 12px);
    backdrop-filter: blur(8px);
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 4px);
  }

  /* Control buttons */
  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: clamp(8px, 2vmin, 12px) clamp(12px, 2.5vmin, 16px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(6px, 1.5vmin, 10px);
    color: rgba(255, 255, 255, 0.85);
    font-size: clamp(0.75rem, 2vmin, 0.9rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .control-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .control-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .control-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .control-btn i {
    font-size: 1em;
  }

  /* Play button */
  .play-btn {
    background: rgba(16, 185, 129, 0.3);
    border-color: rgba(16, 185, 129, 0.5);
    min-width: clamp(40px, 10vmin, 56px);
  }

  .play-btn:hover:not(:disabled) {
    background: rgba(16, 185, 129, 0.5);
    border-color: rgba(16, 185, 129, 0.7);
  }

  .play-btn.playing {
    background: rgba(245, 158, 11, 0.3);
    border-color: rgba(245, 158, 11, 0.5);
  }

  .play-btn.playing:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.5);
    border-color: rgba(245, 158, 11, 0.7);
  }

  /* Preview toggle */
  .preview-toggle.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .preview-toggle.active:hover {
    background: rgba(59, 130, 246, 0.5);
    border-color: rgba(59, 130, 246, 0.7);
  }

  /* Templates button */
  .templates-btn {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.4);
  }

  .templates-btn:hover {
    background: rgba(139, 92, 246, 0.4);
    border-color: rgba(139, 92, 246, 0.6);
  }

  /* Dropdowns */
  .layout-picker,
  .speed-picker {
    position: relative;
  }

  .dropdown {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
    background: rgba(30, 30, 50, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(6px, 1.5vmin, 10px);
    padding: var(--spacing-xs, 4px);
    min-width: 100px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    z-index: 100;
  }

  .layout-dropdown {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    min-width: 180px;
  }

  .speed-dropdown {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: clamp(6px, 1.5vmin, 10px);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: clamp(0.7rem, 1.8vmin, 0.85rem);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .dropdown-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .dropdown-item.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }

  /* Layout preview in dropdown */
  .layout-preview {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .layout-row {
    display: flex;
    gap: 2px;
  }

  .layout-cell {
    width: 8px;
    height: 8px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 2px;
  }

  /* Labels hidden on small screens */
  .preview-label,
  .templates-label {
    display: none;
  }

  @media (min-width: 600px) {
    .preview-label,
    .templates-label {
      display: inline;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-btn {
      transition: none;
    }

    .control-btn:active:not(:disabled) {
      transform: none;
    }
  }
</style>
