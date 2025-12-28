<!-- VersionFeedbackItem - Compact feedback item row within a version group -->
<script lang="ts">
  import type { VersionFeedbackItem as VersionFeedbackItemType } from "../../../domain/models/version-models";
  import {
    TYPE_CONFIG,
    type FeedbackType,
  } from "../../../domain/models/feedback-models";

  const DEFAULT_TYPE_CONFIG = {
    label: "Unknown",
    color: "#6b7280",
    icon: "fa-question-circle",
    placeholder: "",
  };

  const { item, onclick } = $props<{
    item: VersionFeedbackItemType;
    onclick: () => void;
  }>();

  const typeConfig = $derived(
    TYPE_CONFIG[item.type as FeedbackType] || DEFAULT_TYPE_CONFIG
  );
</script>

<button type="button" class="feedback-item" {onclick}>
  <div class="item-icon" style="--type-color: {typeConfig.color}">
    <i class="fas {typeConfig.icon}" aria-hidden="true"></i>
  </div>
  <div class="item-content">
    <span class="item-title">{item.title}</span>
    <span class="item-description">{item.description}</span>
  </div>
  <i class="fas fa-chevron-right item-arrow" aria-hidden="true"></i>
</button>

<style>
  .feedback-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 10px 12px;
    background: color-mix(
      in srgb,
      var(--theme-panel-bg, #12121a) 80%,
      transparent
    );
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .feedback-item:hover {
    background: color-mix(
      in srgb,
      var(--theme-panel-bg, #12121a) 90%,
      transparent
    );
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .feedback-item:active {
    transform: scale(0.99);
  }

  .item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border-radius: 6px;
    color: var(--type-color);
    font-size: 12px;
    flex-shrink: 0;
  }

  .item-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .item-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-description {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-arrow {
    color: color-mix(
      in srgb,
      var(--theme-text-dim, rgba(255, 255, 255, 0.5)) 60%,
      transparent
    );
    font-size: 12px;
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  .feedback-item:hover .item-arrow {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    transform: translateX(2px);
  }
</style>
