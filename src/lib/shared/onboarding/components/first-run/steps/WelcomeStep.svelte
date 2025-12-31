<!--
  WelcomeStep - First screen of the first-run wizard

  Shows the TKA Scribe logo and welcome message.
  Simple, clean introduction to the app.
-->
<script lang="ts">
  interface Props {
    onNext: () => void;
  }

  const { onNext }: Props = $props();
</script>

<div class="welcome-step">
  <div class="logo-container">
    <i class="fas fa-infinity" aria-hidden="true"></i>
  </div>

  <h1 class="title">Welcome to TKA Scribe</h1>

  <p class="subtitle">The visual language for flow arts</p>

  <p class="description">
    TKA Scribe helps you <strong>create</strong>, <strong>learn</strong>, and
    <strong>share</strong> flow arts choreography using the Kinetic Alphabet
    notation system.
  </p>

  <p class="personalize-hint">
    Let's personalize your experience with a few quick questions.
  </p>

  <button class="next-button" onclick={onNext}>
    Get started <i class="fas fa-arrow-right" aria-hidden="true"></i>
  </button>
</div>

<style>
  .welcome-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    max-width: 520px;
    width: 100%;
    text-align: center;
    padding: 32px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .logo-container {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 15%,
      transparent
    );
    border-radius: 24px;
    font-size: var(--font-size-3xl, 2.5rem);
    color: var(--theme-accent-strong, #8b5cf6);
  }

  .title {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 1.1rem;
    font-weight: 500;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
  }

  .description {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    margin: 0;
  }

  .description strong {
    color: white;
    font-weight: 600;
  }

  .personalize-hint {
    font-size: 0.95rem;
    color: var(--theme-accent, #a78bfa);
    margin: 8px 0 0;
  }

  .next-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 28px;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 40%,
      transparent
    );
    border: 2px solid
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 60%, transparent);
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 12px;
  }

  .next-button:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 50%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 80%,
      transparent
    );
    box-shadow: 0 8px 24px
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
  }

  .next-button:active {
    transform: scale(0.98);
  }

  /* Mobile */
  @media (max-width: 480px) {
    .welcome-step {
      padding: 16px;
    }

    .logo-container {
      width: 80px;
      height: 80px;
      font-size: var(--font-size-3xl, 2rem);
    }

    .title {
      font-size: 1.5rem;
    }

    .subtitle,
    .personalize-hint {
      font-size: 1rem;
    }

    .description {
      font-size: 0.9rem;
    }

    .next-button {
      padding: 12px 24px;
      font-size: 1rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .next-button {
      transition: none;
    }

    .next-button:active {
      transform: none;
    }
  }
</style>
