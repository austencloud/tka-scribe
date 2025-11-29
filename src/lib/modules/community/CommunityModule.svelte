<script lang="ts">
  /**
   * CommunityModule
   * Main module component for the Community module
   * Manages creators, challenges, support, and user profiles
   */

  import { fade } from "svelte/transition";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { communityViewState } from "./state/community-view-state.svelte";
  import type { CommunitySection } from "./domain/types/community-types";
  import CreatorsPanel from "./components/creators/CreatorsPanel.svelte";
  import UserProfilePanel from "./components/profile/UserProfilePanel.svelte";
  import SupportPanel from "./components/support/SupportPanel.svelte";

  // Current active section (default to creators)
  let activeSection = $state<CommunitySection>("creators");

  // Sync with navigation state
  $effect(() => {
    const navTab = navigationState.activeTab;

    // Map navigation tab to community section
    if (navTab === "creators") {
      activeSection = "creators";
      communityViewState.setActiveSection("creators");
    } else if (navTab === "challenges") {
      activeSection = "challenges";
      communityViewState.setActiveSection("challenges");
    } else if (navTab === "support") {
      activeSection = "support";
      communityViewState.setActiveSection("support");
    }
  });
</script>

<div class="community-module">
  <!-- Show user profile if viewing one -->
  {#if communityViewState.currentView === "user-profile" && communityViewState.viewingUserId}
    <div class="section-panel" transition:fade={{ duration: 200 }}>
      <UserProfilePanel userId={communityViewState.viewingUserId} />
    </div>
  {:else}
    <!-- Show section panels -->
    {#key activeSection}
      <div class="section-panel" transition:fade={{ duration: 200 }}>
        {#if activeSection === "creators"}
          <CreatorsPanel />
        {:else if activeSection === "challenges"}
          <div class="coming-soon-panel">
            <i class="fas fa-bolt"></i>
            <h2>Challenges</h2>
            <p>
              Community challenges and events are coming soon! Complete daily
              quests and earn exclusive rewards.
            </p>
          </div>
        {:else if activeSection === "support"}
          <SupportPanel />
        {/if}
      </div>
    {/key}
  {/if}
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

  .section-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* ============================================================================
     COMING SOON PANEL
     ============================================================================ */
  .coming-soon-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    width: 100%;
    height: 100%;
    padding: 40px 20px;
    text-align: center;
  }

  .coming-soon-panel i {
    font-size: 72px;
    color: rgba(239, 68, 68, 0.3);
  }

  .coming-soon-panel h2 {
    font-size: 32px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .coming-soon-panel p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    max-width: 500px;
    line-height: 1.6;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .section-panel {
      transition: none;
    }
  }
</style>
