<!--
  SingleModePanel.svelte - Single Sequence Animation Mode

  Full-screen canvas showing one sequence with polished modern UI.
  REFACTORED VERSION - Uses extracted components for cleaner organization
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import {
    SingleModeCanvas,
    SingleSelectionArea,
    SingleSelectionAreaMobile,
    SingleAnimationHeader,
    SingleAnimationViewMobile,
    SingleStatsBar,
  } from "./components";
  import { AnimationControlsV2, TrailPresetPanel, AdvancedSettingsDrawer, applyPreset, type TrailPresetId } from "../../components/v2";
  import { animationSettings } from "$lib/shared/animate/state/animation-settings-state.svelte";
  import SequenceBrowserPanel from "../../shared/components/SequenceBrowserPanel.svelte";
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";

  // Mobile detection
  let isMobile = $state(false);

  onMount(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    isMobile = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      isMobile = e.matches;
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  });

  // Props
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Local state for animation playback
  let animatingBeatNumber = $state<number | null>(null);
  let isPlaying = $state(false);
  let shouldLoop = $state(true);

  // Drawer states (rendered at panel level for proper z-index)
  let isAdvancedSettingsOpen = $state(false);
  let isTrailPanelOpen = $state(false);
  const trailSettings = $derived(animationSettings.trail);

  // Sync local state with animateState
  $effect(() => {
    if (isPlaying !== animateState.isPlaying) {
      animateState.setIsPlaying(isPlaying);
    }
  });

  $effect(() => {
    if (shouldLoop !== animateState.shouldLoop) {
      animateState.setShouldLoop(shouldLoop);
    }
  });

  // Sync animateState changes back to local state
  $effect(() => {
    isPlaying = animateState.isPlaying;
  });

  $effect(() => {
    shouldLoop = animateState.shouldLoop;
  });

  // Derived stats
  const sequenceStats = $derived.by(() => {
    const seq = animateState.primarySequence;
    if (!seq) return null;

    const beatCount = seq.beats?.length ?? 0;
    const estimatedDuration = beatCount * (60 / (animateState.speed * 60));

    return {
      beats: beatCount,
      duration: estimatedDuration.toFixed(1),
      word: seq.word || seq.name || "Untitled",
      author: seq.author,
      difficulty: (seq as unknown as { difficulty?: string }).difficulty ?? "intermediate",
    };
  });

  // Beats array for BeatGrid
  const beats = $derived(animateState.primarySequence?.beats || []);

  // Start position for BeatGrid
  const startPosition = $derived(
    animateState.primarySequence?.startPosition ||
    animateState.primarySequence?.startingPositionBeat ||
    null
  );

  // Current beat number for highlighting (0=start, 1=first beat, etc.)
  const currentBeatNumber = $derived(
    animatingBeatNumber !== null ? Math.floor(animatingBeatNumber) + 1 : 0
  );

  function handleStop() {
    animateState.setIsPlaying(false);
    animatingBeatNumber = null;
  }

  // Trail panel handlers
  function handleOpenTrailPanel() {
    isTrailPanelOpen = true;
  }

  function handlePresetSelect(presetId: TrailPresetId) {
    const presetSettings = applyPreset(presetId);
    if (presetSettings) {
      animationSettings.updateSettings({
        trail: {
          ...animationSettings.trail,
          ...presetSettings
        }
      });
    }
  }

  // Advanced settings handlers
  function handleOpenAdvancedSettings() {
    isAdvancedSettingsOpen = true;
  }

  function handleFadeDurationChange(ms: number) {
    animationSettings.setFadeDuration(ms);
  }

  function handleLineWidthChange(width: number) {
    animationSettings.setTrailAppearance({ lineWidth: width });
  }

  function handleOpacityChange(opacity: number) {
    animationSettings.setTrailAppearance({ maxOpacity: opacity });
  }

  function handleGlowToggle(enabled: boolean) {
    animationSettings.setTrailAppearance({ glowEnabled: enabled });
  }

  function handleHidePropsToggle(hide: boolean) {
    animationSettings.setHideProps(hide);
  }
</script>

