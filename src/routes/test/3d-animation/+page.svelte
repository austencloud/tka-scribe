<script lang="ts">
  /**
   * 3D Animation Test Page
   *
   * Sandboxed development environment for the 3D animation system.
   * Load sequences from the library to view them in 3D.
   * Full localStorage persistence for seamless dev experience.
   */

  import { onMount, onDestroy } from "svelte";
  import Scene3D from "$lib/shared/3d-animation/components/Scene3D.svelte";
  import Staff3D from "$lib/shared/3d-animation/components/Staff3D.svelte";
  import { Plane, PLANE_LABELS, PLANE_COLORS } from "$lib/shared/3d-animation/domain/enums/Plane";
  import type { GridMode } from "$lib/shared/3d-animation/domain/constants/grid-layout";
  import { createAnimation3DState } from "$lib/shared/3d-animation/state/animation-3d-state.svelte";
  import SequenceBrowserPanel from "$lib/shared/animation-engine/components/SequenceBrowserPanel.svelte";
  import { saveState, loadState, parsePlanes } from "$lib/shared/3d-animation/utils/persistence";
  import type { CameraState } from "$lib/shared/3d-animation/components/Scene3D.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  // Animation state
  const animState = createAnimation3DState();

  // UI state - will be restored from localStorage
  let visiblePlanes = $state(new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]));
  let showGrid = $state(true);
  let showLabels = $state(true);
  let gridMode = $state<GridMode>("diamond");
  let cameraPreset = $state<"front" | "top" | "side" | "perspective">("perspective");
  let panelOpen = $state(true);
  let browserOpen = $state(false);

  // Camera position from orbit controls (persisted)
  let customCameraPosition = $state<[number, number, number] | null>(null);
  let customCameraTarget = $state<[number, number, number] | null>(null);

  // Track if initial load is complete (to avoid saving during hydration)
  let initialized = $state(false);

  // Handle camera changes from orbit controls
  function handleCameraChange(state: CameraState) {
    customCameraPosition = state.position;
    customCameraTarget = state.target;
  }

  // Reset custom camera when preset button is clicked
  function setCameraPreset(preset: typeof cameraPreset) {
    cameraPreset = preset;
    customCameraPosition = null;
    customCameraTarget = null;
  }

  // Load persisted state on mount
  onMount(() => {
    const saved = loadState();

    // Restore UI state
    if (saved.visiblePlanes) visiblePlanes = parsePlanes(saved.visiblePlanes);
    if (saved.showGrid !== undefined) showGrid = saved.showGrid;
    if (saved.showLabels !== undefined) showLabels = saved.showLabels;
    if (saved.gridMode) gridMode = saved.gridMode;
    if (saved.cameraPreset) cameraPreset = saved.cameraPreset;
    if (saved.panelOpen !== undefined) panelOpen = saved.panelOpen;
    if (saved.speedIndex !== undefined) speedIndex = saved.speedIndex;

    // Restore camera position
    if (saved.cameraPosition) customCameraPosition = saved.cameraPosition;
    if (saved.cameraTarget) customCameraTarget = saved.cameraTarget;

    // Restore playback settings
    if (saved.loop !== undefined) animState.loop = saved.loop;

    // Restore sequence (if one was loaded)
    if (saved.loadedSequence) {
      animState.loadSequence(saved.loadedSequence);
      if (saved.currentBeatIndex !== undefined) {
        animState.goToBeat(saved.currentBeatIndex);
      }
    }

    // Mark as initialized after a tick to allow state to settle
    setTimeout(() => {
      initialized = true;
    }, 50);
  });

  // Persist UI state changes
  $effect(() => {
    if (!initialized) return;
    saveState({
      visiblePlanes: Array.from(visiblePlanes),
      showGrid,
      showLabels,
      gridMode,
      cameraPreset,
      panelOpen,
      speedIndex,
    });
  });

  // Persist camera position (debounced via the change handler)
  $effect(() => {
    if (!initialized) return;
    saveState({
      cameraPosition: customCameraPosition,
      cameraTarget: customCameraTarget,
    });
  });

  // Persist playback settings
  $effect(() => {
    if (!initialized) return;
    saveState({
      loop: animState.loop,
    });
  });

  // Persist sequence state (full sequence data for instant restore)
  $effect(() => {
    if (!initialized) return;
    saveState({
      loadedSequence: animState.loadedSequence ?? null,
      currentBeatIndex: animState.currentBeatIndex,
    });
  });

  function togglePlane(plane: Plane) {
    const newSet = new Set(visiblePlanes);
    if (newSet.has(plane)) {
      newSet.delete(plane);
    } else {
      newSet.add(plane);
    }
    visiblePlanes = newSet;
  }

  const allPlanes = [Plane.WALL, Plane.WHEEL, Plane.FLOOR];

  // Camera options
  const cameraOptions: Array<{ value: typeof cameraPreset; label: string }> = [
    { value: "perspective", label: "3D" },
    { value: "front", label: "Wall" },
    { value: "top", label: "Floor" },
    { value: "side", label: "Wheel" },
  ];

  // Speed control
  const speeds = [0.25, 0.5, 1, 2];
  let speedIndex = $state(2);
  $effect(() => {
    animState.speed = speeds[speedIndex];
  });

  // Handle sequence selection from browser
  function handleSequenceSelect(sequence: SequenceData) {
    animState.loadSequence(sequence);
    browserOpen = false;
  }

  onDestroy(() => animState.destroy());

  const progressPercent = $derived(Math.round(animState.progress * 100));
