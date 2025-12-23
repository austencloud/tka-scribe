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
    navigation: "var(--theme-accent, #6366f1)", // Indigo
    action: "#10b981", // Emerald
    editing: "#f59e0b", // Amber
    panel: "#14b8a6", // Teal
    focus: "#f97316", // Orange
    help: "#84cc16", // Lime
    "sequence-management": "#0ea5e9", // Sky
    animation: "var(--theme-accent-strong, #8b5cf6)", // Violet
    workspace: "#22c55e", // Green
    playback: "#ef4444", // Red
    view: "#06b6d4", // Cyan
    selection: "#ec4899", // Pink
    special: "#64748b", // Slate
    admin: "#fbbf24", // Amber/Gold (admin crown color)
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
    admin: "fa-crown", // Admin crown icon
  };

  const color = $derived(scopeColors[scope] || "#6366f1");
  const icon = $derived(scopeIcons[scope] || "fa-folder");
  const customizedCount = $derived(
    shortcuts.filter((s) => s.isCustomized).length
  );

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
      <div class="shortcuts-grid">
        {#each shortcuts as item, index (item.shortcut.id)}
          <div
            class="shortcut-item-wrapper"
            in:fly={{
              y: 8,
              duration: 200,
              delay: Math.min(index * 20, 200),
              easing: cubicOut,
            }}
          >
            <ShortcutListItem
              {item}
              onEdit={onEditShortcut}
              onReset={onResetShortcut}
            />
          </div>
        {/each}
      </div>
    </div>
  {/if}
</section>

<style>
  .scope-section {
    border-radius: 20px;
    overflow: hidden;
    /* Dark glass - theme shows through blurred */
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.2s ease;
  }

  .scope-section:hover {
    border-color: rgba(255, 255, 255, 0.15);
  }

  .scope-header {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: var(--min-touch-target); /* Touch target */
    padding: 14px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    text-align: left;
    transition: background 0.15s ease;
  }

  .scope-header:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .scope-header.expanded {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  .scope-header:not(.expanded) {
    border-bottom: none;
    border-radius: 14px;
  }

  .scope-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: color-mix(in srgb, var(--scope-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--scope-color) 35%, transparent);
    border-radius: 8px;
    color: var(--scope-color);
    font-size: 14px;
    transition: all 0.15s ease;
    box-shadow: 0 0 8px color-mix(in srgb, var(--scope-color) 15%, transparent);
  }

  .scope-header:hover .scope-icon {
    background: color-mix(in srgb, var(--scope-color) 28%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--scope-color) 25%, transparent);
  }

  .scope-label {
    flex: 1;
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
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
    padding: 0 8px;
    /* Subtle glass with scope color tint */
    background: color-mix(
      in srgb,
      var(--scope-color) 12%,
      rgba(255, 255, 255, 0.08)
    );
    border: 1px solid
      color-mix(in srgb, var(--scope-color) 25%, rgba(255, 255, 255, 0.1));
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--scope-color);
    font-variant-numeric: tabular-nums;
  }

  .customized-count {
    padding: 5px 10px;
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 12%,
      transparent
    );
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--theme-accent-strong, #a78bfa);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .expand-icon {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.35));
    transition: transform 0.2s ease;
  }

  .scope-header:hover .expand-icon {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .scope-header.expanded .expand-icon {
    transform: rotate(180deg);
  }

  .scope-content {
    padding: 12px;
  }

  /* Bento grid for shortcuts - consistent card sizes */
  .shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 8px;
    /* Ensure all items in a row stretch to same height */
    align-items: stretch;
  }

  .shortcut-item-wrapper {
    /* Fill grid cell completely */
    display: flex;
    min-width: 0;
    height: 100%;
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
      font-size: 11px;
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
