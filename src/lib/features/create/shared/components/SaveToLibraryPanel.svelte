<!--
  SaveToLibraryPanel.svelte

  Side panel (desktop) / bottom sheet (mobile) for saving sequences to library.
  Uses CreatePanelDrawer for responsive layout matching other Create panels.
-->
<script lang="ts" module>
  export interface SaveMetadata {
    name: string;
    visibility: "public" | "private" | "unlisted";
    tags: string[];
    collectionIds: string[];
    notes: string;
  }
</script>

<script lang="ts">
  import CreatePanelDrawer from "./CreatePanelDrawer.svelte";
  import SheetDragHandle from "$lib/shared/foundation/ui/SheetDragHandle.svelte";
  import TagAutocompleteInput from "$lib/features/library/components/tags/TagAutocompleteInput.svelte";
  import SaveProgressOverlay from "$lib/features/library/components/SaveProgressOverlay.svelte";
  import ExpandableField from "$lib/features/library/components/ExpandableField.svelte";
  import VisibilityToggle from "$lib/features/library/components/VisibilityToggle.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { getCreateModuleContext } from "../context/create-module-context";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import type { SequenceVisibility } from "$lib/features/library/domain/models/LibrarySequence";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ILibrarySaveService } from "$lib/features/library/services/contracts/ILibrarySaveService";

  interface Props {
    show: boolean;
    word?: string;
    onClose?: () => void;
    onSaveComplete?: (sequenceId: string) => void;
  }

  let { show, word = "", onClose, onSaveComplete }: Props = $props();

  const logger = createComponentLogger("SaveToLibraryPanel");

  // Context
  const ctx = getCreateModuleContext();
  const { CreateModuleState } = ctx;

  // Get current sequence
  const activeSequenceState = $derived(
    CreateModuleState.getActiveTabSequenceState()
  );
  const sequence = $derived(activeSequenceState.currentSequence);

  // Local state - initialized with default, $effect below syncs from prop
  let isOpen = $state(false);
  let isSaving = $state(false);
  let saveStep = $state(0);
  let renderProgress = $state({ current: 0, total: 0 });

  // Get the save service
  const librarySaveService = tryResolve<ILibrarySaveService>(
    TYPES.ILibrarySaveService
  );

  // Save steps definition
  const saveSteps = [
    { icon: "fa-image", label: "Creating thumbnail" },
    { icon: "fa-cloud-upload-alt", label: "Uploading preview" },
    { icon: "fa-tags", label: "Creating tags" },
    { icon: "fa-save", label: "Saving to library" },
    { icon: "fa-sync", label: "Syncing data" },
  ];

  // Dynamic label for step 1 showing beat progress
  const step1Label = $derived(
    saveStep === 1 && renderProgress.total > 0
      ? `Rendering beat ${renderProgress.current} of ${renderProgress.total}`
      : "Creating thumbnail"
  );

  // Form state
  let customDisplayName = $state("");
  let tags = $state<string[]>([]);
  let notes = $state("");
  let isPublic = $state(true);
  let tagResetTrigger = $state(0);

  // Expandable sections
  let showDisplayName = $state(false);
  let showNotes = $state(false);
  let showTags = $state(false);

  // Derived values
  const tkaName = $derived(word || sequence?.word || "");
  const visibility = $derived<SequenceVisibility>(
    isPublic ? "public" : "private"
  );
  const currentUser = $derived(authState.user);
  const creatorName = $derived(
    currentUser?.displayName || currentUser?.email || "Anonymous"
  );

  // Sync isOpen with show prop
  $effect(() => {
    isOpen = show;
  });

  // Reset form when sequence changes or panel opens
  $effect(() => {
    if (sequence && show) {
      customDisplayName = sequence.displayName || "";
      tags = [];
      notes = "";
      showDisplayName = !!sequence.displayName;
      showNotes = false;
      showTags = false;
    }
  });

  function handleTagsChange(newTags: string[]) {
    tags = newTags;
  }

  async function handleSave() {
    if (!tkaName || !sequence) return;
    if (!librarySaveService) {
      logger.error("LibrarySaveService not available");
      return;
    }

    isSaving = true;
    saveStep = 1;
    renderProgress = { current: 0, total: 0 };

    try {
      logger.info("Saving sequence to library...", {
        beatCount: sequence.beats.length,
        tkaName,
        customDisplayName: customDisplayName.trim() || "(none)",
      });

      const result = await librarySaveService.saveSequence(
        sequence,
        {
          name: tkaName,
          displayName: customDisplayName.trim() || undefined,
          visibility,
          tags,
          notes: notes.trim(),
        },
        (progress) => {
          saveStep = progress.step;
          if (progress.renderProgress) {
            renderProgress = progress.renderProgress;
          }
        }
      );

      logger.success("Sequence saved to library with ID:", result.sequenceId);

      if (ctx.sessionManager) {
        await ctx.sessionManager.markAsSaved(result.sequenceId);
      }

      onSaveComplete?.(result.sequenceId);
      handleClose();
    } catch (error) {
      logger.error("Failed to save sequence:", error);
      saveStep = 0;
    } finally {
      isSaving = false;
      saveStep = 0;
    }
  }

  function handleClose() {
    tagResetTrigger++;
    isOpen = false;
    onClose?.();
  }
