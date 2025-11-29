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
  .chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    min-height: 44px; /* iOS touch target */
    text-align: center;
  }

  .chip:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.9);
  }

  .chip:active:not(:disabled) {
    transform: scale(0.96);
    transition-duration: 0.1s;
  }

  /* Active (On) State - iOS System Green */
  .chip.active {
    background: rgba(52, 199, 89, 0.15);
    border-color: rgba(52, 199, 89, 0.5);
    color: #34c759;
  }

  .chip.active:hover:not(:disabled) {
    background: rgba(52, 199, 89, 0.2);
    border-color: rgba(52, 199, 89, 0.6);
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
    outline: 2px solid rgba(52, 199, 89, 0.5);
    outline-offset: 2px;
  }

  /* Compact mode when container height is limited */
  @container settings-content (max-height: 550px) {
    .chip {
      padding: 8px 6px;
      min-height: 40px;
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
  @container settings-content (max-height: 480px) {
    .chip {
      padding: 6px 4px;
      min-height: 36px;
      border-radius: 8px;
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
  }

  @media (prefers-contrast: high) {
    .chip {
      border-width: 2px;
    }

    .chip.active {
      border-color: #34c759;
    }
  }
</style>
