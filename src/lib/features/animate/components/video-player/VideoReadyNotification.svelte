<!--
  VideoReadyNotification.svelte

  Notification banner that appears when a video is ready for playback.
  Allows user to switch from live preview to video mode.
-->
<script lang="ts">
  let {
    onSwitchToVideo,
  }: {
    onSwitchToVideo: () => void;
  } = $props();
</script>

<div class="video-ready-notification">
  <span>Video ready!</span>
  <button class="switch-btn" onclick={onSwitchToVideo}>
    Switch to Video
  </button>
</div>

<style>
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
    min-height: 52px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
  }

  .switch-btn:hover {
    background: rgba(255, 255, 255, 0.4);
  }
</style>
