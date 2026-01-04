<!--
  AutumnDriftPreview.svelte

  Animated autumn drift background with falling colorful leaves.
-->
<div class="background-preview autumn-drift"></div>

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

  .autumn-drift {
    background: linear-gradient(
      180deg,
      #1a1520 0%,
      #2d1f25 25%,
      #3a2820 50%,
      #2a1a15 75%,
      #1f1510 100%
    );
  }

  /* Falling leaves - front layer with wind drift */
  .autumn-drift::before {
    content: "";
    position: absolute;
    top: -80%;
    left: -20%;
    width: 140%;
    height: 180%;
    background:
      /* Orange maple-ish */
      radial-gradient(
        ellipse 14px 8px at 50% 50%,
        #ff9040 0%,
        rgba(255, 130, 50, 0.6) 50%,
        transparent 100%
      ),
      /* Deep red */
      radial-gradient(
          ellipse 12px 7px at 50% 50%,
          #cc4030 0%,
          rgba(180, 50, 35, 0.6) 50%,
          transparent 100%
        ),
      /* Golden yellow */
      radial-gradient(
          ellipse 16px 9px at 50% 50%,
          #e8b830 0%,
          rgba(220, 170, 40, 0.6) 50%,
          transparent 100%
        ),
      /* Rust brown */
      radial-gradient(
          ellipse 11px 6px at 50% 50%,
          #b86830 0%,
          rgba(160, 90, 40, 0.6) 50%,
          transparent 100%
        ),
      /* Bright orange */
      radial-gradient(
          ellipse 13px 7px at 50% 50%,
          #f07028 0%,
          rgba(230, 100, 35, 0.6) 50%,
          transparent 100%
        ),
      /* Crimson */
      radial-gradient(
          ellipse 10px 6px at 50% 50%,
          #a83828 0%,
          rgba(150, 45, 35, 0.6) 50%,
          transparent 100%
        );
    background-size:
      65px 75px,
      85px 65px,
      55px 85px,
      75px 70px,
      70px 80px,
      80px 60px;
    background-position:
      10% 10%,
      50% 30%,
      85% 15%,
      25% 55%,
      65% 50%,
      40% 75%;
    animation: autumn-drift-front 12s linear infinite;
    animation-delay: -6s;
  }

  /* Falling leaves - back layer, smaller and blurred */
  .autumn-drift::after {
    content: "";
    position: absolute;
    top: -80%;
    left: -20%;
    width: 140%;
    height: 180%;
    background:
      radial-gradient(
        ellipse 9px 5px at 50% 50%,
        rgba(255, 160, 70, 0.7) 0%,
        rgba(230, 130, 55, 0.4) 50%,
        transparent 100%
      ),
      radial-gradient(
        ellipse 8px 5px at 50% 50%,
        rgba(200, 70, 45, 0.65) 0%,
        rgba(170, 55, 40, 0.35) 50%,
        transparent 100%
      ),
      radial-gradient(
        ellipse 10px 6px at 50% 50%,
        rgba(230, 190, 50, 0.7) 0%,
        rgba(200, 160, 45, 0.4) 50%,
        transparent 100%
      ),
      radial-gradient(
        ellipse 7px 4px at 50% 50%,
        rgba(180, 100, 50, 0.6) 0%,
        rgba(150, 80, 45, 0.3) 50%,
        transparent 100%
      );
    background-size:
      95px 85px,
      75px 95px,
      105px 80px,
      85px 90px;
    background-position:
      30% 25%,
      70% 45%,
      20% 65%,
      80% 70%;
    animation: autumn-drift-back 16s linear infinite;
    animation-delay: -10s;
    filter: blur(1px);
    opacity: 0.6;
  }

  @keyframes autumn-drift-front {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg);
    }
    20% {
      transform: translateY(20%) translateX(6%) rotate(8deg);
    }
    40% {
      transform: translateY(40%) translateX(-4%) rotate(-6deg);
    }
    60% {
      transform: translateY(60%) translateX(8%) rotate(12deg);
    }
    80% {
      transform: translateY(80%) translateX(-5%) rotate(-8deg);
    }
    100% {
      transform: translateY(100%) translateX(0) rotate(0deg);
    }
  }

  @keyframes autumn-drift-back {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg);
    }
    25% {
      transform: translateY(25%) translateX(-8%) rotate(-10deg);
    }
    50% {
      transform: translateY(50%) translateX(6%) rotate(8deg);
    }
    75% {
      transform: translateY(75%) translateX(-10%) rotate(-14deg);
    }
    100% {
      transform: translateY(100%) translateX(0) rotate(0deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .autumn-drift::before,
    .autumn-drift::after {
      animation: none !important;
    }
  }
</style>
