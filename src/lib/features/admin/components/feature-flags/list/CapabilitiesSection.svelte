<script lang="ts">
  import type { FeatureFlagConfig } from "$lib/shared/auth/domain/models/FeatureFlag";
  import CapabilityChip from "./CapabilityChip.svelte";

  interface Props {
    capabilities: FeatureFlagConfig[];
    selectedFlagId: string | null;
    onSelectFlag: (flag: FeatureFlagConfig) => void;
  }

  let { capabilities, selectedFlagId, onSelectFlag }: Props = $props();
</script>

{#if capabilities.length > 0}
  <div class="capabilities-card">
    <div class="section-header">
      <i class="fas fa-magic"></i>
      <span>Capabilities</span>
    </div>
    <div class="capabilities-grid">
      {#each capabilities as capability}
        <CapabilityChip
          {capability}
          selected={selectedFlagId === capability.id}
          onSelect={() => onSelectFlag(capability)}
        />
      {/each}
    </div>
  </div>
{/if}

<style>
  .capabilities-card {
    grid-column: 1 / -1;
    padding: var(--settings-space-md);
    background: var(--surface-2026);
    border-radius: var(--radius-2026-lg);
    border: 1px solid var(--border-2026);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--settings-space-sm);
    margin-bottom: var(--space-2026-sm);
    font-size: var(--text-2026-caption);
    font-weight: var(--settings-font-weight-semibold);
    color: var(--text-secondary-current);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-header i {
    font-size: 14px;
    color: var(--accent-2026-amber);
  }

  .capabilities-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--settings-space-sm);
  }
</style>
