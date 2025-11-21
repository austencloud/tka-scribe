<!-- Collapsed Module Button Component -->
<!-- Icon-only module button for collapsed sidebar activity bar (VS Code style) -->
<script lang="ts">
  import type { ModuleDefinition } from "../../domain/types";

  let {
    module,
    isActive,
    onClick,
    moduleColor,
    hasTabs = false,
  } = $props<{
    module: ModuleDefinition;
    isActive: boolean;
    onClick: () => void;
    moduleColor?: string;
    hasTabs?: boolean;
  }>();

  const isDisabled = $derived(module.disabled ?? false);
</script>

<button
  class="collapsed-module-button"
  class:active={isActive}
  class:disabled={isDisabled}
  class:has-tabs={hasTabs}
  onclick={onClick}
  disabled={isDisabled}
  aria-label={module.label}
  aria-current={isActive ? "page" : undefined}
  style="--module-color: {moduleColor || '#a855f7'};"
>
  <!-- svelte-ignore svelte/no-at-html-tags -->
  <span class="module-icon">{@html module.icon}</span>
  <!-- Hover Label -->
  <span class="hover-label">{module.label}</span>
</button>

<style>
  /* ============================================================================
     COLLAPSED MODULE BUTTON - VS CODE ACTIVITY BAR STYLE
     ============================================================================ */
  .collapsed-module-button {
    width: 52px; /* Larger than tabs for visual hierarchy */
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    margin-bottom: 0; /* No margin - controlled by context group */
    /* Subtle border for differentiation */
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  }

  .collapsed-module-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  }

  .collapsed-module-button.active {
    color: rgba(255, 255, 255, 1);
    background: rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  }

  /* Ghost the button when tabs are showing - tabs become the focus */
  .collapsed-module-button.active.has-tabs {
    background: transparent;
    box-shadow: none;
  }

  .collapsed-module-button.active.has-tabs .module-icon {
    opacity: 0.3; /* Ghosted icon */
  }

  .collapsed-module-button.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .module-icon {
    font-size: 22px; /* Slightly larger icon */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .collapsed-module-button:hover:not(.disabled) .module-icon {
    transform: scale(1.08);
  }

  .collapsed-module-button.active .module-icon {
    transform: scale(1.05);
  }

  /* Hover Label - slides in from right */
  .hover-label {
    position: absolute;
    left: 60px;
    padding: 6px 12px;
    background: rgba(20, 20, 30, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    z-index: 200;
  }

  .collapsed-module-button:hover .hover-label {
    opacity: 1;
    transform: translateX(0);
  }

  /* Focus styles for keyboard navigation */
  .collapsed-module-button:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.6);
    outline-offset: 2px;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-contrast: high) {
    .collapsed-module-button.active {
      background: rgba(255, 255, 255, 0.25);
      outline: 2px solid white;
    }
  }

  /* ============================================================================
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
