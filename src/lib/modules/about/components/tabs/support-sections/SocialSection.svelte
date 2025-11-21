<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { SOCIAL_LINKS } from "$shared/info/domain";

  let {
    hapticService = null,
  }: {
    hapticService: IHapticFeedbackService | null;
  } = $props();

  function handleSocialClick() {
    hapticService?.trigger("selection");
  }
</script>

<!-- Social Media Section -->
<section class="support-section" aria-labelledby="social-heading">
  <h2 id="social-heading">
    <i class="fas fa-share-nodes" aria-hidden="true"></i>
    Connect & Share
  </h2>
  <p class="section-description">
    Follow us on social media and help spread the word
  </p>
  <div
    class="button-grid social-grid"
    role="group"
    aria-label="Social media links"
  >
    {#each SOCIAL_LINKS as social}
      <a
        class="support-button"
        href={social.url}
        target="_blank"
        rel="noopener noreferrer"
        style="--brand-color: {social.color}"
        aria-label={`Follow TKA on ${social.name}`}
        title={`Follow us on ${social.name}`}
        onclick={handleSocialClick}
      >
        <div class="icon-circle" aria-hidden="true">
          <i class={social.icon}></i>
        </div>
        <span class="button-label">{social.name}</span>
      </a>
    {/each}
  </div>
</section>

<style>
  /* Shared Section Styles */
  .support-section {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .support-section h2 {
    text-align: center;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    color: var(--text-color);
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
    font-weight: 700;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  .support-section h2 i {
    font-size: 0.9em;
    opacity: 0.9;
  }

  .section-description {
    text-align: center;
    font-size: clamp(0.9375rem, 2vw, 1.0625rem);
    color: var(--text-secondary);
    margin-bottom: clamp(1.75rem, 3.5vw, 2.75rem);
    font-style: italic;
    line-height: 1.6;
    opacity: 0.9;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Button Grid */
  .button-grid {
    display: grid;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
    width: 100%;
    margin: 0 auto;
  }

  .social-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    max-width: 700px;
    margin: 0 auto;
  }

  .support-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    text-decoration: none;
    color: white;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.04) 100%
    );
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    transition: all 0.3s ease;
    min-height: 120px;
    position: relative;
    overflow: hidden;
  }

  .support-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 100%
    );
    transition: left 0.5s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .support-button:hover::before {
      left: 100%;
    }

    .support-button:hover {
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.12) 0%,
        rgba(255, 255, 255, 0.06) 100%
      );
      border-color: var(--brand-color);
      transform: translateY(-4px);
      box-shadow:
        0 8px 24px rgba(0, 0, 0, 0.2),
        0 0 0 1px var(--brand-color);
    }

    .support-button:hover .icon-circle {
      transform: scale(1.1) rotate(5deg);
      box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.3),
        0 0 20px var(--brand-color),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    }
  }

  .support-button:focus-visible {
    outline: 2px solid var(--brand-color);
    outline-offset: 3px;
    border-color: var(--brand-color);
  }

  .support-button:active {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.08) 100%
    );
    transform: translateY(-1px) scale(0.98);
    transition-duration: 0.05s;
  }

  .icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    font-size: 1.75rem;
    color: white;
    background: var(--brand-color);
    border-radius: 50%;
    box-shadow:
      0 2px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    z-index: 1;
  }

  .button-label {
    font-size: 0.875rem;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
    position: relative;
    z-index: 1;
  }

  /* Large Desktop */
  @media (min-width: 1440px) {
    .support-section {
      max-width: 1400px;
    }

    .social-grid {
      max-width: 800px;
    }

    .support-button {
      min-height: 140px;
      padding: clamp(1.25rem, 2vw, 1.75rem);
    }

    .icon-circle {
      width: 4rem;
      height: 4rem;
      font-size: 2rem;
    }
  }

  /* Desktop */
  @media (min-width: 1025px) and (max-width: 1439px) {
    .social-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 700px;
    }
  }

  /* Tablet */
  @media (min-width: 769px) and (max-width: 1024px) {
    .social-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 650px;
    }

    .support-button {
      min-height: 110px;
    }
  }

  /* Small Tablet */
  @media (min-width: 600px) and (max-width: 768px) {
    .social-grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 100%;
    }

    .support-button {
      min-height: 110px;
    }
  }

  /* Large Phone */
  @media (min-width: 480px) and (max-width: 599px) {
    .social-grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 100%;
    }

    .support-button {
      min-height: 100px;
    }

    .icon-circle {
      width: 3rem;
      height: 3rem;
      font-size: 1.5rem;
    }
  }

  /* Small Phone */
  @media (max-width: 479px) {
    .social-grid {
      grid-template-columns: 1fr;
      max-width: 100%;
    }

    .support-button {
      min-height: 100px;
    }

    .icon-circle {
      width: 3rem;
      height: 3rem;
      font-size: 1.5rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .support-button,
    .icon-circle,
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    .support-button:hover,
    .support-button:hover .icon-circle {
      transform: none;
    }
  }
</style>
