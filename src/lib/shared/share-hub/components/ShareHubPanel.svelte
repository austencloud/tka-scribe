<!--
  ShareHubPanel.svelte

  Main unified Share Hub panel combining Single Media and Composite modes.
  Top-level panel interface with mode toggle and conditional content rendering.

  Architecture:
  - Top: ModeToggle (Single Media | Composite)
  - Middle: Conditional view based on mode (SingleMediaView | CompositeView)
  - Overlay: SettingsPanel (slides in from right when gear clicked)

  Features:
  - Unified state management via createShareHubState()
  - Settings panel overlay with format-specific content
  - Responsive layout
  - Keyboard accessible
  - Theme-based styling

  Domain: Share Hub - Main Unified Panel
-->
<script lang="ts">
  import { createShareHubState } from '../state/share-hub-state.svelte';
  import ModeToggle from './shared/ModeToggle.svelte';
  import SingleMediaView from './single-media/SingleMediaView.svelte';
  import CompositeView from './composite/CompositeView.svelte';
  import SettingsPanel from './settings/SettingsPanel.svelte';
  import AnimationSettings from './settings/AnimationSettings.svelte';
  import StaticSettings from './settings/StaticSettings.svelte';
  import PerformanceSettings from './settings/PerformanceSettings.svelte';

  let {
    onExport,
  }: {
    onExport?: (mode: 'single' | 'composite', format?: string) => Promise<void>;
  } = $props();

  // Create unified state
  const state = createShareHubState();

  // Settings panel title based on context
  const settingsTitle = $derived(
    state.settingsContext
      ? `${state.settingsContext.format.charAt(0).toUpperCase() + state.settingsContext.format.slice(1)} Settings${
          state.settingsContext.pieceIndex ? ` (Piece ${state.settingsContext.pieceIndex})` : ''
        }`
      : 'Settings'
  );

  // Handle export
  async function handleExport() {
    const format = state.mode === 'single' ? state.selectedFormat : undefined;
    await onExport?.(state.mode, format);
  }

  // Handle mode change
  function handleModeChange(mode: 'single' | 'composite') {
    state.mode = mode;
    // Close settings panel when switching modes
    if (state.settingsPanelOpen) {
      state.settingsPanelOpen = false;
      state.settingsContext = null;
    }
  }
</script>

<div class="share-hub-panel">
  <!-- Mode Toggle (Top Control) -->
  <div class="mode-toggle-container">
    <ModeToggle mode={state.mode} onModeChange={handleModeChange} />
  </div>

  <!-- Conditional Content (Single Media or Composite) -->
  <div class="content-area">
    {#if state.mode === 'single'}
      <SingleMediaView onExport={handleExport} />
    {:else}
      <CompositeView onExport={handleExport} />
    {/if}
  </div>

  <!-- Settings Panel Overlay -->
  {#if state.settingsPanelOpen && state.settingsContext}
    <SettingsPanel
      isOpen={state.settingsPanelOpen}
      title={settingsTitle}
      onClose={() => {
        state.settingsPanelOpen = false;
        state.settingsContext = null;
      }}
    >
      {#if state.settingsContext.format === 'animation'}
        <AnimationSettings />
      {:else if state.settingsContext.format === 'static'}
        <StaticSettings />
      {:else if state.settingsContext.format === 'performance'}
        <PerformanceSettings />
      {/if}
    </SettingsPanel>
  {/if}
</div>

<style>
  .share-hub-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--theme-panel-bg, rgba(20, 20, 20, 0.98));
    position: relative;
    overflow: hidden;
  }

  .mode-toggle-container {
    flex-shrink: 0;
    padding: 20px 20px 0 20px;
    display: flex;
    justify-content: center;
  }

  .content-area {
    flex: 1;
    min-height: 0; /* Allow flex child to shrink */
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .mode-toggle-container {
      padding: 16px 16px 0 16px;
    }
  }
</style>
