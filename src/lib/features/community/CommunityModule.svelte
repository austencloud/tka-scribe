<script lang="ts">
  /**
   * CommunityModule
   * Main module component for the Community module
   * Manages creators, challenges, support, and user profiles
   * Uses View Transitions API for smooth, modern tab switching
   */

  import { onMount } from "svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { communityViewState } from "./state/community-view-state.svelte";
  import type { CommunitySection } from "./domain/types/community-types";
  import CreatorsPanel from "./components/creators/CreatorsPanel.svelte";
  import UserProfilePanel from "./components/profile/UserProfilePanel.svelte";
  import SupportPanel from "./components/support/SupportPanel.svelte";
  import { ChallengesPanel } from "./challenges/components";
  import ChallengesPanelDesktop from "./challenges/components/ChallengesPanelDesktop.svelte";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";

  // Device detection for responsive panel selection
  const deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
  let isDesktop = $state(deviceDetector.isDesktop());

  // Subscribe to device capability changes for reactive updates
  onMount(() => {
    return deviceDetector.onCapabilitiesChanged(() => {
      isDesktop = deviceDetector.isDesktop();
    });
  });

  // Current active section (default to creators)
  let activeSection = $state<CommunitySection>("creators");

  // Sync with navigation state using View Transitions API
  $effect(() => {
    const navTab = navigationState.activeTab;
    let newSection: CommunitySection | null = null;

    // Map navigation tab to community section
    if (navTab === "creators") {
      newSection = "creators";
    } else if (navTab === "challenges") {
      newSection = "challenges";
    } else if (navTab === "support") {
      newSection = "support";
    }

    // Only trigger transition if section actually changed
    if (newSection && newSection !== activeSection) {
      // Use View Transitions API if supported
      if (document.startViewTransition) {
        document.startViewTransition(() => {
          activeSection = newSection!;
          communityViewState.setActiveSection(newSection!);
        });
      } else {
        // Fallback for browsers without support
        activeSection = newSection;
        communityViewState.setActiveSection(newSection);
      }
    }
  });
</script>

<div class="community-module">
  <div class="panel-container">
    <!-- Show user profile if viewing one -->
    {#if communityViewState.currentView === "user-profile" && communityViewState.viewingUserId}
      <div class="section-panel" data-panel="user-profile">
        <UserProfilePanel userId={communityViewState.viewingUserId} />
      </div>
    {:else if activeSection === "creators"}
      <div class="section-panel" data-panel="creators">
        <CreatorsPanel />
      </div>
    {:else if activeSection === "challenges"}
      <div class="section-panel" data-panel="challenges">
        {#if isDesktop}
          <ChallengesPanelDesktop />
        {:else}
          <ChallengesPanel />
        {/if}
      </div>
    {:else if activeSection === "support"}
      <div class="section-panel" data-panel="support">
        <SupportPanel />
      </div>
    {/if}
  </div>
</div>

<style>
  .community-module {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }

  .panel-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .section-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    view-transition-name: community-panel;
  }

  /* View Transitions API animations */
  @supports (view-transition-name: none) {
    /* Customize the default cross-fade animation */
    ::view-transition-old(community-panel),
    ::view-transition-new(community-panel) {
      animation-duration: 300ms;
      animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      mix-blend-mode: normal;
    }

    /* Old panel fades out while sliding slightly */
    ::view-transition-old(community-panel) {
      animation-name: slide-fade-out;
    }

    /* New panel fades in while sliding slightly */
    ::view-transition-new(community-panel) {
      animation-name: slide-fade-in;
    }
  }

  @keyframes slide-fade-out {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-20px);
    }
  }

  @keyframes slide-fade-in {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    ::view-transition-old(community-panel),
    ::view-transition-new(community-panel) {
      animation-duration: 0.001ms !important;
      animation-delay: 0s !important;
    }
  }
</style>
