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
  import StaticSettingsPanel from './settings/StaticSettings.svelte';
  import PerformanceSettingsPanel from './settings/PerformanceSettings.svelte';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import { untrack } from 'svelte';

  import type { ExportSettings } from '../domain/models/ExportSettings';

  let {
    sequence,
    isSequenceSaved = true,
    isMobile = false,
    onExport,
  }: {
    sequence?: SequenceData | null;
    /** Whether the sequence has been saved to the library */
    isSequenceSaved?: boolean;
    /** Whether we're on a mobile device (affects button label) */
    isMobile?: boolean;
    onExport?: (mode: 'single' | 'composite', settings?: ExportSettings) => Promise<void>;
  } = $props();

  // FIX: Use 'hubState' instead of 'state' to avoid collision with $state rune
  const hubState = createShareHubState();

  // Sync sequence to state when it changes
  // COMPLETELY DISABLED to test if this is causing the loop
  // $effect(() => {
  //   if (sequence !== undefined) {
  //     const currentSequence = untrack(() => hubState.sequence);
  //     if (sequence !== currentSequence) {
  //       hubState.setSequence(sequence ?? null);
  //     }
  //   }
  // });

  // Alternative: Set sequence once on mount, don't sync reactively
  // ALSO DISABLED - testing if ANY sequence sync causes loop
  // $effect(() => {
  //   if (sequence !== undefined && hubState.sequence === null) {
  //     hubState.setSequence(sequence ?? null);
  //   }
  // });

  // Settings panel title based on context
  const settingsTitle = $derived(
    hubState.settingsContext
      ? `${hubState.settingsContext.format.charAt(0).toUpperCase() + hubState.settingsContext.format.slice(1)} Settings${
          hubState.settingsContext.pieceIndex ? ` (Piece ${hubState.settingsContext.pieceIndex})` : ''
        }`
      : 'Settings'
  );

  // Handle export - passes current settings to parent
  async function handleExport() {
    if (hubState.mode === 'single') {
      const format = hubState.selectedFormat;
      const exportSettings: ExportSettings = {
        format,
        staticSettings: format === 'static' ? { ...hubState.staticSettings } : undefined,
        animationSettings: format === 'animation' ? { ...hubState.animationSettings } : undefined,
        performanceSettings: format === 'performance' ? { ...hubState.performanceSettings } : undefined,
      };
      await onExport?.(hubState.mode, exportSettings);
    } else {
      // Composite mode - TODO: pass composite settings
      await onExport?.(hubState.mode, undefined);
    }
  }

  // Handle mode change
  function handleModeChange(mode: 'single' | 'composite') {
    hubState.mode = mode;
    // Close settings panel when switching modes
    if (hubState.settingsPanelOpen) {
      hubState.settingsPanelOpen = false;
      hubState.settingsContext = null;
    }
  }
</script>

<div class="share-hub-panel">
  <!-- Mode Toggle (Top Control) -->
  <div class="mode-toggle-container">
    <ModeToggle mode={hubState.mode} onModeChange={handleModeChange} />
  </div>

  <!-- Conditional Content (Single Media or Composite) -->
  <div class="content-area">
    {#if hubState.mode === 'single'}
      <SingleMediaView {isSequenceSaved} {isMobile} onExport={handleExport} />
    {:else}
      <CompositeView {isSequenceSaved} {isMobile} onExport={handleExport} />
    {/if}
  </div>

  <!-- Settings Panel Overlay -->
  {#if hubState.settingsPanelOpen && hubState.settingsContext}
    <SettingsPanel
      isOpen={hubState.settingsPanelOpen}
      title={settingsTitle}
      onClose={() => {
        hubState.settingsPanelOpen = false;
        hubState.settingsContext = null;
      }}
    >
      {#if hubState.settingsContext.format === 'animation'}
        <AnimationSettings />
      {:else if hubState.settingsContext.format === 'static'}
        <StaticSettingsPanel />
      {:else if hubState.settingsContext.format === 'performance'}
        <PerformanceSettingsPanel />
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
    background: var(--theme-panel-bg);
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
