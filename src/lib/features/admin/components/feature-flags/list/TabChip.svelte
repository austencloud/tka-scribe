<script lang="ts">
  import type { FeatureFlagConfig } from "$lib/shared/auth/domain/models/FeatureFlag";
  import { getFeatureIconAndColor, getRoleIcon, getRoleColor } from "../utils";

  interface Props {
    tab: FeatureFlagConfig;
    selected: boolean;
    elevated: boolean;
    onSelect: () => void;
  }

  let { tab, selected, elevated, onSelect }: Props = $props();

  const style = $derived(getFeatureIconAndColor(tab.id));
</script>

<button
  class="tab-chip"
  class:selected
  class:disabled={!tab.enabled}
  class:elevated
  onclick={onSelect}
  aria-label={`Edit ${tab.name} settings`}
  title={tab.description}
>
  <i class="fas {style.icon}" style="color: {style.color}"></i>
  <span class="tab-name">{tab.name.replace(" Tab", "")}</span>
  {#if elevated}
    <span
      class="tab-role"
      style="color: {getRoleColor(tab.minimumRole)}"
      title="Elevated: requires {tab.minimumRole}"
    >
      <i class="fas {getRoleIcon(tab.minimumRole)}"></i>
    </span>
  {/if}
  {#if !tab.enabled}
    <i class="fas fa-ban disabled-icon"></i>
  {/if}
</button>

<style>
  .tab-chip {
    display: flex;
    align-items: center;
    gap: var(--space-2026-xs);
    padding: var(--settings-space-sm) var(--space-2026-sm);
    background: var(--surface-glass);
    border: 1px solid var(--settings-glass-border);
    border-radius: var(--settings-radius-sm);
    font-size: var(--text-2026-micro);
    color: var(--text-secondary-current);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: 48px;
  }

  .tab-chip:hover {
    background: var(--settings-glass-bg-hover);
    border-color: var(--settings-glass-border-hover);
    transform: translateY(var(--hover-lift-sm));
  }

  .tab-chip.selected {
    background: var(--accent-2026-indigo-soft);
    border-color: color-mix(in srgb, var(--accent-2026-indigo) 40%, transparent);
    color: var(--accent-2026-indigo);
  }

  .tab-chip.disabled {
    opacity: 0.5;
  }

  .tab-chip.elevated {
    border-color: color-mix(in srgb, var(--accent-2026-amber) 30%, transparent);
  }

  .tab-chip i {
    font-size: 11px;
  }

  .tab-name {
    font-weight: var(--settings-font-weight-medium);
  }

  .tab-role {
    font-size: 10px;
    margin-left: 2px;
  }

  .disabled-icon {
    color: #f87171;
    font-size: 10px;
    margin-left: 2px;
  }
</style>
