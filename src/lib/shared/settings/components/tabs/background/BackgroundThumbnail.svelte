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
  /* ===== ANIMATION STYLES ===== */
  /* Using :global() for dynamically added class names and -global- prefix for keyframes */
  /* This prevents Svelte from stripping these as "unused" at compile time */

  /* Aurora Flow - Colorful flowing gradient */
  :global(.background-thumbnail.aurora-flow .background-preview) {
    background: linear-gradient(
      45deg,
      #667eea 0%,
      #764ba2 10%,
      #f093fb 20%,
      #f5576c 30%,
      #4facfe 40%,
      #00f2fe 50%,
      #667eea 60%,
      #764ba2 70%,
      #f093fb 80%,
      #f5576c 90%,
      #4facfe 100%
    ) !important;
    background-size: 200% 200%;
    animation: -global-aurora-animation 2s linear infinite;
  }

  @keyframes -global-aurora-animation {
    0% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }

  /* Snowfall Animation - Dark blue background with falling snow */
  :global(.background-thumbnail.snow-fall .background-preview) {
    background: linear-gradient(
      135deg,
      #1a1a2e 0%,
      #16213e 50%,
      #0f3460 100%
    ) !important;
  }

  :global(.background-thumbnail.snow-fall .background-preview::before) {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle, #ffffff 0%, transparent 50%) 20px 30px / 40px 40px,
      radial-gradient(circle, #f8faff 0%, transparent 50%) 60px 10px / 30px 30px,
      radial-gradient(circle, #e8f4f8 0%, transparent 50%) 100px 50px / 35px
        35px,
      radial-gradient(circle, #f0f8ff 0%, transparent 50%) 140px 20px / 25px
        25px;
    background-repeat: repeat;
    animation: -global-snowfall 3s linear infinite;
    opacity: 1;
  }

  @keyframes -global-snowfall {
    0% {
      transform: translateY(-50px) translateX(0px);
    }
    100% {
      transform: translateY(250px) translateX(10px);
    }
  }

  /* Night Sky Animation - Deep purple with twinkling stars */
  :global(.background-thumbnail.star-twinkle .background-preview) {
    background: linear-gradient(
      135deg,
      #0a0e2c 0%,
      #1a2040 50%,
      #2a3060 100%
    ) !important;
  }

  :global(.background-thumbnail.star-twinkle .background-preview::before) {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle, #ffffff 0%, transparent 60%) 25px 25px / 20px 20px,
      radial-gradient(circle, #ffeb3b 0%, transparent 60%) 75px 50px / 25px 25px,
      radial-gradient(circle, #ffffff 0%, transparent 60%) 125px 75px / 18px
        18px,
      radial-gradient(circle, #4facfe 0%, transparent 60%) 50px 90px / 22px 22px;
    background-repeat: repeat;
    animation: -global-star-twinkle-animation 1s ease-in-out infinite;
    opacity: 1;
  }

  @keyframes -global-star-twinkle-animation {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  /* Ocean Animation - Very dark blue with rising bubbles */
  :global(.background-thumbnail.bubble-float .background-preview) {
    background: linear-gradient(
      135deg,
      #001122 0%,
      #000c1e 50%,
      #000511 100%
    ) !important;
  }

  :global(.background-thumbnail.bubble-float .background-preview::before) {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 60%) 30px
        140px / 30px 30px,
      radial-gradient(circle, rgba(100, 200, 255, 0.5) 0%, transparent 60%) 80px
        160px / 40px 40px,
      radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, transparent 60%)
        120px 120px / 25px 25px,
      radial-gradient(circle, rgba(150, 220, 255, 0.4) 0%, transparent 60%) 50px
        180px / 35px 35px;
    background-repeat: repeat;
    animation: -global-bubble-rise 4s ease-in-out infinite;
    opacity: 1;
  }

  @keyframes -global-bubble-rise {
    0% {
      transform: translateY(50px);
    }
    100% {
      transform: translateY(-100px);
    }
  }

  /* ===== COMPONENT STYLES ===== */

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
    container-type: size;

    /*
      Intelligent responsive aspect ratio
      - Adapts to grid layout automatically
      - Uses container queries for optimal sizing
      - No orientation detection needed
    */

    /* Default: 16:9 aspect ratio (works well for most layouts) */
    aspect-ratio: 16 / 9;
    min-height: 70px;
    min-width: 70px;
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

  /* Make background-preview globally accessible for external animation CSS */
  :global(.background-preview) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 1;
    z-index: 0; /* Behind overlay */
  }

  /* Fallback background for non-animated backgrounds */
  .background-thumbnail:not(:global(.aurora-flow)):not(:global(.snow-fall)):not(
      :global(.star-twinkle)
    ):not(:global(.bubble-float))
    :global(.background-preview) {
    background: var(--bg-gradient);
  }

  .thumbnail-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0.05) 30%,
      rgba(0, 0, 0, 0.05) 70%,
      rgba(0, 0, 0, 0.3) 100%
    );
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: white;
    backdrop-filter: none;
    z-index: 1; /* Above background-preview */

    /* Responsive padding using container units */
    padding: clamp(6px, 2cqi, 14px);
  }

  .thumbnail-icon {
    line-height: 1;
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.8),
      0 0 4px rgba(0, 0, 0, 0.9);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));

    /* Responsive icon sizing */
    font-size: clamp(18px, 5cqi, 36px);
  }

  .thumbnail-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
    border-radius: 0 0 clamp(6px, 1cqi, 12px) clamp(6px, 1cqi, 12px);

    /* Responsive padding and margins */
    padding: clamp(6px, 2cqi, 12px);
    margin: clamp(-6px, -2cqi, -12px);
  }

  .thumbnail-name {
    font-weight: 700;
    margin: 0 0 clamp(2px, 1cqi, 6px) 0;
    text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.9),
      0 0 3px rgba(0, 0, 0, 1);

    /* Responsive font sizing */
    font-size: clamp(11px, 3cqi, 18px);
  }

  .thumbnail-description {
    margin: 0;
    opacity: 0.95;
    line-height: 1.3;
    font-weight: 500;
    text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.9),
      0 0 3px rgba(0, 0, 0, 1);

    /* Responsive font sizing */
    font-size: clamp(9px, 2.5cqi, 14px);
  }

  .selection-indicator {
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    backdrop-filter: blur(10px);

    /* Responsive positioning and sizing */
    top: clamp(6px, 2cqi, 12px);
    right: clamp(6px, 2cqi, 12px);
    padding: clamp(3px, 1cqi, 6px);
  }

  .selection-indicator svg {
    /* Responsive SVG sizing */
    width: clamp(18px, 5cqi, 28px);
    height: clamp(18px, 5cqi, 28px);
  }

  /* Accessibility - Disable all animations for reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .background-thumbnail {
      transition: none;
    }

    .background-thumbnail:hover {
      transform: none;
    }

    :global(.background-thumbnail.aurora-flow .background-preview),
    :global(.background-thumbnail.snow-fall .background-preview::before),
    :global(.background-thumbnail.star-twinkle .background-preview::before),
    :global(.background-thumbnail.bubble-float .background-preview::before) {
      animation: none !important;
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
