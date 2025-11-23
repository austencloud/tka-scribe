<!--
  IOSBackgroundCard.svelte - iOS-native background card with visual preview

  Maintains the creative card-based UI but with authentic iOS materials:
  - systemMaterial translucent backgrounds
  - iOS spring animations
  - Subtle selection states (no thick glowing borders)
  - SF Pro typography
  - iOS semantic colors
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
    // iOS selection haptic
    hapticService?.trigger("selection");
    onSelect(background.type);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      hapticService?.trigger("selection");
      onSelect(background.type);
    }
  }
</script>

<div
  class="ios-background-card"
  class:selected={isSelected}
  data-orientation={orientation}
  onclick={handleClick}
  onkeydown={handleKeydown}
  role="button"
  tabindex="0"
  aria-label={`Select ${background.name} background`}
>
  <!-- Background preview with CSS animations -->
  <div class="background-preview" data-background={background.type}></div>

  <!-- iOS glass morphism overlay -->
  <div class="card-overlay">
    <div class="card-icon">{@html background.icon}</div>
    <div class="card-info">
      <h4 class="card-name">{background.name}</h4>
      <p class="card-description">{background.description}</p>
    </div>

    <!-- iOS-style selection indicator (small checkmark) -->
    {#if isSelected}
      <div class="ios-selection-indicator">
        <i class="fas fa-check"></i>
      </div>
    {/if}
  </div>
</div>

<style>
  /* iOS-native card with systemMaterial styling - Pixel Perfect */
  .ios-background-card {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 12px; /* iOS exact: 12px for medium corners */
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring curve */
    /* iOS hairline border - exact 0.33px like in HIG */
    border: 0.33px solid rgba(255, 255, 255, 0.16);
    background: rgba(0, 0, 0, 0.25);
    container-type: size;
    aspect-ratio: 16 / 9;
    min-height: 80px;
    min-width: 80px;
    /* iOS precise shadow - matches Photos.app card elevation */
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.08);
  }

  /* Hover - iOS subtle lift - exact elevation increase */
  .ios-background-card:hover {
    transform: translateY(-1px) scale(1.01); /* iOS subtle lift */
    border-color: rgba(255, 255, 255, 0.22);
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.14),
      0 2px 4px rgba(0, 0, 0, 0.1);
  }

  /* Active - iOS press feedback */
  .ios-background-card:active {
    transform: scale(0.98);
    transition-duration: 0.1s;
  }

  /* Selected - iOS subtle tint, NO thick borders - Pixel Perfect */
  .ios-background-card.selected {
    /* Subtle system blue tint - exact iOS value */
    background: rgba(0, 122, 255, 0.06);
    border-color: rgba(0, 122, 255, 0.28);
    box-shadow:
      0 4px 14px rgba(0, 122, 255, 0.12),
      0 1px 3px rgba(0, 122, 255, 0.08),
      inset 0 0 0 0.5px rgba(0, 122, 255, 0.1); /* Subtle inner glow */
  }

  .ios-background-card.selected:hover {
    background: rgba(0, 122, 255, 0.12);
    transform: scale(1.02);
  }

  /* Focus - iOS blue outline */
  .ios-background-card:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: 2px;
  }

  /* Glass morphism overlay - iOS systemMaterial */
  .card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* iOS glass morphism gradient */
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.05) 0%,
      rgba(0, 0, 0, 0) 30%,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 0.3) 100%
    );
    backdrop-filter: blur(4px) saturate(120%);
    -webkit-backdrop-filter: blur(4px) saturate(120%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: white;
    z-index: 1;
    padding: clamp(10px, 3cqi, 18px);
    transition: background 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    pointer-events: none;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .ios-background-card:hover .card-overlay {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0) 30%,
      rgba(0, 0, 0, 0) 60%,
      rgba(0, 0, 0, 0.4) 100%
    );
  }

  /* Icon with iOS shadow */
  .card-icon {
    line-height: 1;
    text-shadow:
      0 2px 8px rgba(0, 0, 0, 0.6),
      0 0 4px rgba(0, 0, 0, 0.8);
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
    font-size: clamp(24px, 7cqi, 48px);
    transition: transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .ios-background-card:hover .card-icon {
    transform: scale(1.05);
  }

  /* Info section */
  .card-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: clamp(2px, 0.8cqi, 4px);
  }

  .card-name {
    font-size: clamp(15px, 4cqi, 17px); /* iOS body text */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.41px; /* iOS tight tracking - exact spec */
    line-height: 22px; /* iOS line-height: 1.29411 ratio */
    margin: 0;
    text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.8),
      0 0 3px rgba(0, 0, 0, 0.9);
  }

  .card-description {
    margin: 0;
    opacity: 0.95;
    font-size: clamp(12px, 3cqi, 13px); /* iOS footnote */
    font-weight: 400;
    letter-spacing: -0.08px; /* iOS footnote tracking */
    line-height: 18px; /* iOS footnote line-height: 1.38461 ratio */
    text-shadow:
      0 2px 6px rgba(0, 0, 0, 0.8),
      0 0 3px rgba(0, 0, 0, 0.9);
  }

  /* iOS-style selection indicator - small checkmark in corner - Exact Size */
  .ios-selection-indicator {
    position: absolute;
    top: 8px; /* iOS standard inset */
    right: 8px; /* iOS standard inset */
    width: 24px; /* iOS exact checkmark badge size */
    height: 24px; /* iOS exact checkmark badge size */
    border-radius: 50%;
    background: #007aff; /* iOS system blue - exact hex */
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px; /* iOS checkmark icon size */
    box-shadow:
      0 2px 6px rgba(0, 122, 255, 0.3),
      0 1px 2px rgba(0, 0, 0, 0.2);
    /* iOS spring animation */
    animation: ios-checkmark-appear 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes ios-checkmark-appear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Background preview container - keep all the beautiful CSS animations */
  .background-preview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    overflow: hidden;
    will-change: transform;
  }

  .background-preview::before,
  .background-preview::after {
    will-change: transform, opacity;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform: translateZ(0);
  }

  /* ===== SNOWFALL BACKGROUND ===== */
  .background-preview[data-background="snowfall"] {
    background: linear-gradient(180deg, #2a3a5e 0%, #1f2d4e 50%, #1a4570 100%);
  }

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
      250px 250px,
      190px 190px,
      210px 210px,
      170px 170px,
      240px 240px;
    background-position:
      0px 0px,
      40px 60px,
      130px 80px,
      70px 120px,
      150px 30px,
      90px 150px,
      200px 50px,
      160px 110px;
    background-repeat: repeat;
    animation: twinkle 3s ease-in-out infinite;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.9));
  }

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
      40px 150px;
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

  /* Light Mode - iOS support */
  @media (prefers-color-scheme: light) {
    .ios-background-card {
      border-color: rgba(0, 0, 0, 0.12);
    }

    .ios-background-card:hover {
      border-color: rgba(0, 0, 0, 0.18);
    }

    .ios-background-card.selected {
      background: rgba(0, 122, 255, 0.06);
      border-color: rgba(0, 122, 255, 0.3);
    }
  }

  /* Reduced Motion - iOS accessibility */
  @media (prefers-reduced-motion: reduce) {
    .ios-background-card,
    .card-icon,
    .card-overlay {
      transition: none;
    }

    .ios-background-card:hover,
    .ios-background-card.selected,
    .ios-background-card:active {
      transform: none;
    }

    .ios-background-card:hover .card-icon {
      transform: none;
    }

    .ios-selection-indicator {
      animation: none;
    }

    .background-preview::before,
    .background-preview::after {
      animation: none !important;
    }
  }

  /* High Contrast - iOS accessibility */
  @media (prefers-contrast: high) {
    .ios-background-card {
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .ios-background-card.selected {
      border: 2px solid #0a84ff;
      background: rgba(10, 132, 255, 0.15);
    }
  }

  @media (prefers-contrast: high) and (prefers-color-scheme: light) {
    .ios-background-card {
      border: 2px solid rgba(0, 0, 0, 0.4);
    }
  }

  /* Compact mode optimizations - iOS corner radii */
  @container (max-width: 100px) {
    .ios-background-card {
      min-height: 60px;
      min-width: 60px;
      border-radius: 10px; /* iOS small corner radius */
    }

    .card-description {
      display: none;
    }

    .card-name {
      font-size: 12px;
      line-height: 16px;
    }

    .card-icon {
      font-size: 18px;
    }

    .ios-selection-indicator {
      width: 20px;
      height: 20px;
      font-size: 10px;
      top: 6px;
      right: 6px;
    }
  }
</style>
