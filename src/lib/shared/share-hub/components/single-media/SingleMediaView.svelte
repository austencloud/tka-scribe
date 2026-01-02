<!--
  SingleMediaView.svelte

  Container for Single Media mode in Share Hub.
  Displays format selector, active preview, and export button.

  Features:
  - Format selector (Animation | Static | Performance)
  - Conditional preview rendering based on selected format
  - Primary export button at bottom
  - Clean vertical layout

  Domain: Share Hub - Single Media Mode Container
-->
<script lang="ts">
  import type { MediaFormat } from '../../domain/models/MediaFormat';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import type { VideoExportProgress } from '$lib/features/compose/services/contracts/IVideoExportOrchestrator';
  import type { PlaybackMode, StepPlaybackStepSize } from '$lib/features/compose/state/animation-panel-state.svelte';
  import { getShareHubState } from '../../state/share-hub-state.svelte';
  import FormatSelector from '../shared/FormatSelector.svelte';
  import ExportButton from '../shared/ExportButton.svelte';
  import AnimationExportView from './AnimationExportView.svelte';
  import StaticPreview from './StaticPreview.svelte';
  import PerformancePreview from './PerformancePreview.svelte';

  let {
    isSequenceSaved = true,
    isMobile = false,
    onExport,
    // Animation props from ShareHubCoordinator
    animationSequenceData = null,
    isAnimationPlaying = false,
    animationCurrentBeat = 0,
    animationSpeed = 1,
    animationBluePropState = null,
    animationRedPropState = null,
    isCircular = false,
    exportLoopCount = 1,
    isAnimationExporting = false,
    animationExportProgress = null,
    animationServicesReady = false,
    animationLoading = false,
    selectedFormat = 'animation',
    // Full animation controls
    playbackMode = 'continuous' as PlaybackMode,
    stepPlaybackPauseMs = 300,
    stepPlaybackStepSize = 1 as StepPlaybackStepSize,
    blueMotionVisible = true,
    redMotionVisible = true,
    isSideBySideLayout = false,
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
    onFormatChange,
    onPlaybackModeChange,
    onStepPlaybackPauseMsChange,
    onStepPlaybackStepSizeChange,
    onToggleBlue,
    onToggleRed,
  }: {
    /** Whether the sequence has been saved to the library */
    isSequenceSaved?: boolean;
    /** Whether we're on a mobile device (affects button label) */
    isMobile?: boolean;
    onExport?: () => void;
    // Animation props
    animationSequenceData?: SequenceData | null;
    isAnimationPlaying?: boolean;
    animationCurrentBeat?: number;
    animationSpeed?: number;
    animationBluePropState?: any;
    animationRedPropState?: any;
    isCircular?: boolean;
    exportLoopCount?: number;
    isAnimationExporting?: boolean;
    animationExportProgress?: VideoExportProgress | null;
    animationServicesReady?: boolean;
    animationLoading?: boolean;
    selectedFormat?: 'animation' | 'static' | 'performance';
    // Full animation controls
    playbackMode?: PlaybackMode;
    stepPlaybackPauseMs?: number;
    stepPlaybackStepSize?: StepPlaybackStepSize;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    isSideBySideLayout?: boolean;
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
    onFormatChange?: (format: 'animation' | 'static' | 'performance') => void;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onStepPlaybackPauseMsChange?: (pauseMs: number) => void;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
  } = $props();

  // FIX: Use 'hubState' instead of 'state' to avoid collision with $state rune
  const hubState = getShareHubState();
  let exporting = $state(false);

  // Dynamic button label based on save state, format, and platform
  const formatLabel = $derived(
    hubState.selectedFormat === 'animation' ? 'Animation' :
    hubState.selectedFormat === 'static' ? 'Image' : 'Video'
  );
  // Mobile: "Share" action, Desktop: "Save" action
  const actionVerb = $derived(isMobile ? 'Share' : 'Save');
  const buttonLabel = $derived(
    isSequenceSaved ? `${actionVerb} ${formatLabel}` : `Save & ${actionVerb} ${formatLabel}`
  );

  function handleFormatSelect(format: MediaFormat) {
    hubState.selectedFormat = format;
    // Notify parent coordinator of format change (for animation loading)
    onFormatChange?.(format);
  }

  async function handleExport() {
    if (exporting) return;
    exporting = true;
    try {
      await onExport?.();
    } finally {
      exporting = false;
    }
  }
</script>

<div class="single-media-view">
  <!-- Format Selector -->
  <div class="format-selector-container">
    <FormatSelector
      selectedFormat={hubState.selectedFormat}
      onFormatSelect={handleFormatSelect}
    />
  </div>

  <!-- Preview Area (conditional based on selected format) -->
  <div class="preview-area">
    {#if hubState.selectedFormat === 'animation'}
      <AnimationExportView
        sequenceData={animationSequenceData}
        isPlaying={isAnimationPlaying}
        currentBeat={animationCurrentBeat}
        speed={animationSpeed}
        bluePropState={animationBluePropState}
        redPropState={animationRedPropState}
        {isCircular}
        {exportLoopCount}
        isExporting={isAnimationExporting}
        exportProgress={animationExportProgress}
        servicesReady={animationServicesReady}
        loading={animationLoading}
        {playbackMode}
        {stepPlaybackPauseMs}
        {stepPlaybackStepSize}
        {blueMotionVisible}
        {redMotionVisible}
        {isSideBySideLayout}
        {onPlaybackToggle}
        {onSpeedChange}
        {onStepHalfBeatForward}
        {onStepHalfBeatBackward}
        {onStepFullBeatForward}
        {onStepFullBeatBackward}
        {onLoopCountChange}
        {onCanvasReady}
        {onCancelExport}
        {onExportVideo}
        {onPlaybackModeChange}
        {onStepPlaybackPauseMsChange}
        {onStepPlaybackStepSizeChange}
        {onToggleBlue}
        {onToggleRed}
      />
    {:else if hubState.selectedFormat === 'static'}
      <StaticPreview />
    {:else if hubState.selectedFormat === 'performance'}
      <PerformancePreview />
    {/if}
  </div>

  <!-- Export Button (hidden for Animation - AnimationControlsPanel has its own) -->
  {#if hubState.selectedFormat !== 'animation'}
    <div class="export-container">
      <ExportButton
        label={buttonLabel}
        loading={exporting}
        onclick={handleExport}
      />
    </div>
  {/if}
</div>

<style>
  .single-media-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
    padding: 20px;
  }

  .format-selector-container {
    flex-shrink: 0;
  }

  .preview-area {
    flex: 1;
    min-height: 0; /* Allow flex child to shrink */
    display: flex;
    flex-direction: column;
  }

  .export-container {
    flex-shrink: 0;
    padding-top: 12px;
    border-top: 1px solid var(--theme-stroke);
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .single-media-view {
      padding: 16px;
      gap: 16px;
    }
  }
</style>
