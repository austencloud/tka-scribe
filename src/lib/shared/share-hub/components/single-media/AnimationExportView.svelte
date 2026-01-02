<!--
  AnimationExportView.svelte

  PURE VIEW component for animation preview and export in Share Hub.
  All state is received as props - no service resolution, no state management.

  This replaces the broken AnimationPreview that had infinite loop issues
  from bidirectional state binding.

  Uses the same AnimationControlsPanel as the original animation viewer
  to provide consistent UI and full controls.

  Features:
  - Live animation preview via AnimatorCanvas
  - Full AnimationControlsPanel with transport, BPM, visibility, settings
  - Export progress overlay on canvas during export
  - Same layout/controls as original animation viewer

  Domain: Share Hub - Single Media - Animation Format
-->
<script lang="ts">
  import AnimatorCanvas from '$lib/shared/animation-engine/components/AnimatorCanvas.svelte';
  import AnimationControlsPanel from '$lib/features/compose/components/canvas/AnimationControlsPanel.svelte';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import type { VideoExportProgress } from '$lib/features/compose/services/contracts/IVideoExportOrchestrator';
  import type { PlaybackMode, StepPlaybackStepSize } from '$lib/features/compose/state/animation-panel-state.svelte';

  // All state received as props (unidirectional data flow)
  let {
    sequenceData = null,
    isPlaying = false,
    currentBeat = 0,
    speed = 1,
    isCircular = false,
    exportLoopCount = 1,
    isExporting = false,
    exportProgress = null,
    servicesReady = false,
    loading = false,
    bluePropState = null,
    redPropState = null,
    // Full animation controls
    playbackMode = 'continuous' as PlaybackMode,
    stepPlaybackPauseMs = 300,
    stepPlaybackStepSize = 1 as StepPlaybackStepSize,
    blueMotionVisible = true,
    redMotionVisible = true,
    isSideBySideLayout = false,
    // Handlers
    onPlaybackToggle,
    onSpeedChange,
    onStepHalfBeatForward,
    onStepHalfBeatBackward,
    onStepFullBeatForward,
    onStepFullBeatBackward,
    onLoopCountChange,
    onCanvasReady,
    onCancelExport,
    onExportVideo,
    onPlaybackModeChange,
    onStepPlaybackPauseMsChange,
    onStepPlaybackStepSizeChange,
    onToggleBlue,
    onToggleRed,
  }: {
    sequenceData?: SequenceData | null;
    isPlaying?: boolean;
    currentBeat?: number;
    speed?: number;
    isCircular?: boolean;
    exportLoopCount?: number;
    isExporting?: boolean;
    exportProgress?: VideoExportProgress | null;
    servicesReady?: boolean;
    loading?: boolean;
    bluePropState?: any;
    redPropState?: any;
    // Full animation controls
    playbackMode?: PlaybackMode;
    stepPlaybackPauseMs?: number;
    stepPlaybackStepSize?: StepPlaybackStepSize;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    isSideBySideLayout?: boolean;
    // Handlers
    onPlaybackToggle?: () => void;
    onSpeedChange?: (speed: number) => void;
    onStepHalfBeatForward?: () => void;
    onStepHalfBeatBackward?: () => void;
    onStepFullBeatForward?: () => void;
    onStepFullBeatBackward?: () => void;
    onLoopCountChange?: (count: number) => void;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
    onCancelExport?: () => void;
    onExportVideo?: () => void;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onStepPlaybackPauseMsChange?: (pauseMs: number) => void;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
  } = $props();

  // Canvas reference for export
  let canvasElement: HTMLCanvasElement | null = $state(null);

  // Derived values for AnimatorCanvas
  const currentBeatData = $derived.by(() => {
    if (!sequenceData) return null;
    if (currentBeat < 1 && sequenceData.startPosition) {
      return sequenceData.startPosition;
    }
    if (sequenceData.beats?.length > 0) {
      const beatNumber = Math.ceil(currentBeat - 1);
      const beatIndex = Math.max(0, beatNumber - 1);
      const clampedIndex = Math.min(beatIndex, sequenceData.beats.length - 1);
      return sequenceData.beats[clampedIndex] || null;
    }
    return null;
  });

  const currentLetter = $derived(currentBeatData?.letter || null);

  // Export progress helpers
  const progressPercent = $derived(
    exportProgress ? Math.round(exportProgress.progress * 100) : 0
  );
  const progressStage = $derived(
    exportProgress?.stage === 'capturing' ? 'Capturing frames...' :
    exportProgress?.stage === 'encoding' ? 'Encoding video...' :
    exportProgress?.stage === 'complete' ? 'Complete!' :
    exportProgress?.stage === 'error' ? 'Error' : ''
  );

  // Handle canvas ready from AnimatorCanvas
  function handleCanvasReady(canvas: HTMLCanvasElement | null) {
    canvasElement = canvas;
    onCanvasReady?.(canvas);
  }
