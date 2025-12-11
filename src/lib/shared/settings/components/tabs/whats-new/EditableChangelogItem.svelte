<!-- EditableChangelogItem - A changelog entry with inline editing for admins -->
<script lang="ts">
  import type { ChangelogEntry } from "$lib/features/feedback/domain/models/version-models";
  import { fly, scale } from "svelte/transition";

  let {
    entry,
    canEdit,
    onSave,
    onDelete,
    onOpenFeedback,
    itemId,
    isEditing,
    onStartEdit,
    onEndEdit,
  }: {
    entry: ChangelogEntry;
    canEdit: boolean;
    onSave: (newText: string) => Promise<void>;
    onDelete?: () => Promise<void>;
    onOpenFeedback?: () => void;
    itemId: string;
    isEditing: boolean;
    onStartEdit?: (id: string) => void;
    onEndEdit?: () => void;
  } = $props();

  let editText = $state(entry.text);
  let isSaving = $state(false);
  let isDeleting = $state(false);
  let showDeleteConfirm = $state(false);
  let error = $state<string | null>(null);

  // Track if user has made changes
  const hasChanges = $derived(editText.trim() !== entry.text.trim());

  function startEdit() {
    if (!canEdit) return;
    if (onStartEdit) {
      onStartEdit(itemId);
    }
    editText = entry.text;
    error = null;
  }

  function cancelEdit() {
    if (onEndEdit) {
      onEndEdit();
    }
    editText = entry.text;
    error = null;
    showDeleteConfirm = false;
  }

  async function handleDelete() {
    if (!onDelete) return;

    isDeleting = true;
    error = null;

    try {
      await onDelete();
      if (onEndEdit) {
        onEndEdit();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to delete";
      showDeleteConfirm = false;
    } finally {
      isDeleting = false;
    }
  }

  async function saveEdit() {
    if (!editText.trim()) {
      error = "Text cannot be empty";
      return;
    }

    isSaving = true;
    error = null;

    try {
      await onSave(editText.trim());
      if (onEndEdit) {
        onEndEdit();
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to save";
    } finally {
      isSaving = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void saveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelEdit();
    }
  }

  const hasLink = $derived(!!entry.feedbackId);
</script>

{#key isEditing}
  {#if isEditing}
    <!-- Edit Mode -->
    <div
      class="edit-container"
      in:scale={{ duration: 250, start: 0.96, opacity: 0 }}
      out:scale={{ duration: 200, start: 0.96, opacity: 0 }}
    >
      <!-- svelte-ignore a11y_autofocus -->
      <textarea
        bind:value={editText}
        onkeydown={handleKeydown}
        placeholder="Enter changelog text..."
        rows="2"
        disabled={isSaving}
        autofocus
      ></textarea>

      {#if error}
        <div class="error-message" in:fly={{ y: -10, duration: 200 }}>
          {error}
        </div>
      {/if}

      {#if showDeleteConfirm}
        <div class="delete-confirm" in:fly={{ y: 10, duration: 200 }}>
          <span class="confirm-text">Delete this entry?</span>
          <div class="confirm-actions">
            <button
              type="button"
              class="glass-btn danger"
              onclick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {#if isDeleting}
                <i class="fas fa-spinner fa-spin"></i>
              {:else}
                <i class="fas fa-trash"></i>
              {/if}
              Delete
            </button>
            <button
              type="button"
              class="glass-btn"
              onclick={() => (showDeleteConfirm = false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
          </div>
        </div>
      {:else}
        <div class="edit-actions" in:fly={{ y: 10, duration: 200 }}>
          {#if onDelete}
            <button
              type="button"
              class="glass-btn danger"
              onclick={() => (showDeleteConfirm = true)}
              disabled={isSaving}
            >
              <i class="fas fa-trash"></i>
              Delete
            </button>
          {/if}

          {#if hasChanges}
            <button
              type="button"
              class="glass-btn primary flex-2"
              onclick={() => void saveEdit()}
              disabled={isSaving}
            >
              {#if isSaving}
                <i class="fas fa-spinner fa-spin"></i>
              {:else}
                <i class="fas fa-check"></i>
              {/if}
              Save
            </button>
          {/if}

          <button
            type="button"
            class="glass-btn"
            onclick={cancelEdit}
            disabled={isSaving}
          >
            <i class="fas fa-times"></i>
            {hasChanges ? "Cancel" : "Close"}
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <!-- View Mode -->
    <button
      type="button"
      class="change-item"
      class:clickable={canEdit || hasLink}
      class:editable={canEdit}
      in:scale={{ duration: 250, start: 0.96, opacity: 0 }}
      out:scale={{ duration: 200, start: 0.96, opacity: 0 }}
      onclick={(e) => {
        if (canEdit) {
          e.stopPropagation(); // Prevent panel click handler from immediately closing
          startEdit();
        } else if (hasLink && onOpenFeedback) {
          onOpenFeedback();
        }
      }}
    >
      <span class="bullet"></span>
      <span class="change-text">{entry.text}</span>

      {#if hasLink && !canEdit}
        <i class="fas fa-chevron-right arrow"></i>
      {/if}
    </button>
  {/if}
{/key}

<style>
  /* View Mode */
  .change-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: none;
    border-radius: 8px;
    text-align: left;
    cursor: default;
    transition:
      background 0.2s,
      transform 0.2s;
    position: relative;
  }

  .change-item.clickable {
    cursor: pointer;
  }

  .change-item.clickable:hover {
    background: rgba(255, 255, 255, 0.07);
  }

  .change-item.clickable:active {
    transform: scale(0.99);
  }

  .change-item:disabled {
    cursor: default;
  }

  .bullet {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    margin-top: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
  }

  .change-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.8);
  }

  .arrow {
    margin-left: auto;
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.3);
    font-size: 12px;
    transition:
      transform 0.2s,
      color 0.2s;
  }

  .change-item.clickable:hover .arrow {
    color: rgba(139, 92, 246, 0.8);
    transform: translateX(2px);
  }

  /* Edit Mode */
  .edit-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
  }

  textarea {
    width: 100%;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    line-height: 1.5;
    font-family: inherit;
    resize: vertical;
    min-height: 60px;
  }

  textarea:focus {
    outline: none;
    border-color: rgba(139, 92, 246, 0.5);
  }

  textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    font-size: 12px;
    color: #ef4444;
    padding: 6px 10px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 6px;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
  }

  /* Glass morphism buttons - unified style */
  .glass-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    padding: 0 14px;
    background: rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .glass-btn.flex-2 {
    flex: 2;
  }

  .glass-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }

  .glass-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .glass-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .glass-btn i {
    font-size: 12px;
  }

  /* Primary variant (purple) */
  .glass-btn.primary {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.3);
    color: #c4b5fd;
  }

  .glass-btn.primary:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.45);
    color: #ddd6fe;
  }

  /* Danger variant (red) */
  .glass-btn.danger {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.25);
    color: rgba(252, 165, 165, 0.9);
  }

  .glass-btn.danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.18);
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }

  /* Delete confirmation bar */
  .delete-confirm {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 10px;
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.2);
    border-radius: 8px;
  }

  .confirm-text {
    font-size: 13px;
    color: #fca5a5;
    font-weight: 500;
  }

  .confirm-actions {
    display: flex;
    gap: 8px;
  }
</style>
