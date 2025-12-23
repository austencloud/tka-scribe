<!--
  ShareHub.svelte

  Main Share Hub container with navigation routing.
  Shows format picker or selected format panel based on state.
-->
<script lang="ts">
  import { createShareHubState } from '../state/share-hub-state.svelte';
  import ShareFormatPicker from './ShareFormatPicker.svelte';
  import ShareHubHeader from './ShareHubHeader.svelte';
  import { getFormatMetadata } from '../utils/format-metadata';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import ImageFormatPanel from './formats/ImageFormatPanel.svelte';
  import AnimationFormatPanel from './formats/AnimationFormatPanel.svelte';
  import PerformanceVideoFormatPanel from './formats/PerformanceVideoFormatPanel.svelte';
  import CompositeFormatPanel from './formats/CompositeFormatPanel.svelte';

  let {
    sequence,
  }: {
    sequence: SequenceData;
  } = $props();

  const state = createShareHubState();

  // Get current format metadata for header title
  const currentFormatMeta = $derived(
    state.selectedFormat ? getFormatMetadata(state.selectedFormat) : null
  );

  // Debug logging
  $effect(() => {
    console.log('🔄 ShareHub render state:', {
      isPickerView: state.isPickerView,
      selectedFormat: state.selectedFormat,
      currentFormatMeta: currentFormatMeta?.label
    });
  });
</script>

<div class="share-hub">
  {#if state.isPickerView}
    <!-- Format Picker View -->
    <ShareFormatPicker onFormatSelect={(format) => state.selectFormat(format)} />
  {:else if state.selectedFormat}
    <!-- Format Panel View -->
    <div class="format-panel-container">
      <ShareHubHeader
        title={currentFormatMeta?.label ?? 'Share'}
        onBack={() => state.backToPicker()}
      />

      <div class="format-panel-content">
        {#if state.selectedFormat === 'image'}
          <ImageFormatPanel {sequence} />
        {:else if state.selectedFormat === 'animation'}
          <AnimationFormatPanel {sequence} />
        {:else if state.selectedFormat === 'video'}
          <PerformanceVideoFormatPanel {sequence} />
        {:else if state.selectedFormat === 'composite'}
          <CompositeFormatPanel {sequence} />
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .share-hub {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .format-panel-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .format-panel-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
