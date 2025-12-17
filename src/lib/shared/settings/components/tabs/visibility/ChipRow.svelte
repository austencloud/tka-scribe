<!--
  ChipRow.svelte - Compact Chip Toggle Component

  Designed for use in a CSS Grid layout. The entire chip toggles on/off when clicked.
  Uses filled style for "on" state and outlined style for "off" state.
-->
<script lang="ts">
  interface Props {
    label: string;
    checked: boolean;
    disabled?: boolean;
    badgeText?: string | undefined;
    onChange: () => void;
    ariaLabel?: string;
  }

  let {
    label,
    checked,
    disabled = false,
    badgeText,
    onChange,
    ariaLabel,
  }: Props = $props();
</script>

<button
  type="button"
  class="chip"
  class:active={checked}
  class:disabled
  {disabled}
  onclick={onChange}
  aria-label={ariaLabel || `Toggle ${label} visibility`}
  aria-pressed={checked}
>
  <span class="chip-label">{label}</span>
  {#if badgeText}
    <span class="badge">{badgeText}</span>
  {/if}
</button>

<style>
  /* Bento Box Glass Card Style */
  .chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 12px 8px;
    /* Bento box frosted glass background */
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    /* Smooth Bento box transition */
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 54px; /* Touch target + Bento spacing */
    text-align: center;
    /* Subtle inset glow */
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .chip:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.15));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    /* Subtle lift effect */
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .chip:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
    transition-duration: 0.1s;
  }

  /* Active (On) State - Theme Accent */
  .chip.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 15%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 40%,
      transparent
    );
    color: var(--theme-accent, #60a5fa);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, #3b82f6) 20%, transparent);
  }

  .chip.active:hover:not(:disabled) {
    background: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 20%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #3b82f6) 50%,
      transparent
    );
    color: var(--theme-accent, #93c5fd);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, #3b82f6) 30%, transparent),
      0 4px 12px
        color-mix(in srgb, var(--theme-accent, #3b82f6) 20%, transparent);
  }

  /* Disabled State */
  .chip:disabled,
  .chip.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .chip-label {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.2;
    letter-spacing: -0.08px;
  }

  .badge {
    font-size: 9px;
    font-weight: 400;
    color: rgba(255, 193, 7, 0.9);
    line-height: 1;
  }

  /* Focus State */
  .chip:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent, #3b82f6) 50%, transparent);
    outline-offset: 2px;
  }

  /* Compact mode when container height is limited */
  @container settings-panel-body (max-height: 552px) {
    .chip {
      padding: 10px 6px;
      min-height: var(--min-touch-target);
      border-radius: 10px;
    }

    .chip-label {
      font-size: 12px;
    }

    .badge {
      font-size: 8px;
    }
  }

  /* Ultra-compact mode */
  @container settings-panel-body (max-height: 480px) {
    .chip {
      padding: 8px 4px;
      min-height: var(--min-touch-target);
      border-radius: 10px;
      gap: 1px;
    }

    .chip-label {
      font-size: 11px;
    }

    .badge {
      font-size: 7px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .chip {
      transition: none;
    }

    .chip:hover:not(:disabled) {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .chip {
      border-width: 2px;
    }

    .chip.active {
      border-color: var(--theme-accent, rgba(59, 130, 246, 0.8));
    }
  }
</style>
