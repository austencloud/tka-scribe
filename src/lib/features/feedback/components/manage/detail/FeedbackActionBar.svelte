<script lang="ts">
  import type { FeedbackDetailState } from "../../../state/feedback-detail-state.svelte";

  const {
    detailState,
    readOnly = false,
  } = $props<{
    detailState: FeedbackDetailState;
    readOnly?: boolean;
  }>();
</script>

{#if !readOnly}
  <section class="section delete-section">
    {#if detailState.showDeleteConfirm}
      <div class="delete-confirm-simple">
        <span class="delete-confirm-text">
          Are you sure you want to delete this feedback?
        </span>
        <div class="delete-confirm-actions">
          <button
            type="button"
            class="cancel-btn-simple"
            onclick={() => (detailState.showDeleteConfirm = false)}
          >
            Cancel
          </button>
          <button
            type="button"
            class="confirm-btn-simple"
            onclick={() => detailState.handleDelete()}
            disabled={detailState.isDeleting}
          >
            {#if detailState.isDeleting}
              <i class="fas fa-circle-notch fa-spin"></i>
            {:else}
              <i class="fas fa-trash"></i>
            {/if}
            Delete
          </button>
        </div>
      </div>
    {:else}
      <button
        type="button"
        class="delete-btn-simple"
        onclick={() => (detailState.showDeleteConfirm = true)}
      >
        <i class="fas fa-trash-alt"></i>
        Delete Feedback
      </button>
    {/if}
  </section>
{/if}

<style>
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-sm);
  }

  .delete-section {
    padding-top: var(--fb-space-md);
    border-top: 1px solid var(--fb-border);
  }

  .delete-btn-simple {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--fb-space-xs);
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: color-mix(in srgb, #ef4444 10%, transparent);
    border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
    border-radius: var(--fb-radius-md);
    color: #ef4444;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .delete-btn-simple:hover {
    background: color-mix(in srgb, #ef4444 15%, transparent);
    border-color: #ef4444;
  }

  .delete-btn-simple:active {
    transform: scale(0.98);
  }

  .delete-confirm-simple {
    display: flex;
    flex-direction: column;
    gap: var(--fb-space-md);
    padding: var(--fb-space-md);
    background: color-mix(in srgb, #ef4444 5%, transparent);
    border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
    border-radius: var(--fb-radius-md);
  }

  .delete-confirm-text {
    font-size: var(--fb-text-sm);
    color: var(--fb-text);
    font-weight: 500;
  }

  .delete-confirm-actions {
    display: flex;
    gap: var(--fb-space-sm);
  }

  .cancel-btn-simple {
    flex: 1;
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: var(--fb-surface);
    border: 1px solid var(--fb-border);
    border-radius: var(--fb-radius-md);
    color: var(--fb-text);
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .cancel-btn-simple:hover {
    background: var(--fb-surface-hover);
  }

  .confirm-btn-simple {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: var(--fb-space-sm) var(--fb-space-md);
    background: #ef4444;
    border: 1px solid #ef4444;
    border-radius: var(--fb-radius-md);
    color: white;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .confirm-btn-simple:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
  }

  .confirm-btn-simple:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
