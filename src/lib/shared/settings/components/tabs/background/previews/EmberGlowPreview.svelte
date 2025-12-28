<!--
  EmberGlowPreview.svelte

  Animated ember glow background preview with rising sparks and pulsing glow.
-->
<div class="background-preview ember-glow"></div>

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

  .ember-glow {
    background: linear-gradient(180deg, #1a0a00 0%, #2d1810 50%, #1a0800 100%);
  }

  .ember-glow::before {
    content: "";
    position: absolute;
    bottom: -50%;
    left: -10%;
    width: 120%;
    height: 150%;
    background-image:
      radial-gradient(circle, rgba(255, 140, 50, 0.9) 2px, transparent 2px),
      radial-gradient(circle, rgba(255, 100, 30, 0.8) 1.5px, transparent 1.5px),
      radial-gradient(circle, rgba(255, 180, 80, 0.85) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 120, 40, 0.9) 2.5px, transparent 2.5px),
      radial-gradient(circle, rgba(255, 90, 20, 0.7) 1px, transparent 1px),
      radial-gradient(circle, rgba(255, 160, 60, 0.8) 1.5px, transparent 1.5px);
    background-size:
      80px 90px,
      120px 100px,
      100px 80px,
      70px 110px,
      90px 70px,
      110px 90px;
    background-position:
      10% 20%,
      40% 60%,
      70% 30%,
      25% 80%,
      85% 50%,
      55% 10%;
    animation: embers-rise 10s ease-in-out infinite;
    animation-delay: -5s;
    filter: blur(0.5px);
  }

  .ember-glow::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 40%;
    background: radial-gradient(
      ellipse 80% 50% at 50% 100%,
      rgba(255, 100, 30, 0.4) 0%,
      rgba(255, 60, 10, 0.2) 40%,
      transparent 70%
    );
    animation: ember-glow-pulse 4s ease-in-out infinite;
    animation-delay: -2s;
  }

  @keyframes embers-rise {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0.6;
    }
    25% {
      transform: translateY(-25%) translateX(3%);
      opacity: 0.9;
    }
    50% {
      transform: translateY(-50%) translateX(-2%);
      opacity: 0.7;
    }
    75% {
      transform: translateY(-75%) translateX(4%);
      opacity: 0.5;
    }
    100% {
      transform: translateY(-100%) translateX(0);
      opacity: 0.3;
    }
  }

  @keyframes ember-glow-pulse {
    0%,
    100% {
      opacity: 0.6;
      transform: scaleY(1);
    }
    50% {
      opacity: 1;
      transform: scaleY(1.1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ember-glow::before,
    .ember-glow::after {
      animation: none !important;
    }
  }
</style>
