<!--
  DeepOceanPreview.svelte

  Animated deep ocean background preview with rising bubbles.
-->
<div class="background-preview deep-ocean"></div>

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

  .deep-ocean {
    background: linear-gradient(180deg, #1d4d77 0%, #194a5b 50%, #0d2d47 100%);
  }

  .deep-ocean::before {
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
    animation-delay: -6s;
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

  @media (prefers-reduced-motion: reduce) {
    .deep-ocean::before {
      animation: none !important;
    }
  }
</style>
