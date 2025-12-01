<script lang="ts">
  /**
   * SupportPanel - Support and attribution panel
   */

  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { SOCIAL_LINKS } from "$lib/shared/info/domain";
  import { onMount } from "svelte";

  let hapticService: IHapticFeedbackService | null = $state(null);
  let copiedEmail = $state(false);

  const paymentOptions = [
    {
      name: "PayPal",
      icon: "fab fa-paypal",
      url: "https://paypal.me/austencloud",
      color: "#0070ba",
    },
    {
      name: "Venmo",
      icon: "venmo",
      url: "https://venmo.com/austencloud",
      color: "#3d95ce",
    },
    {
      name: "Zelle",
      icon: "fas fa-bolt",
      url: "austencloud@gmail.com",
      color: "#6d1ed4",
    },
  ];

  const resources = [
    {
      name: "Vulcan Tech Gospel",
      url: "https://noelyee.com/instruction/vulcan-tech-gospel/",
      creator: "Noel Yee & Jordan Campbell",
      color: "#f59e0b",
    },
    {
      name: "9 Square Theory",
      url: "https://www.spinmorepoi.com/advanced/",
      creator: "Charlie Cushing",
      color: "#8b5cf6",
    },
    {
      name: "Flow Arts Institute",
      url: "https://flowartsinstitute.com/",
      creator: "Community Organization",
      color: "#10b981",
    },
    {
      name: "Playpoi",
      url: "https://playpoi.com/",
      creator: "Nick Woolsey",
      color: "#3b82f6",
    },
  ];

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
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

<div class="support-panel">
  <div class="container">
    <header class="hero">
      <div class="hero__icon">
        <i class="fas fa-heart" aria-hidden="true"></i>
      </div>
      <div class="hero__text">
        <h1 class="hero__title">Support TKA</h1>
        <p class="hero__subtitle">
          Help keep this project free and open for everyone
        </p>
      </div>
    </header>

    <div class="cards-row">
      <section class="card">
        <h2 class="card__title">Donate</h2>
        <div class="card__buttons">
          {#each paymentOptions as option}
            <a
              class="action-btn"
              class:action-btn--success={option.name === "Zelle" && copiedEmail}
              href={option.name === "Zelle" ? "#" : option.url}
              target={option.name === "Zelle" ? undefined : "_blank"}
              rel={option.name === "Zelle" ? undefined : "noopener noreferrer"}
              style="--brand: {option.color}"
              onclick={(e) => handlePaymentClick(e, option.name, option.url)}
            >
              <div class="action-btn__icon">
                {#if option.icon === "venmo"}
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="venmo-svg"
                  >
                    <path
                      d="M19.5 3c.5.8.7 1.7.7 2.8 0 3.5-3 8-5.4 11.2H8.6L6 3.5h5.2l1.5 12c1.2-2 2.7-5.2 2.7-7.3 0-1-.2-1.7-.5-2.3l6.6-.2z"
                    />
                  </svg>
                {:else}
                  <i class={option.icon} aria-hidden="true"></i>
                {/if}
              </div>
              <span class="action-btn__label">
                {option.name === "Zelle" && copiedEmail
                  ? "Copied!"
                  : option.name}
              </span>
            </a>
          {/each}
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">Connect</h2>
        <div class="card__buttons">
          {#each SOCIAL_LINKS as social}
            <a
              class="action-btn"
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              style="--brand: {social.color}"
              onclick={handleLinkClick}
              aria-label={social.name}
            >
              <div class="action-btn__icon">
                <i class={social.icon} aria-hidden="true"></i>
              </div>
              <span class="action-btn__label">{social.name}</span>
            </a>
          {/each}
        </div>
      </section>
    </div>

    <section class="card card--wide">
      <h2 class="card__title">Other Learning Resources</h2>
      <div class="resources-grid">
        {#each resources as link}
          <a
            class="resource-card"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style="--brand: {link.color}"
            onclick={handleLinkClick}
          >
            <div class="resource-card__thumb">
              <span class="thumb-placeholder">IMAGE</span>
            </div>
            <div class="resource-card__info">
              <span class="resource-card__name">{link.name}</span>
              <span class="resource-card__creator">{link.creator}</span>
            </div>
            <i
              class="fas fa-external-link-alt resource-card__external"
              aria-hidden="true"
            ></i>
          </a>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .support-panel {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 32px 24px;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Hero */
  .hero {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .hero__icon {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #ec4899, #f43f5e);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 6px 24px rgba(236, 72, 153, 0.35);
  }

  .hero__title {
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
    margin: 0;
  }

  .hero__subtitle {
    font-size: 14px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
    margin: 4px 0 0;
  }

  /* Cards */
  .cards-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .card {
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.1));
    border-radius: 18px;
    padding: 24px;
  }

  .card--wide {
    grid-column: 1 / -1;
  }

  .card__title {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0 0 16px;
  }

  .card__buttons {
    display: flex;
    gap: 10px;
  }

  /* Action Button */
  .action-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 12px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: color-mix(in srgb, var(--brand) 15%, transparent);
    border-color: color-mix(in srgb, var(--brand) 35%, transparent);
    transform: translateY(-2px);
  }

  .action-btn--success {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.12);
  }

  .action-btn__icon {
    width: 48px;
    height: 48px;
    background: color-mix(in srgb, var(--brand) 18%, transparent);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--brand);
    font-size: 18px;
  }

  .action-btn--success .action-btn__icon {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .venmo-svg {
    width: 20px;
    height: 20px;
  }

  .action-btn__label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.9));
  }

  .action-btn--success .action-btn__label {
    color: #10b981;
  }

  /* Resources Grid - 2x2 default, 1 column on narrow */
  .resources-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 500px) {
    .resources-grid {
      grid-template-columns: 1fr;
    }
  }

  .resource-card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.06));
    border-radius: 14px;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .resource-card:hover {
    background: color-mix(in srgb, var(--brand) 10%, transparent);
    border-color: color-mix(in srgb, var(--brand) 30%, transparent);
    transform: translateY(-2px);
  }

  .resource-card__thumb {
    aspect-ratio: 16 / 9;
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .resource-card:hover .resource-card__thumb {
    border-color: color-mix(in srgb, var(--brand) 35%, transparent);
  }

  .thumb-placeholder {
    font-size: 9px;
    font-weight: 600;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.2));
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .resource-card__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
  }

  .resource-card__creator {
    font-size: 12px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
    margin-top: 2px;
  }

  .resource-card__external {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 10px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.15));
  }

  .resource-card:hover .resource-card__external {
    color: var(--brand);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .action-btn,
    .resource-card {
      transition: none;
    }
    .action-btn:hover,
    .resource-card:hover {
      transform: none;
    }
  }
</style>
