<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import type { InfoSection, InfoTab } from "../domain";

  let {
    sections = [],
    activeTab,
    onSelect = () => {},
  }: {
    sections?: InfoSection[];
    activeTab: InfoTab;
    onSelect?: (tabId: InfoTab) => void;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleTabClick(tabId: InfoTab) {
    // Trigger haptic feedback for tab selection
    hapticService?.trigger("selection");
    onSelect(tabId);
  }
</script>

<div class="info-tabs" role="tablist">
  {#each sections as section}
    <button
      id={`tab-${section.id}`}
      class="info-tab"
      class:active={activeTab === section.id}
      type="button"
      role="tab"
      aria-selected={activeTab === section.id}
      aria-controls={`panel-${section.id}`}
      style="--tab-color: {section.color}; --tab-gradient: {section.gradient};"
      onclick={() => handleTabClick(section.id as InfoTab)}
    >
      <span class="tab-icon">{@html section.icon}</span>
      <span class="tab-label">{section.label}</span>
    </button>
  {/each}
</div>

<style>
  .info-tabs {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    gap: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
  }

  .info-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 14px 12px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.875rem;
    font-weight: 600;
    min-height: 72px;
  }

  .info-tab:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .info-tab.active {
    color: var(--tab-color);
    border-bottom-color: var(--tab-color);
    background: rgba(255, 255, 255, 0.08);
  }

  .info-tab:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: -2px;
  }

  .tab-icon {
    font-size: 24px;
    display: block;
    line-height: 1;
  }

  .tab-label {
    font-size: 11px;
    display: block;
    line-height: 1.2;
    text-align: center;
  }

  @media (max-width: 640px) {
    .info-tab {
      padding: 10px 8px;
      min-height: 64px;
      gap: 4px;
    }

    .tab-icon {
      font-size: 20px;
    }

    .tab-label {
      font-size: 10px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .info-tab:hover {
      transform: none;
    }
  }
</style>
