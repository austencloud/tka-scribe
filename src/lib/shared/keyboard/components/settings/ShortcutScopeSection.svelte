<!--
  ShortcutScopeSection.svelte

  Collapsible section for grouping shortcuts by scope.
  Features expand/collapse animation, colored header, and shortcut count.
-->
<script lang="ts">
  import { slide, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
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
    panel: "#14b8a6", // Teal
    focus: "#f97316", // Orange
    help: "#84cc16", // Lime
    "sequence-management": "#0ea5e9", // Sky
    animation: "#8b5cf6", // Violet
    workspace: "#22c55e", // Green
    playback: "#ef4444", // Red
    view: "#06b6d4", // Cyan
    selection: "#ec4899", // Pink
    special: "#64748b", // Slate
  };

  // Scope icons for visual distinction
  const scopeIcons: Record<ShortcutScope, string> = {
    navigation: "fa-compass",
    action: "fa-bolt",
    editing: "fa-pen",
    panel: "fa-window-restore",
    focus: "fa-crosshairs",
    help: "fa-question-circle",
    "sequence-management": "fa-list-ol",
    animation: "fa-film",
    workspace: "fa-th-large",
    playback: "fa-play",
    view: "fa-eye",
    selection: "fa-object-group",
    special: "fa-star",
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
      {#each shortcuts as item, index (item.shortcut.id)}
        <div
          class="shortcut-item-wrapper"
          in:fly={{ y: 8, duration: 200, delay: index * 30, easing: cubicOut }}
        >
          <ShortcutListItem
            {item}
            onEdit={onEditShortcut}
            onReset={onResetShortcut}
          />
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .scope-section {
    border-radius: 16px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.02);
    border: 1.5px solid rgba(255, 255, 255, 0.06);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .scope-section:hover {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .scope-header {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 16px 18px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--scope-color) 10%, transparent) 0%,
      color-mix(in srgb, var(--scope-color) 4%, transparent) 100%
    );
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .scope-header:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--scope-color) 15%, transparent) 0%,
      color-mix(in srgb, var(--scope-color) 7%, transparent) 100%
    );
  }

  .scope-header.expanded {
    border-bottom-color: rgba(255, 255, 255, 0.06);
  }

  .scope-header:not(.expanded) {
    border-bottom: none;
    border-radius: 14px;
  }

  .scope-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--scope-color) 25%, transparent) 0%,
      color-mix(in srgb, var(--scope-color) 15%, transparent) 100%
    );
    border: 1px solid color-mix(in srgb, var(--scope-color) 30%, transparent);
    border-radius: 10px;
    color: var(--scope-color);
    font-size: 15px;
    transition: all 0.2s ease;
    box-shadow:
      0 2px 6px color-mix(in srgb, var(--scope-color) 20%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .scope-header:hover .scope-icon {
    transform: scale(1.05);
    box-shadow:
      0 4px 12px color-mix(in srgb, var(--scope-color) 30%, transparent),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .scope-label {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: -0.01em;
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
    min-width: 26px;
    height: 26px;
    padding: 0 9px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.55);
    font-variant-numeric: tabular-nums;
  }

  .customized-count {
    padding: 5px 10px;
    background: rgba(139, 92, 246, 0.12);
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 8px;
    font-size: 10px;
    font-weight: 700;
    color: rgba(167, 139, 250, 1);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .expand-icon {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.35);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .scope-header:hover .expand-icon {
    color: rgba(255, 255, 255, 0.5);
  }

  .scope-header.expanded .expand-icon {
    transform: rotate(180deg);
  }

  .scope-content {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.12) 0%,
      rgba(0, 0, 0, 0.06) 100%
    );
  }

  .shortcut-item-wrapper {
    /* Container for animation */
    display: contents;
  }

  /* Focus states */
  .scope-header:focus-visible {
    outline: 2px solid var(--scope-color);
    outline-offset: -2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .scope-section,
    .scope-header,
    .scope-icon,
    .expand-icon {
      transition: none;
    }

    .scope-header:hover .scope-icon {
      transform: none;
    }

    .shortcut-item-wrapper {
      animation: none !important;
      transition: none !important;
    }
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .scope-section {
      border-radius: 14px;
    }

    .scope-header {
      padding: 14px 14px;
      gap: 12px;
    }

    .scope-icon {
      width: 32px;
      height: 32px;
      font-size: 13px;
      border-radius: 8px;
    }

    .scope-label {
      font-size: 13px;
    }

    .shortcut-count {
      min-width: 24px;
      height: 24px;
      font-size: 11px;
    }

    .customized-count {
      padding: 4px 8px;
      font-size: 9px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .scope-section {
      border-width: 2px;
    }

    .scope-header:focus-visible {
      outline-width: 3px;
    }
  }
</style>
