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
  class="shortcut-card"
  class:customized={item.isCustomized}
  class:disabled={item.isDisabled}
  class:has-module-color={moduleColor() !== null}
  style:--module-color={moduleColor()}
  onclick={handleEdit}
  onkeydown={(e) => e.key === "Enter" && handleEdit()}
  tabindex="0"
  role="button"
>
  <!-- Key badge - prominent at top -->
  <div class="card-key-section">
    <div class="key-combo-wrapper" class:muted={item.isDisabled}>
      <KeyboardKeyDisplay parsed={item.effectiveBinding} />
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
  </div>

  <!-- Label and description -->
  <div class="card-info">
    <span class="shortcut-label" class:module-colored={moduleColor() !== null}>
      {item.shortcut.label}
    </span>
    {#if item.shortcut.description}
      <span class="shortcut-description">{item.shortcut.description}</span>
    {/if}
  </div>

  <!-- Footer with context and badges -->
  <div class="card-footer">
    <span class="shortcut-context"
      >{formatContext(item.shortcut.context ?? "global")}</span
    >
    <div class="card-badges">
      {#if item.isCustomized}
        <span class="customized-badge">Custom</span>
      {/if}
      {#if item.isDisabled}
        <span class="disabled-badge">Off</span>
      {/if}
    </div>
  </div>
</div>

<style>
  /* Compact card layout for bento grid */
  .shortcut-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    /* Subtle glass card */
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    /* Fill parent wrapper completely */
    width: 100%;
    height: 100%;
    min-height: 120px;
    box-sizing: border-box;
  }

  .shortcut-card:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  .shortcut-card:active {
    transform: translateY(0);
  }

  /* Module navigation - subtle colored glass */
  .shortcut-card.has-module-color {
    background: color-mix(
      in srgb,
      var(--module-color) 8%,
      rgba(255, 255, 255, 0.04)
    );
    border: 1px solid
      color-mix(in srgb, var(--module-color) 20%, rgba(255, 255, 255, 0.08));
    border-left: 2px solid var(--module-color);
  }

  .shortcut-card.has-module-color:hover {
    background: color-mix(
      in srgb,
      var(--module-color) 12%,
      rgba(255, 255, 255, 0.06)
    );
    border-color: color-mix(
      in srgb,
      var(--module-color) 30%,
      rgba(255, 255, 255, 0.12)
    );
    box-shadow: 0 4px 16px
      color-mix(in srgb, var(--module-color) 15%, rgba(0, 0, 0, 0.2));
  }

  .shortcut-card.customized {
    border-color: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 30%,
      transparent
    );
  }

  .shortcut-card.disabled {
    opacity: 0.5;
  }

  /* Key section - top of card */
  .card-key-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .key-combo-wrapper {
    transition: opacity 0.15s ease;
  }

  .key-combo-wrapper.muted {
    opacity: 0.35;
    filter: grayscale(1);
  }

  /* Module navigation key badges get module color tint */
  .shortcut-card.has-module-color
    .key-combo-wrapper
    :global(.kbd:not(.modifier)) {
    background: color-mix(
      in srgb,
      var(--module-color) 18%,
      rgba(255, 255, 255, 0.06)
    );
    border-color: color-mix(
      in srgb,
      var(--module-color) 30%,
      rgba(255, 255, 255, 0.1)
    );
    color: var(--module-color);
  }

  .reset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    /* Touch target padding */
    margin: -10px;
    padding: 10px;
  }

  .reset-btn:hover {
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    color: var(--semantic-error, #f87171);
  }

  /* Info section - grows to push footer down */
  .card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    flex: 1;
  }

  .shortcut-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    line-height: 1.3;
  }

  .shortcut-label.module-colored {
    color: var(--module-color);
  }

  .shortcut-description {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    line-height: 1.4;
    /* Allow up to 2 lines, then truncate */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Footer */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    margin-top: auto;
  }

  .shortcut-context {
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.35));
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 500;
  }

  .card-badges {
    display: flex;
    gap: 4px;
  }

  .customized-badge,
  .disabled-badge {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    padding: 3px 6px;
    border-radius: 4px;
  }

  .customized-badge {
    background: color-mix(
      in srgb,
      var(--theme-accent-strong, #8b5cf6) 20%,
      transparent
    );
    color: var(--theme-accent-strong, #a78bfa);
  }

  .disabled-badge {
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 20%,
      transparent
    );
    color: var(--semantic-error, #f87171);
  }

  /* Focus states */
  .shortcut-card:focus-visible {
    outline: 2px solid var(--theme-accent-strong, #8b5cf6);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .shortcut-card,
    .reset-btn {
      transition: none;
    }

    .shortcut-card:hover {
      transform: none;
    }
  }
</style>
