<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { SUPPORT_OPTIONS } from "$shared/info/domain";

  let {
    hapticService = null,
    copiedEmail = $bindable(false),
    copyFailed = $bindable(false),
    _announceMessage = $bindable(""),
  }: {
    hapticService: IHapticFeedbackService | null;
    copiedEmail?: boolean;
    copyFailed?: boolean;
    announceMessage?: string;
  } = $props();

  async function handleSupportClick(
    event: MouseEvent,
    supportName: string,
    supportUrl: string
  ) {
    hapticService?.trigger("selection");

    // Special handling for Zelle - copy email to clipboard
    if (supportName === "Zelle") {
      event.preventDefault();

      try {
        await navigator.clipboard.writeText(supportUrl);
        copiedEmail = true;
        copyFailed = false;
        announceMessage = `Email ${supportUrl} copied to clipboard. Paste it in your bank's Zelle app to send your donation.`;
        hapticService?.trigger("success");

        setTimeout(() => {
          copiedEmail = false;
          announceMessage = "";
        }, 3000);
      } catch (error) {
        console.error("Failed to copy email:", error);
        copyFailed = true;
        announceMessage = `Failed to copy email. Please manually copy ${supportUrl}`;

        setTimeout(() => {
          copyFailed = false;
          announceMessage = "";
          window.location.href = `mailto:${supportUrl}?subject=Zelle%20Donation`;
        }, 2000);
      }
      return;
    }
  }
</script>

<!-- Financial Support Section -->
<section class="support-section" aria-labelledby="donate-heading">
  <h2 id="donate-heading">
    <i class="fas fa-heart" aria-hidden="true"></i>
    Donate
  </h2>
  <p class="section-description">
    Help fund hosting, development, and keep TKA free for everyone
  </p>
  <div
    class="button-grid donate-grid"
    role="group"
    aria-label="Donation options"
  >
    {#each SUPPORT_OPTIONS as support}
      <a
        class="support-button"
        class:copied={support.name === "Zelle" && copiedEmail}
        class:failed={support.name === "Zelle" && copyFailed}
        href={support.name === "Zelle" ? "#" : support.url}
        target={support.name === "Zelle" ? undefined : "_blank"}
        rel={support.name === "Zelle" ? undefined : "noopener noreferrer"}
        style="--brand-color: {support.color}"
        aria-label={support.name === "Zelle"
          ? copiedEmail
            ? `Zelle email copied to clipboard. Email: ${support.url}`
            : `Copy Zelle email ${support.url} to clipboard`
          : `Donate via ${support.name}`}
        title={support.name === "Zelle"
          ? copiedEmail
            ? "Email copied! Paste in your bank's Zelle app"
            : "Copy email to use in your bank's Zelle app"
          : `Donate via ${support.name}`}
        onclick={(event) =>
          handleSupportClick(event, support.name, support.url)}
      >
        <div class="icon-circle" aria-hidden="true">
          <i class={support.icon}></i>
        </div>
        <span class="button-label">
          {#if support.name === "Zelle" && copiedEmail}
            <span class="copied-label">
              <i class="fas fa-check-circle" aria-hidden="true"></i>
              Email Copied!
            </span>
          {:else if support.name === "Zelle" && copyFailed}
            <span class="failed-label">
              <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
              Copy Failed
            </span>
          {:else if support.name === "Zelle"}
            <span class="zelle-label">
              Zelle
              <span class="copy-hint">(tap to copy)</span>
            </span>
          {:else}
            {support.name}
          {/if}
        </span>
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

  .donate-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    max-width: 800px;
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

  .support-button.copied {
    background: linear-gradient(
      135deg,
      rgba(40, 167, 69, 0.2) 0%,
      rgba(40, 167, 69, 0.1) 100%
    );
    border-color: #28a745;
    box-shadow:
      0 4px 16px rgba(40, 167, 69, 0.3),
      0 0 0 1px #28a745;
    animation: success-pulse 0.5s ease-out;
  }

  @keyframes success-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  .support-button.copied .icon-circle {
    background: linear-gradient(135deg, #28a745 0%, #20893a 100%);
    box-shadow: 0 0 20px rgba(40, 167, 69, 0.5);
  }

  .support-button.failed {
    background: linear-gradient(
      135deg,
      rgba(220, 53, 69, 0.2) 0%,
      rgba(220, 53, 69, 0.1) 100%
    );
    border-color: #dc3545;
    box-shadow:
      0 4px 16px rgba(220, 53, 69, 0.3),
      0 0 0 1px #dc3545;
    animation: shake 0.5s ease-out;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }

  .support-button.failed .icon-circle {
    background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%);
    box-shadow: 0 0 20px rgba(220, 53, 69, 0.5);
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

  .zelle-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
  }

  .copy-hint {
    font-size: 0.6875rem;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
  }

  .copied-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #28a745;
    font-weight: 600;
    animation: fade-in 0.3s ease-in;
  }

  .copied-label i {
    font-size: 1rem;
    animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .failed-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    color: #dc3545;
    font-weight: 600;
    animation: fade-in 0.3s ease-in;
  }

  .failed-label i {
    font-size: 1rem;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scale-in {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  /* Large Desktop */
  @media (min-width: 1440px) {
    .support-section {
      max-width: 1400px;
    }

    .donate-grid {
      max-width: 900px;
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
    .donate-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 800px;
    }
  }

  /* Tablet */
  @media (min-width: 769px) and (max-width: 1024px) {
    .donate-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 700px;
    }

    .support-button {
      min-height: 110px;
    }
  }

  /* Small Tablet */
  @media (min-width: 600px) and (max-width: 768px) {
    .donate-grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 100%;
    }

    .support-button {
      min-height: 110px;
    }
  }

  /* Large Phone */
  @media (min-width: 480px) and (max-width: 599px) {
    .donate-grid {
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
    .donate-grid {
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