</script>

<div class="animation-export-view">
  <!-- Preview Canvas -->
  <div class="preview-canvas">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading animation...</p>
      </div>
    {:else if !sequenceData}
      <div class="empty-state">
        <i class="fas fa-video" aria-hidden="true"></i>
        <p>No sequence loaded</p>
      </div>
    {:else if servicesReady}
      <AnimatorCanvas
        blueProp={bluePropState}
        redProp={redPropState}
        gridVisible={true}
        gridMode={sequenceData?.gridMode ?? null}
        letter={currentLetter}
        beatData={currentBeatData}
        {currentBeat}
        {sequenceData}
        onCanvasReady={handleCanvasReady}
      />
    {:else}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Initializing...</p>
      </div>
    {/if}

    <!-- Export Progress Overlay -->
    {#if isExporting && exportProgress}
      <div class="export-overlay">
        <div class="export-progress-card">
          <div class="progress-header">
            <span class="progress-stage">{progressStage}</span>
            {#if exportProgress.stage !== 'complete' && exportProgress.stage !== 'error'}
              <button
                class="cancel-button"
                onclick={() => onCancelExport?.()}
                aria-label="Cancel export"
              >
                <i class="fas fa-times" aria-hidden="true"></i>
              </button>
            {/if}
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: {progressPercent}%"></div>
          </div>
          <span class="progress-percent">{progressPercent}%</span>
          {#if exportProgress.currentFrame && exportProgress.totalFrames}
            <span class="frame-count">
              Frame {exportProgress.currentFrame} / {exportProgress.totalFrames}
            </span>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Animation Controls Panel (same as original animation viewer) -->
  <AnimationControlsPanel
    {speed}
    {isPlaying}
    {blueMotionVisible}
    {redMotionVisible}
    {playbackMode}
    {stepPlaybackPauseMs}
    {stepPlaybackStepSize}
    isSideBySideLayout={true}
    isExpanded={true}
    {isExporting}
    exportProgress={exportProgress ? { progress: exportProgress.progress, stage: exportProgress.stage } : null}
    {sequenceData}
    {currentBeat}
    {isCircular}
    loopCount={exportLoopCount}
    onSpeedChange={(s) => onSpeedChange?.(s)}
    onPlaybackToggle={() => onPlaybackToggle?.()}
    onPlaybackModeChange={(m) => onPlaybackModeChange?.(m)}
    onStepPlaybackPauseMsChange={(p) => onStepPlaybackPauseMsChange?.(p)}
    onStepPlaybackStepSizeChange={(s) => onStepPlaybackStepSizeChange?.(s)}
    onStepHalfBeatBackward={() => onStepHalfBeatBackward?.()}
    onStepHalfBeatForward={() => onStepHalfBeatForward?.()}
    onStepFullBeatBackward={() => onStepFullBeatBackward?.()}
    onStepFullBeatForward={() => onStepFullBeatForward?.()}
    onToggleBlue={() => onToggleBlue?.()}
    onToggleRed={() => onToggleRed?.()}
    onExportVideo={() => onExportVideo?.()}
    onCancelExport={() => onCancelExport?.()}
    onLoopCountChange={(c) => onLoopCountChange?.(c)}
  />
</div>

<style>
  .animation-export-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
  }

  .preview-canvas {
    flex: 1;
    min-height: 0;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    container-type: size;
    position: relative;
  }

  /* Ensure AnimatorCanvas sizes properly */
  .preview-canvas :global(.canvas-wrapper) {
    width: min(100cqw, 100cqh);
    height: min(100cqw, 100cqh);
    max-width: 100%;
    max-height: 100%;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--theme-text-dim);
  }

  .empty-state i {
    font-size: var(--font-size-3xl);
    opacity: 0.3;
  }

  .spinner {
    width: 44px;
    height: 44px;
    border: 4px solid var(--theme-stroke);
    border-top-color: var(--theme-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Export Progress Overlay */
  .export-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .export-progress-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px 32px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 16px;
    min-width: 200px;
  }

  .progress-header {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    justify-content: space-between;
  }

  .progress-stage {
    font-size: var(--font-size-min);
    color: var(--theme-text);
    font-weight: 500;
  }

  .cancel-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: 1px solid var(--theme-stroke);
    border-radius: 6px;
    color: var(--theme-text-dim);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button:hover {
    background: var(--semantic-error);
    border-color: var(--semantic-error);
    color: white;
  }

  .progress-bar-container {
    width: 100%;
    height: 6px;
    background: var(--theme-stroke);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: var(--theme-accent);
    transition: width 0.1s ease;
  }

  .progress-percent {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--theme-text);
  }

  .frame-count {
    font-size: var(--font-size-compact);
    color: var(--theme-text-dim);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }

    .cancel-button {
      transition: none;
    }

    .progress-bar {
      transition: none;
    }
  }
</style>
