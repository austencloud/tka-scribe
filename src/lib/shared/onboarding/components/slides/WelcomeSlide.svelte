<!-- WelcomeSlide - Welcome slide for module onboarding -->
<script lang="ts">
  const { icon, title, subtitle, description, color } = $props<{
    icon: string;
    title: string;
    subtitle: string;
    description: string;
    color: string;
  }>();
</script>

<div class="slide-content welcome-slide">
  <div class="slide-icon welcome-icon" style="--icon-color: {color}">
    <i class="fas {icon}" aria-hidden="true"></i>
  </div>
  <h1 class="slide-title">{title}</h1>
  <p class="slide-subtitle">{subtitle}</p>
  <p class="slide-description">{description}</p>
  <p class="swipe-hint">
    <i class="fas fa-hand-pointer" aria-hidden="true"></i>
    <span class="touch-hint">Swipe or tap Next to explore</span>
    <span class="keyboard-nav-hint">
      Use <kbd>←</kbd><kbd>→</kbd> or click Next
    </span>
  </p>
</div>

<style>
  .slide-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 500px;
    width: 100%;
  }

  .slide-icon {
    width: 5rem;
    height: 5rem;
    display: grid;
    place-items: center;
    border-radius: 1.5rem;
    font-size: 2.5rem;
    color: white;
    margin-bottom: 1.25rem;
  }

  .welcome-icon {
    background: var(--icon-color);
    box-shadow: 0 8px 32px color-mix(in srgb, var(--icon-color) 40%, transparent);
  }

  .slide-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 0.25rem;
  }

  .slide-subtitle {
    font-size: 1rem;
    color: var(--theme-text-dim);
    margin: 0 0 0.75rem;
  }

  .slide-description {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.45);
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .swipe-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-compact, 0.875rem); /* WCAG AAA: 12px minimum */
    color: rgba(255, 255, 255, 0.5); /* Improved contrast for WCAG AAA */
    margin-top: 1.5rem;
  }

  @media (prefers-reduced-motion: no-preference) {
    .swipe-hint i {
      animation: swipeHint 2s ease-in-out infinite;
    }
  }

  .touch-hint {
    display: none;
  }

  .keyboard-nav-hint {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .keyboard-nav-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    padding: 0.125rem 0.25rem;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke-strong);
    border-radius: 3px;
    font-family: inherit;
    font-size: 0.6875rem;
    color: var(--theme-text-dim);
  }

  @media (hover: none) and (pointer: coarse) {
    .touch-hint {
      display: inline;
    }
    .keyboard-nav-hint {
      display: none;
    }
  }

  @keyframes swipeHint {
    0%,
    100% {
      transform: translateX(0);
    }
    50% {
      transform: translateX(8px);
    }
  }

  @media (max-width: 500px) {
    .slide-icon {
      width: 4rem;
      height: 4rem;
      font-size: 2rem;
    }
  }

  @media (min-width: 900px) {
    .slide-content {
      max-width: 600px;
    }

    .slide-icon {
      width: 6rem;
      height: 6rem;
      font-size: 3rem;
      border-radius: 1.75rem;
    }

    .slide-title {
      font-size: 2.25rem;
    }

    .slide-description {
      font-size: 1.0625rem;
    }
  }
</style>
