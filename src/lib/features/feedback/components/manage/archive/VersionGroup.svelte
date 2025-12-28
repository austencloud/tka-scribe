<!-- VersionGroup - Expandable version accordion with feedback items -->
<script lang="ts">
  import type { VersionFeedbackItem as VersionFeedbackItemType } from "../../../domain/models/version-models";
  import type { AppVersion } from "../../../domain/models/version-models";
  import VersionFeedbackItem from "./VersionFeedbackItem.svelte";

  const {
    version,
    isExpanded,
    isLoading,
    feedbackItems,
    onToggle,
    onItemClick,
  } = $props<{
    version: AppVersion;
    isExpanded: boolean;
    isLoading: boolean;
    feedbackItems: VersionFeedbackItemType[];
    onToggle: () => void;
    onItemClick: (itemId: string) => void;
  }>();

  const formattedDate = $derived(
    version.releasedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );
</script>

<div class="version-group" class:expanded={isExpanded}>
  <button type="button" class="version-header" onclick={onToggle}>
    <div class="version-info">
      <span class="version-number">v{version.version}</span>
      <span class="version-date">{formattedDate}</span>
    </div>
    <div class="version-summary">
      {#if version.feedbackSummary.bugs > 0}
        <span class="summary-badge bug">
          <i class="fas fa-bug" aria-hidden="true"></i>
          {version.feedbackSummary.bugs}
        </span>
      {/if}
      {#if version.feedbackSummary.features > 0}
        <span class="summary-badge feature">
          <i class="fas fa-lightbulb" aria-hidden="true"></i>
          {version.feedbackSummary.features}
        </span>
      {/if}
      {#if version.feedbackSummary.general > 0}
        <span class="summary-badge general">
          <i class="fas fa-comment" aria-hidden="true"></i>
          {version.feedbackSummary.general}
        </span>
      {/if}
    </div>
    <i
      class="fas fa-chevron-{isExpanded ? 'up' : 'down'} expand-icon"
      aria-hidden="true"
    ></i>
  </button>

  {#if isExpanded}
    <div class="version-items">
      {#if isLoading}
        <div class="items-loading">
          <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
          Loading...
        </div>
      {:else if feedbackItems.length === 0}
        <div class="items-empty">No feedback items in this release.</div>
      {:else}
        {#each feedbackItems as item (item.id)}
          <VersionFeedbackItem {item} onclick={() => onItemClick(item.id)} />
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .version-group {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
  }

  .version-group.expanded {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.12));
  }

  .version-header {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px;
    background: transparent;
    border: none;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    cursor: pointer;
    transition: background 0.2s;
  }

  .version-header:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
  }

  .version-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
  }

  .version-number {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .version-date {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .version-summary {
    display: flex;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
  }

  .summary-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .summary-badge.bug {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
  }

  .summary-badge.feature {
    background: rgba(139, 92, 246, 0.15);
    color: #a78bfa;
  }

  .summary-badge.general {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  .expand-icon {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    font-size: 12px;
    transition: transform 0.2s;
  }

  .version-items {
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .items-loading,
  .items-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 13px;
  }
</style>
