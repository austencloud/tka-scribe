<script lang="ts">
  /**
   * Tag Suggestion Panel
   *
   * Displays suggested tags for a sequence with confirm/reject actions.
   */
  import type {
    ReviewableTag,
    SequenceTagReview,
  } from "../domain/models/tag-review-models";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  interface Props {
    review: SequenceTagReview | null;
    onConfirmTag: (index: number) => void;
    onRejectTag: (index: number) => void;
    onResetTag: (index: number) => void;
    onConfirmAll: () => void;
    onAddCustomTag: (tag: string, category: string) => void;
    onRemoveCustomTag: (tag: string) => void;
  }

  let {
    review,
    onConfirmTag,
    onRejectTag,
    onResetTag,
    onConfirmAll,
    onAddCustomTag,
    onRemoveCustomTag,
  }: Props = $props();

  // Group tags by category
  const groupedTags = $derived.by(() => {
    if (!review) return new Map<string, ReviewableTag[]>();

    const groups = new Map<string, ReviewableTag[]>();
    for (const tag of review.suggestedTags) {
      const existing = groups.get(tag.category) ?? [];
      existing.push(tag);
      groups.set(tag.category, existing);
    }
    return groups;
  });

  // Check if all tags are reviewed
  const allReviewed = $derived(
    review?.suggestedTags.every((t) => t.reviewState !== "pending") ?? false
  );

  const pendingCount = $derived(
    review?.suggestedTags.filter((t) => t.reviewState === "pending").length ?? 0
  );

  // Custom tag input
  let customTagInput = $state("");
  let customTagCategory = $state("structure");

  function handleAddCustomTag() {
    if (customTagInput.trim()) {
      onAddCustomTag(customTagInput.trim().toLowerCase(), customTagCategory);
      customTagInput = "";
    }
  }

  function getTagIndex(tag: ReviewableTag): number {
    return review?.suggestedTags.findIndex((t) => t.tag === tag.tag) ?? -1;
  }

  function getCategoryIcon(category: string): string {
    switch (category) {
      case "difficulty":
        return "signal";
      case "structure":
        return "shapes";
      case "prop":
        return "wand-magic-sparkles";
      case "motion":
        return "arrows-spin";
      case "grid":
        return "border-all";
      case "position":
        return "crosshairs";
      default:
        return "tag";
    }
  }

  function getCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
</script>

