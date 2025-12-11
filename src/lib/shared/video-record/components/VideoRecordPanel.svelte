<!--
  VideoRecordPanel.svelte

  Camera recording panel with optional reference views (animation or grid).
  Clean layout focused on camera + media with settings in a sheet.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { loadFeatureModule, resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ICameraService } from "$lib/features/train/services/contracts/ICameraService";
  import { getVideoRecordService } from "../services/implementations/VideoRecordService";
  import type {
    RecordingProgress,
    RecordingResult,
  } from "../services/contracts/IVideoRecordService";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { createVideoRecordSettings } from "../state/video-record-settings.svelte";
  import InlineAnimationPlayer from "$lib/features/discover/gallery/display/components/media-viewer/InlineAnimationPlayer.svelte";
  import GridPreview from "./GridPreview.svelte";
  import VideoRecordSettingsSheet from "./VideoRecordSettingsSheet.svelte";

  let {
    sequence = null,
    onClose = () => {},
    onSave = () => {},
  }: {
    sequence?: SequenceData | null;
    onClose?: () => void;
    onSave?: (recording: RecordingResult) => void;
  } = $props();

  // Share state
  let isSharing = $state(false);
  let settingsOpen = $state(false);

  // Services (lazy-loaded)
  let cameraService = $state<ICameraService | null>(null);
  const recordService = getVideoRecordService();

  // Settings
  const settings = createVideoRecordSettings();

  // Detect mobile layout
  let isMobile = $state(false);

  function detectLayout() {
    if (!browser) return;
    isMobile = window.innerWidth < 768;
  }

  // Camera state
  let cameraInitialized = $state(false);
  let cameraError = $state<string | null>(null);
  let videoElement = $state<HTMLVideoElement | null>(null);
  let cameraStream = $state<MediaStream | null>(null);

  // Recording state
  let recordingId = $state<string | null>(null);
  let recordingState = $state<"idle" | "recording" | "paused" | "stopped">("idle");
  let recordingDuration = $state(0);
  let recordedVideo = $state<RecordingResult | null>(null);
  let playbackVideoElement = $state<HTMLVideoElement | null>(null);

  // Computed: Should show reference panel?
  const showReferencePanel = $derived(
    isMobile ? true : settings.current.referenceView !== "none"
  );

  // Computed: Which reference view to show?
  const activeReferenceView = $derived.by(() => {
    if (!showReferencePanel) return null;
    if (isMobile) {
      return settings.current.referenceView === "grid" ? "grid" : "animation";
    } else {
      return settings.current.referenceView === "animation"
        ? "animation"
        : settings.current.referenceView === "grid"
          ? "grid"
          : null;
    }
  });

  /**
   * Initialize camera
   */
  async function initializeCamera() {
    if (!cameraService) {
      cameraError = "Camera service not loaded";
      return;
    }

    try {
      await cameraService.initialize({
        facingMode: "user",
        width: 1280,
        height: 720,
        frameRate: 30,
      });

      const stream = await cameraService.start();
      cameraStream = stream;
      cameraInitialized = true;
    } catch (error) {
      cameraError = error instanceof Error ? error.message : "Failed to access camera";
    }
  }

  // Attach stream to video element
  $effect(() => {
    if (cameraStream && videoElement && !recordedVideo) {
      videoElement.srcObject = cameraStream;
      videoElement.play().catch(() => {});
    }
  });

  /**
   * Recording controls
   */
  async function startRecording() {
    if (!videoElement?.srcObject) return;

    try {
      const stream = videoElement.srcObject as MediaStream;
      recordingId = await recordService.startRecording(
        stream,
        { format: "webm", quality: 0.9, maxDuration: 120 },
        handleProgress
      );
      recordingState = "recording";
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  }

  function pauseRecording() {
    if (!recordingId) return;
    recordService.pauseRecording(recordingId);
    recordingState = "paused";
  }

  function resumeRecording() {
    if (!recordingId) return;
    recordService.resumeRecording(recordingId);
    recordingState = "recording";
  }

  async function stopRecording() {
    if (!recordingId) return;

    try {
      const result = await recordService.stopRecording(recordingId);
      if (result.success) {
        recordedVideo = result;
        recordingState = "stopped";
        if (videoElement) videoElement.pause();
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  }

  function cancelRecording() {
    if (!recordingId) return;
    recordService.cancelRecording(recordingId);
    recordingId = null;
    recordingState = "idle";
    recordingDuration = 0;
  }

  function discardRecording() {
    if (recordedVideo?.blobUrl) {
      URL.revokeObjectURL(recordedVideo.blobUrl);
    }
    recordedVideo = null;
    recordingId = null;
    recordingState = "idle";
    recordingDuration = 0;
    if (videoElement) videoElement.play();
  }

  function saveRecording() {
    if (!recordedVideo) return;
    onSave(recordedVideo);
  }

  async function shareRecording() {
    if (!recordedVideo || isSharing || !navigator.share) return;

    try {
      isSharing = true;
      const sequenceName = sequence?.word || sequence?.name || "recording";

      if (recordedVideo.blob && navigator.canShare) {
        const filename = `tka-${sequenceName}-${Date.now()}.webm`;
        const file = new File([recordedVideo.blob], filename, { type: "video/webm" });
        const shareData: ShareData = {
          title: `TKA Recording: ${sequenceName}`,
          text: `Check out my flow recording: ${sequenceName}`,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      await navigator.share({
        title: `TKA Recording: ${sequenceName}`,
        text: `Check out my flow recording: ${sequenceName}`,
        url: window.location.href,
      });
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Failed to share:", error);
      }
    } finally {
      isSharing = false;
    }
  }

  function handleProgress(progress: RecordingProgress) {
    recordingDuration = progress.currentDuration;
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Initialize
  onMount(async () => {
    detectLayout();
    if (browser) {
      window.addEventListener("resize", detectLayout);
    }

    try {
      await loadFeatureModule("train");
      cameraService = resolve<ICameraService>(TYPES.ICameraService);
      await initializeCamera();
    } catch (error) {
      cameraError = "Failed to load camera service";
    }
  });

  // Cleanup
  onDestroy(() => {
    if (recordingId) recordService.cancelRecording(recordingId);
    if (recordedVideo?.blobUrl) URL.revokeObjectURL(recordedVideo.blobUrl);
    if (browser) window.removeEventListener("resize", detectLayout);
    if (cameraService) cameraService.stop();
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  });
</script>

<div class="video-record-panel">
  {#if cameraError}
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Camera Error</p>
      <p class="error-detail">{cameraError}</p>
      <button class="retry-btn" onclick={() => window.location.reload()}>
        <i class="fas fa-redo"></i> Retry
      </button>
    </div>
  {:else if !cameraInitialized}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Initializing camera...</p>
    </div>
  {:else}
    <!-- Settings Button (Top Right) -->
    <button class="settings-fab" onclick={() => settingsOpen = true} aria-label="Settings">
      <i class="fas fa-cog"></i>
    </button>

    <!-- Main Content: Split View -->
    <div class="split-view" class:has-reference={showReferencePanel}>
      <!-- Camera Section -->
      <div class="media-panel camera-panel">
        <div class="panel-label">
          <i class="fas fa-video"></i>
          Camera
        </div>
        <div class="video-wrapper">
          <div class="square-crop">
            {#if recordedVideo}
              <!-- svelte-ignore a11y_media_has_caption -->
              <video
                bind:this={playbackVideoElement}
                src={recordedVideo.blobUrl}
                controls
                autoplay
                loop
                class="video-preview"
              ></video>
            {:else}
              <!-- svelte-ignore a11y_media_has_caption -->
              <video
                bind:this={videoElement}
                autoplay
                playsinline
                muted
                class="video-preview mirror"
              ></video>
            {/if}
          </div>
        </div>
      </div>

      <!-- Reference Section -->
      {#if showReferencePanel && activeReferenceView && sequence}
        <div class="media-panel reference-panel">
          <div class="panel-label">
            <i class="fas {activeReferenceView === 'animation' ? 'fa-play-circle' : 'fa-th'}"></i>
            {activeReferenceView === "animation" ? "Animation" : "Grid"}
          </div>
          <div class="reference-wrapper">
            {#if activeReferenceView === "animation"}
              <InlineAnimationPlayer {sequence} autoPlay={true} />
            {:else if activeReferenceView === "grid"}
              <GridPreview
                {sequence}
                settings={settings.current.gridSettings}
                onSettingsChange={(s) => {
                  settings.setGridAnimated(s.animated);
                  settings.setGridBpm(s.bpm);
                }}
              />
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- Recording Controls (in layout flow) -->
    <div class="controls-bar">
      {#if recordedVideo}
        <!-- Playback State -->
        <div class="control-group">
          <span class="duration-badge">{formatDuration(recordedVideo.duration || 0)}</span>
          <div class="control-buttons">
            <button class="control-btn secondary" onclick={discardRecording} aria-label="Record Again">
              <i class="fas fa-redo"></i>
            </button>
            <button class="control-btn primary" onclick={shareRecording} disabled={isSharing} aria-label="Share">
              <i class="fas {isSharing ? 'fa-spinner fa-spin' : 'fa-share-nodes'}"></i>
            </button>
            <button class="control-btn success" onclick={saveRecording} aria-label="Save">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
      {:else if recordingState === "idle"}
        <!-- Ready to Record -->
        <button class="record-btn" onclick={startRecording} aria-label="Start Recording">
          <span class="record-dot"></span>
        </button>
      {:else if recordingState === "recording"}
        <!-- Recording -->
        <div class="control-group">
          <span class="duration-badge recording">
            <i class="fas fa-circle pulse"></i>
            {formatDuration(recordingDuration)}
          </span>
          <div class="control-buttons">
            <button class="control-btn secondary" onclick={pauseRecording} aria-label="Pause">
              <i class="fas fa-pause"></i>
            </button>
            <button class="control-btn primary" onclick={stopRecording} aria-label="Stop">
              <i class="fas fa-stop"></i>
            </button>
            <button class="control-btn danger" onclick={cancelRecording} aria-label="Cancel">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      {:else if recordingState === "paused"}
        <!-- Paused -->
        <div class="control-group">
          <span class="duration-badge paused">
            <i class="fas fa-pause"></i>
            {formatDuration(recordingDuration)}
          </span>
          <div class="control-buttons">
            <button class="control-btn success" onclick={resumeRecording} aria-label="Resume">
              <i class="fas fa-play"></i>
            </button>
            <button class="control-btn primary" onclick={stopRecording} aria-label="Stop">
              <i class="fas fa-stop"></i>
            </button>
            <button class="control-btn danger" onclick={cancelRecording} aria-label="Cancel">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Settings Sheet -->
<VideoRecordSettingsSheet
  isOpen={settingsOpen}
  {isMobile}
  referenceView={settings.current.referenceView}
  animationSettings={settings.current.animationSettings}
  gridSettings={settings.current.gridSettings}
  onClose={() => settingsOpen = false}
  onReferenceViewChange={(v) => settings.setReferenceView(v)}
  onAnimationSettingsChange={(s) => {
    settings.setAnimationSpeed(s.speed);
    settings.setShowTrails(s.showTrails);
    settings.setBlueMotionVisible(s.blueMotionVisible);
    settings.setRedMotionVisible(s.redMotionVisible);
  }}
  onGridSettingsChange={(s) => {
    settings.setGridAnimated(s.animated);
    settings.setGridBpm(s.bpm);
  }}
/>

<style>
  .video-record-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
  }

  /* Settings FAB */
  .settings-fab {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 10;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .settings-fab:hover {
    background: rgba(0, 0, 0, 0.7);
    color: white;
    transform: rotate(45deg);
  }

  /* Split View */
  .split-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 8px;
    min-height: 0;
  }

  .split-view.has-reference .media-panel {
    flex: 1;
    min-height: 0;
  }

  .split-view:not(.has-reference) .camera-panel {
    flex: 1;
  }

  /* Media Panels */
  .media-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.4);
  }

  .panel-label {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .panel-label i {
    font-size: 10px;
  }

  .video-wrapper,
  .reference-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
  }

  /* Square crop container for video */
  .square-crop {
    position: relative;
    width: 100%;
    max-width: 100%;
    aspect-ratio: 1 / 1;
    overflow: hidden;
    border-radius: 8px;
    background: black;
  }

  .video-preview {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 100%;
    min-height: 100%;
    width: auto;
    height: auto;
    object-fit: cover;
    background: black;
  }

  .video-preview.mirror {
    transform: translate(-50%, -50%) scaleX(-1);
  }

  /* Controls Bar (in layout flow) */
  .controls-bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    background: rgba(0, 0, 0, 0.4);
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
  }

  .duration-badge {
    font-size: 14px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .duration-badge.recording {
    color: #ef4444;
  }

  .duration-badge.paused {
    color: #f59e0b;
  }

  .duration-badge i.pulse {
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .control-buttons {
    display: flex;
    gap: 8px;
  }

  .control-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-btn.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  .control-btn.secondary {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .control-btn.success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
  }

  .control-btn.danger {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .control-btn:hover:not(:disabled) {
    transform: scale(1.08);
  }

  .control-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Record Button */
  .record-btn {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(12px);
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .record-btn:hover {
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  .record-btn:active {
    transform: scale(0.95);
  }

  .record-dot {
    width: 32px;
    height: 32px;
    background: #ef4444;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .record-btn:hover .record-dot {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
  }

  /* Loading/Error States */
  .loading-state,
  .error-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 32px;
    text-align: center;
  }

  .loading-state p,
  .error-state p {
    margin: 0;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
  }

  .error-state i {
    font-size: 48px;
    color: #f59e0b;
  }

  .error-detail {
    font-size: 14px !important;
    color: rgba(255, 255, 255, 0.5) !important;
  }

  .retry-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: rgba(59, 130, 246, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Responsive */
  @media (min-width: 768px) {
    .split-view.has-reference {
      flex-direction: row;
    }

    .square-crop {
      max-height: 100%;
      width: auto;
      height: 100%;
    }
  }

  @media (max-width: 640px) {
    .split-view {
      gap: 6px;
      padding: 6px;
    }

    .controls-bar {
      padding: 8px;
    }

    .control-btn {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }

    .record-btn {
      width: 56px;
      height: 56px;
    }

    .record-dot {
      width: 24px;
      height: 24px;
    }

    .control-group {
      gap: 8px;
      padding: 6px 12px;
    }
  }
</style>
