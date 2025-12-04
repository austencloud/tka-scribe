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
</button>

<style>
  /* ============================================================================
     SECTION BUTTON - Refined Minimal Design
     ============================================================================ */
  .section-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 10px 14px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    margin-bottom: 3px;
    overflow: hidden;
  }

  /* Shimmer effect layer - subtle */
  .section-button::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 40%,
      rgba(255, 255, 255, 0.04) 50%,
      transparent 60%
    );
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .section-button:hover:not(.disabled)::before {
    opacity: 1;
    animation: section-shimmer 1s ease-in-out;
  }

  @keyframes section-shimmer {
    0% { transform: translateX(-100%) translateY(-100%); }
    100% { transform: translateX(100%) translateY(100%); }
  }

  .section-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.9);
    transform: translateX(3px);
  }

  .section-button:active:not(.disabled) {
    transform: translateX(2px) scale(0.99);
    transition-duration: 0.1s;
  }

  .section-button.active {
    color: rgba(255, 255, 255, 1);
    background: color-mix(in srgb, var(--section-color) 12%, transparent);
    border-color: color-mix(in srgb, var(--section-color) 25%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, var(--section-color) 15%, transparent);
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
    width: 22px;
    height: 22px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* Style icons with gradient colors and glow */
  .section-icon :global(i) {
    background: var(--section-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
  }

  .section-button:not(.active) .section-icon :global(i) {
    opacity: 0.7;
  }

  .section-button:hover:not(.disabled) .section-icon {
    transform: scale(1.15);
  }

  .section-button:hover:not(.disabled) .section-icon :global(i) {
    opacity: 1;
    filter: drop-shadow(0 1px 4px color-mix(in srgb, var(--section-color) 30%, transparent));
  }

  .section-button.active .section-icon :global(i) {
    opacity: 1;
    filter:
      drop-shadow(0 0 6px color-mix(in srgb, var(--section-color) 40%, transparent))
      brightness(1.1);
  }

  .section-label {
    flex: 1;
    text-align: left;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.005em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }

  .section-button.active .section-label {
    font-weight: 600;
  }

  /* Focus styles for keyboard navigation */
  .section-button:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.7);
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
    .section-button,
    .section-button::before,
    .section-icon,
    .section-icon :global(i) {
      transition: none !important;
      animation: none !important;
    }
    .section-button:hover {
      transform: none;
    }
  }
</style>
