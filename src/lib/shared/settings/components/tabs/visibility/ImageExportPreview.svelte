<!--
  ImageExportPreview.svelte

  Shows a live preview of what the image export will look like
  with current visibility settings.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { BeatData } from "$lib/shared/foundation/domain/models/BeatData";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IImageCompositionService } from "$lib/shared/share/services/contracts/IImageCompositionService";

  interface Props {
    beatData: BeatData;
  }

  let { beatData }: Props = $props();

  let previewImageUrl = $state<string | null>(null);
  let isGenerating = $state(false);

  async function generatePreview() {
    isGenerating = true;
    try {
      const compositionService =
        resolve<IImageCompositionService>(TYPES.IImageCompositionService);

      // Generate canvas from beat data
      const canvas = await compositionService.composeSequenceImage(
        { beats: [beatData], word: "", startPosition: null },
        {
          beatSize: 300,
          beatScale: 1,
          addWord: false,
          addBeatNumbers: false,
          addUserInfo: false,
          addDifficultyLevel: false,
          includeStartPosition: false,
        }
      );

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error("Failed to convert canvas to blob"));
        }, "image/png");
      });

      // Create preview URL
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      previewImageUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.error("Failed to generate image preview:", error);
    } finally {
      isGenerating = false;
    }
  }

  onMount(() => {
    generatePreview();

    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  });

  // Regenerate when beatData changes
  $effect(() => {
    // Access beatData to trigger effect
    beatData;
    generatePreview();
  });
</script>

{#if isGenerating}
  <div class="preview-loading">
    <i class="fas fa-spinner fa-spin"></i>
    <span>Generating...</span>
  </div>
{:else if previewImageUrl}
  <img src={previewImageUrl} alt="Export preview" class="preview-image" />
{:else}
  <div class="preview-error">
    <i class="fas fa-exclamation-triangle"></i>
    <span>Preview unavailable</span>
  </div>
{/if}

<style>
  .preview-loading,
  .preview-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 100%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .preview-loading i,
  .preview-error i {
    font-size: 36px;
    color: #34d399;
    opacity: 0.6;
  }

  .preview-error i {
    color: var(--semantic-warning);
  }

  .preview-loading span,
  .preview-error span {
    font-size: 13px;
    font-weight: 500;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
</style>
