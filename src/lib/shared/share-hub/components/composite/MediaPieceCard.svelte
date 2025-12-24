<!--
  MediaPieceCard.svelte

  Individual media piece card for Composite mode.
  Displays preview of animation, static, grid, or performance video with gear settings overlay.

  Features:
  - Conditional rendering based on format (animation/static/grid/performance)
  - Gear icon overlay (top-right corner)
  - Format label (bottom-left corner)
  - Hover state reveals controls
  - Click gear → opens settings for that piece

  Domain: Share Hub - Composite Mode - Media Piece
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';
  import type { MediaFormat } from '../../domain/models/MediaFormat';

  let {
    pieceIndex,
    format,
    label,
  }: {
    pieceIndex: 1 | 2;
    format: 'animation' | 'static' | 'grid' | 'performance';
    label: string;
  } = $props();

  const state = getShareHubState();
  let isHovered = $state(false);

  // Map format to icon
  const formatIcon = $derived(
    format === 'animation'
      ? 'fa-play-circle'
      : format === 'static'
        ? 'fa-image'
        : format === 'grid'
          ? 'fa-th'
          : 'fa-video'
  );

  // Map format to MediaFormat for settings
  const settingsFormat = $derived(
    format === 'grid' ? ('static' as MediaFormat) : (format as MediaFormat)
  );

  function handleSettingsClick() {
    state.settingsPanelOpen = true;
    state.settingsContext = { format: settingsFormat, pieceIndex };
  }
</script>

<div
  class="media-piece-card"
  onmouseenter={() => (isHovered = true)}
  onmouseleave={() => (isHovered = false)}
>
  <!-- Preview Content -->
  <div class="preview-content">
    {#if format === 'animation'}
      <!-- TODO: Integrate actual animation canvas -->
      <div class="placeholder-preview">
        <i class="fas fa-play-circle"></i>
        <p>Animation</p>
      </div>
    {:else if format === 'static'}
      <!-- TODO: Integrate static image canvas -->
      <div class="placeholder-preview">
        <i class="fas fa-image"></i>
        <p>Static Image</p>
      </div>
    {:else if format === 'grid'}
      <!-- TODO: Integrate grid canvas -->
      <div class="placeholder-preview">
        <i class="fas fa-th"></i>
        <p>Grid Layout</p>
      </div>
    {:else if format === 'performance'}
      <!-- TODO: Integrate performance video preview -->
      <div class="placeholder-preview">
        <i class="fas fa-video"></i>
        <p>Performance</p>
      </div>
    {/if}
  </div>

  <!-- Format Label (bottom-left) -->
  <div class="format-label">
    <i class="fas {formatIcon}"></i>
    <span>{label}</span>
  </div>

  <!-- Settings Gear (top-right) -->
  <button
    class="settings-gear"
    class:visible={isHovered}
    onclick={handleSettingsClick}
    aria-label="Settings for {label}"
  >
    <i class="fas fa-cog"></i>
  </button>
</div>

<style>
  .media-piece-card {
    position: relative;
    width: 100%;
    height: 100%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s ease;
  }

  .media-piece-card:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .preview-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .placeholder-preview i {
    font-size: 48px;
    opacity: 0.3;
  }

  .placeholder-preview p {
    font-size: var(--font-size-min, 14px);
    margin: 0;
    font-weight: 500;
  }

  .format-label {
    position: absolute;
    bottom: 12px;
    left: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-radius: 20px;
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: white;
  }

  .format-label i {
    font-size: 14px;
  }

  .settings-gear {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.2));
    border-radius: 50%;
    color: white;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease;
    transform: scale(0.9);
  }

  .settings-gear.visible {
    opacity: 1;
    transform: scale(1);
  }

  .settings-gear:hover {
    background: var(--theme-accent, rgba(74, 158, 255, 0.8));
    border-color: var(--theme-accent, #4a9eff);
    transform: scale(1.05);
  }

  .settings-gear:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
    opacity: 1;
    transform: scale(1);
  }

  .settings-gear i {
    font-size: 16px;
  }

  /* Mobile - always show settings gear */
  @media (max-width: 768px) {
    .settings-gear {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .media-piece-card,
    .settings-gear {
      transition: none;
    }

    .settings-gear:hover {
      transform: scale(1);
    }
  }
</style>
