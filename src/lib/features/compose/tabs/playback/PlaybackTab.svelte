<!--
  PlaybackTab.svelte

  Unified playback view that consolidates all animation rendering.
  Switches renderers based on current mode and provides unified controls.
-->
<script lang="ts">
  import { getPlaybackState } from "./state/playback-state.svelte";
  import { getAnimateModuleState } from "../../shared/state/animate-module-state.svelte";
  import PlaybackHeader from "./components/PlaybackHeader.svelte";
  import PlaybackControls from "./components/PlaybackControls.svelte";
  import TrailSettingsSheet from "./components/TrailSettingsSheet.svelte";
  import SingleRenderer from "./renderers/SingleRenderer.svelte";
  import TunnelRenderer from "./renderers/TunnelRenderer.svelte";
  import MirrorRenderer from "./renderers/MirrorRenderer.svelte";
  import GridRenderer from "./renderers/GridRenderer.svelte";
  import type { TrailSettings } from "../../shared/domain/types/TrailTypes";

  // Get state instances
  const playbackState = getPlaybackState();
  const moduleState = getAnimateModuleState();

  // Trail settings sheet
  let isTrailSettingsOpen = $state(false);
  let currentSettingsCanvasId = $state<string>("main");

  // Tunnel colors (placeholder - should come from settings)
  const tunnelColors = {
    primary: {
      blue: "#2E3192",
      red: "#ED1C24",
    },
    secondary: {
      blue: "#06b6d4",
      red: "#ec4899",
    },
  };

  // Grid state (placeholder - should come from grid tab state)
  const gridSequences = $state<any[]>([]);
  const gridRotationOffsets = $state<number[]>([0, 90, 180, 270]);

  // Handlers
  function handleClose() {
    console.log("🎬 Closing playback overlay");
    moduleState.closePlayback();
  }

  function handleSave() {
    console.log("💾 Save composition requested");
    // TODO: Implement save functionality
  }

  function handleShare() {
    console.log("🔗 Share composition requested");
    // TODO: Implement share functionality
  }

  function handleOpenSettings(canvasId: string) {
    currentSettingsCanvasId = canvasId;
    isTrailSettingsOpen = true;
  }

  function handleTrailSettingsChange(
    canvasId: string,
    settings: Partial<TrailSettings>
  ) {
    playbackState.updateTrailSettings(canvasId, settings);
  }

  function handleGridSelectCell(index: number) {
    console.log(`🎬 Grid cell ${index} selected`);
    // TODO: Open sequence browser for this grid cell
  }

  function handleGridRemoveCell(index: number) {
    console.log(`🎬 Grid cell ${index} removed`);
    // TODO: Remove sequence from grid cell
  }

  // Get current canvas settings
  const currentCanvasSettings = $derived(() => {
    const settings = playbackState.canvasSettings.find(
      (cs) => cs.id === currentSettingsCanvasId
    );
    return settings?.trailSettings || playbackState.canvasSettings[0]?.trailSettings;
  });

  // Get primary and secondary sequences for tunnel mode
  const primarySequence = $derived(() => {
    return playbackState.sequences[0]?.sequence || null;
  });

  const secondarySequence = $derived(() => {
    return playbackState.sequences[1]?.sequence || null;
  });

  // Get single sequence
  const singleSequence = $derived(() => {
    return playbackState.sequences[0]?.sequence || null;
  });

  // Get mirror sequence
  const mirrorSequence = $derived(() => {
    return playbackState.sequences[0]?.sequence || null;
  });
</script>

<div class="playback-tab">
  <!-- Header with close button -->
  <PlaybackHeader
    currentMode={playbackState.currentMode}
    onSave={handleSave}
    onShare={handleShare}
    onClose={handleClose}
  />

  <!-- Renderer Area -->
  <div class="renderer-area">
    {#if playbackState.currentMode === "single"}
      <SingleRenderer
        sequence={singleSequence()}
        isPlaying={playbackState.isPlaying}
        speed={playbackState.speed}
        visible={playbackState.sequences[0]?.visible ?? true}
        blueVisible={playbackState.sequences[0]?.blueVisible ?? true}
        redVisible={playbackState.sequences[0]?.redVisible ?? true}
        onOpenSettings={handleOpenSettings}
      />
    {:else if playbackState.currentMode === "tunnel"}
      <TunnelRenderer
        primarySequence={primarySequence()}
        secondarySequence={secondarySequence()}
        tunnelColors={tunnelColors}
        isPlaying={playbackState.isPlaying}
        speed={playbackState.speed}
        primaryVisible={playbackState.sequences[0]?.visible ?? true}
        primaryBlueVisible={playbackState.sequences[0]?.blueVisible ?? true}
        primaryRedVisible={playbackState.sequences[0]?.redVisible ?? true}
        secondaryVisible={playbackState.sequences[1]?.visible ?? true}
        secondaryBlueVisible={playbackState.sequences[1]?.blueVisible ?? true}
        secondaryRedVisible={playbackState.sequences[1]?.redVisible ?? true}
        onOpenSettings={handleOpenSettings}
      />
    {:else if playbackState.currentMode === "mirror"}
      <MirrorRenderer
        sequence={mirrorSequence()}
        axis="vertical"
        isPlaying={playbackState.isPlaying}
        speed={playbackState.speed}
        onOpenSettings={handleOpenSettings}
      />
    {:else if playbackState.currentMode === "grid"}
      <GridRenderer
        gridSequences={gridSequences}
        gridRotationOffsets={gridRotationOffsets}
        isPlaying={playbackState.isPlaying}
        speed={playbackState.speed}
        onSelectCell={handleGridSelectCell}
        onRemoveCell={handleGridRemoveCell}
        onOpenSettings={handleOpenSettings}
      />
    {/if}
  </div>

  <!-- Playback Controls -->
  <PlaybackControls
    isPlaying={playbackState.isPlaying}
    speed={playbackState.speed}
    shouldLoop={playbackState.shouldLoop}
    onPlay={() => playbackState.play()}
    onPause={() => playbackState.pause()}
    onStop={() => playbackState.stop()}
    onSpeedChange={(speed) => playbackState.setSpeed(speed)}
    onLoopToggle={(loop) => playbackState.setLoop(loop)}
  />

  <!-- Trail Settings Sheet -->
  {#if currentCanvasSettings()}
    {@const canvasSettings = currentCanvasSettings()}
    {#if canvasSettings}
      <TrailSettingsSheet
        bind:isOpen={isTrailSettingsOpen}
        canvasId={currentSettingsCanvasId}
        trailSettings={canvasSettings}
        onSettingsChange={handleTrailSettingsChange}
      />
    {/if}
  {/if}
</div>

<style>
  .playback-tab {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: var(--color-background-primary, #1a1a1a);
    overflow: hidden;
  }

  .renderer-area {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }
</style>
