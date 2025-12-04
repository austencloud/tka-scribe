<script lang="ts">
  /**
   * Admin Dashboard
   *
   * Main admin interface for managing TKA system
   */

  import { onMount } from "svelte";
  import { resolve, TYPES, loadFeatureModule } from "$lib/shared/inversify/di";
  import type { IAdminChallengeService } from "../services/contracts/IAdminChallengeService";
  import DailyChallengeScheduler from "./DailyChallengeScheduler.svelte";
  import TrainChallengeManager from "./TrainChallengeManager.svelte";
  import AnalyticsDashboard from "./AnalyticsDashboard.svelte";
  import UserManagement from "./UserManagement.svelte";
  import FeatureFlagManagement from "./FeatureFlagManagement.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

  // Services
  let adminChallengeService = $state<IAdminChallengeService | null>(null);

  // State
  let isLoading = $state(true);

  // Get current section from navigation coordinator
  const activeSection = $derived(navigationState.currentSection);

  onMount(async () => {
    try {
      // Ensure admin module is loaded before resolving services
      // This is needed for HMR recovery and initial load scenarios
      await loadFeatureModule("admin");

      adminChallengeService = resolve<IAdminChallengeService>(
        TYPES.IAdminChallengeService
      );
      isLoading = false;
    } catch (error) {
      console.error("❌ Failed to initialize AdminDashboard:", error);
      isLoading = false;
    }
  });
</script>

<div class="admin-dashboard">
  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading admin tools...</p>
    </div>
  {:else}
    <!-- Content Area -->
    <main class="admin-content">
      {#if activeSection === "challenges" && adminChallengeService}
        <div
          id="challenges-panel"
          role="tabpanel"
          aria-labelledby="challenges-tab"
        >
          <DailyChallengeScheduler {adminChallengeService} />
        </div>
      {:else if activeSection === "train-challenges"}
        <div
          id="train-challenges-panel"
          role="tabpanel"
          aria-labelledby="train-challenges-tab"
        >
          <TrainChallengeManager />
        </div>
      {:else if activeSection === "analytics"}
        <div
          id="analytics-panel"
          role="tabpanel"
          aria-labelledby="analytics-tab"
        >
          <AnalyticsDashboard />
        </div>
      {:else if activeSection === "users"}
        <div id="users-panel" role="tabpanel" aria-labelledby="users-tab">
          <UserManagement />
        </div>
      {:else if activeSection === "flags"}
        <div id="flags-panel" role="tabpanel" aria-labelledby="flags-tab">
          <FeatureFlagManagement />
        </div>
      {/if}
    </main>
  {/if}
</div>

<style>
  .admin-dashboard {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: transparent;
    color: var(--text-color, #ffffff);
    overflow: hidden;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    font-size: 1.2rem;
    opacity: 0.7;
  }

  .loading-state i {
    font-size: 3rem;
  }

  /* Content Area */
  .admin-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Tab panels need to fill available height */
  .admin-content > [role="tabpanel"] {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
