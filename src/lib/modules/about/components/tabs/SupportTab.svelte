<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import {
    CONTACT_EMAIL,
    SOCIAL_LINKS,
    SUPPORT_OPTIONS,
  } from "$shared/info/domain";
  import DevCard from "$shared/info/components/DevCard.svelte";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // State for copy feedback
  let copiedEmail = $state(false);
  let copyFailed = $state(false);
  let announceMessage = $state("");

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleSocialClick(_event: MouseEvent) {
    hapticService?.trigger("selection");
  }

  async function handleSupportClick(
    event: MouseEvent,
    supportName: string,
    supportUrl: string
  ) {
    hapticService?.trigger("selection");

    // Special handling for Zelle - copy email to clipboard
    if (supportName === "Zelle") {
      event.preventDefault(); // Prevent default link behavior

      try {
        await navigator.clipboard.writeText(supportUrl);
        copiedEmail = true;
        copyFailed = false;
        announceMessage = `Email ${supportUrl} copied to clipboard. Paste it in your bank's Zelle app to send your donation.`;
        hapticService?.trigger("success");

        // Reset after 3 seconds
        setTimeout(() => {
          copiedEmail = false;
          announceMessage = "";
        }, 3000);
      } catch (error) {
        console.error("Failed to copy email:", error);
        copyFailed = true;
        announceMessage = `Failed to copy email. Please manually copy ${supportUrl}`;

        // Show error state briefly, then open mailto fallback
        setTimeout(() => {
          copyFailed = false;
          announceMessage = "";
          window.location.href = `mailto:${supportUrl}?subject=Zelle%20Donation`;
        }, 2000);
      }
      return;
    }
  }

  function handleDevLinkClick() {
    hapticService?.trigger("selection");
  }
</script>

<!-- Support Tab - Help Keep TKA Alive -->
<div class="support-tab">
  <!-- Screen reader announcements -->
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    {announceMessage}
  </div>

  <!-- Introduction -->
  <section class="intro-section">
    <h1>Support TKA</h1>
    <p class="intro-text">
      TKA Studio is <strong>free and open source</strong>. Your support helps
      keep it alive and growing. Whether you contribute financially or help
      build the platform,
      <strong>every contribution makes a difference</strong>.
    </p>
    <div class="impact-message">
      <i class="fas fa-heart impact-icon"></i>
      <p>
        Donations fund hosting costs, development time, and help us keep TKA
        free for the entire flow arts community
      </p>
    </div>
  </section>

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

  <!-- Developer Resources Section -->
  <section class="dev-section" aria-labelledby="dev-heading">
    <h2 id="dev-heading">
      <i class="fas fa-code" aria-hidden="true"></i>
      For Developers
    </h2>
    <p class="section-description">
      TKA Studio is open source. Contribute code, report bugs, or request
      features
    </p>
    <div class="dev-cards" role="list">
      <div role="listitem">
        <DevCard
          href="https://discord.gg/tka"
          icon="fab fa-discord"
          title="Join Our Discord Community"
          description="Get help, share feedback, and chat directly with the developer"
          highlight={true}
          onclick={handleDevLinkClick}
        />
      </div>

      <div role="listitem">
        <DevCard
          href="https://github.com/austencloud/tka-studio"
          icon="fab fa-github"
          title="View on GitHub"
          description="Explore the source code and contribute"
          onclick={handleDevLinkClick}
        />
      </div>

      <div role="listitem">
        <DevCard
          href="https://github.com/austencloud/tka-studio/issues/new"
          icon="fas fa-bug"
          title="Report Bug or Request Feature"
          description="Help improve TKA with your feedback"
          onclick={handleDevLinkClick}
        />
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section class="contact-section" aria-labelledby="contact-heading">
    <h3 id="contact-heading">Get in Touch</h3>
    <p>
      Have questions or feedback? Email us at
      <a
        href="mailto:{CONTACT_EMAIL}"
        class="email-link"
        aria-label="Email TKA at {CONTACT_EMAIL}">{CONTACT_EMAIL}</a
      >
    </p>
  </section>

  <!-- Thank You Message -->
  <div class="thank-you-section">
    <i class="fas fa-sparkles" aria-hidden="true"></i>
    <p>
      <strong>Thank you</strong> for being part of the TKA community!<br />
      Your support, whether through donations, code contributions, or sharing with
      friends, helps keep flow arts accessible to all.
    </p>
  </div>