</script>

<CreatePanelDrawer
  bind:isOpen
  panelName="save-library"
  fullHeightOnMobile={true}
  showHandle={true}
  closeOnBackdrop={true}
  onClose={handleClose}
  ariaLabel="Save to Library"
>
  <div class="panel-inner">
    <SheetDragHandle />

    {#if isSaving}
      <SaveProgressOverlay
        currentStep={saveStep}
        steps={saveSteps}
        {renderProgress}
        {step1Label}
      />
    {/if}

    <button
      class="close-button"
      onclick={handleClose}
      aria-label="Close panel"
      disabled={isSaving}
    >
      <i class="fas fa-times" aria-hidden="true"></i>
    </button>

    <div class="panel-header">
      <h2>Save to Library</h2>
      <p class="subtitle">Add this sequence to your personal library</p>
    </div>

    <div class="panel-body">
      <!-- TKA Name (read-only) -->
      <div class="form-group">
        <span class="form-label">TKA Name</span>
        <div class="tka-name-display">
          <span class="tka-badge">{tkaName || "..."}</span>
          <span class="tka-hint">Auto-generated from sequence letters</span>
        </div>
      </div>

      <!-- Creator & Visibility -->
      <VisibilityToggle
        {isPublic}
        onToggle={() => (isPublic = !isPublic)}
        {creatorName}
      />

      <!-- Optional Fields -->
      <div class="optional-section">
        <ExpandableField
          label="Display Name"
          expanded={showDisplayName}
          onExpandedChange={(v) => (showDisplayName = v)}
          onCollapse={() => (customDisplayName = "")}
        >
          <input
            id="display-name"
            type="text"
            bind:value={customDisplayName}
            placeholder="e.g., Fire Spin Intro"
            class="input-field"
            maxlength="100"
          />
        </ExpandableField>

        <ExpandableField
          label="Tags"
          expanded={showTags}
          onExpandedChange={(v) => (showTags = v)}
          onCollapse={() => {
            tags = [];
            tagResetTrigger++;
          }}
        >
          <TagAutocompleteInput
            selectedTags={tags}
            onTagsChange={handleTagsChange}
            placeholder="Search or create tags..."
            maxTags={10}
            resetTrigger={tagResetTrigger}
          />
        </ExpandableField>

        <ExpandableField
          label="Notes"
          expanded={showNotes}
          onExpandedChange={(v) => (showNotes = v)}
          onCollapse={() => (notes = "")}
        >
          <textarea
            id="notes"
            bind:value={notes}
            placeholder="Add personal notes about this sequence"
            class="textarea-field"
            rows="3"
            maxlength="500"
          ></textarea>
        </ExpandableField>
      </div>
    </div>

    <div class="panel-footer">
      <button
        type="button"
        class="button button-secondary"
        onclick={handleClose}
      >
        Cancel
      </button>
      <button
        type="button"
        class="button button-primary"
        onclick={handleSave}
        disabled={!tkaName || isSaving}
      >
        {#if isSaving}
          <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
          Saving...
        {:else}
          <i class="fas fa-save" aria-hidden="true"></i>
          Save to Library
        {/if}
      </button>
    </div>
  </div>
</CreatePanelDrawer>

<style>
  .panel-inner {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding-bottom: env(safe-area-inset-bottom);
    overflow: hidden;
  }

  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    border: none;
    border-radius: 50%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    z-index: 10;
  }

  .close-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    transform: scale(1.05);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .close-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }

  .panel-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .panel-body {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .tka-name-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tka-badge {
    font-size: 18px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.3px;
  }

  .tka-hint {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .optional-section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .input-field,
  .textarea-field {
    width: 100%;
    padding: 12px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .input-field:focus,
  .textarea-field:focus {
    outline: none;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: color-mix(in srgb, var(--theme-accent) 50%, transparent);
    box-shadow: 0 0 0 3px
      color-mix(in srgb, var(--theme-accent) 10%, transparent);
  }

  .input-field::placeholder,
  .textarea-field::placeholder {
    color: color-mix(
      in srgb,
      var(--theme-text-dim, rgba(255, 255, 255, 0.6)) 70%,
      transparent
    );
  }

  .textarea-field {
    resize: vertical;
    min-height: 80px;
  }

  .panel-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .button {
    flex: 1;
    padding: 12px 20px;
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .button-secondary:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .button-primary {
    background: linear-gradient(
      135deg,
      var(--theme-accent-strong, #8b5cf6) 0%,
      var(--theme-accent-strong, #7c3aed) 100%
    );
    color: white;
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
  }

  .button-primary:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      var(--theme-accent-strong, #7c3aed) 0%,
      var(--theme-accent-strong, #6d28d9) 100%
    );
    box-shadow: 0 6px 16px
      color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 60%, transparent);
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

  @media (max-width: 640px) {
    .panel-header {
      padding: 20px 20px 12px;
    }

    .panel-header h2 {
      font-size: 18px;
    }

    .panel-body {
      padding: 16px 20px;
    }

    .panel-footer {
      padding: 12px 20px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .button,
    .input-field,
    .textarea-field {
      transition: none;
    }
  }
</style>
