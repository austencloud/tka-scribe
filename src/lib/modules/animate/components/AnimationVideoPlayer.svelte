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
import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import { getVideoPreRenderService } from "../services/implementations/VideoPreRenderService";
  import type {
    VideoRenderProgress,
    VideoRenderResult,
  } from "../services/contracts/IVideoPreRenderService";

  // Props
  let {
    sequenceData = null,
    isPlaying = $bindable(false),
    speed = 1.0,
    autoGenerateVideo = false,
    onVideoReady = () => {},
    onModeChange = () => {},
    onBeatChange = () => {},
  }: {
    sequenceData?: SequenceData | null;
    isPlaying?: boolean; 
    speed?: number;
    autoGenerateVideo?: boolean;
    onVideoReady?: (result: VideoRenderResult) => void;
    onModeChange?: (mode: "live" | "video") => void;
    onBeatChange?: (beat: number) => void;
  } = $props();

  // Animation frame ID for beat tracking
  let beatTrackingFrameId: number | null = null;

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

  // Clean up blob URLs and beat tracking on destroy
  onDestroy(() => {
    stopBeatTracking();
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
        startBeatTracking();
      } else {
        videoElement.pause();
        stopBeatTracking();
      }
    }
  });

  // Sync video playback rate with speed (BPM)
  // Video is generated at 60 BPM (1 beat = 1 second)
  // speed = 1.0 means 60 BPM, speed = 2.0 means 120 BPM
  $effect(() => {
    if (videoElement) {
      videoElement.playbackRate = speed;
      console.log(`📹 Video playbackRate set to: ${speed}`);
    }
  });

  /**
   * Start tracking current beat position from video playback
   * This allows the beat grid to stay in sync with video
   */
  function startBeatTracking() {
    if (beatTrackingFrameId !== null) return;

    const trackBeat = () => {
      if (videoElement && playbackMode === "video") {
        // Video is at 60 BPM base, so currentTime in seconds = currentBeat
        const currentBeat = videoElement.currentTime;
        onBeatChange(currentBeat);
      }
      beatTrackingFrameId = requestAnimationFrame(trackBeat);
    };

    beatTrackingFrameId = requestAnimationFrame(trackBeat);
  }

  /**
   * Stop tracking beat position
   */
  function stopBeatTracking() {
    if (beatTrackingFrameId !== null) {
      cancelAnimationFrame(beatTrackingFrameId);
      beatTrackingFrameId = null;
    }
  }

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
      // Auto-play video when switching to video mode
      // Use setTimeout to ensure the video element is visible first
      setTimeout(() => {
        if (videoElement) {
          videoElement.currentTime = 0;
          videoElement.play().catch((e) => {
            console.warn("Auto-play failed:", e);
          });
        }
      }, 50);
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

  // Handle video errors
  function handleVideoError(event: Event) {
    const video = event.target as HTMLVideoElement;
    const error = video.error;
    console.error("Video playback error:", {
      code: error?.code,
      message: error?.message,
      blobUrl: videoResult?.blobUrl,
      videoSize: videoResult?.videoBlob?.size,
    });
  }

  // Handle video can play
  function handleCanPlay() {
    console.log("📹 Video can play - ready for playback");
  }

  // Handle video loaded metadata
  function handleLoadedMetadata() {
    if (videoElement) {
      console.log("📹 Video metadata loaded:", {
        duration: videoElement.duration,
        videoWidth: videoElement.videoWidth,
        videoHeight: videoElement.videoHeight,
      });
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
    muted
    class="video-player"
    class:hidden={playbackMode !== "video"}
    onended={handleVideoEnded}
    onerror={handleVideoError}
    oncanplay={handleCanPlay}
    onloadedmetadata={handleLoadedMetadata}
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
    padding: 10px 14px;
    min-height: 44px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
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
    padding: 12px 16px;
    min-height: 48px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
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
    padding: 14px 20px;
    min-height: 48px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
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
    padding: 12px 18px;
    min-height: 48px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
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
