<!--
  PremiumShowcase - Focused premium subscription pitch

  Can be used as:
  - Full page route (/premium)
  - Modal/Drawer overlay
  - Standalone component
-->
<script lang="ts">
  import { tryResolve, TYPES } from "../../../shared/inversify/di";
  import type { ISubscriptionService } from "../../../shared/subscription/services/contracts/ISubscriptionService";
  import type { IHapticFeedbackService } from "../../../shared/application/services/contracts/IHapticFeedbackService";
  import { authState } from "../../../shared/auth/state/authState.svelte";

  interface Props {
    onClose?: () => void;
    hapticService?: IHapticFeedbackService | null;
  }

  let { onClose, hapticService = null }: Props = $props();

  // Services
  let subscriptionService: ISubscriptionService | null = $state(null);
  let isLoading = $state(false);

  // Single price ID ($10/mo)
  const PRICE_ID = import.meta.env.PUBLIC_STRIPE_PRICE_ID || "price_1SgbRTLZdzgHfpQbEp99bKp7";

  // Initialize services
  $effect(() => {
    subscriptionService = tryResolve<ISubscriptionService>(TYPES.ISubscriptionService);
  });

  async function handleSubscribe() {
    if (!subscriptionService || isLoading || !PRICE_ID) return;

    hapticService?.trigger("selection");
    isLoading = true;

    try {
      const checkoutUrl = await subscriptionService.createCheckoutSession(PRICE_ID);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      hapticService?.trigger("error");
      isLoading = false;
    }
  }
</script>

