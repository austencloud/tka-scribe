<!-- EditableChangelogItem - A changelog entry with inline editing for admins -->
<script lang="ts">
  import type { ChangelogEntry } from "$lib/features/feedback/domain/models/version-models";
  import { fly, scale } from "svelte/transition";

  let {
    entry,
    canEdit,
    onSave,
    onOpenFeedback,
    itemId,
    isEditing,
    onStartEdit,
    onEndEdit,
  }: {
    entry: ChangelogEntry;
    canEdit: boolean;
    onSave: (newText: string) => Promise<void>;
    onOpenFeedback?: () => void;
    itemId: string;
    isEditing: boolean;
    onStartEdit?: (id: string) => void;
    onEndEdit?: () => void;
  } = $props();

  let editText = $state(entry.text);
  let isSaving = $state(false);
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
      {:else if !hasChanges}
        <div class="hint" in:fly={{ y: -10, duration: 200 }}>
          Make changes to enable Save • Press <kbd>Esc</kbd> to exit
        </div>
      {/if}

      {#if hasChanges}
        <div class="edit-actions" in:fly={{ y: 10, duration: 200 }}>
          <button
            type="button"
            class="action-btn save"
            onclick={() => void saveEdit()}
            disabled={isSaving}
          >
            {#if isSaving}
              <i class="fas fa-spinner fa-spin"></i>
              Saving...
            {:else}
              <i class="fas fa-check"></i>
              Save
            {/if}
          </button>

          <button
            type="button"
            class="action-btn cancel"
            onclick={cancelEdit}
            disabled={isSaving}
          >
            <i class="fas fa-times"></i>
            Cancel
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

  .hint {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    padding: 4px 8px;
  }

  kbd {
    display: inline-block;
    padding: 2px 5px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    font-family: monospace;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
  }

  .error-message {
    font-size: 12px;
    color: #ef4444;
    padding: 4px 8px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 4px;
  }

  .edit-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .action-btn.save {
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.4);
    color: #c4b5fd;
  }

  .action-btn.save:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.3);
    color: #ddd6fe;
  }

  .action-btn.cancel {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }

  .action-btn.cancel:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }
</style>
