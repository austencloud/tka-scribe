<!--
  TransformDescription.svelte

  Individual transform card with:
  - Desktop: Icon + name + description in expandable card (matches SequenceActions style)
  - Mobile: Horizontal layout with toggle to expand, show description on demand
-->
<script lang="ts">
  import type { TransformHelpItem } from "../../domain/transforms/transform-help-content";

  interface Props {
    item: TransformHelpItem;
    expanded?: boolean;
    onToggle?: () => void;
    onApply?: () => void;
    onRotate?: (direction: "cw" | "ccw") => void;
  }

  let {
    item,
    expanded = false,
    onToggle,
    onApply,
    onRotate,
  }: Props = $props();
</script>

<!-- Mobile: Horizontal layout with toggle, Desktop: Vertical card (clickable) -->
<div
  class="transform-card"
  class:expanded
  class:clickable={item.id !== "rotate"}
  onclick={() => {
    if (item.id === "rotate") return;
    onApply?.();
  }}
  role={item.id !== "rotate" ? "button" : undefined}
  tabindex={item.id !== "rotate" ? 0 : undefined}
  onkeydown={(e) => {
    if (item.id !== "rotate" && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onApply?.();
    }
  }}
  style="--color: {item.color}"
>
  <!-- Mobile: Horizontal header with toggle -->
  <div class="card-header">
    <div class="transform-info">
      <div class="icon-wrapper">
        <i class="fas {item.icon}"></i>
      </div>
      <div class="text-content">
        <h4>{item.name}</h4>
        <p class="short-desc">{item.shortDesc}</p>
      </div>
    </div>

    <!-- Mobile toggle button -->
    <button
      class="mobile-toggle"
      onclick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
      aria-label={expanded ? `Collapse ${item.name}` : `Expand ${item.name}`}
      aria-expanded={expanded}
      type="button"
    >
      <i class="fas {expanded ? 'fa-chevron-up' : 'fa-chevron-down'}"></i>
    </button>
  </div>

  <!-- Mobile expanded: description + actions -->
  <div class="card-content">
    <p class="full-desc">{item.fullDesc}</p>

    {#if item.id === "rotate"}
      <div class="action-buttons">
        <button
          class="rotate-btn"
          onclick={(e) => {
            e.stopPropagation();
            onRotate?.("ccw");
          }}
          aria-label="Rotate counter-clockwise"
          type="button"
        >
          <i class="fas fa-rotate-left"></i>
        </button>
        <button
          class="rotate-btn"
          onclick={(e) => {
            e.stopPropagation();
            onRotate?.("cw");
          }}
          aria-label="Rotate clockwise"
          type="button"
        >
          <i class="fas fa-rotate-right"></i>
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  /* ===== MOBILE: Horizontal Layout ===== */
  .transform-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.15s ease;
  }

  .transform-card.clickable {
    cursor: pointer;
  }

  .transform-card.clickable:active {
    transform: scale(0.97);
  }

  .transform-card:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  /* Card header - horizontal on mobile */
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    gap: 12px;
  }

  .transform-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .icon-wrapper {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 18px;
  }

  .text-content {
    min-width: 0;
  }

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .short-desc {
    margin: 2px 0 0 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Mobile toggle button */
  .mobile-toggle {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .mobile-toggle:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.8);
  }

  .mobile-toggle:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  /* Content: hidden by default on mobile */
  .card-content {
    padding: 0 12px 12px 12px;
    display: none;
  }

  /* Mobile expanded state */
  .transform-card.expanded .card-content {
    display: block;
  }

  .full-desc {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.5;
  }

  /* Action buttons */
  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .rotate-btn {
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .rotate-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .rotate-btn:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
  }

  .rotate-btn:active {
    transform: scale(0.97);
  }

  /* ===== DESKTOP: Vertical Button Layout (SequenceActions style) ===== */
  @media (min-width: 768px) {
    .transform-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px 12px;
      border-radius: 14px;
      background: linear-gradient(135deg, color-mix(in srgb, var(--color) 20%, transparent) 0%, color-mix(in srgb, var(--color) 8%, transparent) 100%);
      border: 1px solid color-mix(in srgb, var(--color) 35%, transparent);
      text-align: center;
      min-height: 160px;
    }

    .transform-card.clickable:hover {
      background: linear-gradient(135deg, color-mix(in srgb, var(--color) 30%, transparent) 0%, color-mix(in srgb, var(--color) 15%, transparent) 100%);
      border-color: color-mix(in srgb, var(--color) 50%, transparent);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--color) 25%, transparent);
    }

    /* Header - centered vertically */
    .card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0;
      gap: 8px;
      width: 100%;
    }

    .transform-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex: none;
      width: 100%;
    }

    .icon-wrapper {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--color);
      font-size: 20px;
      flex-shrink: 0;
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
    }

    .short-desc {
      margin: 0;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.65);
    }

    /* Hide mobile toggle on desktop */
    .mobile-toggle {
      display: none;
    }

    /* Show content on desktop (description + rotate buttons) */
    .card-content {
      display: block;
      padding: 0;
      width: 100%;
    }

    .full-desc {
      display: none;
    }

    /* Rotate buttons shown horizontally on desktop */
    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      width: 100%;
    }

    .rotate-btn {
      padding: 6px 10px;
      background: color-mix(in srgb, var(--color) 30%, transparent);
      border: 1px solid color-mix(in srgb, var(--color) 50%, transparent);
      border-radius: 6px;
      color: var(--color);
      font-size: 12px;
      font-weight: 600;
    }

    .rotate-btn:hover {
      background: color-mix(in srgb, var(--color) 40%, transparent);
      border-color: var(--color);
    }
  }
</style>
