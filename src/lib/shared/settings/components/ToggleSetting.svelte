<!-- ToggleSetting.svelte - Improved contrast toggle component -->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  let {
    label,
    checked = false,
    helpText,
    disabled = false,
    compact = false,
    onchange,
  } = $props<{
    label: string;
    checked: boolean;
    helpText?: string;
    disabled?: boolean;
    compact?: boolean;
    onchange?: (checked: boolean) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleToggle() {
    if (disabled) return;

    // Trigger selection haptic feedback for toggle switches
    hapticService?.trigger("selection");

    const newValue = !checked;
    console.log("🔧 ToggleSetting handleToggle called, newValue:", newValue);
    console.log(
      "🔧 ToggleSetting onchange function available:",
      typeof onchange,
      onchange
    );
    onchange?.(newValue);
    console.log("🔧 ToggleSetting onchange called with:", newValue);
  }
</script>

<div class="setting-card" class:compact>
  <label class="toggle-setting" class:disabled>
    <input type="checkbox" {checked} {disabled} onclick={handleToggle} />
    <span class="toggle-slider"></span>
    {#if !compact}
      <span class="setting-label">{label}</span>
    {/if}
  </label>
  {#if helpText && !compact}
    <div class="help-tooltip">{helpText}</div>
  {/if}
</div>

<style>
  .setting-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: clamp(12px, 1.5vw, 24px);
    container-type: inline-size;
  }

  .setting-card.compact {
    background: transparent;
    border: none;
    padding: 0;
    border-radius: 0;
  }

  .toggle-setting {
    display: flex;
    align-items: center;
    gap: clamp(8px, 1vw, 16px);
    cursor: pointer;
    margin: 0;
  }

  .toggle-setting.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .toggle-setting input[type="checkbox"] {
    display: none;
  }

  .toggle-slider {
    position: relative;
    width: 48px;
    height: 24px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    transition: background-color var(--transition-fast);
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Compact mode - smaller toggle on mobile */
  @media (max-width: 480px) {
    .setting-card.compact .toggle-slider {
      width: 44px;
      height: 24px;
    }

    .setting-card.compact .toggle-slider::before {
      width: 20px;
      height: 20px;
    }

    .setting-card.compact
      .toggle-setting
      input:checked
      + .toggle-slider::before {
      transform: translateX(20px);
    }
  }

  .toggle-slider::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background: #ffffff;
    border-radius: 50%;
    transition: transform var(--transition-fast);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-setting input:checked + .toggle-slider {
    background: #6366f1;
    border-color: #6366f1;
  }

  .toggle-setting input:checked + .toggle-slider::before {
    transform: translateX(24px);
  }

  .setting-label {
    font-weight: 500;
    color: #ffffff;
    font-size: clamp(12px, 1.2vw, 16px);
  }

  .help-tooltip {
    font-size: clamp(10px, 1vw, 14px);
    color: rgba(255, 255, 255, 0.6);
    margin-top: clamp(6px, 0.8vw, 12px);
    line-height: 1.3;
    margin-left: clamp(46px, 6vw, 58px);
  }
</style>
