<!--
  ShortcutListItem.svelte

  Individual shortcut row for the keyboard settings tab.
  Shows label, description, context badge, key combo, and edit button.
  Navigation shortcuts display with their module's accent color.
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

  // Module colors from MODULE_DEFINITIONS
  const MODULE_COLORS: Record<string, string> = {
    dashboard: "#10b981",
    create: "#f59e0b",
    discover: "#a855f7",
    learn: "#3b82f6",
    compose: "#ec4899",
    train: "#ef4444",
    library: "#0891b2",
    feedback: "#14b8a6",
    "ml-training": "#8b5cf6",
    admin: "#ffd700",
    settings: "#64748b",
  };

  // Detect if this is a module navigation shortcut and get its color
  const moduleColor = $derived(() => {
    const id = item.shortcut.id;
    // Pattern: global.switch-to-{moduleId}
    if (id.startsWith("global.switch-to-")) {
      const moduleId = id.replace("global.switch-to-", "");
      return MODULE_COLORS[moduleId] || null;
    }
    return null;
  });

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

<div
  class="shortcut-item"
  class:customized={item.isCustomized}
  class:disabled={item.isDisabled}
  class:has-module-color={moduleColor() !== null}
  style:--module-color={moduleColor()}
  onclick={handleEdit}
  onkeydown={(e) => e.key === "Enter" && handleEdit()}
  tabindex="0"
  role="button"
>
  <!-- Module color accent bar for navigation shortcuts -->
  {#if moduleColor()}
    <div class="module-accent"></div>
  {/if}

  <div class="shortcut-info">
    <div class="shortcut-header">
      <span class="shortcut-label" class:module-colored={moduleColor() !== null}>
        {item.shortcut.label}
      </span>
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
</div>

<style>
  .shortcut-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .shortcut-item:last-child {
    border-bottom: none;
  }

  .shortcut-item:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .shortcut-item:active {
    background: rgba(255, 255, 255, 0.06);
  }

  /* Module color accent bar */
  .module-accent {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: var(--module-color);
    border-radius: 0 2px 2px 0;
    opacity: 0.8;
    transition: all 0.2s ease;
  }

  .shortcut-item.has-module-color {
    padding-left: 20px;
  }

  .shortcut-item.has-module-color:hover .module-accent {
    height: 80%;
    opacity: 1;
    box-shadow: 0 0 12px var(--module-color);
  }

  /* Customized state with violet accent */
  .shortcut-item.customized {
    background: linear-gradient(
      90deg,
      rgba(139, 92, 246, 0.06) 0%,
      rgba(139, 92, 246, 0.02) 100%
    );
  }

  .shortcut-item.customized:hover {
    background: linear-gradient(
      90deg,
      rgba(139, 92, 246, 0.1) 0%,
      rgba(139, 92, 246, 0.04) 100%
    );
  }

  .shortcut-item.disabled {
    opacity: 0.5;
  }

  .shortcut-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .shortcut-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .shortcut-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    transition: color 0.2s ease;
  }

  /* Module-colored label on hover */
  .shortcut-label.module-colored {
    color: rgba(255, 255, 255, 0.9);
  }

  .shortcut-item:hover .shortcut-label.module-colored {
    color: var(--module-color);
  }

  .customized-badge,
  .disabled-badge {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 3px 7px;
    border-radius: 6px;
  }

  .customized-badge {
    background: rgba(139, 92, 246, 0.15);
    color: rgba(167, 139, 250, 1);
    border: 1px solid rgba(139, 92, 246, 0.25);
  }

  .disabled-badge {
    background: rgba(239, 68, 68, 0.15);
    color: rgba(248, 113, 113, 1);
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .shortcut-description {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .shortcut-context {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .shortcut-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .key-combo-wrapper {
    transition: all 0.15s ease;
  }

  .key-combo-wrapper.muted {
    opacity: 0.35;
    filter: grayscale(1);
  }

  .reset-btn,
  .edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .reset-btn:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.35);
    color: rgba(248, 113, 113, 1);
    transform: scale(1.05);
  }

  .reset-btn:active {
    transform: scale(0.95);
  }

  .edit-btn {
    opacity: 0;
  }

  .shortcut-item:hover .edit-btn {
    opacity: 1;
  }

  .edit-btn:hover {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.35);
    color: rgba(167, 139, 250, 1);
    transform: scale(1.05);
  }

  .edit-btn:active {
    transform: scale(0.95);
  }

  /* Focus states */
  .shortcut-item:focus-visible {
    outline: 2px solid rgba(139, 92, 246, 0.5);
    outline-offset: -2px;
  }

  .reset-btn:focus-visible,
  .edit-btn:focus-visible {
    outline: 2px solid rgba(139, 92, 246, 0.5);
    outline-offset: 2px;
  }

  /* Mobile: Always show edit button */
  @media (max-width: 768px) {
    .shortcut-item {
      padding: 16px 14px;
    }

    .shortcut-item.has-module-color {
      padding-left: 22px;
    }

    .edit-btn {
      opacity: 1;
    }

    .reset-btn,
    .edit-btn {
      width: 44px;
      height: 44px;
      font-size: 12px;
    }

    .shortcut-label {
      font-size: 14px;
    }

    .shortcut-description {
      font-size: 12px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .shortcut-item,
    .module-accent,
    .reset-btn,
    .edit-btn {
      transition: none;
    }

    .reset-btn:hover,
    .edit-btn:hover {
      transform: none;
    }
  }
</style>
