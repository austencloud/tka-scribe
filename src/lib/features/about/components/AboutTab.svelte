<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import {
    SUPPORT_OPTIONS,
    SOCIAL_LINKS,
  } from "../../../shared/info/domain/content";

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
      desc: "Foundational poi theory establishing core concepts for technical spinning mechanics and transitions.",
    },
    {
      name: "9 Square Theory",
      shortName: "9 Square",
      url: "https://www.spinmorepoi.com/advanced/",
      creator: "Charlie Cushing",
      desc: "Advanced framework for connecting unit circles with a geometric approach to spatial relationships.",
    },
    {
      name: "Flow Arts Institute",
      shortName: "FAI",
      url: "https://flowartsinstitute.com/",
      creator: "Community Organization",
      desc: "Retreats, workshops, and festivals fostering flow arts education and community building.",
    },
    {
      name: "Playpoi",
      shortName: "Playpoi",
      url: "https://playpoi.com/",
      creator: "Nick Woolsey",
      desc: "Extensive library of poi tutorials covering beginner to advanced techniques.",
    },
  ];

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  async function handleSupportClick(
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

<div class="about-page">
  <!-- Hero -->
  <header class="hero">
    <h1>TKA Studio</h1>
    <p>
      Build, animate, and share flow arts sequences with The Kinetic Alphabet
      notation system.
    </p>
  </header>

  <!-- Support Section -->
  <section class="support-section">
    <h2>
      <i class="fas fa-heart" aria-hidden="true"></i>
      Support TKA
    </h2>
    <p class="section-desc">
      Help fund development and keep TKA free for everyone
    </p>

    <div class="donate-grid">
      {#each SUPPORT_OPTIONS as option}
        <a
          class="donate-card"
          class:copied={option.name === "Zelle" && copiedEmail}
          href={option.name === "Zelle" ? "#" : option.url}
          target={option.name === "Zelle" ? undefined : "_blank"}
          rel={option.name === "Zelle" ? undefined : "noopener noreferrer"}
          style="--brand-color: {option.color}"
          onclick={(e) => handleSupportClick(e, option.name, option.url)}
        >
          <div class="donate-icon">
            <i class={option.icon} aria-hidden="true"></i>
          </div>
          <span class="donate-label">
            {option.name === "Zelle" && copiedEmail
              ? "Email Copied!"
              : option.name}
          </span>
          {#if option.name === "Zelle" && !copiedEmail}
            <span class="donate-hint">Tap to copy email</span>
          {/if}
        </a>
      {/each}
    </div>

    <div class="social-section">
      <span class="social-label">Connect with us:</span>
      <div class="social-buttons">
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
    <h2>
      <i class="fas fa-book-open" aria-hidden="true"></i>
      Standing on Shoulders
    </h2>
    <p class="section-desc">
      TKA builds upon foundational work by pioneers in flow arts theory
    </p>

    <div class="lineage-grid">
      {#each lineage as link}
        <a
          class="lineage-card"
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          onclick={handleLinkClick}
        >
          <div class="lineage-header">
            <span class="lineage-name">{link.name}</span>
            <i
              class="fas fa-external-link-alt lineage-link-icon"
              aria-hidden="true"
            ></i>
          </div>
          <span class="lineage-creator">{link.creator}</span>
          <p class="lineage-desc">{link.desc}</p>
        </a>
      {/each}
    </div>
  </section>
</div>

<style>
  .about-page {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    padding: clamp(1.5rem, 4vw, 3rem);
    gap: clamp(2rem, 4vw, 3rem);
    background: transparent;
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Hero */
  .hero {
    text-align: center;
    padding-bottom: 1rem;
  }

  .hero h1 {
    font-size: clamp(2.5rem, 6vw, 3.5rem);
    font-weight: 800;
    margin: 0 0 0.75rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero p {
    color: var(--text-secondary);
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }

  /* Section Styles */
  section {
    background: linear-gradient(
      145deg,
      hsl(230 30% 12%) 0%,
      hsl(240 25% 8%) 100%
    );
    border: 1px solid hsl(240 30% 25% / 0.5);
    border-radius: 20px;
    padding: clamp(1.5rem, 3vw, 2rem);
    position: relative;
    overflow: hidden;
  }

  section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      hsl(240 60% 65% / 0.4),
      transparent
    );
  }

  section h2 {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: 600;
    color: hsl(0 0% 98%);
    margin: 0 0 0.375rem 0;
  }

  section h2 i {
    font-size: 1.125rem;
    color: hsl(240 70% 75%);
  }

  .section-desc {
    color: hsl(230 20% 65%);
    font-size: clamp(0.875rem, 1.8vw, 0.9375rem);
    margin: 0 0 1.25rem 0;
    line-height: 1.5;
  }

  /* Donate Grid */
  .donate-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
  }

  .donate-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    background: linear-gradient(
      160deg,
      hsl(230 30% 15%) 0%,
      hsl(230 25% 10%) 100%
    );
    border: 1px solid hsl(230 25% 22%);
    border-radius: 14px;
    color: hsl(0 0% 95%);
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .donate-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      var(--brand-color) / 0.08,
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .donate-card:hover {
    border-color: var(--brand-color);
    transform: translateY(-2px);
    box-shadow:
      0 8px 24px hsl(230 50% 5% / 0.5),
      0 0 0 1px var(--brand-color) / 0.3;
  }

  .donate-card:hover::after {
    opacity: 1;
  }

  .donate-card:active {
    transform: translateY(0);
  }

  .donate-card.copied {
    border-color: hsl(145 60% 45%);
    box-shadow: 0 0 20px hsl(145 60% 45% / 0.2);
  }

  .donate-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: linear-gradient(
      135deg,
      var(--brand-color) / 0.15,
      var(--brand-color) / 0.05
    );
    border: 1px solid var(--brand-color) / 0.2;
    border-radius: 12px;
    font-size: 1.5rem;
    color: var(--brand-color);
    position: relative;
    z-index: 1;
    transition: transform 0.2s ease;
  }

  .donate-card:hover .donate-icon {
    transform: scale(1.05);
  }

  .donate-card.copied .donate-icon {
    background: linear-gradient(
      135deg,
      hsl(145 60% 45% / 0.2),
      hsl(145 60% 45% / 0.05)
    );
    border-color: hsl(145 60% 45% / 0.3);
    color: hsl(145 60% 55%);
  }

  .donate-label {
    font-size: 1rem;
    font-weight: 600;
    position: relative;
    z-index: 1;
  }

  .donate-hint {
    font-size: 0.6875rem;
    color: hsl(230 20% 60%);
    position: relative;
    z-index: 1;
  }

  /* Social Section */
  .social-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding-top: 1.25rem;
    border-top: 1px solid hsl(240 30% 20% / 0.5);
  }

  .social-label {
    font-size: 0.8125rem;
    color: hsl(230 20% 60%);
  }

  .social-buttons {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .social-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.125rem;
    background: linear-gradient(
      160deg,
      hsl(230 30% 15%) 0%,
      hsl(230 25% 10%) 100%
    );
    border: 1px solid hsl(230 25% 22%);
    border-radius: 10px;
    color: hsl(0 0% 93%);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .social-btn i {
    font-size: 1.125rem;
    color: var(--brand-color);
    transition: transform 0.2s ease;
  }

  .social-btn:hover {
    border-color: var(--brand-color);
    background: linear-gradient(
      160deg,
      var(--brand-color) / 0.15,
      var(--brand-color) / 0.05
    );
    transform: translateY(-1px);
  }

  .social-btn:hover i {
    transform: scale(1.1);
  }

  /* Lineage Grid */
  .lineage-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .lineage-card {
    display: flex;
    flex-direction: column;
    padding: 1.25rem;
    background: linear-gradient(
      160deg,
      hsl(230 30% 15%) 0%,
      hsl(230 25% 10%) 100%
    );
    border: 1px solid hsl(230 25% 22%);
    border-left: 3px solid hsl(240 60% 60% / 0.5);
    border-radius: 12px;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .lineage-card:hover {
    border-color: hsl(240 60% 65%);
    border-left-color: hsl(240 60% 65%);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px hsl(230 50% 5% / 0.4);
  }

  .lineage-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
  }

  .lineage-name {
    font-size: 1.0625rem;
    font-weight: 600;
    color: hsl(0 0% 98%);
  }

  .lineage-link-icon {
    font-size: 0.75rem;
    color: hsl(230 20% 45%);
    opacity: 0;
    transition: all 0.2s ease;
  }

  .lineage-card:hover .lineage-link-icon {
    opacity: 1;
    color: hsl(240 70% 75%);
    transform: translate(2px, -2px);
  }

  .lineage-creator {
    font-size: 0.8125rem;
    color: hsl(240 60% 72%);
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .lineage-desc {
    font-size: 0.8125rem;
    color: hsl(230 20% 65%);
    line-height: 1.55;
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .donate-grid {
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }

    .donate-card {
      flex-direction: row;
      padding: 1rem 1.125rem;
      gap: 1rem;
    }

    .donate-icon {
      width: 52px;
      height: 52px;
      font-size: 1.25rem;
    }

    .donate-card .donate-label,
    .donate-card .donate-hint {
      text-align: left;
    }

    .lineage-grid {
      grid-template-columns: 1fr;
    }

    .social-buttons {
      flex-direction: column;
      width: 100%;
    }

    .social-btn {
      justify-content: center;
      width: 100%;
    }
  }

  @media (min-width: 900px) {
    .donate-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 1.125rem;
    }

    .donate-card {
      padding: 1.75rem 1.25rem;
    }

    .donate-icon {
      width: 52px;
      height: 52px;
      font-size: 1.625rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .donate-card,
    .social-btn,
    .lineage-card,
    .donate-icon,
    .social-btn i,
    .lineage-link-icon {
      transition: none;
    }

    .donate-card:hover,
    .social-btn:hover,
    .lineage-card:hover {
      transform: none;
    }
  }
</style>
