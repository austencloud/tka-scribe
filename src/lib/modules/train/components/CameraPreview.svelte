<!--
CameraPreview.svelte

Camera feed component for the Train module.
Displays the camera feed and integrates with the CameraService.
Features frame processing loop for pose estimation and overlay support.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { CameraService } from "../services/implementations/CameraService";
  import type { ICameraService } from "../services/contracts/ICameraService";
  import type { Snippet } from "svelte";

  interface Props {
    onCameraReady?: () => void;
    onCameraError?: (error: string) => void;
    onFrame?: (video: HTMLVideoElement) => void;
    mirrored?: boolean;
    showControls?: boolean;
    children?: Snippet;
  }

  let {
    onCameraReady,
    onCameraError,
    onFrame,
    mirrored = true,
    showControls = true,
    children,
  }: Props = $props();

  let videoContainer: HTMLDivElement;
  let videoElement: HTMLVideoElement | null = $state(null);
  let cameraService: ICameraService | null = $state(null);
  let isInitializing = $state(true);
  let errorMessage = $state<string | null>(null);
  let isActive = $state(false);

  // Frame processing loop
  let animationFrameId: number | null = null;

  function processFrame() {
    if (videoElement && isActive && onFrame) {
      if (videoElement.readyState >= 2) {
        onFrame(videoElement);
      }
    }
    if (isActive) {
      animationFrameId = requestAnimationFrame(processFrame);
    }
  }

  async function initCamera() {
    isInitializing = true;
    errorMessage = null;

    try {
      cameraService = new CameraService();
      await cameraService.initialize({ facingMode: "user" });
      await cameraService.start();

      videoElement = cameraService.getVideoElement();

      if (videoElement && videoContainer) {
        // Style the video element
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "cover";
        if (mirrored) {
          videoElement.style.transform = "scaleX(-1)";
        }
        videoContainer.appendChild(videoElement);
      }

      isActive = true;
      isInitializing = false;

      // Start frame processing
      if (onFrame) {
        animationFrameId = requestAnimationFrame(processFrame);
      }

      onCameraReady?.();
    } catch (error) {
      isInitializing = false;
      const message =
        error instanceof Error ? error.message : "Failed to access camera";
      errorMessage = message;
      onCameraError?.(message);
    }
  }

  async function switchCamera() {
    if (cameraService) {
      try {
        await cameraService.switchCamera();
      } catch (error) {
        console.error("Failed to switch camera:", error);
      }
    }
  }

  function stopCamera() {
    isActive = false;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (cameraService) {
      cameraService.stop();
    }
    if (videoElement && videoContainer?.contains(videoElement)) {
      videoContainer.removeChild(videoElement);
    }
    videoElement = null;
  }

  onMount(() => {
    initCamera();
  });

  onDestroy(() => {
    stopCamera();
  });
</script>

<div class="camera-preview">
  <div class="video-container" bind:this={videoContainer}>
    {#if isInitializing}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Initializing camera...</p>
      </div>
    {/if}

    {#if errorMessage}
      <div class="error-state">
        <svg
          class="error-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p>{errorMessage}</p>
        <button class="retry-button" onclick={initCamera}> Try Again </button>
      </div>
    {/if}
  </div>

  {#if showControls && isActive && !errorMessage}
    <div class="controls">
      <button
        class="control-button"
        onclick={switchCamera}
        title="Switch Camera"
        aria-label="Switch Camera"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
          />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </button>
    </div>
  {/if}

  <!-- Render children for overlays (like GridOverlay) -->
  <div class="overlay-container">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .camera-preview {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--surface-darker, #0a0a0a);
    border-radius: var(--border-radius-lg, 12px);
    overflow: hidden;
  }

  .video-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .video-container :global(video) {
    border-radius: var(--border-radius-lg, 12px);
  }

  .loading-state,
  .error-state {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md, 16px);
    color: var(--foreground, #ffffff);
    background: rgba(0, 0, 0, 0.8);
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid var(--surface-light, rgba(255, 255, 255, 0.2));
    border-top-color: var(--primary, #3b82f6);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-icon {
    width: 48px;
    height: 48px;
    color: var(--error, #ef4444);
  }

  .error-state p {
    text-align: center;
    max-width: 80%;
    opacity: 0.9;
  }

  .retry-button {
    padding: var(--spacing-sm, 8px) var(--spacing-lg, 24px);
    background: var(--primary, #3b82f6);
    color: white;
    border: none;
    border-radius: var(--border-radius-md, 8px);
    cursor: pointer;
    font-size: var(--font-size-md, 16px);
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background: var(--primary-hover, #2563eb);
    transform: translateY(-2px);
  }

  .retry-button:active {
    transform: translateY(0);
  }

  .controls {
    position: absolute;
    bottom: var(--spacing-md, 16px);
    right: var(--spacing-md, 16px);
    display: flex;
    gap: var(--spacing-sm, 8px);
    z-index: 20;
  }

  .control-button {
    width: 48px;
    height: 48px;
    padding: 8px;
    background: var(--surface-glass, rgba(0, 0, 0, 0.6));
    backdrop-filter: blur(10px);
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
    border-radius: var(--border-radius-md, 8px);
    color: var(--foreground, #ffffff);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-button:hover {
    background: var(--surface-glass-hover, rgba(0, 0, 0, 0.8));
    border-color: var(--primary, #3b82f6);
    transform: translateY(-2px);
  }

  .control-button:active {
    transform: translateY(0);
  }

  .control-button svg {
    width: 100%;
    height: 100%;
  }

  .overlay-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 10;
  }

  .overlay-container :global(*) {
    pointer-events: auto;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .controls {
      bottom: var(--spacing-sm, 8px);
      right: var(--spacing-sm, 8px);
    }

    .control-button {
      width: 36px;
      height: 36px;
    }
  }
</style>
