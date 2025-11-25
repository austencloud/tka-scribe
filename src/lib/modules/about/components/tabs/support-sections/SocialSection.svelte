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
  /* Shared Section Styles - Admin Style */
  .support-section {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  .support-section h2 {
    text-align: center;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .support-section h2 i {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.5);
  }

  .section-description {
    text-align: center;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 20px;
    line-height: 1.5;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Button Grid - Admin Style */
  .button-grid {
    display: grid;
    gap: 12px;
    width: 100%;
    margin: 0 auto;
  }

  .social-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    max-width: 600px;
    margin: 0 auto;
  }

  .support-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px 16px;
    text-decoration: none;
    color: white;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    transition: all 0.2s ease;
    min-height: 100px;
  }

  @media (hover: hover) and (pointer: fine) {
    .support-button:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: var(--brand-color);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .support-button:hover .icon-circle {
      transform: scale(1.05);
    }
  }

  .support-button:focus-visible {
    outline: 2px solid var(--brand-color);
    outline-offset: 2px;
  }

  .support-button:active {
    transform: translateY(-1px) scale(0.98);
  }

  .icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 20px;
    color: white;
    background: var(--brand-color);
    border-radius: 12px;
    transition: transform 0.2s ease;
  }

  .button-label {
    font-size: 13px;
    font-weight: 500;
    text-align: center;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Tablet */
  @media (max-width: 768px) {
    .social-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Mobile */
  @media (max-width: 480px) {
    .social-grid {
      grid-template-columns: 1fr 1fr;
    }

    .support-button {
      min-height: 90px;
      padding: 16px 12px;
    }

    .icon-circle {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }

    .button-label {
      font-size: 12px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .support-button,
    .icon-circle {
      transition: none;
    }
  }
</style>
