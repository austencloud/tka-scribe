<!--
SaveToLibraryDialog.svelte

Dialog for configuring sequence metadata before saving to library.
Allows user to set name, visibility, tags, collections, and notes.
-->
<script lang="ts" module>
  import type { SequenceVisibility } from "$lib/features/library/domain/models/LibrarySequence";

  export interface SaveMetadata {
    name: string;
    visibility: SequenceVisibility;
    tags: string[];
    collectionIds: string[];
    notes: string;
  }
</script>

<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import SheetDragHandle from "$lib/shared/foundation/ui/SheetDragHandle.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  let {
    isOpen = false,
    sequence,
    onSave,
    onCancel,
  } = $props<{
    isOpen: boolean;
    sequence: SequenceData | null;
    onSave?: (metadata: SaveMetadata) => void;
    onCancel?: () => void;
  }>();

  // Form state
  let name = $state("");
  let tagInput = $state("");
  let tags = $state<string[]>([]);
  let notes = $state("");

  // Always public - no private sequences for sharing
  const visibility: SequenceVisibility = "public";

  // Derived state
  const currentUser = $derived(authStore.user);
  const displayName = $derived(
    currentUser?.displayName || currentUser?.email || "Anonymous"
  );

  // Reset form when sequence changes
  $effect(() => {
    if (sequence && isOpen) {
      name = sequence.name || sequence.word || "";
      tags = [];
      tagInput = "";
      notes = "";
    }
  });

  function handleAddTag() {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      tags = [...tags, trimmedTag];
      tagInput = "";
    }
  }

  function handleRemoveTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
  }

  function handleTagKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    }
  }

  function handleSave() {
    if (!name.trim()) {
      // Could show validation error
      return;
    }

    const metadata: SaveMetadata = {
      name: name.trim(),
      visibility: "public", // Always public
      tags,
      collectionIds: [], // Not used for now
      notes: notes.trim(),
    };

    onSave?.(metadata);
  }

  function handleCancel() {
    onCancel?.();
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onCancel?.();
    }
  }
</script>

<Drawer
  {isOpen}
  onOpenChange={handleOpenChange}
  labelledBy="save-to-library-title"
  closeOnBackdrop={true}
  showHandle={true}
  respectLayoutMode={false}
  placement="bottom"
  trapFocus={true}
  preventScroll={true}
  class="save-to-library-dialog"
