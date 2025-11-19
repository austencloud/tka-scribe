<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { resolve, TYPES } from "$shared";
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

  const leaderboardCategories = [
    { value: "xp" as const, label: "XP", icon: "fa-star" },
    { value: "level" as const, label: "Level", icon: "fa-layer-group" },
    { value: "sequences" as const, label: "Sequences", icon: "fa-list" },
    { value: "achievements" as const, label: "Achievements", icon: "fa-award" },
    { value: "streak" as const, label: "Streak", icon: "fa-fire" },
  ];

  function handleCategoryChange(newCategory: LeaderboardCategory) {
    if (newCategory !== category) {
      category = newCategory;
    }
  }

  function subscribeToLeaderboard() {
    // Clean up existing subscription
    if (unsubscribe) {
      console.log("🔌 LeaderboardPanel: Unsubscribing from previous category");
      unsubscribe();
      unsubscribe = null;
    }

    isLoading = true;
    error = null;

    try {
      console.log(`🔍 LeaderboardPanel: Subscribing to ${category} leaderboard...`);

      // Subscribe to real-time leaderboard updates
      unsubscribe = leaderboardService.subscribeToLeaderboard(
        category,
        (data) => {
          leaderboardData = data;
          isLoading = false;
          error = null;
          console.log(
            `✅ LeaderboardPanel: Updated ${category} leaderboard with ${data.entries.length} entries`
          );
        },
        { limit: 100 }
      );

      console.log(`✅ LeaderboardPanel: Real-time subscription active for ${category}`);
    } catch (err) {
      console.error("❌ LeaderboardPanel: Error subscribing to leaderboard:", err);
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
      console.log("🔍 LeaderboardPanel: Initializing leaderboard service...");

      // Resolve the leaderboard service from DI container
      leaderboardService = resolve<ILeaderboardService>(
        TYPES.ILeaderboardService
      );

      // Start subscription
      subscribeToLeaderboard();
    } catch (err) {
      console.error(
        "❌ LeaderboardPanel: Error initializing service:",
        err
      );
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
      console.log("🔌 LeaderboardPanel: Unsubscribing from real-time updates");
      unsubscribe();
    }
  });
</script>

<div class="leaderboard-panel">
  <!-- Header -->
  <div class="panel-header">
    <div class="header-title">
      <i class="fas fa-trophy"></i>
      <h2>Leaderboards</h2>
    </div>
    <p class="header-subtitle">Top performers across the community</p>
  </div>

  <!-- Category Segmented Control -->
  <div class="category-selector">
    <div class="segmented-control" role="group" aria-label="Leaderboard category">
      {#each leaderboardCategories as cat (cat.value)}
        <button
          type="button"
          class="segment"
          class:active={category === cat.value}
          onclick={() => handleCategoryChange(cat.value)}
          aria-pressed={category === cat.value}
        >
          <i class="fas {cat.icon}"></i>
          <span class="segment-label">{cat.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Content -->
  <div class="panel-content">
    {#if isLoading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Unable to Load Leaderboard</h3>
        <p>{error}</p>
        <button onclick={subscribeToLeaderboard}>Try Again</button>
      </div>
    {:else if leaderboardData}
      <LeaderboardList
        entries={leaderboardData.entries}
        category={leaderboardData.category}
        currentUserRank={leaderboardData.currentUserRank}
      />
    {/if}
  </div>
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

  /* ============================================================================
     HEADER
     ============================================================================ */
  .panel-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px 20px 0;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-title i {
    font-size: 24px;
    color: #fbbf24;
  }

  .header-title h2 {
    font-size: 28px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .header-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    padding-left: 36px;
  }

  /* ============================================================================
     CATEGORY SELECTOR
     ============================================================================ */
  .category-selector {
    padding: 0 20px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .segmented-control {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    backdrop-filter: blur(12px);
    box-shadow: inset 0 0.5px 1px rgba(0, 0, 0, 0.15),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .segment {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 14px;
    background: transparent;
    border: none;
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
  }

  .segment:hover {
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.05);
  }

  .segment.active {
    background: rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.98);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .segment i {
    font-size: 14px;
  }

  /* ============================================================================
     CONTENT
     ============================================================================ */
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 20px;
    min-height: 0;
  }

  /* ============================================================================
     LOADING STATE
     ============================================================================ */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 60px 20px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #fbbf24;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-state p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* ============================================================================
     ERROR STATE
     ============================================================================ */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    text-align: center;
  }

  .error-state i {
    font-size: 48px;
    color: #ef4444;
  }

  .error-state h3 {
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .error-state p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    max-width: 300px;
  }

  .error-state button {
    margin-top: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .error-state button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .panel-header {
      padding: 16px 16px 0;
    }

    .category-selector {
      padding: 0 16px;
    }

    .panel-content {
      padding: 0 16px 16px;
    }

    .segment-label {
      display: none;
    }

    .segment {
      padding: 7px 10px;
    }

    .segment i {
      font-size: 16px;
    }
  }

  @container primary-nav (min-width: 400px) {
    .segment-label {
      display: block;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }

    .segment {
      transition: none;
    }
  }
</style>
