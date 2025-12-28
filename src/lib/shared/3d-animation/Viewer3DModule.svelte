<script lang="ts">
  /**
   * Viewer3DModule
   *
   * Main 3D animation viewer module. Load sequences from the library
   * and explore them in 3D space with camera controls.
   *
   * Admin-only (Level 6 feature).
   */

  import { onMount, onDestroy } from "svelte";
  import Scene3D from "./components/Scene3D.svelte";
  import Staff3D from "./components/Staff3D.svelte";
  import Avatar3D from "./components/Avatar3D.svelte";
  import type { BodyType } from "./services/contracts/IAvatarCustomizer";
  import SceneOverlayControls from "./components/panels/SceneOverlayControls.svelte";
  import Animation3DSidePanel from "./components/panels/Animation3DSidePanel.svelte";
  import AvatarToggleButton from "./components/controls/AvatarToggleButton.svelte";
  import Keyboard3DCoordinator from "./keyboard/Keyboard3DCoordinator.svelte";
  import type { CameraPreset } from "./components/controls/CameraPresetBar.svelte";
  import { Plane } from "./domain/enums/Plane";
  import type { GridMode } from "./domain/constants/grid-layout";
  import { createAnimation3DState, type Animation3DState } from "./state/animation-3d-state.svelte";
  import SequenceBrowserPanel from "$lib/shared/animation-engine/components/SequenceBrowserPanel.svelte";
  import ShortcutsHelp from "$lib/shared/keyboard/components/ShortcutsHelp.svelte";
  import { keyboardShortcutState } from "$lib/shared/keyboard/state/keyboard-shortcut-state.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  // CameraState type (matches Scene3D.svelte's internal definition)
  interface CameraState {
    position: [number, number, number];
    target: [number, number, number];
  }
  import { container, loadFeatureModule } from "$lib/shared/inversify/container";
  import { ANIMATION_3D_TYPES } from "./inversify/animation-3d.types";
  import type { IPropStateInterpolator } from "./services/contracts/IPropStateInterpolator";
  import type { ISequenceConverter } from "./services/contracts/ISequenceConverter";
  import type { IAnimation3DPersister } from "./services/contracts/IAnimation3DPersister";

  // Services and state - initialized asynchronously
  let propInterpolator: IPropStateInterpolator | null = $state(null);
  let sequenceConverter: ISequenceConverter | null = $state(null);
  let persistenceService: IAnimation3DPersister | null = $state(null);
  let animState: Animation3DState | null = $state(null);
  let servicesReady = $state(false);

  // UI state
  let visiblePlanes = $state(new Set([Plane.WALL, Plane.WHEEL, Plane.FLOOR]));
  let showGrid = $state(true);
  let showLabels = $state(true);
  let gridMode = $state<GridMode>("diamond");
  let cameraPreset = $state<CameraPreset>("perspective");
  let panelOpen = $state(true);
  let browserOpen = $state(false);
  let speed = $state(1);
  let showFigure = $state(true);
  let bodyType = $state<BodyType>("masculine");
  let skinTone = $state("#d4a574");

  // Avatar model is now determined by bodyType in Avatar3D component

  // Camera position from orbit controls
  let customCameraPosition = $state<[number, number, number] | null>(null);
  let customCameraTarget = $state<[number, number, number] | null>(null);

  // Hydration flag
  let initialized = $state(false);

  // Derived - use function to avoid TypeScript narrowing issues with $state(null)
  const sequenceName = $derived.by(() => {
    if (!animState) return null;
    return animState.loadedSequence?.word || animState.loadedSequence?.name || null;
  });

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
    animState?.loadSequence(sequence);
    browserOpen = false;
  }

  // Initialize services asynchronously
  onMount(async () => {
    // Load the 3D viewer feature module first
    await loadFeatureModule("3d-viewer");

    // Now resolve services
    propInterpolator = container.get<IPropStateInterpolator>(
      ANIMATION_3D_TYPES.IPropStateInterpolator
    );
    sequenceConverter = container.get<ISequenceConverter>(
      ANIMATION_3D_TYPES.ISequenceConverter
    );
    persistenceService = container.get<IAnimation3DPersister>(
      ANIMATION_3D_TYPES.IAnimation3DPersister
    );

    // Create animation state
    animState = createAnimation3DState({ propInterpolator, sequenceConverter });

    // Load persisted state
    const saved = persistenceService.loadState();

    if (saved.visiblePlanes) visiblePlanes = persistenceService.parsePlanes(saved.visiblePlanes);
    if (saved.showGrid !== undefined) showGrid = saved.showGrid;
    if (saved.showLabels !== undefined) showLabels = saved.showLabels;
    if (saved.gridMode) gridMode = saved.gridMode;
    if (saved.cameraPreset) cameraPreset = saved.cameraPreset;
    if (saved.panelOpen !== undefined) panelOpen = saved.panelOpen;
    if (saved.speed !== undefined) speed = saved.speed;
    if (saved.cameraPosition) customCameraPosition = saved.cameraPosition;
    if (saved.cameraTarget) customCameraTarget = saved.cameraTarget;
    if (saved.loop !== undefined) animState.loop = saved.loop;
    if (saved.bodyType) bodyType = saved.bodyType;
    if (saved.skinTone) skinTone = saved.skinTone;

    if (saved.loadedSequence) {
      animState.loadSequence(saved.loadedSequence);
      if (saved.currentBeatIndex !== undefined) {
        animState.goToBeat(saved.currentBeatIndex);
      }
    }

    servicesReady = true;
    setTimeout(() => (initialized = true), 50);
  });

  // Sync speed to animState
  $effect(() => {
    if (animState) animState.speed = speed;
  });

  // Persist state changes
  $effect(() => {
    if (!initialized || !persistenceService || !animState) return;
    persistenceService.saveState({
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
      bodyType,
      skinTone,
    });
  });

  onDestroy(() => animState?.destroy());
