<!-- TabOverflowSelector - 2026-ready tab overflow handler using Popover API -->
<script lang="ts">
  import type { Section } from "$lib/shared/navigation/domain/types";
  import { onMount } from "svelte";

  let {
    sections = [],
    currentSection = "",
    onSectionChange = () => {},
    moduleColor = "#667eea",
  } = $props<{
    sections: Section[];
    currentSection: string;
    onSectionChange?: (sectionId: string) => void;
    moduleColor?: string;
  }>();

  let popoverElement: HTMLElement | null = null;
  let isOpen = $state(false);

  // Find current section
  let currentSectionData = $derived(
    sections.find((s: Section) => s.id === currentSection) || sections[0]
  );

  function handleSectionClick(section: Section) {
    if (!section.disabled) {
      onSectionChange(section.id);
      // Popover auto-closes via popovertarget, but close manually for fallback
      if (popoverElement && typeof popoverElement.hidePopover === "function") {
        try {
          popoverElement.hidePopover();
        } catch {
          // Ignore errors - popover might already be closing
        }
      }
    }
  }

  // Set up toggle event listener for chevron rotation
  onMount(() => {
    const element = popoverElement;
    if (!element) return;

    const handleToggle = (event: Event) => {
      const toggleEvent = event as ToggleEvent;
      isOpen = toggleEvent.newState === "open";
    };

    element.addEventListener("toggle", handleToggle);
    return () => {
      element.removeEventListener("toggle", handleToggle);
    };
  });
</script>

<!-- Compact Trigger Button - popovertarget handles clicks automatically -->
<button
  class="tab-picker-trigger"
  popovertarget="tab-overflow-popover"
  aria-label="Select tab"
  aria-expanded={isOpen}
  style="--module-color: {moduleColor}"
>
  <span class="current-tab-icon">{@html currentSectionData?.icon || ""}</span>
  <span class="current-tab-label">{currentSectionData?.label || "Select"}</span>
  <i class="fas fa-chevron-down chevron" class:rotated={isOpen}></i>
</button>

<!-- Popover with all tabs -->
<div
  bind:this={popoverElement}
  id="tab-overflow-popover"
  popover="auto"
  class="tab-overflow-popover"
  style="--module-color: {moduleColor}"
