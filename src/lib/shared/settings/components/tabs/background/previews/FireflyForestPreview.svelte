<!--
  FireflyForestPreview.svelte

  Animated firefly forest background with twinkling stars and drifting fireflies.
-->
<div class="background-preview firefly-forest"></div>

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

  .firefly-forest {
    background: linear-gradient(
      180deg,
      #080c14 0%,
      #0a1210 30%,
      #0c1a14 60%,
      #081510 100%
    );
  }

  /* Stars in sky + forest silhouette hint at bottom */
  .firefly-forest::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      /* Tiny stars */
      radial-gradient(circle at 15% 12%, white 0.5px, transparent 0.5px),
      radial-gradient(circle at 45% 8%, white 0.5px, transparent 0.5px),
      radial-gradient(circle at 72% 15%, var(--theme-text-dim) 0.5px, transparent 0.5px),
      radial-gradient(circle at 88% 10%, white 0.5px, transparent 0.5px),
      radial-gradient(circle at 30% 18%, var(--theme-text-dim) 0.5px, transparent 0.5px),
      /* Dark tree silhouette suggestion at bottom */
      linear-gradient(to top, rgba(0,0,0,0.6) 0%, var(--theme-shadow) 15%, transparent 30%);
    animation: stars-twinkle 4s ease-in-out infinite;
  }

  /* Fireflies - multiple sizes, drifting and glowing */
  .firefly-forest::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      /* Large bright fireflies */
      radial-gradient(circle at 22% 35%, rgba(180, 255, 100, 1) 0%, rgba(150, 230, 80, 0.6) 4px, rgba(120, 200, 60, 0.2) 8px, transparent 12px),
      radial-gradient(circle at 70% 45%, rgba(200, 255, 120, 1) 0%, rgba(170, 240, 90, 0.6) 3px, rgba(140, 210, 70, 0.2) 7px, transparent 11px),
      radial-gradient(circle at 48% 65%, rgba(190, 255, 110, 1) 0%, rgba(160, 235, 85, 0.6) 4px, rgba(130, 205, 65, 0.2) 8px, transparent 12px),
      /* Medium fireflies */
      radial-gradient(circle at 82% 30%, rgba(175, 250, 95, 0.9) 0%, rgba(145, 220, 75, 0.5) 3px, transparent 7px),
      radial-gradient(circle at 15% 60%, rgba(185, 255, 105, 0.9) 0%, rgba(155, 230, 85, 0.5) 3px, transparent 7px),
      radial-gradient(circle at 58% 38%, rgba(195, 255, 115, 0.85) 0%, rgba(165, 235, 90, 0.45) 2px, transparent 6px),
      /* Small distant fireflies */
      radial-gradient(circle at 35% 50%, rgba(170, 245, 90, 0.7) 0%, rgba(140, 215, 70, 0.3) 2px, transparent 4px),
      radial-gradient(circle at 88% 55%, rgba(180, 250, 100, 0.7) 0%, rgba(150, 220, 80, 0.3) 2px, transparent 4px),
      radial-gradient(circle at 42% 78%, rgba(175, 248, 95, 0.65) 0%, rgba(145, 218, 75, 0.25) 2px, transparent 4px);
    animation: fireflies-drift 6s ease-in-out infinite;
  }

  @keyframes stars-twinkle {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }

  @keyframes fireflies-drift {
    0%, 100% {
      transform: translate(0, 0);
      opacity: 0.7;
    }
    25% {
      transform: translate(2%, -1%);
      opacity: 1;
    }
    50% {
      transform: translate(-1%, 2%);
      opacity: 0.8;
    }
    75% {
      transform: translate(1%, -2%);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .firefly-forest::before,
    .firefly-forest::after {
      animation: none !important;
    }
  }
</style>
