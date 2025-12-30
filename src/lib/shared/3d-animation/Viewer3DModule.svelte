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
  import Keyboard3DCoordinator from "./keyboard/Keyboard3DCoordinator.svelte";
  import type { CameraPreset } from "./components/controls/CameraPresetBar.svelte";
  import { Plane } from "./domain/enums/Plane";
  import type { GridMode } from "./domain/constants/grid-layout";
  import { createAvatarInstanceState, type AvatarInstanceState } from "./state/avatar-instance-state.svelte";
  import { createAvatarSyncState, type AvatarSyncState } from "./state/avatar-sync-state.svelte";
  import AvatarModeSwitcher from "./components/panels/AvatarModeSwitcher.svelte";
  import AvatarSyncControls from "./components/panels/AvatarSyncControls.svelte";
  import DuetBrowserPanel from "./components/panels/DuetBrowserPanel.svelte";
  import DuetCreatorPanel from "./components/panels/DuetCreatorPanel.svelte";
  import type { DuetSequenceWithData } from "./domain/duet-sequence";
  import SequenceBrowserPanel from "$lib/shared/animation-engine/components/SequenceBrowserPanel.svelte";
  import ShortcutsHelp from "$lib/shared/keyboard/components/ShortcutsHelp.svelte";
  import { keyboardShortcutState } from "$lib/shared/keyboard/state/keyboard-shortcut-state.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { settingsService } from "$lib/shared/settings/state/SettingsState.svelte";

  // Locomotion system
  import LocomotionController from "./components/locomotion/LocomotionController.svelte";

  // Effects system
  import EffectsLayer from "./effects/EffectsLayer.svelte";
  import { getEffectsConfigState } from "./effects/state/effects-config-state.svelte";

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
  import { browser } from "$app/environment";
  import { DEFAULT_AVATAR_ID, type AvatarId } from "./config/avatar-definitions";

  // Synchronously read avatar ID from localStorage to prevent flash
  function getInitialAvatarId(): AvatarId {
    if (!browser) return DEFAULT_AVATAR_ID;
    try {
      const stored = localStorage.getItem("tka-3d-animator-state");
      if (!stored) return DEFAULT_AVATAR_ID;
      const parsed = JSON.parse(stored);
      return parsed.avatarId ?? DEFAULT_AVATAR_ID;
    } catch {
      return DEFAULT_AVATAR_ID;
    }
  }

  const initialAvatarId = getInitialAvatarId();

  // Services and state - initialized asynchronously
  let propInterpolator: IPropStateInterpolator | null = $state(null);
  let sequenceConverter: ISequenceConverter | null = $state(null);
  let persistenceService: IAnimation3DPersister | null = $state(null);

  // Dual avatar states
  let avatar1State: AvatarInstanceState | null = $state(null);
  let avatar2State: AvatarInstanceState | null = $state(null);
  let syncState: AvatarSyncState | null = $state(null);
  let activeAvatarId = $state<'avatar1' | 'avatar2'>('avatar1');
  let servicesReady = $state(false);

  // Duet browser state
  type BrowserViewMode = 'sequences' | 'duets';
  let browserViewMode = $state<BrowserViewMode>('sequences');
  let duetCreatorOpen = $state(false);

  // Derived: active avatar state (routes controls to selected avatar)
  const activeState = $derived(
    activeAvatarId === 'avatar1' ? avatar1State : avatar2State
  );

  // Effects configuration state
  const effectsConfig = getEffectsConfigState();

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
  let avatarId = $state<AvatarId>(initialAvatarId);
  let locomotionMode = $state(false); // WASD movement + third-person camera

  // Background type comes from settingsService (unified with 2D theme)

  // Avatar model is now determined by bodyType in Avatar3D component

  // Camera position from orbit controls
  let customCameraPosition = $state<[number, number, number] | null>(null);
  let customCameraTarget = $state<[number, number, number] | null>(null);

  // Hydration flag
  let initialized = $state(false);

  // Derived - use function to avoid TypeScript narrowing issues with $state(null)
  const sequenceName = $derived.by(() => {
    if (!activeState) return null;
    return activeState.loadedSequence?.word || activeState.loadedSequence?.name || null;
  });

  // Avatar positions for per-avatar grid planes
  const avatarPositions = $derived.by(() => {
    if (!avatar1State || !avatar2State) return [];
    return [
      { x: avatar1State.position.x, y: 0, z: 0 },
      { x: avatar2State.position.x, y: 0, z: 0 }
    ];
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
    activeState?.loadSequence(sequence);
    browserOpen = false;
  }

  // Duet handlers
  function handleDuetSelect(duet: DuetSequenceWithData) {
    // Load sequences into both avatars
    avatar1State?.loadSequence(duet.avatar1Sequence);
    avatar2State?.loadSequence(duet.avatar2Sequence);

    // Apply beat offset via sync state
    if (syncState) {
      syncState.setOffset(duet.beatOffset);
      // Enable sync if there's an offset
      if (duet.beatOffset !== 0 && !syncState.isSyncEnabled) {
        syncState.toggleSync();
      }
    }

    browserOpen = false;
  }

  function handleDuetCreated(duetId: string) {
    console.log('[Viewer3DModule] Duet created:', duetId);
    duetCreatorOpen = false;
    browserViewMode = 'duets';
    browserOpen = true;
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

    // Create dual avatar states
    const deps = { propInterpolator, sequenceConverter };

    avatar1State = createAvatarInstanceState({
      id: 'avatar1',
      positionX: -350,  // Increased separation to prevent grid overlap
      avatarModelId: initialAvatarId
    }, deps);

    avatar2State = createAvatarInstanceState({
      id: 'avatar2',
      positionX: 350,   // Increased separation to prevent grid overlap
      avatarModelId: initialAvatarId
    }, deps);

    // Create sync state for coordinating the two avatars
    syncState = createAvatarSyncState(avatar1State, avatar2State);

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
    if (saved.loop !== undefined && avatar1State) avatar1State.loop = saved.loop;
    if (saved.avatarId) avatarId = saved.avatarId;
    // Note: environmentType removed - now uses settingsService.settings.backgroundType

    // Load sequence into avatar1 (primary) if persisted
    if (saved.loadedSequence && avatar1State) {
      avatar1State.loadSequence(saved.loadedSequence);
      if (saved.currentBeatIndex !== undefined) {
        avatar1State.goToBeat(saved.currentBeatIndex);
      }
    }

    // Auto-start playback if it was playing before
    avatar1State?.autoStartIfNeeded();

    servicesReady = true;
    setTimeout(() => (initialized = true), 50);
  });

  // Sync speed to both avatar states
  $effect(() => {
    if (avatar1State) avatar1State.speed = speed;
    if (avatar2State) avatar2State.speed = speed;
  });

  // Persist state changes (using avatar1 as primary for backwards compat)
  $effect(() => {
    if (!initialized || !persistenceService || !avatar1State) return;
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
      loop: avatar1State.loop,
      loadedSequence: avatar1State.loadedSequence ?? null,
      currentBeatIndex: avatar1State.currentBeatIndex,
      avatarId,
      // Note: environmentType removed - now uses settingsService for background
    });
  });

  onDestroy(() => {
    avatar1State?.destroy();
    avatar2State?.destroy();
    syncState?.destroy();
  });
