<!--
  AnimationPanel.svelte

  Slide-up animation panel with auto-start and minimal controls.
  - Slides up from bottom using BottomSheet
  - Auto-starts animation on open
  - Shows speed slider and animated pictograph
  - Loop is always enabled
-->
<script lang="ts">
  import AnimatorCanvas from "$build/animate/components/AnimatorCanvas.svelte";
  import type { IAnimationPlaybackController, IGifExportService, type GifExportProgress } from "$build/animate/services/contracts";
  import { createAnimationPanelState } from "$build/animate/state/animation-panel-state.svelte";
  import { loadSequenceForAnimation } from "$build/animate/utils/sequence-loader";
  import type { ISequenceService } from "$build/shared";
  import { BottomSheet, SheetDragHandle, resolve, TYPES, type SequenceData } from "$shared";
  import type { IHapticFeedbackService } from "$shared/application/services/contracts";
  import { onMount } from "svelte";

  // Props
  let {
    sequence = null,
    show = false,
    onClose = () => {},
    combinedPanelHeight = 0,
    onCurrentBeatChange = () => {},
  }: {
    sequence?: SequenceData | null;
    show?: boolean;
    onClose?: () => void;
    combinedPanelHeight?: number;
    onCurrentBeatChange?: (beatNumber: number) => void;
  } = $props();

  // Services
  let sequenceService: ISequenceService | null = null;
  let playbackController: IAnimationPlaybackController | null = null;
  let hapticService: IHapticFeedbackService | null = null;
  let gifExportService: IGifExportService | null = null;

  // Component state
  const panelState = createAnimationPanelState();

  // GIF Export state
  let showExportDialog = $state(false);
  let isExporting = $state(false);
  let exportProgress = $state<GifExportProgress | null>(null);
  let canvasRef: HTMLCanvasElement | null = null;

  // Calculate panel height dynamically to match tool panel + button panel
  const panelHeightStyle = $derived(() => {
    if (combinedPanelHeight > 0) {
      return `height: ${combinedPanelHeight}px;`;
    }
    return 'height: 70vh;';
  });

  // Derived: Current letter from sequence data
  let currentLetter = $derived.by(() => {
    if (!panelState.sequenceData) return null;

    const currentBeat = panelState.currentBeat;

    // Before animation starts (beat 0 and not playing) = start position
    if (currentBeat === 0 && !panelState.isPlaying && panelState.sequenceData.startPosition) {
      return panelState.sequenceData.startPosition.letter || null;
    }

    // During animation: show beat letters
    if (panelState.sequenceData.beats && panelState.sequenceData.beats.length > 0) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(0, Math.min(beatIndex, panelState.sequenceData.beats.length - 1));
      return panelState.sequenceData.beats[clampedIndex]?.letter || null;
    }

    return null;
  });

  // Resolve services on mount
  onMount(() => {
    try {
      sequenceService = resolve<ISequenceService>(TYPES.ISequenceService);
      playbackController = resolve<IAnimationPlaybackController>(
        TYPES.IAnimationPlaybackController
      );
      hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
      gifExportService = resolve<IGifExportService>(TYPES.IGifExportService);
    } catch (error) {
      console.error("Failed to resolve animation services:", error);
      panelState.setError("Failed to initialize animation services");
    }
  });

  // Load and auto-start animation when panel becomes visible
  // CRITICAL: Delay to allow slide animation to complete first
  $effect(() => {
    if (show && sequence && sequenceService && playbackController) {
      // Show loading state immediately
      panelState.setLoading(true);
      panelState.setError(null);

      // Wait for BottomSheet slide animation to complete (300ms) before loading
      const loadTimeout = setTimeout(() => {
        loadAndStartAnimation();
      }, 320); // Slightly longer than BottomSheet transition (300ms)

      return () => clearTimeout(loadTimeout);
    }
  });

  async function loadAndStartAnimation() {
    if (!sequenceService || !playbackController) return;

    panelState.setLoading(true);
    panelState.setError(null);

    try {
      // Load sequence
      const result = await loadSequenceForAnimation(sequence, sequenceService);

      if (!result.success || !result.sequence) {
        throw new Error(result.error || "Failed to load sequence");
      }

      // Initialize playback controller with sequence and panelState
      // Enable loop by default
      panelState.setShouldLoop(true);
      const success = playbackController.initialize(result.sequence, panelState);

      if (!success) {
        throw new Error("Failed to initialize animation playback");
      }

      panelState.setSequenceData(result.sequence);

      // Auto-start animation after a brief delay
      setTimeout(() => {
        playbackController?.togglePlayback();
      }, 100);

    } catch (err) {
      console.error("❌ Failed to load sequence:", err);
      panelState.setError(
        err instanceof Error ? err.message : "Failed to load sequence"
      );
    } finally {
      panelState.setLoading(false);
    }
  }

  // Speed change handler
  function handleSpeedChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const newSpeed = parseFloat(target.value);
    hapticService?.trigger("selection");
    playbackController?.setSpeed(newSpeed);
  }

  // Close handler
  function handleClose() {
    hapticService?.trigger("selection");

    // Stop playback
    if (playbackController) {
      playbackController.dispose();
    }

    onClose();
  }

  // Notify parent when current beat changes
  $effect(() => {
    const currentBeat = panelState.currentBeat;
    if (panelState.isPlaying || currentBeat > 0) {
      // Convert from 0-based array index to beat number (1=first beat, 2=second beat, etc.)
      // Beat 0 in animation = beats[0] = beatNumber 1 in workspace
      const beatNumber = Math.floor(currentBeat) + 1;
      onCurrentBeatChange(beatNumber);
    }
  });

  // Cleanup on component destroy
  $effect(() => {
    return () => {
      if (playbackController) {
        playbackController.dispose();
      }
    };
  });

  function handleSheetClose() {
    handleClose();
  }

  // GIF Export handlers
  function openExportDialog() {
    hapticService?.trigger("selection");
    showExportDialog = true;
  }

  function closeExportDialog() {
    if (!isExporting) {
      showExportDialog = false;
    }
  }

  async function handleExportGif() {
    if (!gifExportService || !canvasRef || !playbackController) {
      console.error("Export services not ready");
      return;
    }

    try {
      isExporting = true;
      exportProgress = { progress: 0, stage: 'capturing' };

      // Get canvas element from AnimatorCanvas
      const canvasElements = document.querySelectorAll('.animation-panel canvas');
      const canvas = canvasElements[0] as HTMLCanvasElement;

      if (!canvas) {
        throw new Error('Canvas not found');
      }

      // Create manual exporter for frame-by-frame capture
      const { addFrame, finish, cancel } = await gifExportService.createManualExporter(
        canvas.width,
        canvas.height,
        {
          fps: 30,
          quality: 10,
          filename: `${panelState.sequenceWord || 'animation'}.gif`,
        }
      );

      // Store current state
      const wasPlaying = panelState.isPlaying;
      const currentBeat = panelState.currentBeat;

      // Stop animation
      if (wasPlaying) {
        playbackController.togglePlayback();
      }

      // Reset to beginning
      playbackController.jumpToBeat(0);

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture frames through one full loop
      const totalBeats = panelState.totalBeats;
      const framesPerBeat = 2; // Capture 2 frames per beat
      const totalFrames = totalBeats * framesPerBeat;
      const frameDelay = Math.floor(1000 / 30); // 30 FPS

      for (let i = 0; i < totalFrames; i++) {
        // Calculate beat progress
        const beat = (i / framesPerBeat);
        playbackController.jumpToBeat(beat);

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 50));

        // Capture frame
        addFrame(canvas, frameDelay);

        // Update progress
        exportProgress = {
          progress: i / totalFrames,
          stage: 'capturing',
          currentFrame: i,
          totalFrames,
        };
      }

      // Finish encoding
      exportProgress = { progress: 0, stage: 'encoding' };
      await finish();

      exportProgress = { progress: 1, stage: 'complete' };

      // Restore original state
      playbackController.jumpToBeat(currentBeat);
      if (wasPlaying) {
        playbackController.togglePlayback();
      }

      // Close dialog after short delay
      setTimeout(() => {
        closeExportDialog();
        isExporting = false;
        exportProgress = null;
      }, 1500);

    } catch (error) {
      console.error('GIF export failed:', error);
      exportProgress = {
        progress: 0,
        stage: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      isExporting = false;
    }
  }

  function cancelExport() {
    if (gifExportService) {
      gifExportService.cancelExport();
    }
    isExporting = false;
    exportProgress = null;
    closeExportDialog();
  }