<div class="single-mode-panel">
  {#if !animateState.primarySequence}
    {#if isMobile}
      <SingleSelectionAreaMobile
        onBrowseSequences={() => animateState.openSequenceBrowser("primary")}
      />
    {:else}
      <SingleSelectionArea
        onBrowseSequences={() => animateState.openSequenceBrowser("primary")}
      />
    {/if}
  {:else}
    <!-- Animation View - Sequence Loaded -->
    {#if isMobile}
      <SingleAnimationViewMobile
        sequence={animateState.primarySequence}
        sequenceName={sequenceStats?.word ?? ""}
        bind:isPlaying
        bind:shouldLoop
        speed={animateState.speed}
        onChangeSequence={() => animateState.openSequenceBrowser("primary")}
        onSpeedChange={(newSpeed) => animateState.setSpeed(newSpeed)}
      />
    {:else}
      <div class="animation-view">
        <SingleAnimationHeader
          sequenceName={sequenceStats?.word ?? ""}
          author={sequenceStats?.author}
          onChangeSequence={() => animateState.openSequenceBrowser("primary")}
        />

        <SingleStatsBar
          beats={sequenceStats?.beats ?? 0}
          duration={sequenceStats?.duration ?? "0"}
          bpm={Math.round(animateState.speed * 60)}
          difficulty={sequenceStats?.difficulty ?? "intermediate"}
        />

        <!-- Beat Grid -->
        <div class="beat-grid-wrapper">
          <BeatGrid
            {beats}
            {startPosition}
            selectedBeatNumber={currentBeatNumber}
          />
        </div>

        <!-- Canvas Container -->
        <div class="canvas-container">
          <SingleModeCanvas
            sequence={animateState.primarySequence}
            bind:isPlaying
            bind:animatingBeatNumber
            speed={animateState.speed}
          />
        </div>

        <!-- Beat Indicator - Below Canvas -->
        {#if animatingBeatNumber !== null && isPlaying}
          <div class="beat-indicator">
            Beat {Math.floor(animatingBeatNumber) + 1} / {sequenceStats?.beats}
          </div>
        {/if}

        <div class="controls-area">
          <AnimationControlsV2
            mode="fullscreen"
            bind:isPlaying
            showExport={true}
            onPlayToggle={(playing) => {
              isPlaying = playing;
              if (!playing) handleStop();
            }}
            onOpenTrailPanel={handleOpenTrailPanel}
            onOpenAdvancedSettings={handleOpenAdvancedSettings}
          />
        </div>
      </div>
    {/if}
  {/if}

  <!-- Sequence Browser Panel -->
  <SequenceBrowserPanel
    mode="primary"
    show={animateState.isSequenceBrowserOpen &&
      animateState.browserMode === "primary"}
    onSelect={(sequence) => {
      animateState.setPrimarySequence(sequence);
      animateState.closeSequenceBrowser();
    }}
    onClose={animateState.closeSequenceBrowser}
  />

  <!-- Trail Preset Panel (rendered at panel level for proper overlay) -->
  <TrailPresetPanel
    bind:isOpen={isTrailPanelOpen}
    currentSettings={trailSettings}
    onPresetSelect={handlePresetSelect}
    onCustomize={handleOpenAdvancedSettings}
  />

  <!-- Advanced Settings Drawer (rendered at panel level for proper overlay) -->
  <AdvancedSettingsDrawer
    bind:isOpen={isAdvancedSettingsOpen}
    settings={trailSettings}
    onFadeDurationChange={handleFadeDurationChange}
    onLineWidthChange={handleLineWidthChange}
    onOpacityChange={handleOpacityChange}
    onGlowToggle={handleGlowToggle}
    onHidePropsToggle={handleHidePropsToggle}
  />
</div>

<style>
  .single-mode-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .animation-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Beat Grid Wrapper */
  .beat-grid-wrapper {
    flex-shrink: 0;
    height: 140px;
    min-height: 140px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 8px;
  }

  /* Canvas Container */
  .canvas-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
  }

  .beat-indicator {
    display: flex;
    justify-content: center;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  /* Controls Area */
  .controls-area {
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>
