<!--
  SingleMediaView.svelte

  Container for Single Media mode in Share Hub.
  Displays format selector, active preview, and export button.

  Features:
  - Format selector (Animation | Static | Performance)
  - Conditional preview rendering based on selected format
  - Primary export button at bottom
  - Clean vertical layout

  Domain: Share Hub - Single Media Mode Container
-->
<script lang="ts">
  import type { MediaFormat } from '../../domain/models/MediaFormat';
  import { getShareHubState } from '../../state/share-hub-state.svelte';
  import FormatSelector from '../shared/FormatSelector.svelte';
  import ExportButton from '../shared/ExportButton.svelte';
  import AnimationPreview from './AnimationPreview.svelte';
  import StaticPreview from './StaticPreview.svelte';
  import PerformancePreview from './PerformancePreview.svelte';

  let {
    isSequenceSaved = true,
    onExport,
  }: {
    /** Whether the sequence has been saved to the library */
    isSequenceSaved?: boolean;
    onExport?: () => void;
  } = $props();

  // FIX: Use 'hubState' instead of 'state' to avoid collision with $state rune
  const hubState = getShareHubState();
  let exporting = $state(false);

  // Dynamic button label based on save state and format
  const formatLabel = $derived(
    hubState.selectedFormat === 'animation' ? 'Animation' :
    hubState.selectedFormat === 'static' ? 'Image' : 'Video'
  );
  const buttonLabel = $derived(
    isSequenceSaved ? `Export ${formatLabel}` : `Save & Export ${formatLabel}`
  );

  function handleFormatSelect(format: MediaFormat) {
    hubState.selectedFormat = format;
  }

  async function handleExport() {
    if (exporting) return;
    exporting = true;
    try {
      await onExport?.();
    } finally {
      exporting = false;
    }
  }
</script>

<div class="single-media-view">
  <!-- Format Selector -->
  <div class="format-selector-container">
    <FormatSelector
      selectedFormat={hubState.selectedFormat}
      onFormatSelect={handleFormatSelect}
    />
  </div>

  <!-- Preview Area (conditional based on selected format) -->
  <div class="preview-area">
    {#if hubState.selectedFormat === 'animation'}
      <AnimationPreview />
    {:else if hubState.selectedFormat === 'static'}
      <StaticPreview />
    {:else if hubState.selectedFormat === 'performance'}
      <PerformancePreview />
    {/if}
  </div>

  <!-- Export Button -->
  <div class="export-container">
    <ExportButton
      label={buttonLabel}
      loading={exporting}
      onclick={handleExport}
    />
  </div>
</div>

<style>
  .single-media-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 20px;
    padding: 20px;
  }

  .format-selector-container {
    flex-shrink: 0;
  }

  .preview-area {
    flex: 1;
    min-height: 0; /* Allow flex child to shrink */
    display: flex;
    flex-direction: column;
  }

  .export-container {
    flex-shrink: 0;
    padding-top: 12px;
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .single-media-view {
      padding: 16px;
      gap: 16px;
    }
  }
</style>
