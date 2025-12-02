<!-- FeedbackManageTab - Admin view for managing feedback -->
<script lang="ts">
  import { onMount } from "svelte";
  import AdminTwoPanelLayout from "$lib/shared/admin/components/AdminTwoPanelLayout.svelte";
  import { createFeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import FeedbackFilterBar from "./FeedbackFilterBar.svelte";
  import FeedbackList from "./FeedbackList.svelte";
  import FeedbackDetailPanel from "./FeedbackDetailPanel.svelte";

  // Create manage state
  const manageState = createFeedbackManageState();

  // Check if user is admin
  const isAdmin = $derived(featureFlagService.isAdmin);

  // Load feedback on mount
  onMount(() => {
    if (isAdmin) {
      manageState.loadFeedback(true);
    }
  });
</script>

<div class="manage-tab">
  {#if !isAdmin}
    <div class="access-denied">
      <i class="fas fa-lock"></i>
      <h2>Admin Access Required</h2>
      <p>You need admin permissions to manage feedback.</p>
    </div>
  {:else}
    <AdminTwoPanelLayout
      hasSelection={manageState.selectedItem !== null}
      onClose={() => manageState.selectItem(null)}
    >
      {#snippet list()}
        <div class="list-container">
          <FeedbackFilterBar manageState={manageState} />
          <FeedbackList manageState={manageState} />
        </div>
      {/snippet}

      {#snippet detail()}
        {#if manageState.selectedItem}
          <FeedbackDetailPanel
            item={manageState.selectedItem}
            manageState={manageState}
            onClose={() => manageState.selectItem(null)}
          />
        {/if}
      {/snippet}
    </AdminTwoPanelLayout>
  {/if}
</div>

<style>
  .manage-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .list-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .access-denied {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
    text-align: center;
    padding: 32px;
  }

  .access-denied i {
    font-size: 64px;
    color: rgba(255, 255, 255, 0.2);
  }

  .access-denied h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .access-denied p {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
