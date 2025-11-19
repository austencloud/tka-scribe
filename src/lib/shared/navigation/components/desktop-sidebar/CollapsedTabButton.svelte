<!-- Collapsed Tab Button Component -->
<!-- Icon-only tab button for collapsed sidebar (VS Code style) -->
<script lang="ts">
  import type { Section } from "../../domain/types";

  let { section, isActive, onClick } = $props<{
    section: Section;
    isActive: boolean;
    onClick: () => void;
  }>();
</script>

<button
  class="collapsed-tab-button"
  class:active={isActive}
  class:disabled={section.disabled}
  onclick={onClick}
  disabled={section.disabled}
  aria-label={section.label}
  style="--section-color: {section.color ||
    'var(--muted-foreground)'}; --section-gradient: {section.gradient ||
    section.color ||
    'var(--muted-foreground)'};"
>
  <span class="tab-icon">{@html section.icon}</span>
  {#if isActive}
    <span class="active-bar"></span>
  {/if}
  <!-- Hover Label -->
  <span class="hover-label">{section.label}</span>
</button>

<style>
  /* ============================================================================
     COLLAPSED TAB BUTTON - VS CODE STYLE
     ============================================================================ */
  .collapsed-tab-button {
    width: 44px; /* Slightly smaller to emphasize nesting */
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 7px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    margin-bottom: 3px;
  }

  .collapsed-tab-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
  }

  .collapsed-tab-button.active {
    color: rgba(255, 255, 255, 1);
    background: rgba(255, 255, 255, 0.1);
  }

  .collapsed-tab-button.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .tab-icon {
    font-size: 18px; /* Slightly smaller for nested appearance */
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  /* Style icons with gradient colors */
  .tab-icon :global(i) {
    background: var(--section-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.2));
  }

  .collapsed-tab-button:not(.active) .tab-icon :global(i) {
    opacity: 0.7;
  }

  .collapsed-tab-button:hover .tab-icon :global(i) {
    opacity: 1;
  }

  .collapsed-tab-button.active .tab-icon :global(i) {
    opacity: 1;
    filter: drop-shadow(0 0 12px var(--section-color)) brightness(1.15);
  }

  /* Active indicator bar - VS Code style */
  .active-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 60%;
    background: var(--section-gradient);
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 8px var(--section-color);
  }

  /* Hover Label - slides in from right */
  .hover-label {
    position: absolute;
    left: 56px;
    padding: 5px 10px;
    background: rgba(20, 20, 30, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 5px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 200;
  }

  .collapsed-tab-button:hover .hover-label {
    opacity: 1;
    transform: translateX(0);
  }

  /* Focus styles for keyboard navigation */
  .collapsed-tab-button:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.6);
    outline-offset: 2px;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-contrast: high) {
    .collapsed-tab-button.active {
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
