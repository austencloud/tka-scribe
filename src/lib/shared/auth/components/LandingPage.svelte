<script lang="ts">
  /**
   * LandingPage - Full-screen auth gate for logged-out users
   * Clean, focused experience that showcases TKA and prompts sign-in
   */
  import { fly, fade } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";
  import SocialAuthCompact from "./SocialAuthCompact.svelte";
  import EmailPasswordAuth from "./EmailPasswordAuth.svelte";
  import AuthFooter from "./AuthFooter.svelte";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IAuthenticator } from "../services/contracts/IAuthenticator";
  import { settingsService } from "../../settings/state/SettingsState.svelte";
  import { BackgroundType } from "../../background/shared/domain/enums/background-enums";
  import { applyThemeForBackground } from "../../settings/utils/background-theme-calculator";

  let authMode = $state<"signin" | "signup">("signin");
  let showEmailAuth = $state(false);
  let authService: IAuthenticator | null = null;

  // Background toggle state
  const backgrounds: { type: BackgroundType; icon: string; label: string }[] = [
    { type: BackgroundType.NIGHT_SKY, icon: "fa-moon", label: "Night Sky" },
    { type: BackgroundType.AURORA, icon: "fa-wind", label: "Aurora" },
    { type: BackgroundType.DEEP_OCEAN, icon: "fa-water", label: "Ocean" },
    { type: BackgroundType.SNOWFALL, icon: "fa-snowflake", label: "Snow" },
    { type: BackgroundType.EMBER_GLOW, icon: "fa-fire", label: "Ember" },
    { type: BackgroundType.SAKURA_DRIFT, icon: "fa-leaf", label: "Sakura" },
  ];
  let currentBgIndex = $state(0);

  onMount(async () => {
    try {
      authService = await resolve<IAuthenticator>(TYPES.IAuthenticator);
    } catch (error) {
      console.error("Failed to resolve auth service:", error);
    }

    // Find current background index and apply its theme
    const current = settingsService.currentSettings?.backgroundType;
    const idx = backgrounds.findIndex((b) => b.type === current);
    if (idx >= 0) {
      currentBgIndex = idx;
    }
    // Ensure theme is applied for current background
    if (current) {
      applyThemeForBackground(current);
    }
  });

  async function handleFacebookAuth() {
    try {
      await authService?.signInWithFacebook();
    } catch (error: any) {
      console.error("Facebook auth failed:", error);
    }
  }

  async function cycleBackground() {
    currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
    const next = backgrounds[currentBgIndex];
    if (next) {
      await settingsService.updateSetting("backgroundType", next.type);
      // Apply theme immediately since MainApplication's watcher may not trigger for landing page
      applyThemeForBackground(next.type);
    }
  }

  const features = [
    {
      icon: "fa-wand-magic-sparkles",
      title: "Create",
      desc: "Build sequences with an intuitive visual editor",
    },
    {
      icon: "fa-compass",
      title: "Discover",
      desc: "Browse through community sequences",
    },
    {
      icon: "fa-play",
      title: "Animate",
      desc: "Watch your sequences come to life",
    },
    {
      icon: "fa-graduation-cap",
      title: "Learn",
      desc: "Master flow arts notation step by step",
    },
  ];
</script>

