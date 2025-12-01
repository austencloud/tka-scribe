<script lang="ts">
  import type { FeatureFlagConfig, UserRole } from "$lib/shared/auth/domain";
  import { ROLE_DISPLAY } from "$lib/shared/auth/domain";
  import {
    AdminSearchBox,
    AdminFilterGroup,
    AdminListItem,
    AdminEmptyState,
    type FilterOption,
  } from "$lib/shared/admin";
  import { getFeatureIconAndColor, getRoleColor, getRoleIcon } from "./utils";

  interface HierarchicalFlags {
    modules: FeatureFlagConfig[];
    tabsByModule: Map<string, FeatureFlagConfig[]>;
    capabilities: FeatureFlagConfig[];
  }

  interface Props {
    hierarchicalFlags: HierarchicalFlags;
    selectedFlag: FeatureFlagConfig | null;
    expandedModules: Set<string>;
    isLoading: boolean;
    searchQuery: string;
    categoryFilter: "all" | "module" | "tab" | "capability";
    onSearchChange: (value: string) => void;
    onCategoryChange: (
      category: "all" | "module" | "tab" | "capability"
    ) => void;
    onSelectFlag: (flag: FeatureFlagConfig) => void;
    onToggleModule: (moduleId: string) => void;
  }

  let {
    hierarchicalFlags,
    selectedFlag,
    expandedModules,
    isLoading,
    searchQuery,
    categoryFilter,
    onSearchChange,
    onCategoryChange,
    onSelectFlag,
    onToggleModule,
  }: Props = $props();

  const categoryFilterOptions: FilterOption[] = [
    { id: "all", label: "All", icon: "fa-list" },
    { id: "module", label: "Modules", icon: "fa-cubes" },
    { id: "tab", label: "Tabs", icon: "fa-window-restore" },
    { id: "capability", label: "Capabilities", icon: "fa-magic" },
  ];

  function isModuleExpanded(moduleId: string): boolean {
    return expandedModules.has(moduleId);
  }
</script>

