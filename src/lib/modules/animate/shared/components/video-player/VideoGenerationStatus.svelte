<!--
  VideoGenerationStatus.svelte

  Displays the progress indicator when a video is being generated.
  Shows current phase, percentage, frame count, and allows cancellation.
-->
<script lang="ts">
  import type { VideoRenderProgress } from "../../../services/contracts/IVideoPreRenderService";

  let {
    progress,
    onCancel,
  }: {
    progress: VideoRenderProgress;
    onCancel: () => void;
  } = $props();
</script>

<div class="video-generation-status">
  <div class="status-content">
    <div class="spinner"></div>
    <div class="status-text">
      {#if progress.phase === "rendering"}
        Generating video... {progress.percent.toFixed(0)}%
      {:else if progress.phase === "encoding"}
        Encoding video...
      {:else}
        Complete!
      {/if}
    </div>
    <button class="cancel-btn" onclick={onCancel}>Cancel</button>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: {progress.percent}%"></div>
  </div>
  <div class="status-detail">
    Frame {progress.currentFrame} / {progress.totalFrames}
  </div>
</div>

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
    to {
      transform: rotate(360deg);
    }
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
    min-height: 48px;
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
</style>
