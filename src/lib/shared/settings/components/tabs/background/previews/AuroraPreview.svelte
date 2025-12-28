<!--
  AuroraPreview.svelte

  Animated aurora borealis background preview with flowing colorful lights.
-->
<div class="background-preview aurora"></div>

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

  .aurora {
    background: linear-gradient(180deg, #0a0a0f 0%, #1a1a20 100%);
  }

  .aurora::before {
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
    animation-delay: -8s;
    filter: blur(clamp(18px, 5.5cqi, 32px)) brightness(1.2);
  }

  .aurora::after {
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
    animation-delay: -12s;
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

  @media (prefers-reduced-motion: reduce) {
    .aurora::before,
    .aurora::after {
      animation: none !important;
    }
  }
</style>
