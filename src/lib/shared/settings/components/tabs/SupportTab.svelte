<!-- SupportTab.svelte - Support & Donation Options -->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "../../../inversify/di";
  import { TYPES } from "../../../inversify/types";
  import type { IHapticFeedbackService } from "../../../application/services/contracts/IHapticFeedbackService";
  import { SOCIAL_LINKS } from "../../../info/domain/content";

  let hapticService: IHapticFeedbackService | null = $state(null);
  let copiedEmail = $state(false);
  let isVisible = $state(false);

  const paymentOptions = [
    {
      name: "PayPal",
      icon: "fab fa-paypal",
      url: "https://paypal.me/austencloud",
      bg: "#0070ba",
      hoverBg: "#005ea6",
    },
    {
      name: "Venmo",
      icon: "venmo",
      url: "https://venmo.com/austencloud",
      bg: "#008CFF",
      hoverBg: "#0070cc",
    },
    {
      name: "Zelle",
      icon: "fas fa-bolt",
      url: "austencloud@gmail.com",
      bg: "#6d1ed4",
      hoverBg: "#5a18b0",
    },
  ];

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch {
      // Service may not be available
    }
    setTimeout(() => (isVisible = true), 30);
  });

  async function handlePaymentClick(
    event: MouseEvent,
    name: string,
    url: string
  ) {
    hapticService?.trigger("selection");
    if (name === "Zelle") {
      event.preventDefault();
      try {
        await navigator.clipboard.writeText(url);
        copiedEmail = true;
        hapticService?.trigger("success");
        setTimeout(() => (copiedEmail = false), 2500);
      } catch {
        window.location.href = `mailto:${url}?subject=Zelle%20Donation`;
      }
    }
  }

  function handleLinkClick() {
    hapticService?.trigger("selection");
  }
</script>