<div class="list-section">
  <div class="list-controls">
    <AdminSearchBox
      value={searchQuery}
      placeholder="Search feature flags..."
      oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
    />
    <AdminFilterGroup
      options={categoryFilterOptions}
      selected={categoryFilter}
      onChange={(id) => onCategoryChange(id as typeof categoryFilter)}
    />
  </div>

  <div class="flag-list">
    {#if isLoading}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading feature flags...</p>
      </div>
    {:else if hierarchicalFlags.modules.length === 0 && hierarchicalFlags.capabilities.length === 0}
      <AdminEmptyState
        icon="fa-flag"
        title="No feature flags found"
        message={searchQuery.trim()
          ? "Try adjusting your search or filters"
          : "No feature flags available"}
      />
    {:else}
      {#each hierarchicalFlags.modules as module}
        {@const moduleId = module.id.split(":")[1] ?? ""}
        {@const tabs = hierarchicalFlags.tabsByModule.get(moduleId) || []}
        {@const moduleStyle = getFeatureIconAndColor(module.id)}
        {@const expanded = isModuleExpanded(moduleId)}

        <div class="module-group">
          <div
            class="module-header"
            class:expanded
            class:selected={selectedFlag?.id === module.id}
          >
            <button
              class="expand-icon"
              onclick={(e) => {
                e.stopPropagation();
                onToggleModule(moduleId);
              }}
              aria-label={expanded
                ? `Collapse ${module.name} tabs`
                : `Expand ${module.name} tabs`}
              aria-expanded={expanded}
            >
              <i class="fas fa-chevron-{expanded ? 'down' : 'right'}"></i>
            </button>
            <button
              class="module-content"
              onclick={() => onSelectFlag(module)}
              aria-label={`Edit ${module.name} settings`}
            >
              <div class="flag-icon" style="color: {moduleStyle.color}">
                <i class="fas {moduleStyle.icon}"></i>
              </div>
              <div class="flag-info">
                <h4>{module.name}</h4>
              </div>
              <div class="flag-badges">
                <span
                  class="role-badge"
                  style="background: {getRoleColor(
                    module.minimumRole
                  )}20; color: {getRoleColor(module.minimumRole)}"
                >
                  <i class="fas {getRoleIcon(module.minimumRole)}"></i>
                  {module.minimumRole}
                </span>
                {#if !module.enabled}
                  <span class="disabled-badge">
                    <i class="fas fa-ban"></i>
                    Disabled
                  </span>
                {/if}
              </div>
            </button>
          </div>

          {#if expanded}
            <div class="tabs-list">
              {#each tabs as tab}
                {@const tabStyle = getFeatureIconAndColor(tab.id)}
                <AdminListItem
                  selected={selectedFlag?.id === tab.id}
                  onClick={() => onSelectFlag(tab)}
                  class="tab-item"
                >
                  {#snippet icon()}
                    <div class="flag-icon" style="color: {tabStyle.color}">
                      <i class="fas {tabStyle.icon}"></i>
                    </div>
                  {/snippet}

                  {#snippet children()}
                    <div class="flag-info">
                      <h4>{tab.name}</h4>
                    </div>
                  {/snippet}

                  {#snippet meta()}
                    <div class="flag-badges">
                      <span
                        class="role-badge"
                        style="background: {getRoleColor(
                          tab.minimumRole
                        )}20; color: {getRoleColor(tab.minimumRole)}"
                      >
                        <i class="fas {getRoleIcon(tab.minimumRole)}"></i>
                        {tab.minimumRole}
                      </span>
                      {#if !tab.enabled}
                        <span class="disabled-badge">
                          <i class="fas fa-ban"></i>
                          Disabled
                        </span>
                      {/if}
                    </div>
                  {/snippet}
                </AdminListItem>
              {/each}
            </div>
          {/if}
        </div>
      {/each}

      {#if hierarchicalFlags.capabilities.length > 0}
        <div class="capabilities-section">
          <div class="section-header">
            <i class="fas fa-magic"></i>
            <span>Capabilities</span>
          </div>
          <div class="capabilities-grid">
            {#each hierarchicalFlags.capabilities as capability}
              {@const capabilityStyle = getFeatureIconAndColor(capability.id)}
              <AdminListItem
                selected={selectedFlag?.id === capability.id}
                onClick={() => onSelectFlag(capability)}
              >
                {#snippet icon()}
                  <div class="flag-icon" style="color: {capabilityStyle.color}">
                    <i class="fas {capabilityStyle.icon}"></i>
                  </div>
                {/snippet}

                {#snippet children()}
                  <div class="flag-info">
                    <h4>{capability.name}</h4>
                  </div>
                {/snippet}

                {#snippet meta()}
                  <div class="flag-badges">
                    <span
                      class="role-badge"
                      style="background: {getRoleColor(
                        capability.minimumRole
                      )}20; color: {getRoleColor(capability.minimumRole)}"
                    >
                      <i class="fas {getRoleIcon(capability.minimumRole)}"></i>
                      {capability.minimumRole}
                    </span>
                    {#if !capability.enabled}
                      <span class="disabled-badge">
                        <i class="fas fa-ban"></i>
                        Disabled
                      </span>
                    {/if}
                  </div>
                {/snippet}
              </AdminListItem>
            {/each}
          </div>
        </div>
      {/if}
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
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 0;
    overflow: hidden;
  }

  /* Mobile-first: single column stacked list */
  .flag-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-content: start;
    padding: 12px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }

  /* Tablet: 2 column grid */
  @media (min-width: 600px) {
    .flag-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: min-content;
      gap: 12px;
      padding: 16px;
    }
  }

  /* Desktop: auto-fill grid */
  @media (min-width: 1024px) {
    .flag-list {
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    }
  }

  /* Wide desktop */
  @media (min-width: 1200px) {
    .flag-list {
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    }
  }

  .loading-state {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .loading-state i {
    font-size: 32px;
  }

  .flag-list > :global(.admin-empty-state) {
    grid-column: 1 / -1;
  }

  .flag-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    font-size: 16px;
    flex-shrink: 0;
  }

  .module-content .flag-icon {
    width: 48px;
    height: 48px;
    font-size: 18px;
    background: rgba(255, 255, 255, 0.08);
  }

  @media (min-width: 600px) {
    .flag-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .module-content .flag-icon {
      width: 48px;
      height: 48px;
      font-size: 20px;
    }
  }

  .flag-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .flag-info h4 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .module-content .flag-info h4 {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  @media (min-width: 600px) {
    .flag-info h4 {
      font-size: 14px;
    }

    .module-content .flag-info h4 {
      font-size: 15px;
    }
  }

  .flag-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .role-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    text-transform: capitalize;
  }

  @media (min-width: 600px) {
    .role-badge {
      padding: 4px 8px;
      font-size: 11px;
    }
  }

  .disabled-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    border-radius: 4px;
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    font-size: 10px;
    font-weight: 500;
  }

  @media (min-width: 600px) {
    .disabled-badge {
      padding: 4px 8px;
      font-size: 11px;
    }
  }

  .module-group {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    overflow: visible;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
    contain: layout style;
  }

  .module-group:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .module-header {
    display: flex;
    align-items: stretch;
    background: transparent;
    border-left: 3px solid transparent;
    transition: all 0.2s;
    min-height: max-content;
  }

  @media (hover: hover) {
    .module-header:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  }

  .module-header:active {
    background: rgba(255, 255, 255, 0.05);
  }

  .module-header.selected {
    background: rgba(59, 130, 246, 0.1);
    border-left-color: #3b82f6;
  }

  .module-group:has(.module-header.selected) {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
  }

  .module-header.expanded {
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    min-height: 48px; /* Touch target */
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  @media (hover: hover) {
    .expand-icon:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.7);
    }
  }

  .expand-icon:active {
    background: rgba(255, 255, 255, 0.08);
  }

  .expand-icon i {
    font-size: 12px;
    transition: transform 0.2s;
  }

  .module-content {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
    min-height: fit-content;
    padding: 10px 12px 10px 0;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
    transition: background 0.2s;
  }

  @media (min-width: 600px) {
    .module-content {
      gap: 12px;
      padding: 12px 16px 12px 0;
    }
  }

  @media (hover: hover) {
    .module-content:hover {
      background: rgba(255, 255, 255, 0.03);
    }
  }

  .tabs-list {
    background: rgba(0, 0, 0, 0.15);
    border-left: 2px solid rgba(255, 255, 255, 0.08);
    margin-left: 20px;
    margin-right: 8px;
    margin-bottom: 8px;
    border-radius: 0 0 8px 8px;
    padding: 4px 0;
  }

  .tabs-list :global(.tab-item) {
    border-left: 3px solid transparent;
    padding-left: 28px;
  }

  .tabs-list :global(.tab-item.selected) {
    border-left-color: #60a5fa;
    background: rgba(59, 130, 246, 0.08);
  }

  .capabilities-section {
    width: 100%;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 12px;
    margin-top: 8px;
    box-sizing: border-box;
  }

  @media (min-width: 600px) {
    .capabilities-section {
      grid-column: 1 / -1;
    }
  }

  .capabilities-section :global(.admin-list-item) {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  /* Mobile: single column list */
  .capabilities-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  /* Tablet: 2 column grid */
  @media (min-width: 500px) {
    .capabilities-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Desktop: auto-fill */
  @media (min-width: 900px) {
    .capabilities-grid {
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (min-width: 600px) {
    .section-header {
      font-size: 13px;
    }
  }

  .section-header i {
    font-size: 14px;
    color: #f59e0b;
  }
</style>
