<script lang="ts">
  /**
   * LeaderboardPanel - Community leaderboard display
   *
   * Refactored to use shared panel components.
   */

  import { onMount, onDestroy } from "svelte";
  import { resolve, TYPES, PanelHeader, PanelContent, PanelTabs, PanelState } from "$shared";
  import type { ILeaderboardService } from "../../services/contracts/ILeaderboardService";
  import type {
    LeaderboardCategory,
    LeaderboardData,
  } from "../../domain/models/leaderboard-models";
  import LeaderboardList from "./LeaderboardList.svelte";

  let category = $state<LeaderboardCategory>("xp");
  let leaderboardData = $state<LeaderboardData | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  // Service instance and unsubscribe function
  let leaderboardService: ILeaderboardService;
  let unsubscribe: (() => void) | null = null;

  const tabs = [
    { value: "xp", label: "XP", icon: "fa-star" },
    { value: "level", label: "Level", icon: "fa-layer-group" },
    { value: "sequences", label: "Sequences", icon: "fa-list" },
    { value: "achievements", label: "Achievements", icon: "fa-award" },
    { value: "streak", label: "Streak", icon: "fa-fire" },
  ];

  function handleCategoryChange(newCategory: string) {
    if (newCategory !== category) {
      category = newCategory as LeaderboardCategory;
    }
  }

  function subscribeToLeaderboard() {
    // Clean up existing subscription
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }

    isLoading = true;
    error = null;

    try {
      // Subscribe to real-time leaderboard updates
      unsubscribe = leaderboardService.subscribeToLeaderboard(
        category,
        (data) => {
          leaderboardData = data;
          isLoading = false;
          error = null;
        },
        { limit: 100 }
      );
    } catch (err) {
      error =
        err instanceof Error
          ? err.message
          : "Failed to load leaderboard. Please try again.";
      isLoading = false;
    }
  }

  // Subscribe when category changes
  $effect(() => {
    if (leaderboardService) {
      subscribeToLeaderboard();
    }
  });

  onMount(async () => {
    try {
      // Resolve the leaderboard service from DI container
      leaderboardService = resolve<ILeaderboardService>(
        TYPES.ILeaderboardService
      );

      // Start subscription
      subscribeToLeaderboard();
    } catch (err) {
      error =
        err instanceof Error
          ? err.message
          : "Failed to initialize leaderboard service.";
      isLoading = false;
    }
  });

  onDestroy(() => {
    // Clean up the subscription when component is destroyed
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<div class="leaderboard-panel">
  <PanelHeader
    title="Leaderboards"
    subtitle="Top performers across the community"
    icon="fa-trophy"
  />

  <PanelTabs {tabs} activeTab={category} onchange={handleCategoryChange} />

  <PanelContent>
    {#if isLoading}
      <PanelState type="loading" message="Loading leaderboard..." />
    {:else if error}
      <PanelState
        type="error"
        title="Unable to Load Leaderboard"
        message={error}
        onretry={subscribeToLeaderboard}
      />
    {:else if leaderboardData}
      <LeaderboardList
        entries={leaderboardData.entries}
        category={leaderboardData.category}
        {...leaderboardData.currentUserRank !== undefined && {
          currentUserRank: leaderboardData.currentUserRank,
        }}
      />
    {/if}
  </PanelContent>
</div>

<style>
  .leaderboard-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
