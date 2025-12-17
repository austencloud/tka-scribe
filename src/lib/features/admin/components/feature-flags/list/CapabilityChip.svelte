<script lang="ts">
  import type { FeatureFlagConfig } from "$lib/shared/auth/domain/models/FeatureFlag";
  import { getFeatureIconAndColor, getRoleColor, getRoleIcon } from "../utils";

  interface Props {
    capability: FeatureFlagConfig;
    selected: boolean;
    onSelect: () => void;
  }

  let { capability, selected, onSelect }: Props = $props();

  const style = $derived(getFeatureIconAndColor(capability.id));
</script>

<button
  class="capability-chip"
  class:selected
  class:disabled={!capability.enabled}
  onclick={onSelect}
  aria-label={`Edit ${capability.name} settings`}
  title={capability.description}
>
  <i class="fas {style.icon}" style="color: {style.color}"></i>
  <span class="capability-name">{capability.name}</span>
  <span
    class="role-badge"
    style="background: {getRoleColor(
      capability.minimumRole
    )}20; color: {getRoleColor(capability.minimumRole)}"
  >
    <i class="fas {getRoleIcon(capability.minimumRole)}"></i>
  </span>
  {#if !capability.enabled}
    <i class="fas fa-ban disabled-icon"></i>
  {/if}
</button>

<style>
  .capability-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--radius-2026-sm) var(--radius-2026-md);
    background: var(--surface-2026);
    border: 1px solid var(--border-2026);
    border-radius: var(--radius-2026-sm);
    font-size: var(--text-2026-caption);
    color: var(--theme-text-dim);
    cursor: pointer;
    transition: all var(--transition-fast);
    min-height: var(--min-touch-target);
  }

  .capability-chip:hover {
    background: var(--surface-2026-hover);
    border-color: var(--border-2026-hover);
    transform: translateY(var(--hover-lift-sm));
  }

  .capability-chip.selected {
    background: var(--accent-2026-indigo-soft);
    border-color: color-mix(
      in srgb,
      var(--accent-2026-indigo) 35%,
      transparent
    );
    color: var(--accent-2026-indigo);
  }

  .capability-chip.disabled {
    opacity: 0.5;
  }

  .capability-chip i {
    font-size: 14px;
  }

  .capability-name {
    font-weight: 500;
  }

  .role-badge {
    display: flex;
    align-items: center;
    padding: 3px var(--space-2026-xs);
    border-radius: var(--radius-2026-xs);
    font-size: 10px;
  }

  .role-badge i {
    font-size: 10px;
  }

  .disabled-icon {
    color: var(--semantic-error, #f87171);
    font-size: 10px;
    margin-left: 2px;
  }
</style>
