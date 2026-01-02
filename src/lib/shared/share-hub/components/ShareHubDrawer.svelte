<!--
  ShareHubDrawer.svelte

  Drawer wrapper for unified Share Hub panel, used across multiple modules (Discover, Create, Library).
  Simpler than CreatePanelDrawer since it doesn't depend on Create module context.

  - Mobile: Bottom drawer, 85vh height
  - Desktop: Right drawer, full height
  - Updated to use ShareHubPanel (unified Single Media | Composite architecture)
-->
<script lang="ts">
  import Drawer from '$lib/shared/foundation/ui/Drawer.svelte';
  import ShareHubPanel from './ShareHubPanel.svelte';
  import type { ExportSettings } from '../domain/models/ExportSettings';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import type { VideoExportProgress } from '$lib/features/compose/services/contracts/IVideoExportOrchestrator';
  import type { PlaybackMode, StepPlaybackStepSize } from '$lib/features/compose/state/animation-panel-state.svelte';
  import { tryGetCreateModuleContext } from '$lib/features/create/shared/context/create-module-context';

  let {
    isOpen = $bindable(false),
    sequence,
    isSequenceSaved = true,
    isMobile = false,
    onClose,
    onExport,
    // Animation props (optional - only passed when animation services ready)
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
    // Full animation controls props
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
    isOpen?: boolean;
    sequence: SequenceData | null;
    /** Whether the sequence has been saved to the library */
    isSequenceSaved?: boolean;
    /** Whether we're on a mobile device (affects button label) */
    isMobile?: boolean;
    onClose?: () => void;
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

  // Try to get Create module context for measured tool panel width
  const createModuleContext = tryGetCreateModuleContext();

  // Get measured tool panel width (if available from Create module)
  const toolPanelWidth = $derived.by(() =>
    createModuleContext ? createModuleContext.panelState.toolPanelWidth : 0
  );

  // Detect viewport width for placement (simple media query approach)
  let isDesktop = $state(false);

  // Update on mount and resize
  $effect(() => {
    function updateLayout() {
      isDesktop = window.innerWidth >= 1024; // Desktop breakpoint
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  });

  const placement = $derived(isDesktop ? 'right' : 'bottom');

  // Dynamic inline style to set measured width CSS variable
  // If measured width is available, use it; otherwise CSS will use fallback clamp value
  const drawerStyle = $derived.by(() => {
    if (toolPanelWidth > 0) {
      return `--measured-panel-width: ${toolPanelWidth}px`;
    }
    return null; // Use null instead of empty string so {#if} block doesn't render
  });

  function handleClose() {
    isOpen = false;
    onClose?.();
  }
</script>

{#if drawerStyle !== null}
  <div style={drawerStyle}>
    <Drawer
      bind:isOpen
      ariaLabel="Share Hub - Choose export format"
      onclose={handleClose}
      closeOnBackdrop={false}
      showHandle={!isDesktop}
      dismissible={true}
      respectLayoutMode={true}
      placement={placement}
      class="share-hub-drawer"
      backdropClass="share-hub-backdrop"
      trapFocus={false}
      preventScroll={true}
    >
      <div class="share-hub-content">
        <ShareHubPanel
          {sequence}
          {isSequenceSaved}
          {isMobile}
          {onExport}
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
    </Drawer>
  </div>
{:else}
  <Drawer
    bind:isOpen
    ariaLabel="Share Hub - Choose export format"
    onclose={handleClose}
    closeOnBackdrop={false}
    showHandle={!isDesktop}
    dismissible={true}
    respectLayoutMode={true}
    placement={placement}
    class="share-hub-drawer"
    backdropClass="share-hub-backdrop"
    trapFocus={false}
    preventScroll={true}
  >
    <div class="share-hub-content">
      <ShareHubPanel
        {sequence}
        {isSequenceSaved}
        {isMobile}
        {onExport}
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
  </Drawer>
{/if}

<style>
  /* Drawer container styling - NO BLUR to keep content behind visible */
  :global(.drawer-content.share-hub-drawer) {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.92),
      rgba(0, 0, 0, 0.95)
    ) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.5),
      0 -2px 8px var(--theme-shadow),
      inset 0 1px 0 var(--theme-card-hover-bg);
    z-index: 150 !important;
  }

  /* Desktop (right placement) - match Create module panel width */
  :global(.drawer-content.share-hub-drawer[data-placement="right"]) {
    /* Use measured tool panel width when available (from Create module context) */
    width: var(--measured-panel-width, clamp(360px, 50vw, 1600px));
    max-width: 100vw;
    height: 100dvh;
    /* Full viewport height - ShareHub is an overlay, not a Create module tool panel */
  }

  /* Mobile (bottom placement) */
  :global(.drawer-content.share-hub-drawer[data-placement="bottom"]) {
    height: 85vh;
    max-height: 85vh;
  }

  /* Backdrop - Completely transparent, no darkening, no click blocking */
  :global(.drawer-overlay.share-hub-backdrop) {
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    pointer-events: none !important;
  }

  /* Content wrapper */
  .share-hub-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    :global(.drawer-content.share-hub-drawer) {
      transition: none !important;
    }
  }
</style>
