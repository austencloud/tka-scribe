<!--
  PreviewSection.svelte - Interactive Pictograph Preview

  Displays an interactive pictograph that reflects current visibility settings.
  Users can click elements in the preview to toggle their visibility.
-->
<script lang="ts">
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";

  interface Props {
    pictographData: PictographData;
  }

  let { pictographData }: Props = $props();

  // Container element to measure for responsive sizing
  let containerElement: HTMLDivElement | null = $state(null);
  let responsiveSize = $state(300);

  $effect(() => {
    if (!containerElement) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Use 95% of the smaller dimension to maximize space usage
        const targetSize = Math.min(width, height) * 0.95;
        // Set minimum of 150px, maximum of 800px for very large screens
        responsiveSize = Math.max(150, Math.min(800, targetSize));
      }
    });

    observer.observe(containerElement);

    return () => observer.disconnect();
  });
</script>

<div class="preview-section">
  <h4 class="preview-title">Interactive Preview</h4>
  <p class="preview-note">
    Click elements in the preview to toggle their visibility
  </p>

  <div class="preview-container" bind:this={containerElement}>
    <div
      class="pictograph-wrapper"
      style="width: {responsiveSize}px; height: {responsiveSize}px;"
    >
      <Pictograph {pictographData} />
    </div>
  </div>
</div>

<style>
  .preview-section {
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 2cqi, 16px); /* Reduced gap to maximize preview space */
    flex: 1; /* Fill available space in parent */
    min-height: 0; /* Allow proper flex shrinking */
  }

  .preview-title {
    font-size: clamp(15px, 3cqi, 18px); /* iOS body to title3 */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.41px; /* iOS body tracking */
    line-height: 1.29; /* iOS body ratio */
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    text-align: center;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .preview-note {
    font-size: clamp(12px, 2.5cqi, 15px); /* iOS caption to footnote */
    font-weight: 400;
    letter-spacing: -0.06px; /* iOS caption tracking */
    line-height: 1.3; /* iOS caption ratio */
    color: rgba(255, 255, 255, 0.6);
    font-style: italic;
    margin: 0;
    text-align: center;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* iOS Glass Morphism Preview Container */
  .preview-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border: 0.33px solid rgba(255, 255, 255, 0.12); /* iOS hairline border */
    border-radius: 12px; /* iOS medium corner radius */
    padding: clamp(
      6px,
      1cqi,
      10px
    ); /* Minimal padding to maximize pictograph space */
    min-height: 300px; /* Reduced minimum to allow more flexibility */
    container-type: size;
    box-shadow:
      inset 0 2px 8px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.08); /* iOS inset shadow for depth */
  }
</style>
