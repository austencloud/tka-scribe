<!--
  ToggleSwitch.svelte

  A simple toggle switch component for boolean settings.
-->
<script lang="ts">
  interface Props {
    checked: boolean;
    onToggle: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
  }

  const { checked, onToggle, disabled = false, label = "Toggle" }: Props = $props();
</script>

<button
  type="button"
  class="toggle-switch"
  class:checked
  class:disabled
  {disabled}
  onclick={() => !disabled && onToggle(!checked)}
  role="switch"
  aria-checked={checked}
  aria-label={label}
>
  <span class="toggle-track">
    <span class="toggle-thumb"></span>
  </span>
</button>

<style>
  .toggle-switch {
    display: inline-flex;
    align-items: center;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
  }

  .toggle-switch.disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .toggle-track {
    position: relative;
    width: 44px;
    height: 24px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    transition: background 0.2s ease;
  }

  .toggle-switch.checked .toggle-track {
    background: #10b981;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-switch.checked .toggle-thumb {
    transform: translateX(20px);
  }

  .toggle-switch:focus-visible .toggle-track {
    outline: 2px solid #10b981;
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .toggle-track,
    .toggle-thumb {
      transition: none;
    }
  }
</style>
