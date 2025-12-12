<!-- FeedbackManageTab - Admin Kanban board for managing feedback -->
<script lang="ts">
  import AdminTwoPanelLayout from "$lib/shared/admin/components/AdminTwoPanelLayout.svelte";
  import { createFeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import { createVersionState } from "../../state/version-state.svelte";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import FeedbackKanbanBoard from "./FeedbackKanbanBoard.svelte";
  import FeedbackDetailPanel from "./FeedbackDetailPanel.svelte";
  import PrepareReleasePanel from "./PrepareReleasePanel.svelte";
  import FeedbackArchiveView from "./FeedbackArchiveView.svelte";

  // Create manage state with real-time subscription
  const manageState = createFeedbackManageState();

  // Create version state for release management
  const versionState = createVersionState();

  // Check if user is admin
  const isAdmin = $derived(featureFlagService.isAdmin);

  // Archive view toggle
  let showArchive = $state(false);

  // Subscribe to real-time feedback updates when admin status is confirmed
  $effect(() => {
    if (isAdmin) {
      // Start real-time subscription
      manageState.subscribe();

      // Cleanup subscription when component unmounts
      return () => {
        manageState.unsubscribe();
      };
    }
    return undefined;
  });
</script>

<div class="manage-tab">
  {#if !isAdmin}
    <div class="access-denied">
      <i class="fas fa-lock"></i>
      <h2>Admin Access Required</h2>
      <p>You need admin permissions to manage feedback.</p>
    </div>
  {:else if versionState.showPreparePanel}
    <div class="release-panel-container">
      <PrepareReleasePanel
        {versionState}
        onClose={() => versionState.closePreparePanel()}
      />
    </div>
  {:else}
    <AdminTwoPanelLayout
      hasSelection={manageState.selectedItem !== null}
      onClose={() => manageState.selectItem(null)}
    >
      {#snippet list()}
        {#if showArchive}
          <FeedbackArchiveView
            {versionState}
            onBack={() => (showArchive = false)}
          />
        {:else}
          <div class="kanban-container">
            <FeedbackKanbanBoard
              {manageState}
              onOpenArchive={() => (showArchive = true)}
            />
          </div>
        {/if}
      {/snippet}

      {#snippet detail()}
        {#if manageState.selectedItem}
          <FeedbackDetailPanel
            item={manageState.selectedItem}
            {manageState}
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

  .kanban-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
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
    color: var(--theme-stroke, rgba(255, 255, 255, 0.2));
  }

  .access-denied h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .access-denied p {
    margin: 0;
    font-size: 14px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .release-panel-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: color-mix(in srgb, var(--theme-panel-bg, #000) 30%, transparent);
  }

  .release-panel-container > :global(*) {
    width: 100%;
    max-width: 480px;
    max-height: 600px;
  }
</style>
