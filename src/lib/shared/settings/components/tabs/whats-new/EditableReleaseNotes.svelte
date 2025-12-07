<!-- EditableReleaseNotes - Release notes with inline editing for admins -->
<script lang="ts">
  import { fly, scale } from "svelte/transition";

  let {
    text,
    canEdit,
    onSave,
    itemId,
    isEditing,
    onStartEdit,
    onEndEdit,
  }: {
    text: string;
    canEdit: boolean;
    onSave: (newText: string) => Promise<void>;
    itemId: string;
    isEditing: boolean;
    onStartEdit?: (id: string) => void;
    onEndEdit?: () => void;
  } = $props();

  let editText = $state(text);
  let isSaving = $state(false);
  let error = $state<string | null>(null);

  // Track if user has made changes
  const hasChanges = $derived(editText.trim() !== text.trim());

  function startEdit() {
    if (!canEdit) return;
    if (onStartEdit) {
      onStartEdit(itemId);
    }
    editText = text;
    error = null;
  }

  function cancelEdit() {
    if (onEndEdit) {
      onEndEdit();
    }
    editText = text;
    error = null;
  }

  async function saveEdit() {
    if (!editText.trim()) {
      error = "Release notes cannot be empty";
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
    // Shift+Enter to save (allow Enter for newlines)
    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      void saveEdit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      cancelEdit();
    }
  }
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
        placeholder="Enter release notes..."
        rows="4"
        disabled={isSaving}
        autofocus
      ></textarea>

      {#if error}
        <div class="error-message" in:fly={{ y: -10, duration: 200 }}>
          {error}
        </div>
      {:else if !hasChanges}
        <div class="hint" in:fly={{ y: -10, duration: 200 }}>
          Make changes to enable Save • Press <kbd>Shift+Enter</kbd> to save,
          <kbd>Esc</kbd> to cancel
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
      class="release-notes-text"
      class:clickable={canEdit}
      in:scale={{ duration: 250, start: 0.96, opacity: 0 }}
      out:scale={{ duration: 200, start: 0.96, opacity: 0 }}
      onclick={(e) => {
        if (canEdit) {
          e.stopPropagation(); // Prevent panel click handler from immediately closing
          startEdit();
        }
      }}
      disabled={!canEdit}
    >
      {text}
    </button>
  {/if}
{/key}

<style>
  /* View Mode */
  .release-notes-text {
    display: block;
    width: 100%;
    margin: 0;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid transparent;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
    white-space: pre-wrap;
    text-align: left;
    cursor: default;
    transition:
      background 0.2s,
      border-color 0.2s;
  }

  .release-notes-text.clickable {
    cursor: pointer;
  }

  .release-notes-text.clickable:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(139, 92, 246, 0.3);
  }

  .release-notes-text:disabled {
    cursor: default;
  }

  /* Edit Mode */
  .edit-container {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
  }

  textarea {
    width: 100%;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    line-height: 1.6;
    font-family: inherit;
    resize: vertical;
    min-height: 100px;
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
    padding: 6px 8px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 6px;
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
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
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