<div class="landing-page" in:fade={{ duration: 300 }}>
  <div class="landing-content">
    <!-- Logo & Branding -->
    <header
      class="landing-header"
      in:fly={{ y: -20, duration: 400, delay: 100, easing: cubicOut }}
    >
      <div class="logo-container">
        <i class="fas fa-infinity logo-icon" aria-hidden="true"></i>
      </div>
      <h1>TKA Scribe</h1>
      <p class="tagline">The visual language for flow arts</p>
    </header>

    <!-- Feature Highlights -->
    <section
      class="features"
      in:fly={{ y: 20, duration: 400, delay: 200, easing: cubicOut }}
      aria-labelledby="features-heading"
    >
      <h2 id="features-heading" class="sr-only">Features</h2>
      {#each features as feature, i}
        <div
          class="feature-card"
          in:fly={{
            y: 20,
            duration: 300,
            delay: 300 + i * 75,
            easing: cubicOut,
          }}
        >
          <div class="feature-icon">
            <i class="fas {feature.icon}" aria-hidden="true"></i>
          </div>
          <div class="feature-text">
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        </div>
      {/each}
    </section>

    <!-- Auth Section -->
    <section
      class="auth-section"
      in:fly={{ y: 20, duration: 400, delay: 400, easing: cubicOut }}
    >
      <h2>Sign in to get started</h2>
      <p class="auth-subtitle">Free to use. Save your creations.</p>

      <div class="auth-container">
        <SocialAuthCompact
          mode={authMode}
          onFacebookAuth={handleFacebookAuth}
        />

        {#if !showEmailAuth}
          <button class="email-toggle" onclick={() => (showEmailAuth = true)}>
            <i class="fas fa-envelope" aria-hidden="true"></i>
            <span>Continue with email</span>
          </button>
        {:else}
          <div class="divider">
            <span>or use email</span>
          </div>
          <div class="email-auth-wrapper" in:fly={{ y: 10, duration: 200 }}>
            <EmailPasswordAuth bind:mode={authMode} />
          </div>
        {/if}
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="landing-footer"
      in:fly={{ y: 20, duration: 400, delay: 500, easing: cubicOut }}
    >
      <AuthFooter />
    </footer>
  </div>

  <!-- Background Toggle (Easter Egg) -->
  <button
    class="bg-toggle"
    onclick={cycleBackground}
    title="Change background: {backgrounds[currentBgIndex]?.label}"
    aria-label="Change background theme"
    in:fade={{ duration: 400, delay: 600 }}
  >
    <i class="fas {backgrounds[currentBgIndex]?.icon}" aria-hidden="true"></i>
  </button>
</div>

<style>
  /* Screen reader only - visually hidden but accessible */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .landing-page {
    --theme-transition: 300ms ease-in-out;

    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    overflow-y: auto;
    z-index: 100;
  }

  .landing-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 40px;
    max-width: 520px;
    width: 100%;
    padding: 40px 32px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--theme-stroke);
    border-radius: 28px;
  }

  /* Header */
  .landing-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  .logo-container {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 12%,
      transparent
    );
    border-radius: 20px;
    border: 1px solid
      color-mix(in srgb, var(--theme-accent-strong, var(--theme-accent-strong)) 25%, transparent);
    transition:
      background var(--theme-transition),
      border-color var(--theme-transition);
  }

  .logo-icon {
    font-size: var(--font-size-3xl);
    color: var(--theme-accent-strong, var(--theme-accent-strong));
    transition: color var(--theme-transition);
  }

  .landing-header h1 {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--theme-text);
    letter-spacing: -0.03em;
  }

  .tagline {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--theme-accent-strong, var(--theme-accent-strong));
    transition: color var(--theme-transition);
  }

  /* Features */
  .features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
  }

  .feature-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 15%,
      rgba(255, 255, 255, 0.03)
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent-strong, var(--theme-accent-strong)) 25%, transparent);
    border-radius: 14px;
    transition:
      background var(--theme-transition),
      border-color var(--theme-transition);
  }

  .feature-card:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong) 20%,
      var(--theme-card-bg)
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 35%,
      transparent
    );
  }

  .feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 20%,
      transparent
    );
    border-radius: 10px;
    flex-shrink: 0;
    transition: background var(--theme-transition);
  }

  .feature-icon i {
    font-size: var(--font-size-base);
    color: var(--theme-accent-strong, var(--theme-accent-strong));
    transition: color var(--theme-transition);
  }

  .feature-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .feature-text h3 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--theme-text);
  }

  .feature-text p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--theme-text-dim, var(--theme-text-dim));
    line-height: 1.4;
  }

  /* Auth Section */
  .auth-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 28px 24px;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 15%,
      rgba(255, 255, 255, 0.03)
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent-strong, var(--theme-accent-strong)) 25%, transparent);
    border-radius: 20px;
    transition:
      background var(--theme-transition),
      border-color var(--theme-transition);
  }

  .auth-section h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--theme-text, white);
  }

  .auth-subtitle {
    margin: 0;
    font-size: 0.875rem;
    color: var(--theme-text-dim, var(--theme-text-dim));
  }

  .auth-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .email-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 12px 20px;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 12%,
      rgba(255, 255, 255, 0.02)
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent-strong, var(--theme-accent-strong)) 20%, transparent);
    border-radius: 12px;
    color: var(--theme-text, var(--theme-text));
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--theme-transition),
      border-color var(--theme-transition),
      color var(--theme-transition);
  }

  .email-toggle:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong) 18%,
      rgba(255, 255, 255, 0.04)
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 30%,
      transparent
    );
    color: var(--theme-text, white);
  }

  .email-toggle i {
    font-size: var(--font-size-base);
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    margin: 4px 0;
  }

  .divider::before,
  .divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 20%,
      transparent
    );
    transition: background var(--theme-transition);
  }

  .divider span {
    font-size: 0.8125rem;
    color: var(--theme-text-dim);
  }

  .email-auth-wrapper {
    width: 100%;
  }

  /* Footer */
  .landing-footer {
    opacity: 0.7;
  }

  /* Background Toggle Button */
  .bg-toggle {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 10%,
      transparent
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-accent-strong, var(--theme-accent-strong)) 18%, transparent);
    border-radius: 12px;
    color: var(--theme-accent-strong, var(--theme-accent-strong));
    font-size: var(--font-size-lg);
    cursor: pointer;
    transition:
      background var(--theme-transition),
      border-color var(--theme-transition),
      color var(--theme-transition),
      transform 200ms ease;
    z-index: 101;
  }

  .bg-toggle:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong) 20%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, var(--theme-accent-strong)) 30%,
      transparent
    );
    transform: scale(1.05);
  }

  .bg-toggle:active {
    transform: scale(0.95);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .landing-page {
      padding: 16px;
    }

    .landing-content {
      gap: 32px;
      padding: 28px 20px;
      border-radius: 24px;
    }

    .logo-container {
      width: 64px;
      height: 64px;
    }

    .logo-icon {
      font-size: var(--font-size-3xl);
    }

    .landing-header h1 {
      font-size: 2rem;
    }

    .tagline {
      font-size: 1rem;
    }

    .features {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .feature-card {
      padding: 14px;
    }

    .auth-section {
      padding: 24px 20px;
    }

    .auth-section h2 {
      font-size: 1.125rem;
    }

    .bg-toggle {
      bottom: 16px;
      right: 16px;
      width: 40px;
      height: 40px;
      font-size: var(--font-size-base);
    }
  }

  @media (max-height: 700px) {
    .landing-content {
      gap: 24px;
      padding: 24px 20px;
    }

    .features {
      gap: 8px;
    }

    .feature-card {
      padding: 12px;
    }

    .auth-section {
      padding: 20px 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .logo-container,
    .logo-icon,
    .tagline,
    .feature-card,
    .feature-icon,
    .feature-icon i,
    .auth-section,
    .email-toggle,
    .divider::before,
    .divider::after,
    .bg-toggle {
      transition: none;
    }
  }
</style>
