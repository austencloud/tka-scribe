<!--
  /premium route - Dedicated premium subscription page
  Focused experience for learning about and subscribing to TKA Premium
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import PremiumShowcase from "$lib/features/premium/components/PremiumShowcase.svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  function handleBack() {
    goto("/");
  }
</script>

<svelte:head>
  <title>Go Premium - TKA</title>
  <meta name="description" content="Support TKA development and unlock premium features" />
</svelte:head>

<div class="premium-page">
  <!-- Back Button -->
  <button class="back-button" onclick={handleBack}>
    <i class="fas fa-arrow-left"></i>
    <span>Back</span>
  </button>

  <!-- Premium Showcase Component -->
  <PremiumShowcase {hapticService} />
</div>

<style>
  .premium-page {
    min-height: 100vh;
    background: var(--theme-background, #0f0f0f);
    position: relative;
    overflow-y: auto;
  }

  .back-button {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: var(--font-size-min, 14px);
    cursor: pointer;
    transition: all 150ms ease;
  }

  .back-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, #ffffff);
  }

  .back-button i {
    font-size: 12px;
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .back-button {
      top: 12px;
      left: 12px;
      padding: 8px 12px;
      font-size: var(--font-size-compact, 12px);
    }
  }
</style>
