<!--
  ShareHubPanel.svelte

  Main unified Share Hub panel combining Single Media and Composite modes.
  Top-level panel interface with mode toggle and conditional content rendering.

  Architecture:
  - Top: ModeToggle (Single Media | Composite)
  - Middle: Conditional view based on mode (SingleMediaView | CompositeView)
  - Overlay: SettingsPanel (slides in from right when gear clicked)

  Features:
  - Unified state management via createShareHubState()
  - Settings panel overlay with format-specific content
  - Responsive layout
  - Keyboard accessible
  - Theme-based styling

  Domain: Share Hub - Main Unified Panel
-->
<script lang="ts">
  import { createShareHubState } from '../state/share-hub-state.svelte';
  import ModeToggle from './shared/ModeToggle.svelte';
  import SingleMediaView from './single-media/SingleMediaView.svelte';
  import CompositeView from './composite/CompositeView.svelte';
  import SettingsPanel from './settings/SettingsPanel.svelte';
  import AnimationSettings from './settings/AnimationSettings.svelte';
  import StaticSettingsPanel from './settings/StaticSettings.svelte';
  import PerformanceSettingsPanel from './settings/PerformanceSettings.svelte';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import type { VideoExportProgress } from '$lib/features/compose/services/contracts/IVideoExportOrchestrator';
  import type { PlaybackMode, StepPlaybackStepSize } from '$lib/features/compose/state/animation-panel-state.svelte';
  import { untrack } from 'svelte';

  import type { ExportSettings } from '../domain/models/ExportSettings';

  let {
    sequence,
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
    sequence?: SequenceData | null;
    /** Whether the sequence has been saved to the library */
    isSequenceSaved?: boolean;
    /** Whether we're on a mobile device (affects button label) */
    isMobile?: boolean;
    onExport?: (mode: 'single' | 'composite', settings?: ExportSettings) => Promise<void>;
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
  const hubState = createShareHubState();

  // Initialize sequence once on mount - sequence shouldn't change during Share Hub lifetime
  // Using $effect.pre to run before DOM updates
  let sequenceInitialized = false;
  $effect.pre(() => {
    if (!sequenceInitialized && sequence !== undefined) {
      sequenceInitialized = true;
      // Use untrack to avoid creating a reactive dependency on hubState
      untrack(() => {
        hubState.setSequence(sequence ?? null);
      });
    }
  });

  // Settings panel title based on context
  const settingsTitle = $derived(
    hubState.settingsContext
      ? `${hubState.settingsContext.format.charAt(0).toUpperCase() + hubState.settingsContext.format.slice(1)} Settings${
          hubState.settingsContext.pieceIndex ? ` (Piece ${hubState.settingsContext.pieceIndex})` : ''
        }`
      : 'Settings'
  );

  // Handle export - passes current settings to parent
  async function handleExport() {
    if (hubState.mode === 'single') {
      const format = hubState.selectedFormat;
      const exportSettings: ExportSettings = {
        format,
        staticSettings: format === 'static' ? { ...hubState.staticSettings } : undefined,
        animationSettings: format === 'animation' ? { ...hubState.animationSettings } : undefined,
        performanceSettings: format === 'performance' ? { ...hubState.performanceSettings } : undefined,
      };
      await onExport?.(hubState.mode, exportSettings);
    } else {
      // Composite mode - TODO: pass composite settings
      await onExport?.(hubState.mode, undefined);
    }
  }

  // Handle mode change
  function handleModeChange(mode: 'single' | 'composite') {
    hubState.mode = mode;
    // Close settings panel when switching modes
    if (hubState.settingsPanelOpen) {
      hubState.settingsPanelOpen = false;
      hubState.settingsContext = null;
    }
  }
</script>

<div class="share-hub-panel">
  <!-- MVP: Mode toggle hidden - only Single Media available -->
  <!-- Composite mode not ready (requires video stitching implementation) -->
  <!-- <div class="mode-toggle-container">
    <ModeToggle mode={hubState.mode} onModeChange={handleModeChange} />
  </div> -->

  <!-- Content Area - Single Media only for MVP -->
  <div class="content-area">
    <SingleMediaView
      {isSequenceSaved}
      {isMobile}
      onExport={handleExport}
      {animationSequenceData}
      {isAnimationPlaying}
      {animationCurrentBeat}
      {animationSpeed}
      {animationBluePropState}
      {animationRedPropState}
      {isCircular}
      {exportLoopCount}
      {isAnimationExporting}
      {animationExportProgress}
      {animationServicesReady}
      {animationLoading}
      {selectedFormat}
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
      {onFormatChange}
      {onPlaybackModeChange}
      {onStepPlaybackPauseMsChange}
      {onStepPlaybackStepSizeChange}
      {onToggleBlue}
      {onToggleRed}
    />
  </div>

  <!-- Settings Panel Overlay -->
  {#if hubState.settingsPanelOpen && hubState.settingsContext}
    <SettingsPanel
      isOpen={hubState.settingsPanelOpen}
      title={settingsTitle}
      onClose={() => {
        hubState.settingsPanelOpen = false;
        hubState.settingsContext = null;
      }}
    >
      {#if hubState.settingsContext.format === 'animation'}
        <AnimationSettings />
      {:else if hubState.settingsContext.format === 'static'}
        <StaticSettingsPanel />
      {:else if hubState.settingsContext.format === 'performance'}
        <PerformanceSettingsPanel />
      {/if}
    </SettingsPanel>
  {/if}
</div>

<style>
  .share-hub-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--theme-panel-bg);
    position: relative;
    overflow: hidden;
  }

  .mode-toggle-container {
    flex-shrink: 0;
    padding: 20px 20px 0 20px;
    display: flex;
    justify-content: center;
  }

  .content-area {
    flex: 1;
    min-height: 0; /* Allow flex child to shrink */
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .mode-toggle-container {
      padding: 16px 16px 0 16px;
    }
  }
</style>
