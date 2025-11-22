<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import {
    IntroSection,
    DonateSection,
    SocialSection,
    DeveloperSection,
    ContactSection,
    ThankYouSection,
  } from "./support-sections";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // State for copy feedback (managed by DonateSection)
  let copiedEmail = $state(false);
  let copyFailed = $state(false);
  let announceMessage = $state("");

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });
</script>

<!-- Support Tab - Help Keep TKA Alive -->
<div class="support-tab">
  <!-- Screen reader announcements -->
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    {announceMessage}
  </div>

  <IntroSection />

  <DonateSection
    {hapticService}
    bind:copiedEmail
    bind:copyFailed
    bind:announceMessage
  />

  <SocialSection {hapticService} />

  <DeveloperSection {hapticService} />

  <ContactSection />

  <ThankYouSection />
</div>

<style>
  /* Spacing System */
  :root {
    --section-spacing: clamp(3rem, 6vw, 5rem);
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .support-tab {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 2vw, 1.5rem) clamp(2rem, 5vw, 4rem);
    background: transparent;
    scroll-behavior: smooth;
  }

  /* Section spacing - applies to child components */
  .support-tab > :global(* + *) {
    margin-top: var(--section-spacing);
    position: relative;
  }

  /* Separator between sections */
  .support-tab > :global(* + *)::before {
    content: "";
    position: absolute;
    top: calc(var(--section-spacing) / -2);
    left: 50%;
    transform: translateX(-50%);
    width: clamp(100px, 30%, 300px);
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(236, 72, 153, 0.2) 20%,
      rgba(236, 72, 153, 0.3) 50%,
      rgba(236, 72, 153, 0.2) 80%,
      transparent
    );
    opacity: 0.7;
  }

  /* No separator before first section */
  .support-tab > :global(*:first-child)::before {
    display: none;
  }

  /* Mobile adjustments */
  @media (max-width: 479px) {
    :root {
      --section-spacing: clamp(2rem, 5vw, 3rem);
    }

    .support-tab {
      padding: clamp(1rem, 3vw, 1.5rem) clamp(0.875rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
    }

    /* Reduce separator visibility on mobile */
    .support-tab > :global(* + *)::before {
      opacity: 0.5;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .support-tab {
      scroll-behavior: auto;
    }
  }
</style>
