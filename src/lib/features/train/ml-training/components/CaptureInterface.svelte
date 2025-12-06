<!--
CaptureInterface.svelte

Data capture interface for ML training.
Records webcam frames at configurable FPS and stores them in IndexedDB.
Mobile-first: settings in a drawer, video preview takes priority.
Hybrid sync: saves locally first, then syncs to Firebase in background.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import {
    getDataCaptureService,
    type CaptureState,
  } from "../services/DataCaptureService";
  import {
    getFirebaseMLStorageService,
    type SyncProgress,
  } from "../services/FirebaseMLStorageService";
  import { getMLTrainingStorage } from "../services/MLTrainingStorageService";
  import { auth } from "$lib/shared/auth/firebase";
  import type { PropType, CaptureSession } from "../domain/models";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  interface Props {
    propType?: PropType;
    fps?: number;
    onSessionComplete?: (session: CaptureSession) => void;
    onOpenSettings?: () => void;
  }

  let {
    propType = "club",
    fps = 10,
    onSessionComplete,
    onOpenSettings,
  }: Props = $props();

  // Services
  const captureService = getDataCaptureService();
  const firebaseStorage = getFirebaseMLStorageService();
  const localStorage = getMLTrainingStorage();

  // State
  let videoContainer: HTMLDivElement;
  let videoElement: HTMLVideoElement | null = $state(null);
  let isInitialized = $state(false);
  let captureState = $state<CaptureState>({
    isRecording: false,
    isPaused: false,
    currentSession: null,
    frameCount: 0,
    elapsedMs: 0,
    lastError: null,
    queueDepth: 0,
    isBackpressured: false,
  });

  // Sync state
  let syncProgress = $state<SyncProgress | null>(null);
  let isSyncing = $derived(syncProgress?.status === "syncing");

  // Settings drawer state (mobile)
  let isSettingsOpen = $state(false);

  // Config
  let sessionName = $state(
    `${propType.charAt(0).toUpperCase() + propType.slice(1)} Capture`
  );
  let selectedPropType = $state<PropType>(propType);
  let selectedFps = $state(fps);

  // Derived
  let formattedTime = $derived(formatTime(captureState.elapsedMs));
  let canStartRecording = $derived(isInitialized && !captureState.isRecording);
  let canStopRecording = $derived(captureState.isRecording);

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  async function initialize() {
    try {
      captureService.setConfig({
        fps: selectedFps,
        propType: selectedPropType,
        name: sessionName,
      });

      const video = await captureService.initialize({
        fps: selectedFps,
        propType: selectedPropType,
        name: sessionName,
      });

      videoElement = video;

      if (videoElement && videoContainer) {
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        videoElement.style.transform = "scaleX(-1)"; // Mirror for user-facing
        videoContainer.appendChild(videoElement);
      }

      isInitialized = true;
    } catch (error) {
      console.error("Camera initialization failed:", error);
    }
  }

  async function startRecording() {
    if (!isInitialized) return;

    try {
      captureService.setConfig({
        fps: selectedFps,
        propType: selectedPropType,
        name: sessionName,
      });
      await captureService.startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
      captureState = {
        ...captureState,
        lastError:
          captureState.lastError ||
          (error instanceof Error
            ? error.message
            : "Unable to start recording"),
      };
    }
  }

  async function stopRecording() {
    try {
      const session = await captureService.stopRecording();
      if (session) {
        if (onSessionComplete) {
          onSessionComplete(session);
        }
        // Trigger background sync to Firebase
        syncSessionToFirebase(session);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      captureState = {
        ...captureState,
        lastError:
          captureState.lastError ||
          (error instanceof Error ? error.message : "Unable to stop recording"),
      };
    }
  }

  /**
   * Background sync session to Firebase Storage
   */
  async function syncSessionToFirebase(session: CaptureSession) {
    // Only sync if user is authenticated
    if (!auth.currentUser) {
      console.log("User not authenticated - skipping Firebase sync");
      return;
    }

    try {
      await localStorage.initialize();
      const frames = await localStorage.getFramesBySession(session.id);

      await firebaseStorage.uploadSession(
        session,
        frames,
        async (imageKey: string) => {
          const blob = await localStorage.getFrameImage(imageKey);
          return blob ?? null;
        },
        (progress) => {
          syncProgress = progress;
          console.log(
            `Sync progress: ${progress.progress}% (${progress.syncedFrames}/${progress.totalFrames})`
          );
        }
      );

      console.log("Session synced to Firebase successfully");
    } catch (error) {
      console.error("Firebase sync failed:", error);
      // Don't throw - sync failure shouldn't break the UI
      syncProgress = {
        sessionId: session.id,
        status: "error",
        progress: 0,
        totalFrames: 0,
        syncedFrames: 0,
        error: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  function togglePause() {
    if (captureState.isPaused) {
      captureService.resume();
    } else {
      captureService.pause();
    }
  }

  async function takeSnapshot() {
    if (!captureState.isRecording) return;
    try {
      await captureService.takeSnapshot();
    } catch (error) {
      console.error("Failed to take snapshot:", error);
      captureState = {
        ...captureState,
        lastError:
          captureState.lastError ||
          (error instanceof Error ? error.message : "Snapshot failed"),
      };
    }
  }

  function openSettings() {
    isSettingsOpen = true;
  }

  function closeSettings() {
    isSettingsOpen = false;
  }

  onMount(() => {
    // Subscribe to capture state changes
    const unsubscribe = captureService.onStateChange((state) => {
      captureState = state;
    });

    initialize();

    return () => {
      unsubscribe();
    };
  });

  onDestroy(() => {
    if (
      videoElement &&
      videoContainer &&
      videoElement.parentElement === videoContainer
    ) {
      videoContainer.removeChild(videoElement);
    }
    (async () => {
      try {
        await captureService.dispose();
      } catch (error) {
        console.error("Capture dispose failed:", error);
      }
    })();
  });
</script>

<div class="capture-interface">
  <!-- Video Preview (takes priority on mobile) -->
  <div class="video-section">
    <div class="video-wrapper">
      <div class="video-container" bind:this={videoContainer}>
        {#if !isInitialized}
          <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Initializing camera...</p>
          </div>
        {/if}

        {#if captureState.isRecording}
          <div class="recording-indicator">
            <span class="rec-dot"></span>
            <span>REC</span>
          </div>
        {/if}

        {#if captureState.lastError}
          <div class="error-overlay">
            <i class="fa fa-exclamation-triangle"></i>
            <p>{captureState.lastError}</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Stats Bar (inline with video) -->
    <div class="stats-bar">
      <div class="stat">
        <span class="value">{formattedTime}</span>
        <span class="label">Time</span>
      </div>
      <div class="stat">
        <span class="value">{captureState.frameCount}</span>
        <span class="label">Frames</span>
      </div>
      <div class="stat">
        <span class="value">{selectedFps}</span>
        <span class="label">FPS</span>
      </div>
      <div class="stat">
        <span class="value">{selectedPropType}</span>
        <span class="label">Prop</span>
      </div>
    </div>

    <!-- Sync Status Indicator -->
    {#if syncProgress}
      <div
        class="sync-status"
        class:syncing={isSyncing}
        class:error={syncProgress.status === "error"}
        class:synced={syncProgress.status === "synced"}
      >
        {#if isSyncing}
          <i class="fa fa-cloud-upload-alt"></i>
          <span>Syncing to cloud... {syncProgress.progress}%</span>
          <div class="sync-progress-bar">
            <div
              class="sync-progress-fill"
              style="width: {syncProgress.progress}%"
            ></div>
          </div>
        {:else if syncProgress.status === "synced"}
          <i class="fa fa-cloud"></i>
          <span>Synced to cloud</span>
        {:else if syncProgress.status === "error"}
          <i class="fa fa-exclamation-circle"></i>
          <span>Sync failed: {syncProgress.error}</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Recording Controls (fixed bottom on mobile) -->
  <div class="controls-bar">
    <!-- Settings button (opens drawer on mobile, or inline on desktop) -->
    {#if !captureState.isRecording}
      <button
        class="btn-settings mobile-only"
        onclick={openSettings}
        aria-label="Settings"
      >
        <i class="fa fa-cog"></i>
      </button>
    {/if}

    <!-- Main recording controls -->
    <div class="main-controls">
      {#if canStartRecording}
        <button
          class="btn-record"
          onclick={startRecording}
          disabled={!isInitialized}
          aria-label="Start Recording"
        >
          <i class="fa fa-circle"></i>
        </button>
      {:else if canStopRecording}
        <button
          class="btn-pause"
          onclick={togglePause}
          aria-label={captureState.isPaused ? "Resume" : "Pause"}
        >
          <i class="fa {captureState.isPaused ? 'fa-play' : 'fa-pause'}"></i>
        </button>

        <button
          class="btn-snapshot"
          onclick={takeSnapshot}
          aria-label="Take Snapshot"
        >
          <i class="fa fa-camera"></i>
        </button>

        <button
          class="btn-stop"
          onclick={stopRecording}
          aria-label="Stop Recording"
        >
          <i class="fa fa-stop"></i>
        </button>
      {/if}
    </div>

    <!-- Current prop indicator -->
    <div class="prop-indicator">
      <span class="prop-badge">{selectedPropType}</span>
    </div>
  </div>

  <!-- Desktop: Inline Settings Panel -->
  <div class="desktop-settings">
    <div class="config-panel">
      <h3>Session Settings</h3>

      <div class="config-field">
        <label for="session-name">Session Name</label>
        <input
          type="text"
          id="session-name"
          bind:value={sessionName}
          placeholder="Enter session name"
          disabled={captureState.isRecording}
        />
      </div>

      <div class="config-field">
        <label for="prop-type">Prop Type</label>
        <select
          id="prop-type"
          bind:value={selectedPropType}
          disabled={captureState.isRecording}
        >
          <option value="club">Club</option>
          <option value="staff">Staff</option>
          <option value="fan">Fan</option>
          <option value="hoop">Hoop</option>
          <option value="buugeng">Buugeng</option>
        </select>
      </div>

      <div class="config-field">
        <label for="fps">Capture FPS</label>
        <select
          id="fps"
          bind:value={selectedFps}
          disabled={captureState.isRecording}
        >
          <option value={5}>5 FPS (low)</option>
          <option value={10}>10 FPS (recommended)</option>
          <option value={15}>15 FPS (high)</option>
          <option value={30}>30 FPS (very high)</option>
        </select>
      </div>
    </div>

    <!-- Desktop Recording Controls -->
    <div class="desktop-controls">
      {#if canStartRecording}
        <button
          class="btn-record-desktop"
          onclick={startRecording}
          disabled={!isInitialized}
        >
          <i class="fa fa-circle"></i>
          Start Recording
        </button>
      {:else if canStopRecording}
        <div class="recording-active">
          <button class="btn-pause-desktop" onclick={togglePause}>
            <i class="fa {captureState.isPaused ? 'fa-play' : 'fa-pause'}"></i>
            {captureState.isPaused ? "Resume" : "Pause"}
          </button>

          <button class="btn-snapshot-desktop" onclick={takeSnapshot}>
            <i class="fa fa-camera"></i>
            Snapshot
          </button>

          <button class="btn-stop-desktop" onclick={stopRecording}>
            <i class="fa fa-stop"></i>
            Stop
          </button>
        </div>
      {/if}
    </div>

    <div class="workflow-info">
      <h4>📋 ML Training Workflow</h4>
      <ol>
        <li><strong>Capture:</strong> Record prop video frames</li>
        <li><strong>Label:</strong> Draw bounding boxes</li>
        <li><strong>Export:</strong> COCO format dataset</li>
        <li><strong>Train:</strong> MediaPipe Model Maker</li>
      </ol>
    </div>
  </div>
</div>

<!-- Mobile Settings Drawer -->
<Drawer
  bind:isOpen={isSettingsOpen}
  placement="bottom"
  showHandle={true}
  ariaLabel="Capture Settings"
>
  <div class="drawer-settings">
    <h3>Session Settings</h3>

    <div class="config-field">
      <label for="drawer-session-name">Session Name</label>
      <input
        type="text"
        id="drawer-session-name"
        bind:value={sessionName}
        placeholder="Enter session name"
        disabled={captureState.isRecording}
      />
    </div>

    <div class="config-row">
      <div class="config-field">
        <label for="drawer-prop-type">Prop Type</label>
        <select
          id="drawer-prop-type"
          bind:value={selectedPropType}
          disabled={captureState.isRecording}
        >
          <option value="club">Club</option>
          <option value="staff">Staff</option>
          <option value="fan">Fan</option>
          <option value="hoop">Hoop</option>
          <option value="buugeng">Buugeng</option>
        </select>
      </div>

      <div class="config-field">
        <label for="drawer-fps">FPS</label>
        <select
          id="drawer-fps"
          bind:value={selectedFps}
          disabled={captureState.isRecording}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={15}>15</option>
          <option value={30}>30</option>
        </select>
      </div>
    </div>

    <button class="btn-done" onclick={closeSettings}> Done </button>
  </div>
</Drawer>

<style>
  .capture-interface {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--bg-primary, #1a1a2e);
    color: var(--text-primary, #fff);
    overflow: hidden;
  }

  /* Video Section - Takes up available space */
  .video-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    min-height: 0;
  }

  .video-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }

  .video-container {
    width: 100%;
    height: 100%;
    max-width: min(100%, 100vh - 200px);
    max-height: min(100%, 100vh - 200px);
    aspect-ratio: 1 / 1;
    position: relative;
    background: #000;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  .loading-overlay,
  .error-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    gap: 1rem;
  }

  .error-overlay {
    color: #ff6b6b;
  }

  .spinner {
    width: 52px;
    height: 52px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .recording-indicator {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: rgba(239, 68, 68, 0.9);
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.9rem;
    animation: pulse 1s ease-in-out infinite;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  }

  .rec-dot {
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 50%;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Stats Bar - Compact */
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-top: 0.75rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }

  .stat .value {
    font-size: 1.25rem;
    font-weight: 700;
    font-family: "JetBrains Mono", monospace;
  }

  .stat .label {
    font-size: 0.7rem;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Controls Bar - Fixed at bottom */
  .controls-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    background: linear-gradient(
      180deg,
      rgba(26, 26, 46, 0.95) 0%,
      rgba(15, 15, 30, 0.98) 100%
    );
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .main-controls {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .main-controls button {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .main-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-record {
    width: 72px !important;
    height: 72px !important;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  }

  .btn-record:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
  }

  .btn-pause {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }

  .btn-snapshot {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
  }

  .btn-stop {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    color: white;
  }

  .btn-settings {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-settings:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .prop-indicator {
    display: flex;
    align-items: center;
  }

  .prop-badge {
    padding: 0.4rem 0.875rem;
    background: rgba(99, 102, 241, 0.2);
    border-radius: 20px;
    font-size: 0.85rem;
    color: #a5b4fc;
    text-transform: capitalize;
  }

  /* Desktop Settings - Side panel */
  .desktop-settings {
    display: none;
  }

  /* Mobile: Show settings button, hide desktop panel */
  .mobile-only {
    display: flex;
  }

  /* Drawer Settings */
  .drawer-settings {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .drawer-settings h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #a5b4fc;
  }

  .config-row {
    display: flex;
    gap: 1rem;
  }

  .config-row .config-field {
    flex: 1;
  }

  .config-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .config-field label {
    font-size: 0.85rem;
    font-weight: 500;
    opacity: 0.8;
  }

  .config-field input,
  .config-field select {
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: inherit;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .config-field input:focus,
  .config-field select:focus {
    outline: none;
    border-color: #6366f1;
    background: rgba(99, 102, 241, 0.1);
  }

  .config-field input:disabled,
  .config-field select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-done {
    margin-top: 0.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-done:hover {
    transform: translateY(-1px);
  }

  /* Desktop Layout */
  @media (min-width: 1024px) {
    .capture-interface {
      flex-direction: row;
      padding: 1.5rem;
      gap: 1.5rem;
    }

    .video-section {
      flex: 1;
      padding: 0;
    }

    .controls-bar {
      display: none;
    }

    .mobile-only {
      display: none;
    }

    .desktop-settings {
      display: flex;
      flex-direction: column;
      width: 320px;
      gap: 1.5rem;
    }

    .config-panel {
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .config-panel h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: #a5b4fc;
    }

    .workflow-info {
      padding: 1.25rem;
      background: linear-gradient(
        135deg,
        rgba(99, 102, 241, 0.1),
        rgba(139, 92, 246, 0.1)
      );
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 12px;
    }

    .workflow-info h4 {
      margin: 0 0 0.75rem 0;
      font-size: 0.95rem;
      color: #a5b4fc;
    }

    .workflow-info ol {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.85rem;
      line-height: 1.6;
      opacity: 0.9;
    }

    .workflow-info strong {
      color: #c4b5fd;
    }

    .desktop-controls {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .desktop-controls button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .desktop-controls button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-record-desktop {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
    }

    .btn-record-desktop:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }

    .recording-active {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .btn-pause-desktop {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
    }

    .btn-snapshot-desktop {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
    }

    .btn-stop-desktop {
      background: linear-gradient(135deg, #6b7280, #4b5563);
      color: white;
    }

    /* Desktop needs recording controls somewhere - add them to stats bar */
    .stats-bar {
      flex-direction: row;
      justify-content: space-between;
      padding: 1rem 1.5rem;
    }

    .video-section::after {
      content: "";
      display: block;
      margin-top: 1rem;
    }
  }

  /* Add desktop recording controls inside video section */
  @media (min-width: 1024px) {
    .video-wrapper {
      position: relative;
    }

    .video-wrapper::after {
      content: "";
      position: absolute;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }
  }

  /* Sync Status Indicator */
  .sync-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    margin: 0.5rem;
    border-radius: 10px;
    font-size: 0.85rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #93c5fd;
  }

  .sync-status.syncing {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    color: #93c5fd;
  }

  .sync-status.synced {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.3);
    color: #86efac;
  }

  .sync-status.error {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .sync-status i {
    font-size: 1rem;
  }

  .sync-progress-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-left: 0.5rem;
  }

  .sync-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
</style>
