<!--
  ToggleRow.svelte - Reusable Toggle Switch Component

  A self-contained toggle row with label, optional badge, and toggle switch.
  Used for all visibility controls in the settings panel.
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

<div class="toggle-row" class:disabled>
  <span class="toggle-label">
    {label}
    {#if badgeText}
      <span class="disabled-badge">{badgeText}</span>
    {/if}
  </span>
  <label class="visibility-row-toggle">
    <input
      type="checkbox"
      {checked}
      {disabled}
      onchange={onChange}
      aria-label={ariaLabel || `Toggle ${label} visibility`}
    />
    <span class="toggle-slider"></span>
  </label>
</div>

<style>
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(8px, 2cqi, 16px);
    min-height: 52px;
    padding: clamp(10px, 2.5cqi, 16px) 0;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    transition: opacity 0.2s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  .toggle-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .toggle-row:first-child {
    padding-top: 0;
  }

  .toggle-row.disabled {
    opacity: 0.5;
  }

  .toggle-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: clamp(13px, 2.5cqi, 17px);
    font-weight: 400;
    letter-spacing: -0.08px;
    line-height: 1.38;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    flex: 1;
    min-width: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .disabled-badge {
    font-size: clamp(11px, 2cqi, 13px); /* iOS caption */
    font-weight: 400;
    letter-spacing: -0.06px; /* iOS caption tracking */
    line-height: 1.3; /* iOS caption ratio */
    color: rgba(255, 193, 7, 0.9);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Toggle Switch - iOS Exact Dimensions */
  .visibility-row-toggle {
    flex-shrink: 0;
    position: relative;
    display: inline-block;
    width: 72px; /* Ensure 50px minimum height while keeping proportionally wider track */
    height: 52px;
    cursor: pointer;
  }

  .visibility-row-toggle input {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    margin: 0;
    z-index: 2;
    top: 0;
    left: 0;
  }

  /* iOS Toggle Track */
  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(120, 120, 128, 0.32); /* iOS toggle off - exact */
    border-radius: 999px; /* Pill shape */
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.04); /* Subtle inset border */
  }

  /* iOS Toggle Knob */
  .toggle-slider:before {
    content: "";
    position: absolute;
    height: 40px;
    width: 40px;
    left: 4px; /* Maintain even inset within 50px height */
    top: 4px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    box-shadow:
      0 3px 8px rgba(0, 0, 0, 0.15),
      0 1px 2px rgba(0, 0, 0, 0.1); /* iOS exact shadow */
  }

  /* Toggle - Checked State (Theme Accent) */
  input:checked + .toggle-slider {
    background: var(--theme-accent, #34c759);
  }

  input:checked + .toggle-slider:before {
    left: calc(
      72px - 40px - 4px
    ); /* Track width minus thumb width minus inset */
  }

  input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .toggle-row,
    .toggle-slider,
    .toggle-slider:before {
      transition: none;
    }
  }

  /* High contrast */
  @media (prefers-contrast: high) {
    .toggle-slider {
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    input:checked + .toggle-slider {
      border-color: var(--theme-accent, #34c759);
    }
  }
</style>
