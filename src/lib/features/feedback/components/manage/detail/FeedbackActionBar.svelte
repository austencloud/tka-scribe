<script lang="ts">
  import type { FeedbackDetailState } from "../../../state/feedback-detail-state.svelte";
  import ConfirmDialog from "$lib/shared/foundation/ui/ConfirmDialog.svelte";

  const { detailState, readOnly = false } = $props<{
    detailState: FeedbackDetailState;
    readOnly?: boolean;
  }>();

  function handleConfirmDelete() {
    detailState.handleDelete();
  }

  function handleCancelDelete() {
    detailState.showDeleteConfirm = false;
  }
</script>

{#if !readOnly}
  <section class="section actions-section">
    <!-- Delete Button -->
    <button
      type="button"
      class="delete-btn"
      onclick={() => (detailState.showDeleteConfirm = true)}
      disabled={detailState.isDeleting}
    >
      {#if detailState.isDeleting}
        <i class="fas fa-circle-notch fa-spin" aria-hidden="true"></i>
        Deleting...
      {:else}
        <i class="fas fa-trash-alt" aria-hidden="true"></i>
        Delete Forever
      {/if}
    </button>
  </section>

  <!-- Delete Confirmation Dialog - Portal rendered at document root -->
  <ConfirmDialog
    bind:isOpen={detailState.showDeleteConfirm}
    title="Delete Feedback"
    message="Permanently delete this feedback? This cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    variant="danger"
    onConfirm={handleConfirmDelete}
    onCancel={handleCancelDelete}
  />
{/if}

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .actions-section {
    padding-top: var(--fb-space-md);
    border-top: 1px solid var(--fb-border);
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  /* Delete button - subtle danger style */
  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: transparent;
    border: 1px solid
      color-mix(in srgb, var(--semantic-error) 30%, transparent);
    border-radius: var(--fb-radius-md);
    color: var(--semantic-error);
    cursor: pointer;
    font-weight: 500;
    font-size: var(--fb-text-xs);
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  .delete-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--semantic-error) 10%, transparent);
    opacity: 1;
  }

  .delete-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
