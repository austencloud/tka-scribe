<script lang="ts">
  import type { FeatureFlagConfig } from "$lib/shared/auth/domain/models/FeatureFlag";
  import AdminSearchBox from "$lib/shared/admin/components/AdminSearchBox.svelte";
  import AdminEmptyState from "$lib/shared/admin/components/AdminEmptyState.svelte";
  import ModuleCard from "./list/ModuleCard.svelte";
  import CapabilitiesSection from "./list/CapabilitiesSection.svelte";

  interface HierarchicalFlags {
    modules: FeatureFlagConfig[];
    tabsByModule: Map<string, FeatureFlagConfig[]>;
    capabilities: FeatureFlagConfig[];
  }

  interface Props {
    hierarchicalFlags: HierarchicalFlags;
    selectedFlag: FeatureFlagConfig | null;
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onSelectFlag: (flag: FeatureFlagConfig) => void;
  }

  let {
    hierarchicalFlags,
    selectedFlag,
    isLoading,
    searchQuery,
    onSearchChange,
    onSelectFlag,
  }: Props = $props();

  const isEmpty = $derived(
    hierarchicalFlags.modules.length === 0 &&
      hierarchicalFlags.capabilities.length === 0
  );
</script>

<div class="list-section">
  <div class="list-controls">
    <AdminSearchBox
      value={searchQuery}
      placeholder="Search feature flags..."
      oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
    />
  </div>

  <div class="bento-grid">
    {#if isLoading}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading feature flags...</p>
      </div>
    {:else if isEmpty}
      <AdminEmptyState
        icon="fa-flag"
        title="No feature flags found"
        message={searchQuery.trim()
          ? "Try adjusting your search"
          : "No feature flags available"}
      />
    {:else}
      {#each hierarchicalFlags.modules as module}
        {@const moduleId = module.id.split(":")[1] ?? ""}
        {@const tabs = hierarchicalFlags.tabsByModule.get(moduleId) || []}
        <ModuleCard
          {module}
          {tabs}
          selectedFlagId={selectedFlag?.id ?? null}
          {onSelectFlag}
        />
      {/each}

      <CapabilitiesSection
        capabilities={hierarchicalFlags.capabilities}
        selectedFlagId={selectedFlag?.id ?? null}
        {onSelectFlag}
      />
    {/if}
  </div>
</div>

<style>
  .list-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .list-controls {
    padding: var(--space-2026-sm);
    display: flex;
    flex-direction: column;
    gap: var(--radius-2026-sm);
    background: var(--surface-2026);
    border-bottom: 1px solid var(--border-2026);
  }

  .bento-grid {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-2026-sm);
    padding: var(--space-2026-sm);
    align-content: start;
  }

  @media (min-width: 700px) {
    .bento-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--settings-space-md);
      padding: var(--settings-space-md);
    }
  }

  @media (min-width: 1100px) {
    .bento-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (min-width: 1500px) {
    .bento-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .loading-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--settings-space-2xl) var(--settings-space-lg);
    gap: var(--space-2026-sm);
    color: var(--theme-text-dim);
  }

  .loading-state i {
    font-size: var(--text-2026-headline);
  }

  .bento-grid > :global(.admin-empty-state) {
    grid-column: 1 / -1;
  }
</style>