>
  <div
    class="dialog-content"
    role="dialog"
    aria-labelledby="save-to-library-title"
  >
    <SheetDragHandle />

    <!-- Close button -->
    <button
      class="close-button"
      onclick={handleCancel}
      aria-label="Close dialog"
    >
      <i class="fas fa-times"></i>
    </button>

    <!-- Header -->
    <div class="dialog-header">
      <h2 id="save-to-library-title">Save & Share</h2>
      <p class="subtitle">
        Your sequence will be saved publicly to the gallery
      </p>
    </div>

    <!-- Form -->
    <div class="dialog-body">
      <!-- Sequence Name -->
      <div class="form-group">
        <label for="sequence-name">
          Sequence Name <span class="required">*</span>
        </label>
        <input
          id="sequence-name"
          type="text"
          bind:value={name}
          placeholder="Enter sequence name"
          class="input-field"
          maxlength="100"
        />
      </div>

      <!-- Creator Info (compact) -->
      <div class="info-chip">
        <i class="fas fa-user"></i>
        <span>By {displayName}</span>
        <span class="separator">•</span>
        <i class="fas fa-globe"></i>
        <span>Public</span>
      </div>

      <!-- Tags -->
      <div class="form-group">
        <label for="tag-input">Tags</label>
        <div class="tag-input-container">
          <input
            id="tag-input"
            type="text"
            bind:value={tagInput}
            onkeydown={handleTagKeydown}
            placeholder="Add tags (press Enter)"
            class="input-field"
            maxlength="50"
          />
          <button
            type="button"
            class="add-tag-button"
            onclick={handleAddTag}
            disabled={!tagInput.trim()}
            aria-label="Add tag"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>

        {#if tags.length > 0}
          <div class="tags-list">
            {#each tags as tag}
              <div class="tag-chip">
                <span class="tag-text">{tag}</span>
                <button
                  type="button"
                  class="tag-remove"
                  onclick={() => handleRemoveTag(tag)}
                  aria-label="Remove tag {tag}"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Collections (Placeholder for future implementation) -->
      <div class="form-group">
        <span class="form-label">Collections</span>
        <p class="placeholder-text">
          <i class="fas fa-folder"></i>
          Collection management coming soon
        </p>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label for="notes">Notes (optional)</label>
        <textarea
          id="notes"
          bind:value={notes}
          placeholder="Add personal notes about this sequence"
          class="textarea-field"
          rows="3"
          maxlength="500"
        ></textarea>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="dialog-footer">
      <button
        type="button"
        class="button button-secondary"
        onclick={handleCancel}
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-primary"
        onclick={handleSave}
        disabled={!name.trim()}
      >
        <i class="fas fa-save"></i>
        Save & Continue
      </button>
    </div>
  </div>
</Drawer>

<style>
  /* Dialog Container */
  :global(.drawer-content.save-to-library-dialog) {
    --sheet-bg: var(--sheet-bg-gradient);
    --sheet-border: var(--sheet-border-medium);
    --sheet-shadow: none;
    max-height: 85vh;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Close Button */
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: var(--sheet-close-size-small);
    height: var(--sheet-close-size-small);
    border: none;
    border-radius: 50%;
    background: var(--sheet-close-bg);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all var(--sheet-transition-smooth);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    z-index: 10;
  }

  .close-button:hover {
    background: var(--sheet-close-bg-hover);
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  /* Header */
  .dialog-header {
    padding: 24px 24px 16px;
    border-bottom: var(--sheet-header-border);
    background: var(--sheet-header-bg);
  }

  .dialog-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .subtitle {
    margin: 4px 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Body */
  .dialog-body {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  /* Form Groups */
  .form-group {
    margin-bottom: 24px;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  label,
  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .required {
    color: #ef4444;
  }

  /* Input Fields */
  .input-field,
  .textarea-field {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .input-field:focus,
  .textarea-field:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  .input-field::placeholder,
  .textarea-field::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .textarea-field {
    resize: vertical;
    min-height: 80px;
  }

  /* Info Chip */
  .info-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    margin-bottom: 24px;
  }

  .info-chip i {
    opacity: 0.6;
  }

  .separator {
    opacity: 0.3;
  }

  /* Tag Input */
  .tag-input-container {
    display: flex;
    gap: 8px;
  }

  .tag-input-container .input-field {
    flex: 1;
  }

  .add-tag-button {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 8px;
    color: rgba(139, 92, 246, 1);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .add-tag-button:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.5);
  }

  .add-tag-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Tags List */
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .tag-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 16px;
    color: rgba(139, 92, 246, 1);
    font-size: 13px;
  }

  .tag-text {
    font-weight: 500;
  }

  .tag-remove {
    width: 16px;
    height: 16px;
    padding: 0;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  /* Placeholder Text */
  .placeholder-text {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 13px;
    margin: 0;
  }

  /* Footer */
  .dialog-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: var(--sheet-header-border);
    background: var(--sheet-header-bg);
  }

  .button {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .button-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .button-secondary:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  .button-primary {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  .button-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.6);
    transform: translateY(-1px);
  }

  .button-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .button-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* Mobile Responsiveness */
  @media (max-width: 640px) {
    .dialog-header {
      padding: 20px 20px 12px;
    }

    .dialog-header h2 {
      font-size: 20px;
    }

    .dialog-body {
      padding: 20px;
    }

    .dialog-footer {
      padding: 12px 20px;
    }
  }

  /* Reduced Motion */
  @media (prefers-reduced-motion: reduce) {
    .button,
    .add-tag-button,
    .input-field,
    .textarea-field {
      transition: none;
    }
  }
</style>
