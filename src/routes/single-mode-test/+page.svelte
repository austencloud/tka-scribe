<!--
  Single Mode Test Page

  Side-by-side comparison of Desktop and Mobile views for the Single animation mode.
  Fully functional with DI container initialization.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { MobileAnimationView, MobileSelectionArea } from "$lib/modules/animate/modes/single/mobile";
  import { DesktopAnimationView, DesktopSelectionArea } from "$lib/modules/animate/modes/single/desktop";
  import { TrailPresetPanel, AdvancedSettingsDrawer, applyPreset, type TrailPresetId } from "$lib/modules/animate/components/v2";
  import { animationSettings } from "$lib/shared/animate/state/animation-settings-state.svelte";
  import SequenceBrowserPanel from "$lib/modules/animate/shared/components/SequenceBrowserPanel.svelte";
  import {
    ensureContainerInitialized,
    loadSharedModules,
    loadFeatureModule,
    isContainerInitialized
  } from "$lib/shared/inversify/container";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { BeatData } from "$create/shared/domain/models/BeatData";

  // Viewport simulation sizes
  type ViewportSize = {
    name: string;
    width: number;
    height: number;
    deviceSize: "xs" | "sm" | "md" | "lg" | "xl";
  };

  const mobileViewports: ViewportSize[] = [
    { name: "iPhone SE", width: 375, height: 667, deviceSize: "sm" },
    { name: "iPhone 14", width: 390, height: 844, deviceSize: "sm" },
    { name: "iPhone 14 Pro Max", width: 430, height: 932, deviceSize: "md" },
    { name: "Pixel 7", width: 412, height: 915, deviceSize: "sm" },
    { name: "Galaxy S21", width: 360, height: 800, deviceSize: "xs" },
  ];

  const desktopViewports: ViewportSize[] = [
    { name: "Laptop", width: 1366, height: 768, deviceSize: "xl" },
    { name: "Desktop", width: 1920, height: 1080, deviceSize: "xl" },
    { name: "Tablet", width: 768, height: 1024, deviceSize: "lg" },
  ];

  // Container initialization state
  let containerReady = $state(false);
  let loadingMessage = $state("Initializing...");

  // Viewport state - use indices to avoid proxy comparison issues
  let selectedMobileIndex = $state(0);
  let selectedDesktopIndex = $state(0);
  let scale = $state(0.5);

  // View state
  let showSequenceView = $state(false);

  // Derived viewports from indices
  const selectedMobileViewport = $derived(mobileViewports[selectedMobileIndex]!);
  const selectedDesktopViewport = $derived(desktopViewports[selectedDesktopIndex]!);

  // Sequence state
  let primarySequence = $state<SequenceData | null>(null);
  let isSequenceBrowserOpen = $state(false);

  // Animation state
  let isPlaying = $state(false);
  let animatingBeatNumber = $state<number | null>(null);
  let speed = $state(1.0);

  // Drawer states
  let isAdvancedSettingsOpen = $state(false);
  let isTrailPanelOpen = $state(false);
  const trailSettings = $derived(animationSettings.trail);

  // Derived data
  const beats = $derived<readonly BeatData[]>(primarySequence?.beats || []);
  const startPosition = $derived(
    primarySequence?.startPosition ||
    (primarySequence as any)?.startingPositionBeat ||
    null
  );
  const currentBeatNumber = $derived(
    animatingBeatNumber !== null ? Math.floor(animatingBeatNumber) + 1 : 0
  );

  const sequenceStats = $derived.by(() => {
    if (!primarySequence) return null;
    const beatCount = primarySequence.beats?.length ?? 0;
    const estimatedDuration = beatCount * (60 / (speed * 60));
    return {
      beats: beatCount,
      duration: estimatedDuration.toFixed(1),
      word: primarySequence.word || primarySequence.name || "Untitled",
      author: primarySequence.author,
      difficulty: (primarySequence as any).difficulty ?? "intermediate",
    };
  });

  // Initialize DI container on mount
  onMount(async () => {
    try {
      loadingMessage = "Loading core modules...";
      await ensureContainerInitialized();

      loadingMessage = "Loading shared services...";
      await loadSharedModules();

      loadingMessage = "Loading animate module...";
      await loadFeatureModule("animate");

      containerReady = true;
      console.log("✅ Test page: DI container fully initialized");
    } catch (error) {
      console.error("❌ Test page: Failed to initialize container:", error);
      loadingMessage = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  });

  // Handlers
  function handleStop() {
    isPlaying = false;
    animatingBeatNumber = null;
  }

  function openSequenceBrowser() {
    isSequenceBrowserOpen = true;
  }

  function handleSequenceSelect(sequence: SequenceData) {
    primarySequence = sequence;
    isSequenceBrowserOpen = false;
    showSequenceView = true;
  }

  function handleOpenTrailPanel() {
    isTrailPanelOpen = true;
  }

  function handleOpenAdvancedSettings() {
    isAdvancedSettingsOpen = true;
  }

  function handlePresetSelect(presetId: TrailPresetId) {
    const presetSettings = applyPreset(presetId);
    if (presetSettings) {
      animationSettings.updateSettings({
        trail: { ...animationSettings.trail, ...presetSettings }
      });
    }
  }

  function clearSequence() {
    primarySequence = null;
    showSequenceView = false;
    isPlaying = false;
    animatingBeatNumber = null;
  }
</script>

<div class="test-page">
  <!-- Controls Panel -->
  <div class="controls-panel">
    <h1>Single Mode Test</h1>
    <p class="subtitle">Compare Desktop & Mobile side-by-side</p>

    {#if !containerReady}
      <!-- Loading State -->
      <div class="loading-state">
        <div class="spinner"></div>
        <p>{loadingMessage}</p>
      </div>
    {:else}
      <!-- Scale Control -->
      <div class="control-group">
        <label>
          Scale: {(scale * 100).toFixed(0)}%
          <input
            type="range"
            min="0.3"
            max="1"
            step="0.05"
            bind:value={scale}
          />
        </label>
      </div>

      <!-- View State Toggle -->
      <div class="control-group">
        <h3>View State</h3>
        <div class="button-row">
          <button
            class="state-btn"
            class:active={!showSequenceView}
            onclick={() => { showSequenceView = false; primarySequence = null; }}
          >
            <i class="fas fa-folder-open"></i>
            Empty State
          </button>
          <button
            class="state-btn"
            class:active={showSequenceView}
            onclick={openSequenceBrowser}
          >
            <i class="fas fa-film"></i>
            With Sequence
          </button>
        </div>
        {#if primarySequence}
          <div class="sequence-info">
            <span class="seq-name">{sequenceStats?.word}</span>
            <span class="seq-beats">{sequenceStats?.beats} beats</span>
            <button class="clear-btn" onclick={clearSequence}>
              <i class="fas fa-times"></i>
            </button>
          </div>
        {/if}
      </div>

      <!-- Mobile Viewport Selector -->
      <div class="control-group">
        <h3>Mobile Device</h3>
        <div class="viewport-buttons">
          {#each mobileViewports as vp, i}
            <button
              class="viewport-btn"
              class:active={selectedMobileIndex === i}
              onclick={() => selectedMobileIndex = i}
            >
              <span class="vp-name">{vp.name}</span>
              <span class="vp-size">{vp.width}×{vp.height}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Desktop Viewport Selector -->
      <div class="control-group">
        <h3>Desktop Size</h3>
        <div class="viewport-buttons">
          {#each desktopViewports as vp, i}
            <button
              class="viewport-btn"
              class:active={selectedDesktopIndex === i}
              onclick={() => selectedDesktopIndex = i}
            >
              <span class="vp-name">{vp.name}</span>
              <span class="vp-size">{vp.width}×{vp.height}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Playback Controls (when sequence loaded) -->
      {#if primarySequence && showSequenceView}
        <div class="control-group">
          <h3>Playback</h3>
          <div class="button-row">
            <button
              class="play-btn"
              class:playing={isPlaying}
              onclick={() => isPlaying = !isPlaying}
            >
              <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button class="stop-btn" onclick={handleStop}>
              <i class="fas fa-stop"></i>
              Stop
            </button>
          </div>
          <label>
            Speed: {speed.toFixed(1)}x
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              bind:value={speed}
            />
          </label>
        </div>
      {/if}

      <!-- Status -->
      <div class="status-box">
        <i class="fas fa-check-circle"></i>
        <span>Container ready</span>
      </div>
    {/if}
  </div>

  <!-- Preview Area -->
  <div class="preview-area">
    {#if !containerReady}
      <div class="preview-loading">
        <div class="spinner large"></div>
        <p>Initializing components...</p>
      </div>
    {:else}
      <!-- Desktop Preview -->
      <div class="preview-column">
        <h2>
          <span class="platform-icon desktop-icon">
            <i class="fas fa-desktop"></i>
          </span>
          Desktop ({selectedDesktopViewport.name})
        </h2>
        <div class="viewport-dimensions">
          {selectedDesktopViewport.width} × {selectedDesktopViewport.height}
        </div>
        <div
          class="viewport-frame desktop-frame"
          style="
            width: {selectedDesktopViewport.width * scale}px;
            height: {selectedDesktopViewport.height * scale}px;
          "
        >
          <div
            class="viewport-content"
            style="
              width: {selectedDesktopViewport.width}px;
              height: {selectedDesktopViewport.height}px;
              transform: scale({scale});
              transform-origin: top left;
            "
          >
            {#if !showSequenceView || !primarySequence}
              <DesktopSelectionArea onBrowseSequences={openSequenceBrowser} />
            {:else}
              <DesktopAnimationView
                sequence={primarySequence}
                sequenceName={sequenceStats?.word ?? ""}
                author={sequenceStats?.author}
                bind:isPlaying
                bind:animatingBeatNumber
                {speed}
                {beats}
                {startPosition}
                {currentBeatNumber}
                {sequenceStats}
                onChangeSequence={openSequenceBrowser}
                onStop={handleStop}
                onOpenTrailPanel={handleOpenTrailPanel}
                onOpenAdvancedSettings={handleOpenAdvancedSettings}
              />
            {/if}
          </div>
        </div>
      </div>

      <!-- Mobile Preview -->
      <div class="preview-column">
        <h2>
          <span class="platform-icon mobile-icon">
            <i class="fas fa-mobile-alt"></i>
          </span>
          Mobile ({selectedMobileViewport.name})
        </h2>
        <div class="viewport-dimensions">
          {selectedMobileViewport.width} × {selectedMobileViewport.height}
        </div>
        <div
          class="viewport-frame mobile-frame"
          style="
            width: {selectedMobileViewport.width * scale}px;
            height: {selectedMobileViewport.height * scale}px;
          "
        >
          <div
            class="viewport-content"
            style="
              width: {selectedMobileViewport.width}px;
              height: {selectedMobileViewport.height}px;
              transform: scale({scale});
              transform-origin: top left;
            "
          >
            {#if !showSequenceView || !primarySequence}
              <MobileSelectionArea onBrowseSequences={openSequenceBrowser} />
            {:else}
              <MobileAnimationView
                sequence={primarySequence}
                sequenceName={sequenceStats?.word ?? ""}
                deviceSize={selectedMobileViewport.deviceSize}
                isShortScreen={selectedMobileViewport.height < 700}
                bind:isPlaying
                bind:animatingBeatNumber
                {speed}
                {beats}
                {startPosition}
                {currentBeatNumber}
                onChangeSequence={openSequenceBrowser}
                onPlayToggle={(playing) => isPlaying = playing}
                onStop={handleStop}
                onOpenAdvancedSettings={handleOpenAdvancedSettings}
              />
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Sequence Browser Panel (only render when container ready) -->
  {#if containerReady}
    <SequenceBrowserPanel
      mode="primary"
      show={isSequenceBrowserOpen}
      onSelect={handleSequenceSelect}
      onClose={() => isSequenceBrowserOpen = false}
    />

    <!-- Trail Preset Panel -->
    <TrailPresetPanel
      bind:isOpen={isTrailPanelOpen}
      currentSettings={trailSettings}
      onPresetSelect={handlePresetSelect}
      onCustomize={handleOpenAdvancedSettings}
    />

    <!-- Advanced Settings Drawer -->
    <AdvancedSettingsDrawer
      bind:isOpen={isAdvancedSettingsOpen}
      settings={trailSettings}
      onFadeDurationChange={(ms) => animationSettings.setFadeDuration(ms)}
      onLineWidthChange={(width) => animationSettings.setTrailAppearance({ lineWidth: width })}
      onOpacityChange={(opacity) => animationSettings.setTrailAppearance({ maxOpacity: opacity })}
      onGlowToggle={(enabled) => animationSettings.setTrailAppearance({ glowEnabled: enabled })}
      onHidePropsToggle={(hide) => animationSettings.setHideProps(hide)}
    />
  {/if}
</div>

<style>
  .test-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    display: grid;
    grid-template-columns: 320px 1fr;
    color: white;
  }

  /* Controls Panel */
  .controls-panel {
    background: rgba(0, 0, 0, 0.4);
    padding: 1.5rem;
    overflow-y: auto;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .controls-panel h1 {
    font-size: 1.5rem;
    margin: 0 0 0.25rem 0;
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .spinner.large {
    width: 48px;
    height: 48px;
    border-width: 4px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .preview-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.6);
  }

  .control-group {
    margin-bottom: 1.5rem;
  }

  .control-group h3 {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .control-group label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .control-group input[type="range"] {
    width: 100%;
    accent-color: #8b5cf6;
  }

  .button-row {
    display: flex;
    gap: 0.5rem;
  }

  .state-btn, .play-btn, .stop-btn {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .state-btn:hover, .play-btn:hover, .stop-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .state-btn.active {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.6);
  }

  .play-btn.playing {
    background: rgba(251, 191, 36, 0.3);
    border-color: rgba(251, 191, 36, 0.6);
  }

  .sequence-info {
    margin-top: 0.75rem;
    padding: 0.6rem 0.75rem;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .seq-name {
    font-weight: 600;
    color: #c4b5fd;
    flex: 1;
  }

  .seq-beats {
    color: rgba(255, 255, 255, 0.5);
  }

  .clear-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 4px;
    color: #fca5a5;
    font-size: 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .viewport-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .viewport-btn {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .viewport-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
  }

  .viewport-btn.active {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.6);
  }

  .vp-name {
    font-weight: 500;
  }

  .vp-size {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .status-box {
    margin-top: 1.5rem;
    padding: 0.75rem 1rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: #86efac;
  }

  .status-box i {
    color: #22c55e;
  }

  /* Preview Area */
  .preview-area {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    overflow: auto;
    align-items: flex-start;
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .preview-column h2 {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .platform-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
  }

  .desktop-icon {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }

  .mobile-icon {
    background: rgba(236, 72, 153, 0.2);
    color: #f472b6;
  }

  .viewport-dimensions {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: monospace;
  }

  .viewport-frame {
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    overflow: hidden;
    background: #0a0a0a;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .desktop-frame {
    border-color: rgba(59, 130, 246, 0.5);
  }

  .mobile-frame {
    border-color: rgba(236, 72, 153, 0.5);
    border-radius: 24px;
  }

  .viewport-content {
    overflow: hidden;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .preview-area {
      flex-direction: column;
      align-items: center;
    }
  }

  @media (max-width: 800px) {
    .test-page {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr;
    }

    .controls-panel {
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
</style>