</div>

<style>
  /* Spacing System - Consistent rhythm throughout */
  :root {
    --section-spacing: clamp(3rem, 6vw, 5rem);
    --section-header-spacing: clamp(1.25rem, 3vw, 2rem);
    --card-gap: clamp(1.25rem, 2.5vw, 1.75rem);
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .support-tab {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 2vw, 1.5rem)
      clamp(2rem, 5vw, 4rem);
    background: transparent;
    scroll-behavior: smooth;
  }

  /* Section Separators - Subtle visual rhythm */
  section + section {
    margin-top: var(--section-spacing);
    position: relative;
  }

  section + section::before {
    content: "";
    position: absolute;
    top: calc(var(--section-spacing) / -2);
    left: 50%;
    transform: translateX(-50%);
    width: clamp(100px, 30%, 300px);
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(236, 72, 153, 0.2) 20%,
      rgba(236, 72, 153, 0.3) 50%,
      rgba(236, 72, 153, 0.2) 80%,
      transparent
    );
    opacity: 0.7;
  }

  /* No separator before intro */
  .intro-section::before {
    display: none;
  }

  /* Shared Section Styles */
  section {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Introduction Section */
  .intro-section {
    text-align: center;
    max-width: 800px;
    padding-bottom: clamp(1rem, 3vw, 2rem);
  }

  .intro-section h1 {
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: var(--spacing-md);
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 900;
  }

  .intro-text {
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: var(--spacing-lg);
  }

  .intro-text strong {
    color: var(--text-color);
    font-weight: 600;
  }

  /* Impact Message */
  .impact-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(
      135deg,
      rgba(236, 72, 153, 0.08) 0%,
      rgba(219, 39, 119, 0.04) 100%
    );
    border: 1px solid rgba(236, 72, 153, 0.2);
    border-radius: 0.75rem;
    margin-top: var(--spacing-lg);
  }

  .impact-icon {
    font-size: 1.5rem;
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: pulse-heart 2s ease-in-out infinite;
  }

  @keyframes pulse-heart {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .impact-message p {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
    font-style: italic;
  }

  /* Shared Section Heading Styles */
  section h2 {
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

  section h2 i {
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

  /* Button Grid - Responsive by default */
  .button-grid {
    display: grid;
    gap: var(--card-gap);
    width: 100%;
    margin: 0 auto;
  }

  /* Donate Grid - scales with screen size */
  .donate-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    max-width: 800px;
    margin: 0 auto;
  }

  /* Social Grid - flexible layout */
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

  /* Subtle shimmer effect on buttons */
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

  /* Focus styles for keyboard navigation */
  .support-button:focus-visible {
    outline: 2px solid var(--brand-color);
    outline-offset: 3px;
    border-color: var(--brand-color);
  }

  /* Success state - email copied */
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

  /* Failed state - clipboard copy failed */
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

  /* Developer Cards */
  .dev-cards {
    display: flex;
    flex-direction: column;
    gap: var(--card-gap);
    max-width: 700px;
    margin: 0 auto;
  }

  /* Contact Section */
  .contact-section {
    text-align: center;
    max-width: 700px;
    padding: clamp(1.5rem, 3vw, 2rem);
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 1.25rem;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .contact-section h3 {
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
    font-size: 1.25rem;
  }

  .contact-section p {
    color: var(--text-secondary);
    margin: 0;
  }

  .email-link {
    color: #ec4899;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .email-link:hover {
    color: #db2777;
    text-decoration: underline;
  }

  .email-link:focus-visible {
    outline: 2px solid #ec4899;
    outline-offset: 2px;
    border-radius: 2px;
  }

  /* Thank You Section */
  .thank-you-section {
    text-align: center;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    padding: clamp(1.5rem, 3vw, 2.5rem);
    background: linear-gradient(
      135deg,
      rgba(236, 72, 153, 0.06) 0%,
      rgba(139, 92, 246, 0.06) 100%
    );
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(236, 72, 153, 0.2);
    border-radius: 1.25rem;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.08),
      0 4px 12px rgba(236, 72, 153, 0.08);
  }

  .thank-you-section::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(236, 72, 153, 0.1) 0%,
      transparent 70%
    );
    animation: rotate-gradient 10s linear infinite;
    pointer-events: none;
  }

  @keyframes rotate-gradient {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .thank-you-section i {
    font-size: 2rem;
    background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: var(--spacing-sm);
    display: inline-block;
  }

  .thank-you-section p {
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    position: relative;
    z-index: 1;
  }

  .thank-you-section strong {
    color: var(--text-color);
    font-weight: 600;
  }

  /* Large Desktop - Optimize for wide screens */
  @media (min-width: 1440px) {
    section {
      max-width: 1400px;
    }

    .donate-grid {
      max-width: 900px;
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

  /* Desktop - Standard layout */
  @media (min-width: 1025px) and (max-width: 1439px) {
    .donate-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 800px;
    }

    .social-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 700px;
    }
  }

  /* Tablet - 2-3 column layouts */
  @media (min-width: 769px) and (max-width: 1024px) {
    .donate-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 700px;
    }

    .social-grid {
      grid-template-columns: repeat(3, 1fr);
      max-width: 650px;
    }

    .support-button {
      min-height: 110px;
    }
  }

  /* Small Tablet - 2 column layout */
  @media (min-width: 600px) and (max-width: 768px) {
    .support-tab {
      padding: var(--spacing-lg) var(--spacing-md);
    }

    .donate-grid,
    .social-grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 100%;
    }

    .support-button {
      min-height: 110px;
    }

    .impact-message {
      flex-direction: row;
    }
  }

  /* Large Phone - 2 column layout */
  @media (min-width: 480px) and (max-width: 599px) {
    .support-tab {
      padding: var(--spacing-lg) var(--spacing-md);
    }

    .donate-grid,
    .social-grid {
      grid-template-columns: repeat(2, 1fr);
      max-width: 100%;
    }

    .support-button {
      min-height: 100px;
    }

    .impact-message {
      flex-direction: column;
      text-align: center;
    }

    .icon-circle {
      width: 3rem;
      height: 3rem;
      font-size: 1.5rem;
    }
  }

  /* Small Phone - Single column */
  @media (max-width: 479px) {
    :root {
      --section-spacing: clamp(2rem, 5vw, 3rem);
      --section-header-spacing: clamp(1rem, 2.5vw, 1.5rem);
      --card-gap: 1rem;
    }

    .support-tab {
      padding: clamp(1rem, 3vw, 1.5rem) clamp(0.875rem, 2vw, 1rem)
        clamp(1.5rem, 4vw, 2rem);
    }

    .donate-grid,
    .social-grid {
      grid-template-columns: 1fr;
      max-width: 100%;
    }

    .support-button {
      min-height: 100px;
    }

    .impact-message {
      flex-direction: column;
      text-align: center;
      padding: clamp(0.875rem, 2vw, 1.25rem);
    }

    .icon-circle {
      width: 3rem;
      height: 3rem;
      font-size: 1.5rem;
    }

    .intro-section h1 {
      font-size: clamp(1.75rem, 4vw, 2rem);
    }

    /* Reduce separator visibility on mobile */
    section + section::before {
      opacity: 0.5;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .support-tab {
      scroll-behavior: auto;
    }

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
