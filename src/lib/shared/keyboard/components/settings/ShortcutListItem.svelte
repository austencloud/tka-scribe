<!--
  ShortcutListItem.svelte

  Individual shortcut row for the keyboard settings tab.
  Shows label, description, context badge, key combo, and edit button.
-->
<script lang="ts">
  import KeyboardKeyDisplay from "./KeyboardKeyDisplay.svelte";
  import type { ShortcutWithBinding } from "../../services/contracts/IShortcutCustomizationService";
  import type { ShortcutContext } from "../../domain/types/keyboard-types";

  let {
    item,
    onEdit = () => {},
    onReset = () => {},
  }: {
    item: ShortcutWithBinding;
    onEdit?: (item: ShortcutWithBinding) => void;
    onReset?: (item: ShortcutWithBinding) => void;
  } = $props();

  // Format context for display
  function formatContext(context: ShortcutContext | ShortcutContext[]): string {
    const contexts = Array.isArray(context) ? context : [context];
    if (contexts.includes("global")) return "Global";

    const labels: Record<string, string> = {
      create: "Create",
      discover: "Discover",
      learn: "Learn",
      collect: "Collect",
      compose: "Compose",
      admin: "Admin",
      "edit-panel": "Edit Panel",
      "animation-panel": "Animation",
      "share-panel": "Share",
      modal: "Modal",
      "command-palette": "Palette",
    };

    return contexts.map((c) => labels[c] || c).join(", ");
  }

  function handleEdit() {
    onEdit(item);
  }

  function handleReset(e: MouseEvent) {
    e.stopPropagation();
    onReset(item);
  }
</script>

<button
  class="shortcut-item"
  class:customized={item.isCustomized}
  class:disabled={item.isDisabled}
  onclick={handleEdit}
  type="button"
>
  <div class="shortcut-info">
    <div class="shortcut-header">
      <span class="shortcut-label">{item.shortcut.label}</span>
      {#if item.isCustomized}
        <span class="customized-badge">Custom</span>
      {/if}
      {#if item.isDisabled}
        <span class="disabled-badge">Disabled</span>
      {/if}
    </div>
    {#if item.shortcut.description}
      <span class="shortcut-description">{item.shortcut.description}</span>
    {/if}
    <span class="shortcut-context">{formatContext(item.shortcut.context ?? "global")}</span>
  </div>

  <div class="shortcut-actions">
    <div class="key-combo-wrapper" class:muted={item.isDisabled}>
      <KeyboardKeyDisplay parsed={item.effectiveBinding} size="small" />
    </div>

    {#if item.isCustomized}
      <button
        class="reset-btn"
        onclick={handleReset}
        aria-label="Reset to default"
        type="button"
      >
        <i class="fas fa-undo"></i>
      </button>
    {/if}

    <button class="edit-btn" aria-label="Edit shortcut" type="button">
      <i class="fas fa-pen"></i>
    </button>
  </div>
</button>

<style>
  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    cursor: pointer;
    text-align: left;
    transition: background 150ms ease;
  }

  .shortcut-item:last-child {
    border-bottom: none;
  }

  .shortcut-item:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .shortcut-item.customized {
    background: rgba(99, 102, 241, 0.04);
  }

  .shortcut-item.customized:hover {
    background: rgba(99, 102, 241, 0.08);
  }

  .shortcut-item.disabled {
    opacity: 0.6;
  }

  .shortcut-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .shortcut-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .shortcut-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .customized-badge,
  .disabled-badge {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .customized-badge {
    background: rgba(99, 102, 241, 0.2);
    color: rgba(167, 139, 250, 1);
  }

  .disabled-badge {
    background: rgba(239, 68, 68, 0.2);
    color: rgba(248, 113, 113, 1);
  }

  .shortcut-description {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .shortcut-context {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .shortcut-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .key-combo-wrapper {
    transition: opacity 150ms ease;
  }

  .key-combo-wrapper.muted {
    opacity: 0.4;
    text-decoration: line-through;
  }

  .reset-btn,
  .edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .reset-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: rgba(248, 113, 113, 1);
  }

  .edit-btn {
    opacity: 0;
  }

  .shortcut-item:hover .edit-btn {
    opacity: 1;
  }

  .edit-btn:hover {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
    color: rgba(167, 139, 250, 1);
  }

  /* Mobile: Always show edit button */
  @media (max-width: 768px) {
    .shortcut-item {
      padding: 14px 12px;
    }

    .edit-btn {
      opacity: 1;
    }

    .reset-btn,
    .edit-btn {
      width: 40px;
      height: 40px;
    }
  }
</style>
