<!--
  PerformancePreview.svelte

  Performance video format preview with inline controls.
  Displays camera feed or uploaded video with record/upload toggle.

  Features:
  - Live camera preview using ICameraManager
  - Video recording using VideoRecorder
  - File upload with video preview
  - Record/Upload mode toggle
  - Recording state with duration indicator

  Domain: Share Hub - Single Media - Performance Video Format
-->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { getShareHubState } from '../../state/share-hub-state.svelte';
  import { loadFeatureModule, resolve } from '$lib/shared/inversify/di';
  import { TYPES } from '$lib/shared/inversify/types';
  import type { ICameraManager } from '$lib/features/train/services/contracts/ICameraManager';
  import { getVideoRecorder } from '$lib/shared/video-record/services/implementations/VideoRecorder';
  import type { RecordingProgress, RecordingResult } from '$lib/shared/video-record/services/contracts/IVideoRecorder';

  const hubState = getShareHubState();

  // Services
  let cameraService = $state<ICameraManager | null>(null);
  const recordService = getVideoRecorder();

  // Camera state
  let loading = $state(true);
  let error = $state<string | null>(null);
  let cameraInitialized = $state(false);
  let videoElement = $state<HTMLVideoElement | null>(null);
  let cameraStream = $state<MediaStream | null>(null);

  // Recording state
  let recordingId = $state<string | null>(null);
  let recordingState = $state<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  let recordingDuration = $state(0);
  let recordedVideo = $state<RecordingResult | null>(null);
  let playbackVideoElement = $state<HTMLVideoElement | null>(null);

  // Upload state
  let fileInputElement = $state<HTMLInputElement | null>(null);
  let uploadedVideoUrl = $state<string | null>(null);

  // Derived
  const modeIcon = $derived(
    hubState.performanceSettings.mode === 'record' ? 'fa-video' : 'fa-upload'
  );

  const modeLabel = $derived(
    hubState.performanceSettings.mode === 'record' ? 'Record' : 'Upload'
  );

  // Initialize camera
  async function initializeCamera() {
    if (!cameraService) {
      error = 'Camera service not loaded';
      return;
    }

    try {
      await cameraService.initialize({
        facingMode: 'user',
        width: 1280,
        height: 720,
        frameRate: 30,
      });

      const stream = await cameraService.start();
      cameraStream = stream;
      cameraInitialized = true;
      error = null;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to access camera';
    }
  }

  // Attach stream to video element
  $effect(() => {
    if (cameraStream && videoElement && !recordedVideo) {
      videoElement.srcObject = cameraStream;
      videoElement.play().catch(() => {});
    }
  });

  // Recording controls
  async function startRecording() {
    if (!videoElement?.srcObject) return;

    try {
      const stream = videoElement.srcObject as MediaStream;
      recordingId = await recordService.startRecording(
        stream,
        { format: 'webm', quality: 0.9, maxDuration: 120 },
        handleProgress
      );
      recordingState = 'recording';
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  }

  async function stopRecording() {
    if (!recordingId) return;

    try {
      const result = await recordService.stopRecording(recordingId);
      if (result.success) {
        recordedVideo = result;
        recordingState = 'stopped';
        if (videoElement) videoElement.pause();
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  }

  function cancelRecording() {
    if (!recordingId) return;
    recordService.cancelRecording(recordingId);
    recordingId = null;
    recordingState = 'idle';
    recordingDuration = 0;
  }

  function discardRecording() {
    if (recordedVideo?.blobUrl) {
      URL.revokeObjectURL(recordedVideo.blobUrl);
    }
    recordedVideo = null;
    recordingId = null;
    recordingState = 'idle';
    recordingDuration = 0;
    if (videoElement) videoElement.play();
  }

  function handleProgress(progress: RecordingProgress) {
    recordingDuration = progress.currentDuration;
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Upload handling
  function triggerFileSelect() {
    fileInputElement?.click();
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Clean up old URL
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }

    // Update state
    hubState.performanceSettings = {
      ...hubState.performanceSettings,
      uploadedFile: file,
    };
    uploadedVideoUrl = URL.createObjectURL(file);
  }

  function clearUploadedFile() {
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
      uploadedVideoUrl = null;
    }
    hubState.performanceSettings = {
      ...hubState.performanceSettings,
      uploadedFile: null,
    };
  }

  // Mode toggle
  function toggleMode() {
    const newMode = hubState.performanceSettings.mode === 'record' ? 'upload' : 'record';
    hubState.performanceSettings = { ...hubState.performanceSettings, mode: newMode };

    // Stop any recording when switching modes
    if (recordingState === 'recording') {
      cancelRecording();
    }
  }

  function handleSettingsClick() {
    hubState.settingsPanelOpen = true;
    hubState.settingsContext = { format: 'performance' };
  }

  // Initialize
  onMount(async () => {
    if (!browser) return;

    try {
      await loadFeatureModule('train');
      cameraService = resolve<ICameraManager>(TYPES.ICameraManager);
      await initializeCamera();
    } catch (err) {
      error = 'Failed to load camera service';
    } finally {
      loading = false;
    }

    // Create URL for uploaded file if exists
    if (hubState.performanceSettings.uploadedFile) {
      uploadedVideoUrl = URL.createObjectURL(hubState.performanceSettings.uploadedFile);
    }
  });

  // Cleanup
  onDestroy(() => {
    if (recordingId) recordService.cancelRecording(recordingId);
    if (recordedVideo?.blobUrl) URL.revokeObjectURL(recordedVideo.blobUrl);
    if (uploadedVideoUrl) URL.revokeObjectURL(uploadedVideoUrl);
    if (cameraService) cameraService.stop();
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
  });
</script>

<div class="performance-preview">
  <!-- Hidden file input for uploads -->
  <input
    bind:this={fileInputElement}
    type="file"
    accept="video/*"
    class="hidden-input"
    onchange={handleFileSelect}
  />

  <!-- Preview Area -->
  <div class="preview-area">
    {#if hubState.performanceSettings.mode === 'record'}
      <!-- Camera Mode -->
      {#if loading}
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Initializing camera...</p>
        </div>
      {:else if error}
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button class="retry-button" onclick={initializeCamera}>
            <i class="fas fa-redo"></i> Retry
          </button>
        </div>
      {:else if recordedVideo}
        <!-- Recorded video playback -->
        <div class="video-container">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={playbackVideoElement}
            src={recordedVideo.blobUrl}
            controls
            autoplay
            loop
            class="video-preview"
          ></video>
        </div>
      {:else if cameraInitialized}
        <!-- Live camera feed -->
        <div class="video-container">
          {#if recordingState === 'recording'}
            <div class="recording-indicator">
              <i class="fas fa-circle"></i>
              <span>{formatDuration(recordingDuration)}</span>
            </div>
          {/if}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={videoElement}
            autoplay
            playsinline
            muted
            class="video-preview mirror"
          ></video>
        </div>
      {/if}
    {:else}
      <!-- Upload Mode -->
      {#if uploadedVideoUrl}
        <div class="video-container">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            src={uploadedVideoUrl}
            controls
            class="video-preview"
          ></video>
          <button class="clear-upload" onclick={clearUploadedFile} aria-label="Remove video">
            <i class="fas fa-times"></i>
          </button>
        </div>
      {:else}
        <button class="upload-dropzone" onclick={triggerFileSelect}>
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Click to upload a video</p>
          <span class="hint">MP4, WebM, MOV (max 100MB)</span>
        </button>
      {/if}
    {/if}
  </div>

  <!-- Inline Controls -->
  <div class="inline-controls">
    <button class="control-button mode-toggle" onclick={toggleMode}>
      <i class="fas {modeIcon}"></i>
      <span>{modeLabel}</span>
    </button>

    {#if hubState.performanceSettings.mode === 'record'}
      {#if recordedVideo}
        <!-- Playback controls -->
        <button class="control-button secondary" onclick={discardRecording}>
          <i class="fas fa-redo"></i>
          <span>Re-record</span>
        </button>
      {:else if recordingState === 'idle'}
        <button class="control-button record-button" onclick={startRecording} disabled={!cameraInitialized}>
          <i class="fas fa-circle"></i>
          <span>Record</span>
        </button>
      {:else if recordingState === 'recording'}
        <div class="recording-controls">
          <span class="duration-badge">
            <i class="fas fa-circle pulse"></i>
            {formatDuration(recordingDuration)}
          </span>
          <button class="control-button stop-button" onclick={stopRecording} aria-label="Stop recording">
            <i class="fas fa-stop"></i>
          </button>
          <button class="control-button cancel-button" onclick={cancelRecording} aria-label="Cancel recording">
            <i class="fas fa-times"></i>
          </button>
        </div>
      {/if}
    {:else}
      {#if !uploadedVideoUrl}
        <button class="control-button upload-button" onclick={triggerFileSelect}>
          <i class="fas fa-folder-open"></i>
          <span>Browse</span>
        </button>
      {/if}
    {/if}

    <button
      class="control-button settings-button"
      onclick={handleSettingsClick}
      aria-label="Performance video settings"
    >
      <i class="fas fa-cog"></i>
    </button>
  </div>
</div>

<style>
  .performance-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
  }

  .hidden-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .preview-area {
    flex: 1;
    min-height: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Video container */
  .video-container {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: black;
  }

  .video-preview {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: black;
  }

  .video-preview.mirror {
    transform: scaleX(-1);
  }

  /* Recording indicator overlay */
  .recording-indicator {
    position: absolute;
    top: 16px;
    left: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(220, 38, 38, 0.9);
    border-radius: 20px;
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: white;
    z-index: 10;
  }

  .recording-indicator i {
    font-size: 10px;
    animation: blink 1s ease-in-out infinite;
  }

  /* Clear upload button */
  .clear-upload {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .clear-upload:hover {
    background: rgba(220, 38, 38, 0.8);
    border-color: rgba(220, 38, 38, 0.8);
  }

  /* Upload dropzone */
  .upload-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    height: 100%;
    background: transparent;
    border: 2px dashed var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-radius: 8px;
    margin: 16px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .upload-dropzone:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
  }

  .upload-dropzone i {
    font-size: 48px;
    opacity: 0.5;
  }

  .upload-dropzone p {
    font-size: var(--font-size-min, 14px);
    margin: 0;
    font-weight: 500;
  }

  .upload-dropzone .hint {
    font-size: var(--font-size-compact, 12px);
    opacity: 0.7;
  }

  /* Loading/Error states */
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    padding: 32px;
  }

  .loading-state p,
  .error-state p {
    font-size: var(--font-size-min, 14px);
    margin: 0;
  }

  .error-state i {
    font-size: 48px;
    opacity: 0.5;
    color: var(--semantic-warning, #f59e0b);
  }

  .spinner {
    width: 44px;
    height: 44px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: var(--theme-accent, #4a9eff);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .retry-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-radius: 8px;
    color: var(--theme-text, white);
    font-size: var(--font-size-min, 14px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.15));
  }

  /* Inline controls */
  .inline-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .recording-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .duration-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(220, 38, 38, 0.2);
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: rgb(252, 165, 165);
  }

  .duration-badge i.pulse {
    animation: blink 1s ease-in-out infinite;
    color: rgb(220, 38, 38);
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    color: var(--theme-text, white);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .control-button i {
    font-size: 16px;
  }

  .control-button:hover:not(:disabled) {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-button:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .mode-toggle {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
  }

  .mode-toggle:hover {
    background: var(--theme-accent-hover, #3d8de6);
  }

  .record-button {
    background: rgba(220, 38, 38, 0.2);
    border-color: rgba(220, 38, 38, 0.5);
    color: rgb(252, 165, 165);
  }

  .record-button:hover:not(:disabled) {
    background: rgba(220, 38, 38, 0.3);
    border-color: rgba(220, 38, 38, 0.7);
  }

  .stop-button {
    background: rgb(220, 38, 38);
    border-color: rgb(220, 38, 38);
    color: white;
    padding: 8px 12px;
  }

  .stop-button:hover {
    background: rgb(185, 28, 28);
  }

  .cancel-button {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    padding: 8px 12px;
  }

  .upload-button {
    background: var(--theme-accent, rgba(74, 158, 255, 0.2));
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .secondary {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .settings-button {
    margin-left: auto;
  }

  /* Animations */
  @keyframes blink {
    0%, 50%, 100% { opacity: 1; }
    25%, 75% { opacity: 0.3; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .inline-controls {
      gap: 8px;
    }

    .control-button span {
      display: none;
    }

    .control-button {
      padding: 8px 12px;
    }

    .upload-dropzone {
      margin: 8px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-button,
    .retry-button,
    .clear-upload,
    .upload-dropzone {
      transition: none;
    }

    .recording-indicator i,
    .duration-badge i.pulse,
    .spinner {
      animation: none;
    }
  }
</style>
