<!--
  ChipRow.svelte - Full Chip Toggle Component

  The entire element is a chip that toggles on/off when clicked.
  Uses filled style for "on" state and outlined style for "off" state.
  Much cleaner and more intuitive than having a separate toggle button.
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
  class="chip-row"
  class:active={checked}
  class:disabled
  {disabled}
  onclick={onChange}
  aria-label={ariaLabel || `Toggle ${label} visibility`}
  aria-pressed={checked}
>
  <span class="chip-content">
    <span class="chip-label">{label}</span>
    {#if badgeText}
      <span class="disabled-badge">{badgeText}</span>
    {/if}
  </span>
</button>

<style>
  /* Full Chip Button */
  .chip-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: clamp(12px, 3cqi, 16px) clamp(16px, 4cqi, 20px);
    margin-bottom: clamp(6px, 1.5cqi, 8px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(18px, 4cqi, 24px);
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(14px, 3cqi, 16px);
    font-weight: 500;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
    letter-spacing: -0.08px;
    text-align: left;
    min-height: 48px; /* iOS minimum touch target */
  }

  .chip-row:last-child {
    margin-bottom: 0;
  }

  /* Hover State */
  .chip-row:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Active Press */
  .chip-row:active:not(:disabled) {
    transform: scale(0.98);
    transition-duration: 0.1s;
  }

  /* Active (On) State - iOS System Green */
  .chip-row.active {
    background: rgba(52, 199, 89, 0.15); /* iOS green with transparency */
    border-color: rgba(52, 199, 89, 0.5);
    color: #34c759; /* iOS system green */
  }

  .chip-row.active:hover:not(:disabled) {
    background: rgba(52, 199, 89, 0.2);
    border-color: rgba(52, 199, 89, 0.6);
    color: #30d158; /* iOS green lighter variant */
  }

  /* Disabled State */
  .chip-row:disabled,
  .chip-row.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  /* Content Container */
  .chip-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .chip-label {
    font-size: clamp(14px, 3cqi, 16px);
    font-weight: 500;
    letter-spacing: -0.08px;
    line-height: 1.38;
  }

  .disabled-badge {
    font-size: clamp(11px, 2cqi, 13px);
    font-weight: 400;
    letter-spacing: -0.06px;
    line-height: 1.3;
    color: rgba(255, 193, 7, 0.9);
  }

  /* Focus State */
  .chip-row:focus-visible {
    outline: 2px solid rgba(52, 199, 89, 0.5);
    outline-offset: 2px;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .chip-row {
      transition: none;
    }

    .chip-row:hover {
      transform: none;
    }
  }

  /* High contrast */
  @media (prefers-contrast: high) {
    .chip-row {
      border-width: 2px;
    }

    .chip-row.active {
      border-width: 2px;
      border-color: #34c759;
    }
  }
</style>
