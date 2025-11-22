<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import DevCard from "$shared/info/components/DevCard.svelte";

  let {
    hapticService = null,
  }: {
    hapticService: IHapticFeedbackService | null;
  } = $props();

  function handleDevLinkClick() {
    hapticService?.trigger("selection");
  }
</script>

<!-- Developer Resources Section -->
<section class="dev-section" aria-labelledby="dev-heading">
  <h2 id="dev-heading">
    <i class="fas fa-code" aria-hidden="true"></i>
    For Developers
  </h2>
  <p class="section-description">
    TKA Studio is open source. Contribute code, report bugs, or request features
  </p>
  <div class="dev-cards" role="list">
    <div role="listitem">
      <DevCard
        href="https://discord.gg/tka"
        icon="fab fa-discord"
        title="Join Our Discord Community"
        description="Get help, share feedback, and chat directly with the developer"
        highlight={true}
        onclick={handleDevLinkClick}
      />
    </div>

    <div role="listitem">
      <DevCard
        href="https://github.com/austencloud/tka-studio"
        icon="fab fa-github"
        title="View on GitHub"
        description="Explore the source code and contribute"
        onclick={handleDevLinkClick}
      />
    </div>

    <div role="listitem">
      <DevCard
        href="https://github.com/austencloud/tka-studio/issues/new"
        icon="fas fa-bug"
        title="Report Bug or Request Feature"
        description="Help improve TKA with your feedback"
        onclick={handleDevLinkClick}
      />
    </div>
  </div>
</section>

<style>
  /* Developer Resources Section */
  .dev-section {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
  }

  .dev-section h2 {
    text-align: center;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    color: var(--text-color);
    margin-bottom: clamp(0.75rem, 2vw, 1rem);
    font-weight: 700;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(0.5rem, 1.5vw, 0.75rem);
  }

  .dev-section h2 i {
    font-size: 0.9em;
    opacity: 0.9;
  }

  .section-description {
    text-align: center;
    font-size: clamp(0.9375rem, 2vw, 1.0625rem);
    color: var(--text-secondary);
    margin-bottom: clamp(1.75rem, 3.5vw, 2.75rem);
    font-style: italic;
    line-height: 1.6;
    opacity: 0.9;
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Developer Cards */
  .dev-cards {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
    max-width: 700px;
    margin: 0 auto;
  }
</style>
