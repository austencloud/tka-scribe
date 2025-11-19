<!-- Section Button Component -->
<!-- Individual section/tab button within a module -->
<script lang="ts">
  import type { Section } from "../../domain/types";

  let { section, isActive, onClick } = $props<{
    section: Section;
    isActive: boolean;
    onClick: () => void;
  }>();
</script>

<button
  class="section-button"
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
  <span class="section-icon">{@html section.icon}</span>
  <span class="section-label">{section.label}</span>
  {#if isActive}
    <span class="active-indicator"></span>
  {/if}
</button>

<style>
  /* ============================================================================
     SECTION BUTTON
     ============================================================================ */
  .section-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    margin-bottom: 2px;
  }

  .section-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    transform: translateX(2px);
  }

  .section-button.active {
    color: rgba(255, 255, 255, 1);
    background: rgba(255, 255, 255, 0.08);
  }

  .section-button.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .section-icon {
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 20px;
    height: 20px;
  }

  /* Style icons with gradient colors */
  .section-icon :global(i) {
    background: var(--section-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.2));
  }

  .section-button:not(.active) .section-icon :global(i) {
    opacity: 0.7;
  }

  .section-button:hover .section-icon :global(i) {
    opacity: 1;
  }

  .section-button.active .section-icon :global(i) {
    opacity: 1;
    filter: drop-shadow(0 0 10px var(--section-color)) brightness(1.1);
  }

  .section-label {
    flex: 1;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: -0.005em;
  }

  .active-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--section-gradient);
    box-shadow: 0 0 8px var(--section-color);
    flex-shrink: 0;
  }

  /* Focus styles for keyboard navigation */
  .section-button:focus-visible {
    outline: 2px solid rgba(102, 126, 234, 0.6);
    outline-offset: 2px;
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-contrast: high) {
    .section-button.active {
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
