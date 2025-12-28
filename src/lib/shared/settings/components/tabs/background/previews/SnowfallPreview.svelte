<!--
  SnowfallPreview.svelte

  Animated snowfall background preview for background card.
  Features two layers of falling snowflakes with drift animation.
-->
<div class="background-preview snowfall"></div>

<style>
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

  .snowfall {
    background: linear-gradient(180deg, #2a3a5e 0%, #1f2d4e 50%, #1a4570 100%);
  }

  .snowfall::before {
    content: "";
    position: absolute;
    top: -100%;
    left: -10%;
    width: 120%;
    height: 200%;
    background-image:
      radial-gradient(circle, white 2px, transparent 2px),
      radial-gradient(circle, rgba(255, 255, 255, 0.95) 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--theme-text) 2px, transparent 2px),
      radial-gradient(circle, white 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(255, 255, 255, 0.85) 2px, transparent 2px),
      radial-gradient(circle, rgba(255, 255, 255, 0.95) 1.5px, transparent 1.5px),
      radial-gradient(circle, white 1.5px, transparent 1.5px),
      radial-gradient(circle, var(--theme-text) 2px, transparent 2px);
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
    animation-delay: -9s;
    filter: blur(0.5px);
  }

  .snowfall::after {
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
      radial-gradient(circle, var(--theme-text-dim) 1px, transparent 1px),
      radial-gradient(circle, var(--theme-text-dim) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.75) 1px, transparent 1px),
      radial-gradient(circle, var(--theme-text-dim) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.65) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 255, 255, 0.8) 1px, transparent 1px),
      radial-gradient(circle, var(--theme-text-dim) 1px, transparent 1px);
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
    animation-delay: -15s;
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

  @media (prefers-reduced-motion: reduce) {
    .snowfall::before,
    .snowfall::after {
      animation: none !important;
    }
  }
</style>
