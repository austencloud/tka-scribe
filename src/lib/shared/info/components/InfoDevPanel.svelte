<script lang="ts">
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import type { InfoDevContent } from "../domain/types";
  import DevCard from "./DevCard.svelte";

  let {
    panelId,
    labelledBy,
    copy,
    githubUrl,
    discordUrl,
    contactEmail: _contactEmail,
  }: {
    panelId: string;
    labelledBy: string;
    copy: InfoDevContent;
    githubUrl: string;
    discordUrl: string;
    contactEmail: string;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleLinkClick() {
    hapticService?.trigger("selection");
  }
</script>

<div class="carousel-panel" id={panelId} role="presentation">
  <div class="tab-panel" role="tabpanel" aria-labelledby={labelledBy}>
    <h2 class="panel-title">{copy.subtitle}</h2>
    <p class="dev-message">{copy.message}</p>
    <div class="dev-links">
      <DevCard
        href={discordUrl}
        icon="fab fa-discord"
        title="Join Our Discord Community"
        description="Get help, share feedback, and chat directly with the developer"
        highlight={true}
        onclick={handleLinkClick}
      />

      <DevCard
        href={githubUrl}
        icon="fab fa-github"
        title="View on GitHub"
        description="Explore the source code and contribute"
        onclick={handleLinkClick}
      />

      <DevCard
        href={`${githubUrl}/issues/new`}
        icon="fas fa-bug"
        title="Report Bug or Request Feature"
        description="Help improve TKA with your feedback"
        onclick={handleLinkClick}
      />
    </div>
  </div>
</div>

<style>
  .carousel-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    container-type: inline-size;
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
    padding: clamp(0.75rem, 2cqi, 1rem);
    flex: 1;
    height: 100%;
  }

  @media (min-width: 1024px) {
    .tab-panel {
      padding: clamp(0.75rem, 3cqi, 1.25rem);
    }
  }

  .panel-title {
    font-size: clamp(0.75rem, 2cqi, 0.875rem);
    margin-bottom: clamp(0.25rem, 1cqi, 0.5rem);
  }

  @media (min-width: 1024px) {
    .panel-title {
      display: none;
    }
  }

  .dev-message {
    font-size: clamp(0.6875rem, 2.5cqi, 0.8125rem);
    color: rgba(255, 255, 255, 0.75);
    margin-bottom: clamp(0.5rem, 2cqi, 0.75rem);
    line-height: 1.4;
    text-align: center;
    flex-shrink: 0;
  }

  .dev-links {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(0.5rem, 2cqi, 0.875rem);
    width: 100%;
    flex: 1;
    justify-content: center;
    padding: 0;
  }

  @media (min-width: 1024px) {
    .dev-links {
      flex: 1;
      justify-content: center;
      gap: clamp(0.625rem, 2.5cqi, 1rem);
    }
  }
</style>
