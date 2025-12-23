<!-- ChangeGroupSection - Single changelog category with admin editing -->
<script lang="ts">
  import type {
    ChangelogCategory,
    ChangelogEntry,
  } from "$lib/features/feedback/domain/models/version-models";
  import {
    CATEGORY_ICONS,
    CATEGORY_LABELS,
    CATEGORY_PLACEHOLDERS,
    CATEGORY_ADD_LABELS,
  } from "$lib/features/feedback/domain/constants/changelog-constants";
  import EditableChangelogItem from "./EditableChangelogItem.svelte";

  let {
    category,
    entries,
    isAdmin = false,
    isAddingEntry = false,
    newEntryText = $bindable(""),
    currentlyEditingId,
    onSaveEntry,
    onDeleteEntry,
    onOpenFeedback,
    onStartAdd,
    onCancelAdd,
    onConfirmAdd,
    onStartEdit,
    onEndEdit,
  }: {
    category: ChangelogCategory;
    entries: ChangelogEntry[];
    isAdmin?: boolean;
    isAddingEntry?: boolean;
    newEntryText?: string;
    currentlyEditingId: string | null;
    onSaveEntry: (index: number, newText: string) => Promise<void>;
    onDeleteEntry: (index: number) => Promise<void>;
    onOpenFeedback: (entry: ChangelogEntry) => void;
    onStartAdd: () => void;
    onCancelAdd: () => void;
    onConfirmAdd: () => Promise<void>;
    onStartEdit: (id: string) => void;
    onEndEdit: () => void;
  } = $props();
</script>

<div class="change-group">
  <h4 class="group-title {category}">
    <i class="fas {CATEGORY_ICONS[category]}"></i>
    {CATEGORY_LABELS[category]}
    <span class="count">{entries.length}</span>
  </h4>

  <ul class="change-list">
    {#each entries as entry, index (entry.feedbackId ?? entry.text)}
      {@const itemId = `${category}-${index}`}
      <li>
        <EditableChangelogItem
          {entry}
          canEdit={isAdmin}
          onSave={(newText) => onSaveEntry(index, newText)}
          onDelete={isAdmin ? () => onDeleteEntry(index) : undefined}
          onOpenFeedback={() => onOpenFeedback(entry)}
          {itemId}
          isEditing={currentlyEditingId === itemId}
          {onStartEdit}
          {onEndEdit}
        />
      </li>
    {/each}

    {#if isAdmin && isAddingEntry}
      <li class="add-entry-form">
        <textarea
          bind:value={newEntryText}
          placeholder={CATEGORY_PLACEHOLDERS[category]}
          rows="2"
        ></textarea>
        <div class="add-entry-actions">
          <button
            type="button"
            class="glass-btn primary"
            onclick={() => void onConfirmAdd()}
            disabled={!newEntryText.trim()}
          >
            <i class="fas fa-plus"></i> Add
          </button>
          <button type="button" class="glass-btn" onclick={onCancelAdd}
            >Cancel</button
          >
        </div>
      </li>
    {:else if isAdmin}
      <li>
        <button type="button" class="add-entry-btn" onclick={onStartAdd}>
          <i class="fas fa-plus"></i>
          {CATEGORY_ADD_LABELS[category]}
        </button>
      </li>
    {/if}
  </ul>
</div>

<style>
  .change-group {
    margin-bottom: 20px;
  }
  .change-group:last-child {
    margin-bottom: 0;
  }

  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .group-title .count {
    margin-left: auto;
    padding: 2px 8px;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
  }

  .group-title.fixed {
    color: color-mix(in srgb, var(--semantic-error, #ef4444) 70%, white);
  }
  .group-title.fixed i {
    color: var(--semantic-error, #ef4444);
  }
  .group-title.added {
    color: var(--theme-accent, #c4b5fd);
  }
  .group-title.added i {
    color: var(--theme-accent, #8b5cf6);
  }
  .group-title.improved {
    color: var(--semantic-info, #93c5fd);
  }
  .group-title.improved i {
    color: var(--semantic-info, #3b82f6);
  }

  .change-list {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .change-list li {
    margin-bottom: 6px;
  }
  .change-list li:last-child {
    margin-bottom: 0;
  }

  .add-entry-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: 1px dashed var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-entry-btn:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 10%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 30%,
      transparent
    );
    color: var(--theme-accent, rgba(139, 92, 246, 0.8));
  }

  .add-entry-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 30%, transparent);
    border-radius: 8px;
  }

  .add-entry-form textarea {
    width: 100%;
    padding: 8px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 14px;
    line-height: 1.5;
    font-family: inherit;
    resize: vertical;
    min-height: 60px;
  }

  .add-entry-form textarea:focus {
    outline: none;
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 50%,
      transparent
    );
  }

  .add-entry-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .glass-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .glass-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    transform: translateY(-1px);
  }

  .glass-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .glass-btn.primary {
    background: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 30%,
      transparent
    );
    color: var(--theme-accent, #c4b5fd);
  }

  .glass-btn.primary:hover:not(:disabled) {
    background: color-mix(
      in srgb,
      var(--theme-accent, #8b5cf6) 25%,
      transparent
    );
  }
</style>
