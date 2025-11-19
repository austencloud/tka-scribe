<script lang="ts">
  import { onMount } from "svelte";
  import { browser } from "$app/environment";
  import type { EmblaCarouselType } from "embla-carousel";

  import {
    resolve,
    TYPES,
    type IHapticFeedbackService,
    HorizontalSwipeContainer,
  } from "$shared";

  // Import info components
  import InfoHeroSection from "$shared/info/components/InfoHeroSection.svelte";
  import InfoTabNavigation from "$shared/info/components/InfoTabNavigation.svelte";
  import InfoResourcesPanel from "$shared/info/components/InfoResourcesPanel.svelte";
  import InfoCommunityPanel from "$shared/info/components/InfoCommunityPanel.svelte";
  import InfoDevPanel from "$shared/info/components/InfoDevPanel.svelte";

  // Import info domain data
  import {
    CONTACT_EMAIL,
    INFO_SECTIONS,
    INFO_TEXT,
    type InfoTab,
    RESOURCES,
    SOCIAL_LINKS,
    SUPPORT_OPTIONS,
  } from "$shared/info/domain";

  let activeTab = $state<InfoTab>("resources");
  let emblaApi: EmblaCarouselType | undefined = $state(undefined);

  // Track if we're on desktop for responsive layout
  let isDesktop = $state(false);

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Check if desktop on mount and on resize
    const checkDesktop = () => {
      isDesktop = window.innerWidth >= 1024;
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);

    return () => {
      window.removeEventListener("resize", checkDesktop);
    };
  });

  function handleTabChange(tabId: InfoTab) {
    const index = INFO_SECTIONS.findIndex((section) => section.id === tabId);
    if (index !== -1 && emblaApi) {
      emblaApi.scrollTo(index);
    }
  }

  function handlePanelChange(panelIndex: number) {
    const section = INFO_SECTIONS[panelIndex];
    if (section) {
      activeTab = section.id as InfoTab;
    }
  }

  function handleResourceNavigate(resource: (typeof RESOURCES)[number]) {
    handleLinkClick(resource.url, resource.type);
  }

  function handleLinkClick(
    url: string,
    type: (typeof RESOURCES)[number]["type"]
  ) {
    if (browser && (type === "download" || type === "external")) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function handleSocialClick(
    event: MouseEvent,
    social: (typeof SOCIAL_LINKS)[number]
  ) {
    // Let browser handle all social/payment links naturally
    // No special handling needed
  }
</script>

<!-- About Tab - Complete Info Experience -->
<div class="about-container">
  <div class="info-content" class:desktop={isDesktop}>
    <InfoHeroSection hero={INFO_TEXT.hero} />

    {#if !isDesktop}
      <!-- Mobile: Swipeable tabs -->
      <InfoTabNavigation
        sections={INFO_SECTIONS}
        {activeTab}
        onSelect={handleTabChange}
      />

      <div class="tab-content">
        <HorizontalSwipeContainer
          panels={INFO_SECTIONS}
          initialPanelIndex={0}
          onPanelChange={handlePanelChange}
          showArrows={false}
          showIndicators={false}
          height="100%"
          width="100%"
          bind:emblaApiRef={emblaApi}
        >
          <InfoResourcesPanel
            panelId="panel-resources"
            labelledBy="tab-resources"
            copy={INFO_TEXT.resources}
            resources={RESOURCES}
            onLinkClick={handleResourceNavigate}
          />

          <InfoCommunityPanel
            panelId="panel-support"
            labelledBy="tab-support"
            copy={INFO_TEXT.support}
            socialLinks={SOCIAL_LINKS}
            supportOptions={SUPPORT_OPTIONS}
            onSocialClick={handleSocialClick}
            onSupportClick={handleSocialClick}
          />

          <InfoDevPanel
            panelId="panel-dev"
            labelledBy="tab-dev"
            copy={INFO_TEXT.dev}
            githubUrl="https://github.com/austencloud/tka-studio"
            discordUrl={SOCIAL_LINKS.find((link) => link.name === "Discord")
              ?.url || "https://discord.gg/tka"}
            contactEmail={CONTACT_EMAIL}
          />
        </HorizontalSwipeContainer>
      </div>
    {:else}
      <!-- Desktop: All panels visible in grid -->
      <div class="desktop-panels-grid">
        <div class="desktop-panel">
          <h2 class="desktop-panel-title">{INFO_TEXT.resources.title}</h2>
          <InfoResourcesPanel
            panelId="panel-resources"
            labelledBy="desktop-resources"
            copy={INFO_TEXT.resources}
            resources={RESOURCES}
            onLinkClick={handleResourceNavigate}
          />
        </div>

        <div class="desktop-panel">
          <h2 class="desktop-panel-title">{INFO_TEXT.support.title}</h2>
          <InfoCommunityPanel
            panelId="panel-support"
            labelledBy="desktop-support"
            copy={INFO_TEXT.support}
            socialLinks={SOCIAL_LINKS}
            supportOptions={SUPPORT_OPTIONS}
            onSocialClick={handleSocialClick}
            onSupportClick={handleSocialClick}
          />
        </div>

        <div class="desktop-panel">
          <h2 class="desktop-panel-title">{INFO_TEXT.dev.title}</h2>
          <InfoDevPanel
            panelId="panel-dev"
            labelledBy="desktop-dev"
            copy={INFO_TEXT.dev}
            githubUrl="https://github.com/austencloud/tka-studio"
            discordUrl={SOCIAL_LINKS.find((link) => link.name === "Discord")
              ?.url || "https://discord.gg/tka"}
            contactEmail={CONTACT_EMAIL}
          />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* About Container */
  .about-container {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background: var(--cosmic-gradient);
    color: var(--text-color);
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .info-content {
    width: 100%;
    min-height: 100%;
    margin: 0 auto;
    padding: clamp(1rem, 2vh, 1.5rem) clamp(1rem, 2vw, 2rem);
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 1.5vh, 1rem);
  }

  .tab-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
  }

  .tab-content :global(.carousel-panel) {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  :global(.tab-panel) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    overflow-y: auto;
    overflow-x: hidden;
  }

  @media (min-width: 640px) {
    :global(.tab-panel) {
      padding: 1rem;
    }
  }

  :global(.panel-title) {
    font-size: 0.9375rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 0.625rem;
    text-align: center;
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    :global(.panel-title) {
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }
  }

  /* ============================================================================
     DESKTOP LAYOUT (1024px+)
     ============================================================================ */
  @media (min-width: 1024px) {
    .info-content.desktop {
      max-width: 1600px;
      margin: 0 auto;
      padding: clamp(1.5rem, 3vh, 2.5rem) clamp(1.5rem, 3vw, 3rem);
      gap: clamp(1rem, 2vh, 1.5rem);
    }

    .desktop-panels-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: clamp(1rem, 2vw, 2rem);
      width: 100%;
      align-items: start;
    }

    .desktop-panel {
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      padding: 1.5rem;
      min-height: 400px;
    }

    .desktop-panel-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      margin: 0 0 1rem 0;
      text-align: center;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    }

    .desktop-panel :global(.carousel-panel) {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .desktop-panel :global(.tab-panel) {
      display: flex;
      flex-direction: column;
      flex: 1;
      background: transparent;
      border: none;
      padding: 0;
    }
  }

  @media (prefers-contrast: high) {
    :global(.tab-panel),
    :global(.resource-card),
    :global(.social-button),
    :global(.support-button),
    :global(.dev-card) {
      border: 2px solid white;
    }
  }

  @media (max-height: 600px) {
    :global(.panel-title) {
      margin-bottom: 0.5rem;
    }
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .info-content {
      padding: 0 var(--spacing-md);
    }
  }
</style>