<div class="support-tab" class:visible={isVisible}>
  <!-- Hero Section -->
  <section class="glass-card hero-card">
    <div class="hero-content">
      <div class="heart-icon">
        <i class="fas fa-heart"></i>
      </div>
      <div class="hero-text">
        <h2>Love TKA Scribe?</h2>
        <p>Your support keeps this project free and helps fund new features for the flow arts community.</p>
      </div>
    </div>
  </section>

  <!-- Donation Options -->
  <section class="glass-card donation-card">
    <header class="card-header">
      <div class="card-icon">
        <i class="fas fa-gift"></i>
      </div>
      <div class="card-header-text">
        <h3 class="card-title">Support Development</h3>
        <p class="card-subtitle">Choose your preferred method</p>
      </div>
    </header>
    <div class="donation-buttons">
      {#each paymentOptions as option}
        <a
          class="donate-btn"
          class:success={option.name === "Zelle" && copiedEmail}
          href={option.name === "Zelle" ? "#" : option.url}
          target={option.name === "Zelle" ? undefined : "_blank"}
          rel={option.name === "Zelle" ? undefined : "noopener noreferrer"}
          style="--btn-bg: {option.bg}; --btn-hover: {option.hoverBg}"
          onclick={(e) => handlePaymentClick(e, option.name, option.url)}
        >
          {#if option.icon === "venmo"}
            <svg viewBox="0 0 24 24" fill="currentColor" class="venmo-svg">
              <path
                d="M19.5 3c.5.8.7 1.7.7 2.8 0 3.5-3 8-5.4 11.2H8.6L6 3.5h5.2l1.5 12c1.2-2 2.7-5.2 2.7-7.3 0-1-.2-1.7-.5-2.3l6.6-.2z"
              />
            </svg>
          {:else}
            <i class={option.icon}></i>
          {/if}
          <span>
            {option.name === "Zelle" && copiedEmail
              ? "Email Copied!"
              : option.name}
          </span>
        </a>
      {/each}
    </div>
  </section>

  <!-- Social Links -->
  <section class="glass-card social-card">
    <header class="card-header">
      <div class="card-icon">
        <i class="fas fa-users"></i>
      </div>
      <div class="card-header-text">
        <h3 class="card-title">Connect With Us</h3>
        <p class="card-subtitle">Follow for updates & community</p>
      </div>
    </header>
    <div class="social-grid">
      {#each SOCIAL_LINKS.slice(0, 4) as social}
        <a
          class="social-btn"
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          onclick={handleLinkClick}
          aria-label={social.name}
          style="--brand: {social.color}"
        >
          <i class={social.icon}></i>
          <span>{social.name}</span>
        </a>
      {/each}
    </div>
  </section>
</div>

<style>
  .support-tab {
    container-type: inline-size;
    container-name: support-tab;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: clamp(12px, 3cqi, 24px);
    gap: clamp(12px, 2cqi, 20px);
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .support-tab.visible {
    opacity: 1;
  }

  /* Glass Card */
  .glass-card {
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 2.5cqi, 16px);
    padding: clamp(16px, 3cqi, 24px);
    border-radius: clamp(14px, 3cqi, 20px);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  /* Hero Card */
  .hero-card {
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 15%, transparent) 0%,
      color-mix(in srgb, var(--theme-accent, #6366f1) 10%, transparent) 100%
    );
  }

  .hero-content {
    display: flex;
    align-items: center;
    gap: clamp(16px, 3cqi, 24px);
  }

  .heart-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(56px, 12cqi, 72px);
    height: clamp(56px, 12cqi, 72px);
    background: linear-gradient(
      135deg,
      var(--theme-accent, #6366f1) 0%,
      var(--theme-accent-strong, #8b5cf6) 100%
    );
    border-radius: clamp(14px, 3cqi, 18px);
    color: white;
    font-size: clamp(24px, 5cqi, 32px);
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  .hero-text h2 {
    margin: 0 0 8px 0;
    font-size: clamp(18px, 4cqi, 24px);
    font-weight: 700;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .hero-text p {
    margin: 0;
    font-size: clamp(13px, 2.5cqi, 15px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    line-height: 1.5;
  }

  /* Card Header */
  .card-header {
    display: flex;
    align-items: center;
    gap: clamp(10px, 2cqi, 14px);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(36px, 8cqi, 44px);
    height: clamp(36px, 8cqi, 44px);
    border-radius: clamp(8px, 2cqi, 12px);
    font-size: clamp(16px, 3cqi, 18px);
    flex-shrink: 0;
    background: color-mix(in srgb, var(--theme-accent) 20%, transparent);
    color: var(--theme-accent);
  }

  .card-header-text {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: clamp(15px, 3cqi, 17px);
    font-weight: 600;
    margin: 0;
    color: var(--theme-text);
  }

  .card-subtitle {
    font-size: clamp(11px, 2cqi, 13px);
    color: var(--theme-text-dim);
    margin: 3px 0 0 0;
  }

  /* Donation Buttons */
  .donation-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .donate-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: var(--min-touch-target);
    padding: 14px 20px;
    background: var(--btn-bg);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .donate-btn:hover {
    background: var(--btn-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--theme-shadow, #000) 25%, transparent);
  }

  .donate-btn:active {
    transform: translateY(0);
  }

  .donate-btn.success {
    background: var(--semantic-success, #10b981) !important;
  }

  .donate-btn i {
    font-size: 18px;
  }

  .venmo-svg {
    width: 20px;
    height: 20px;
  }

  /* Social Grid */
  .social-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: var(--min-touch-target);
    padding: 12px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .social-btn:hover {
    background: color-mix(in srgb, var(--brand) 20%, transparent);
    border-color: var(--brand);
    color: var(--brand);
    transform: translateY(-2px);
  }

  .social-btn i {
    font-size: 16px;
  }

  /* Mobile: stack hero vertically */
  @container support-tab (max-width: 400px) {
    .hero-content {
      flex-direction: column;
      text-align: center;
    }

    .social-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .heart-icon {
      animation: none;
    }

    .donate-btn,
    .social-btn {
      transition: none;
    }

    .donate-btn:hover,
    .social-btn:hover {
      transform: none;
    }
  }
</style>