>
  <div class="tab-grid">
    {#each sections as section}
      <button
        class="tab-option"
        class:active={currentSection === section.id}
        class:disabled={section.disabled}
        disabled={section.disabled}
        onclick={() => handleSectionClick(section)}
        style="--section-color: {section.color ||
          moduleColor}; --section-gradient: {section.gradient ||
          section.color ||
          moduleColor}"
      >
        <span class="tab-icon">{@html section.icon}</span>
        <span class="tab-label">{section.label}</span>
        {#if currentSection === section.id}
          <i class="fas fa-check check-mark"></i>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  /* ============================================================================
     TRIGGER BUTTON - Shows current tab, opens popover
     ============================================================================ */
  .tab-picker-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    min-height: 48px;
    flex: 1 1 0%;
    max-width: 240px;

    /* Anchor for popover positioning */
    anchor-name: --tab-picker;

    /* 2026 design: Solid surface with subtle module tint */
    background: color-mix(
      in srgb,
      var(--module-color, #667eea) 12%,
      hsl(240 10% 12%)
    );
    border: 1px solid
      color-mix(
        in srgb,
        var(--module-color, #667eea) 30%,
        hsl(0 0% 100% / 0.15)
      );
    border-radius: 12px;

    color: hsl(0 0% 100% / 0.9);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;

    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease;
  }

  .tab-picker-trigger:hover {
    background: color-mix(
      in srgb,
      var(--module-color, #667eea) 18%,
      hsl(240 10% 14%)
    );
    border-color: color-mix(
      in srgb,
      var(--module-color, #667eea) 40%,
      hsl(0 0% 100% / 0.2)
    );
  }

  .tab-picker-trigger:active {
    transform: scale(0.98);
  }

  .current-tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .current-tab-icon :global(i) {
    background: var(--module-color, #667eea);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .current-tab-label {
    flex: 1 1 auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  .chevron {
    font-size: 11px;
    opacity: 0.6;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .chevron.rotated {
    transform: rotate(180deg);
  }

  /* ============================================================================
     POPOVER - Native Popover API with 2026 styling
     ============================================================================ */
  .tab-overflow-popover {
    /* Anchor positioning - positions directly above trigger button */
    position-anchor: --tab-picker;
    position: fixed;

    /* Position using anchor (with fallback) */
    bottom: anchor(top);
    left: anchor(center);
    translate: -50% -12px; /* Center horizontally, add gap above button */
    margin: 0;

    /* Size constraints */
    width: min(calc(100vw - 24px), 400px);
    max-height: 50vh;
    overflow-y: auto;

    /* 2026 design: Elevated glass morphism */
    background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--module-color, #667eea) 10%, hsl(240 8% 14%)) 0%,
      color-mix(in srgb, var(--module-color, #667eea) 5%, hsl(240 6% 10%)) 100%
    );
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);

    border: 1px solid
      color-mix(in srgb, var(--module-color, #667eea) 25%, hsl(0 0% 100% / 0.1));
    border-radius: 16px;
    padding: 12px;

    /* Shadows for depth */
    box-shadow:
      0 8px 32px hsl(0 0% 0% / 0.4),
      0 2px 8px hsl(0 0% 0% / 0.2),
      inset 0 1px 0 0 hsl(0 0% 100% / 0.08);

    /* Smooth transitions using @starting-style */
    opacity: 1;
    scale: 1;
    transition:
      opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
      scale 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      overlay 0.25s cubic-bezier(0.4, 0, 0.2, 1) allow-discrete,
      display 0.25s cubic-bezier(0.4, 0, 0.2, 1) allow-discrete;
  }

  /* Starting style for smooth open animation - @starting-style is valid CSS */
  @starting-style {
    .tab-overflow-popover:popover-open {
      opacity: 0;
      scale: 0.95;
    }
  }

  /* Closing animation */
  .tab-overflow-popover:not(:popover-open) {
    opacity: 0;
    scale: 0.95;
  }

  /* Fallback for browsers without anchor positioning */
  @supports not (anchor-name: --tab-picker) {
    .tab-overflow-popover {
      /* Position above bottom nav (fallback) */
      bottom: calc(56px + 12px); /* Nav height + gap */
      left: 50%;
      translate: -50% 0;
    }
  }

  /* ============================================================================
     TAB GRID - Responsive grid layout
     ============================================================================ */
  .tab-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }

  /* Single column for narrow popovers */
  @container (max-width: 300px) {
    .tab-grid {
      grid-template-columns: 1fr;
    }
  }

  /* ============================================================================
     TAB OPTIONS - Individual tab buttons in popover
     ============================================================================ */
  .tab-option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 16px 12px;
    min-height: 80px;

    background: color-mix(
      in srgb,
      var(--section-color, #667eea) 8%,
      hsl(240 8% 10%)
    );
    border: 1px solid
      color-mix(
        in srgb,
        var(--section-color, #667eea) 20%,
        hsl(0 0% 100% / 0.08)
      );
    border-radius: 12px;

    color: hsl(0 0% 100% / 0.85);
    font-size: 12px;
    font-weight: 500;

    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;

    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.15s ease;
  }

  .tab-option:hover:not(:disabled) {
    background: color-mix(
      in srgb,
      var(--section-color, #667eea) 15%,
      hsl(240 8% 12%)
    );
    border-color: color-mix(
      in srgb,
      var(--section-color, #667eea) 30%,
      hsl(0 0% 100% / 0.15)
    );
  }

  .tab-option:active:not(:disabled) {
    transform: scale(0.97);
  }

  .tab-option.active {
    background: color-mix(
      in srgb,
      var(--section-color, #667eea) 20%,
      hsl(240 8% 14%)
    );
    border-color: var(--section-color, #667eea);
    box-shadow:
      0 0 0 2px
        color-mix(in srgb, var(--section-color, #667eea) 25%, transparent),
      inset 0 1px 0 0 hsl(0 0% 100% / 0.1);
  }

  .tab-option.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .tab-icon :global(i) {
    background: var(--section-gradient, var(--section-color, #667eea));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tab-label {
    text-align: center;
    line-height: 1.3;
  }

  .check-mark {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 12px;
    color: var(--section-color, #667eea);
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .tab-picker-trigger {
      background: hsl(0 0% 8%);
      border: 2px solid white;
    }

    .tab-overflow-popover {
      background: hsl(0 0% 5%);
      border: 2px solid white;
    }

    .tab-option {
      background: hsl(0 0% 8%);
      border: 1px solid white;
    }

    .tab-option.active {
      background: hsl(0 0% 15%);
      border: 2px solid white;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .tab-picker-trigger,
    .tab-overflow-popover,
    .tab-option,
    .chevron {
      transition: none;
    }

    /* @starting-style is valid CSS for entry animations */
    @starting-style {
      .tab-overflow-popover:popover-open {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  }

  /* Focus visible for keyboard navigation */
  .tab-picker-trigger:focus-visible {
    outline: 2px solid var(--module-color, #667eea);
    outline-offset: 2px;
  }

  .tab-option:focus-visible {
    outline: 2px solid var(--section-color, #667eea);
    outline-offset: 2px;
  }
</style>
