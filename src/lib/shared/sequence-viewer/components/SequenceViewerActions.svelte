<!--
  SequenceViewerActions.svelte - Action buttons for the Sequence Viewer

  Handles the action buttons with their various states:
  - Open in Create (primary action)
  - Save to Library (with saving/saved states)
  - Share
  - Favorite toggle
-->
<script lang="ts">
  const {
    isAuthenticated = false,
    isSaving = false,
    isSavedToLibrary = false,
    isFavorite = false,
    saveError = null,
    onAction,
  } = $props<{
    isAuthenticated?: boolean;
    isSaving?: boolean;
    isSavedToLibrary?: boolean;
    isFavorite?: boolean;
    saveError?: string | null;
    onAction: (action: string) => void;
  }>();
</script>

<section class="actions-section">
  <button
    class="action-button primary"
    onclick={() => onAction("open-in-create")}
  >
    <i class="fas fa-pen-to-square"></i>
    Open in Create
  </button>

  {#if isAuthenticated}
    <button
      class="action-button"
      class:success={isSavedToLibrary}
      onclick={() => onAction("save")}
      disabled={isSaving}
    >
      {#if isSaving}
        <i class="fas fa-spinner fa-spin"></i>
        Saving...
      {:else if isSavedToLibrary}
        <i class="fas fa-check"></i>
        Saved
      {:else}
        <i class="fas fa-bookmark"></i>
        Save to Library
      {/if}
    </button>
  {/if}

  <button class="action-button" onclick={() => onAction("share")}>
    <i class="fas fa-share-alt"></i>
    Share
  </button>

  {#if isAuthenticated}
    <button
      class="action-button"
      class:active={isFavorite}
      onclick={() => onAction("favorite")}
    >
      <i class={isFavorite ? "fas fa-heart" : "far fa-heart"}></i>
      Favorite
    </button>
  {/if}
</section>

{#if saveError}
  <div class="save-error">
    <i class="fas fa-exclamation-circle"></i>
    {saveError}
  </div>
{/if}

<style>
  .actions-section {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    padding-bottom: 24px;
  }

  .action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .action-button.primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
  }

  .action-button.primary:hover {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
  }

  .action-button.active {
    color: #ef4444;
  }

  .action-button.success {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.4);
    color: #10b981;
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .save-error {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 14px;
  }
</style>
