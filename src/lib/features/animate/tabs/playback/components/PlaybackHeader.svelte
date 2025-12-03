<!--
  PlaybackHeader.svelte

  Header bar with mode switching and save/share controls.
-->
<script lang="ts">
  import type { AnimateMode } from "../../../shared/state/animate-module-state.svelte";

  let {
    currentMode,
    onChangeMode,
    onSave,
    onShare,
  }: {
    currentMode: AnimateMode;
    onChangeMode: () => void;
    onSave: () => void;
    onShare: () => void;
  } = $props();

  // Format mode name for display
  const modeLabel = $derived(() => {
    const labels: Record<AnimateMode, string> = {
      single: "Single",
      tunnel: "Tunnel",
      mirror: "Mirror",
      grid: "Grid",
    };
    return labels[currentMode] || "Single";
  });
</script>

<header class="playback-header">
  <div class="header-left">
    <button
      class="mode-btn"
      onclick={onChangeMode}
      aria-label="Change animation mode"
    >
      <i class="fas fa-arrow-left"></i>
      <span class="mode-label">{modeLabel()} Mode</span>
    </button>
  </div>

  <div class="header-right">
    <button
      class="action-btn save-btn"
      onclick={onSave}
      aria-label="Save animation"
    >
      <i class="fas fa-save"></i>
      <span class="btn-label">Save</span>
    </button>

    <button
      class="action-btn share-btn"
      onclick={onShare}
      aria-label="Share animation"
    >
      <i class="fas fa-share-alt"></i>
      <span class="btn-label">Share</span>
    </button>
  </div>
</header>

<style>
  .playback-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    background: rgba(0, 0, 0, 0.4);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .header-left,
  .header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
  }

  .mode-btn:active {
    transform: scale(0.98);
  }

  .mode-label {
    font-weight: 600;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
  }

  .save-btn {
    background: rgba(139, 92, 246, 0.2);
    border-color: rgba(139, 92, 246, 0.3);
    color: rgba(167, 139, 250, 1);
  }

  .save-btn:hover {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(196, 181, 253, 1);
  }

  .share-btn {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.3);
    color: rgba(34, 211, 238, 1);
  }

  .share-btn:hover {
    background: rgba(6, 182, 212, 0.3);
    border-color: rgba(6, 182, 212, 0.5);
    color: rgba(103, 232, 249, 1);
  }

  .action-btn:active {
    transform: scale(0.98);
  }

  /* Mobile - compact layout */
  @media (max-width: 768px) {
    .playback-header {
      padding: 0.75rem 1rem;
    }

    .mode-btn,
    .action-btn {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }

    .btn-label {
      display: none;
    }

    .action-btn {
      width: 40px;
      height: 40px;
      justify-content: center;
      padding: 0;
    }
  }

  /* Extra small mobile - stack vertically */
  @media (max-width: 480px) {
    .mode-label {
      display: none;
    }

    .mode-btn {
      width: 40px;
      height: 40px;
      justify-content: center;
      padding: 0;
    }
  }
</style>
