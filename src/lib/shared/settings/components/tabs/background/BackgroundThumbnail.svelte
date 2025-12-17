<!--
  BackgroundThumbnail.svelte - Individual background preview thumbnail

  A focused component that renders a single background option with its
  animated preview, metadata, and selection state.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "../../../../application/services/contracts/IHapticFeedbackService";
  import { resolve } from "../../../../inversify/di";
  import { TYPES } from "../../../../inversify/types";
  import { BackgroundType } from "../../../../background/shared/domain/enums/background-enums";
  import { onMount, onDestroy } from "svelte";
  import type { BackgroundMetadata } from "./background-config";
  import {
    backgroundPopularity,
    initializePopularityTracking,
  } from "../../../state/background-popularity-state.svelte";

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

  // Get popularity count reactively from the singleton
  const popularityCount = $derived(
    backgroundPopularity.counts[background.type] ?? 0
  );

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Initialize popularity tracking (safe to call multiple times)
    initializePopularityTracking();
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
  class="background-thumbnail"
  class:selected={isSelected}
  data-orientation={orientation}
  onclick={handleClick}
  onkeydown={handleKeydown}
  role="button"
  tabindex="0"
  aria-label={`Select ${background.name} background`}
>
  <!-- Lightweight CSS-only animation optimized for small buttons -->
  <div class="background-preview" data-background={background.type}></div>

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
            fill="color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent)"
            stroke="var(--theme-accent, #6366f1)"
            stroke-width="2"
          />
          <path
            d="M8 12l2 2 4-4"
            stroke="var(--theme-accent, #6366f1)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    {/if}

    <!-- Popularity counter badge -->
    {#if popularityCount > 0}
      <div
        class="popularity-badge"
        title="{popularityCount} users using this background"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
        <span class="popularity-count">{popularityCount}</span>
      </div>
    {/if}
  </div>
</div>

<style>
  /* ===== COMPONENT STRUCTURE STYLES ===== */
  /* Animations are rendered via BackgroundCanvas component */

  .background-thumbnail {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: clamp(8px, 1.5cqi, 14px);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.3);
    container-type: size;
    aspect-ratio: 16 / 9;
    min-height: 70px;
    min-width: 70px;

    /* Beautiful shadow that enhances on hover */
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  .background-thumbnail:hover {
    transform: translateY(-4px) scale(1.02);
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.4));
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.4),
      0 0 20px color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
  }

  .background-thumbnail.selected {
    border-color: var(--theme-accent, #6366f1);
    border-width: 3px;
    box-shadow:
      0 0 0 2px
        color-mix(in srgb, var(--theme-accent, #6366f1) 30%, transparent),
      0 8px 32px
        color-mix(in srgb, var(--theme-accent, #6366f1) 40%, transparent),
      0 0 24px color-mix(in srgb, var(--theme-accent, #6366f1) 30%, transparent);
    transform: scale(1.03);
  }

  .background-thumbnail.selected:hover {
    transform: translateY(-4px) scale(1.05);
  }

  .background-thumbnail:focus-visible {
    outline: 3px solid var(--theme-accent, #6366f1);
    outline-offset: 3px;
  }

  .thumbnail-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 0.25) 100%
    );
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: white;
    z-index: 1;
    padding: clamp(8px, 2.5cqi, 16px);
    transition: background 0.3s ease;
    pointer-events: none; /* Allow clicks to pass through */
  }

  .background-thumbnail:hover .thumbnail-overlay {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.15) 0%,
      rgba(0, 0, 0, 0) 40%,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 0.35) 100%
    );
  }

  .thumbnail-icon {
    line-height: 1;
    text-shadow:
      0 2px 12px rgba(0, 0, 0, 0.9),
      0 0 6px rgba(0, 0, 0, 1);
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6));
    font-size: clamp(20px, 6cqi, 40px);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .background-thumbnail:hover .thumbnail-icon {
    transform: scale(1.08) translateY(-1px);
  }

  /* Reduce icon animation in smaller containers */
  @container (max-width: 200px) {
    .background-thumbnail:hover .thumbnail-icon {
      transform: scale(1.05) translateY(-1px);
    }
  }

  @container (max-width: 120px) {
    .background-thumbnail:hover .thumbnail-icon {
      transform: scale(1.03);
    }
  }

  .thumbnail-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
    border-radius: 0 0 clamp(8px, 1.5cqi, 14px) clamp(8px, 1.5cqi, 14px);
    padding: clamp(8px, 2.5cqi, 14px);
    margin: clamp(-8px, -2.5cqi, -14px);
  }

  .thumbnail-name {
    font-weight: 700;
    margin: 0 0 clamp(2px, 1cqi, 6px) 0;
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 1),
      0 0 4px rgba(0, 0, 0, 1);
    font-size: clamp(12px, 3.5cqi, 20px);
    letter-spacing: 0.3px;
  }

  .thumbnail-description {
    margin: 0;
    opacity: 0.95;
    line-height: 1.4;
    font-weight: 500;
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 1),
      0 0 4px rgba(0, 0, 0, 1);
    font-size: clamp(10px, 2.8cqi, 15px);
  }

  .selection-indicator {
    position: absolute;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    backdrop-filter: blur(12px);
    top: clamp(8px, 2.5cqi, 14px);
    right: clamp(8px, 2.5cqi, 14px);
    padding: clamp(4px, 1.2cqi, 8px);
    animation: checkmark-appear 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes checkmark-appear {
    0% {
      transform: scale(0) rotate(-180deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.15) rotate(10deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }

  .selection-indicator svg {
    width: clamp(20px, 6cqi, 30px);
    height: clamp(20px, 6cqi, 30px);
    display: block;
  }

  /* Background preview container - CSS-only animations */
  .background-preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    overflow: hidden;
    will-change: transform; /* GPU acceleration hint */
  }

  /* Enable GPU acceleration for pseudo-elements */
  .background-preview::before,
  .background-preview::after {
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0); /* Force GPU layer */
  }

  /* ===== SNOWFALL BACKGROUND ===== */
  .background-preview[data-background="snowfall"] {
    background: linear-gradient(180deg, #2a3a5e 0%, #1f2d4e 50%, #1a4570 100%);
  }

  /* Layer 1 - Large foreground snowflakes with varied paths */
  .background-preview[data-background="snowfall"]::before {
    content: "";
    position: absolute;
    top: -100%;
    left: -10%;
    width: 120%;
    height: 200%;
    background-image:
      radial-gradient(circle, white 2px, transparent 2px),
      radial-gradient(
        circle,
        rgba(255, 255, 255, 0.95) 1.5px,
        transparent 1.5px
      ),
      radial-gradient(circle, rgba(255, 255, 255, 0.9) 2px, transparent 2px),
      radial-gradient(circle, white 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(255, 255, 255, 0.85) 2px, transparent 2px),
      radial-gradient(
        circle,
        rgba(255, 255, 255, 0.95) 1.5px,
        transparent 1.5px
      ),
      radial-gradient(circle, white 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(255, 255, 255, 0.9) 2px, transparent 2px);
    background-size:
      79px 97px,
      131px 113px,
      103px 89px,
      109px 107px,
      89px 101px,
      127px 97px,
      97px 109px,
      113px 103px;
    background-position:
      7% 11%,
      31% 23%,
      67% 41%,
      89% 7%,
      19% 53%,
      43% 71%,
      73% 29%,
      97% 59%;
    animation: snowfall-layer1 18s linear infinite;
    filter: blur(0.5px);
  }

  /* Layer 2 - Medium background snowflakes with different paths */
  .background-preview[data-background="snowfall"]::after {
    content: "";
    position: absolute;
    top: -100%;
    left: -10%;
    width: 120%;
    height: 200%;
    background-image:
      radial-gradient(circle, rgba(255, 255, 255, 0.75) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.65) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.75) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.65) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 1px, transparent 1px);
    background-size:
      71px 83px,
      101px 97px,
      83px 107px,
      107px 89px,
      97px 113px,
      89px 79px,
      113px 103px,
      79px 97px,
      103px 89px,
      97px 101px;
    background-position:
      13% 17%,
      37% 31%,
      61% 13%,
      83% 47%,
      11% 67%,
      41% 79%,
      71% 37%,
      91% 23%,
      23% 89%,
      53% 53%;
    animation: snowfall-layer2 24s linear infinite;
    animation-delay: -6s;
    opacity: 0.65;
    filter: blur(1px);
  }

  /* Seamless continuous fall with varied drift */
  @keyframes snowfall-layer1 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(5%, 25%) rotate(4deg);
    }
    50% {
      transform: translate(-2%, 50%) rotate(-3deg);
    }
    75% {
      transform: translate(6%, 75%) rotate(5deg);
    }
    100% {
      transform: translate(0, 100%) rotate(0deg);
    }
  }

  @keyframes snowfall-layer2 {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    20% {
      transform: translate(-5%, 20%) rotate(-6deg);
    }
    40% {
      transform: translate(4%, 40%) rotate(4deg);
    }
    60% {
      transform: translate(-6%, 60%) rotate(-5deg);
    }
    80% {
      transform: translate(3%, 80%) rotate(3deg);
    }
    100% {
      transform: translate(0, 100%) rotate(0deg);
    }
  }

  /* ===== NIGHT SKY BACKGROUND ===== */
  .background-preview[data-background="nightSky"] {
    background: linear-gradient(
      180deg,
      #1a1a3e 0%,
      #2a2a4e 30%,
      #26314e 70%,
      #1f4670 100%
    );
  }

  .background-preview[data-background="nightSky"]::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle, white 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(255, 255, 255, 0.9) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
      radial-gradient(circle, white 2px, transparent 2px),
      radial-gradient(circle, rgba(255, 255, 255, 0.7) 1px, transparent 1px),
      radial-gradient(
        circle,
        rgba(255, 255, 255, 0.9) 1.5px,
        transparent 1.5px
      ),
      radial-gradient(circle, white 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px);
    background-size:
      200px 200px,
      180px 180px,
      220px 220px,
      252px 252px,
      190px 190px,
      210px 210px,
      170px 170px,
      240px 240px;
    background-position:
      0px 0px,
      40px 60px,
      130px 80px,
      70px 120px,
      152px 30px,
      90px 152px,
      200px 48px,
      160px 110px;
    background-repeat: repeat;
    animation: twinkle 3s ease-in-out infinite;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.9));
  }

  /* Moon with pulse animation */
  .background-preview[data-background="nightSky"]::after {
    content: "";
    position: absolute;
    top: 15%;
    right: 15%;
    width: clamp(30px, 12cqi, 60px);
    height: clamp(30px, 12cqi, 60px);
    border-radius: 50%;
    background: radial-gradient(
      circle at 35% 35%,
      #ffffff,
      #f0f0f0 50%,
      #d0d0d0
    );
    box-shadow:
      0 0 clamp(15px, 4cqi, 30px) rgba(255, 255, 255, 0.8),
      0 0 clamp(25px, 6cqi, 45px) rgba(255, 255, 255, 0.4),
      inset -5px -5px 15px rgba(0, 0, 0, 0.15);
    animation: moon-glow 4s ease-in-out infinite;
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes moon-glow {
    0%,
    100% {
      transform: scale(1);
      box-shadow:
        0 0 clamp(15px, 4cqi, 30px) rgba(255, 255, 255, 0.8),
        0 0 clamp(25px, 6cqi, 45px) rgba(255, 255, 255, 0.4),
        inset -5px -5px 15px rgba(0, 0, 0, 0.15);
    }
    50% {
      transform: scale(1.05);
      box-shadow:
        0 0 clamp(20px, 5cqi, 40px) rgba(255, 255, 255, 1),
        0 0 clamp(35px, 8cqi, 60px) rgba(255, 255, 255, 0.6),
        inset -5px -5px 15px rgba(0, 0, 0, 0.15);
    }
  }

  /* ===== AURORA BACKGROUND ===== */
  .background-preview[data-background="aurora"] {
    background: linear-gradient(180deg, #0a0a0f 0%, #1a1a20 100%);
  }

  .background-preview[data-background="aurora"]::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
      radial-gradient(
        ellipse 40% 30% at 30% 40%,
        rgba(220, 120, 255, 0.95) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse 35% 25% at 70% 60%,
        rgba(0, 255, 150, 0.9) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse 45% 35% at 50% 50%,
        rgba(80, 240, 255, 0.85) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse 30% 25% at 85% 45%,
        rgba(255, 130, 200, 0.9) 0%,
        transparent 50%
      );
    animation: aurora-flow 15s ease-in-out infinite;
    filter: blur(clamp(18px, 5.5cqi, 32px)) brightness(1.2);
  }

  .background-preview[data-background="aurora"]::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background:
      radial-gradient(
        ellipse 38% 28% at 60% 30%,
        rgba(255, 100, 200, 0.85) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse 42% 32% at 40% 70%,
        rgba(150, 220, 255, 0.9) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse 35% 25% at 80% 50%,
        rgba(255, 150, 255, 0.8) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse 32% 28% at 20% 65%,
        rgba(255, 230, 100, 0.85) 0%,
        transparent 50%
      );
    animation: aurora-flow 20s ease-in-out infinite reverse;
    filter: blur(clamp(22px, 6.5cqi, 40px)) brightness(1.15);
  }

  @keyframes aurora-flow {
    0%,
    100% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 0.8;
    }
    25% {
      transform: translate(10%, 10%) rotate(5deg);
      opacity: 1;
    }
    50% {
      transform: translate(-5%, 15%) rotate(-5deg);
      opacity: 0.7;
    }
    75% {
      transform: translate(-10%, 5%) rotate(3deg);
      opacity: 0.9;
    }
  }

  /* ===== DEEP OCEAN BACKGROUND ===== */
  .background-preview[data-background="deepOcean"] {
    background: linear-gradient(180deg, #1d4d77 0%, #194a5b 50%, #0d2d47 100%);
  }

  .background-preview[data-background="deepOcean"]::before {
    content: "";
    position: absolute;
    bottom: -20%;
    left: 0;
    width: 100%;
    height: 120%;
    background-image:
      radial-gradient(circle, rgba(147, 197, 253, 0.5) 2px, transparent 2px),
      radial-gradient(
        circle,
        rgba(147, 197, 253, 0.4) 1.5px,
        transparent 1.5px
      ),
      radial-gradient(circle, rgba(147, 197, 253, 0.35) 1px, transparent 1px),
      radial-gradient(circle, rgba(147, 197, 253, 0.6) 3px, transparent 3px),
      radial-gradient(circle, rgba(147, 197, 253, 0.3) 1px, transparent 1px),
      radial-gradient(circle, rgba(147, 197, 253, 0.45) 2px, transparent 2px);
    background-size:
      100px 100px,
      140px 140px,
      120px 120px,
      90px 90px,
      110px 110px,
      80px 80px;
    background-position:
      20px 80px,
      70px 120px,
      140px 60px,
      100px 140px,
      180px 100px,
      40px 152px;
    animation: bubbles 12s ease-in-out infinite;
  }

  @keyframes bubbles {
    0% {
      transform: translateY(0);
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateY(-100%);
      opacity: 0.4;
    }
  }

  /* ===== FIREFLY FOREST BACKGROUND ===== */
  .background-preview[data-background="fireflyForest"] {
    background: linear-gradient(
      180deg,
      #0a1a0d 0%,
      #0d2412 40%,
      #1a3d1f 70%,
      #0f2914 100%
    );
  }

  /* Tree silhouettes */
  .background-preview[data-background="fireflyForest"]::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70%;
    background:
      /* Far trees - lighter, smaller */
      linear-gradient(
          135deg,
          transparent 45%,
          #051208 45%,
          #051208 55%,
          transparent 55%
        )
        0% 100% / 25% 35% no-repeat,
      linear-gradient(
          225deg,
          transparent 45%,
          #051208 45%,
          #051208 55%,
          transparent 55%
        )
        25% 100% / 25% 35% no-repeat,
      linear-gradient(
          135deg,
          transparent 45%,
          #061509 45%,
          #061509 55%,
          transparent 55%
        )
        50% 100% / 20% 30% no-repeat,
      linear-gradient(
          225deg,
          transparent 45%,
          #061509 45%,
          #061509 55%,
          transparent 55%
        )
        70% 100% / 22% 32% no-repeat,
      /* Near trees - darker, larger */
        linear-gradient(
          135deg,
          transparent 42%,
          #030a05 42%,
          #030a05 58%,
          transparent 58%
        )
        10% 100% / 30% 55% no-repeat,
      linear-gradient(
          225deg,
          transparent 42%,
          #030a05 42%,
          #030a05 58%,
          transparent 58%
        )
        60% 100% / 35% 60% no-repeat,
      linear-gradient(
          135deg,
          transparent 43%,
          #040c06 43%,
          #040c06 57%,
          transparent 57%
        )
        85% 100% / 28% 50% no-repeat;
    opacity: 0.85;
  }

  /* Fireflies */
  .background-preview[data-background="fireflyForest"]::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      radial-gradient(circle, rgba(190, 242, 100, 0.9) 2px, transparent 2px),
      radial-gradient(
        circle,
        rgba(163, 230, 53, 0.85) 2.5px,
        transparent 2.5px
      ),
      radial-gradient(circle, rgba(253, 224, 71, 0.8) 2px, transparent 2px),
      radial-gradient(
        circle,
        rgba(190, 242, 100, 0.75) 1.5px,
        transparent 1.5px
      ),
      radial-gradient(circle, rgba(163, 230, 53, 0.9) 2px, transparent 2px),
      radial-gradient(
        circle,
        rgba(190, 242, 100, 0.7) 1.5px,
        transparent 1.5px
      ),
      radial-gradient(circle, rgba(253, 224, 71, 0.85) 2px, transparent 2px),
      radial-gradient(circle, rgba(163, 230, 53, 0.8) 2.5px, transparent 2.5px);
    background-size:
      120px 100px,
      140px 120px,
      100px 140px,
      160px 110px,
      130px 150px,
      110px 130px,
      150px 100px,
      90px 140px;
    background-position:
      15% 25%,
      65% 35%,
      35% 55%,
      85% 20%,
      25% 70%,
      75% 60%,
      45% 40%,
      55% 75%;
    animation: firefly-float 8s ease-in-out infinite;
    filter: blur(0.5px) drop-shadow(0 0 6px rgba(190, 242, 100, 0.8));
  }

  @keyframes firefly-float {
    0%,
    100% {
      transform: translate(0, 0);
      opacity: 0.7;
    }
    25% {
      transform: translate(3%, -2%);
      opacity: 1;
    }
    50% {
      transform: translate(-2%, 2%);
      opacity: 0.5;
    }
    75% {
      transform: translate(2%, -1%);
      opacity: 0.9;
    }
  }

  /* Compact mode optimizations */
  @container (max-width: 152px) {
    /* Reduce animation complexity on very small buttons */
    .background-preview::before,
    .background-preview::after {
      animation-duration: 10s !important; /* Faster animations for smaller space */
      filter: blur(
        clamp(8px, 3cqi, 15px)
      ) !important; /* Less blur for clarity */
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .background-thumbnail,
    .thumbnail-icon,
    .thumbnail-overlay {
      transition: none;
    }

    .background-thumbnail:hover,
    .background-thumbnail.selected {
      transform: none;
    }

    .background-thumbnail:hover .thumbnail-icon {
      transform: none;
    }

    .selection-indicator {
      animation: none;
    }

    /* Disable background animations */
    .background-preview::before,
    .background-preview::after {
      animation: none !important;
    }
  }

  /* Ultra-compact mode: smaller than 100px */
  @container (max-width: 100px) {
    .background-thumbnail {
      min-height: var(--min-touch-target);
      min-width: var(--min-touch-target);
      border-radius: clamp(6px, 1.5cqi, 10px);
      border-width: 1px;
    }

    .background-thumbnail.selected {
      border-width: 2px;
    }

    /* Hide description, keep only name */
    .thumbnail-description {
      display: none;
    }

    .thumbnail-name {
      font-size: clamp(10px, 3cqi, 14px);
      margin: 0;
    }

    .thumbnail-icon {
      font-size: clamp(16px, 5cqi, 24px);
    }

    /* Simplify moon for night sky */
    .background-preview[data-background="nightSky"]::after {
      width: clamp(20px, 10cqi, 40px);
      height: clamp(20px, 10cqi, 40px);
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .background-thumbnail {
      border-color: white;
      border-width: 2px;
    }

    .background-thumbnail.selected {
      border-color: var(--theme-accent, #6366f1);
      border-width: 4px;
      background: color-mix(
        in srgb,
        var(--theme-accent, #6366f1) 15%,
        transparent
      );
    }

    .thumbnail-overlay {
      background: rgba(0, 0, 0, 0.85);
    }
  }

  /* ===== POPULARITY BADGE STYLES ===== */
  .popularity-badge {
    position: absolute;
    bottom: clamp(6px, 2cqi, 12px);
    right: clamp(6px, 2cqi, 12px);
    display: flex;
    align-items: center;
    gap: clamp(2px, 0.8cqi, 4px);
    padding: clamp(3px, 1cqi, 6px) clamp(6px, 1.5cqi, 10px);
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border-radius: clamp(10px, 3cqi, 16px);
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(10px, 2.5cqi, 14px);
    font-weight: 600;
    z-index: 2;
    pointer-events: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .popularity-badge svg {
    width: clamp(10px, 2.5cqi, 14px);
    height: clamp(10px, 2.5cqi, 14px);
    opacity: 0.85;
  }

  .popularity-count {
    line-height: 1;
    letter-spacing: 0.3px;
  }

  /* Highlight badge on hover */
  .background-thumbnail:hover .popularity-badge {
    background: rgba(0, 0, 0, 0.85);
    color: white;
    transform: scale(1.05);
  }

  /* Hide badge on ultra-compact mode */
  @container (max-width: 100px) {
    .popularity-badge {
      display: none;
    }
  }

  /* Smaller badge in compact mode */
  @container (max-width: 150px) {
    .popularity-badge {
      padding: clamp(2px, 0.8cqi, 4px) clamp(4px, 1.2cqi, 8px);
      gap: clamp(1px, 0.5cqi, 3px);
    }

    .popularity-badge svg {
      width: clamp(8px, 2cqi, 12px);
      height: clamp(8px, 2cqi, 12px);
    }
  }
</style>