</script>

{#if !servicesReady}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading 3D Viewer...</p>
  </div>
{:else if avatar1State && avatar2State}
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
        bloomEnabled={effectsConfig.bloom.enabled}
        bloomIntensity={effectsConfig.bloom.intensity}
        bloomThreshold={effectsConfig.bloom.threshold}
        backgroundType={settingsService.settings.backgroundType}
        {avatarPositions}
      >
        <!-- Avatar 1 Props -->
        {#if avatar1State.showBlue && avatar1State.bluePropState}
          <Staff3D propState={avatar1State.bluePropState} color="blue" positionX={avatar1State.position.x} />
        {/if}
        {#if avatar1State.showRed && avatar1State.redPropState}
          <Staff3D propState={avatar1State.redPropState} color="red" positionX={avatar1State.position.x} />
        {/if}

        <!-- Avatar 2 Props -->
        {#if avatar2State.showBlue && avatar2State.bluePropState}
          <Staff3D propState={avatar2State.bluePropState} color="blue" positionX={avatar2State.position.x} />
        {/if}
        {#if avatar2State.showRed && avatar2State.redPropState}
          <Staff3D propState={avatar2State.redPropState} color="red" positionX={avatar2State.position.x} />
        {/if}

        <!-- Avatar 1 Figure -->
        {#if showFigure}
          <Avatar3D
            id="avatar1"
            bluePropState={avatar1State.bluePropState}
            redPropState={avatar1State.redPropState}
            position={avatar1State.position}
            facingAngle={avatar1State.facingAngle}
            isActive={activeAvatarId === 'avatar1'}
            avatarId={avatar1State.avatarModelId}
          />
        {/if}

        <!-- Avatar 2 Figure -->
        {#if showFigure}
          <Avatar3D
            id="avatar2"
            bluePropState={avatar2State.bluePropState}
            redPropState={avatar2State.redPropState}
            position={avatar2State.position}
            facingAngle={avatar2State.facingAngle}
            isActive={activeAvatarId === 'avatar2'}
            avatarId={avatar2State.avatarModelId}
          />
        {/if}

        <!-- Visual Effects Layer (uses active avatar for now) -->
        <EffectsLayer
          bluePropState={activeState?.bluePropState ?? null}
          redPropState={activeState?.redPropState ?? null}
          isPlaying={activeState?.isPlaying ?? false}
        />

        <!-- Locomotion Controller (WASD + third-person camera) -->
        {#if locomotionMode && activeState}
          <LocomotionController
            avatarState={activeState}
            enabled={locomotionMode}
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
        onClearSequence={() => activeState?.clearSequence()}
        isPlaying={activeState?.isPlaying ?? false}
        progress={activeState?.progress ?? 0}
        loop={activeState?.loop ?? false}
        hasSequence={activeState?.hasSequence ?? false}
        currentBeatIndex={activeState?.currentBeatIndex ?? 0}
        totalBeats={activeState?.totalBeats ?? 0}
        onPlay={() => activeState?.play()}
        onPause={() => activeState?.pause()}
        onTogglePlay={() => activeState?.togglePlay()}
        onReset={() => activeState?.reset()}
        onProgressChange={(v) => activeState?.setProgress(v)}
        onLoopChange={(v) => { if (activeState) activeState.loop = v; }}
        onPrevBeat={() => activeState?.prevBeat()}
        onNextBeat={() => activeState?.nextBeat()}
        onShowHelp={() => keyboardShortcutState.openHelp()}
      >
        {#snippet trailing()}
          <button
            class="locomotion-btn"
            class:active={locomotionMode}
            onclick={() => (locomotionMode = !locomotionMode)}
            aria-label={locomotionMode ? "Exit walk mode" : "Enter walk mode"}
            title={locomotionMode ? "Exit walk mode (WASD)" : "Enter walk mode (WASD)"}
          >
            <i class="fas fa-person-walking" aria-hidden="true"></i>
          </button>
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
    <aside class="side-panel-wrapper" class:collapsed={!panelOpen}>
      <!-- Avatar Mode Switcher -->
      <div class="mode-switcher-container">
        <AvatarModeSwitcher
          {activeAvatarId}
          onSwitch={(id) => (activeAvatarId = id)}
          avatar1HasSequence={avatar1State?.hasSequence ?? false}
          avatar2HasSequence={avatar2State?.hasSequence ?? false}
        />
      </div>

      <!-- Avatar Sync Controls -->
      {#if syncState && avatar1State?.hasSequence && avatar2State?.hasSequence}
        <div class="sync-controls-container">
          <AvatarSyncControls {syncState} />
        </div>
      {/if}

      <Animation3DSidePanel
        collapsed={!panelOpen}
        hasSequence={activeState?.hasSequence ?? false}
        currentBeatIndex={activeState?.currentBeatIndex ?? 0}
        totalBeats={activeState?.totalBeats ?? 0}
        blueConfig={activeState?.showBlue ? activeState.activeBlueConfig : null}
        redConfig={activeState?.showRed ? activeState.activeRedConfig : null}
        {gridMode}
        {visiblePlanes}
        {showFigure}
        avatarId={activeState?.avatarModelId ?? avatarId}
        onLoadSequence={() => (browserOpen = true)}
        onGridModeChange={(m) => (gridMode = m)}
        onPlaneToggle={togglePlane}
        onToggleFigure={() => (showFigure = !showFigure)}
        onAvatarChange={(id) => activeState?.setAvatarModel(id)}
      />
    </aside>
  </div>

  <!-- Sequence/Duet Browser -->
  {#if browserOpen}
    <div class="browser-overlay">
      <div class="browser-panel">
        <header class="browser-header">
          <h2>Load Sequence</h2>
          <button class="close-browser-btn" onclick={() => (browserOpen = false)}>
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </header>

        {#if browserViewMode === 'sequences'}
          <SequenceBrowserPanel
            mode="primary"
            show={true}
            onSelect={handleSequenceSelect}
            onClose={() => (browserOpen = false)}
          />
        {:else}
          <DuetBrowserPanel
            viewMode={browserViewMode}
            onSelectDuet={handleDuetSelect}
            onCreateDuet={() => (duetCreatorOpen = true)}
            onViewModeChange={(mode) => (browserViewMode = mode)}
          />
        {/if}

        <!-- View Mode Toggle at bottom -->
        <div class="browser-footer">
          <button
            class="view-mode-btn"
            class:active={browserViewMode === 'sequences'}
            onclick={() => (browserViewMode = 'sequences')}
          >
            <i class="fas fa-film" aria-hidden="true"></i>
            Solo Sequences
          </button>
          <button
            class="view-mode-btn"
            class:active={browserViewMode === 'duets'}
            onclick={() => (browserViewMode = 'duets')}
          >
            <i class="fas fa-users" aria-hidden="true"></i>
            Duets
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Duet Creator Panel -->
  {#if duetCreatorOpen}
    <div class="duet-creator-overlay">
      <div class="duet-creator-panel">
        <DuetCreatorPanel
          onCreated={handleDuetCreated}
          onCancel={() => (duetCreatorOpen = false)}
        />
      </div>
    </div>
  {/if}

  <!-- Keyboard Shortcuts -->
  <Keyboard3DCoordinator
    isPlaying={activeState?.isPlaying ?? false}
    togglePlay={() => activeState?.togglePlay()}
    reset={() => activeState?.reset()}
    loop={activeState?.loop ?? false}
    setLoop={(v) => { if (activeState) activeState.loop = v; }}
    {speed}
    setSpeed={(s) => (speed = s)}
    hasSequence={activeState?.hasSequence ?? false}
    currentBeatIndex={activeState?.currentBeatIndex ?? 0}
    totalBeats={activeState?.totalBeats ?? 0}
    prevBeat={() => activeState?.prevBeat()}
    nextBeat={() => activeState?.nextBeat()}
    goToBeat={(i) => activeState?.goToBeat(i)}
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

  .side-panel-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    overflow-y: auto;
    transition: width 0.2s ease, padding 0.2s ease;
  }

  .side-panel-wrapper.collapsed {
    width: 0;
    padding: 0;
    overflow: hidden;
  }

  .mode-switcher-container,
  .sync-controls-container {
    flex-shrink: 0;
  }

  .toggle-panel-btn,
  .locomotion-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg);
    border: none;
    border-radius: 12px;
    color: var(--theme-text);
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .toggle-panel-btn {
    display: none;
  }

  .toggle-panel-btn:hover,
  .locomotion-btn:hover {
    background: var(--theme-card-hover-bg);
    color: white;
  }

  .locomotion-btn.active {
    background: #3b82f6;
    color: white;
  }

  .locomotion-btn.active:hover {
    background: #2563eb;
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

  /* Browser Overlay */
  .browser-overlay,
  .duet-creator-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
  }

  .browser-panel {
    display: flex;
    flex-direction: column;
    width: min(90vw, 600px);
    max-height: 80vh;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    overflow: hidden;
  }

  .browser-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .browser-header h2 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .close-browser-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .close-browser-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
  }

  .browser-footer {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .view-mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .view-mode-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
  }

  .view-mode-btn.active {
    background: var(--theme-accent, #64b5f6);
    border-color: var(--theme-accent, #64b5f6);
    color: #000;
  }

  .duet-creator-panel {
    width: min(90vw, 500px);
    max-height: 90vh;
    background: var(--theme-panel-bg, rgba(18, 18, 28, 0.98));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    overflow: hidden;
  }
</style>
