<!-- FeedbackManageTab - Admin Kanban board for managing feedback -->
<script lang="ts">
  import AdminTwoPanelLayout from "$lib/shared/admin/components/AdminTwoPanelLayout.svelte";
  import { createFeedbackManageState } from "../../state/feedback-manage-state.svelte";
  import { createVersionState } from "../../state/version-state.svelte";
  import { featureFlagService } from "$lib/shared/auth/services/FeatureFlagService.svelte";
  import FeedbackKanbanBoard from "./FeedbackKanbanBoard.svelte";
  import FeedbackDetailPanel from "./FeedbackDetailPanel.svelte";
  import PrepareReleasePanel from "./PrepareReleasePanel.svelte";

  // Create manage state with real-time subscription
  const manageState = createFeedbackManageState();

  // Create version state for release management
  const versionState = createVersionState();

  // Check if user is admin
  const isAdmin = $derived(featureFlagService.isAdmin);

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
    <!-- Header with actions -->
    <div class="manage-header">
      <button
        type="button"
        class="refresh-btn"
        onclick={async () => {
          // Clear Firestore cache and reload
          if (typeof indexedDB !== 'undefined') {
            try {
              await indexedDB.deleteDatabase('firestore/[DEFAULT]/the-kinetic-alphabet/main');
              console.log('Cleared Firestore cache');
            } catch (e) {
              console.warn('Could not clear cache:', e);
            }
          }
          manageState.refresh();
        }}
        title="Refresh feedback (clears cache)"
      >
        <i class="fas fa-sync-alt"></i>
        <span>Refresh</span>
      </button>
      <button
        type="button"
        class="prepare-release-btn"
        onclick={() => versionState.openPreparePanel()}
      >
        <i class="fas fa-rocket"></i>
        <span>Prepare Release</span>
      </button>
    </div>

    <AdminTwoPanelLayout
      hasSelection={manageState.selectedItem !== null}
      onClose={() => manageState.selectItem(null)}
    >
      {#snippet list()}
        <div class="kanban-container">
          <FeedbackKanbanBoard {manageState} />
        </div>
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

  .manage-header {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(0, 0, 0, 0.2);
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .refresh-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  .refresh-btn i {
    font-size: 12px;
  }

  .prepare-release-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.15));
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    color: #a78bfa;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .prepare-release-btn:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(99, 102, 241, 0.25));
    border-color: rgba(139, 92, 246, 0.5);
    color: #c4b5fd;
    transform: translateY(-1px);
  }

  .prepare-release-btn i {
    font-size: 12px;
  }

  .release-panel-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.3);
  }

  .release-panel-container > :global(*) {
    width: 100%;
    max-width: 480px;
    max-height: 600px;
  }
</style>
