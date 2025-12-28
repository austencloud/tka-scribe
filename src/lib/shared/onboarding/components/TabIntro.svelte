<!--
  TabIntro.svelte - Full-screen tab introduction

  Shows an immersive intro overlay on first visit to a tab.
  Takes over the entire content area for maximum impact.

  Usage:
  <TabIntro
    moduleId="create"
    tabId="generator"
    icon="fa-wand-magic-sparkles"
    color="var(--theme-accent-strong)"
    title="Generator"
    description="Your custom description here"
  />
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";

  interface Props {
    moduleId: string;
    tabId: string;
    icon: string;
    color: string;
    title: string;
    description: string;
    /** Optional: show even if already seen (for help button) */
    forceShow?: boolean;
    onDismiss?: () => void;
  }

  const {
    moduleId,
    tabId,
    icon,
    color,
    title,
    description,
    forceShow = false,
    onDismiss,
  }: Props = $props();

  // Persistence key
  const storageKey = `tabIntroSeen:${moduleId}:${tabId}`;

  // State
  let hasSeenIntro = $state(false);
  let isVisible = $state(false);
  let hapticService: IHapticFeedback | null = $state(null);

  // Check if user has seen this intro before
  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);
    } catch {
      /* Optional */
    }

    if (forceShow) {
      isVisible = true;
      return;
    }

    if (typeof localStorage !== "undefined") {
      hasSeenIntro = localStorage.getItem(storageKey) === "true";
    }

    // Show intro if not seen before
    if (!hasSeenIntro) {
      // Small delay for smoother entrance after tab renders
      setTimeout(() => {
        isVisible = true;
      }, 100);
    }
  });

  function dismiss() {
    hapticService?.trigger("selection");
    isVisible = false;

    // Persist dismissal
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(storageKey, "true");
    }

    onDismiss?.();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      dismiss();
    }
  }
</script>

{#if isVisible}
  <!-- Full-screen takeover -->
  <div
    class="tab-intro-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="tab-intro-title"
    transition:fade={{ duration: 250 }}
  >
    <!-- Dismiss on background click -->
    <button
      class="backdrop-dismiss"
      onclick={dismiss}
      onkeydown={handleKeydown}
      aria-label="Dismiss introduction"
    ></button>

    <!-- Content container -->
    <div class="intro-content" transition:fly={{ y: 30, duration: 350, delay: 50 }}>
      <!-- Icon - large and prominent -->
      <div class="intro-icon" style="--accent-color: {color}">
        <i class="fas {icon}" aria-hidden="true"></i>
      </div>

      <!-- Title -->
      <h1 id="tab-intro-title" class="intro-title">{title}</h1>

      <!-- Description -->
      <p class="intro-description">{description}</p>

      <!-- Dismiss button -->
      <button class="intro-dismiss" onclick={dismiss} style="--accent-color: {color}">
        <span>Let's go</span>
        <i class="fas fa-arrow-right" aria-hidden="true"></i>
      </button>
    </div>
  </div>
{/if}

<style>
  .tab-intro-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(
      180deg,
      rgba(10, 10, 18, 0.97) 0%,
      rgba(15, 15, 25, 0.99) 100%
    );
  }

  .backdrop-dismiss {
    position: absolute;
    inset: 0;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .intro-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 480px;
    width: 100%;
  }

  .intro-icon {
    width: 100px;
    height: 100px;
    display: grid;
    place-items: center;
    border-radius: 28px;
    font-size: var(--font-size-3xl);
    color: white;
    background: var(--accent-color);
    box-shadow:
      0 12px 40px color-mix(in srgb, var(--accent-color) 50%, transparent),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
    margin-bottom: 32px;
  }

  .intro-title {
    margin: 0 0 16px;
    font-size: clamp(2rem, 6vw, 2.75rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: white;
  }

  .intro-description {
    margin: 0 0 40px;
    font-size: clamp(1rem, 3vw, 1.25rem);
    line-height: 1.6;
    color: var(--theme-text-dim);
    max-width: 400px;
  }

  .intro-dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 18px 40px;
    border: none;
    border-radius: 16px;
    background: var(--accent-color);
    color: white;
    font-size: 1.125rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 4px 20px color-mix(in srgb, var(--accent-color) 40%, transparent),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  .intro-dismiss:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 30px color-mix(in srgb, var(--accent-color) 50%, transparent),
      0 0 0 1px rgba(255, 255, 255, 0.15) inset;
  }

  .intro-dismiss:active {
    transform: translateY(0);
  }

  .intro-dismiss i {
    font-size: 1rem;
    transition: transform 0.2s ease;
  }

  .intro-dismiss:hover i {
    transform: translateX(4px);
  }

  /* Respect reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .intro-dismiss,
    .intro-dismiss i {
      transition: none;
    }

    .intro-dismiss:hover {
      transform: none;
    }

    .intro-dismiss:hover i {
      transform: none;
    }
  }

  /* Larger screens - more breathing room */
  @media (min-width: 768px) {
    .intro-icon {
      width: 120px;
      height: 120px;
      font-size: var(--font-size-3xl);
      border-radius: 32px;
      margin-bottom: 40px;
    }

    .intro-description {
      margin-bottom: 48px;
    }
  }
</style>
