<script lang="ts">
  import type { FeatureFlagConfig } from "$lib/shared/auth/domain/models/FeatureFlag";
  import {
    getFeatureIconAndColor,
    getRoleColor,
    getRoleIcon,
    getEffectiveRole,
  } from "../utils";
  import TabChip from "./TabChip.svelte";

  interface Props {
    module: FeatureFlagConfig;
    tabs: FeatureFlagConfig[];
    selectedFlagId: string | null;
    onSelectFlag: (flag: FeatureFlagConfig) => void;
  }

  let { module, tabs, selectedFlagId, onSelectFlag }: Props = $props();

  const style = $derived(getFeatureIconAndColor(module.id));

  function hasElevatedRole(tab: FeatureFlagConfig): boolean {
    const effectiveRole = getEffectiveRole(tab.minimumRole, module.minimumRole);
    return effectiveRole !== module.minimumRole;
  }
</script>

<div class="bento-card">
  <button
    class="module-header"
    class:selected={selectedFlagId === module.id}
    onclick={() => onSelectFlag(module)}
    aria-label={`Edit ${module.name} settings`}
  >
    <div
      class="module-icon"
      style="background: {style.color}15; color: {style.color}"
    >
      <i class="fas {style.icon}" aria-hidden="true"></i>
    </div>
    <div class="module-info">
      <h3>{module.name}</h3>
      <span class="module-description">{module.description}</span>
    </div>
    <div class="module-meta">
      <span
        class="role-badge"
        style="background: {getRoleColor(
          module.minimumRole
        )}20; color: {getRoleColor(module.minimumRole)}"
      >
        <i class="fas {getRoleIcon(module.minimumRole)}" aria-hidden="true"></i>
        {module.minimumRole}
      </span>
      {#if !module.enabled}
        <span class="disabled-badge">
          <i class="fas fa-ban" aria-hidden="true"></i>
        </span>
      {/if}
    </div>
  </button>

  {#if tabs.length > 0}
    <div class="tabs-grid">
      {#each tabs as tab}
        <TabChip
          {tab}
          selected={selectedFlagId === tab.id}
          elevated={hasElevatedRole(tab)}
          onSelect={() => onSelectFlag(tab)}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .bento-card {
    background: var(--surface-2026);
    border-radius: var(--radius-2026-lg);
    border: 1px solid var(--border-2026);
    overflow: hidden;
    transition: all var(--transition-normal);
  }

  .bento-card:hover {
    border-color: var(--border-2026-hover);
    box-shadow: var(--shadow-2026-lg);
  }

  .module-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2026-sm);
    width: 100%;
    padding: 16px;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
    transition: background var(--transition-fast);
    min-height: var(--min-touch-target);
  }

  .module-header:hover {
    background: var(--surface-2026-hover);
  }

  .module-header.selected {
    background: var(--accent-2026-indigo-soft);
    border-left: 3px solid var(--accent-2026-indigo);
  }

  .module-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-size: 18px;
    flex-shrink: 0;
  }

  .module-info {
    flex: 1;
    min-width: 0;
  }

  .module-info h3 {
    margin: 0 0 4px 0;
    font-size: var(--text-2026-body);
    font-weight: 600;
    color: var(--theme-text);
  }

  .module-description {
    font-size: var(--text-2026-micro);
    color: var(--theme-text-dim);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .module-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2026-xs);
    flex-shrink: 0;
  }

  .role-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: var(--radius-2026-xs);
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .role-badge i {
    font-size: 12px;
  }

  .disabled-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-2026-xs);
    background: color-mix(
      in srgb,
      var(--semantic-error, #ef4444) 15%,
      transparent
    );
    color: var(--semantic-error, #fca5a5);
    font-size: 12px;
  }

  .tabs-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 16px 16px 16px;
  }
</style>
