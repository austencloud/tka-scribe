<!--
  NightSkyPreview.svelte

  Animated night sky background preview with twinkling stars and glowing moon.
-->
<div class="background-preview night-sky"></div>

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

  .night-sky {
    background: linear-gradient(
      180deg,
      #1a1a3e 0%,
      #2a2a4e 30%,
      #26314e 70%,
      #1f4670 100%
    );
  }

  .night-sky::before {
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
      radial-gradient(circle, rgba(255, 255, 255, 0.9) 1.5px, transparent 1.5px),
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

  .night-sky::after {
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

  @media (prefers-reduced-motion: reduce) {
    .night-sky::before,
    .night-sky::after {
      animation: none !important;
    }
  }
</style>
