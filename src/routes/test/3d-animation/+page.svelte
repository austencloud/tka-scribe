<script lang="ts">
  /**
   * 3D Animation Test Page
   *
   * Sandboxed development environment for the 3D animation system.
   * Load sequences from the library to view them in 3D.
   */

  import { onMount, onDestroy } from "svelte";
  import Scene3D from "$lib/shared/3d-animation/components/Scene3D.svelte";
  import Staff3D from "$lib/shared/3d-animation/components/Staff3D.svelte";
  import SceneOverlayControls from "$lib/shared/3d-animation/components/panels/SceneOverlayControls.svelte";
  import Animation3DSidePanel from "$lib/shared/3d-animation/components/panels/Animation3DSidePanel.svelte";
  import type { CameraPreset } from "$lib/shared/3d-animation/components/controls/CameraPresetBar.svelte";
  import { Plane } from "$lib/shared/3d-animation/domain/enums/Plane";
  import type { GridMode } from "$lib/shared/3d-animation/domain/constants/grid-layout";
  import { createAnimation3DState } from "$lib/shared/3d-animation/state/animation-3d-state.svelte";
  import SequenceBrowserPanel from "$lib/shared/animation-engine/components/SequenceBrowserPanel.svelte";
  import { saveState, loadState, parsePlanes } from "$lib/shared/3d-animation/utils/persistence";
  import type { CameraState } from "$lib/shared/3d-animation/components/Scene3D.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  // Animation state
  const animState = createAnimation3DState();

  // UI state
  let visiblePlanes = $state(new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]));
  let showGrid = $state(true);
  let showLabels = $state(true);
  let gridMode = $state<GridMode>("diamond");
  let cameraPreset = $state<CameraPreset>("perspective");
  let panelOpen = $state(true);
  let browserOpen = $state(false);
  let speed = $state(1);

  // Camera position from orbit controls
  let customCameraPosition = $state<[number, number, number] | null>(null);
  let customCameraTarget = $state<[number, number, number] | null>(null);

  // Hydration flag
  let initialized = $state(false);

  // Derived
  const sequenceName = $derived(
    animState.loadedSequence?.word || animState.loadedSequence?.name || null
  );

  // Camera handlers
  function handleCameraChange(state: CameraState) {
    customCameraPosition = state.position;
    customCameraTarget = state.target;
  }

  function setCameraPreset(preset: CameraPreset) {
    cameraPreset = preset;
    customCameraPosition = null;
    customCameraTarget = null;
  }

  // Plane toggle
  function togglePlane(plane: Plane) {
    const newSet = new Set(visiblePlanes);
    if (newSet.has(plane)) {
      newSet.delete(plane);
    } else {
      newSet.add(plane);
    }
    visiblePlanes = newSet;
  }

  // Sequence handlers
  function handleSequenceSelect(sequence: SequenceData) {
    animState.loadSequence(sequence);
    browserOpen = false;
  }

  // Persistence
  onMount(() => {
    const saved = loadState();

    if (saved.visiblePlanes) visiblePlanes = parsePlanes(saved.visiblePlanes);
    if (saved.showGrid !== undefined) showGrid = saved.showGrid;
    if (saved.showLabels !== undefined) showLabels = saved.showLabels;
    if (saved.gridMode) gridMode = saved.gridMode;
    if (saved.cameraPreset) cameraPreset = saved.cameraPreset;
    if (saved.panelOpen !== undefined) panelOpen = saved.panelOpen;
    if (saved.speed !== undefined) speed = saved.speed;
    if (saved.cameraPosition) customCameraPosition = saved.cameraPosition;
    if (saved.cameraTarget) customCameraTarget = saved.cameraTarget;
    if (saved.loop !== undefined) animState.loop = saved.loop;

    if (saved.loadedSequence) {
      animState.loadSequence(saved.loadedSequence);
      if (saved.currentBeatIndex !== undefined) {
        animState.goToBeat(saved.currentBeatIndex);
      }
    }

    setTimeout(() => (initialized = true), 50);
  });

  // Sync speed to animState
  $effect(() => {
    animState.speed = speed;
  });

  // Persist state changes
  $effect(() => {
    if (!initialized) return;
    saveState({
      visiblePlanes: Array.from(visiblePlanes),
      showGrid,
      showLabels,
      gridMode,
      cameraPreset,
      panelOpen,
      speed,
      cameraPosition: customCameraPosition,
      cameraTarget: customCameraTarget,
      loop: animState.loop,
      loadedSequence: animState.loadedSequence ?? null,
      currentBeatIndex: animState.currentBeatIndex,
    });
  });

  onDestroy(() => animState.destroy());
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

    <SceneOverlayControls
      {cameraPreset}
      isCustomCamera={!!customCameraPosition}
      onCameraChange={setCameraPreset}
      {speed}
      onSpeedChange={(s) => (speed = s)}
      {sequenceName}
      onClearSequence={() => animState.clearSequence()}
      isPlaying={animState.isPlaying}
      progress={animState.progress}
      loop={animState.loop}
      hasSequence={animState.hasSequence}
      currentBeatIndex={animState.currentBeatIndex}
      totalBeats={animState.totalBeats}
      onPlay={() => animState.play()}
      onPause={() => animState.pause()}
      onTogglePlay={() => animState.togglePlay()}
      onReset={() => animState.reset()}
      onProgressChange={(v) => animState.setProgress(v)}
      onLoopChange={(v) => (animState.loop = v)}
      onPrevBeat={() => animState.prevBeat()}
      onNextBeat={() => animState.nextBeat()}
    >
      {#snippet trailing()}
        <button
          class="toggle-panel-btn"
          onclick={() => (panelOpen = !panelOpen)}
          aria-label={panelOpen ? "Hide panel" : "Show panel"}
        >
          <i class="fas" class:fa-chevron-right={panelOpen} class:fa-chevron-left={!panelOpen}></i>
        </button>
      {/snippet}
    </SceneOverlayControls>
  </main>

  <!-- Side Panel -->
  <Animation3DSidePanel
    collapsed={!panelOpen}
    hasSequence={animState.hasSequence}
    currentBeatIndex={animState.currentBeatIndex}
    totalBeats={animState.totalBeats}
    blueConfig={animState.showBlue ? animState.activeBlueConfig : null}
    redConfig={animState.showRed ? animState.activeRedConfig : null}
    {gridMode}
    {visiblePlanes}
    onLoadSequence={() => (browserOpen = true)}
    onGridModeChange={(m) => (gridMode = m)}
    onPlaneToggle={togglePlane}
  />
</div>

<!-- Sequence Browser -->
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

  .scene-area {
    flex: 1;
    position: relative;
    min-width: 300px;
  }

  .toggle-panel-btn {
    width: 48px;
    height: 48px;
    display: none;
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

  .toggle-panel-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    color: white;
  }

  @media (max-width: 1024px) {
    .toggle-panel-btn {
      display: flex;
    }
  }

  @media (max-width: 600px) {
    .layout {
      flex-direction: column;
    }

    .scene-area {
      flex: 1;
      min-height: 50vh;
    }

    .toggle-panel-btn i {
      transform: rotate(90deg);
    }
  }
</style>
