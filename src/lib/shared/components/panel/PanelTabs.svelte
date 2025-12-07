<script lang="ts">
  /**
   * PanelTabs - Segmented control / tab component
   *
   * Provides consistent tab styling across panels.
   */

  interface Tab {
    /** Unique value for the tab */
    value: string;
    /** Display label */
    label: string;
    /** Optional FontAwesome icon class */
    icon?: string;
  }

  interface Props {
    /** Array of tab definitions */
    tabs: Tab[];
    /** Currently active tab value */
    activeTab: string;
    /** Change handler */
    onchange: (value: string) => void;
    /** Hide labels on mobile (show icons only) */
    compactOnMobile?: boolean;
  }

  let { tabs, activeTab, onchange, compactOnMobile = true }: Props = $props();
</script>

<div class="panel-tabs-container">
  <div class="panel-tabs" role="tablist" aria-label="Panel tabs">
    {#each tabs as tab (tab.value)}
      <button
        type="button"
        class="panel-tab"
        class:panel-tab--active={activeTab === tab.value}
        role="tab"
        aria-selected={activeTab === tab.value}
        onclick={() => onchange(tab.value)}
      >
        {#if tab.icon}
          <i class="fas {tab.icon}" aria-hidden="true"></i>
        {/if}
        <span
          class="panel-tab__label"
          class:panel-tab__label--compact={compactOnMobile}
        >
          {tab.label}
        </span>
      </button>
    {/each}
  </div>
</div>

<style>
  .panel-tabs-container {
    padding: 0 20px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .panel-tabs {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 3px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 100px;
    backdrop-filter: blur(12px);
    box-shadow:
      inset 0 0.5px 1px rgba(0, 0, 0, 0.15),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .panel-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 14px 18px;
    min-height: 52px;
    background: transparent;
    border: none;
    border-radius: 100px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .panel-tab:hover {
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.05);
  }

  .panel-tab--active {
    background: rgba(255, 255, 255, 0.22);
    color: rgba(255, 255, 255, 0.98);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .panel-tab i {
    font-size: 14px;
  }

  @media (max-width: 640px) {
    .panel-tabs-container {
      padding: 0 16px;
    }

    .panel-tab__label--compact {
      display: none;
    }

    .panel-tab {
      padding: 14px 16px;
      min-height: 52px;
    }

    .panel-tab i {
      font-size: 16px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .panel-tab {
      transition: none;
    }
  }
</style>