<div class="premium-showcase">
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-icon">
      <i class="fas fa-crown"></i>
    </div>
    <h1 class="hero-title">Go Premium</h1>
    <p class="hero-subtitle">
      Support independent development and unlock advanced features
    </p>
  </section>

  <!-- Developer Section - Personal Connection -->
  <section class="developer-section">
    <div class="developer-card">
      <div class="developer-header">
        <i class="fas fa-heart"></i>
        <h2>Support Independent Development</h2>
      </div>
      <p class="developer-message">
        TKA is built by <strong>Austen Cloud</strong>, a solo developer passionate
        about creating tools for flow artists. Your premium subscription directly
        funds ongoing development, new features, and keeps TKA alive and evolving.
      </p>
      <div class="developer-stats">
        <div class="stat">
          <i class="fas fa-code"></i>
          <span>100% independent</span>
        </div>
        <div class="stat">
          <i class="fas fa-users"></i>
          <span>Community-driven</span>
        </div>
        <div class="stat">
          <i class="fas fa-rocket"></i>
          <span>Actively developed</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Premium Features -->
  <section class="features-section">
    <h2 class="section-title">Premium Features</h2>

    <div class="feature-grid">
      <!-- Unlimited Creation -->
      <div class="feature-card">
        <div class="feature-icon unlimited">
          <i class="fas fa-infinity"></i>
        </div>
        <h3 class="feature-title">Unlimited Creation</h3>
        <ul class="feature-list">
          <li>
            <i class="fas fa-check"></i>
            <span>Unlimited generator access</span>
          </li>
          <li>
            <i class="fas fa-check"></i>
            <span>Unlimited exports</span>
          </li>
          <li class="free-comparison">
            <i class="fas fa-lock"></i>
            <span>Free: Limited daily uses</span>
          </li>
        </ul>
      </div>

      <!-- Advanced Modules -->
      <div class="feature-card">
        <div class="feature-icon modules">
          <i class="fas fa-rocket"></i>
        </div>
        <h3 class="feature-title">Advanced Modules</h3>
        <ul class="feature-list">
          <li>
            <i class="fas fa-check"></i>
            <span>Compose: Music timeline editor</span>
          </li>
          <li>
            <i class="fas fa-check"></i>
            <span>Train: Pose detection practice</span>
          </li>
          <li class="free-comparison">
            <i class="fas fa-lock"></i>
            <span>Free: Not available</span>
          </li>
        </ul>
      </div>

      <!-- Priority Support -->
      <div class="feature-card">
        <div class="feature-icon support">
          <i class="fas fa-headset"></i>
        </div>
        <h3 class="feature-title">Priority Support</h3>
        <ul class="feature-list">
          <li>
            <i class="fas fa-check"></i>
            <span>First-in-line support</span>
          </li>
          <li>
            <i class="fas fa-check"></i>
            <span>Feature request priority</span>
          </li>
          <li>
            <i class="fas fa-check"></i>
            <span>Direct developer access</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <!-- What Stays Free -->
  <section class="free-section">
    <h2 class="section-title">Always Free</h2>
    <p class="free-description">
      Core features remain accessible to everyone, forever.
    </p>
    <div class="free-grid">
      <div class="free-item">
        <i class="fas fa-compass"></i>
        <span>Discover & Share</span>
      </div>
      <div class="free-item">
        <i class="fas fa-graduation-cap"></i>
        <span>Learn Module</span>
      </div>
      <div class="free-item">
        <i class="fas fa-layer-group"></i>
        <span>Assembler Tool</span>
      </div>
      <div class="free-item">
        <i class="fas fa-save"></i>
        <span>Save Sequences</span>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="cta-section">
    <div class="cta-card">
      <div class="cta-content">
        <h2 class="cta-title">Ready to support TKA?</h2>
        <p class="cta-subtitle">Join the community funding independent development</p>
        <div class="cta-price">
          <span class="price-amount">$10</span>
          <span class="price-period">/month</span>
        </div>
        <button
          class="cta-button"
          onclick={handleSubscribe}
          disabled={isLoading || !PRICE_ID}
        >
          {#if isLoading}
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading...</span>
          {:else}
            <i class="fas fa-crown"></i>
            <span>Go Premium</span>
          {/if}
        </button>
        <p class="cta-note">
          Cancel anytime • Secure payment via Stripe
        </p>
      </div>
    </div>
  </section>

  <!-- Close Button (for modal mode) -->
  {#if onClose}
    <button class="close-button" onclick={onClose} aria-label="Close">
      <i class="fas fa-times"></i>
    </button>
  {/if}
</div>

<style>
  .premium-showcase {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: clamp(20px, 4vh, 40px) clamp(16px, 3vw, 24px);
    position: relative;
  }

  /* Hero Section */
  .hero {
    text-align: center;
    margin-bottom: clamp(32px, 6vh, 48px);
  }

  .hero-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 20px;
    font-size: 36px;
    color: white;
  }

  .hero-title {
    font-size: clamp(28px, 5vw, 42px);
    font-weight: 700;
    margin: 0 0 12px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: clamp(14px, 2vw, 18px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    margin: 0;
  }

  /* Developer Section */
  .developer-section {
    margin-bottom: clamp(32px, 6vh, 48px);
  }

  .developer-card {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #6366f1) 8%, transparent),
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 8%, transparent)
    );
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 16px;
    padding: clamp(20px, 3vh, 32px);
  }

  .developer-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .developer-header i {
    font-size: 24px;
    color: #ec4899;
  }

  .developer-header h2 {
    font-size: clamp(18px, 2.5vw, 24px);
    font-weight: 600;
    margin: 0;
    color: var(--theme-text, #ffffff);
  }

  .developer-message {
    font-size: var(--font-size-min, 14px);
    line-height: 1.6;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
    margin: 0 0 20px;
  }

  .developer-message strong {
    color: var(--theme-text, #ffffff);
    font-weight: 600;
  }

  .developer-stats {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .stat i {
    color: var(--theme-accent, #6366f1);
  }

  /* Features Section */
  .features-section {
    margin-bottom: clamp(32px, 6vh, 48px);
  }

  .section-title {
    font-size: clamp(20px, 3vw, 28px);
    font-weight: 600;
    text-align: center;
    margin: 0 0 clamp(20px, 4vh, 32px);
    color: var(--theme-text, #ffffff);
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: clamp(16px, 2.5vh, 24px);
  }

  .feature-card {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: clamp(18px, 2.5vh, 24px);
    transition: all 150ms ease;
  }

  .feature-card:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.05));
    border-color: var(--theme-accent, #6366f1);
  }

  .feature-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 16px;
    color: white;
  }

  .feature-icon.unlimited {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  }

  .feature-icon.modules {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  }

  .feature-icon.support {
    background: linear-gradient(135deg, #ec4899 0%, #d946ef 100%);
  }

  .feature-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 12px;
    color: var(--theme-text, #ffffff);
  }

  .feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .feature-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.8));
  }

  .feature-list i {
    font-size: 12px;
    color: #4ade80;
    flex-shrink: 0;
  }

  .feature-list li.free-comparison {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: var(--font-size-compact, 12px);
  }

  .feature-list li.free-comparison i {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
  }

  /* Free Section */
  .free-section {
    margin-bottom: clamp(32px, 6vh, 48px);
    text-align: center;
  }

  .free-description {
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    margin: 0 0 clamp(16px, 3vh, 24px);
  }

  .free-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    max-width: 600px;
    margin: 0 auto;
  }

  .free-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: 10px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .free-item i {
    font-size: 18px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  /* CTA Section */
  .cta-section {
    margin-bottom: clamp(20px, 4vh, 32px);
  }

  .cta-card {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 16px;
    padding: clamp(28px, 4vh, 40px);
  }

  .cta-content {
    text-align: center;
  }

  .cta-title {
    font-size: clamp(22px, 3.5vw, 32px);
    font-weight: 700;
    margin: 0 0 8px;
    color: white;
  }

  .cta-subtitle {
    font-size: clamp(13px, 1.8vw, 16px);
    margin: 0 0 24px;
    color: rgba(255, 255, 255, 0.9);
  }

  .cta-price {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    margin-bottom: 24px;
  }

  .price-amount {
    font-size: clamp(36px, 6vw, 56px);
    font-weight: 700;
    color: white;
  }

  .price-period {
    font-size: clamp(16px, 2.5vw, 20px);
    color: rgba(255, 255, 255, 0.8);
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 16px 40px;
    min-height: var(--min-touch-target, 44px);
    background: white;
    color: #6366f1;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    margin-bottom: 12px;
  }

  .cta-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .cta-button:active:not(:disabled) {
    transform: scale(0.98);
  }

  .cta-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cta-note {
    font-size: var(--font-size-compact, 12px);
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  /* Close Button (for modal mode) */
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 50%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 150ms ease;
  }

  .close-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, #ffffff);
  }

  /* Mobile Responsive */
  @media (max-width: 640px) {
    .feature-grid {
      grid-template-columns: 1fr;
    }

    .free-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