</script>

<BottomSheet
  isOpen={show}
  on:close={handleSheetClose}
  labelledBy="animation-panel-title"
  closeOnBackdrop={false}
  focusTrap={false}
  lockScroll={false}
  showHandle={false}
  class="animation-panel-container glass-surface"
  backdropClass="animation-panel-backdrop"
>
  <div
    class="animation-panel"
    style={panelHeightStyle()}
    role="dialog"
    aria-labelledby="animation-panel-title"
  >
    <SheetDragHandle />
    <button class="close-button" onclick={handleClose} aria-label="Close animator">
      <i class="fas fa-times"></i>
    </button>

    <h2 id="animation-panel-title" class="sr-only">Animation Viewer</h2>

    {#if panelState.loading}
      <div class="loading-message">Loading animation...</div>
    {:else if panelState.error}
      <div class="error-message">{panelState.error}</div>
    {:else}
      <div class="canvas-container">
        <AnimatorCanvas
          blueProp={panelState.bluePropState}
          redProp={panelState.redPropState}
          gridVisible={true}
          gridMode={panelState.sequenceData?.gridMode}
          letter={currentLetter}
        />
      </div>

      <div class="controls-container">
        <div class="speed-control">
          <label for="speed-slider" class="speed-label">Speed</label>
          <input
            id="speed-slider"
            type="range"
            min="0.25"
            max="2"
            step="0.25"
            value={panelState.speed}
            oninput={handleSpeedChange}
            aria-label="Animation speed"
          />
          <span class="speed-value">{panelState.speed.toFixed(2)}x</span>
        </div>

        <button class="export-button" onclick={openExportDialog} aria-label="Export as GIF">
          <i class="fas fa-download"></i>
          <span>Export GIF</span>
        </button>
      </div>
    {/if}
  </div>
</BottomSheet>

<!-- GIF Export Dialog -->
{#if showExportDialog}
  <div
    class="export-dialog-backdrop"
    onclick={closeExportDialog}
    onkeydown={(e) => e.key === 'Escape' && closeExportDialog()}
    role="button"
    tabindex="0"
    aria-label="Close export dialog"
  >
    <div
      class="export-dialog"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <h3 id="export-dialog-title">Export Animation as GIF</h3>

      {#if !isExporting && !exportProgress}
        <p>Export your animation as an animated GIF file.</p>
        <div class="export-options">
          <div class="export-option">
            <strong>Quality:</strong> High
          </div>
          <div class="export-option">
            <strong>Frame Rate:</strong> 30 FPS
          </div>
          <div class="export-option">
            <strong>Duration:</strong> Full animation
          </div>
        </div>
        <div class="export-actions">
          <button class="export-action-button export-action-button--primary" onclick={handleExportGif}>
            <i class="fas fa-file-export"></i>
            Start Export
          </button>
          <button class="export-action-button" onclick={closeExportDialog}>
            Cancel
          </button>
        </div>
      {:else if exportProgress}
        <div class="export-progress">
          {#if exportProgress.stage === 'capturing'}
            <p>Capturing frames... ({exportProgress.currentFrame}/{exportProgress.totalFrames})</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {exportProgress.progress * 100}%"></div>
            </div>
          {:else if exportProgress.stage === 'encoding'}
            <p>Encoding GIF...</p>
            <div class="progress-bar">
              <div class="progress-fill progress-fill--indeterminate"></div>
            </div>
          {:else if exportProgress.stage === 'complete'}
            <p class="export-success">
              <i class="fas fa-check-circle"></i>
              Export complete! Your GIF is downloading.
            </p>
          {:else if exportProgress.stage === 'error'}
            <p class="export-error">
              <i class="fas fa-exclamation-circle"></i>
              Error: {exportProgress.error}
            </p>
            <button class="export-action-button" onclick={closeExportDialog}>
              Close
            </button>
          {/if}

          {#if isExporting && exportProgress.stage !== 'complete' && exportProgress.stage !== 'error'}
            <button class="export-action-button export-action-button--danger" onclick={cancelExport}>
              Cancel Export
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Use unified sheet system variables - transparent backdrop to allow workspace interaction */
  :global(.bottom-sheet.animation-panel-container) {
    --sheet-backdrop-bg: var(--backdrop-transparent);
    --sheet-backdrop-filter: var(--backdrop-blur-none);
    --sheet-backdrop-pointer-events: none;
    --sheet-bg: var(--sheet-bg-transparent);
    --sheet-filter: var(--glass-backdrop-strong);
    --sheet-border: var(--sheet-border-medium);
    --sheet-shadow: none;
    --sheet-pointer-events: auto;
    min-height: 300px;
  }

  :global(.bottom-sheet.animation-panel-container:hover) {
    box-shadow: none;
  }

  .animation-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 0 24px 24px 24px; /* No top padding - drag handle at top */
    padding-bottom: calc(24px + env(safe-area-inset-bottom));
    /* height set via inline style for reactive sizing */
    width: 100%;
    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1); /* Smooth height transitions */

    /* Mesh gradient animation - moved here from BottomSheet to avoid blocking slide transition */
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.15) 0%,
      rgba(118, 75, 162, 0.15) 25%,
      rgba(240, 147, 251, 0.15) 50%,
      rgba(245, 87, 108, 0.15) 75%,
      rgba(79, 172, 254, 0.15) 100%
    );
    background-size: 300% 300%;
    animation: meshGradientFlow 15s ease infinite;
  }

  /* Mesh Gradient Flow Animation - Subtle organic color movement */
  @keyframes meshGradientFlow {
    0%, 100% {
      background-position: 0% 50%;
    }
    25% {
      background-position: 50% 100%;
    }
    50% {
      background-position: 100% 50%;
    }
    75% {
      background-position: 50% 0%;
    }
  }

  .close-button {
    position: absolute;
    top: 12px; /* Aligned with drag handle area */
    right: 16px;
    width: var(--sheet-close-size-default);
    height: var(--sheet-close-size-default);
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15); /* More visible */
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 1); /* Full white for contrast */
    cursor: pointer;
    transition: all var(--sheet-transition-smooth);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px; /* Larger icon */
    z-index: 1000; /* Much higher z-index to ensure it's always on top */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* Shadow for visibility */
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .canvas-container {
    /* CRITICAL: Enable container queries for AnimatorCanvas */
    container-type: size;
    container-name: animator-canvas;
    flex: 1;
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }

  .controls-container {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    width: 100%;
  }

  .speed-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }

  #speed-slider {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;
    min-width: 80px;
  }

  #speed-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  #speed-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.5);
  }

  #speed-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  #speed-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 3px 8px rgba(59, 130, 246, 0.5);
  }

  .speed-value {
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    min-width: 45px;
    text-align: right;
  }

  /* Export Button */
  .export-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .export-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .export-button:active {
    transform: translateY(0);
  }

  .export-button i {
    font-size: 16px;
  }

  /* Export Dialog */
  .export-dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  }

  .export-dialog {
    background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.95));
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .export-dialog h3 {
    margin: 0 0 16px 0;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }

  .export-dialog p {
    margin: 0 0 16px 0;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .export-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  .export-option {
    display: flex;
    justify-content: space-between;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
  }

  .export-option strong {
    color: rgba(255, 255, 255, 1);
  }

  .export-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .export-action-button {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
  }

  .export-action-button--primary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  }

  .export-action-button--primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  .export-action-button--danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  }

  .export-action-button--danger:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }

  .export-action-button:not(.export-action-button--primary):not(.export-action-button--danger) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .export-action-button:not(.export-action-button--primary):not(.export-action-button--danger):hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .export-action-button i {
    margin-right: 6px;
  }

  .export-progress {
    text-align: center;
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
    margin: 16px 0;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    transition: width 0.3s ease;
    border-radius: 4px;
  }

  .progress-fill--indeterminate {
    width: 40%;
    animation: indeterminate 1.5s ease-in-out infinite;
  }

  @keyframes indeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(350%);
    }
  }

  .export-success {
    color: #10b981;
    font-weight: 600;
  }

  .export-success i {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
  }

  .export-error {
    color: #ef4444;
    font-weight: 600;
  }

  .export-error i {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
  }

  .loading-message,
  .error-message {
    padding: 2rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .error-message {
    color: rgba(255, 100, 100, 0.9);
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .animation-panel {
      padding: 0 16px 16px 16px; /* No top padding - drag handle at top */
      padding-bottom: calc(16px + env(safe-area-inset-bottom));
      gap: 12px;
    }

    .speed-control {
      padding: 10px 14px;
      gap: 10px;
    }

    .speed-label {
      font-size: 11px;
    }

    .speed-value {
      font-size: 12px;
      min-width: 42px;
    }
  }

  @media (max-width: 480px) {
    .animation-panel {
      padding: 0 12px 12px 12px; /* No top padding - drag handle at top */
      padding-bottom: calc(12px + env(safe-area-inset-bottom));
      gap: 8px;
    }

    .close-button {
      top: 12px;
      right: 12px;
      width: 44px;
      height: 44px;
      font-size: 18px;
    }

    .speed-control {
      padding: 8px 12px;
      gap: 8px;
    }

    .speed-label {
      font-size: 10px;
    }

    .speed-value {
      font-size: 11px;
      min-width: 40px;
    }

    #speed-slider {
      min-width: 60px;
    }
  }

  /* Very narrow viewports */
  @media (max-width: 400px) {
    .speed-control {
      padding: 6px 10px;
      gap: 6px;
    }

    .speed-label {
      display: none; /* Hide label to save space */
    }

    .speed-value {
      font-size: 10px;
      min-width: 35px;
    }

    #speed-slider {
      min-width: 50px;
    }
  }

  /* Landscape mobile: Adjust spacing */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .animation-panel {
      /* Height still calculated dynamically */
      padding: 0 12px 12px 12px; /* No top padding - drag handle at top */
      gap: 8px;
    }

    .canvas-container {
      max-width: 500px;
    }

    .controls-container {
      max-width: 350px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    :global(.animation-panel-container) {
      background: rgba(0, 0, 0, 0.95);
      border-top: 2px solid white;
    }

    .speed-control {
      background: rgba(255, 255, 255, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }
  }

  /* Reduced motion - disable gradient animation but keep static gradient */
  @media (prefers-reduced-motion: reduce) {
    .animation-panel {
      animation: none;
      background-position: 0% 50%;
    }

    .close-button,
    #speed-slider::-webkit-slider-thumb,
    #speed-slider::-moz-range-thumb {
      transition: none;
    }

    .close-button:hover,
    .close-button:active,
    #speed-slider::-webkit-slider-thumb:hover,
    #speed-slider::-moz-range-thumb:hover {
      transform: none;
    }

    /* Also disable BottomSheet slide transition for reduced motion */
    :global(.bottom-sheet.animation-panel-container) {
      transition: none;
    }
  }
</style>
