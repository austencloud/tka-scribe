<script lang="ts">
  /**
   * CommunityModule
   * Main module component for the Community module
   * Manages leaderboards, creators, achievements, challenges, and user profiles
   */

  import { fade } from "svelte/transition";
  import { navigationState } from "$shared/navigation/state/navigation-state.svelte";
  import { communityViewState } from "./state/community-view-state.svelte";
  import type { CommunitySection } from "./domain/types/community-types";
  import LeaderboardPanel from "./components/leaderboards/LeaderboardPanel.svelte";
  import CreatorsPanel from "./components/creators/CreatorsPanel.svelte";
  import AchievementsShowcasePanel from "./components/achievements/AchievementsShowcasePanel.svelte";
  import UserProfilePanel from "./components/profile/UserProfilePanel.svelte";
  import SupportPanel from "./components/support/SupportPanel.svelte";

  // Current active section
  let activeSection = $state<CommunitySection>("leaderboards");

  // Sync with navigation state
  $effect(() => {
    const navTab = navigationState.activeTab;

    // Map navigation tab to community section
    if (navTab === "leaderboards") {
      activeSection = "leaderboards";
      communityViewState.setActiveSection("leaderboards");
    } else if (navTab === "creators") {
      activeSection = "creators";
      communityViewState.setActiveSection("creators");
    } else if (navTab === "achievements") {
      activeSection = "achievements";
      communityViewState.setActiveSection("achievements");
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
        {#if activeSection === "leaderboards"}
          <LeaderboardPanel />
        {:else if activeSection === "creators"}
          <CreatorsPanel />
        {:else if activeSection === "achievements"}
          <AchievementsShowcasePanel />
        {:else if activeSection === "challenges"}
          <div class="coming-soon-panel">
            <i class="fas fa-bullseye"></i>
            <h2>Challenges</h2>
            <p>
              Community challenges and events are coming soon! Compete with
              other creators, complete daily quests, and earn exclusive rewards.
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