<div class="tag-suggestion-panel">
  <div class="panel-header">
    <h3 class="panel-title">
      <FontAwesomeIcon icon="tags" size="1em" />
      Suggested Tags
    </h3>
    {#if pendingCount > 0}
      <button class="confirm-all-btn" onclick={onConfirmAll}>
        <FontAwesomeIcon icon="check-double" size="0.85em" />
        Confirm All ({pendingCount})
      </button>
    {:else if allReviewed}
      <span class="all-reviewed-badge">
        <FontAwesomeIcon icon="circle-check" size="0.85em" />
        All Reviewed
      </span>
    {/if}
  </div>

  {#if !review}
    <div class="empty-state">
      <FontAwesomeIcon icon="tags" size="2em" color="var(--muted)" />
      <p>No tags available for this sequence</p>
    </div>
  {:else}
    <div class="tag-groups">
      {#each [...groupedTags] as [category, tags]}
        <div class="tag-group">
          <div class="group-header">
            <FontAwesomeIcon icon={getCategoryIcon(category)} size="0.85em" />
            <span class="group-label">{getCategoryLabel(category)}</span>
          </div>
          <div class="tag-list">
            {#each tags as tag}
              {@const index = getTagIndex(tag)}
              <div
                class="tag-item"
                class:confirmed={tag.reviewState === "confirmed"}
                class:rejected={tag.reviewState === "rejected"}
              >
                <div class="tag-content">
                  <span class="tag-name">{tag.tag}</span>
                  <span class="tag-confidence" title="Confidence score">
                    {Math.round(tag.confidence * 100)}%
                  </span>
                </div>
                {#if tag.reason}
                  <div class="tag-reason">{tag.reason}</div>
                {/if}
                <div class="tag-actions">
                  {#if tag.reviewState === "pending"}
                    <button
                      class="action-btn confirm"
                      onclick={() => onConfirmTag(index)}
                      title="Confirm this tag"
                    >
                      <FontAwesomeIcon icon="check" size="0.85em" />
                    </button>
                    <button
                      class="action-btn reject"
                      onclick={() => onRejectTag(index)}
                      title="Reject this tag"
                    >
                      <FontAwesomeIcon icon="xmark" size="0.85em" />
                    </button>
                  {:else}
                    <button
                      class="action-btn reset"
                      onclick={() => onResetTag(index)}
                      title="Reset to pending"
                    >
                      <FontAwesomeIcon icon="rotate-left" size="0.85em" />
                    </button>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Custom Tags Section -->
    <div class="custom-tags-section">
      <div class="section-header">
        <FontAwesomeIcon icon="plus" size="0.85em" />
        <span>Custom Tags</span>
      </div>

      {#if review.customTags.length > 0}
        <div class="custom-tag-list">
          {#each review.customTags as tag}
            <div class="custom-tag">
              <span>{tag}</span>
              <button class="remove-btn" onclick={() => onRemoveCustomTag(tag)}>
                <FontAwesomeIcon icon="xmark" size="0.7em" />
              </button>
            </div>
          {/each}
        </div>
      {/if}

      <div class="add-custom-tag">
        <input
          type="text"
          placeholder="Add custom tag..."
          bind:value={customTagInput}
          onkeydown={(e) => e.key === "Enter" && handleAddCustomTag()}
        />
        <select bind:value={customTagCategory}>
          <option value="structure">Structure</option>
          <option value="difficulty">Difficulty</option>
          <option value="motion">Motion</option>
          <option value="position">Position</option>
          <option value="prop">Prop</option>
          <option value="grid">Grid</option>
        </select>
        <button class="add-btn" onclick={handleAddCustomTag}>
          <FontAwesomeIcon icon="plus" size="0.85em" />
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .tag-suggestion-panel {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    background: var(--surface-glass);
    border-radius: 12px;
    padding: var(--spacing-lg);
    overflow-y: auto;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 700;
  }

  .confirm-all-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-md);
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 6px;
    color: #4ade80;
    font-size: var(--font-size-xs);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .confirm-all-btn:hover {
    background: rgba(34, 197, 94, 0.3);
  }

  .all-reviewed-badge {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-md);
    background: rgba(34, 197, 94, 0.15);
    border-radius: 6px;
    color: #4ade80;
    font-size: var(--font-size-xs);
    font-weight: 600;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    color: var(--muted);
  }

  .tag-groups {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
  }

  .tag-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .group-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--muted-foreground);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tag-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .tag-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--surface-color);
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 8px;
    transition: var(--transition-fast);
  }

  .tag-item.confirmed {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
  }

  .tag-item.rejected {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    opacity: 0.7;
  }

  .tag-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tag-name {
    font-weight: 600;
    color: var(--foreground);
  }

  .tag-confidence {
    font-size: var(--font-size-xs);
    color: var(--muted);
    background: rgba(255, 255, 255, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .tag-reason {
    font-size: var(--font-size-xs);
    color: var(--muted-foreground);
  }

  .tag-actions {
    display: flex;
    gap: var(--spacing-xs);
    margin-top: var(--spacing-xs);
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--surface-dark);
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 6px;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .action-btn:hover {
    color: var(--foreground);
  }

  .action-btn.confirm:hover {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.4);
    color: #4ade80;
  }

  .action-btn.reject:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: var(--semantic-error);
  }

  .action-btn.reset:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
    color: #a5b4fc;
  }

  /* Custom Tags Section */
  .custom-tags-section {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--theme-stroke, var(--theme-stroke));
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
    color: var(--muted-foreground);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .custom-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);
  }

  .custom-tag {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 6px;
    font-size: var(--font-size-xs);
    font-weight: 500;
  }

  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background: transparent;
    border: none;
    color: var(--muted);
    cursor: pointer;
    border-radius: 4px;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: var(--semantic-error);
  }

  .add-custom-tag {
    display: flex;
    gap: var(--spacing-xs);
  }

  .add-custom-tag input {
    flex: 1;
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--surface-dark);
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 6px;
    color: var(--foreground);
    font-size: var(--font-size-sm);
  }

  .add-custom-tag input:focus {
    outline: none;
    border-color: var(--primary-color);
  }

  .add-custom-tag select {
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--surface-dark);
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 6px;
    color: var(--foreground);
    font-size: var(--font-size-xs);
  }

  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: var(--gradient-primary);
    border: none;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .add-btn:hover {
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
  }
</style>
