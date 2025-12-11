<!--
  ShortcutScopeSection.svelte

  Collapsible section for grouping shortcuts by scope.
  Features expand/collapse animation, colored header, and shortcut count.
-->
<script lang="ts">
  import { slide } from "svelte/transition";
  import ShortcutListItem from "./ShortcutListItem.svelte";
  import type { ShortcutWithBinding } from "../../services/contracts/IShortcutCustomizationService";
  import type { ShortcutScope } from "../../domain/types/keyboard-types";

  let {
    scope,
    label,
    shortcuts,
    isExpanded = $bindable(true),
    onEditShortcut = () => {},
    onResetShortcut = () => {},
  }: {
    scope: ShortcutScope;
    label: string;
    shortcuts: ShortcutWithBinding[];
    isExpanded?: boolean;
    onEditShortcut?: (item: ShortcutWithBinding) => void;
    onResetShortcut?: (item: ShortcutWithBinding) => void;
  } = $props();

  // Scope colors for visual distinction
  const scopeColors: Record<ShortcutScope, string> = {
    navigation: "#6366f1", // Indigo
    action: "#10b981", // Emerald
    editing: "#f59e0b", // Amber
    playback: "#ef4444", // Red
    animation: "#8b5cf6", // Violet
    view: "#06b6d4", // Cyan
    selection: "#ec4899", // Pink
    special: "#64748b", // Slate
    help: "#84cc16", // Lime
  };

  // Scope icons for visual distinction
  const scopeIcons: Record<ShortcutScope, string> = {
    navigation: "fa-compass",
    action: "fa-bolt",
    editing: "fa-pen",
    playback: "fa-play",
    animation: "fa-film",
    view: "fa-eye",
    selection: "fa-object-group",
    special: "fa-star",
    help: "fa-question-circle",
  };

  const color = $derived(scopeColors[scope] || "#6366f1");
  const icon = $derived(scopeIcons[scope] || "fa-folder");
  const customizedCount = $derived(shortcuts.filter((s) => s.isCustomized).length);

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
</script>

<section class="scope-section" style="--scope-color: {color}">
  <button
    class="scope-header"
    class:expanded={isExpanded}
    onclick={toggleExpanded}
    type="button"
    aria-expanded={isExpanded}
  >
    <div class="scope-icon">
      <i class="fas {icon}"></i>
    </div>
    <span class="scope-label">{label}</span>
    <div class="scope-badges">
      {#if customizedCount > 0}
        <span class="customized-count">{customizedCount} custom</span>
      {/if}
      <span class="shortcut-count">{shortcuts.length}</span>
    </div>
    <i class="fas fa-chevron-down expand-icon"></i>
  </button>

  {#if isExpanded}
    <div class="scope-content" transition:slide={{ duration: 200 }}>
      {#each shortcuts as item (item.shortcut.id)}
        <ShortcutListItem
          {item}
          onEdit={onEditShortcut}
          onReset={onResetShortcut}
        />
      {/each}
    </div>
  {/if}
</section>

<style>
  .scope-section {
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .scope-header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--scope-color) 8%, transparent) 0%,
      color-mix(in srgb, var(--scope-color) 4%, transparent) 100%
    );
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    cursor: pointer;
    text-align: left;
    transition: background 150ms ease;
  }

  .scope-header:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--scope-color) 12%, transparent) 0%,
      color-mix(in srgb, var(--scope-color) 6%, transparent) 100%
    );
  }

  .scope-header.expanded {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }

  .scope-header:not(.expanded) {
    border-bottom: none;
    border-radius: 12px;
  }

  .scope-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: color-mix(in srgb, var(--scope-color) 20%, transparent);
    border-radius: 8px;
    color: var(--scope-color);
    font-size: 14px;
  }

  .scope-label {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .scope-badges {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .shortcut-count {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
  }

  .customized-count {
    padding: 4px 8px;
    background: rgba(99, 102, 241, 0.15);
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(167, 139, 250, 1);
  }

  .expand-icon {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    transition: transform 200ms ease;
  }

  .scope-header.expanded .expand-icon {
    transform: rotate(180deg);
  }

  .scope-content {
    background: rgba(0, 0, 0, 0.1);
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .scope-header {
      padding: 12px;
    }

    .scope-icon {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }

    .scope-label {
      font-size: 13px;
    }
  }
</style>
