<!--
  ImageFormatPanel.svelte

  Wrapper around existing ImageSharePanel for the Share Hub.
  Provides static image export with composition options.
-->
<script lang="ts">
  import ImageSharePanel from '$lib/shared/share/components/ImageSharePanel.svelte';
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';

  let {
    sequence,
  }: {
    sequence: SequenceData;
  } = $props();
</script>

<div class="image-format-panel">
  <ImageSharePanel currentSequence={sequence} />
</div>

<style>
  .image-format-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
