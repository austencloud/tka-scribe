<!--
  SubscriptionCard - Premium subscription management for ProfileTab
  Single $10/mo tier for simplicity.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { tryResolve, TYPES } from "../../../../inversify/di";
  import type { ISubscriptionService } from "../../../../subscription/services/contracts/ISubscriptionService";
  import type { SubscriptionInfo } from "../../../../subscription/services/contracts/ISubscriptionService";
  import type { IHapticFeedbackService } from "../../../../application/services/contracts/IHapticFeedbackService";

  interface Props {
    hapticService?: IHapticFeedbackService | null;
  }

  let { hapticService = null }: Props = $props();

  // Services
  let subscriptionService: ISubscriptionService | null = $state(null);

  // State
  let subscriptionInfo = $state<SubscriptionInfo | null>(null);
  let isLoading = $state(false);
  let unsubscribeListener: (() => void) | null = null;

  // Single price configuration
  // TODO: Fix env var loading - hardcoded for now
  const priceId =
    import.meta.env.PUBLIC_STRIPE_PRICE_ID || "price_1SgbRTLZdzgHfpQbEp99bKp7";
  const PREMIUM_COLOR = "#6366f1";

  // Debug: log price ID on load
  console.log(
    "[SubscriptionCard] Price ID:",
    priceId,
    "| From env?",
    !!import.meta.env.PUBLIC_STRIPE_PRICE_ID
  );

  // Computed
  const isSubscribed = $derived(
    subscriptionInfo?.status === "active" ||
      subscriptionInfo?.status === "trialing"
  );

  const formattedBillingDate = $derived(
    subscriptionInfo?.currentPeriodEnd
      ? subscriptionInfo.currentPeriodEnd.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null
  );

  onMount(async () => {
    subscriptionService = tryResolve<ISubscriptionService>(
      TYPES.ISubscriptionService
    );

    if (subscriptionService) {
      // Initial load
      subscriptionInfo = await subscriptionService.getSubscriptionInfo();

      // Subscribe to changes
      unsubscribeListener = subscriptionService.onSubscriptionChange((info) => {
        subscriptionInfo = info;
      });
    }
  });

  onDestroy(() => {
    unsubscribeListener?.();
  });

  async function handleSubscribe() {
    if (!subscriptionService || isLoading || !priceId) return;

    hapticService?.trigger("selection");
    isLoading = true;

    try {
      const checkoutUrl =
        await subscriptionService.createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      hapticService?.trigger("error");
      isLoading = false;
    }
  }

  async function handleManageSubscription() {
    if (!subscriptionService || isLoading) return;

    hapticService?.trigger("selection");
    isLoading = true;

    try {
      const portalUrl = await subscriptionService.createPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      console.error("Failed to open subscription portal:", error);
      hapticService?.trigger("error");
      isLoading = false;
    }
  }
</script>

<div class="subscription-card-content">
  {#if isSubscribed}
    <!-- Subscribed State -->
    <div class="subscribed-status">
      <div class="status-header">
        <div class="premium-badge">
          <i class="fas fa-star"></i>
        </div>
        <div class="premium-info">
          <span class="premium-label">TKA Premium</span>
          <span class="premium-status">Active</span>
        </div>
        <div class="active-badge">
          <i class="fas fa-check-circle"></i>
        </div>
      </div>

      <div class="billing-info">
        {#if subscriptionInfo?.cancelAtPeriodEnd}
          <p class="cancel-notice">
            <i class="fas fa-info-circle"></i>
            Cancels on {formattedBillingDate}
          </p>
        {:else}
          <p>Next billing: {formattedBillingDate}</p>
        {/if}
      </div>

      <button
        class="manage-btn"
        onclick={handleManageSubscription}
        disabled={isLoading}
      >
        {#if isLoading}
          <i class="fas fa-spinner fa-spin"></i>
        {:else}
          <i class="fas fa-cog"></i>
        {/if}
        <span>Manage Subscription</span>
      </button>
    </div>
  {:else}
    <!-- Not Subscribed - Show Subscribe Button -->
    <button
      class="subscribe-btn"
      onclick={handleSubscribe}
      disabled={isLoading || !priceId}
    >
      {#if isLoading}
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading...</span>
      {:else}
        <div class="subscribe-content">
          <i class="fas fa-star"></i>
          <span class="subscribe-text">Go Premium</span>
          <span class="subscribe-price">$10/mo</span>
        </div>
      {/if}
    </button>
  {/if}
</div>

<style>
  .subscription-card-content {
    display: flex;
    flex-direction: column;
  }

  /* Subscribe Button */
  .subscribe-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 16px 20px;
    min-height: var(--min-touch-target);
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .subscribe-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  }

  .subscribe-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .subscribe-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .subscribe-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .subscribe-content i {
    font-size: 16px;
  }

  .subscribe-text {
    flex: 1;
  }

  .subscribe-price {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    font-size: 13px;
  }

  /* Subscribed State */
  .subscribed-status {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .premium-badge {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border-radius: 10px;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
  }

  .premium-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .premium-label {
    font-size: 11px;
    color: var(--theme-text-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .premium-status {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text);
  }

  .active-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(34, 197, 94, 0.15);
    border-radius: 50%;
    color: #4ade80;
    font-size: 14px;
    flex-shrink: 0;
  }

  .billing-info {
    font-size: 13px;
    color: var(--theme-text-dim);
  }

  .billing-info p {
    margin: 0;
  }

  .cancel-notice {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #fbbf24;
  }

  .manage-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 12px 16px;
    min-height: var(--min-touch-target);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 10px;
    color: var(--theme-text);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .manage-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-accent);
  }

  .manage-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
