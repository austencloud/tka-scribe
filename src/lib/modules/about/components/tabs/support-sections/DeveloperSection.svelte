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
  /* Developer Resources Section - Admin Style */
  .dev-section {
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  .dev-section h2 {
    text-align: center;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.95);
    margin-bottom: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .dev-section h2 i {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.5);
  }

  .section-description {
    text-align: center;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 20px;
    line-height: 1.5;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Developer Cards */
  .dev-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
