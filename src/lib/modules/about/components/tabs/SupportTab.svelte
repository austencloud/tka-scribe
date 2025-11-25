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
    padding: 24px;
    background: transparent;
  }

  /* Section spacing - applies to child components */
  .support-tab > :global(* + *) {
    margin-top: 32px;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .support-tab {
      padding: 16px;
    }

    .support-tab > :global(* + *) {
      margin-top: 24px;
    }
  }
</style>