</script>

<svelte:head>
  <title>3D Animation Test | TKA Scribe</title>
</svelte:head>

<div class="layout">
  <!-- Scene Area -->
  <main class="scene-area">
    <Scene3D
      {visiblePlanes}
      {showGrid}
      {showLabels}
      {gridMode}
      {cameraPreset}
      {customCameraPosition}
      {customCameraTarget}
      onCameraChange={handleCameraChange}
    >
      {#if animState.showBlue && animState.bluePropState}
        <Staff3D propState={animState.bluePropState} color="blue" />
      {/if}
      {#if animState.showRed && animState.redPropState}
        <Staff3D propState={animState.redPropState} color="red" />
      {/if}
    </Scene3D>

    <!-- Overlay Controls -->
    <div class="scene-controls">
      <!-- Top row: Camera + Sequence Name + Speed -->
      <div class="top-controls">
        <div class="control-group">
          {#each cameraOptions as opt}
            <button
              class="ctrl-btn"
              class:active={cameraPreset === opt.value && !customCameraPosition}
              onclick={() => setCameraPreset(opt.value)}
            >
              {opt.label}
            </button>
          {/each}
        </div>

        <!-- Sequence Info (when loaded) -->
        {#if animState.hasSequence && animState.loadedSequence}
          <div class="sequence-info">
            <span class="sequence-name">{animState.loadedSequence.word || animState.loadedSequence.name}</span>
            <button class="clear-btn" onclick={() => animState.clearSequence()}>
              <i class="fas fa-times"></i>
            </button>
          </div>
        {/if}

        <div class="control-group">
          {#each speeds as spd, i}
            <button
              class="ctrl-btn"
              class:active={speedIndex === i}
              onclick={() => (speedIndex = i)}
            >
              {spd === 0.25 ? "¼" : spd === 0.5 ? "½" : spd}×
            </button>
          {/each}
        </div>
      </div>

      <!-- Bottom: Playback -->
      <div class="playback-controls">
        <!-- Beat navigation (when sequence loaded) -->
        {#if animState.hasSequence && animState.totalBeats > 0}
          <button
            class="play-btn"
            onclick={() => animState.prevBeat()}
            disabled={animState.currentBeatIndex === 0}
          >
            <i class="fas fa-step-backward"></i>
          </button>

          <span class="beat-indicator">
            {animState.currentBeatIndex + 1} / {animState.totalBeats}
          </span>

          <button
            class="play-btn"
            onclick={() => animState.nextBeat()}
            disabled={animState.currentBeatIndex >= animState.totalBeats - 1}
          >
            <i class="fas fa-step-forward"></i>
          </button>

          <div class="divider"></div>
        {/if}

        <button class="play-btn" onclick={() => animState.reset()}>
          <i class="fas fa-undo"></i>
        </button>

        <button class="play-btn primary" onclick={() => animState.togglePlay()}>
          <i class="fas" class:fa-pause={animState.isPlaying} class:fa-play={!animState.isPlaying}></i>
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={animState.progress}
          oninput={(e) => animState.setProgress(parseFloat(e.currentTarget.value))}
          class="progress-slider"
        />

        <span class="progress-label">{progressPercent}%</span>

        <button
          class="play-btn"
          class:active={animState.loop}
          onclick={() => (animState.loop = !animState.loop)}
        >
          <i class="fas fa-sync"></i>
        </button>

        <button
          class="play-btn toggle-panel"
          onclick={() => (panelOpen = !panelOpen)}
        >
          <i class="fas" class:fa-chevron-right={panelOpen} class:fa-chevron-left={!panelOpen}></i>
        </button>
      </div>
    </div>
  </main>

  <!-- Side Panel -->
  <aside class="side-panel" class:collapsed={!panelOpen}>
    <!-- Load Sequence Button -->
    <div class="load-section">
      <button class="load-btn" onclick={() => (browserOpen = true)}>
        <i class="fas fa-folder-open"></i>
        Load Sequence
      </button>
    </div>

    <!-- Sequence Info -->
    {#if animState.hasSequence}
      <div class="sequence-header">
        <span class="mode-label">Beat {animState.currentBeatIndex + 1} of {animState.totalBeats}</span>
      </div>
    {:else}
      <div class="empty-state">
        <i class="fas fa-film"></i>
        <p>Load a sequence to begin</p>
      </div>
    {/if}

    <!-- Active Config -->
    <div class="config-scroll">
      {#if animState.hasSequence}
        <!-- Show current beat motion info -->
        {#if animState.showBlue && animState.activeBlueConfig}
          <div class="config-readonly">
            <div class="config-header blue">
              <span class="dot"></span>
              <span>Blue</span>
            </div>
            <div class="config-details">
              <span>{animState.activeBlueConfig.startLocation} → {animState.activeBlueConfig.endLocation}</span>
              <span>{animState.activeBlueConfig.motionType}</span>
              <span>{animState.activeBlueConfig.turns} turns</span>
            </div>
          </div>
        {/if}
        {#if animState.showRed && animState.activeRedConfig}
          <div class="config-readonly">
            <div class="config-header red">
              <span class="dot"></span>
              <span>Red</span>
            </div>
            <div class="config-details">
              <span>{animState.activeRedConfig.startLocation} → {animState.activeRedConfig.endLocation}</span>
              <span>{animState.activeRedConfig.motionType}</span>
              <span>{animState.activeRedConfig.turns} turns</span>
            </div>
          </div>
        {/if}
      {/if}

      <!-- Grid Settings -->
      <section class="planes-section">
        <h3>Grid</h3>

        <!-- Grid Mode Toggle -->
        <div class="mode-toggle">
          <button
            class="mode-btn"
            class:active={gridMode === "diamond"}
            onclick={() => (gridMode = "diamond")}
          >
            <i class="fas fa-diamond"></i>
            Diamond
          </button>
          <button
            class="mode-btn"
            class:active={gridMode === "box"}
            onclick={() => (gridMode = "box")}
          >
            <i class="fas fa-square"></i>
            Box
          </button>
        </div>

        <!-- Plane Visibility -->
        <div class="plane-btns">
          {#each allPlanes as plane}
            <button
              class="plane-btn"
              class:active={visiblePlanes.has(plane)}
              style="--color: {PLANE_COLORS[plane]}"
              onclick={() => togglePlane(plane)}
            >
              <span class="indicator"></span>
              {PLANE_LABELS[plane]}
            </button>
          {/each}
        </div>
      </section>
    </div>
  </aside>
</div>

<!-- Sequence Browser Panel -->
<SequenceBrowserPanel
  mode="primary"
  show={browserOpen}
  onSelect={handleSequenceSelect}
  onClose={() => (browserOpen = false)}
/>

<style>
  .layout {
    display: flex;
    height: 100vh;
    height: 100dvh;
    background: #0a0a12;
    color: white;
    font-family: system-ui, -apple-system, sans-serif;
    overflow: hidden;
  }

  /* Scene Area */
  .scene-area {
    flex: 1;
    position: relative;
    min-width: 300px;
  }

  .scene-controls {
    position: absolute;
    inset: 0;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 1rem;
  }

  .scene-controls > * {
    pointer-events: auto;
  }

  /* Top Controls */
  .top-controls {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .control-group {
    display: flex;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.7));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 4px;
    backdrop-filter: blur(8px);
  }

  .ctrl-btn {
    min-width: 48px;
    min-height: 48px;
    padding: 0 0.75rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .ctrl-btn:hover {
    color: var(--theme-text, white);
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
  }

  .ctrl-btn.active {
    color: white;
    background: var(--theme-accent, rgba(139, 92, 246, 0.5));
  }

  /* Sequence Info */
  .sequence-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.7));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 4px 4px 4px 12px;
    backdrop-filter: blur(8px);
  }

  .sequence-name {
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clear-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .clear-btn:hover {
    background: var(--semantic-error, #ef4444);
    color: white;
  }

  /* Playback Controls */
  .playback-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.7));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    padding: 0.5rem;
    backdrop-filter: blur(8px);
    align-self: center;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }

  .beat-indicator {
    min-width: 4rem;
    text-align: center;
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--theme-accent, #8b5cf6);
  }

  .divider {
    width: 1px;
    height: 32px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    margin: 0 0.25rem;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: none;
    border-radius: 12px;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .play-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    color: white;
  }

  .play-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .play-btn.primary {
    width: 56px;
    height: 56px;
    background: var(--theme-accent, #8b5cf6);
    color: white;
    border-radius: 50%;
  }

  .play-btn.primary:hover {
    background: #7c3aed;
  }

  .play-btn.active {
    background: rgba(139, 92, 246, 0.4);
    color: #a78bfa;
  }

  .progress-slider {
    flex: 1;
    min-width: 80px;
    max-width: 200px;
    height: 48px;
    accent-color: var(--theme-accent, #8b5cf6);
  }

  .progress-label {
    min-width: 3rem;
    font-size: var(--font-size-sm, 0.875rem);
    font-variant-numeric: tabular-nums;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    text-align: center;
  }

  .toggle-panel {
    display: none;
  }

  /* Side Panel */
  .side-panel {
    width: 420px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.02));
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    transition: width 0.3s ease, opacity 0.3s ease;
  }

  .side-panel.collapsed {
    width: 0;
    opacity: 0;
    overflow: hidden;
  }

  /* Load Section */
  .load-section {
    padding: 1rem;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .load-btn {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--theme-accent, #8b5cf6);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .load-btn:hover {
    background: #7c3aed;
    transform: translateY(-1px);
  }

  .load-btn:active {
    transform: translateY(0);
  }

  /* Sequence Header */
  .sequence-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .mode-label {
    font-size: var(--font-size-compact, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .beat-label {
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    color: var(--theme-accent, #8b5cf6);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    text-align: center;
  }

  .empty-state i {
    font-size: 2rem;
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--font-size-sm, 0.875rem);
  }

  /* Prop Tabs */
  .prop-tabs {
    display: flex;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .prop-tab {
    flex: 1;
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: transparent;
    border: none;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }

  .prop-tab::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 1rem;
    right: 1rem;
    height: 3px;
    background: transparent;
    border-radius: 3px 3px 0 0;
    transition: background 0.15s;
  }

  .prop-tab.blue.active::after {
    background: var(--prop-blue, #3b82f6);
  }

  .prop-tab.red.active::after {
    background: var(--prop-red, #ef4444);
  }

  .prop-tab.active {
    color: var(--theme-text, white);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
  }

  .prop-tab .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .prop-tab.blue .dot {
    background: var(--prop-blue, #3b82f6);
  }

  .prop-tab.red .dot {
    background: var(--prop-red, #ef4444);
  }

  .vis-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: none;
    border-radius: 8px;
    color: inherit;
    cursor: pointer;
    margin-left: 0.25rem;
  }

  .vis-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12));
  }

  /* Config Scroll */
  .config-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Config Readonly (sequence mode) */
  .config-readonly {
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    overflow: hidden;
  }

  .config-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    font-weight: 600;
    font-size: var(--font-size-sm, 0.875rem);
  }

  .config-header.blue {
    border-left: 3px solid var(--prop-blue, #2e3192);
  }

  .config-header.red {
    border-left: 3px solid var(--prop-red, #ed1c24);
  }

  .config-header .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .config-header.blue .dot {
    background: var(--prop-blue, #2e3192);
  }

  .config-header.red .dot {
    background: var(--prop-red, #ed1c24);
  }

  .config-details {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }

  .config-details span {
    padding: 0.25rem 0.5rem;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.05));
    border-radius: 6px;
    font-size: var(--font-size-compact, 0.75rem);
    text-transform: uppercase;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  /* Grid Section */
  .planes-section {
    padding: 1rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.05));
  }

  .planes-section h3 {
    margin: 0 0 0.75rem;
    font-size: var(--font-size-compact, 0.75rem);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Grid Mode Toggle */
  .mode-toggle {
    display: flex;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.3));
    border-radius: 10px;
    padding: 3px;
    margin-bottom: 0.75rem;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 40px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .mode-btn:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .mode-btn.active {
    background: var(--theme-accent, rgba(139, 92, 246, 0.5));
    color: white;
  }

  .mode-btn i {
    font-size: 0.75rem;
  }

  .plane-btns {
    display: flex;
    gap: 0.5rem;
  }

  .plane-btn {
    flex: 1;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: var(--font-size-sm, 0.8rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .plane-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .plane-btn.active {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--color);
    color: var(--theme-text, white);
  }

  .plane-btn .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color);
    opacity: 0.4;
    transition: opacity 0.15s;
  }

  .plane-btn.active .indicator {
    opacity: 1;
  }

  /* Responsive: Tablet */
  @media (max-width: 1024px) {
    .side-panel {
      width: 380px;
    }

    .toggle-panel {
      display: flex;
    }
  }

  @media (max-width: 800px) {
    .side-panel {
      width: 360px;
    }
  }

  /* Responsive: Mobile */
  @media (max-width: 600px) {
    .layout {
      flex-direction: column;
    }

    .scene-area {
      flex: 1;
      min-height: 50vh;
    }

    .side-panel {
      width: 100%;
      max-height: 50vh;
      border-left: none;
      border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    }

    .side-panel.collapsed {
      max-height: 0;
      width: 100%;
    }

    .top-controls {
      gap: 0.25rem;
    }

    .control-group {
      padding: 2px;
    }

    .ctrl-btn {
      min-width: 44px;
      padding: 0 0.5rem;
      font-size: var(--font-size-compact, 0.75rem);
    }

    .playback-controls {
      padding: 0.35rem;
      gap: 0.35rem;
    }

    .play-btn {
      width: 44px;
      height: 44px;
    }

    .play-btn.primary {
      width: 52px;
      height: 52px;
    }

    .progress-label {
      display: none;
    }

    .toggle-panel {
      display: flex;
    }

    .toggle-panel i {
      transform: rotate(90deg);
    }

    .side-panel.collapsed .toggle-panel i {
      transform: rotate(-90deg);
    }
  }
</style>
