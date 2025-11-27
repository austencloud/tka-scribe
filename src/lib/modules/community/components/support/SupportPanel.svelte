<script lang="ts">
  /**
   * SupportPanel - Support and attribution panel
   *
   * Refactored to use shared panel components and CSS variables.
   */

  import { resolve, TYPES, type IHapticFeedbackService, PanelCard, PanelGrid } from "$shared";
  import { SUPPORT_OPTIONS, SOCIAL_LINKS } from "$shared/info/domain";
  import { onMount } from "svelte";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // State for Zelle copy feedback
  let copiedEmail = $state(false);

  // Lineage - theoretical foundations
  const lineage = [
    {
      name: "Vulcan Tech Gospel",
      shortName: "VTG",
      url: "https://noelyee.com/instruction/vulcan-tech-gospel/",
      creator: "Noel Yee & Jordan Campbell",
      desc: "Foundational poi theory establishing core concepts for technical spinning mechanics and transitions."
    },
    {
      name: "9 Square Theory",
      shortName: "9 Square",
      url: "https://www.spinmorepoi.com/advanced/",
      creator: "Charlie Cushing",
      desc: "Advanced framework for connecting unit circles with a geometric approach to spatial relationships."
    },
    {
      name: "Flow Arts Institute",
      shortName: "FAI",
      url: "https://flowartsinstitute.com/",
      creator: "Community Organization",
      desc: "Retreats, workshops, and festivals fostering flow arts education and community building."
    },
    {
      name: "Playpoi",
      shortName: "Playpoi",
      url: "https://playpoi.com/",
      creator: "Nick Woolsey",
      desc: "Extensive library of poi tutorials covering beginner to advanced techniques."
    },
  ];

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  async function handleSupportClick(event: MouseEvent, name: string, url: string) {
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
  <!-- Support Section -->
  <section class="support-section">
    <div class="section-header">
      <i class="fas fa-heart section-header__icon" aria-hidden="true"></i>
      <h2 class="section-header__title">Support TKA</h2>
    </div>
    <p class="section-desc">Help fund development and keep TKA free for everyone</p>

    <PanelGrid columns={3} gap="14px">
      {#each SUPPORT_OPTIONS as option}
        <a
          class="donate-card"
          class:donate-card--copied={option.name === "Zelle" && copiedEmail}
          href={option.name === "Zelle" ? "#" : option.url}
          target={option.name === "Zelle" ? undefined : "_blank"}
          rel={option.name === "Zelle" ? undefined : "noopener noreferrer"}
          style="--brand-color: {option.color}"
          onclick={(e) => handleSupportClick(e, option.name, option.url)}
        >
          <div class="donate-card__icon">
            <i class={option.icon} aria-hidden="true"></i>
          </div>
          <span class="donate-card__label">
            {option.name === "Zelle" && copiedEmail ? "Email Copied!" : option.name}
          </span>
          {#if option.name === "Zelle" && !copiedEmail}
            <span class="donate-card__hint">Tap to copy email</span>
          {/if}
        </a>
      {/each}
    </PanelGrid>

    <div class="social-section">
      <span class="social-section__label">Connect with us:</span>
      <div class="social-section__buttons">
        {#each SOCIAL_LINKS as social}
          <a
            class="social-btn"
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            style="--brand-color: {social.color}"
            onclick={handleLinkClick}
            aria-label={social.name}
          >
            <i class={social.icon} aria-hidden="true"></i>
            <span>{social.name}</span>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <!-- Lineage Section -->
  <section class="lineage-section">
    <div class="section-header">
      <i class="fas fa-book-open section-header__icon" aria-hidden="true"></i>
      <h2 class="section-header__title">Standing on Shoulders</h2>
    </div>
    <p class="section-desc">TKA builds upon foundational work by pioneers in flow arts theory</p>

    <PanelGrid columns={2} gap="14px">
      {#each lineage as link}
        <a
          class="lineage-card"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onclick={handleLinkClick}
        >
          <div class="lineage-card__header">
            <span class="lineage-card__name">{link.name}</span>
            <i class="fas fa-external-link-alt lineage-card__link-icon" aria-hidden="true"></i>
          </div>
          <span class="lineage-card__creator">{link.creator}</span>
          <p class="lineage-card__desc">{link.desc}</p>
        </a>
      {/each}
    </PanelGrid>
  </section>
</div>

<style>
  .support-panel {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    background: transparent;
    max-width: 900px;
    margin: 0 auto;
  }

  /* Section Styles */
  section {
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    padding: 20px;
    position: relative;
  }

  /* Section Header */
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .section-header__icon {
    font-size: 18px;
    color: var(--accent-color);
  }

  .section-header__title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
    margin: 0;
  }

  .section-desc {
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
    font-size: 14px;
    margin: 0 0 20px 0;
    line-height: 1.5;
  }

  /* Donate Card */
  .donate-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 14px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .donate-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
    border-color: var(--brand-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .donate-card:active {
    transform: translateY(0);
  }

  .donate-card--copied {
    border-color: #10b981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
  }

  .donate-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: color-mix(in srgb, var(--brand-color) 15%, transparent);
    border: 1px solid color-mix(in srgb, var(--brand-color) 20%, transparent);
    border-radius: 12px;
    font-size: 22px;
    color: var(--brand-color);
    transition: transform 0.2s ease;
  }

  .donate-card:hover .donate-card__icon {
    transform: scale(1.05);
  }

  .donate-card--copied .donate-card__icon {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;
  }

  .donate-card__label {
    font-size: 15px;
    font-weight: 600;
  }

  .donate-card__hint {
    font-size: 11px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.5));
  }

  /* Social Section */
  .social-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding-top: 20px;
    border-top: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
  }

  .social-section__label {
    font-size: 13px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
  }

  .social-section__buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .social-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-radius: 10px;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.93));
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .social-btn i {
    font-size: 16px;
    color: var(--brand-color);
    transition: transform 0.2s ease;
  }

  .social-btn:hover {
    border-color: var(--brand-color);
    background: color-mix(in srgb, var(--brand-color) 10%, transparent);
    transform: translateY(-1px);
  }

  .social-btn:hover i {
    transform: scale(1.1);
  }

  /* Lineage Card */
  .lineage-card {
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: var(--card-bg-current, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.08));
    border-left: 3px solid var(--accent-color);
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .lineage-card:hover {
    background: var(--card-hover-current, rgba(255, 255, 255, 0.06));
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .lineage-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .lineage-card__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.98));
  }

  .lineage-card__link-icon {
    font-size: 11px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.4));
    opacity: 0;
    transition: all 0.2s ease;
  }

  .lineage-card:hover .lineage-card__link-icon {
    opacity: 1;
    color: var(--accent-color);
    transform: translate(2px, -2px);
  }

  .lineage-card__creator {
    font-size: 12px;
    color: var(--accent-color);
    margin-bottom: 6px;
    font-weight: 500;
  }

  .lineage-card__desc {
    font-size: 12px;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.65));
    line-height: 1.5;
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .support-panel {
      padding: 16px;
      gap: 16px;
    }

    section {
      padding: 16px;
    }

    .social-section__buttons {
      flex-direction: column;
      width: 100%;
    }

    .social-btn {
      justify-content: center;
      width: 100%;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .donate-card,
    .social-btn,
    .lineage-card,
    .donate-card__icon,
    .social-btn i,
    .lineage-card__link-icon {
      transition: none;
    }

    .donate-card:hover,
    .social-btn:hover,
    .lineage-card:hover {
      transform: none;
    }
  }
</style>
