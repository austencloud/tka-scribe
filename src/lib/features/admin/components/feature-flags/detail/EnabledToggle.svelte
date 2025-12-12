<script lang="ts">
  interface Props {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    label?: string;
  }

  let { enabled, onToggle, label = "Enabled" }: Props = $props();
</script>

<div class="form-field">
  <span id="enabled-label" class="field-label">{label}</span>
  <button
    aria-labelledby="enabled-label"
    class="toggle-button"
    class:enabled
    onclick={() => onToggle(!enabled)}
    type="button"
    role="switch"
    aria-checked={enabled}
  >
    <span class="toggle-track">
      <span class="toggle-thumb"></span>
    </span>
    <span class="toggle-label">{enabled ? "Enabled" : "Disabled"}</span>
  </button>
</div>

<style>
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    font-size: var(--text-2026-caption);
    font-weight: 600;
    color: var(--theme-text-dim);
  }

  .toggle-button {
    display: flex;
    align-items: center;
    gap: var(--space-2026-sm);
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--theme-text-dim);
    min-height: 52px;
  }

  .toggle-track {
    position: relative;
    width: 52px;
    height: 28px;
    background: var(--surface-2026-active);
    border-radius: var(--radius-2026-md);
    transition: background var(--transition-fast);
  }

  .toggle-button.enabled .toggle-track {
    background: var(--accent-2026-emerald-soft);
  }

  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    background: var(--theme-text-dim);
    border-radius: 50%;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-2026-sm);
  }

  .toggle-button.enabled .toggle-thumb {
    left: 27px;
    background: var(--accent-2026-emerald);
    box-shadow: 0 2px 8px
      color-mix(in srgb, var(--accent-2026-emerald) 40%, transparent);
  }

  .toggle-label {
    font-size: var(--text-2026-body);
    font-weight: 500;
    transition: color var(--transition-fast);
  }

  .toggle-button.enabled .toggle-label {
    color: var(--accent-2026-emerald);
  }
</style>
