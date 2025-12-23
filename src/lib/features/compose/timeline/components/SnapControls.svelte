<!--
  SnapControls - Modern chip-based snap settings

  Features:
  - Master snap toggle (magnet icon)
  - Chip toggles for each snap type
  - Sheet for advanced settings (grid interval)
  - Responsive: bottom sheet on mobile, right sheet on desktop
-->
<script lang="ts">
  import { getTimelineState } from "../state/timeline-state.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  // Get timeline state directly - access the singleton once and read from it reactively
  const timelineState = getTimelineState();

  // Derived state from timeline - these will automatically update when timeline state changes
  const snapEnabled = $derived(timelineState.project.snap.enabled);
  const snapToBeats = $derived(timelineState.project.snap.snapToBeats);
  const snapToClips = $derived(timelineState.project.snap.snapToClips);
  const snapToGrid = $derived(timelineState.project.snap.snapToGrid);
  const snapToPlayhead = $derived(timelineState.project.snap.snapToPlayhead);
  const gridInterval = $derived(timelineState.project.snap.gridInterval);

  // Sheet state
  let showAdvancedSheet = $state(false);

  // Responsive placement
  let sheetPlacement = $state<"bottom" | "right">("bottom");

  $effect(() => {
    sheetPlacement = window.innerWidth < 768 ? "bottom" : "right";
    const handleResize = () => {
      sheetPlacement = window.innerWidth < 768 ? "bottom" : "right";
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  // Grid interval presets
  const GRID_PRESETS = [
    { label: "¼s", value: 0.25 },
    { label: "½s", value: 0.5 },
    { label: "1s", value: 1 },
    { label: "2s", value: 2 },
    { label: "5s", value: 5 },
  ];

  // Snap type definitions - must be $derived for reactivity in {#each}
  const snapTypes = $derived([
    {
      key: "snapToBeats",
      label: "Beats",
      icon: "fa-drum",
      active: snapToBeats,
    },
    {
      key: "snapToClips",
      label: "Clips",
      icon: "fa-film",
      active: snapToClips,
    },
    {
      key: "snapToGrid",
      label: "Grid",
      icon: "fa-border-all",
      active: snapToGrid,
    },
    {
      key: "snapToPlayhead",
      label: "Playhead",
      icon: "fa-location-crosshairs",
      active: snapToPlayhead,
    },
  ]);

  function toggleMaster() {
    timelineState.updateSnapSettings({ enabled: !snapEnabled });
  }

  function toggleSnapType(key: string) {
    const currentValue =
      key === "snapToBeats"
        ? snapToBeats
        : key === "snapToClips"
          ? snapToClips
          : key === "snapToGrid"
            ? snapToGrid
            : snapToPlayhead;
    timelineState.updateSnapSettings({ [key]: !currentValue });
  }

  function setGridInterval(value: number) {
    timelineState.updateSnapSettings({ gridInterval: value });
  }
</script>

<div class="snap-controls">
  <!-- Master Toggle -->
  <button
    class="master-toggle"
    class:active={snapEnabled}
    onclick={toggleMaster}
    title="Toggle snapping (S)"
    aria-label="Toggle snapping"
    aria-pressed={snapEnabled}
  >
    <i class="fa-solid fa-magnet"></i>
  </button>

  <!-- Snap Type Chips -->
  <div class="snap-chips" class:disabled={!snapEnabled}>
    {#each snapTypes as snapType}
      <button
        class="snap-chip"
        class:active={snapType.active}
        disabled={!snapEnabled}
        onclick={() => toggleSnapType(snapType.key)}
        title={`Snap to ${snapType.label}`}
        aria-pressed={snapType.active}
      >
        <i class="fa-solid {snapType.icon}"></i>
        <span class="chip-label">{snapType.label}</span>
      </button>
    {/each}
  </div>

  <!-- Grid Interval Quick Access (when grid is active) -->
  {#if snapEnabled && snapToGrid}
    <div class="grid-quick">
      <span class="grid-label">Grid:</span>
      <div class="grid-chips">
        {#each GRID_PRESETS.slice(0, 3) as preset}
          <button
            class="grid-chip"
            class:active={gridInterval === preset.value}
            onclick={() => setGridInterval(preset.value)}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- More Options Button -->
  <button
    class="more-btn"
    onclick={() => (showAdvancedSheet = true)}
    title="More snap options"
    aria-label="More snap options"
  >
    <i class="fa-solid fa-sliders"></i>
  </button>
</div>

<!-- Advanced Settings Sheet -->
<Drawer
  isOpen={showAdvancedSheet}
  onclose={() => (showAdvancedSheet = false)}
  placement={sheetPlacement}
  class="snap-settings-sheet"
  labelledBy="snap-settings-title"
>
  <div class="sheet-content">
    <div class="sheet-header">
      <h2 id="snap-settings-title">Snap Settings</h2>
      <button class="close-btn" onclick={() => (showAdvancedSheet = false)}>
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- Master Toggle Section -->
    <div class="setting-section">
      <button
        class="master-row"
        class:active={snapEnabled}
        onclick={toggleMaster}
      >
        <div class="setting-icon">
          <i class="fa-solid fa-magnet"></i>
        </div>
        <div class="setting-info">
          <span class="setting-name">Snapping</span>
          <span class="setting-desc">Snap clips to markers as you drag</span>
        </div>
        <div class="toggle-indicator" class:on={snapEnabled}>
          {snapEnabled ? "ON" : "OFF"}
        </div>
      </button>
    </div>

    <!-- Snap Types Section -->
    <div class="setting-section">
      <h3 class="section-title">Snap To</h3>
      <div class="snap-options-grid">
        {#each snapTypes as snapType}
          <button
            class="snap-option-card"
            class:active={snapType.active}
            class:disabled={!snapEnabled}
            disabled={!snapEnabled}
            onclick={() => toggleSnapType(snapType.key)}
          >
            <i class="fa-solid {snapType.icon}"></i>
            <span>{snapType.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Grid Interval Section -->
    <div class="setting-section" class:disabled={!snapEnabled || !snapToGrid}>
      <h3 class="section-title">Grid Interval</h3>
      <div class="interval-grid">
        {#each GRID_PRESETS as preset}
          <button
            class="interval-btn"
            class:active={gridInterval === preset.value}
            disabled={!snapEnabled || !snapToGrid}
            onclick={() => setGridInterval(preset.value)}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Keyboard Hint -->
    <div class="keyboard-hint">
      <kbd>S</kbd> Toggle snapping
    </div>
  </div>
</Drawer>

<style>
  .snap-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Master Toggle */
  .master-toggle {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.15s ease;
  }

  .master-toggle:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .master-toggle.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
  }

  /* Snap Type Chips */
  .snap-chips {
    display: flex;
    gap: 4px;
    transition: opacity 0.15s ease;
  }

  .snap-chips.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .snap-chip {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 10px;
    border-radius: 16px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-compact, 12px);
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .snap-chip i {
    font-size: 10px;
  }

  .snap-chip:hover:not(:disabled) {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    border-color: rgba(255, 255, 255, 0.2);
  }

  .snap-chip.active {
    background: rgba(74, 158, 255, 0.15);
    border-color: rgba(74, 158, 255, 0.4);
    color: var(--theme-accent, #4a9eff);
  }

  .snap-chip:disabled {
    cursor: not-allowed;
  }

  .chip-label {
    font-weight: 500;
  }

  /* Grid Quick Access */
  .grid-quick {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 8px;
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .grid-label {
    font-size: 11px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .grid-chips {
    display: flex;
    gap: 2px;
  }

  .grid-chip {
    padding: 4px 8px;
    border-radius: 4px;
    border: none;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .grid-chip:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .grid-chip.active {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  /* More Options Button */
  .more-btn {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: all 0.15s ease;
  }

  .more-btn:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  /* Sheet Styles */
  :global(.drawer-content.snap-settings-sheet) {
    max-width: 400px;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.3),
      rgba(0, 0, 0, 0.5)
    ) !important;
    backdrop-filter: blur(24px) !important;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .sheet-header h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(1.05);
  }

  .setting-section {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .setting-section.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .section-title {
    margin: 0 0 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  /* Master Row */
  .master-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .master-row:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .master-row.active {
    background: rgba(74, 158, 255, 0.15);
    border-color: rgba(74, 158, 255, 0.3);
  }

  .setting-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    font-size: 16px;
    color: var(--theme-text-muted);
  }

  .master-row.active .setting-icon {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  .setting-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .setting-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: white;
  }

  .setting-desc {
    font-size: 0.75rem;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .toggle-indicator {
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--theme-text-muted);
    transition: all 0.2s ease;
  }

  .toggle-indicator.on {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  /* Snap Options Grid */
  .snap-options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .snap-option-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .snap-option-card:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .snap-option-card.active {
    background: rgba(74, 158, 255, 0.15);
    border-color: rgba(74, 158, 255, 0.4);
  }

  .snap-option-card.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .snap-option-card i {
    font-size: 20px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
  }

  .snap-option-card.active i {
    color: var(--theme-accent, #4a9eff);
  }

  .snap-option-card span {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
  }

  /* Interval Grid */
  .interval-grid {
    display: flex;
    gap: 8px;
  }

  .interval-btn {
    flex: 1;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .interval-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .interval-btn.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
  }

  .interval-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Keyboard Hint */
  .keyboard-hint {
    margin-top: auto;
    padding: 14px 20px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.75rem;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    text-align: center;
  }

  .keyboard-hint kbd {
    display: inline-block;
    padding: 3px 7px;
    margin-right: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.75rem;
  }

  /* Responsive - hide labels on small screens */
  @container (max-width: 600px) {
    .chip-label {
      display: none;
    }

    .snap-chip {
      padding: 6px 8px;
    }

    .grid-quick {
      display: none;
    }
  }
</style>
