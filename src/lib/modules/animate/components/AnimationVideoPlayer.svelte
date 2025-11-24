<!--
  AnimationVideoPlayer.svelte

  Handles animation playback with two modes:
  1. Live Preview - Real-time rendering (shows immediately)
  2. Video Playback - Pre-rendered video (generated in background)

  Flow:
  1. User sees live preview immediately (real-time trail drawing)
  2. User can click "Generate Video" to start background rendering
  3. Progress indicator shows generation status
  4. When ready, user can switch to video playback
  5. Video plays back perfectly smooth, regardless of device
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { SequenceData } from "$shared";
  import {
    getVideoPreRenderService,
    type VideoRenderProgress,
    type VideoRenderResult,
  } from "../services/implementations/VideoPreRenderService";

  // Props
  let {
    sequenceData = null,
    isPlaying = $bindable(false),
    autoGenerateVideo = false,
    onVideoReady = () => {},
    onModeChange = () => {},
  }: {
    sequenceData?: SequenceData | null;
    isPlaying?: boolean;
    autoGenerateVideo?: boolean;
    onVideoReady?: (result: VideoRenderResult) => void;
    onModeChange?: (mode: "live" | "video") => void;
  } = $props();

  // State
  let playbackMode = $state<"live" | "video">("live");
  let videoResult = $state<VideoRenderResult | null>(null);
  let isGeneratingVideo = $state(false);
  let videoProgress = $state<VideoRenderProgress | null>(null);
  let videoElement: HTMLVideoElement | null = $state(null);

  // Service
  const videoService = getVideoPreRenderService();

  // Check for cached video on mount
  onMount(async () => {
    if (sequenceData) {
      const sequenceId = videoService.generateSequenceId(sequenceData);
      const cached = await videoService.getCachedVideo(sequenceId);
      if (cached?.success) {
        videoResult = cached;
        onVideoReady(cached);
      } else if (autoGenerateVideo) {
        startVideoGeneration();
      }
    }
  });

  // Clean up blob URLs on destroy
  onDestroy(() => {
    if (videoResult?.blobUrl) {
      URL.revokeObjectURL(videoResult.blobUrl);
    }
  });

  // Watch for sequence changes
  $effect(() => {
    if (sequenceData) {
      // Reset state for new sequence
      playbackMode = "live";
      videoResult = null;
      videoProgress = null;

      // Check for cached video
      const sequenceId = videoService.generateSequenceId(sequenceData);
      videoService.getCachedVideo(sequenceId).then((cached) => {
        if (cached?.success) {
          videoResult = cached;
          onVideoReady(cached);
        }
      });
    }
  });

  // Sync video playback with isPlaying
  $effect(() => {
    if (playbackMode === "video" && videoElement) {
      if (isPlaying) {
        videoElement.play();
      } else {
        videoElement.pause();
      }
    }
  });

  /**
   * Start generating video in the background
   * Uses programmatic frame-by-frame rendering for consistent quality
   */
  async function startVideoGeneration() {
    if (!sequenceData || isGeneratingVideo) return;

    isGeneratingVideo = true;
    videoProgress = {
      currentFrame: 0,
      totalFrames: 0,
      percent: 0,
      estimatedTimeRemaining: 0,
      phase: "rendering",
    };

    try {
      // Create a dummy canvas (the service uses its own offscreen canvas)
      const dummyCanvas = document.createElement("canvas");

      const result = await videoService.renderSequenceToVideo(
        sequenceData,
        dummyCanvas,
        {
          fps: 60,
          quality: 0.9,
          width: 500,
          height: 500,
        },
        (progress) => {
          videoProgress = progress;
        }
      );

      if (result.success) {
        videoResult = result;
        onVideoReady(result);
      } else {
        console.error("Video generation failed:", result.error);
      }
    } catch (error) {
      console.error("Video generation error:", error);
    } finally {
      isGeneratingVideo = false;
      videoProgress = null;
    }
  }

  function cancelVideoGeneration() {
    videoService.cancelRender();
    isGeneratingVideo = false;
    videoProgress = null;
  }

  function switchToVideo() {
    if (videoResult?.blobUrl) {
      playbackMode = "video";
      onModeChange("video");
    }
  }

  function switchToLive() {
    playbackMode = "live";
    onModeChange("live");
  }

  // Handle video ended event - loop playback
  function handleVideoEnded() {
    if (videoElement && isPlaying) {
      videoElement.currentTime = 0;
      videoElement.play();
    }
  }
</script>

<!-- Video generation status indicator -->
{#if isGeneratingVideo && videoProgress}
  <div class="video-generation-status">
    <div class="status-content">
      <div class="spinner"></div>
      <div class="status-text">
        {#if videoProgress.phase === "rendering"}
          Generating video... {videoProgress.percent.toFixed(0)}%
        {:else if videoProgress.phase === "encoding"}
          Encoding video...
        {:else}
          Complete!
        {/if}
      </div>
      <button class="cancel-btn" onclick={cancelVideoGeneration}>Cancel</button>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width: {videoProgress.percent}%"></div>
    </div>
    <div class="status-detail">
      Frame {videoProgress.currentFrame} / {videoProgress.totalFrames}
    </div>
  </div>
{/if}

<!-- Video ready notification -->
{#if videoResult?.success && playbackMode === "live" && !isGeneratingVideo}
  <div class="video-ready-notification">
    <span>Video ready!</span>
    <button class="switch-btn" onclick={switchToVideo}>
      Switch to Video
    </button>
  </div>
{/if}

<!-- Generate video button (when no video exists) -->
{#if !videoResult && !isGeneratingVideo && sequenceData}
  <button class="generate-video-btn" onclick={startVideoGeneration}>
    Generate Video
  </button>
{/if}

<!-- Mode toggle (when video exists) -->
{#if videoResult?.success}
  <div class="mode-toggle">
    <button
      class="mode-btn"
      class:active={playbackMode === "live"}
      onclick={switchToLive}
    >
      Live
    </button>
    <button
      class="mode-btn"
      class:active={playbackMode === "video"}
      onclick={switchToVideo}
    >
      Video
    </button>
  </div>
{/if}

<!-- Video element (hidden when in live mode) -->
{#if videoResult?.blobUrl}
  <video
    bind:this={videoElement}
    src={videoResult.blobUrl}
    playsinline
    class="video-player"
    class:hidden={playbackMode !== "video"}
    onended={handleVideoEnded}
  >
    <track kind="captions" />
  </video>
{/if}

<style>
  .video-generation-status {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    color: white;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    z-index: 20;
    min-width: 220px;
  }

  .status-content {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .status-text {
    flex: 1;
  }

  .status-detail {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 6px;
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4ade80, #22c55e);
    transition: width 0.2s ease;
  }

  .video-ready-notification {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 13px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .switch-btn {
    background: rgba(255, 255, 255, 0.25);
    border: none;
    color: white;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }

  .switch-btn:hover {
    background: rgba(255, 255, 255, 0.4);
  }

  .generate-video-btn {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    z-index: 20;
    transition: all 0.2s ease;
  }

  .generate-video-btn:hover {
    background: rgba(0, 0, 0, 0.85);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .mode-toggle {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 8px;
    padding: 4px;
    z-index: 20;
  }

  .mode-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    padding: 6px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .mode-btn:hover {
    color: white;
  }

  .mode-btn.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .video-player {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: inherit;
  }

  .video-player.hidden {
    display: none;
  }
</style>
