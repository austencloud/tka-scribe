<script lang="ts">
  /**
   * SupportPanel - Support and attribution panel
   *
   * Viewport-filling grid layout with empty frame thumbnail placeholders
   */

  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { SOCIAL_LINKS } from "$shared/info/domain";
  import { onMount } from "svelte";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // State for Zelle copy feedback
  let copiedEmail = $state(false);

  // Payment options with brand colors
  const paymentOptions = [
    {
      name: "PayPal",
      icon: "fab fa-paypal",
      url: "https://paypal.me/austencloud",
      color: "#0070ba"
    },
    {
      name: "Venmo",
      icon: "venmo", // Special case - use inline SVG
      url: "https://venmo.com/austencloud",
      color: "#3d95ce"
    },
    {
      name: "Zelle",
      icon: "fas fa-bolt",
      url: "austencloud@gmail.com",
      color: "#6d1ed4"
    }
  ];

  // Lineage - theoretical foundations
  const lineage = [
    {
      name: "Vulcan Tech Gospel",
      url: "https://noelyee.com/instruction/vulcan-tech-gospel/",
      creator: "Noel Yee & Jordan Campbell",
      color: "#f59e0b"
    },
    {
      name: "9 Square Theory",
      url: "https://www.spinmorepoi.com/advanced/",
      creator: "Charlie Cushing",
      color: "#8b5cf6"
    },
    {
      name: "Flow Arts Institute",
      url: "https://flowartsinstitute.com/",
      creator: "Community Organization",
      color: "#10b981"
    },
    {
      name: "Playpoi",
      url: "https://playpoi.com/",
      creator: "Nick Woolsey",
      color: "#3b82f6"
    }
  ];

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  async function handlePaymentClick(event: MouseEvent, name: string, url: string) {
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
  <!-- Hero Section -->
  <header class="hero">
    <div class="hero__icon">
      <i class="fas fa-heart" aria-hidden="true"></i>
    </div>
    <div class="hero__text">
      <h1 class="hero__title">Support TKA</h1>
      <p class="hero__subtitle">Help keep this project free and open for everyone</p>
    </div>
  </header>

  <!-- Actions Section (Donate + Connect) -->
  <section class="actions">
    <div class="actions__row">
      <!-- Donate Group -->
      <div class="button-group">
        <h2 class="group-label">Donate</h2>
        <div class="button-row">
          {#each paymentOptions as option}
            <a
              class="action-btn"
              class:action-btn--success={option.name === "Zelle" && copiedEmail}
              href={option.name === "Zelle" ? "#" : option.url}
              target={option.name === "Zelle" ? undefined : "_blank"}
              rel={option.name === "Zelle" ? undefined : "noopener noreferrer"}
              style="--brand-color: {option.color}"
              onclick={(e) => handlePaymentClick(e, option.name, option.url)}
            >
              <div class="action-btn__icon">
                {#if option.icon === "venmo"}
                  <!-- Inline SVG for Venmo since Font Awesome Free doesn't include it -->
                  <svg viewBox="0 0 24 24" fill="currentColor" class="venmo-svg">
                    <path d="M19.5 3c.5.8.7 1.7.7 2.8 0 3.5-3 8-5.4 11.2H8.6L6 3.5h5.2l1.5 12c1.2-2 2.7-5.2 2.7-7.3 0-1-.2-1.7-.5-2.3l6.6-.2z"/>
                  </svg>
                {:else}
                  <i class={option.icon} aria-hidden="true"></i>
                {/if}
              </div>
              <span class="action-btn__label">
                {option.name === "Zelle" && copiedEmail ? "Copied!" : option.name}
              </span>
            </a>
          {/each}
        </div>
      </div>

      <!-- Connect Group -->
      <div class="button-group">
        <h2 class="group-label">Connect</h2>
        <div class="button-row">
          {#each SOCIAL_LINKS as social}
            <a
              class="action-btn"
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              style="--brand-color: {social.color}"
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
      </div>
    </div>
  </section>

  <!-- Lineage Section - Expands to fill remaining space -->
  <section class="lineage">
    <h2 class="section-title">Standing on Shoulders</h2>
    <div class="lineage-grid">
      {#each lineage as link}
        <a
          class="lineage-card"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style="--brand-color: {link.color}"
          onclick={handleLinkClick}
        >
          <!-- Empty frame thumbnail placeholder -->
          <div class="lineage-card__thumb">
            <span class="thumb-placeholder">IMAGE</span>
          </div>
          <div class="lineage-card__info">
            <span class="lineage-card__name">{link.name}</span>
            <span class="lineage-card__creator">{link.creator}</span>
          </div>
          <i class="fas fa-external-link-alt lineage-card__external" aria-hidden="true"></i>
        </a>
      {/each}
    </div>
  </section>
</div>

<style>
  /* Main container - CSS Grid that fills viewport */
  .support-panel {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto auto 1fr;
    gap: clamp(24px, 4vh, 40px);
    padding: clamp(24px, 4vw, 40px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Hero Section */
  .hero {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .hero__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
    border-radius: 14px;
    font-size: 22px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);
  }

  .hero__text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .hero__title {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
    margin: 0;
  }

  .hero__subtitle {
    font-size: 14px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
    margin: 0;
  }

  /* Actions Section */
  .actions__row {
    display: flex;
    flex-wrap: wrap;
    gap: 32px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .group-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0;
  }

  .button-row {
    display: flex;
    gap: 10px;
  }

  /* Action Button */
  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 18px;
    min-width: 90px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 14px;
    text-decoration: none;
    transition: all 0.15s ease;
    cursor: pointer;
  }

  .action-btn:hover {
    background: color-mix(in srgb, var(--brand-color) 15%, transparent);
    border-color: color-mix(in srgb, var(--brand-color) 40%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--brand-color) 25%, transparent);
  }

  .action-btn--success {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.12);
  }

  .action-btn__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: color-mix(in srgb, var(--brand-color) 18%, transparent);
    border-radius: 12px;
    font-size: 20px;
    color: var(--brand-color);
  }

  .action-btn--success .action-btn__icon {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
  }

  .venmo-svg {
    width: 22px;
    height: 22px;
  }

  .action-btn__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.9));
  }

  .action-btn--success .action-btn__label {
    color: #10b981;
  }

  /* Lineage Section - Fills remaining space */
  .lineage {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0; /* Allow shrinking in grid */
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 0;
    flex-shrink: 0;
  }

  .lineage-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 14px;
    flex: 1;
    align-content: stretch;
  }

  /* Lineage Card - Expands to fill grid cell */
  .lineage-card {
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    text-decoration: none;
    transition: all 0.15s ease;
    cursor: pointer;
    position: relative;
    min-height: 180px;
  }

  .lineage-card:hover {
    background: color-mix(in srgb, var(--brand-color) 10%, transparent);
    border-color: color-mix(in srgb, var(--brand-color) 35%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  /* Empty frame thumbnail placeholder */
  .lineage-card__thumb {
    aspect-ratio: 16 / 9;
    border: 2px dashed var(--card-border-current, rgba(255, 255, 255, 0.15));
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    background: rgba(255, 255, 255, 0.02);
    transition: border-color 0.15s ease;
  }

  .lineage-card:hover .lineage-card__thumb {
    border-color: color-mix(in srgb, var(--brand-color) 40%, transparent);
  }

  .thumb-placeholder {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.25));
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .lineage-card__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .lineage-card__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
    line-height: 1.3;
  }

  .lineage-card__creator {
    font-size: 12px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.45));
  }

  .lineage-card__external {
    position: absolute;
    top: 14px;
    right: 14px;
    font-size: 10px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.2));
    transition: all 0.15s ease;
  }

  .lineage-card:hover .lineage-card__external {
    color: var(--brand-color);
    transform: translate(2px, -2px);
  }

  /* Tablet */
  @media (min-width: 640px) and (max-width: 899px) {
    .lineage-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Desktop - 4 across */
  @media (min-width: 900px) {
    .lineage-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Mobile */
  @media (max-width: 639px) {
    .support-panel {
      padding: 20px 16px;
      gap: 24px;
    }

    .actions__row {
      flex-direction: column;
      gap: 20px;
    }

    .button-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .action-btn {
      min-width: unset;
      padding: 12px 10px;
    }

    .action-btn__icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .action-btn__label {
      font-size: 11px;
    }

    .lineage-grid {
      grid-template-columns: 1fr;
    }

    .lineage-card {
      flex-direction: row;
      align-items: center;
      gap: 14px;
      min-height: unset;
      padding: 14px;
    }

    .lineage-card__thumb {
      width: 64px;
      height: 64px;
      aspect-ratio: 1;
      margin-bottom: 0;
      flex-shrink: 0;
    }

    .lineage-card__info {
      flex: 1;
    }

    .lineage-card__external {
      position: static;
      align-self: center;
      margin-left: auto;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .action-btn,
    .lineage-card,
    .lineage-card__thumb,
    .lineage-card__external {
      transition: none;
    }

    .action-btn:hover,
    .lineage-card:hover {
      transform: none;
    }
  }
</style>
