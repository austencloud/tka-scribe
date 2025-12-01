<!--
  SingleModePanel.svelte - Single Sequence Animation Mode

  Full-screen canvas showing one sequence with polished modern UI.
  Orchestrates mobile and desktop views based on device size.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { AnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import { getSingleTabState } from "./state";
  // Platform-specific imports
  import { MobileAnimationView, MobileSelectionArea } from "./mobile";
  import { DesktopAnimationView, DesktopSelectionArea } from "./desktop";
  // Shared imports
  import {
    TrailPresetPanel,
    AdvancedSettingsDrawer,
    applyPreset,
    type TrailPresetId,
  } from "../../shared/components";
  import { animationSettings } from "$lib/shared/animate/state/animation-settings-state.svelte";
  import { SequenceBrowserPanel } from "$lib/shared/animate/components";

  // Tab-specific state
  const tabState = getSingleTabState();

  // Device size detection for responsive layouts
  type DeviceSize = "xs" | "sm" | "md" | "lg" | "xl";
  let deviceSize = $state<DeviceSize>("lg");
  let viewportHeight = $state(0);

  // Derived helpers for layout decisions
  const isMobile = $derived(deviceSize === "xs" || deviceSize === "sm");
  const isVerySmallScreen = $derived(deviceSize === "xs");
  const isShortScreen = $derived(viewportHeight < 600);

  // Control mode based on screen size
  const controlsMode = $derived.by(() => {
    if (deviceSize === "xs") return "compact";
    if (deviceSize === "sm") return "inline";
    return "fullscreen";
  });

  onMount(() => {
    function updateDeviceSize() {
      const width = window.innerWidth;
      viewportHeight = window.innerHeight;

      if (width < 375) {
        deviceSize = "xs"; // Very small phones
      } else if (width < 480) {
        deviceSize = "sm"; // Small phones (iPhone SE, etc.)
      } else if (width < 768) {
        deviceSize = "md"; // Large phones, small tablets
      } else if (width < 1024) {
        deviceSize = "lg"; // Tablets, small laptops
      } else {
        deviceSize = "xl"; // Desktops
      }
    }

    updateDeviceSize();
    window.addEventListener("resize", updateDeviceSize);
    return () => window.removeEventListener("resize", updateDeviceSize);
  });

  // Props - shared module state for browser panel coordination
  let {
    animateState,
  }: {
    animateState: AnimateModuleState;
  } = $props();

  // Local state for animation playback (bound to UI)
  let animatingBeatNumber = $state<number | null>(null);
  let isPlaying = $state(false);
  let shouldLoop = $state(true);

  // Drawer states (rendered at panel level for proper z-index)
  let isAdvancedSettingsOpen = $state(false);
  let isTrailPanelOpen = $state(false);
  const trailSettings = $derived(animationSettings.trail);

  // Sync local playback state with tab state
  $effect(() => {
    if (isPlaying !== tabState.isPlaying) {
      tabState.setIsPlaying(isPlaying);
    }
  });

  $effect(() => {
    if (shouldLoop !== tabState.shouldLoop) {
      tabState.setShouldLoop(shouldLoop);
    }
  });

  // Sync tab state changes back to local state
  $effect(() => {
    isPlaying = tabState.isPlaying;
  });

  $effect(() => {
    shouldLoop = tabState.shouldLoop;
  });

  // Derived stats from tab state's sequence
  const sequenceStats = $derived.by(() => {
    const seq = tabState.sequence;
    if (!seq) return null;

    const beatCount = seq.beats?.length ?? 0;
    const estimatedDuration = beatCount * (60 / (tabState.speed * 60));

    return {
      beats: beatCount,
      duration: estimatedDuration.toFixed(1),
      word: seq.word || seq.name || "Untitled",
      author: seq.author,
      difficulty:
        (seq as unknown as { difficulty?: string }).difficulty ??
        "intermediate",
    };
  });

  // Beats array for BeatGrid
  const beats = $derived(tabState.sequence?.beats || []);

  // Start position for BeatGrid
  const startPosition = $derived(
    tabState.sequence?.startPosition ||
      tabState.sequence?.startingPositionBeat ||
      null
  );

  // Current beat number for highlighting (0=start, 1=first beat, etc.)
  const currentBeatNumber = $derived(
    animatingBeatNumber !== null ? Math.floor(animatingBeatNumber) + 1 : 0
  );

  function handleStop() {
    tabState.setIsPlaying(false);
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
          ...presetSettings,
        },
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
  {#if !tabState.sequence}
    <!-- Empty State - No Sequence Selected -->
    {#if isMobile}
      <MobileSelectionArea
        onBrowseSequences={() => animateState.openSequenceBrowser("primary")}
      />
    {:else}
      <DesktopSelectionArea
        onBrowseSequences={() => animateState.openSequenceBrowser("primary")}
      />
    {/if}
  {:else}
    <!-- Animation View - Sequence Loaded -->
    {#if isMobile}
      <MobileAnimationView
        sequence={tabState.sequence}
        sequenceName={sequenceStats?.word ?? ""}
        bind:isPlaying
        bind:animatingBeatNumber
        speed={tabState.speed}
        {beats}
        {startPosition}
        {currentBeatNumber}
        onChangeSequence={() => animateState.openSequenceBrowser("primary")}
        onPlayToggle={(playing) => {
          isPlaying = playing;
        }}
        onStop={handleStop}
        onOpenAdvancedSettings={handleOpenAdvancedSettings}
      />
    {:else}
      <DesktopAnimationView
        sequence={tabState.sequence}
        sequenceName={sequenceStats?.word ?? ""}
        author={sequenceStats?.author}
        bind:isPlaying
        bind:animatingBeatNumber
        speed={tabState.speed}
        {beats}
        {startPosition}
        {currentBeatNumber}
        {sequenceStats}
        onChangeSequence={() => animateState.openSequenceBrowser("primary")}
        onStop={handleStop}
        onOpenTrailPanel={handleOpenTrailPanel}
        onOpenAdvancedSettings={handleOpenAdvancedSettings}
      />
    {/if}
  {/if}

  <!-- Sequence Browser Panel -->
  <SequenceBrowserPanel
    mode="primary"
    show={animateState.isSequenceBrowserOpen &&
      animateState.browserMode === "primary"}
    onSelect={(sequence) => {
      tabState.setSequence(sequence);
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
</style>
