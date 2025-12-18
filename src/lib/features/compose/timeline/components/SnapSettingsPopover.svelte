<script lang="ts">
  /**
   * SnapSettingsPopover - Configuration popup for snap behavior
   *
   * Allows toggling:
   * - Snap to beats
   * - Snap to clip edges
   * - Snap to grid
   * - Snap to playhead
   * - Grid interval adjustment
   */

  import { getTimelineState } from "../state/timeline-state.svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  function getState() {
    return getTimelineState();
  }

  // Local reactive state for snap settings
  let snapEnabled = $state(true);
  let snapToBeats = $state(true);
  let snapToClips = $state(true);
  let snapToGrid = $state(true);
  let snapToPlayhead = $state(true);
  let gridInterval = $state(1);

  // Sync from timeline state
  $effect(() => {
    const state = getState();
    snapEnabled = state.project.snap.enabled;
    snapToBeats = state.project.snap.snapToBeats;
    snapToClips = state.project.snap.snapToClips;
    snapToGrid = state.project.snap.snapToGrid;
    snapToPlayhead = state.project.snap.snapToPlayhead;
    gridInterval = state.project.snap.gridInterval;
  });

  // Grid interval presets
  const GRID_PRESETS = [
    { label: "0.25s", value: 0.25 },
    { label: "0.5s", value: 0.5 },
    { label: "1s", value: 1 },
    { label: "2s", value: 2 },
    { label: "5s", value: 5 },
  ];

  function handleToggle(key: string, value: boolean) {
    getState().updateSnapSettings({ [key]: value });
  }

  function handleGridInterval(value: number) {
    getState().updateSnapSettings({ gridInterval: value });
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <button
    class="backdrop"
    onclick={onClose}
    aria-label="Close snap settings"
  ></button>

  <!-- Popover -->
  <div class="snap-popover" role="dialog" aria-label="Snap settings">
    <div class="popover-header">
      <h3>Snap Settings</h3>
      <button class="close-btn" onclick={onClose}>
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div class="settings-list">
      <!-- Master toggle -->
      <label class="setting-row master">
        <span class="setting-label">
          <i class="fa-solid fa-magnet"></i>
          Snapping Enabled
        </span>
        <input
          type="checkbox"
          checked={snapEnabled}
          onchange={(e) => handleToggle("enabled", (e.target as HTMLInputElement).checked)}
        />
      </label>

      <div class="divider"></div>

      <!-- Individual snap options -->
      <label class="setting-row" class:disabled={!snapEnabled}>
        <span class="setting-label">
          <i class="fa-solid fa-drum"></i>
          Snap to Beats
        </span>
        <input
          type="checkbox"
          checked={snapToBeats}
          disabled={!snapEnabled}
          onchange={(e) => handleToggle("snapToBeats", (e.target as HTMLInputElement).checked)}
        />
      </label>

      <label class="setting-row" class:disabled={!snapEnabled}>
        <span class="setting-label">
          <i class="fa-solid fa-film"></i>
          Snap to Clips
        </span>
        <input
          type="checkbox"
          checked={snapToClips}
          disabled={!snapEnabled}
          onchange={(e) => handleToggle("snapToClips", (e.target as HTMLInputElement).checked)}
        />
      </label>

      <label class="setting-row" class:disabled={!snapEnabled}>
        <span class="setting-label">
          <i class="fa-solid fa-border-all"></i>
          Snap to Grid
        </span>
        <input
          type="checkbox"
          checked={snapToGrid}
          disabled={!snapEnabled}
          onchange={(e) => handleToggle("snapToGrid", (e.target as HTMLInputElement).checked)}
        />
      </label>

      <label class="setting-row" class:disabled={!snapEnabled}>
        <span class="setting-label">
          <i class="fa-solid fa-location-crosshairs"></i>
          Snap to Playhead
        </span>
        <input
          type="checkbox"
          checked={snapToPlayhead}
          disabled={!snapEnabled}
          onchange={(e) => handleToggle("snapToPlayhead", (e.target as HTMLInputElement).checked)}
        />
      </label>

      <div class="divider"></div>

      <!-- Grid interval -->
      <div class="setting-row column" class:disabled={!snapEnabled || !snapToGrid}>
        <span class="setting-label">
          <i class="fa-solid fa-ruler-horizontal"></i>
          Grid Interval
        </span>
        <div class="grid-presets">
          {#each GRID_PRESETS as preset}
            <button
              class="preset-btn"
              class:active={gridInterval === preset.value}
              disabled={!snapEnabled || !snapToGrid}
              onclick={() => handleGridInterval(preset.value)}
            >
              {preset.label}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Keyboard shortcut hint -->
    <div class="hint">
      <kbd>S</kbd> Toggle snapping
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: transparent;
    z-index: 100;
    border: none;
    cursor: default;
  }

  .snap-popover {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 101;
    width: 260px;
    background: var(--theme-panel-bg, rgba(30, 30, 30, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(12px);
    overflow: hidden;
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .popover-header h3 {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .close-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .settings-list {
    padding: 8px;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .setting-row:hover:not(.disabled) {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.05));
  }

  .setting-row.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .setting-row.master {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    margin-bottom: 4px;
  }

  .setting-row.column {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .setting-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  .setting-label i {
    width: 16px;
    text-align: center;
    font-size: 12px;
    opacity: 0.7;
  }

  .setting-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--theme-accent, #4a9eff);
    cursor: pointer;
  }

  .divider {
    height: 1px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    margin: 6px 0;
  }

  .grid-presets {
    display: flex;
    gap: 4px;
  }

  .preset-btn {
    flex: 1;
    padding: 6px 8px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 4px;
    font-size: 11px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-btn:hover:not(:disabled) {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .preset-btn.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
  }

  .preset-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .hint {
    padding: 8px 12px;
    background: rgba(0, 0, 0, 0.15);
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.05));
    font-size: 10px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    text-align: center;
  }

  .hint kbd {
    padding: 2px 5px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    font-family: monospace;
    font-size: 10px;
  }
</style>
