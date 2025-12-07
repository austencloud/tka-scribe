<!--
  VideoRecordPanel.svelte

  Camera recording panel with optional reference views (animation or grid).
  Layout adapts based on mobile vs desktop:
  - Desktop: Optional 50/50 split (camera / animation)
  - Mobile: Always 50/50 split (camera / grid OR animation)
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
  import type { ReferenceViewType } from "../state/video-record-settings.svelte";
  import ReferenceViewToggle from "./ReferenceViewToggle.svelte";
  import AnimationPreview from "./AnimationPreview.svelte";
  import GridPreview from "./GridPreview.svelte";

  let {
    sequence = null,
    onClose = () => {},
    onSave = () => {},
  }: {
    sequence?: SequenceData | null;
    onClose?: () => void;
    onSave?: (recording: RecordingResult) => void;
  } = $props();

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
  let recordingState = $state<"idle" | "recording" | "paused" | "stopped">(
    "idle"
  );
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
      // Mobile: user chooses grid or animation
      return settings.current.referenceView === "grid" ? "grid" : "animation";
    } else {
      // Desktop: only animation when enabled
      return settings.current.referenceView === "animation"
        ? "animation"
        : null;
    }
  });

  /**
   * Initialize camera
   */
  async function initializeCamera() {
    if (!cameraService) {
      cameraError = "Camera service not loaded";
      console.error("❌ Camera service not available");
      return;
    }

    try {
      console.log("📷 Initializing camera...");
      await cameraService.initialize({
        facingMode: "user",
        width: 1280,
        height: 720,
        frameRate: 30,
      });

      const stream = await cameraService.start();
      cameraStream = stream;
      cameraInitialized = true;
      console.log("✅ Camera initialized, stream ready");
    } catch (error) {
      console.error("Failed to initialize camera:", error);
      cameraError =
        error instanceof Error ? error.message : "Failed to access camera";
    }
  }

  // Attach stream to video element once both are ready
  $effect(() => {
    if (cameraStream && videoElement && !recordedVideo) {
      console.log("📹 Attaching stream to video element");
      videoElement.srcObject = cameraStream;
      videoElement.play().catch((error) => {
        console.error("Failed to play video:", error);
      });
    }
  });

  /**
   * Start recording
   */
  async function startRecording() {
    if (!videoElement?.srcObject) {
      console.error("No camera stream available");
      return;
    }

    try {
      const stream = videoElement.srcObject as MediaStream;

      recordingId = await recordService.startRecording(
        stream,
        {
          format: "webm",
          quality: 0.9,
          maxDuration: 120, // 2 minutes max
        },
        handleProgress
      );

      recordingState = "recording";
      console.log(`🔴 Recording started: ${recordingId}`);
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
        console.log("✅ Recording stopped successfully");

        // Pause camera stream during playback
        if (videoElement) {
          videoElement.pause();
        }
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

    // Resume camera preview
    if (videoElement) {
      videoElement.play();
    }
  }

  function saveRecording() {
    if (!recordedVideo) return;
    onSave(recordedVideo);
  }

  function handleProgress(progress: RecordingProgress) {
    recordingDuration = progress.currentDuration;
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function handleReferenceViewChange(view: ReferenceViewType) {
    settings.setReferenceView(view);
  }

  // Initialize
  onMount(async () => {
    detectLayout();
    if (browser) {
      window.addEventListener("resize", detectLayout);
    }

    // Load train module to get camera service
    try {
      console.log("📦 Loading train module for camera service...");
      await loadFeatureModule("train");
      cameraService = resolve<ICameraService>(TYPES.ICameraService);
      console.log("✅ Camera service loaded");
      await initializeCamera();
    } catch (error) {
      console.error("❌ Failed to load camera service:", error);
      cameraError = "Failed to load camera service";
    }
  });

  // Cleanup
  onDestroy(() => {
    if (recordingId) {
      recordService.cancelRecording(recordingId);
    }
    if (recordedVideo?.blobUrl) {
      URL.revokeObjectURL(recordedVideo.blobUrl);
    }
    if (browser) {
      window.removeEventListener("resize", detectLayout);
    }
    if (cameraService) {
      cameraService.stop();
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
  });
</script>

<div class="video-record-panel">
  {#if cameraError}
    <div class="error-message">
      <p>⚠️ Camera Error</p>
      <p>{cameraError}</p>
      <button onclick={() => window.location.reload()}>Retry</button>
    </div>
  {:else if !cameraInitialized}
    <div class="loading-message">
      <p>📷 Initializing camera...</p>
    </div>
  {:else}
    <!-- Reference View Toggle -->
    <div class="toggle-container">
      <ReferenceViewToggle
        {isMobile}
        currentView={settings.current.referenceView}
        onChange={handleReferenceViewChange}
      />
    </div>

    <!-- Split Layout Container -->
    <div class="split-container" class:has-reference={showReferencePanel}>
      <!-- Camera Section -->
      <div class="camera-section">
        <div class="video-container">
          {#if recordedVideo}
            <!-- Playback Mode -->
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
            <!-- Camera Preview Mode -->
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

      <!-- Reference Section (Animation or Grid) -->
      {#if showReferencePanel && activeReferenceView}
        <div class="reference-section">
          {#if activeReferenceView === "animation"}
            <AnimationPreview
              {sequence}
              settings={settings.current.animationSettings}
              onSettingsChange={(newSettings) => {
                settings.setAnimationSpeed(newSettings.speed);
                settings.setShowTrails(newSettings.showTrails);
                settings.setBlueMotionVisible(newSettings.blueMotionVisible);
                settings.setRedMotionVisible(newSettings.redMotionVisible);
              }}
            />
          {:else if activeReferenceView === "grid"}
            <GridPreview
              {sequence}
              settings={settings.current.gridSettings}
              onSettingsChange={(newSettings) => {
                settings.setGridAnimated(newSettings.animated);
                settings.setGridBpm(newSettings.bpm);
              }}
            />
          {/if}
        </div>
      {/if}
    </div>

    <!-- Recording Controls -->
    <div class="controls">
      {#if recordedVideo}
        <!-- Playback Controls -->
        <div class="playback-controls">
          <p class="duration">
            Duration: {formatDuration(recordedVideo.duration || 0)}
          </p>
          <div class="button-row">
            <button class="btn-secondary" onclick={discardRecording}>
              🔄 Record Again
            </button>
            <button class="btn-primary" onclick={saveRecording}>
              💾 Save
            </button>
          </div>
        </div>
      {:else if recordingState === "idle"}
        <!-- Ready to Record -->
        <button class="btn-record" onclick={startRecording}>
          🔴 Start Recording
        </button>
      {:else if recordingState === "recording"}
        <!-- Recording Active -->
        <div class="recording-controls">
          <p class="duration recording-indicator">
            🔴 {formatDuration(recordingDuration)}
          </p>
          <div class="button-row">
            <button class="btn-secondary" onclick={pauseRecording}>
              ⏸️ Pause
            </button>
            <button class="btn-primary" onclick={stopRecording}>
              ⏹️ Stop
            </button>
            <button class="btn-danger" onclick={cancelRecording}>
              ❌ Cancel
            </button>
          </div>
        </div>
      {:else if recordingState === "paused"}
        <!-- Recording Paused -->
        <div class="recording-controls">
          <p class="duration paused-indicator">
            ⏸️ {formatDuration(recordingDuration)}
          </p>
          <div class="button-row">
            <button class="btn-secondary" onclick={resumeRecording}>
              ▶️ Resume
            </button>
            <button class="btn-primary" onclick={stopRecording}>
              ⏹️ Stop
            </button>
            <button class="btn-danger" onclick={cancelRecording}>
              ❌ Cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .video-record-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 12px;
    padding: 16px;
    overflow: hidden;
  }

  /* Toggle Container */
  .toggle-container {
    flex-shrink: 0;
  }

  /* Split Layout Container */
  .split-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  /* Camera Section */
  .camera-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .split-container.has-reference .camera-section {
    flex: 1; /* 50% when reference panel shown */
  }

  /* Reference Section */
  .reference-section {
    flex: 1; /* 50% of split */
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  /* Video Container */
  .video-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
  }

  .video-preview {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: black;
  }

  /* Mirror camera preview for natural viewing */
  .video-preview.mirror {
    transform: scaleX(-1);
  }

  /* Controls */
  .controls {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .recording-controls,
  .playback-controls {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    width: 100%;
  }

  .button-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  /* Duration Display */
  .duration {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }

  .recording-indicator {
    color: #ef4444;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .paused-indicator {
    color: #f59e0b;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  /* Buttons */
  button {
    min-height: 52px;
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-record {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    min-width: 200px;
  }

  .btn-record:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }

  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .btn-danger {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .btn-danger:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.4);
  }

  button:active {
    transform: translateY(0);
  }

  /* Loading/Error States */
  .loading-message,
  .error-message {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    text-align: center;
    padding: 32px;
  }

  .loading-message p,
  .error-message p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .error-message p:first-child {
    font-size: 24px;
    font-weight: 600;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .video-record-panel {
      padding: 12px;
      gap: 8px;
    }

    .button-row {
      width: 100%;
    }

    button {
      flex: 1;
      min-width: 0;
    }

    .btn-record {
      min-width: 0;
      width: 100%;
    }
  }
</style>