</script>

{#if !servicesReady}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading 3D Viewer...</p>
  </div>
{:else if animState}
  <div class="viewer-3d-module">
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
        {#if showFigure}
          <Avatar3D
            bluePropState={animState.bluePropState}
            redPropState={animState.redPropState}
            {bodyType}
            {skinTone}
          />
        {/if}
      </Scene3D>

      <SceneOverlayControls
        {cameraPreset}
        isCustomCamera={!!customCameraPosition}
        onCameraChange={setCameraPreset}
        {speed}
        onSpeedChange={(s) => (speed = s)}
        {sequenceName}
        onClearSequence={() => animState?.clearSequence()}
        isPlaying={animState?.isPlaying ?? false}
        progress={animState?.progress ?? 0}
        loop={animState?.loop ?? false}
        hasSequence={animState?.hasSequence ?? false}
        currentBeatIndex={animState?.currentBeatIndex ?? 0}
        totalBeats={animState?.totalBeats ?? 0}
        onPlay={() => animState?.play()}
        onPause={() => animState?.pause()}
        onTogglePlay={() => animState?.togglePlay()}
        onReset={() => animState?.reset()}
        onProgressChange={(v) => animState?.setProgress(v)}
        onLoopChange={(v) => { if (animState) animState.loop = v; }}
        onPrevBeat={() => animState?.prevBeat()}
        onNextBeat={() => animState?.nextBeat()}
        onShowHelp={() => keyboardShortcutState.openHelp()}
      >
        {#snippet trailing()}
          <AvatarToggleButton
            {showFigure}
            {bodyType}
            {skinTone}
            onToggle={() => (showFigure = !showFigure)}
            onBodyTypeChange={(t) => (bodyType = t)}
            onSkinToneChange={(c) => (skinTone = c)}
          />
          <button
            class="toggle-panel-btn"
            onclick={() => (panelOpen = !panelOpen)}
            aria-label={panelOpen ? "Hide panel" : "Show panel"}
          >
            <i class="fas" class:fa-chevron-right={panelOpen} class:fa-chevron-left={!panelOpen} aria-hidden="true"></i>
          </button>
        {/snippet}
      </SceneOverlayControls>
    </main>

    <!-- Side Panel -->
    <Animation3DSidePanel
      collapsed={!panelOpen}
      hasSequence={animState?.hasSequence ?? false}
      currentBeatIndex={animState?.currentBeatIndex ?? 0}
      totalBeats={animState?.totalBeats ?? 0}
      blueConfig={animState?.showBlue ? animState.activeBlueConfig : null}
      redConfig={animState?.showRed ? animState.activeRedConfig : null}
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

  <!-- Keyboard Shortcuts -->
  <Keyboard3DCoordinator
    isPlaying={animState?.isPlaying ?? false}
    togglePlay={() => animState?.togglePlay()}
    reset={() => animState?.reset()}
    loop={animState?.loop ?? false}
    setLoop={(v) => { if (animState) animState.loop = v; }}
    {speed}
    setSpeed={(s) => (speed = s)}
    hasSequence={animState?.hasSequence ?? false}
    currentBeatIndex={animState?.currentBeatIndex ?? 0}
    totalBeats={animState?.totalBeats ?? 0}
    prevBeat={() => animState?.prevBeat()}
    nextBeat={() => animState?.nextBeat()}
    goToBeat={(i) => animState?.goToBeat(i)}
    setCameraPreset={setCameraPreset}
    {showGrid}
    setShowGrid={(v) => (showGrid = v)}
    {panelOpen}
    setPanelOpen={(v) => (panelOpen = v)}
    setBrowserOpen={(v) => (browserOpen = v)}
/>

  <!-- Shortcuts Help Modal -->
  <ShortcutsHelp />
{/if}

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 400px;
    background: #0a0a12;
    color: var(--theme-text-dim);
    gap: 1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--theme-stroke);
    border-top-color: #64b5f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .viewer-3d-module {
    display: flex;
    width: 100%;
    height: 100%;
    background: #0a0a12;
    color: white;
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
    background: var(--theme-card-bg, var(--theme-card-bg));
    border: none;
    border-radius: 12px;
    color: var(--theme-text);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-panel-btn:hover {
    background: var(--theme-card-hover-bg);
    color: white;
  }

  @media (max-width: 1024px) {
    .toggle-panel-btn {
      display: flex;
    }
  }

  @media (max-width: 600px) {
    .viewer-3d-module {
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
