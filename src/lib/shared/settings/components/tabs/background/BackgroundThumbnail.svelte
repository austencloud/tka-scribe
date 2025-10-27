<!--
  BackgroundThumbnail.svelte - Individual background preview thumbnail

  A focused component that renders a single background option with its
  animated preview, metadata, and selection state.
-->
<script lang="ts">
  import type { BackgroundType, IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { BackgroundMetadata } from "./background-config";

  const {
    background,
    isSelected,
    onSelect,
    orientation = "square",
  } = $props<{
    background: BackgroundMetadata;
    isSelected: boolean;
    onSelect: (type: BackgroundType) => void;
    orientation?: "portrait" | "landscape" | "square";
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick() {
    // Trigger selection haptic feedback for background selection
    hapticService?.trigger("selection");
    onSelect(background.type);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      // Trigger selection haptic feedback for keyboard selection
      hapticService?.trigger("selection");
      onSelect(background.type);
    }
  }
</script>

<div
  class="background-thumbnail {background.animation}"
  class:selected={isSelected}
  data-orientation={orientation}
  style="--bg-gradient: {background.gradient}"
  onclick={handleClick}
  onkeydown={handleKeydown}
  role="button"
  tabindex="0"
  aria-label={`Select ${background.name} background`}
>
  <!-- Animated background preview -->
  <div class="background-preview"></div>

  <!-- Overlay with background info -->
  <div class="thumbnail-overlay">
    <div class="thumbnail-icon">{@html background.icon}</div>
    <div class="thumbnail-info">
      <h4 class="thumbnail-name">{background.name}</h4>
      <p class="thumbnail-description">{background.description}</p>
    </div>

    <!-- Selection indicator -->
    {#if isSelected}
      <div class="selection-indicator">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="rgba(99, 102, 241, 0.2)"
            stroke="#6366f1"
            stroke-width="2"
          />
          <path
            d="M8 12l2 2 4-4"
            stroke="#6366f1"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    {/if}
  </div>
</div>

<style>
  .background-thumbnail {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: clamp(6px, 1cqi, 12px);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.2);
    /* Ensure minimum touch target size for mobile */
    min-height: 44px;
    min-width: 44px;
  }

  /* Portrait Mode - Cards are shorter and wider */
  .background-thumbnail[data-orientation="portrait"] {
    aspect-ratio: 3 / 2;
    min-height: 60px;
    max-height: 200px;
  }

  /* Landscape Mode - Cards are taller and narrower */
  .background-thumbnail[data-orientation="landscape"] {
    aspect-ratio: 2 / 3;
    min-width: 80px;
    max-width: 300px;
  }

  /* Square/Default Mode - Balanced aspect ratio */
  .background-thumbnail[data-orientation="square"] {
    aspect-ratio: 16 / 9;
    min-height: 80px;
    max-height: 250px;
  }

  .background-thumbnail:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }

  .background-thumbnail.selected {
    border-color: #6366f1;
    box-shadow:
      0 0 0 1px #6366f1,
      0 4px 20px rgba(99, 102, 241, 0.3);
  }

  .background-thumbnail:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  /* Use :global() to allow external CSS animations to target this element */
  :global(.background-preview) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-gradient);
    opacity: 0.8;
  }

  .thumbnail-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0.4) 100%
    );
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: clamp(8px, 2cqi, 16px);
    color: white;
    backdrop-filter: blur(1px);
  }

  .thumbnail-icon {
    font-size: clamp(20px, 4cqi, 32px);
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .thumbnail-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .thumbnail-name {
    font-size: clamp(13px, 2.5cqi, 18px);
    font-weight: 600;
    margin: 0 0 clamp(3px, 1cqi, 8px) 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  }

  .thumbnail-description {
    font-size: clamp(10px, 2cqi, 14px);
    margin: 0;
    opacity: 0.9;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  }

  .selection-indicator {
    position: absolute;
    top: clamp(8px, 1.5cqi, 12px);
    right: clamp(8px, 1.5cqi, 12px);
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    padding: 4px;
    backdrop-filter: blur(10px);
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .background-thumbnail {
      transition: none;
    }

    .background-thumbnail:hover {
      transform: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .background-thumbnail {
      border-color: white;
    }

    .background-thumbnail.selected {
      border-color: #6366f1;
      background: rgba(99, 102, 241, 0.1);
    }

    .thumbnail-overlay {
      background: rgba(0, 0, 0, 0.8);
    }
  }
</style>
